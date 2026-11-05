/* ===================================================
   Online Examination Portal - Admin & Question Bank Manager
   Handles CRUD for Questions, Exam Configurations & Logs
   =================================================== */

// Tracks whether we are currently editing an existing question ID
let editingQuestionId = null;

// Ensure admin is authenticated on page load
document.addEventListener("DOMContentLoaded", () => {
  const admin = checkAdminAuth(true);
  if (!admin) return;

  loadQuestionBankUI();
  loadExamSettingsUI();
  loadSubmissionsUI();
});

// Load and render all questions from localStorage
function loadQuestionBankUI() {
  const questions = getStoredQuestions();

  const countBadge = document.getElementById("adminQuestionCount");
  if (countBadge) countBadge.textContent = questions.length;

  const container = document.getElementById("adminQuestionsContainer");
  if (!container) return;

  if (questions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #6c757d; border: 1px dashed #cbd5e1; border-radius: 4px;">
        <p>No questions currently in the Question Bank.</p>
        <p style="font-size: 0.85rem; margin-top: 5px;">Use the form above to add questions or click "Reset to Default Questions".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "q-manage-card";
    card.id = `q-card-${q.id}`;

    const optionPills = q.options.map((opt, optIdx) => {
      const isCorrect = (optIdx === q.correctIndex);
      return `<div class="q-opt-pill ${isCorrect ? 'correct' : ''}">
        <strong>${String.fromCharCode(65 + optIdx)}:</strong> ${escapeHtml(opt)}
        ${isCorrect ? ' &bull; <em>[Correct]</em>' : ''}
      </div>`;
    }).join("");

    card.innerHTML = `
      <div class="q-manage-header">
        <div>
          <span style="font-weight: bold; color: #1a4f8b; font-size: 0.95rem;">Q${index + 1}.</span>
          <span style="font-weight: 600; font-size: 0.95rem; margin-left: 6px;">${escapeHtml(q.question)}</span>
        </div>
        <div class="admin-action-row">
          <button type="button" class="btn btn-primary btn-sm" onclick="startEditQuestion(${q.id})">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" onclick="deleteQuestion(${q.id})">Delete</button>
        </div>
      </div>

      <div class="q-manage-options">
        ${optionPills}
      </div>

      <div style="font-size: 0.82rem; color: #555; background: #f8fafc; padding: 6px 10px; border-radius: 3px; border-left: 3px solid #2c7da0;">
        <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'No explanation provided.')}
      </div>
    `;

    container.appendChild(card);
  });
}

// Retrieve questions from localStorage (or fallback to default)
function getStoredQuestions() {
  const saved = localStorage.getItem("exam_question_bank");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse question bank:", e);
    }
  }
  // If not initialized yet, populate defaults from DEFAULT_EXAM_QUESTIONS (or standard set)
  const defaults = (typeof DEFAULT_EXAM_QUESTIONS !== "undefined") ? DEFAULT_EXAM_QUESTIONS : [
    {
      id: 1,
      question: "Which of the following HTML tags is used to define an internal style sheet?",
      options: ["<css>", "<script>", "<style>", "<link>"],
      correctIndex: 2,
      explanation: "The <style> tag is used inside the <head> section of an HTML document to define internal CSS rules."
    },
    {
      id: 2,
      question: "In JavaScript, which operator is used to compare both value and data type?",
      options: ["==", "===", "!=", "="],
      correctIndex: 1,
      explanation: "The strict equality operator (===) checks for both equality of value and matching data type without type coercion."
    }
  ];
  localStorage.setItem("exam_question_bank", JSON.stringify(defaults));
  return defaults;
}

// Handle Add or Update Question
function handleSaveQuestion(event) {
  if (event) event.preventDefault();

  const qText = document.getElementById("qInputText").value.trim();
  const optA = document.getElementById("qInputOptA").value.trim();
  const optB = document.getElementById("qInputOptB").value.trim();
  const optC = document.getElementById("qInputOptC").value.trim();
  const optD = document.getElementById("qInputOptD").value.trim();
  const correctIdx = parseInt(document.getElementById("qInputCorrect").value, 10);
  const explanation = document.getElementById("qInputExplanation").value.trim();
  const alertBox = document.getElementById("adminAlertBox");

  if (!qText || !optA || !optB || !optC || !optD) {
    showAlert("Please fill in the Question Text and all 4 Options (A, B, C, D).", "danger");
    return false;
  }

  let questions = getStoredQuestions();

  if (editingQuestionId !== null) {
    // Update existing question
    const targetIdx = questions.findIndex(q => q.id === editingQuestionId);
    if (targetIdx !== -1) {
      questions[targetIdx] = {
        id: editingQuestionId,
        question: qText,
        options: [optA, optB, optC, optD],
        correctIndex: correctIdx,
        explanation: explanation || "No explanation provided."
      };
      showAlert("Question updated successfully!", "success");
    }
  } else {
    // Add new question
    const newId = Date.now();
    questions.push({
      id: newId,
      question: qText,
      options: [optA, optB, optC, optD],
      correctIndex: correctIdx,
      explanation: explanation || "No explanation provided."
    });
    showAlert("New question added to Question Bank!", "success");
  }

  // Save to localStorage
  localStorage.setItem("exam_question_bank", JSON.stringify(questions));

  // Reset form
  cancelEditQuestion();
  loadQuestionBankUI();
  return false;
}

