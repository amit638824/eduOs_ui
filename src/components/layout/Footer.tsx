import { Link, useNavigate, useLocation } from 'react-router-dom';
import '@/styles/mindsprint-home.css';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const id = targetId.replace('#', '');
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 85;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
        window.history.pushState(null, '', '#' + id);
        return;
      }
    }
    navigate('/#' + id);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <footer
      className="ms-footer-universal"
      style={{
        background: '#111d39',
        color: '#d0d9ed',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
        borderTop: 'none',
      }}
    >
      <div className="wrap">
        <div className="footgrid">
          <div>
            <a
              className="logo footer-logo-badge"
              href="/#home"
              onClick={(e) => scrollToSection(e, '#home')}
              aria-label="MindSprint Home"
            >
              <img src="/img/logo/mindsprint-logo.png" alt="MindSprint" />
            </a>
            <p style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
              Online exams, mock tests, and assessments — delivering a smarter digital examination experience for
              India's learning community.
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>Quick Links</h4>
            <div className="footlinks" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
              <a href="/#audience" onClick={(e) => scrollToSection(e, '#audience')}>
                Solutions
              </a>
              <a href="/#features" onClick={(e) => scrollToSection(e, '#features')}>
                Why MindSprint
              </a>
              <a href="/#how" onClick={(e) => scrollToSection(e, '#how')}>
                How It Works
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>Get Started</h4>
            <div className="footlinks" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
              <Link to="/login" onClick={handleLoginClick}>
                Log in to the Portal
              </Link>
              <a href="mailto:vivek@techwagger.com?subject=MindSprint%20Demo%20Request">
                Request a Demo
              </a>
              <a href="mailto:vivek@techwagger.com">Contact Sales</a>
            </div>
          </div>
        </div>
        <div className="copyright" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
          <span style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
            © {new Date().getFullYear()} MindSprint. All rights reserved.
          </span>
          <span style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
            Learn • Practise • Progress
          </span>
        </div>
      </div>
    </footer>
  );
}
