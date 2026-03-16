"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "cs2Theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      id="themeToggleBtn"
      className="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
