import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLiquidGlass } from "../../hooks/useLiquidGlass.jsx";
import { PRODUCT_NAME } from "../../config";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import AccentColorPicker from "../ui/AccentColorPicker.jsx";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#workflow", label: "Workflow" },
  { href: "#infrastructure", label: "Infrastructure" },
  { href: "#pricing", label: "Pricing" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerRef = useRef(null);
  useLiquidGlass(headerRef, scrolled, { scale: -90, border: 0.05, blur: 12 });

  return (
    <header ref={headerRef} className={`nav ${scrolled ? "nav--scrolled liquid-glass-surface" : ""}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__logo">
          <span className="nav__logo-mark" aria-hidden="true" />
          {PRODUCT_NAME}
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
