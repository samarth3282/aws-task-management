import { PRODUCT_NAME } from "../config";
import Nav from "../components/landing/Nav.jsx";
import Footer from "../components/landing/Footer.jsx";
import { useLenis } from "../hooks/useLenis.js";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  useLenis(true);

  return (
    <div className="landing">
      <Nav />
      <main className="container" style={{ paddingTop: '160px', paddingBottom: '120px', maxWidth: '800px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-400)', textDecoration: 'none', marginBottom: '40px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 style={{ fontSize: '48px', letterSpacing: '-0.02em', marginBottom: '16px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-400)', marginBottom: '48px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-300)', lineHeight: '1.7', fontSize: '16px' }}>
          
          <section>
            <p>At {PRODUCT_NAME}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our task management platform.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>1. Information We Collect</h2>
            <p><strong>Personal Data:</strong> We may collect personally identifiable information, such as your name and email address, when you register for an account, create a workspace, or invite team members.</p>
            <p><strong>Customer Data:</strong> Tasks, files, and project information you input into the platform remain your property. We only process this data to provide the service to you.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>2. How We Use Your Information</h2>
            <p>We use the information we collect primarily to provide, maintain, and improve our services. Specifically, we use your email address to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Send critical account notifications (e.g., password resets).</li>
              <li>Deliver workspace invitations and role updates.</li>
              <li>Notify you of relevant project activities (e.g., when a team member leaves a workspace).</li>
            </ul>
            <p style={{ marginTop: '8px' }}>We do not sell, rent, or trade your personal information or email address to third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>3. Data Security and Storage</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. Your data is stored securely on Amazon Web Services (AWS) infrastructure. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>4. Opt-Out and Communication Preferences</h2>
            <p>You can opt-out of receiving non-essential emails from us by clicking the "unsubscribe" link at the bottom of our emails. However, you cannot opt-out of essential transactional emails related to your account or workspace administration while your account remains active.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>5. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us at support@{window.location.hostname.replace('www.', '')}.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
