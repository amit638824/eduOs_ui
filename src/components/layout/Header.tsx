import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';
import HamburgerIcon from '@/components/ui/HamburgerIcon';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dashboardPath = user ? getDefaultDashboardPath(user.roles) : '/login';

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Mock Tests', href: '/exams' },
    { label: 'Courses', href: '/exams' },
    { label: 'Study Resources', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="ms-navbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo */}
          <Link to={user ? dashboardPath : '/'} className="ms-nav-brand">
            <div className="ms-nav-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <span className="ms-nav-brand-text">
              MindSprint
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="d-none d-lg-block">
            <ul className="ms-nav-links-list">
              {navItems.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <NavLink to={item.href} end={item.href === '/'} className="ms-nav-item-link">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Search icon */}
            <Link to="/exams" className="d-none d-md-flex align-items-center justify-content-center text-decoration-none" style={{ color: 'var(--ms-gray)' }} aria-label="Search exams">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            {user ? (
              <>
                <Link to={dashboardPath} className="ms-nav-item-link" style={{ fontWeight: 700 }}>
                  {user.firstName}
                </Link>
                <button
                  type="button"
                  className="ms-btn-nav-started"
                  onClick={handleLogout}
                  style={{ background: '#ef4444' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ms-nav-item-link d-none d-sm-block">
                  Login
                </Link>
                <Link to="/register" className="ms-btn-nav-started">
                  <span>Get Started</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </>
            )}

            {/* Mobile menu trigger */}
            <div className="d-lg-none">
              <a className="mobile-aside-button sca-hamburger-btn text-dark" href="#" aria-label="Open menu" onClick={(e) => e.preventDefault()}>
                <HamburgerIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