// Start Editing an existing question
function startEditQuestion(id) {
  const questions = getStoredQuestions();
  const q = questions.find(item => item.id === id);
  if (!q) return;

  editingQuestionId = id;

  document.getElementById("qInputText").value = q.question;
  document.getElementById("qInputOptA").value = q.options[0] || "";
  document.getElementById("qInputOptB").value = q.options[1] || "";
  document.getElementById("qInputOptC").value = q.options[2] || "";
  document.getElementById("qInputOptD").value = q.options[3] || "";
  document.getElementById("qInputCorrect").value = q.correctIndex;
  document.getElementById("qInputExplanation").value = q.explanation || "";

  document.getElementById("formSubmitBtn").textContent = "Update Question";
  document.getElementById("formCancelBtn").style.display = "inline-block";
  document.getElementById("formCardHeader").textContent = "Edit Question in Bank";

  // Scroll to form smoothly
  document.getElementById("questionEditorCard").scrollIntoView({ behavior: "smooth" });
}

// Cancel Editing
function cancelEditQuestion() {
  editingQuestionId = null;
  const form = document.getElementById("questionForm");
  if (form) form.reset();

  document.getElementById("formSubmitBtn").textContent = "+ Add Question to Exam";
  document.getElementById("formCancelBtn").style.display = "none";
  document.getElementById("formCardHeader").textContent = "Add New Question to Exam";
}

// Delete Question
function deleteQuestion(id) {
  if (confirm("Are you sure you want to permanently delete this question from the active exam?")) {
    let questions = getStoredQuestions();
    questions = questions.filter(q => q.id !== id);
    localStorage.setItem("exam_question_bank", JSON.stringify(questions));
    showAlert("Question deleted successfully.", "success");
    cancelEditQuestion();
    loadQuestionBankUI();
  }
}

// Reset Question Bank to original 10 questions
function resetToDefaultQuestions() {
  if (confirm("Are you sure you want to reset the Question Bank to the default 10 Web Technologies questions? Any custom questions added will be replaced.")) {
    const defaults = [
      {
        id: 1,
        question: "Which of the following HTML tags is used to define an internal style sheet?",
        options: ["<css>", "<script>", "<style>", "<link>"],
        correctIndex: 2,
        explanation: "The <style> tag is used inside the <head> section of an HTML document to define internal CSS rules."
      },
      {
        id: 2,
        question: "In JavaScript, which operator is used to compare both value and data type?",
        options: ["==", "===", "!=", "="],
        correctIndex: 1,
        explanation: "The strict equality operator (===) checks for both equality of value and matching data type without type coercion."
      },
      {
        id: 3,
        question: "Which CSS property is used to control the space between adjacent elements' borders?",
        options: ["padding", "margin", "border-spacing", "outline"],
        correctIndex: 1,
        explanation: "Margin creates space around elements, outside of any defined borders."
      },
      {
        id: 4,
        question: "Which HTTP status code signifies that the requested resource could not be found on the server?",
        options: ["200 OK", "301 Moved Permanently", "404 Not Found", "500 Internal Server Error"],
        correctIndex: 2,
        explanation: "HTTP 404 indicates that the server cannot locate the requested page or endpoint."
      },
      {
        id: 5,
        question: "What does the DOM stand for in modern web browsers?",
        options: [
          "Document Object Model",
          "Data Object Manager",
          "Digital Ordinance Mapping",
          "Desktop Operating Mechanism"
        ],
        correctIndex: 0,
        explanation: "DOM stands for Document Object Model, which represents the page so programs can change the document structure, style, and content."
      },
      {
        id: 6,
        question: "Which JavaScript method is commonly used to select an element by its unique HTML ID attribute?",
        options: [
          "document.queryElement()",
          "document.getElementById()",
          "document.findId()",
          "document.selectSingleNode()"
        ],
        correctIndex: 1,
        explanation: "document.getElementById() returns an Element object representing the element whose id property matches the specified string."
      },
      {
        id: 7,
        question: "Which CSS layout module was designed for one-dimensional layouts (either row or column)?",
        options: ["CSS Grid", "Flexbox", "Float", "Table-Layout"],
        correctIndex: 1,
        explanation: "Flexbox is primarily designed for one-dimensional layouts, whereas CSS Grid is designed for two-dimensional layouts."
      },
      {
        id: 8,
        question: "In HTML forms, which attribute determines where to send the form-data when a form is submitted?",
        options: ["method", "action", "target", "enctype"],
        correctIndex: 1,
        explanation: "The 'action' attribute specifies the URL of the program/handler that processes the form information on submission."
      },
      {
        id: 9,
        question: "Which web storage mechanism stores data with no expiration date, remaining even when the browser is closed?",
        options: ["sessionStorage", "cookies (without expiry)", "localStorage", "IndexedCache"],
        correctIndex: 2,
        explanation: "localStorage persists data even after the browser window is closed and reopened, until explicitly deleted."
      },
      {
        id: 10,
        question: "What is the primary function of the 'alt' attribute in the HTML <img> tag?",
        options: [
          "Specifies the tooltip text on hover only",
          "Provides alternative text when the image cannot be displayed",
          "Defines an alternate source image URL",
          "Specifies the image alignment on the screen"
        ],
        correctIndex: 1,
        explanation: "The alt attribute provides alternative text for accessibility (screen readers) and for times when the image fails to load."
      }
    ];

    localStorage.setItem("exam_question_bank", JSON.stringify(defaults));
    cancelEditQuestion();
    loadQuestionBankUI();
    showAlert("Question bank successfully restored to default 10 questions.", "success");
  }
}

