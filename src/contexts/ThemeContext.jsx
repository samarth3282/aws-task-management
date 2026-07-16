import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark"); // Default to dark

  useEffect(() => {
    const stored = localStorage.getItem("taskflow-theme");
    if (stored === "light") {
      setThemeState("light");
      document.documentElement.classList.add("light");
    } else {
      setThemeState("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = useCallback(async (x, y) => {
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setThemeState(nextTheme);
      localStorage.setItem("taskflow-theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return;
    }

    document.documentElement.classList.add("theme-transition");
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setThemeState(nextTheme);
        localStorage.setItem("taskflow-theme", nextTheme);
        if (nextTheme === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      });
    });

    await transition.ready;

    const maxRadius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 1000,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );

    document.documentElement.animate(
      { opacity: [1, 1] },
      {
        duration: 1000,
        easing: "linear",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-transition");
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
