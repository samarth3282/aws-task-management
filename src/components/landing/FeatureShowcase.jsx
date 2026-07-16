import Reveal from "./Reveal.jsx";

const FEATURES = [
  {
    id: "board",
    eyebrow: "01 - Board",
    title: "One board, every status",
    body: "Drag a task from To Do to Done and it lands instantly - the UI updates first and only rolls back if the API call actually fails, the same optimistic pattern Linear and Trello use.",
    points: ["Per-column “Add task” with status baked in", "Optimistic drag-and-drop, no spinner lag", "Priority and due date visible at a glance"],
    Mockup: BoardMockup,
  },
  {
    id: "detail",
    eyebrow: "02 - Detail",
    title: "Every task has a thread",
    body: "Click a card and the conversation opens beside it - description, assignee, due date, and a running comment thread so decisions live next to the work, not in a separate chat.",
    points: ["Reassign without leaving the panel", "Comments sorted oldest → newest by design", "Nothing here uses alert() or confirm()"],
    Mockup: DetailMockup,
  },
  {
    id: "analytics",
    eyebrow: "03 - Analytics",
    title: "See the shape of the work",
    body: "A workspace overview turns raw task rows into something you can read in five seconds - what's open, what's moving, and what shipped this week.",
    points: ["Live counts by status and priority", "Per-member workload at a glance", "No separate BI tool required"],
    Mockup: AnalyticsMockup,
  },
];

export default function FeatureShowcase() {
  return (
    <section id="product" className="showcase">
      <div className="container">
        <Reveal as="div" className="showcase__head">
          <span className="eyebrow">Product</span>
          <h2 className="section-title">
            Built like a tool people <em>keep</em> using
          </h2>
          <p className="section-lede">
            Three screens, three jobs. Nothing you have to learn from a help center.
          </p>
        </Reveal>

        <div className="showcase__list">
          {FEATURES.map((f, i) => (
            <div key={f.id} className={`showcase__row ${i % 2 === 1 ? "showcase__row--reverse" : ""}`}>
              <Reveal as="div" className="showcase__text" x={i % 2 === 1 ? 24 : -24}>
                <span className="showcase__eyebrow">{f.eyebrow}</span>
                <h3 className="showcase__title">{f.title}</h3>
                <p className="showcase__body">{f.body}</p>
                <ul className="showcase__points">
                  {f.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal as="div" className="showcase__visual" delay={0.1} y={36}>
                <f.Mockup />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoardMockup() {
  const cols = [
    { label: "To do", accent: "var(--slate-400)", cards: ["Spec the invite-by-email flow", "Draft empty-state copy"] },
    { label: "In progress", accent: "var(--amber-400)", cards: ["Kanban drag-and-drop"] },
    { label: "Done", accent: "var(--teal-400)", cards: ["Cognito JWT authorizer", "Pre-signed S3 uploads"] },
  ];
  return (
    <div className="mockup-frame">
      <MockupChrome label="board" />
      <div className="mini-board">
        {cols.map((c) => (
          <div key={c.label} className="mini-board__col">
            <div className="mini-board__col-head">
              <span style={{ background: c.accent }} />
              {c.label}
            </div>
            {c.cards.map((card) => (
              <div key={card} className="mini-board__card" style={{ borderLeftColor: c.accent }}>
                {card}
              </div>
            ))}
            <div className="mini-board__add">+ Add task</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailMockup() {
  return (
    <div className="mockup-frame">
      <MockupChrome label="task · TSK-115" />
      <div className="mini-detail">
        <div className="mini-detail__meta">
          <span className="pill pill--amber">HIGH</span>
          <span className="mini-detail__due">Due Fri, Jul 24</span>
          <span className="mini-detail__avatar">RK</span>
        </div>
        <h4>Threaded task comments</h4>
        <p>Add a Comments table keyed by TaskID, sorted oldest-to-newest by an ISO-prefixed sort key.</p>
        <div className="mini-detail__divider" />
        <div className="mini-detail__comment">
          <span className="mini-detail__avatar mini-detail__avatar--sm">SP</span>
          <div>
            <p className="mini-detail__comment-head">Samarth <time>2h ago</time></p>
            <p className="mini-detail__comment-body">Went with a mapping table instead of a GSI on the Set attribute.</p>
          </div>
        </div>
        <div className="mini-detail__comment">
          <span className="mini-detail__avatar mini-detail__avatar--sm">RK</span>
          <div>
            <p className="mini-detail__comment-head">Riya <time>34m ago</time></p>
            <p className="mini-detail__comment-body">Makes sense - ships the O(1) query either direction.</p>
          </div>
        </div>
        <div className="mini-detail__input">Write a comment...</div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [38, 52, 44, 68, 58, 74, 62];
  return (
    <div className="mockup-frame">
      <MockupChrome label="dashboard" />
      <div className="mini-analytics">
        <div className="mini-analytics__stats">
          <div>
            <span>12</span>
            <p>Open</p>
          </div>
          <div>
            <span>5</span>
            <p>In progress</p>
          </div>
          <div>
            <span>27</span>
            <p>Done this month</p>
          </div>
        </div>
        <div className="mini-analytics__chart">
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mini-analytics__legend">
          <span><i style={{ background: "var(--slate-400)" }} /> Backlog</span>
          <span><i style={{ background: "var(--amber-400)" }} /> In progress</span>
          <span><i style={{ background: "var(--teal-400)" }} /> Done</span>
        </div>
      </div>
    </div>
  );
}

function MockupChrome({ label }) {
  return (
    <div className="mockup-frame__chrome">
      <div className="board-mockup__dots">
        <span />
        <span />
        <span />
      </div>
      <span className="mockup-frame__label">{label}</span>
    </div>
  );
}
