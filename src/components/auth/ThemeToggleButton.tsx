import React, { useState, useEffect } from "react";

export function ThemeToggleButton() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        // Moon Icon for Light Theme (Switch to Dark)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-gray-700 dark:text-dark-text-secondary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-4.502z"
          />
        </svg>
      ) : (
        // Sun Icon for Dark Theme (Switch to Light)
        <svg
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-yellow-400"
        >
          <path
            d="m15.538 18.999-.29 1.259a2.25 2.25 0 0 1-2.02 1.735l-.173.007h-2.111a2.25 2.25 0 0 1-2.147-1.577l-.046-.167-.29-1.257h7.077ZM12 2.001a7.25 7.25 0 0 1 7.25 7.25c0 2.136-.936 4.093-2.765 5.84a.25.25 0 0 0-.071.125l-.528 2.283H12.75V10.75a.75.75 0 0 0-1.5 0V17.5H8.114l-.526-2.283a.25.25 0 0 0-.071-.124C5.687 13.344 4.75 11.387 4.75 9.25A7.25 7.25 0 0 1 12 2.001Zm-.75 4.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-1.5 0Zm5.03 1.465a.75.75 0 0 0-1.06 0l-1.061 1.06a.75.75 0 1 0 1.06 1.061l1.061-1.06a.75.75 0 0 0 0-1.06Zm-7.5 0a.75.75 0 0 0-1.06 1.06l1.06 1.061a.75.75 0 1 0 1.061-1.06l-1.06-1.06Z"
            fill="#ffffff"
          />
        </svg>
      )}
    </button>
  );
}
