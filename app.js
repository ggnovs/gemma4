// --- CONFIGURATION ---
const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";

const DEFAULT_HEADERS = {
  "ngrok-skip-browser-warning": "true"
};

// Global state for calendar navigation
let currentDate = new Date();
let cachedEvents = [];

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

    if (item.dataset.target === "notes-view") loadNotesHistory();
    if (item.dataset.target === "calendar-view") loadCalendarEvents();
  });
});

// --- DATE STAMP FOR NOTES ---
document.getElementById("noteDateStamp").textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
});

// --- MY NOTES BACKEND LOGIC ---
document.getElementById("saveNoteBtn").addEventListener("click", async () => {
  const title = document.getElementById("noteTitleInput").value;
  const content = document.getElementById("noteContentArea").value;
  
  if (!content.trim()) return alert("Note content cannot be empty!");

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { 
        ...DEFAULT_HEADERS,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ title, content })
    });
    
    const data = await res.json();
    if (res.ok && data.status === "success") {
      alert("Note saved!");
      loadNotesHistory();
    } else {
      alert(`Error: ${data.error || "Failed to save note"}`);
    }
  } catch (err) {
    console.error("Save note error:", err);
    alert("Connection error: Ensure Kaggle backend and ngrok are online.");
  }
});

async function loadNotesHistory() {
  const container = document.getElementById("savedNotesList");
  try {
    const res = await fetch(`${API_BASE}/notes`, { headers: DEFAULT_HEADERS });
    const notes = await res.json();
    
    if (!res.ok) {
      container.innerHTML = `<p>Error loading notes: ${notes.error || "Server error"}</p>`;
      return;
    }

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

// --- SYLLABUS UPLOAD ---
document.getElementById("syllabusInput").addEventListener("change", async (e) => {
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

    if (!res.ok) {
      appendChatMessage(`❌ Upload Error (${res.status}): ${data.error || "Failed to process syllabus"}`, "bot-message");
      return;
    }

    appendChatMessage(`✅ [${data.course_code}] Syllabus parsed! Extracted ${data.events_found} key deadlines into your Calendar.`, "bot-message");
    
    // Reload calendar data to render the new course events
    loadCalendarEvents();
  } catch (err) {
    console.error("Syllabus Upload Error:", err);
    appendChatMessage("❌ Connection Error: Check active state of Kaggle session.", "bot-message");
  }
});

function appendChatMessage(text, className) {
  const box = document.getElementById("chatBox");
  if (!box) return;
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

// --- DYNAMIC GRID CALENDAR LOGIC ---
async function loadCalendarEvents() {
  try {
    const res = await fetch(`${API_BASE}/calendar`, { headers: DEFAULT_HEADERS });
    cachedEvents = await res.json();
    
    if (!res.ok) {
      document.getElementById("calendarList").innerHTML = `<p>Error loading calendar: ${cachedEvents.error}</p>`;
      return;
    }

    renderCalendarGrid();
    renderDeadlinesList();
  } catch (e) {
    console.error("Calendar fetch error:", e);
    document.getElementById("calendarList").innerHTML = "<p>Error connecting to Calendar backend.</p>";
  }
}

function renderCalendarGrid() {
  const grid = document.getElementById("calendarGrid");
  const monthYearHeader = document.getElementById("currentMonthYear");
  if (!grid || !monthYearHeader) return;

  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearHeader.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  // Blank cells for alignment
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell empty";
    grid.appendChild(emptyCell);
  }

  // Render day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day-cell";

    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    // Highlight current day
    if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
      cell.classList.add("today");
    }

    const dayNum = document.createElement("div");
    dayNum.className = "calendar-day-number";
    dayNum.textContent = day;
    cell.appendChild(dayNum);

    // Filter events matching cell date
    const dayEvents = cachedEvents.filter(e => e.event_date === dateStr);
    dayEvents.forEach(ev => {
      const pill = document.createElement("div");
      pill.className = "course-tag-pill";
      pill.title = `${ev.course_code}: ${ev.title} (${ev.description})`;
      pill.textContent = `[${ev.course_code}] ${ev.title}`;
      cell.appendChild(pill);
    });

    grid.appendChild(cell);
  }
}

function renderDeadlinesList() {
  const list = document.getElementById("calendarList");
  if (!list) return;

  if (cachedEvents.length === 0) {
    list.innerHTML = "<p>No deadlines found yet. Upload a syllabus in chat!</p>";
    return;
  }

  list.innerHTML = cachedEvents.map(ev => `
    <div class="card" style="margin-top: 8px;">
      <span class="course-tag-pill" style="display:inline-block; margin-bottom: 5px;">${DOMPurify.sanitize(ev.course_code)}</span>
      <h3>${ev.event_date}</h3>
      <h4>${DOMPurify.sanitize(ev.title)}</h4>
      <p>${DOMPurify.sanitize(ev.description)}</p>
    </div>
  `).join("");
}

// Month Navigation Controls
document.getElementById("prevMonthBtn").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendarGrid();
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendarGrid();
});

// --- DARK MODE TOGGLE ---
document.getElementById("darkToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
});
