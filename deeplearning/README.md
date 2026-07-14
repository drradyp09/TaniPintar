# deeplearning/

Self-contained training + evaluation pipeline for the TaniPintar plant-disease
classifier. Everything ML lives here: the image dataset, the training/eval code,
and the produced model artifacts. The Flask backend only consumes the exported
`.tflite` + `labels.txt`.

## Layout

```
deeplearning/
├── dataset/                    # 25 class folders (Daun_*), ~30.6k images
├── models/                     # produced artifacts (git-ignored except labels)
│   ├── plant_disease_model.tflite
│   ├── plant_disease_model.h5
│   ├── labels.txt              # class order = model output index order
│   └── confusion_matrix.png
├── train_disease_model.py      # transfer-learning training + TFLite export
├── evaluate_model.py           # per-class metrics + confusion matrix
├── requirements.txt
└── venv_train/                 # local Python 3.12 env (git-ignored)
```

## Setup

```bash
cd deeplearning
python3.12 -m venv venv_train
./venv_train/bin/pip install -r requirements.txt
```

## Train

```bash
# quick 1-epoch sanity check (no fine-tune, no deploy needed)
./venv_train/bin/python train_disease_model.py --smoke

# full run: phase-1 head training + phase-2 fine-tune, then export + deploy
./venv_train/bin/python train_disease_model.py

# tune the schedule
./venv_train/bin/python train_disease_model.py --epochs 25 --fine-tune-epochs 10
```

Training writes `plant_disease_model.{tflite,h5}` and `labels.txt` into
`models/`, and (unless `--no-deploy`) copies the `.tflite` + `labels.txt` into
`../backend/app/models/` so the backend serves the new model.

## Backbone

Default is **EfficientNetB0**; MobileNetV2 is also available:

```bash
./venv_train/bin/python train_disease_model.py --backbone efficientnet   # default
./venv_train/bin/python train_disease_model.py --backbone mobilenet
```

EfficientNetB0 (native 224x224) is a stronger feature extractor for similar
size. Its `preprocess_input` normalization is baked into the exported graph, so
the backend feeds raw [0,255] pixels either way — no backend change when
switching backbones. During fine-tuning, BatchNorm layers are kept frozen
(unfreezing them corrupts pretrained running stats and hurts EfficientNet).

## Approach

- **Model:** backbone (ImageNet weights) + global-average-pool + dropout + softmax.
- **Two-phase:** freeze base → train head (LR 1e-3); then unfreeze top 40 layers
  (BatchNorm stays frozen) → fine-tune (LR 1e-5).
- **Class imbalance:** inverse-frequency class weights (dataset ranges 122 → 5327
  images/class).
- **Augmentation:** flip, rotation, zoom, contrast — applied in-graph.
- **Export:** dynamic-range quantized TFLite for a small, fast backend model.

Class order is derived from the alphabetically-sorted folder names (what Keras
uses for label indices), and `labels.txt` is written in that exact order — so the
backend's `argmax` maps to the correct label.

## Evaluate

```bash
./venv_train/bin/python evaluate_model.py            # Keras .h5
./venv_train/bin/python evaluate_model.py --tflite   # exported .tflite (what ships)
```

Reproduces the same seeded validation split used in training and prints
precision/recall/F1 per class + saves a confusion matrix.
