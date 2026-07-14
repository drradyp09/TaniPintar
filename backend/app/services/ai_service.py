import os
import json
import numpy as np
import time

# Use LiteRT (TFLite) runtime
try:
    from ai_edge_litert.interpreter import Interpreter
    params = None
except ImportError:
    try:
        # Fallback to tflite_runtime if available
        from tflite_runtime.interpreter import Interpreter
        params = None
    except ImportError:
        try:
             # Fallback to full tensorflow if available
             import tensorflow as tf
             Interpreter = tf.lite.Interpreter
             params = None
        except ImportError:
             Interpreter = None
             print("WARNING: TFLite Runtime not found. AI features will be mocked.")

from PIL import Image
import io

class AIService:
    _instance = None
    _interpreter = None
    _chlorophyll_interpreter = None
    _input_details = None
    _output_details = None
    _chlorophyll_input_details = None
    _chlorophyll_output_details = None
    # Full disease knowledge base loaded from models/diseases.json, keyed by the
    # class label (e.g. "Daun_Tomat_Hawar_Tua"). Populated in _load_model().
    _disease_details = {}

    # Default classes for the locally-trained model (25 classes, Indonesian).
    # This is a fallback; the authoritative order is loaded from labels.txt,
    # which train_disease_model.py writes in the exact model-output order.
    _class_names = [
        "Daun_Anggur_Busuk", "Daun_Anggur_Esca", "Daun_Anggur_Hawar", "Daun_Anggur_Sehat",
        "Daun_Apel_Busuk", "Daun_Apel_Karat", "Daun_Apel_Kudis", "Daun_Apel_Sehat",
        "Daun_Jagung_Hawar", "Daun_Jagung_Jamur", "Daun_Jagung_Karat", "Daun_Jagung_Sehat",
        "Daun_Kentang_Hawar_Muda", "Daun_Kentang_Hawar_Tua", "Daun_Kentang_Sehat",
        "Daun_Tomat_Bakteri", "Daun_Tomat_Hawar_Muda", "Daun_Tomat_Hawar_Tua",
        "Daun_Tomat_Jamur_Fulva", "Daun_Tomat_Jamur_Septoria", "Daun_Tomat_Jamur_Target_spot",
        "Daun_Tomat_Sehat", "Daun_Tomat_Tungau_Labalaba",
        "Daun_Tomat_Virus_Begomovirus", "Daun_Tomat_Virus_Mosaicvirus",
    ]

    # Keyed by the class label (case-insensitive substring match). Order matters:
    # more specific keys must precede generic ones (e.g. "hawar_muda" before "hawar").
    _recommendations = {
        "sehat": "Tanaman terlihat sehat. Lanjutkan pemeliharaan rutin dan pemantauan berkala.",
        "anggur_busuk": "Busuk hitam anggur. Pangkas dan musnahkan bagian terinfeksi, aplikasikan fungisida berbahan mancozeb.",
        "anggur_esca": "Esca (Black Measles). Pangkas kayu terinfeksi, hindari luka pemangkasan saat lembab, jaga vigor tanaman.",
        "anggur_hawar": "Hawar daun anggur (Isariopsis). Perbaiki sirkulasi udara dan gunakan fungisida tembaga.",
        "apel_busuk": "Busuk buah/daun apel (Black rot). Buang mumi buah dan ranting mati, semprot fungisida captan/mancozeb.",
        "apel_karat": "Karat apel-cedar. Singkirkan inang juniper di sekitar, gunakan fungisida saat tunas muda.",
        "apel_kudis": "Kudis apel (scab). Kumpulkan daun gugur, aplikasikan fungisida berbasis sulfur/captan sejak awal musim.",
        "jagung_hawar": "Hawar daun jagung (Northern Leaf Blight). Gunakan varietas tahan, rotasi tanaman, fungisida bila parah.",
        "jagung_jamur": "Bercak daun jagung (Gray leaf spot). Rotasi tanaman, olah sisa tanaman, fungisida strobilurin.",
        "jagung_karat": "Karat jagung (Common rust). Gunakan varietas tahan; fungisida bila serangan dini dan berat.",
        "kentang_hawar_muda": "Hawar dini kentang (Early blight). Pangkas daun terinfeksi, fungisida preventif chlorothalonil.",
        "kentang_hawar_tua": "Hawar akhir kentang (Late blight). Penyakit serius; musnahkan tanaman sakit, fungisida sistemik segera.",
        "tomat_bakteri": "Bercak bakteri tomat. Gunakan bakterisida tembaga, hindari penyiraman dari atas daun, benih sehat.",
        "tomat_hawar_muda": "Hawar dini tomat (Early blight). Buang daun bawah terinfeksi, mulsa, fungisida preventif.",
        "tomat_hawar_tua": "Hawar akhir tomat (Late blight). Penyakit serius; musnahkan bagian terinfeksi, fungisida sistemik.",
        "tomat_jamur_fulva": "Kapang daun tomat (Leaf Mold). Turunkan kelembaban, tingkatkan ventilasi, fungisida bila perlu.",
        "tomat_jamur_septoria": "Bercak Septoria. Bersihkan gulma dan sisa tanaman, fungisida berbasis chlorothalonil.",
        "tomat_jamur_target_spot": "Target spot tomat. Jaga kebersihan lahan, rotasi, aplikasikan fungisida yang sesuai.",
        "tomat_tungau_labalaba": "Tungau laba-laba. Gunakan akarisida atau predator alami, semprot air untuk menurunkan populasi.",
        "tomat_virus_begomovirus": "Virus kuning keriting (Begomovirus). Kendalikan vektor kutu kebul, cabut tanaman terinfeksi.",
        "tomat_virus_mosaicvirus": "Virus mosaik. Tidak ada obat kimia; cabut dan musnahkan tanaman terinfeksi, sanitasi alat.",
    }

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        # Use absolute paths relative to this script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.abspath(os.path.join(current_dir, '..', 'models'))
        model_path = os.path.join(models_dir, 'plant_disease_model.tflite')
        chlorophyll_model_path = os.path.join(models_dir, 'plant_chlorophyll_model.tflite')
        labels_path = os.path.join(models_dir, 'labels.txt')
        diseases_path = os.path.join(models_dir, 'diseases.json')

        # Load disease knowledge base (gejala, penyebab, penanganan, dst.).
        # Loaded before the TFLite guard so details are available even in mock mode.
        try:
            if os.path.exists(diseases_path):
                with open(diseases_path, 'r', encoding='utf-8') as f:
                    self._disease_details = json.load(f)
                print(f"Loaded {len(self._disease_details)} disease detail entries from diseases.json")
            else:
                print(f"diseases.json not found at {diseases_path}")
        except Exception as e:
            print(f"Failed to load diseases.json: {e}")

        if Interpreter is None:
            return

        try:
            # Load Labels
            if os.path.exists(labels_path):
                with open(labels_path, 'r') as f:
                    self._class_names = [line.strip() for line in f.readlines()]
                print(f"Loaded {len(self._class_names)} classes from labels.txt")
            else:
                print(f"labels.txt not found, using default {len(self._class_names)} classes.")

            # Load Disease Model
            if os.path.exists(model_path):
                print(f"Loading Disease TFLite Model from {model_path}...")
                self._interpreter = Interpreter(model_path=model_path)
                self._interpreter.allocate_tensors()
                self._input_details = self._interpreter.get_input_details()
                self._output_details = self._interpreter.get_output_details()
                print("Disease TFLite Model loaded successfully.")
            else:
                print(f"Disease Model file not found at {model_path}")

            # Load Chlorophyll Model
            if os.path.exists(chlorophyll_model_path):
                print(f"Loading Chlorophyll TFLite Model from {chlorophyll_model_path}...")
                self._chlorophyll_interpreter = Interpreter(model_path=chlorophyll_model_path)
                self._chlorophyll_interpreter.allocate_tensors()
                self._chlorophyll_input_details = self._chlorophyll_interpreter.get_input_details()
                self._chlorophyll_output_details = self._chlorophyll_interpreter.get_output_details()
                print("Chlorophyll TFLite Model loaded successfully.")
            else:
                print(f"Chlorophyll Model file not found at {chlorophyll_model_path}")

        except Exception as e:
            print(f"Failed to load TFLite models: {e}")

    def predict_disease(self, image_bytes):
        if self._interpreter is None:
            return {
                'name': 'Mock Disease (No Model)',
                'confidence': 0.0,
                'recommendation': 'Model TFLite belum terinstal/ditemukan.',
                'model_info': 'Mock-Service'
            }

        try:
            # Get Input Shape
            input_shape = self._input_details[0]['shape']
            target_height = input_shape[1]
            target_width = input_shape[2]
            
            # Preprocess image
            img = Image.open(io.BytesIO(image_bytes))
            img = img.resize((target_width, target_height)) 
            img_array = np.array(img)
            
            # Handle RGBA
            if img_array.shape[-1] == 4:
                img_array = img_array[..., :3]
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            # Normalize.
            # Our trained model (train_disease_model.py) bakes
            # mobilenet_v2.preprocess_input INTO the graph, so it expects RAW
            # [0, 255] float32 pixels — do NOT divide by 255 here or the input
            # gets double-normalized. uint8 models take raw bytes.
            input_type = self._input_details[0]['dtype']
            if input_type == np.float32:
                 img_array = img_array.astype(np.float32)
            elif input_type == np.uint8:
                 img_array = img_array.astype(np.uint8)

            # Set Tensor
            self._interpreter.set_tensor(self._input_details[0]['index'], img_array)
            
            # Run Inference
            start_time = time.time()
            self._interpreter.invoke()
            inference_time = (time.time() - start_time) * 1000
            
            # Get Result
            output_data = self._interpreter.get_tensor(self._output_details[0]['index'])
            predictions = np.squeeze(output_data)
            
            # Dequantize if needed
            if input_type == np.uint8:
                scale, zero_point = self._output_details[0]['quantization']
                if scale > 0:
                    predictions = (predictions.astype(np.float32) - zero_point) * scale

            predicted_idx = np.argmax(predictions)
            
            if predicted_idx < len(self._class_names):
                class_name = self._class_names[predicted_idx]
            else:
                class_name = "Unknown"
            
            # Confidence
            # Softmax if not already applied (some models output logits)
            # Simple check: if sum is approx 1.0, it's softmax. If large numbers, logits.
            # But TFLite usually outputs probability if last layer is Softmax.
            confidence = float(predictions[predicted_idx])
            
            # Format Name for Recommendation Lookup
            # "apple apple scab" -> "Apple___Apple_scab" logic approximation
            # Actually, our recommendations map uses simple keys like "Apple_scab" or partial match.
            
            # Prettify label for display: "Daun_Kentang_Hawar_Muda" -> "Daun Kentang Hawar Muda"
            disease_name = class_name.replace("_", " ").title()

            # Recommendation lookup. Normalise both sides to lowercase underscore
            # form so keys like "kentang_hawar_muda" match "Daun_Kentang_Hawar_Muda".
            recommendation = "Konsultasikan dengan ahli pertanian setempat."
            clean_name = class_name.lower().replace(" ", "_")

            for key, rec in self._recommendations.items():
                if key in clean_name:
                    recommendation = rec
                    break

            # Support both Indonesian ("sehat") and English ("healthy") healthy labels.
            if "healthy" in clean_name or "sehat" in clean_name:
                recommendation = self._recommendations.get(
                    "sehat", self._recommendations.get("healthy", recommendation)
                )

            if class_name.lower() == "background":
                disease_name = "Bukan Daun / Background"
                recommendation = "Mohon foto daun tanaman secara closeup."
                confidence = float(predictions[predicted_idx])

            # Full disease knowledge base entry (gejala, penyebab, penanganan,
            # pencegahan, tingkat_bahaya, mendesak, dst.), keyed by exact label.
            details = self._disease_details.get(class_name)

            return {
                'name': disease_name,
                'confidence': round(confidence, 4),
                'recommendation': recommendation,
                'model_info': f'Valid-Model (Iter: {inference_time:.1f}ms)',
                'label': class_name,
                'details': details,
            }

        except Exception as e:
            print(f"Prediction Error: {e}")
            return None

    def predict_chlorophyll(self, image_bytes):
        try:
            img = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            img_array = np.array(img)
            
            # --- Brightness Calculation & Correction ---
            # Using standard luminance coefficients
            # Y = 0.299*R + 0.587*G + 0.114*B
            brightness = np.mean(0.299 * img_array[:,:,0] + 0.587 * img_array[:,:,1] + 0.114 * img_array[:,:,2])
            
            # Normal brightness range is typically considered around 100-180
            # Correction factor: If too dark, SPAD might be underestimated. If too bright, overestimated.
            # Simple linear compensation: factor = 1.0 + (target_brightness - current_brightness) * sensitivity
            target_brightness = 128.0
            brightness_factor = 1.0 + (target_brightness - brightness) * 0.001 
            # Clamp factor to avoid wild swings
            brightness_factor = min(max(brightness_factor, 0.8), 1.2)

            if self._chlorophyll_interpreter is not None:
                # --- Advanced Regression Model ---
                input_shape = self._chlorophyll_input_details[0]['shape']
                img_resized = img.resize((input_shape[2], input_shape[1]))
                input_data = np.expand_dims(np.array(img_resized).astype(np.float32) / 255.0, axis=0)
                
                self._chlorophyll_interpreter.set_tensor(self._chlorophyll_input_details[0]['index'], input_data)
                self._chlorophyll_interpreter.invoke()
                
                model_output = self._chlorophyll_interpreter.get_tensor(self._chlorophyll_output_details[0]['index'])
                raw_spad = float(np.squeeze(model_output))
                
                # Apply brightness correction
                spad_value = raw_spad * brightness_factor
                model_info = f'Regression-Model-V2 (L:{brightness:.1f})'
            else:
                # --- Fallback Heuristic ---
                r = np.mean(img_array[:,:,0])
                g = np.mean(img_array[:,:,1])
                b = np.mean(img_array[:,:,2])
                
                raw_spad = (g / (r + b + 1.0)) * 50.0 
                spad_value = raw_spad * brightness_factor
                model_info = f'Heuristic-Analysis-V1.1 (L:{brightness:.1f})'

            # Clamp SPAD value to realistic range (10-80)
            spad_value = min(max(spad_value, 10.0), 80.0)
            
            status = 'Normal'
            rec = 'Kadar klorofil normal.'
            if spad_value < 35:
                status = 'Rendah'
                rec = 'Kadar klorofil rendah. Direkomendasikan pemupukan Nitrogen (N).'
            elif spad_value > 60:
                status = 'Tinggi'
                rec = 'Kadar klorofil tinggi. Pertumbuhan sangat baik.'

            return {
                'name': 'Kadar Klorofil (SPAD)',
                'value': round(spad_value, 1),
                'unit': 'SPAD Units',
                'status': status,
                'recommendation': rec,
                'model_info': model_info,
                'brightness': round(brightness, 1)
            }
        except Exception as e:
            print(f"Chlorophyll Prediction Error: {e}")
            return {
                'name': 'Kadar Klorofil',
                'value': 0,
                'unit': 'SPAD',
                'status': 'Error',
                'recommendation': f'Gagal analisis: {str(e)}',
                'model_info': 'Error'
            }

# Singleton
ai_service = AIService()
