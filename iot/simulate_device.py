import requests
import json
import random
import time

# Configuration
BASE_URL = "http://103.196.152.3:8080"
USERNAME = "Purbakawaca"  # Using the username you provided
PASSWORD = "uhuYYY28"

def main():
    session = requests.Session()

    # 1. Login
    print(f"[1] Logging in as {USERNAME}...")
    login_payload = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        response = session.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        
        if response.status_code != 200:
            print(f"Login failed! Status: {response.status_code}")
            print(response.text)
            # Try registering if login fails? No, assuming account exists.
            return
            
        print("Login successful!")
        
    except Exception as e:
        print(f"Connection error: {e}")
        return

    # 2. Register Device
    device_id = f"esp32_sim_{int(time.time())}"
    print(f"\n[2] Registering Device (ID: {device_id})...")
    
    reg_payload = {
        "device_id": device_id,
        "name": "Python Simulator Device",
        "latitude": -6.2,
        "longitude": 106.8
    }
    
    response = session.post(f"{BASE_URL}/api/auth/sensors/register", json=reg_payload)
    
    if response.status_code != 201:
        print(f"Registration failed! Status: {response.status_code}")
        print(response.text)
        return
        
    data = response.json()
    token = data.get("token")
    print(f"Device registered! Token: {token}")

    # 3. Send Telemetry
    print(f"\n[3] Sending Telemetry using Token...")
    
    telemetry_payload = {
        "temperature": round(random.uniform(25.0, 32.0), 1),
        "humidity": round(random.uniform(60.0, 90.0), 1),
        "soil_ph": round(random.uniform(5.5, 7.5), 1),
        "soil_moisture": round(random.uniform(30.0, 80.0), 1),
        "light_intensity": random.randint(1000, 5000),
        "rainfall": 0.0,
        "wind_speed": round(random.uniform(0.0, 10.0), 1),
        "pressure": 1012.0
    }
    
    headers = {
        "X-Sensor-Token": token
    }
    
    # Note: Telemetry endpoint does NOT need session cookies, just the token
    response = requests.post(f"{BASE_URL}/api/auth/v1/telemetry", json=telemetry_payload, headers=headers)
    
    if response.status_code == 201:
        print("SUCCESS! Data sent to server.")
        print(response.json())
    else:
        print(f"Failed to send data. Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    main()
