import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <Reveal as="div" className="cta__box">
          <div className="cta__glow" aria-hidden="true" />
          <span className="eyebrow">Ready when you are</span>
          <h2 className="cta__title">
            Stop tracking work in a doc.
            <br />
            Put it on a board that moves.
          </h2>
          <div className="cta__actions">
            <Link to="/login?intent=signup" className="btn btn--amber">
              Start free →
            </Link>
            <a href="#product" className="btn btn--outline">
              See it move
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
