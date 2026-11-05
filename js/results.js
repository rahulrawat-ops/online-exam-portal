/* ===================================================
   Online Examination Portal - Results & Scorecard Engine
   Loads Submission Data, Computes Metrics, Renders Review
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const student = checkAuth(false) || {
    name: "Rahul Sharma",
    rollNo: "CS2024089",
    course: "B.Tech Computer Science & Engg"
  };

  const storedResult = sessionStorage.getItem("exam_submission_result");
  let resultData = null;

  if (storedResult) {
    resultData = JSON.parse(storedResult);
  } else {
    // Fallback sample data in case user browses directly to results.html
    resultData = {
      examTitle: "CS401: Web Technologies & Systems",
      submissionTime: new Date().toLocaleString(),
      totalQuestions: 10,
      attempted: 10,
      unattempted: 0,
      correctCount: 8,
      wrongCount: 2,
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
      detailedResults: [
        {
          questionId: 1,
          questionText: "Which of the following HTML tags is used to define an internal style sheet?",
          options: ["<css>", "<script>", "<style>", "<link>"],
          userAnswerIndex: 2,
          correctIndex: 2,
          isCorrect: true,
          isAttempted: true,
          explanation: "The <style> tag is used inside the <head> section of an HTML document to define internal CSS rules."
        },
        {
          questionId: 2,
          questionText: "In JavaScript, which operator is used to compare both value and data type?",
          options: ["==", "===", "!=", "="],
          userAnswerIndex: 0,
          correctIndex: 1,
          isCorrect: false,
          isAttempted: true,
          explanation: "The strict equality operator (===) checks for both equality of value and matching data type without type coercion."
        }
      ]
    };
  }

  renderResults(student, resultData);
});

function renderResults(student, data) {
  // Candidate Info
  if (document.getElementById("resStudentName")) {
    document.getElementById("resStudentName").textContent = student.name;
  }
  if (document.getElementById("resRollNo")) {
    document.getElementById("resRollNo").textContent = student.rollNo;
  }
  if (document.getElementById("resCourse")) {
    document.getElementById("resCourse").textContent = student.course;
  }
  if (document.getElementById("resExamTitle")) {
    document.getElementById("resExamTitle").textContent = data.examTitle;
  }
  if (document.getElementById("resDate")) {
    document.getElementById("resDate").textContent = data.submissionTime;
  }

  // Summary Metrics
  if (document.getElementById("resScore")) {
    document.getElementById("resScore").textContent = `${data.score} / ${data.maxScore}`;
  }
  if (document.getElementById("resPercentage")) {
    document.getElementById("resPercentage").textContent = `${data.percentage}%`;
  }
  if (document.getElementById("resAttempted")) {
    document.getElementById("resAttempted").textContent = data.attempted;
  }
  if (document.getElementById("resCorrect")) {
    document.getElementById("resCorrect").textContent = data.correctCount;
  }
  if (document.getElementById("resWrong")) {
    document.getElementById("resWrong").textContent = data.wrongCount;
  }
  if (document.getElementById("resUnattempted")) {
    document.getElementById("resUnattempted").textContent = data.unattempted;
  }

  // Pass/Fail Banner
  const statusBox = document.getElementById("resStatusBadge");
  if (statusBox) {
    if (data.passed) {
      statusBox.textContent = "PASSED";
      statusBox.className = "badge-active status-badge";
      statusBox.style.fontSize = "1rem";
      statusBox.style.padding = "6px 14px";
    } else {
      statusBox.textContent = "FAILED";
      statusBox.className = "btn-danger status-badge";
      statusBox.style.fontSize = "1rem";
      statusBox.style.padding = "6px 14px";
    }
  }

  // Render Detailed Question Review
  const reviewContainer = document.getElementById("detailedReviewContainer");
  if (!reviewContainer) return;

  reviewContainer.innerHTML = "";

  data.detailedResults.forEach((item, index) => {
    const div = document.createElement("div");
    let borderClass = "is-unattempted";
    let statusText = "<span style='color:#6c757d;'>Not Attempted</span>";

    if (item.isAttempted) {
      if (item.isCorrect) {
        borderClass = "is-correct";
        statusText = "<span style='color:#28a745;'>Correct (+1 Mark)</span>";
      } else {
        borderClass = "is-wrong";
        statusText = "<span style='color:#dc3545;'>Incorrect (0 Marks)</span>";
      }
    }

    div.className = `review-item ${borderClass}`;

    let optionsHtml = "";
    item.options.forEach((opt, optIdx) => {
      let optLabel = `${String.fromCharCode(65 + optIdx)}. ${opt}`;
      let style = "padding: 3px 6px; margin: 2px 0; border-radius: 3px;";

      if (optIdx === item.correctIndex) {
        style += "background-color: #d4edda; font-weight: bold; border-left: 3px solid #28a745;";
        optLabel += " &nbsp; ✓ [Correct Answer]";
      } else if (optIdx === item.userAnswerIndex && !item.isCorrect) {
        style += "background-color: #f8d7da; border-left: 3px solid #dc3545;";
        optLabel += " &nbsp; ✗ [Your Selection]";
      }

      optionsHtml += `<div style="${style}">${optLabel}</div>`;
    });

    div.innerHTML = `
      <div class="review-meta">
        <span>Question ${index + 1}</span> &bull; 
        <span>Status: ${statusText}</span>
      </div>
      <div style="font-weight: 600; margin-bottom: 8px;">${item.questionText}</div>
      <div class="review-options">${optionsHtml}</div>
      <div class="review-explanation">
        <strong>Explanation:</strong> ${item.explanation}
      </div>
    `;

    reviewContainer.appendChild(div);
  });
}

