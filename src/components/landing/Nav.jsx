import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { PRODUCT_NAME } from "../../config";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import AccentColorPicker from "../ui/AccentColorPicker.jsx";
import TaskflowLogo from "../ui/TaskflowLogo.jsx";
import { useLiquidGlass } from "../../hooks/useLiquidGlass.jsx";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#workflow", label: "Workflow" },
  { href: "#infrastructure", label: "Infrastructure" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const navInnerRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 2);
      lastScrollY = currentScrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLiquidGlass(navInnerRef, scrolled, { scale: -80, border: 0, blur: 3, saturate: 1.5 });

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div ref={navInnerRef} className={`nav__inner ${scrolled ? "liquid-glass-surface" : ""}`}>
        <Link
          to="/"
          className="nav__logo"
          onClick={(e) => {
            if (window.__minimizedWindow) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('restore-mac-window'));
            }
          }}
        >
          <TaskflowLogo className="nav__logo-mark" aria-hidden="true" />
          <span className="nav__logo-text">{PRODUCT_NAME}</span>
        </Link>

        <nav className="nav__links" aria-label="Page sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AccentColorPicker />
          <ThemeToggle />
          <Link to="/login" className="nav__ghost">
            Log in
          </Link>
          <Link to="/login?intent=signup" className="btn btn--sm btn--amber">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
