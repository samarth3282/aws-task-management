import { useLayoutEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

const COLUMNS = [
  { key: "backlog", label: "Backlog", left: "3%", accent: "var(--slate-400)" },
  { key: "progress", label: "In progress", left: "35.5%", accent: "var(--amber-400)" },
  { key: "done", label: "Done", left: "68%", accent: "var(--teal-400)" },
];

const ROW = ["17%", "35.5%", "54%", "72.5%"];

const STATIC_CARDS = [
  { id: "s1", col: 0, row: 0, ref: "TSK-101", title: "Redesign onboarding checklist", who: "AM", accent: "var(--slate-400)" },
  { id: "s2", col: 0, row: 1, ref: "TSK-104", title: "Audit unused DynamoDB GSIs", who: "SP", accent: "var(--slate-400)" },
  { id: "s3", col: 1, row: 0, ref: "TSK-098", title: "Wire signed S3 uploads to UI", who: "RK", accent: "var(--amber-400)" },
  { id: "s4", col: 2, row: 0, ref: "TSK-091", title: "Cognito JWT authorizer", who: "SP", accent: "var(--teal-400)" },
  { id: "s5", col: 2, row: 1, ref: "TSK-088", title: "EventBridge → SQS pipeline", who: "AM", accent: "var(--teal-400)" },
];

const TRAVEL_CARDS = [
  { id: "t1", ref: "TSK-112", title: "Kanban drag-and-drop", who: "SP", startRow: 2, midRow: 1, endRow: 2, delay: 0 },
  { id: "t2", ref: "TSK-115", title: "Threaded task comments", who: "RK", startRow: 3, midRow: 2, endRow: 3, delay: 4.2 },
];

function pos(col, row) {
  return { left: COLUMNS[col].left, top: ROW[row] };
}

export default function LivingBoard() {
  const surfaceRef = useRef(null);
  const cardRefs = useRef({});

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      TRAVEL_CARDS.forEach((card) => {
        const el = cardRefs.current[card.id];
        if (!el) return;

        const backlog = pos(0, card.startRow);
        const progress = pos(1, card.midRow);
        const done = pos(2, card.endRow);

        const tl = gsap.timeline({ repeat: -1, delay: card.delay, defaults: { ease: "power3.inOut" } });

        tl.set(el, { ...backlog, opacity: 1, scale: 1, borderLeftColor: COLUMNS[0].accent });
        tl.to(el, { scale: 1.045, boxShadow: "0 22px 40px -14px rgba(0,0,0,.55)", duration: 0.3, ease: "power2.out" });
        tl.to(el, { ...progress, borderLeftColor: COLUMNS[1].accent, duration: 0.9 }, "<");
        tl.to(el, { scale: 1, boxShadow: "0 6px 16px -6px rgba(0,0,0,.4)", duration: 0.3 });
        tl.to(el, { duration: 2.1 }); // hold in progress
        tl.to(el, { scale: 1.045, boxShadow: "0 22px 40px -14px rgba(0,0,0,.55)", duration: 0.3, ease: "power2.out" });
        tl.to(el, { ...done, borderLeftColor: COLUMNS[2].accent, duration: 0.9 }, "<");
        tl.to(el, { scale: 1, boxShadow: "0 6px 16px -6px rgba(0,0,0,.4)", duration: 0.3 });
        tl.to(el, { duration: 2.4 }); // hold in done
        tl.to(el, { opacity: 0, y: "+=8", duration: 0.4, ease: "power1.in" });
        tl.set(el, { ...backlog, y: 0, borderLeftColor: COLUMNS[0].accent });
        tl.to(el, { opacity: 1, duration: 0.45, ease: "power1.out" });
        tl.to(el, { duration: 1.4 }); // hold in backlog before repeating
      });
    }, surfaceRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="board-mockup" role="img" aria-label="Animated preview of a TaskFlow kanban board, showing tasks moving from Backlog to In Progress to Done">
      <div className="board-mockup__chrome">
        <div className="board-mockup__dots">
          <span />
          <span />
          <span />
        </div>
        <div className="board-mockup__url">taskflow.app/acme-labs/board</div>
      </div>

      <div className="board-mockup__headers">
        {COLUMNS.map((c) => (
          <div key={c.key} className="board-mockup__header" style={{ left: c.left }}>
            <span className="board-mockup__header-dot" style={{ background: c.accent }} />
            {c.label}
          </div>
        ))}
      </div>

      <div className="board-mockup__surface" ref={surfaceRef}>
        {STATIC_CARDS.map((c) => (
          <MockCard key={c.id} card={c} style={pos(c.col, c.row)} />
        ))}
        {TRAVEL_CARDS.map((c) => (
          <MockCard
            key={c.id}
            card={c}
            elRef={(el) => (cardRefs.current[c.id] = el)}
            style={pos(0, c.startRow)}
          />
        ))}
      </div>
    </div>
  );
}

function MockCard({ card, style, elRef }) {
  return (
    <div className="board-mockup__card" style={{ ...style, borderLeftColor: card.accent }} ref={elRef}>
      <span className="board-mockup__card-ref">{card.ref}</span>
      <p className="board-mockup__card-title">{card.title}</p>
      <span className="board-mockup__card-avatar">{card.who}</span>
    </div>
  );
}
