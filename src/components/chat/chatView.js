import { loadCalendarEvents } from '../calendar/calendarView.js';

const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";

export function mountChatView(container) {
  container.innerHTML = `
    <div id="chatBox" class="chat-box">
      <div class="message bot-message">Hello! Upload your syllabus using the (+) button, or ask me anything about your courses.</div>
    </div>
    
    <div class="chat-input-area">
      <label for="syllabusInput" class="upload-plus-btn" title="Upload Syllabus">+</label>
      <input type="file" id="syllabusInput" accept=".pdf,.txt,.docx" style="display:none;">
      <input type="text" id="userInput" placeholder="Ask Gemma or upload a syllabus (+)..." autocomplete="off">
      <button id="sendBtn">Send</button>
    </div>
  `;

  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const syllabusInput = document.getElementById("syllabusInput");

  // 1. Click 'Send' button
  sendBtn.addEventListener("click", handleSendMessage);

  // 2. Press 'Enter' key in text input
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // 3. (+) Upload Syllabus button
  syllabusInput.addEventListener("change", handleSyllabusUpload);
}

async function handleSendMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) return;

  // Render user message in UI & clear input box
  appendChatMessage(message, "user-message");
  userInput.value = "";

  // Render loading placeholder
  const loadingId = appendChatMessage("Thinking...", "bot-message loading");

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" 
      },
      body: JSON.stringify({ message })
    });
    
    const data = await res.json();
    removeChatMessage(loadingId);

    if (res.ok) {
      appendChatMessage(data.response || "Message received!", "bot-message");
    } else {
      appendChatMessage(`❌ Error: ${data.error || "Failed to get response"}`, "bot-message");
    }
  } catch (err) {
    removeChatMessage(loadingId);
    appendChatMessage("❌ Connection Error: Ensure Kaggle backend is online.", "bot-message");
  }
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
      headers: { "ngrok-skip-browser-warning": "true" },
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
  } finally {
    e.target.value = ""; // Reset input so same file can be re-uploaded if needed
  }
}

let msgCounter = 0;
function appendChatMessage(text, className) {
  const box = document.getElementById("chatBox");
  if (!box) return null;

  msgCounter++;
  const msgId = `msg-${msgCounter}`;

  const msg = document.createElement("div");
  msg.id = msgId;
  msg.className = `message ${className}`;
  
  if (window.marked && window.DOMPurify) {
    msg.innerHTML = DOMPurify.sanitize(marked.parse(text));
  } else {
    msg.textContent = text;
  }

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
  return msgId;
}

function removeChatMessage(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}
