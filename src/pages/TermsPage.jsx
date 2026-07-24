import { PRODUCT_NAME } from "../config";
import Nav from "../components/landing/Nav.jsx";
import Footer from "../components/landing/Footer.jsx";
import { useLenis } from "../hooks/useLenis.js";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  useLenis(true);

  return (
    <div className="landing">
      <Nav />
      <main className="container" style={{ paddingTop: '160px', paddingBottom: '120px', maxWidth: '800px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-400)', textDecoration: 'none', marginBottom: '40px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 style={{ fontSize: '48px', letterSpacing: '-0.02em', marginBottom: '16px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-400)', marginBottom: '48px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-300)', lineHeight: '1.7', fontSize: '16px' }}>
          
          <section>
            <p>Welcome to {PRODUCT_NAME}. By accessing or using our task management platform, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>1. Account Registration and Responsibilities</h2>
            <p>You must provide accurate and complete registration information. You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>2. Acceptable Use Policy (AUP)</h2>
            <p>You agree not to use the {PRODUCT_NAME} platform to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Send unsolicited communications, promotions, or spam.</li>
              <li>Upload or distribute malware, viruses, or any other malicious code.</li>
              <li>Engage in any activity that violates any law or regulations.</li>
              <li>Attempt to bypass or break any security mechanism of the platform.</li>
            </ul>
            <p style={{ marginTop: '8px' }}><strong>Email Abuse:</strong> {PRODUCT_NAME} utilizes email infrastructure to send invitations and notifications. Using our platform to generate unsolicited spam or abusive emails to third parties is strictly prohibited and will result in immediate account termination.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>3. Data and Intellectual Property</h2>
            <p>You retain all rights and ownership of the data, files, and tasks you input into {PRODUCT_NAME}. However, you grant us a worldwide, royalty-free license to host, copy, and transmit your data solely as necessary for us to provide the Service to you.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>4. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the platform at any time, with or without cause or notice, particularly if you violate our Acceptable Use Policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '24px', color: 'var(--text-100)', marginBottom: '16px' }}>5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, {PRODUCT_NAME} shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, resulting from your access to or use of our services.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
