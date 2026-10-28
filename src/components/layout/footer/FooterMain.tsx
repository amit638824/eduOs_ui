import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function FooterMain() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="row g-5">
      {/* Col 1: Brand & Social */}
      <div className="col-xl-4 col-lg-4 col-md-6 col-12">
        <Link to="/" className="ms-nav-brand mb-3" style={{ textDecoration: 'none' }}>
          <div className="ms-nav-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
          </div>
          <span className="ms-nav-brand-text" style={{ color: '#ffffff' }}>
            MindSprint
          </span>
        </Link>

        <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#94a3b8', margin: 0, marginBottom: '20px' }}>
          Practice Today. Achieve Tomorrow.
        </p>

        {/* Social icons */}
        <div className="d-flex align-items-center gap-2">
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="ms-social-clean" aria-label="YouTube">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ms-social-clean" aria-label="Instagram">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="ms-social-clean" aria-label="X">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="ms-social-clean" aria-label="LinkedIn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Col 2: Quick Links */}
      <div className="col-xl-2 col-lg-2 col-md-6 col-6">
        <h4 className="ms-footer-heading-clean">Quick Links</h4>
        <ul className="ms-footer-links-clean">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/exams">Mock Tests</Link></li>
          <li><Link to="/exams">Courses</Link></li>
          <li><Link to="/about">Study Resources</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
        </ul>
      </div>

      {/* Col 3: Support */}
      <div className="col-xl-2 col-lg-2 col-md-6 col-6">
        <h4 className="ms-footer-heading-clean">Support</h4>
        <ul className="ms-footer-links-clean">
          <li><Link to="/help">Help Center</Link></li>
          <li><Link to="/about">Contact Us</Link></li>
          <li><Link to="/help">FAQs</Link></li>
          <li><Link to="/privacy">Privacy Policy</Link></li>
          <li><Link to="/privacy">Terms &amp; Conditions</Link></li>
        </ul>
      </div>

      {/* Col 4: Newsletter */}
      <div className="col-xl-4 col-lg-4 col-md-6 col-12">
        <h4 className="ms-footer-heading-clean">Join Our Newsletter</h4>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, marginBottom: '16px' }}>
          Get latest updates, study tips and offers.
        </p>

        {subscribed ? (
          <div className="p-3 rounded-3" style={{ background: 'rgba(56, 97, 251, 0.15)', border: '1px solid rgba(56, 97, 251, 0.3)', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Thank you for subscribing to MindSprint!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="d-flex flex-sm-row flex-column gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                background: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#0f172a',
                fontSize: '0.875rem',
                flexGrow: 1,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="ms-btn"
              style={{
                background: 'var(--ms-primary)',
                color: '#ffffff',
                padding: '10px 22px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                fontWeight: 600,
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
