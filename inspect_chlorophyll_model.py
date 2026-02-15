import tensorflow as tf
import numpy as np
import os

model_path = "backend/app/models/plant_chlorophyll_model.tflite"

if not os.path.exists(model_path):
    print(f"Model not found at {model_path}")
    exit()

try:
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("=== Chlorophyll Model Input Details ===")
    for i, detail in enumerate(input_details):
        print(f"Input {i}:")
        print(f"  Name: {detail['name']}")
        print(f"  Shape: {detail['shape']}")
        print(f"  Type: {detail['dtype']}")

    print("\n=== Chlorophyll Model Output Details ===")
    for i, detail in enumerate(output_details):
        print(f"Output {i}:")
        print(f"  Name: {detail['name']}")
        print(f"  Shape: {detail['shape']}")
        print(f"  Type: {detail['dtype']}")

except Exception as e:
    print(f"Error inspecting model: {e}")
