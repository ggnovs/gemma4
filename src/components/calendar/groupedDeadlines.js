export function renderGroupedDeadlines(cachedEvents) {
  const container = document.getElementById("groupedDeadlinesContainer");
  if (!container) return;

  if (cachedEvents.length === 0) {
    container.innerHTML = "<p>No deadlines found yet. Upload a syllabus in chat!</p>";
    return;
  }

  // Group events by course_code
  const grouped = cachedEvents.reduce((acc, ev) => {
    const code = ev.course_code || "GENERAL";
    if (!acc[code]) acc[code] = [];
    acc[code].push(ev);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped).map(([courseCode, events]) => `
    <div class="course-group-card">
      <div class="course-group-header">
        <span class="course-header-badge">${DOMPurify.sanitize(courseCode)}</span>
        <span class="course-count-tag">${events.length} Deadline${events.length > 1 ? 's' : ''}</span>
      </div>
      <div class="cards-grid">
        ${events.map(ev => `
          <div class="card">
            <div class="card-date-badge">${ev.event_date}</div>
            <h4 class="card-event-title">${DOMPurify.sanitize(ev.title)}</h4>
            <p class="card-event-desc">${DOMPurify.sanitize(ev.description)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}
