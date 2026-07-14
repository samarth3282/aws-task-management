import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LayoutGrid, Users, Bell, BarChart3 } from 'lucide-react';
import './LandingPage.css';

const FEATURES = [
    { icon: LayoutGrid, title: 'Kanban boards', text: 'Drag tasks across To Do, In Progress, and Done in real time.' },
    { icon: Users, title: 'Team workspaces', text: 'Invite teammates and collaborate on shared boards.' },
    { icon: Bell, title: 'Instant notifications', text: 'Task events flow through an event-driven pipeline straight to your inbox.' },
    { icon: BarChart3, title: 'Live analytics', text: 'A workspace dashboard shows exactly where every task stands.' }
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            <nav className="landing-nav">
                <div className="landing-logo">🗂️ TaskFlow</div>
                <button className="btn btn-primary" onClick={() => navigate('/app')}>
                    Sign In
                </button>
            </nav>

            <header className="landing-hero">
                <h1>Task management, built on serverless AWS.</h1>
                <p>
                    A Kanban-style workspace with real-time collaboration, file attachments, and
                    an event-driven notification pipeline — running entirely on Cognito, Lambda,
                    DynamoDB, and seven other managed AWS services.
                </p>
                <div className="landing-hero-actions">
                    <button className="btn btn-primary landing-cta" onClick={() => navigate('/app')}>
                        Get Started — It's Free
                    </button>
                </div>
            </header>

            <section className="landing-features">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                    <div className="landing-feature-card" key={title}>
                        <Icon size={22} color="var(--color-primary)" />
                        <h3>{title}</h3>
                        <p>{text}</p>
                    </div>
                ))}
            </section>

            <section className="landing-architecture">
                <h2>Under the hood</h2>
                <p>Nine AWS services working together in a single event-driven pipeline:</p>
                <ul className="landing-arch-list">
                    {['Cognito', 'API Gateway', 'Lambda', 'DynamoDB', 'S3', 'EventBridge', 'SQS', 'SNS', 'CloudWatch'].map(s => (
                        <li key={s}><CheckCircle2 size={16} color="var(--color-success)" /> {s}</li>
                    ))}
                </ul>
            </section>

            <footer className="landing-footer">
                Built by Samarth Patel — <a href="https://samarth-patel.dev" target="_blank" rel="noreferrer">samarth-patel.dev</a>
            </footer>
        </div>
    );
}