
const API_BASE = "http://127.0.0.1:5000";

let students = [];
let attendance = [];

const totalStudentsEl = document.getElementById("total-students");
const presentCountEl = document.getElementById("present-count");
const absentCountEl = document.getElementById("absent-count");
const attendanceRateEl = document.getElementById("attendance-rate");
const attendanceTable = document.getElementById("attendance-table");
const seatGrid = document.getElementById("seat-grid");
const hallSelect = document.getElementById("hall-select");
const connectionStatus = document.getElementById("connection-status");


// FETCH DATA FROM FLASK
async function fetchDashboardData() {
    try {
        const [studentsResponse, attendanceResponse] = await Promise.all([
            fetch(`${API_BASE}/students`),
            fetch(`${API_BASE}/attendance`)
        ]);

        if (!studentsResponse.ok || !attendanceResponse.ok) {
            throw new Error("API request failed");
        }

        students = await studentsResponse.json();
        attendance = await attendanceResponse.json();

        connectionStatus.textContent = "Backend Connected";
        connectionStatus.style.color = "#15803d";

        document.querySelector(".status-dot").style.background = "#16a34a";

        updateStatistics();
        renderSeatGrid();
        renderAttendanceTable();

    } catch (error) {
        connectionStatus.textContent = "Backend Disconnected";
        connectionStatus.style.color = "#dc2626";

        document.querySelector(".status-dot").style.background = "#dc2626";

        console.error("Dashboard error:", error);
    }
}


// UPDATE STATISTICS
function updateStatistics() {
    const total = students.length;
    const present = attendance.length;
    const absent = Math.max(0, total - present);

    const percentage = total > 0
        ? Math.round((present / total) * 100)
        : 0;

    totalStudentsEl.textContent = total;
    presentCountEl.textContent = present;
    absentCountEl.textContent = absent;
    attendanceRateEl.textContent = percentage + "%";
}


// GENERATE 30 SEATS
function renderSeatGrid() {
    const selectedHall = hallSelect.value;

    seatGrid.innerHTML = "";

    for (let seatNumber = 1; seatNumber <= 30; seatNumber++) {
        const student = students.find(
            item =>
                item.hall === selectedHall &&
                Number(item.seat) === seatNumber
        );

        const isOccupied = student && attendance.some(
            record => record.uid === student.uid
        );

        const seat = document.createElement("button");

        seat.className = isOccupied
            ? "seat occupied-seat"
            : "seat";

        seat.innerHTML = `
            <strong>${seatNumber}</strong>
            <span>${isOccupied ? "Occupied" : "Available"}</span>
        `;

        if (isOccupied) {
            seat.addEventListener("click", () => {
                showStudentDetails(student);
            });
        }

        seatGrid.appendChild(seat);
    }
}


// SHOW STUDENT DETAILS
function showStudentDetails(student) {
    const modal = document.getElementById("student-modal");
    const details = document.getElementById("student-details");

    const record = attendance.find(
        item => item.uid === student.uid
    );

    details.innerHTML = `
        <p><strong>Name:</strong> ${escapeHTML(student.name)}</p>
        <p><strong>Roll No:</strong> ${escapeHTML(student.roll_no)}</p>
        <p><strong>Hall:</strong> ${escapeHTML(student.hall)}</p>
        <p><strong>Seat:</strong> ${Number(student.seat)}</p>
        <p><strong>UID:</strong> ${escapeHTML(student.uid)}</p>
        <p><strong>Scanned At:</strong>
            ${record ? escapeHTML(record.scanned_at) : "Not recorded"}
        </p>
    `;

    modal.classList.remove("hidden");
}


// BASIC HTML ESCAPING
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// ATTENDANCE TABLE
function renderAttendanceTable() {
    attendanceTable.innerHTML = "";

    if (attendance.length === 0) {
        attendanceTable.innerHTML = `
            <tr>
                <td colspan="6">No attendance records yet.</td>
            </tr>
        `;
        return;
    }

    attendance.forEach(record => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(record.name)}</td>
            <td>${escapeHTML(record.roll_no)}</td>
            <td>${escapeHTML(record.hall)}</td>
            <td>${Number(record.seat)}</td>
            <td>${escapeHTML(record.scanned_at)}</td>
            <td><span class="status-badge">Present</span></td>
        `;

        attendanceTable.appendChild(row);
    });
}


// HALL SELECTION
hallSelect.addEventListener("change", renderSeatGrid);


// CLOSE STUDENT MODAL
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("student-modal").classList.add("hidden");
});

document.getElementById("student-modal").addEventListener("click", event => {
    if (event.target.id === "student-modal") {
        event.currentTarget.classList.add("hidden");
    }
});


// INITIAL LOAD
fetchDashboardData();


// AUTOMATIC REFRESH EVERY 5 SECONDS
setInterval(fetchDashboardData, 5000);
