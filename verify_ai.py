import sys
import os
import base64

# Add project root to path
sys.path.append(os.getcwd())

# Need to set up environment for imports to work if they depend on relative paths being in 'app'
# But ai_service imports using relative imports from .services... wait, ai_service is inside app.services
# We need to simulate running from backend dir or adjust imports.
# The easiest way is to import using the full module path assuming backend is in pythonpath.

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ai_service import ai_service

def test_inference(image_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    print("Running prediction...")
    result = ai_service.predict_disease(image_bytes)
    
    if result:
        print("Prediction Result:")
        print(f"  Disease: {result['name']}")
        print(f"  Confidence: {result['confidence']*100:.2f}%")
        print(f"  Recommendation: {result['recommendation']}")
    else:
        print("Prediction failed.")
        
    print("\nRunning Chlorophyll prediction...")
    result_ch = ai_service.predict_chlorophyll(image_bytes)
    
    if result_ch:
        print("Chlorophyll Result:")
        print(f"  Value: {result_ch['value']} {result_ch['unit']}")
        print(f"  Status: {result_ch['status']}")
        print(f"  Recommendation: {result_ch['recommendation']}")
    else:
        print("Chlorophyll Prediction failed.")

if __name__ == "__main__":
    # Use the sample image from artifacts
    input_img = r"C:\Users\Pascasarjana\.gemini\antigravity\brain\4cc8f669-ed9c-432b-b66b-0eaf455b4f68\uploaded_media_1770108805396.png"
    test_inference(input_img)
