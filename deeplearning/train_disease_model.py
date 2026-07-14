"""
Train a plant-disease classifier on `deeplearning/dataset/` using transfer
learning (MobileNetV2) and export TFLite + labels for the Flask backend.

Usage:
    python train_disease_model.py                # full training
    python train_disease_model.py --smoke        # 1-epoch sanity run
    python train_disease_model.py --epochs 25 --fine-tune-epochs 10
    python train_disease_model.py --no-deploy    # skip copying into backend

Artifacts land in deeplearning/models/:
    plant_disease_model.tflite   # quantized model consumed by the backend
    plant_disease_model.h5       # full Keras model (re-training / inspection)
    labels.txt                   # one class per line, in model-output order

Unless --no-deploy is passed, the .tflite + labels.txt are also copied into
backend/app/models/ so ai_service.AIService picks them up.
"""

import argparse
import os
import shutil

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers

# --- Configuration ---------------------------------------------------------
IMG_SIZE = 224
BATCH_SIZE = 32
VAL_SPLIT = 0.2
SEED = 1337
BASE_DROPOUT = 0.3

DL_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(DL_DIR)
DATASET_DIR = os.path.join(DL_DIR, "dataset")
MODELS_DIR = os.path.join(DL_DIR, "models")
BACKEND_MODELS_DIR = os.path.join(REPO_ROOT, "backend", "app", "models")

TFLITE_PATH = os.path.join(MODELS_DIR, "plant_disease_model.tflite")
H5_PATH = os.path.join(MODELS_DIR, "plant_disease_model.h5")
LABELS_PATH = os.path.join(MODELS_DIR, "labels.txt")


def build_datasets():
    """Load train/val datasets. Keras sorts class folder names alphabetically,
    so the returned `class_names` order matches the model's output indices."""
    common = dict(
        validation_split=VAL_SPLIT,
        seed=SEED,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode="int",
    )
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR, subset="training", **common
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR, subset="validation", **common
    )
    class_names = train_ds.class_names

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(autotune)
    val_ds = val_ds.cache().prefetch(autotune)
    return train_ds, val_ds, class_names


def compute_class_weights(class_names):
    """Inverse-frequency weights to counter the 122->5327 imbalance."""
    counts = []
    for name in class_names:
        folder = os.path.join(DATASET_DIR, name)
        n = sum(
            1
            for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        counts.append(max(n, 1))
    counts = np.array(counts, dtype=np.float64)
    weights = counts.sum() / (len(counts) * counts)
    return {i: float(w) for i, w in enumerate(weights)}


# Backbone registry. Each entry: (constructor, preprocess_input). preprocess is
# baked INTO the graph, so the backend always feeds raw [0, 255] float32 pixels
# regardless of which backbone is chosen.
BACKBONES = {
    "efficientnet": (
        tf.keras.applications.EfficientNetB0,
        tf.keras.applications.efficientnet.preprocess_input,
    ),
    "mobilenet": (
        tf.keras.applications.MobileNetV2,
        tf.keras.applications.mobilenet_v2.preprocess_input,
    ),
}


def build_model(num_classes, backbone):
    data_augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.15),
            layers.RandomContrast(0.1),
        ],
        name="augmentation",
    )

    constructor, preprocess_input = BACKBONES[backbone]
    base_model = constructor(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = data_augmentation(inputs)
    x = preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(BASE_DROPOUT)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base_model


def export_tflite(model):
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]  # dynamic-range quantization
    tflite_model = converter.convert()
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)
    print(f"Wrote {TFLITE_PATH} ({len(tflite_model) / 1e6:.1f} MB)")


def deploy_to_backend():
    os.makedirs(BACKEND_MODELS_DIR, exist_ok=True)
    for src in (TFLITE_PATH, LABELS_PATH):
        dst = os.path.join(BACKEND_MODELS_DIR, os.path.basename(src))
        shutil.copy2(src, dst)
        print(f"Deployed {os.path.basename(src)} -> {dst}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--fine-tune-epochs", type=int, default=8)
    parser.add_argument("--smoke", action="store_true", help="1-epoch sanity run")
    parser.add_argument(
        "--backbone",
        choices=list(BACKBONES),
        default="efficientnet",
        help="feature-extractor backbone (default: efficientnet)",
    )
    parser.add_argument(
        "--no-deploy", action="store_true", help="do not copy into backend"
    )
    args = parser.parse_args()

    os.makedirs(MODELS_DIR, exist_ok=True)

    train_ds, val_ds, class_names = build_datasets()
    num_classes = len(class_names)
    print(f"{num_classes} classes: {class_names}")

    # Persist labels in model-output order (critical: must match argmax index).
    with open(LABELS_PATH, "w") as f:
        f.write("\n".join(class_names))
    print(f"Wrote {LABELS_PATH}")

    class_weight = compute_class_weights(class_names)
    print(f"Backbone: {args.backbone}")
    model, base_model = build_model(num_classes, args.backbone)

    epochs = 1 if args.smoke else args.epochs
    ft_epochs = 0 if args.smoke else args.fine_tune_epochs

    # --- Phase 1: train the classification head (base frozen) ---
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=4, restore_best_weights=True
        ),
        tf.keras.callbacks.ModelCheckpoint(
            H5_PATH, monitor="val_accuracy", save_best_only=True
        ),
    ]
    print("\n=== Phase 1: head training (base frozen) ===")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        class_weight=class_weight,
        callbacks=callbacks,
    )

    # --- Phase 2: fine-tune the top of the base network ---
    if ft_epochs > 0:
        base_model.trainable = True
        for layer in base_model.layers[:-40]:  # keep early feature extractors frozen
            layer.trainable = False
        # EfficientNet gotcha: unfreezing BatchNorm layers wrecks fine-tuning by
        # corrupting the pretrained running statistics. Keep them frozen.
        for layer in base_model.layers:
            if isinstance(layer, layers.BatchNormalization):
                layer.trainable = False
        model.compile(
            optimizer=tf.keras.optimizers.Adam(1e-5),  # low LR for fine-tuning
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )
        print("\n=== Phase 2: fine-tuning top layers ===")
        model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=ft_epochs,
            class_weight=class_weight,
            callbacks=callbacks,
        )

    # Best weights are restored by EarlyStopping; save + export.
    model.save(H5_PATH)
    print(f"Wrote {H5_PATH}")
    export_tflite(model)

    loss, acc = model.evaluate(val_ds)
    print(f"\nFinal validation accuracy: {acc:.4f}")

    if not args.no_deploy:
        deploy_to_backend()


if __name__ == "__main__":
    main()
