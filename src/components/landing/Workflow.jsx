import Reveal from "./Reveal.jsx";

const STEPS = [
  { n: "01", title: "Create a workspace", body: "One team, one board. Spin up a workspace in a single call to CreateWorkspace - no setup wizard." },
  { n: "02", title: "Add the work", body: "Title, priority, due date, assignee. Tasks land straight into whichever column they belong in." },
  { n: "03", title: "Invite the team", body: "Add teammates by email - InviteMember resolves it against Cognito's user directory, no separate roster to maintain." },
  { n: "04", title: "Move it, discuss it, ship it", body: "Drag across the board, leave a comment, close it out. The dashboard updates the moment you do." },
];

export default function Workflow() {
  return (
    <section id="workflow" className="workflow">
      <div className="container">
        <Reveal as="div" className="workflow__head">
          <span className="eyebrow">Workflow</span>
          <h2 className="section-title">
            From idea to done, <em>in four steps</em>
          </h2>
        </Reveal>

        <div className="workflow__steps">
          {STEPS.map((s, i) => (
            <Reveal as="div" key={s.n} delay={i * 0.08} className="workflow__step">
              <span className="workflow__num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