// Exam Configurations UI
function loadExamSettingsUI() {
  const title = localStorage.getItem("exam_settings_title") || "CS401: Web Technologies & Systems";
  const duration = localStorage.getItem("exam_settings_duration") || "15";

  const inputTitle = document.getElementById("settingExamTitle");
  const inputDuration = document.getElementById("settingExamDuration");

  if (inputTitle) inputTitle.value = title;
  if (inputDuration) inputDuration.value = duration;
}

// Save Exam Settings
function handleSaveSettings(event) {
  if (event) event.preventDefault();

  const title = document.getElementById("settingExamTitle").value.trim();
  const duration = document.getElementById("settingExamDuration").value.trim();

  if (!title || !duration || isNaN(duration) || parseInt(duration) <= 0) {
    showAlert("Please provide a valid Exam Title and positive Duration (in minutes).", "danger");
    return false;
  }

  localStorage.setItem("exam_settings_title", title);
  localStorage.setItem("exam_settings_duration", duration);

  showAlert("Exam settings saved! Students will now take this test with " + duration + " minutes.", "success");
  return false;
}

// Load Submissions History
function loadSubmissionsUI() {
  const container = document.getElementById("submissionsTableBody");
  if (!container) return;

  let submissions = [];
  const stored = localStorage.getItem("exam_all_submissions");
  if (stored) {
    try {
      submissions = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  const countBadge = document.getElementById("adminSubmissionsCount");
  if (countBadge) countBadge.textContent = submissions.length;

  if (submissions.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">No student submissions recorded yet. Once students take the exam, their scores will appear here.</td></tr>`;
    return;
  }

  container.innerHTML = "";
  submissions.forEach((item, idx) => {
    const isPassed = item.status === "PASSED";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(item.studentName || 'Student')}</strong></td>
      <td><code>${escapeHtml(item.rollNo || 'N/A')}</code></td>
      <td><strong>${escapeHtml(item.score || '0')}</strong> (${escapeHtml(item.percentage || '0%')})</td>
      <td><span class="status-badge ${isPassed ? 'badge-active' : 'btn-danger'}">${escapeHtml(item.status || 'EVALUATED')}</span></td>
      <td style="font-size: 0.8rem; color: #666;">${escapeHtml(item.timestamp || '--')}</td>
    `;
    container.appendChild(tr);
  });
}

// Clear Submissions Log
function clearSubmissionsLog() {
  if (confirm("Are you sure you want to clear all recorded student submission records?")) {
    localStorage.removeItem("exam_all_submissions");
    loadSubmissionsUI();
    showAlert("All student submission records have been cleared.", "success");
  }
}

// Utility alert banner
function showAlert(message, type = "success") {
  const box = document.getElementById("adminAlertBox");
  if (!box) return;

  box.style.display = "block";
  box.className = `notice-bar`;
  if (type === "danger") {
    box.style.backgroundColor = "#f8d7da";
    box.style.borderColor = "#f5c6cb";
    box.style.color = "#721c24";
  } else {
    box.style.backgroundColor = "#d4edda";
    box.style.borderColor = "#c3e6cb";
    box.style.color = "#155724";
  }
  box.innerHTML = `<strong>${type === "danger" ? "ALERT" : "SUCCESS"}:</strong> ${message}`;

  setTimeout(() => {
    box.style.display = "none";
  }, 4500);
}

// Safe string escaping
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

