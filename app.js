const API_BASE = "http://127.0.0.1:5000/api";

// --- DOM ELEMENTS ---
const hamburgerBtn = document.getElementById("hamburgerBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const navDrawer = document.getElementById("navDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const menuItems = document.querySelectorAll(".menu-item");
const views = document.querySelectorAll(".app-view");

// --- NAVIGATION & DRAWER TOGGLE ---
function toggleDrawer(show) {
  if (show) {
    navDrawer.classList.remove("hidden");
    drawerOverlay.classList.remove("hidden");
  } else {
    navDrawer.classList.add("hidden");
    drawerOverlay.classList.add("hidden");
  }
}

hamburgerBtn.addEventListener("click", () => toggleDrawer(true));
closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
drawerOverlay.addEventListener("click", () => toggleDrawer(false));

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(m => m.classList.remove("active"));
    views.forEach(v => v.classList.add("hidden"));
    
    item.classList.add("active");
    const targetView = document.getElementById(item.dataset.target);
    targetView.classList.remove("hidden");
    
    document.getElementById("appTitle").textContent = item.textContent.trim();
    toggleDrawer(false);

    // Refresh view data when opened
    if (item.dataset.target === "notes-view") loadNotesHistory();
    if (item.dataset.target === "calendar-view") loadCalendarEvents();
  });
});

// --- DATE STAMP FOR MY NOTES ---
document.getElementById("noteDateStamp").textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
});

// --- MY NOTES: BACKEND SAVE & RETRIEVAL ---
document.getElementById("saveNoteBtn").addEventListener("click", async () => {
  const title = document.getElementById("noteTitleInput").value;
  const content = document.getElementById("noteContentArea").value;
  
  if (!content.trim()) return alert("Note content cannot be empty!");

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });
    const data = await res.json();
    if (data.status === "success") {
      alert("Note saved to backend!");
      loadNotesHistory();
    }
  } catch (err) {
    console.error("Save note error:", err);
  }
});

async function loadNotesHistory() {
  const container = document.getElementById("savedNotesList");
  try {
    const res = await fetch(`${API_BASE}/notes`);
    const notes = await res.json();
    container.innerHTML = notes.map(n => `
      <div class="card" style="margin-top:8px;">
        <h4>${DOMPurify.sanitize(n.title)}</h4>
        <small>${n.created_at}</small>
        <p>${DOMPurify.sanitize(n.content.substring(0, 100))}...</p>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = "<p>Failed to load saved notes.</p>";
  }
}

// --- SYLLABUS UPLOAD TO GEMMA ---
document.getElementById("syllabusInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("syllabus", file);

  appendChatMessage(`📄 Uploading syllabus: ${file.name}...`, "user-message");

  try {
    const res = await fetch(`${API_BASE}/upload-syllabus`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    appendChatMessage(`✅ Syllabus parsed! Gemma extracted ${data.events_found} key deadlines into your Calendar.`, "bot-message");
  } catch (err) {
    appendChatMessage("❌ Failed to parse syllabus on backend.", "bot-message");
  }
});

function appendChatMessage(text, className) {
  const box = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

// --- CALENDAR RETRIEVAL ---
async function loadCalendarEvents() {
  const list = document.getElementById("calendarList");
  try {
    const res = await fetch(`${API_BASE}/calendar`);
    const events = await res.json();
    if (events.length === 0) {
      list.innerHTML = "<p>No deadlines found yet. Upload a syllabus in chat!</p>";
      return;
    }
    list.innerHTML = events.map(ev => `
      <div class="card">
        <h3>${ev.event_date}</h3>
        <h4>${DOMPurify.sanitize(ev.title)}</h4>
        <p>${DOMPurify.sanitize(ev.description)}</p>
      </div>
    `).join("");
  } catch (e) {
    list.innerHTML = "<p>Error connecting to Calendar backend.</p>";
  }
}

// --- DARK MODE TOGGLE ---
document.getElementById("darkToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
});
