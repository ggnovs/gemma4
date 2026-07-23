import { mountChatView } from './components/chat/chatView.js';
import { mountCalendarView } from './components/calendar/calendarView.js';
import { mountQuizView } from './components/quiz/quizView.js';

document.addEventListener("DOMContentLoaded", () => {
  // Mount Views
  mountChatView(document.getElementById("chat-view"));
  mountCalendarView(document.getElementById("calendar-view"));
  mountQuizView(document.getElementById("quiz-view"));

  // Drawer Controls
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const navDrawer = document.getElementById("navDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");

  function toggleDrawer(open) {
    navDrawer.classList.toggle("hidden", !open);
    drawerOverlay.classList.toggle("hidden", !open);
  }

  hamburgerBtn.addEventListener("click", () => toggleDrawer(true));
  closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
  drawerOverlay.addEventListener("click", () => toggleDrawer(false));

  // Navigation Switching
  document.querySelectorAll(".menu-item[data-target]").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");
      
      document.querySelectorAll(".app-view").forEach(view => view.classList.add("hidden"));
      document.getElementById(targetId).classList.remove("hidden");

      document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      toggleDrawer(false);
    });
  });

  // Settings & Dark Mode Toggle
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const darkModeToggle = document.getElementById("darkModeToggle");

  openSettingsBtn.addEventListener("click", () => {
    toggleDrawer(false);
    settingsModal.classList.remove("hidden");
  });

  closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));

  // Restore Dark Mode Preference
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
});
