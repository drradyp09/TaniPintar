import sys
import os
import io
import numpy as np
from PIL import Image

# Add project root and backend to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ai_service import ai_service

def create_test_image(color=(100, 200, 100), brightness_offset=0):
    # Create a 224x224 image with a specific color
    r, g, b = color
    r = max(0, min(255, r + brightness_offset))
    g = max(0, min(255, g + brightness_offset))
    b = max(0, min(255, b + brightness_offset))
    
    img = Image.new('RGB', (224, 224), color=(r, g, b))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def verify():
    print("=== Chlorophyll Model & Brightness Correction Verification ===")
    
    # Test Cases: Normal, Dark, Bright
    tests = [
        ("Normal Green", (100, 200, 100), 0),
        ("Dark Green", (100, 200, 100), -50),
        ("Bright Green", (100, 200, 100), 50),
    ]
    
    for name, color, offset in tests:
        print(f"\nTesting: {name} (Offset: {offset})")
        image_bytes = create_test_image(color, offset)
        
        result = ai_service.predict_chlorophyll(image_bytes)
        
        if result:
            print(f"  Brightness: {result['brightness']}")
            print(f"  SPAD Value: {result['value']} {result['unit']}")
            print(f"  Status: {result['status']}")
            print(f"  Model Info: {result['model_info']}")
            print(f"  Recommendation: {result['recommendation']}")
        else:
            print("  Result: Failed")

if __name__ == "__main__":
    verify()
