import requests
import os

URL = "https://github.com/akshayrana30/plant-disease-detection/raw/master/PlantSaverApp/app/src/main/assets/labels.txt"
DEST = "backend/app/models/labels.txt"

print(f"Downloading {URL}...")
try:
    response = requests.get(URL)
    response.raise_for_status()
    with open(DEST, "wb") as f:
        f.write(response.content)
    print(f"Saved to {DEST}")
    
    # Print content for log
    print("--- Content ---")
    print(response.text[:500] + "...")
except Exception as e:
    print(f"Failed: {e}")
