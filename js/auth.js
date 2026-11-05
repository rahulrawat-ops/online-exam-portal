/* ===================================================
   Online Examination Portal - Authentication & Session Handler
   Pure Frontend (localStorage / sessionStorage)
   Supports Student & Admin/Controller Roles
   =================================================== */

// Default dummy student profile
const DEFAULT_STUDENT = {
  name: "Rahul Rawat",
  rollNo: "CS2024089",
  course: "B.Tech Computer Science & Engg",
  semester: "6th Semester",
  examCode: "CS401",
  examName: "Web Technologies & Systems"
};

// Default dummy admin profile
const DEFAULT_ADMIN = {
  name: "Dr. S. K. Verma",
  adminId: "ADMIN-EXAM-01",
  role: "Examination Controller",
  department: "Academic & Evaluation Division"
};

// Current active role tab on login page ('student' or 'admin')
let currentLoginRole = "student";

function switchLoginRole(role) {
  currentLoginRole = role;

  const tabStudent = document.getElementById("tabStudent");
  const tabAdmin = document.getElementById("tabAdmin");
  const studentForm = document.getElementById("studentLoginForm");
  const adminForm = document.getElementById("adminLoginForm");
  const errorBox = document.getElementById("loginError");

  if (errorBox) errorBox.style.display = "none";

  if (role === "admin") {
    if (tabStudent) tabStudent.classList.remove("active");
    if (tabAdmin) tabAdmin.classList.add("active");
    if (studentForm) studentForm.style.display = "none";
    if (adminForm) adminForm.style.display = "block";
  } else {
    if (tabAdmin) tabAdmin.classList.remove("active");
    if (tabStudent) tabStudent.classList.add("active");
    if (adminForm) adminForm.style.display = "none";
    if (studentForm) studentForm.style.display = "block";
  }
}

// Check Student Authentication
function checkAuth(redirectIfNot = true) {
  const user = sessionStorage.getItem("exam_student_user");
  if (!user && redirectIfNot) {
    window.location.href = "index.html";
    return null;
  }
  return user ? JSON.parse(user) : null;
}

// Check Admin Authentication
function checkAdminAuth(redirectIfNot = true) {
  const admin = sessionStorage.getItem("exam_admin_user");
  if (!admin && redirectIfNot) {
    window.location.href = "index.html";
    return null;
  }
  return admin ? JSON.parse(admin) : null;
}

// Handle Student Login
function handleLogin(event) {
  if (event) event.preventDefault();

  const rollInput = document.getElementById("studentId");
  const passInput = document.getElementById("password");
  const errorBox = document.getElementById("loginError");

  const rollVal = rollInput ? rollInput.value.trim() : "";
  const passVal = passInput ? passInput.value.trim() : "";

  if (!rollVal || !passVal) {
    if (errorBox) {
      errorBox.textContent = "Please enter both Roll Number and Password.";
      errorBox.style.display = "block";
    }
    return false;
  }

  const studentData = {
    ...DEFAULT_STUDENT,
    rollNo: rollVal.toUpperCase()
  };

  sessionStorage.setItem("exam_current_role", "student");
  sessionStorage.setItem("exam_student_user", JSON.stringify(studentData));

  // Redirect to Student Dashboard
  window.location.href = "dashboard.html";
  return false;
}

// Handle Admin Login
function handleAdminLogin(event) {
  if (event) event.preventDefault();

  const idInput = document.getElementById("adminId");
  const passInput = document.getElementById("adminPassword");
  const errorBox = document.getElementById("loginError");

  const idVal = idInput ? idInput.value.trim() : "";
  const passVal = passInput ? passInput.value.trim() : "";

  if (!idVal || !passVal) {
    if (errorBox) {
      errorBox.textContent = "Please enter both Admin Username and Password.";
      errorBox.style.display = "block";
    }
    return false;
  }

  // Pre-configured admin validation (allows 'admin'/'admin123' or any non-empty demo credentials)
  const adminData = {
    ...DEFAULT_ADMIN,
    adminId: idVal.toUpperCase()
  };

  sessionStorage.setItem("exam_current_role", "admin");
  sessionStorage.setItem("exam_admin_user", JSON.stringify(adminData));

  // Redirect to Admin Question Management Panel
  window.location.href = "admin.html";
  return false;
}

// Logout (Student)
function handleLogout() {
  if (confirm("Are you sure you want to log out of the student examination portal?")) {
    sessionStorage.removeItem("exam_student_user");
    sessionStorage.removeItem("exam_active_state");
    sessionStorage.removeItem("exam_submission_result");
    window.location.href = "index.html";
  }
}

// Logout (Admin)
function handleAdminLogout() {
  if (confirm("Are you sure you want to log out from the Administrator Control Panel?")) {
    sessionStorage.removeItem("exam_admin_user");
    sessionStorage.removeItem("exam_current_role");
    window.location.href = "index.html";
  }
}

// Populate user details on pages if elements exist
document.addEventListener("DOMContentLoaded", () => {
  const userDisplay = document.querySelectorAll(".display-student-name");
  const rollDisplay = document.querySelectorAll(".display-student-roll");
  const courseDisplay = document.querySelectorAll(".display-student-course");

  const currentUser = checkAuth(false);
  if (currentUser) {
    userDisplay.forEach(el => el.textContent = currentUser.name);
    rollDisplay.forEach(el => el.textContent = currentUser.rollNo);
    courseDisplay.forEach(el => el.textContent = currentUser.course);
  }

  const adminDisplay = document.querySelectorAll(".display-admin-name");
  const adminRoleDisplay = document.querySelectorAll(".display-admin-role");
  const currentAdmin = checkAdminAuth(false);
  if (currentAdmin) {
    adminDisplay.forEach(el => el.textContent = currentAdmin.name);
    adminRoleDisplay.forEach(el => el.textContent = currentAdmin.role);
  }
});
