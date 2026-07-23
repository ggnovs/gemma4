const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";

export function mountQuizView(container) {
  container.innerHTML = `
    <div class="quiz-container">
      <h2>🎯 Quiz Help & Slide Trainer</h2>
      <p>Upload lecture slides (.pdf, .pptx, .txt) to fine-tune Gemma AI context and generate practice quizzes.</p>
      
      <div class="upload-zone" onclick="document.getElementById('slideInput').click()">
        📄 Click to upload lecture slides
        <input type="file" id="slideInput" accept=".pdf,.pptx,.txt" multiple style="display:none;">
      </div>
      <div id="fileList"></div>
      
      <button id="trainBtn" class="primary-btn" style="margin-top:10px;">⚡ Train Gemma4 & Generate Quiz</button>
      
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
      alert("Please select at least one slide file.");
      return;
    }

    const formData = new FormData();
    for (let file of slideInput.files) {
      formData.append("slides", file);
    }

    document.getElementById("quizDisplayArea").innerHTML = "<p>🔄 Processing slides and training Gemma4 model context...</p>";

    try {
      const res = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        renderQuiz(data.quiz);
      } else {
        document.getElementById("quizDisplayArea").innerHTML = `<p>❌ Error: ${data.error}</p>`;
      }
    } catch (e) {
      document.getElementById("quizDisplayArea").innerHTML = "<p>❌ Connection Error: Backend unreachable.</p>";
    }
  });
}

function renderQuiz(questions) {
  const area = document.getElementById("quizDisplayArea");
  area.innerHTML = "<h3>Generated MCQ Quiz</h3>";

  questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    card.innerHTML = `
      <p><strong>Q${idx + 1}: ${q.question}</strong></p>
      ${q.options.map(opt => `<label class="quiz-option"><input type="radio" name="q${idx}" value="${opt}"> ${opt}</label>`).join('')}
    `;
    area.appendChild(card);
  });
}
