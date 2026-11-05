/* ===================================================
   Online Examination Portal - Live Exam Engine
   Manages Questions, Timer, Palette, Answers & Submission
   Dynamically loads questions set by Admin from localStorage
   =================================================== */

// Default Question Bank for "CS401: Web Technologies & Systems"
const DEFAULT_EXAM_QUESTIONS = [
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

// Helper to retrieve live question bank set by admin
function loadActiveQuestionBank() {
  const saved = localStorage.getItem("exam_question_bank");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error parsing stored question bank:", e);
    }
  }
  // Initialize with default if not found
  localStorage.setItem("exam_question_bank", JSON.stringify(DEFAULT_EXAM_QUESTIONS));
  return DEFAULT_EXAM_QUESTIONS;
}

// Active questions for current test
let EXAM_QUESTIONS = loadActiveQuestionBank();

// Examination State Variables
let currentIndex = 0;
let userAnswers = new Array(EXAM_QUESTIONS.length).fill(null);
let questionStatus = new Array(EXAM_QUESTIONS.length).fill("not-visited");
let timerInterval = null;

// Determine Duration (Admin-configured or default 15 mins)
const configuredDurationMinutes = parseInt(localStorage.getItem("exam_settings_duration") || "15", 10);
let timeRemainingSeconds = configuredDurationMinutes * 60;

// Initialize Exam
function initExam() {
  // Ensure user is logged in
  const currentUser = checkAuth(true);
  if (!currentUser) return;

  // Refresh questions in case admin just updated them
  EXAM_QUESTIONS = loadActiveQuestionBank();
  userAnswers = new Array(EXAM_QUESTIONS.length).fill(null);
  questionStatus = new Array(EXAM_QUESTIONS.length).fill("not-visited");

  // Update paper title in UI
  const configuredTitle = localStorage.getItem("exam_settings_title") || "CS401: Web Technologies & Systems";
  const titleDisplay = document.getElementById("examPaperTitle");
  if (titleDisplay) titleDisplay.textContent = configuredTitle;

  // Mark Q1 as not-answered
  questionStatus[0] = "not-answered";

  renderPalette();
  loadQuestion(0);
  startTimer();

  // Warn user on leaving page or closing tab
  window.onbeforeunload = function() {
    return "Your exam progress will be lost if you leave this page!";
  };
}

// Format Seconds into MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Timer Countdown
function startTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  const timerContainer = document.getElementById("timerBox");

  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeRemainingSeconds);
  }

  timerInterval = setInterval(() => {
    timeRemainingSeconds--;

    if (timerDisplay) {
      timerDisplay.textContent = formatTime(timeRemainingSeconds);
    }

    // Critical warning when less than 2 minutes left
    if (timeRemainingSeconds <= 120 && timerContainer) {
      timerContainer.classList.add("timer-warning");
    }

    if (timeRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      alert("Time is up! Your exam will now be submitted automatically.");
      finalizeSubmission();
    }
  }, 1000);
}

// Load Question by Index
function loadQuestion(index) {
  if (index < 0 || index >= EXAM_QUESTIONS.length) return;

  // Update status of previous if it was not-visited
  if (questionStatus[currentIndex] === "not-visited") {
    questionStatus[currentIndex] = "not-answered";
  }

  currentIndex = index;

  if (questionStatus[currentIndex] === "not-visited") {
    questionStatus[currentIndex] = "not-answered";
  }

  const q = EXAM_QUESTIONS[currentIndex];

  document.getElementById("currentQuestionNum").textContent = `Question ${currentIndex + 1} of ${EXAM_QUESTIONS.length}`;
  document.getElementById("questionText").textContent = q.question;

  // Render options
  const optionsList = document.getElementById("optionsList");
  optionsList.innerHTML = "";

  q.options.forEach((optText, optIdx) => {
    const li = document.createElement("li");
    li.className = "option-item";
    if (userAnswers[currentIndex] === optIdx) {
      li.classList.add("selected");
    }

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "examOption";
    radio.id = `option_${optIdx}`;
    radio.value = optIdx;
    radio.checked = userAnswers[currentIndex] === optIdx;

    radio.addEventListener("change", () => selectOption(optIdx));

    const label = document.createElement("label");
    label.htmlFor = `option_${optIdx}`;
    label.style.cursor = "pointer";
    label.style.width = "100%";
    label.textContent = `${String.fromCharCode(65 + optIdx)}. ${optText}`;

    li.appendChild(radio);
    li.appendChild(label);

    li.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        radio.checked = true;
        selectOption(optIdx);
      }
    });

    optionsList.appendChild(li);
  });

  // Enable/disable navigation buttons
  document.getElementById("btnPrev").disabled = (currentIndex === 0);
  document.getElementById("btnNext").disabled = (currentIndex === EXAM_QUESTIONS.length - 1);

  renderPalette();
}

// Select an option
function selectOption(optionIndex) {
  userAnswers[currentIndex] = optionIndex;
  questionStatus[currentIndex] = "answered";

  // Visual selection highlight
  const items = document.querySelectorAll(".option-item");
  items.forEach((item, idx) => {
    if (idx === optionIndex) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  });

  renderPalette();
}

// Clear selected response for current question
function clearCurrentResponse() {
  userAnswers[currentIndex] = null;
  questionStatus[currentIndex] = "not-answered";

  const radios = document.getElementsByName("examOption");
  radios.forEach(r => r.checked = false);

  const items = document.querySelectorAll(".option-item");
  items.forEach(item => item.classList.remove("selected"));

  renderPalette();
}

