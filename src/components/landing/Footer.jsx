import { PRODUCT_NAME } from "../../config";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="nav__logo-mark" aria-hidden="true" />
          <span>{PRODUCT_NAME}</span>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <a href="#product">Product</a>
          <a href="#workflow">Workflow</a>
          <a href="#infrastructure">Infrastructure</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <p className="footer__meta">
          Built by <a href="http://samarth-patel.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>samarth3282</a>
        </p>
      </div>
    </footer>
  );
}
