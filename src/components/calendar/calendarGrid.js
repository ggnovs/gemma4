export function renderCalendarGrid(currentDate, cachedEvents) {
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

  // Empty padding cells for alignment
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell empty";
    grid.appendChild(emptyCell);
  }

  // Active day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day-cell";

    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
      cell.classList.add("today");
    }

    const dayNum = document.createElement("div");
    dayNum.className = "calendar-day-number";
    dayNum.textContent = day;
    cell.appendChild(dayNum);

    // Event badges container inside box
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "cell-events-wrapper";

    const dayEvents = cachedEvents.filter(e => e.event_date === dateStr);
    dayEvents.forEach(ev => {
      const pill = document.createElement("div");
      pill.className = "course-tag-pill";
      pill.title = `${ev.course_code}: ${ev.title} - ${ev.description}`;
      pill.textContent = `[${ev.course_code}] ${ev.title}`;
      eventsContainer.appendChild(pill);
    });

    cell.appendChild(eventsContainer);
    grid.appendChild(cell);
  }
}
