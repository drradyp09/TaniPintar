import sys
import os
import io
import numpy as np
from PIL import Image

# Add backend to path to allow imports
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.services.ai_service import ai_service
    print("Successfully imported ai_service")
except ImportError as e:
    print(f"Failed to import ai_service: {e}")
    # Try to find where it failed
    print(f"CWD: {os.getcwd()}")
    print(f"Sys Path: {sys.path}")
    sys.exit(1)

def create_dummy_image():
    # solid green image
    img = Image.new('RGB', (224, 224), color = (0, 255, 0))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_disease():
    print("\nTesting Disease Prediction:")
    try:
        img_bytes = create_dummy_image()
        result = ai_service.predict_disease(img_bytes)
        print(f"Result: {result}")
        
        if result and 'TFLite' in result.get('model_info', ''):
            print("PASS: Model Info contains TFLite")
        else:
            print("FAIL: Model Info does not contain TFLite")
    except Exception as e:
        print(f"Error during prediction: {e}")

if __name__ == "__main__":
    test_disease()
