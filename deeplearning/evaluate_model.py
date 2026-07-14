"""
Evaluate the trained plant-disease model on the validation split and report
per-class precision/recall/F1 plus a confusion matrix.

Usage:
    python evaluate_model.py                 # evaluate the .h5 Keras model
    python evaluate_model.py --tflite        # evaluate the exported .tflite

Reproduces the exact validation split used in training (same seed/split), so
metrics reflect held-out data the model never trained on.
"""

import argparse
import os

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

IMG_SIZE = 224
BATCH_SIZE = 32
VAL_SPLIT = 0.2
SEED = 1337

DL_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(DL_DIR, "dataset")
MODELS_DIR = os.path.join(DL_DIR, "models")
H5_PATH = os.path.join(MODELS_DIR, "plant_disease_model.h5")
TFLITE_PATH = os.path.join(MODELS_DIR, "plant_disease_model.tflite")
LABELS_PATH = os.path.join(MODELS_DIR, "labels.txt")
CM_PATH = os.path.join(MODELS_DIR, "confusion_matrix.png")


def load_val_ds():
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=VAL_SPLIT,
        subset="validation",
        seed=SEED,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode="int",
    )
    class_names = val_ds.class_names
    return val_ds.prefetch(tf.data.AUTOTUNE), class_names


def predict_keras(val_ds):
    model = tf.keras.models.load_model(H5_PATH)
    y_true, y_pred = [], []
    for images, labels in val_ds:
        probs = model.predict(images, verbose=0)
        y_pred.extend(np.argmax(probs, axis=1))
        y_true.extend(labels.numpy())
    return np.array(y_true), np.array(y_pred)


def predict_tflite(val_ds):
    interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
    interpreter.allocate_tensors()
    in_d = interpreter.get_input_details()[0]
    out_d = interpreter.get_output_details()[0]

    y_true, y_pred = [], []
    for images, labels in val_ds:
        for img, label in zip(images.numpy(), labels.numpy()):
            x = np.expand_dims(img.astype(in_d["dtype"]), axis=0)
            interpreter.set_tensor(in_d["index"], x)
            interpreter.invoke()
            probs = interpreter.get_tensor(out_d["index"])[0]
            y_pred.append(int(np.argmax(probs)))
            y_true.append(int(label))
    return np.array(y_true), np.array(y_pred)


def save_confusion_matrix(cm, class_names):
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, ax = plt.subplots(figsize=(14, 12))
        im = ax.imshow(cm, cmap="Blues")
        ax.set_xticks(range(len(class_names)))
        ax.set_yticks(range(len(class_names)))
        ax.set_xticklabels(class_names, rotation=90, fontsize=7)
        ax.set_yticklabels(class_names, fontsize=7)
        ax.set_xlabel("Predicted")
        ax.set_ylabel("True")
        fig.colorbar(im)
        fig.tight_layout()
        fig.savefig(CM_PATH, dpi=120)
        print(f"Saved confusion matrix -> {CM_PATH}")
    except ImportError:
        print("matplotlib not installed; skipping confusion-matrix image.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tflite", action="store_true", help="evaluate .tflite")
    args = parser.parse_args()

    val_ds, class_names = load_val_ds()

    if args.tflite:
        print(f"Evaluating TFLite model: {TFLITE_PATH}")
        y_true, y_pred = predict_tflite(val_ds)
    else:
        print(f"Evaluating Keras model: {H5_PATH}")
        y_true, y_pred = predict_keras(val_ds)

    print("\n=== Classification report ===")
    print(classification_report(y_true, y_pred, target_names=class_names, digits=4))

    cm = confusion_matrix(y_true, y_pred)
    save_confusion_matrix(cm, class_names)


if __name__ == "__main__":
    main()
