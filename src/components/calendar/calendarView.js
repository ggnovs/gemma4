import { renderCalendarGrid } from './calendarGrid.js';
import { renderGroupedDeadlines } from './groupedDeadlines.js';

const API_BASE = "https://uncrown-everglade-outflank.ngrok-free.dev/api";
const DEFAULT_HEADERS = { "ngrok-skip-browser-warning": "true" };

let currentDate = new Date();
let cachedEvents = [];

export function mountCalendarView(container) {
  container.innerHTML = `
    <h2>Academic Calendar</h2>
    <p class="subtitle">Important dates automatically parsed from syllabus uploads.</p>
    
    <div class="calendar-header-bar">
      <button id="prevMonthBtn" class="month-nav-btn">&larr;</button>
      <h2 id="currentMonthYear">Month Year</h2>
      <button id="nextMonthBtn" class="month-nav-btn">&rarr;</button>
    </div>

    <div class="calendar-days-header">
      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
    </div>

    <div id="calendarGrid" class="calendar-grid"></div>

    <div class="upcoming-deadlines-section">
      <h3>📋 All Syllabus Deadlines</h3>
      <div id="groupedDeadlinesContainer" class="grouped-deadlines-wrapper"></div>
    </div>
  `;

  document.getElementById("prevMonthBtn").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendarGrid(currentDate, cachedEvents);
  });

  document.getElementById("nextMonthBtn").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendarGrid(currentDate, cachedEvents);
  });

  loadCalendarEvents();
}

export async function loadCalendarEvents() {
  try {
    const res = await fetch(`${API_BASE}/calendar`, { headers: DEFAULT_HEADERS });
    cachedEvents = await res.json();

    if (res.ok) {
      renderCalendarGrid(currentDate, cachedEvents);
      renderGroupedDeadlines(cachedEvents);
    }
  } catch (err) {
    console.error("Failed to load calendar events:", err);
  }
}
