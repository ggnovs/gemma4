// src/components/quiz/quizView.js
const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";

let currentQuizData = [];

export function mountQuizView(container) {
  container.innerHTML = `
    <div class="quiz-container">
      <h2>🎯 Quiz Help & Slide Trainer</h2>
      <p>Upload lecture slides (.pdf, .docx, .txt) to let Gemma4 read the material, generate a 20-question MCQ quiz, grade your submission, and explain missed concepts.</p>
      
      <div class="upload-zone" onclick="document.getElementById('slideInput').click()">
        📄 Click to upload lecture slides
        <input type="file" id="slideInput" accept=".pdf,.docx,.txt" multiple style="display:none;">
      </div>
      <div id="fileList"></div>
      
      <button id="trainBtn" class="primary-btn" style="margin-top:12px;">⚡ Train Gemma4 & Generate 20-Q Quiz</button>
      
      <div id="quizDisplayArea" style="margin-top: 24px;"></div>
    </div>
  `;

  const slideInput = document.getElementById("slideInput");
  const trainBtn = document.getElementById("trainBtn");
  const fileList = document.getElementById("fileList");

  slideInput.addEventListener("change", () => {
    fileList.innerHTML = Array.from(slideInput.files).map(f => `<div>📎 ${f.name}</div>`).join('');
  });

  trainBtn.addEventListener("click", async () => {
    if (!slideInput.files.length) {
      alert("Please upload at least one lecture slide file.");
      return;
    }

    const formData = new FormData();
    for (let file of slideInput.files) {
      formData.append("slides", file);
    }

    document.getElementById("quizDisplayArea").innerHTML = "<p>⏳ Reading slides and generating 20 questions with Gemma4... This may take a moment.</p>";

    try {
      const res = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.quiz) {
        currentQuizData = data.quiz;
        renderQuizForm(data.quiz);
      } else {
        document.getElementById("quizDisplayArea").innerHTML = `<p>❌ Error: ${data.error || "Failed to generate quiz"}</p>`;
      }
    } catch (e) {
      document.getElementById("quizDisplayArea").innerHTML = "<p>❌ Connection Error: Backend unreachable.</p>";
    }
  });
}

function renderQuizForm(questions) {
  const area = document.getElementById("quizDisplayArea");
  
  let html = `<form id="quizForm"><h3>Generated 20-Question Practice Quiz</h3>`;

  questions.forEach((q, idx) => {
    html += `
      <div class="quiz-card" id="card-q${idx}">
        <p><strong>Q${idx + 1}: ${q.question}</strong></p>
        ${q.options.map((opt, optIdx) => `
          <label class="quiz-option">
            <input type="radio" name="q${idx}" value="${optIdx}" required>
            ${opt}
          </label>
        `).join('')}
      </div>
    `;
  });

  html += `<button type="submit" class="primary-btn" style="margin-top:20px;">📤 Submit Answers</button></form>`;
  html += `<div id="quizResults" style="margin-top:24px;"></div>`;

  area.innerHTML = html;

  document.getElementById("quizForm").addEventListener("submit", handleQuizSubmit);
}

async function handleQuizSubmit(e) {
  e.preventDefault();
  
  const resultsDiv = document.getElementById("quizResults");
  resultsDiv.innerHTML = "<p>⏳ Calculating score and generating explanations with Gemma4...</p>";

  const userAnswers = [];
  currentQuizData.forEach((_, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    userAnswers.push(selected ? parseInt(selected.value, 10) : -1);
  });

  try {
    const res = await fetch(`${API_BASE}/grade-quiz`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({
        quiz: currentQuizData,
        user_answers: userAnswers
      })
    });

    const data = await res.json();

    if (res.ok) {
      displayResults(data);
    } else {
      resultsDiv.innerHTML = `<p>❌ Error grading quiz: ${data.error}</p>`;
    }
  } catch (e) {
    resultsDiv.innerHTML = "<p>❌ Error submitting quiz to backend.</p>";
  }
}

function displayResults(data) {
  const resultsDiv = document.getElementById("quizResults");
  
  let html = `
    <div style="background:var(--bg-color); padding:16px; border-radius:var(--radius); border:1px solid var(--border-color);">
      <h2>📊 Final Score: ${data.score} / ${data.total} (${data.percentage}%)</h2>
      <p style="margin-top:8px;">${data.percentage >= 70 ? '🎉 Great job! You passed.' : '📖 Review the explanations below to strengthen weak areas.'}</p>
    </div>
    <h3 style="margin-top:20px;">Answer Breakdown & Explanations</h3>
  `;

  data.breakdown.forEach((item, idx) => {
    const isCorrect = item.is_correct;
    const cardBg = isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
    const borderColor = isCorrect ? '#4CAF50' : '#F44336';

    html += `
      <div style="margin-top:12px; padding:16px; border-left:6px solid ${borderColor}; background:${cardBg}; border-radius:8px;">
        <p><strong>Q${idx + 1}: ${item.question}</strong></p>
        <p style="margin-top:4px;"><strong>Your Answer:</strong> ${item.user_answer_text} ${isCorrect ? '✅' : '❌'}</p>
        ${!isCorrect ? `<p style="margin-top:2px;"><strong>Correct Answer:</strong> ${item.correct_answer_text}</p>` : ''}
        <div style="margin-top:8px; font-style:italic; font-size:0.95rem;">
          💡 <strong>Gemma4 Explanation:</strong> ${item.explanation}
        </div>
      </div>
    `;
  });

  resultsDiv.innerHTML = html;
}
