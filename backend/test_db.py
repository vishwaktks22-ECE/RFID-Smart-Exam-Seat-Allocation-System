
from database import get_db_connection

try:
    connection = get_db_connection()
    print("MYSQL CONNECTED SUCCESSFULLY!")

    cursor = connection.cursor()
    cursor.execute(
        "SELECT name, roll_no, hall, seat FROM students"
    )

    students = cursor.fetchall()

    print("\nRegistered Students:")

    for student in students:
        print(student)

    cursor.close()
    connection.close()

except Exception as error:
    print("DATABASE CONNECTION FAILED:", error)
