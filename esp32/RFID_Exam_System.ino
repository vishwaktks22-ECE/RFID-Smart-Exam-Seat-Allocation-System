#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// Wi-Fi credentials
// Replace these placeholders with your local Wi-Fi details.
// Do not commit your real credentials to public GitHub.
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Flask API endpoint
// Change this to the IP address of your Flask server.
const char* serverURL = "http://YOUR_SERVER_IP:5000/scan";

// RC522 pins
#define SS_PIN 5
#define RST_PIN 4

MFRC522 rfid(SS_PIN, RST_PIN);

// Duplicate scan protection
String lastUID = "";
unsigned long lastScanTime = 0;
const unsigned long scanDelay = 3000;

void connectWiFi() {
  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

String readCardUID() {
  String uid = "";

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }

    uid += String(rfid.uid.uidByte[i], HEX);

    if (i < rfid.uid.size - 1) {
      uid += "_";
    }
  }

  uid.toUpperCase();
  return uid;
}

void sendUID(String uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send UID. WiFi unavailable.");
    return;
  }

  HTTPClient http;

  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  String requestBody = "{\"uid\":\"" + uid + "\"}";

  Serial.println("\nSending UID to Flask...");
  Serial.println(requestBody);

  int httpCode = http.POST(requestBody);

  Serial.print("HTTP Response: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String response = http.getString();

    Serial.println("Server Response:");
    Serial.println(response);

    if (httpCode == 200) {
      Serial.println("ATTENDANCE RECORDED SUCCESSFULLY!");
    } else if (httpCode == 404) {
      Serial.println("UNKNOWN RFID CARD!");
    } else if (httpCode == 409) {
      Serial.println("DUPLICATE ATTENDANCE!");
    } else {
      Serial.println("SERVER RETURNED AN ERROR.");
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();

  delay(100);

  Serial.println("\n===== RFID EXAM SYSTEM =====");

  Serial.print("RC522 Firmware: 0x");
  Serial.println(
    rfid.PCD_ReadRegister(MFRC522::VersionReg),
    HEX
  );

  connectWiFi();

  Serial.println("\nPlace your RFID card near the reader.");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  String uid = readCardUID();

  Serial.println("\n---------------------------");
  Serial.print("Card UID: ");
  Serial.println(uid);

  unsigned long currentTime = millis();

  if (uid == lastUID &&
      currentTime - lastScanTime < scanDelay) {
    Serial.println("Duplicate scan ignored.");
  } else {
    lastUID = uid;
    lastScanTime = currentTime;

    sendUID(uid);
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(500);
}
