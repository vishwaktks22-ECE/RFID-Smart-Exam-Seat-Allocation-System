
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection

app = Flask(__name__)

# Allow dashboard frontend to communicate with Flask
CORS(app)


# ==========================================
# 1. HOME API
# ==========================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "RFID Exam System Flask Backend is running"
    }), 200


# ==========================================
# 2. GET ALL REGISTERED STUDENTS
# ==========================================

@app.route("/students", methods=["GET"])
def get_students():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT uid, name, roll_no, hall, seat
            FROM students
            ORDER BY hall, seat
        """)

        students = cursor.fetchall()

        return jsonify(students), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# 3. GET ATTENDANCE RECORDS
# ==========================================

@app.route("/attendance", methods=["GET"])
def get_attendance():

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                s.uid,
                s.name,
                s.roll_no,
                s.hall,
                s.seat,
                a.scanned_at
            FROM attendance a
            JOIN students s ON a.uid = s.uid
            ORDER BY a.scanned_at DESC
        """)

        records = cursor.fetchall()

        for record in records:
            record["scanned_at"] = str(record["scanned_at"])

        return jsonify(records), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# 4. RFID SCAN API
# ==========================================

@app.route("/scan", methods=["POST"])
def scan_rfid():

    data = request.get_json(silent=True) or {}
    uid = data.get("uid")

    if not isinstance(uid, str) or not uid.strip():
        return jsonify({
            "status": "error",
            "message": "RFID UID is required"
        }), 400

    uid = uid.strip().upper()

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Find registered student
        cursor.execute("""
            SELECT uid, name, roll_no, hall, seat
            FROM students
            WHERE uid = %s
        """, (uid,))

        student = cursor.fetchone()

        if student is None:
            return jsonify({
                "status": "not_found",
                "message": "Student not found",
                "uid": uid
            }), 404

        # Check existing attendance
        cursor.execute("""
            SELECT id, scanned_at
            FROM attendance
            WHERE uid = %s
            LIMIT 1
        """, (uid,))

        existing_attendance = cursor.fetchone()

        if existing_attendance:

            return jsonify({
                "status": "already_marked",
                "message": "Attendance already recorded",
                "student": student,
                "attendance_id": existing_attendance["id"],
                "scanned_at": str(
                    existing_attendance["scanned_at"]
                )
            }), 409

        # Insert new attendance
        cursor.execute("""
            INSERT INTO attendance (uid)
            VALUES (%s)
        """, (uid,))

        connection.commit()

        return jsonify({
            "status": "found",
            "message": "Attendance recorded successfully",
            "student": student,
            "attendance_id": cursor.lastrowid
        }), 200

    except Exception as error:

        if connection:
            connection.rollback()

        # Handle simultaneous duplicate requests
        if connection and error.__class__.__name__ == "IntegrityError":
            cursor.execute("""
                SELECT id, scanned_at
                FROM attendance
                WHERE uid = %s
                LIMIT 1
            """, (uid,))

            existing = cursor.fetchone()

            if existing:
                return jsonify({
                    "status": "already_marked",
                    "message": "Attendance already recorded",
                    "attendance_id": existing["id"],
                    "scanned_at": str(existing["scanned_at"])
                }), 409

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# 5. RUN FLASK SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
