const THEME_STORAGE_KEY = "cs2Theme";

function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
}

function updateThemeButton(theme) {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (!themeToggleBtn) return;

  themeToggleBtn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "dark";

  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = getSavedTheme();
  applyTheme(savedTheme);

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
});
