import tensorflow as tf
import numpy as np

model_path = "backend/app/models/plant_disease_model.tflite"

try:
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("=== Input Details ===")
    for i, detail in enumerate(input_details):
        print(f"Input {i}:")
        print(f"  Name: {detail['name']}")
        print(f"  Shape: {detail['shape']}")
        print(f"  Type: {detail['dtype']}")
        print(f"  Quantization: {detail['quantization']}")
        print(f"  Index: {detail['index']}")

    print("\n=== Output Details ===")
    for i, detail in enumerate(output_details):
        print(f"Output {i}:")
        print(f"  Name: {detail['name']}")
        print(f"  Shape: {detail['shape']}")
        print(f"  Type: {detail['dtype']}")
        print(f"  Quantization: {detail['quantization']}")
        print(f"  Index: {detail['index']}")

except Exception as e:
    print(f"Error inspecting model: {e}")
