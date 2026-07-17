import { useTheme } from "../../contexts/ThemeContext.jsx";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="btn btn--icon"
      style={{ borderRadius: '50%', padding: 10, background: 'var(--ink-900, rgba(0,0,0,0.85))', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
      onClick={(e) => {
        let x = e.clientX;
        let y = e.clientY;
        if (!x && !y) {
          const rect = e.currentTarget.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
        toggleTheme(x, y);
      }}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
