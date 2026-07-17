import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "../../lib/gsap";
import LivingBoard from "./LivingBoard.jsx";
import Aurora from "../../../aurora/Aurora.jsx";

const STATS = [
  { label: "Median cycle time", value: "1.8 days", mono: "cycle_time" },
  { label: "Board load", value: "< 200ms", mono: "p95_latency" },
  { label: "Notification pipeline", value: "Event-driven", mono: "sqs → sns" },
];

export default function Hero() {
  const scope = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.set(".hero-in", { opacity: 0, y: 22 });
      tl.set(".hero-board-in", { opacity: 0, y: 36, scale: 0.98 });
      tl.to(".hero-in", { opacity: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.1);
      tl.to(".hero-board-in", { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.45);
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={scope}>
      <div className="hero__glow" aria-hidden="true">
        <Aurora colorStops={["#F0A63A", "#00E5FF", "#8B5CF6"]} blend={0.5} amplitude={2} />
      </div>
      <div className="container hero__inner">
        <span className="eyebrow hero-in">Project OS for teams who ship</span>

        <h1 className="hero__title hero-in">
          Plan the work.
          <br />
          <em>Watch it move.</em>
        </h1>

        <p className="hero__subhead hero-in">
          TaskFlow turns scattered to-dos into a single live board - workspaces, tasks,
          comments and teammates, backed by real serverless infrastructure instead of a
          spreadsheet pretending to be one.
        </p>

        <div className="hero__actions hero-in">
          <Link to="/login?intent=signup" className="btn btn--amber">
            Start free →
          </Link>
          <a href="#product" className="btn btn--outline">
            See it move
          </a>
        </div>

        <dl className="hero__stats hero-in">
          {STATS.map((s) => (
            <div key={s.mono} className="hero__stat">
              <dt>
                <span className="hero__stat-mono">{s.mono}</span>
              </dt>
              <dd>{s.value}</dd>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </dl>
      </div>

      <div className="container hero__board-wrap hero-board-in">
        <LivingBoard />
      </div>
    </section>
  );
}
