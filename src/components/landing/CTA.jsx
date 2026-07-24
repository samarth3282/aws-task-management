import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import Aurora from "../../../aurora/Aurora.jsx";

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <Reveal as="div" className="cta__box">
          <div className="cta__aurora" aria-hidden="true">
            <Aurora colorStops={['#00E5FF', '#8B5CF6', '#F0A63A']} blend={0.5} speed={1.0} amplitude={2.5} />
          </div>
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
