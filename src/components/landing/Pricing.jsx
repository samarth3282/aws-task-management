import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";

const TIERS = [
  {
    name: "Solo",
    price: "$0",
    period: "forever",
    tagline: "For one person keeping their own work straight.",
    features: ["1 workspace", "Unlimited tasks", "Kanban board", "Basic dashboard"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Team",
    price: "$9",
    period: "per member / mo",
    tagline: "For teams who need one shared source of truth.",
    features: ["Unlimited workspaces", "Comments & threaded discussion", "Member invites", "File uploads", "Full analytics"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    period: "",
    tagline: "For orgs that need SSO, audit logs, and a real SLA.",
    features: ["Everything in Team", "SSO / SAML", "Audit log export", "Dedicated support"],
    cta: "Contact sales",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <Reveal as="div" className="pricing__head">
          <span className="eyebrow">Pricing</span>
          <h2 className="section-title">
            Simple pricing, <em>no seat-count games</em>
          </h2>
        </Reveal>

        <div className="pricing__grid">
          {TIERS.map((t, i) => (
            <Reveal
              as="div"
              key={t.name}
              delay={i * 0.08}
              className={`pricing__card ${t.featured ? "pricing__card--featured" : ""}`}
            >
              {t.featured && <span className="pricing__badge">Most teams pick this</span>}
              <h3>{t.name}</h3>
              <p className="pricing__tagline">{t.tagline}</p>
              <div className="pricing__price">
                <span>{t.price}</span>
                {t.period && <small>{t.period}</small>}
              </div>
              <ul className="pricing__features">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                to="/login?intent=signup"
                className={`btn btn--block ${t.featured ? "btn--amber" : "btn--outline"}`}
              >
                {t.cta}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
