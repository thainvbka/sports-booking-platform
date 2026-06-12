import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      initializeTheme: () => {
        applyTheme(get().theme);

        // Remove listener first to avoid multiple bindings
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
          if (get().theme === "system") {
            applyTheme("system");
          }
        };

        try {
          mediaQuery.removeEventListener("change", handleChange);
          mediaQuery.addEventListener("change", handleChange);
        } catch {
          // Fallback for older browsers
          try {
            mediaQuery.removeListener(handleChange);
            mediaQuery.addListener(handleChange);
          } catch (e) {
            console.error("Failed to bind prefers-color-scheme change listener", e);
          }
        }
      },
    }),
    {
      name: "t-sport-theme",
    }
  )
);

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  
  // Clean classes
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
    // Standard style-color support for browsers
    root.style.colorScheme = systemTheme;
  } else {
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }
}
