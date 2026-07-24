import { Link } from "react-router-dom";
import { PRODUCT_NAME } from "../../config";
import TaskflowLogo from "../ui/TaskflowLogo.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <TaskflowLogo className="nav__logo-mark" aria-hidden="true" />
          <span>{PRODUCT_NAME}</span>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <a href="/#product">Product</a>
          <a href="/#workflow">Workflow</a>
          <a href="/#infrastructure">Infrastructure</a>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>

        <p className="footer__meta">
          Built by <a href="http://samarth-patel.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>samarth3282</a>
        </p>
      </div>
    </footer>
  );
}