// Mark current question for review
function markForReview() {
  questionStatus[currentIndex] = "marked";
  nextQuestion();
}

// Save and Move to Next Question
function saveAndNext() {
  if (currentIndex < EXAM_QUESTIONS.length - 1) {
    loadQuestion(currentIndex + 1);
  }
}

// Previous Question
function prevQuestion() {
  if (currentIndex > 0) {
    loadQuestion(currentIndex - 1);
  }
}

// Next Question
function nextQuestion() {
  if (currentIndex < EXAM_QUESTIONS.length - 1) {
    loadQuestion(currentIndex + 1);
  }
}

// Render the right-side Palette Grid
function renderPalette() {
  const paletteContainer = document.getElementById("paletteButtons");
  if (!paletteContainer) return;

  paletteContainer.innerHTML = "";

  let answeredCount = 0;
  let notAnsweredCount = 0;
  let markedCount = 0;
  let notVisitedCount = 0;

  EXAM_QUESTIONS.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn-palette ${questionStatus[idx]}`;
    btn.textContent = idx + 1;

    if (idx === currentIndex) {
      btn.classList.add("current");
    }

    btn.addEventListener("click", () => {
      loadQuestion(idx);
    });

    paletteContainer.appendChild(btn);

    // Count statistics for the summary
    if (questionStatus[idx] === "answered") answeredCount++;
    else if (questionStatus[idx] === "marked") markedCount++;
    else if (questionStatus[idx] === "not-answered") notAnsweredCount++;
    else notVisitedCount++;
  });

  // Update counts in palette legend/summary
  if (document.getElementById("countAnswered")) {
    document.getElementById("countAnswered").textContent = answeredCount;
  }
  if (document.getElementById("countNotAnswered")) {
    document.getElementById("countNotAnswered").textContent = notAnsweredCount;
  }
  if (document.getElementById("countMarked")) {
    document.getElementById("countMarked").textContent = markedCount;
  }
  if (document.getElementById("countNotVisited")) {
    document.getElementById("countNotVisited").textContent = notVisitedCount;
  }
}

// Open Confirmation Submit Modal
function openSubmitModal() {
  const modal = document.getElementById("submitModal");
  if (modal) {
    let answered = userAnswers.filter(a => a !== null).length;
    let unanswered = EXAM_QUESTIONS.length - answered;

    const modalSummary = document.getElementById("modalSummaryText");
    if (modalSummary) {
      modalSummary.innerHTML = `
        <p><strong>Total Questions:</strong> ${EXAM_QUESTIONS.length}</p>
        <p><strong>Answered:</strong> <span style="color: green; font-weight: bold;">${answered}</span></p>
        <p><strong>Unanswered / Skipped:</strong> <span style="color: red; font-weight: bold;">${unanswered}</span></p>
      `;
    }
    modal.classList.add("active");
  }
}

// Close Modal
function closeSubmitModal() {
  const modal = document.getElementById("submitModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// Finalize submission and calculate results
function finalizeSubmission() {
  clearInterval(timerInterval);
  window.onbeforeunload = null;

  const currentStudent = checkAuth(false) || {
    name: "Rahul Rawat",
    rollNo: "CS2024089"
  };

  // Calculate score
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  const detailedResults = EXAM_QUESTIONS.map((q, idx) => {
    const userSelected = userAnswers[idx];
    const isAttempted = (userSelected !== null);
    const isCorrect = isAttempted && (userSelected === q.correctIndex);

    if (isCorrect) correctCount++;
    else if (isAttempted) wrongCount++;
    else unattemptedCount++;

    return {
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      userAnswerIndex: userSelected,
      correctIndex: q.correctIndex,
      isCorrect: isCorrect,
      isAttempted: isAttempted,
      explanation: q.explanation || "No explanation provided."
    };
  });

  const totalMarks = EXAM_QUESTIONS.length;
  const percentage = Math.round((correctCount / totalMarks) * 100);
  const passed = percentage >= 40;
  const configuredTitle = localStorage.getItem("exam_settings_title") || "CS401: Web Technologies & Systems";
  const submissionTimestamp = new Date().toLocaleString();

  const resultPayload = {
    examTitle: configuredTitle,
    submissionTime: submissionTimestamp,
    totalQuestions: totalMarks,
    attempted: correctCount + wrongCount,
    unattempted: unattemptedCount,
    correctCount: correctCount,
    wrongCount: wrongCount,
    score: correctCount,
    maxScore: totalMarks,
    percentage: percentage,
    passed: passed,
    detailedResults: detailedResults
  };

  // 1. Save single result for results.html
  sessionStorage.setItem("exam_submission_result", JSON.stringify(resultPayload));

  // 2. Also record in all submissions log for Admin to view
  try {
    let allSubmissions = [];
    const storedSubmissions = localStorage.getItem("exam_all_submissions");
    if (storedSubmissions) {
      allSubmissions = JSON.parse(storedSubmissions);
    }
    allSubmissions.unshift({
      studentName: currentStudent.name,
      rollNo: currentStudent.rollNo,
      examTitle: configuredTitle,
      score: `${correctCount} / ${totalMarks}`,
      percentage: `${percentage}%`,
      status: passed ? "PASSED" : "FAILED",
      timestamp: submissionTimestamp
    });
    // Keep last 50 submissions
    if (allSubmissions.length > 50) allSubmissions = allSubmissions.slice(0, 50);
    localStorage.setItem("exam_all_submissions", JSON.stringify(allSubmissions));
  } catch (err) {
    console.error("Error archiving student submission:", err);
  }

  window.location.href = "results.html";
}

document.addEventListener("DOMContentLoaded", initExam);
