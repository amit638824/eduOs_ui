import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';
import '@/styles/mindsprint-home.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dashboardPath = user ? getDefaultDashboardPath(user.roles) : '/login';

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMenuOpen(false);

    if (window.location.pathname !== '/') {
      navigate('/' + targetId);
      return;
    }

    const id = targetId.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', targetId);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="ms-header-universal">
      <div className="top">
        <div className="wrap">
          <span>Online Examination • Mock Tests • Assessments</span>
          <span>
            <b>For Schools</b> &nbsp;|&nbsp; <b>For Coaching Institutes</b> &nbsp;|&nbsp; <b>For Learners</b>
          </span>
        </div>
      </div>

      <header>
        <div className="wrap nav">
          <a
            className="logo"
            href="/#home"
            onClick={(e) => scrollToSection(e, '#home')}
            aria-label="MindSprint Home"
          >
            <img src="/img/logo/mindsprint-logo.png" alt="MindSprint" />
          </a>
          <nav className={`links ${menuOpen ? 'show' : ''}`} id="links">
            <a href="/#home" onClick={(e) => scrollToSection(e, '#home')}>
              Home
            </a>
            <a href="/#audience" onClick={(e) => scrollToSection(e, '#audience')}>
              Solutions
            </a>
            <a href="/#features" onClick={(e) => scrollToSection(e, '#features')}>
              Why MindSprint
            </a>
            <a href="/#how" onClick={(e) => scrollToSection(e, '#how')}>
              How It Works
            </a>
            <a href="/#contact" onClick={(e) => scrollToSection(e, '#contact')}>
              Contact
            </a>
          </nav>
          <div className="nav-cta">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn outline">
                  Dashboard
                </Link>
                <button type="button" className="btn primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn outline" to="/login" onClick={handleLoginClick}>
                  Login
                </Link>
                <a className="btn primary" href="/#contact" onClick={(e) => scrollToSection(e, '#contact')}>
                  Request a Demo&nbsp; →
                </a>
              </>
            )}
            <button
              className="menu"
              aria-label="Open menu"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
