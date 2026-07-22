import { mountChatView } from './components/chat/chatView.js';
import { mountCalendarView, loadCalendarEvents } from './components/calendar/calendarView.js';

document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-view");
  const calendarContainer = document.getElementById("calendar-view");

  // Mount view HTML structures dynamically
  mountChatView(chatContainer);
  mountCalendarView(calendarContainer);

  // Drawer & Navigation logic
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const navDrawer = document.getElementById("navDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const menuItems = document.querySelectorAll(".menu-item");
  const views = document.querySelectorAll(".app-view");

  function toggleDrawer(show) {
    navDrawer.classList.toggle("hidden", !show);
    drawerOverlay.classList.toggle("hidden", !show);
  }

  hamburgerBtn.addEventListener("click", () => toggleDrawer(true));
  closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
  drawerOverlay.addEventListener("click", () => toggleDrawer(false));

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(m => m.classList.remove("active"));
      views.forEach(v => v.classList.add("hidden"));

      item.classList.add("active");
      const targetId = item.dataset.target;
      document.getElementById(targetId).classList.remove("hidden");

      document.getElementById("appTitle").textContent = item.textContent.trim();
      toggleDrawer(false);

      if (targetId === "calendar-view") {
        loadCalendarEvents();
      }
    });
  });
});
