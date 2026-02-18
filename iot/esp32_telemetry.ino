#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Make sure to install ArduinoJson library (v6 or v7)

// ==========================================
// CONFIGURATION
// ==========================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server URL (Replace with your server IP or domain)
// If testing locally with laptop as server, use your laptop's IP (e.g., http://192.168.1.5:80/api/auth/v1/telemetry)
// If using production server, use domain (e.g., http://103.196.152.3:8080/api/auth/v1/telemetry)
const char* SERVER_URL = "http://YOUR_SERVER_IP_OR_DOMAIN/api/auth/v1/telemetry";

// Sensor Token (Get this from the Web App -> Register Device)
const char* SENSOR_TOKEN = "YOUR_SENSOR_TOKEN_HERE";

// Data Sending Interval (in milliseconds)
const long INTERVAL = 10000; // 10 seconds

// ==========================================

unsigned long previousMillis = 0;

void setup() {
  Serial.begin(115200);
  
  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= INTERVAL) {
    previousMillis = currentMillis;
    
    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetry();
    } else {
      Serial.println("WiFi Disconnected");
      WiFi.reconnect();
    }
  }
}

void sendTelemetry() {
  HTTPClient http;

  // Initialize HTTP request
  http.begin(SERVER_URL);
  
  // Set Headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Sensor-Token", SENSOR_TOKEN);

  // Create JSON Payload
  // Using StaticJsonDocument for efficiency. Adjust size if needed.
  StaticJsonDocument<256> doc;
  
  // SIMULATED DATA (Replace with real sensor readings)
  // Example: doc["temperature"] = dht.readTemperature();
  doc["temperature"] = random(250, 320) / 10.0; // 25.0 - 32.0 C
  doc["humidity"] = random(600, 900) / 10.0;    // 60.0 - 90.0 %
  doc["soil_ph"] = random(55, 75) / 10.0;       // 5.5 - 7.5
  doc["soil_moisture"] = random(300, 800) / 10.0; // 30.0 - 80.0 %
  doc["light_intensity"] = random(1000, 5000);   // Lux
  doc["timestamp"] = ""; // Optional: let server set timestamp
  
  String requestBody;
  serializeJson(doc, requestBody);

  Serial.print("Sending payload: ");
  Serial.println(requestBody);

  // Send POST request
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println("Server reply: " + response);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  // Free resources
  http.end();
}
