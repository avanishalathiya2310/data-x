"use client";
import React, { useEffect, useState } from "react";
import { User } from "@phosphor-icons/react";


function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isSavedDark = savedTheme === "dark";
    if (isSavedDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      if (!savedTheme) localStorage.setItem("theme", "light");
    }
    setIsDark(isSavedDark);
    // Notify listeners of the initial theme so embedded apps can sync
    window.dispatchEvent(
      new CustomEvent("theme-changed", {
        detail: isSavedDark ? "dark" : "light",
      })
    );
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      // Notify listeners that theme changed
      window.dispatchEvent(
        new CustomEvent("theme-changed", {
          detail: "dark",
        })
      );
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      // Notify listeners that theme changed
      window.dispatchEvent(
        new CustomEvent("theme-changed", {
          detail: "light",
        })
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-2 bg-light-theme dark:bg-dark-theme max-h-13 shadow-[0_4px_6px_-6px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xl font-semibold text-light-main dark:text-dark-main tracking-wide transition-opacity opacity-100`}
          >
            DataX
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            {/* light-dark mode toggle */}
            <button
              type="button"
              role="switch"
              aria-pressed={isDark}
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="relative inline-flex items-center h-6 w-12 rounded-full overflow-hidden transition-colors duration-300 ease-in-out focus:outline-none border border-light-default dark:border-dark-default bg-dark-secondary dark:bg-light-secondary cursor-pointer"
              style={{
                boxShadow: isDark
                  ? "inset 0 2px 6px rgba(0,0,0,0.45)"
                  : "inset 0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              {/* track icons: sun on left, moon on right */}
              <span
                className="absolute left-1 text-[12px] p-1 pointer-events-none"
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="currentColor"
                  className="bi bi-brightness-high"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
                </svg>
              </span>
              <span
                className="absolute right-1 text-[12px] p-1 pointer-events-none"
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  fill="#fff"
                  className="bi bi-moon-stars-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
                  <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
                </svg>
              </span>

              {/* moving thumb (plain circle, no icon) */}
              <span
                className={`pointer-events-none absolute border left-1 h-4 w-4 rounded-full transform transition-transform duration-300 ease-in-out ${
                  isDark
                    ? "translate-x-6 bg-dark-theme border-dark-default"
                    : "translate-x-0 bg-white border-light-default"
                }`}
              />
            </button>
          </div>

          {/* Avatar */}
          <div className="rounded-full p-2 bg-main overflow-hidden">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
