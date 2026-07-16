import Reveal from "./Reveal.jsx";

const SERVICES = [
  { name: "Cognito", role: "Auth", note: "JWT sessions, no passwords stored in-app" },
  { name: "API Gateway", role: "Edge", note: "REST routes, Cognito authorizer on every one" },
  { name: "Lambda", role: "Compute", note: "11 single-purpose functions, no shared server" },
  { name: "DynamoDB", role: "Data", note: "4 tables, 2 GSIs for many-to-many access" },
  { name: "S3", role: "Storage", note: "Pre-signed uploads, browser talks to S3 directly" },
  { name: "EventBridge", role: "Events", note: "Routes TaskCreated off the request path" },
  { name: "SQS", role: "Queue", note: "Async delivery with a dead-letter queue" },
  { name: "SNS", role: "Notify", note: "Fan-out email delivery" },
  { name: "CloudFront", role: "CDN", note: "Custom domain, HTTPS, edge caching" },
  { name: "CloudWatch", role: "Observe", note: "Logs, alarms, and a live dashboard" },
];

export default function InfraStrip() {
  return (
    <section id="infrastructure" className="infra">
      <div className="container">
        <Reveal as="div" className="infra__head">
          <span className="eyebrow">No mock backend</span>
          <h2 className="section-title">
            Every board load hits <em>real</em> AWS infrastructure
          </h2>
          <p className="section-lede">
            Ten managed services, wired the way a small platform team would actually wire
            them - not a single monolith pretending to scale.
          </p>
        </Reveal>

        <div className="infra__grid">
          {SERVICES.map((s, i) => (
            <Reveal as="div" key={s.name} delay={Math.min(i * 0.04, 0.3)} y={18} className="infra__card">
              <div className="infra__card-top">
                <span className="infra__card-name">{s.name}</span>
                <span className="infra__card-role">{s.role}</span>
              </div>
              <p className="infra__card-note">{s.note}</p>
            </Reveal>
          ))}
        </div>

        <Reveal as="div" className="infra__flow" y={16}>
          <span>Cognito</span>
          <i />
          <span>API Gateway</span>
          <i />
          <span>Lambda</span>
          <i />
          <span>DynamoDB / S3</span>
          <i />
          <span>EventBridge</span>
          <i />
          <span>SQS</span>
          <i />
          <span>SNS</span>
        </Reveal>
      </div>
    </section>
  );
}
