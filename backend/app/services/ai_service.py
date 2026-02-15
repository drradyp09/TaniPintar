import os
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
    
    # PlantVillage Classes (38 classes)
    # Note: The generic MobileNet model we downloaded has 1001 classes (ImageNet).
    # We will map the top result to a mock PlantVillage class if using the generic model,
    # OR we use the real class names if the user provides the real model.
    # For now, we list the real PlantVillage classes so the UI looks correct when the real model is present.
    _class_names = [
        "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
        "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
        "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
        "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
        "Orange___Haunglongbing_(Citrus_greening)",
        "Peach___Bacterial_spot", "Peach___healthy",
        "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
        "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
        "Raspberry___healthy",
        "Soybean___healthy",
        "Squash___Powdery_mildew",
        "Strawberry___Leaf_scorch", "Strawberry___healthy",
        "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold", 
        "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites_Two-spotted_spider_mite", "Tomato___Target_Spot",
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
    ]
    
    _recommendations = {
        "healthy": "Tanaman terlihat sehat. Lanjutkan pemeliharaan rutin.",
        "Bacterial_spot": "Gunakan bakterisida tembaga dan hindari penyiraman dari atas daun.",
        "Early_blight": "Potong daun yang terinfeksi dan aplikasikan fungisida preventif.",
        "Late_blight": "Penyakit serius. Segera musnahkan bagian terinfeksi dan gunakan fungisida sistemik.",
        "Leaf_Mold": "Kurangi kelembaban di sekitar tanaman dan sirkulasi udara yang baik.",
        "Septoria_leaf_spot": "Bersihkan gulma dan sisa tanaman, gunakan fungisida berbasis chlorothalonil.",
        "Spider_mites": "Gunakan akarisida atau predator alami. Semprotkan air untuk menjatuhkan tungau.",
        "Target_Spot": "Gunakan fungisida yang tepat dan jaga kebersihan lahan.",
        "Yellow_Leaf_Curl_Virus": "Kendalikan vektor kutu kebul (whitefly) dengan insektisida atau perangkap.",
        "Mosaic_virus": "Tidak ada obat kimia. Cabut tanaman terinfeksi agar tidak menular.",
        "Powdery_mildew": "Gunakan fungisida sulfur atau minyak hortikultura.",
        "Common_rust": "Gunakan varietas tahan karat atau fungisida.",
        "Northern_Leaf_Blight": "Gunakan varietas tahan, rotasi tanaman, dan fungisida jika perlu.",
    }

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if Interpreter is None:
            return

        # Use absolute paths relative to this script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.abspath(os.path.join(current_dir, '..', 'models'))
        model_path = os.path.join(models_dir, 'plant_disease_model.tflite')
        chlorophyll_model_path = os.path.join(models_dir, 'plant_chlorophyll_model.tflite')
        labels_path = os.path.join(models_dir, 'labels.txt')
        
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
            
            # Normalize
            input_type = self._input_details[0]['dtype']
            if input_type == np.float32:
                 # Try [0, 1] normalization which is common for some Android exports
                 img_array = img_array.astype(np.float32) / 255.0
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
            
            disease_name = class_name.title() # "Apple Apple Scab"
            
            # Recommendation Lookup (Fuzzy Match)
            recommendation = "Konsultasikan dengan ahli pertanian setempat."
            
            # Map standard PlantVillage key words to our recommendation keys
            # Our keys: Bacterial_spot, Early_blight, etc.
            # Labels: "peach bacterial spot", "potato early blight"
            
            found_rec = False
            for key, rec in self._recommendations.items():
                # Clean key: "Bacterial_spot" -> "bacterial spot"
                clean_key = key.replace("_", " ").lower()
                clean_name = class_name.lower()
                
                # Logic: Is the disease key in the class name?
                # e.g. "bacterial spot" in "peach bacterial spot"
                if clean_key in clean_name:
                    recommendation = rec
                    found_rec = True
                    break
            
            # Special case for "healthy"
            if "healthy" in class_name.lower():
                recommendation = self._recommendations["healthy"]
            
            if class_name.lower() == "background":
                disease_name = "Bukan Daun / Background"
                recommendation = "Mohon foto daun tanaman secara closeup."
                confidence = float(predictions[predicted_idx])

            return {
                'name': disease_name,
                'confidence': round(confidence, 4),
                'recommendation': recommendation,
                'model_info': f'Valid-Model (Iter: {inference_time:.1f}ms)'
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
