
# RFID-Based Smart Exam Seat Allocation System

An RFID-based examination seat allocation and attendance management system developed using ESP32, RC522, Flask, MySQL, and a web dashboard.

The system identifies students through RFID cards, retrieves their assigned examination hall and seat, records attendance, and displays seat occupancy through a web-based dashboard.

## System Architecture

RFID Card → RC522 Reader → ESP32 → Wi-Fi → Flask Backend → MySQL Database → Web Dashboard

## Features Implemented

- RFID-based student identification
- Student-to-seat mapping using MySQL
- Attendance recording through Flask API
- Duplicate attendance prevention
- Unknown RFID card rejection
- LCD display of student details
- Web dashboard with seat occupancy visualization
- Student details popup for occupied seats
- Attendance statistics and records
- Backend communication through HTTP requests

## Hardware Components

- ESP32 development board
- RC522 RFID reader
- RFID cards
- 16×2 I2C LCD

## Software and Technologies

- Arduino IDE
- Python
- Flask
- MySQL
- HTML
- CSS
- JavaScript
- HTTP communication
- Visual Studio Code

## RC522–ESP32 Pin Connections

The RC522 RFID reader communicates with the ESP32 using the SPI interface.

- **SDA / SS:** GPIO 5
- **SCK:** GPIO 18
- **MOSI:** GPIO 23
- **MISO:** GPIO 19
- **RST:** GPIO 4
- **VCC:** 3.3V
- **GND:** GND

**Note:** The RC522 operates at 3.3V. Do not connect its VCC to 5V.

## Project Structure

```text
RFID-Exam-System/
├── backend/
│   ├── app.py
│   ├── database.py
│   └── requirements.txt
│
├── esp32/
│   └── rfid_exam_system.ino
│
├── dashboard/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── database/
│   └── schema.sql
│
├── README.md
└── .gitignore
```

## Testing

The system has been tested with registered, duplicate, and unregistered RFID cards.

### Registered RFID Card

- **Expected Result:** Student details are retrieved and attendance is recorded.
- **Actual Result:** Successful.
- **Response Time:** To be measured.

### Duplicate Card Scan

- **Expected Result:** Duplicate attendance is rejected.
- **Actual Result:** HTTP 409 returned.
- **Response Time:** To be measured.

### Unknown RFID Card

- **Expected Result:** The unregistered card is rejected.
- **Actual Result:** HTTP 404 returned with a "Student not found" message.
- **Response Time:** To be measured.

### Attendance Retrieval

- **Expected Result:** Attendance records are retrieved from the database.
- **Actual Result:** Successful.
- **Response Time:** To be measured.

### Occupied Seat Selection

- **Expected Result:** Student details are displayed when an occupied seat is selected.
- **Actual Result:** Successful.
- **Response Time:** To be measured.

### Wi-Fi Disconnection

- **Expected Result:** Scans are stored locally and synchronized after reconnection.
- **Actual Result:** Not implemented.
- **Response Time:** N/A.

### Invalid API Token

- **Expected Result:** Unauthorized requests are rejected by the backend.
- **Actual Result:** Not implemented.
- **Response Time:** N/A.

Response times have not yet been measured and should be added after performance testing.

## Future Enhancements

- Add a buzzer and green/red LEDs for immediate card acceptance and rejection feedback.
- Implement API-key authentication for ESP32 requests.
- Introduce offline scan buffering and synchronization during Wi-Fi outages.
- Develop a randomized seat allocation algorithm to reduce predictable seating patterns.
- Enable CSV and PDF attendance report export.
- Implement invigilator login and role-based access control.
- Improve RFID security using cryptographic card authentication to reduce UID-cloning risks.

## Security Considerations

The current implementation identifies RFID cards using their UIDs. UID-based identification alone is not secure against card cloning.

For improved security, future versions should consider cryptographic RFID authentication and secure communication between the ESP32 and backend.

## Learning Outcomes

This project provides practical experience in:

- Embedded systems development using ESP32
- RFID communication and student identification
- IoT device-to-server communication
- REST API development using Flask
- MySQL database integration
- Web dashboard development
- Attendance validation and duplicate prevention

## Author

Developed as an engineering project to explore embedded systems, IoT communication, backend development, database integration, and web dashboard development.
