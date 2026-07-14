import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LayoutGrid, Users, Bell, BarChart3 } from 'lucide-react';
import './LandingPage.css';

const FEATURES = [
    {
        icon: LayoutGrid,
        title: 'Kanban Boards',
        text: 'Visualize work, limit work-in-progress, and maximize efficiency in your team\'s process.',
    },
    {
        icon: Users,
        title: 'Team Workspaces',
        text: 'Dedicated environments for different departments to manage their specific projects securely.',
    },
    {
        icon: Bell,
        title: 'Instant Notifications',
        text: 'Stay updated with real-time alerts on task assignments, comments, and status changes.',
    },
    {
        icon: BarChart3,
        title: 'Live Analytics',
        text: 'Monitor team velocity, identify bottlenecks, and generate reports with built-in analytical tools.',
    },
];

const AWS_SERVICES = [
    'Cognito', 'API Gateway', 'Lambda', 'DynamoDB', 'S3', 'EventBridge', 'SQS', 'SNS', 'CloudWatch',
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ---- Top Nav ---- */}
            <header className="landing-nav">
                <div className="landing-nav-brand">
                    <div className="landing-nav-icon">TF</div>
                    <span className="landing-nav-name">TaskFlow</span>
                </div>
                <nav>
                    <ul className="landing-nav-links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#about">About</a></li>
                    </ul>
                </nav>
                <button className="btn btn-primary" onClick={() => navigate('/app')}>
                    Sign In
                </button>
            </header>

            {/* ---- Hero ---- */}
            <section className="landing-hero">
                <h1>Manage your projects with surgical precision.</h1>
                <p>
                    A robust Kanban system built for high-performing teams. Streamline workflows,
                    track progress, and deliver results faster — powered entirely by AWS.
                </p>
                <div className="landing-hero-actions">
                    <button className="btn btn-primary landing-cta" onClick={() => navigate('/app')}>
                        Get Started — It's Free
                    </button>
                    <button className="landing-cta-secondary" onClick={() => navigate('/app')}>
                        View Documentation
                    </button>
                </div>
            </section>

            {/* ---- Features Grid ---- */}
            <section className="landing-features-section" id="features">
                <div className="landing-section-header">
                    <h2>Core Capabilities</h2>
                    <p>Everything you need to manage complex projects effectively.</p>
                </div>
                <div className="landing-features-grid">
                    {FEATURES.map(({ icon: Icon, title, text }) => (
                        <div className="landing-feature-card" key={title}>
                            <div className="landing-feature-icon-wrap">
                                <Icon size={20} color="var(--color-action)" strokeWidth={1.5} />
                            </div>
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---- Architecture Section ---- */}
            <section className="landing-arch-section" id="about">
                <div className="landing-section-header">
                    <h2>Enterprise-Grade Architecture</h2>
                    <p>Powered by AWS for unparalleled reliability, security, and scale.</p>
                </div>
                <div className="landing-arch-card">
                    <div className="landing-arch-grid">
                        {AWS_SERVICES.map(s => (
                            <div className="landing-arch-item" key={s}>
                                <CheckCircle2 size={16} color="var(--color-success)" strokeWidth={1.5} />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Footer ---- */}
            <footer className="landing-footer">
                <div className="landing-footer-brand">
                    <div className="landing-nav-icon" style={{ width: 20, height: 20, fontSize: 9 }}>TF</div>
                    <span className="landing-footer-copy">© 2025 TaskFlow.</span>
                </div>
                <div className="landing-footer-copy">
                    Built by{' '}
                    <a href="https://samarth-patel.dev" target="_blank" rel="noreferrer">
                        samarth-patel.dev
                    </a>
                </div>
            </footer>
        </div>
    );
}