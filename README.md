# Online Examination Portal (Frontend Only)

A classic, academic-style online examination portal designed using HTML5, CSS3, and Vanilla JavaScript. Built to resemble a mid-tier college/university academic portal with clean, functional, and responsive design.

## Features

- **No Backend Required:** Completely frontend-driven using browser `localStorage` and `sessionStorage` for real-time exam configuration, question CRUD operations, and session tracking.
- **Dual Role Access (Student & Admin):**
  - **Student Role:** Log in with Roll Number & Password to take scheduled online exams with live timer countdown, 1-10 question navigation palette, and instant automated grading.
  - **Admin / Question Setter Role:** Log in to set new exam questions (MCQs with 4 options, answer key, explanation), edit or delete existing questions, configure exam time limits, and review student submission logs.
- **Real-Time Data Synchronization:** Any question added, edited, or deleted by the Admin in the Admin Panel immediately reflects in the live test when a student takes the exam!

## Portal Pages

1. [`index.html`](index.html) - Candidate & Admin Login with one-click role tabs and demo credentials.
2. [`dashboard.html`](dashboard.html) - Student Dashboard with active scheduled tests, system readiness checks, and past score records.
3. [`admin.html`](admin.html) - Administrator & Question Setter Control Panel (Add/Edit/Delete Questions, Paper Settings, Student Submission Logs).
4. [`exam.html`](exam.html) - Live Examination Interface with live countdown timer, 1-10 Question Palette, and submission confirmation modal.
5. [`results.html`](results.html) - Automated Scorecard, pass/fail status, detailed question-by-question review with answer keys, and print functionality.

## Default Credentials for Testing

- **Student Login:**
  - **Roll Number:** `CS2024089`
  - **Password:** `12345`
- **Admin / Examiner Login:**
  - **Username:** `admin`
  - **Password:** `admin123`
