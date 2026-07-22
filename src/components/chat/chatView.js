import { loadCalendarEvents } from '../calendar/calendarView.js';

const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";
const DEFAULT_HEADERS = { "ngrok-skip-browser-warning": "true" };

export function mountChatView(container) {
  container.innerHTML = `
    <div id="chatBox" class="chat-box">
      <div class="message bot-message">Hello! Upload your syllabus using the (+) button to parse course deadlines.</div>
    </div>
    
    <div class="chat-input-area">
      <label for="syllabusInput" class="upload-plus-btn" title="Upload Syllabus">+</label>
      <input type="file" id="syllabusInput" accept=".pdf,.txt,.docx" style="display:none;">
      <input type="text" id="userInput" placeholder="Ask Gemma or upload a syllabus (+)..." autocomplete="off">
      <button id="sendBtn">Send</button>
    </div>
  `;

  document.getElementById("syllabusInput").addEventListener("change", handleSyllabusUpload);
}

async function handleSyllabusUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("syllabus", file);

  appendChatMessage(`📄 Uploading syllabus: ${file.name}...`, "user-message");

  try {
    const res = await fetch(`${API_BASE}/upload-syllabus`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: formData
    });
    const data = await res.json();

    if (res.ok) {
      appendChatMessage(`✅ [${data.course_code}] Syllabus parsed! Added ${data.events_found} deadlines.`, "bot-message");
      loadCalendarEvents();
    } else {
      appendChatMessage(`❌ Upload Error: ${data.error}`, "bot-message");
    }
  } catch (err) {
    appendChatMessage("❌ Connection Error: Ensure Kaggle backend is online.", "bot-message");
  }
}

function appendChatMessage(text, className) {
  const box = document.getElementById("chatBox");
  if (!box) return;
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}
