import sys
import os
import cv2
import base64
import numpy as np

# Add the project directory to path to import the service
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.services.processing_service import segment_leaf

def test_segmentation(image_path, output_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    masked_base64, leaf_percentage, is_leaf = segment_leaf(image_bytes)
    
    print(f"Leaf detected: {is_leaf}")
    print(f"Leaf area percentage: {leaf_percentage}%")

    if masked_base64:
        # Decode and save for visual verification
        masked_data = base64.b64decode(masked_base64)
        with open(output_path, "wb") as f:
            f.write(masked_data)
        print(f"Masked image saved to: {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Pascasarjana\.gemini\antigravity\brain\4cc8f669-ed9c-432b-b66b-0eaf455b4f68\uploaded_media_1770108137399.png"
    output_img = r"C:\Users\Pascasarjana\.gemini\antigravity\brain\4cc8f669-ed9c-432b-b66b-0eaf455b4f68\segmented_leaf_test.jpg"
    test_segmentation(input_img, output_img)
