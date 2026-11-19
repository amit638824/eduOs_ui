import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';

type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dashboardPath = user ? getDefaultDashboardPath(user.roles) : '/login';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const scrolled = y > 8;
      setIsScrolled(scrolled);
      document.body.classList.toggle('nav-scrolled', scrolled);
      document.documentElement.classList.toggle('nav-scrolled', scrolled);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('scroll', onScroll, true);
      document.body.classList.remove('nav-scrolled');
      document.documentElement.classList.remove('nav-scrolled');
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mmactive', mobileOpen);
    return () => document.body.classList.remove('mmactive');
  }, [mobileOpen]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setOpenMobileSub(null);
  };

  return (
    <>
      {/* MindSprint Top Notification Bar */}
      <div
        className="ms-top-bar"
        style={{
          background: '#132143',
          color: '#dfe7ff',
          fontSize: '12px',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div className="container-fluid px-lg-5 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Online Examination • Mock Tests • Assessments</span>
          <span>
            <strong style={{ color: '#fff' }}>For Schools</strong> &nbsp;|&nbsp;{' '}
            <strong style={{ color: '#fff' }}>For Coaching Institutes</strong> &nbsp;|&nbsp;{' '}
            <strong style={{ color: '#fff' }}>For Learners</strong>
          </span>
        </div>
      </div>

      <div
        id="navigation"
        className={`navbar-light site-navigation eduleb-topbar${isScrolled ? ' is-scrolled' : ''}`}
        style={
          isScrolled
            ? {
              background: '#ffffff',
              backgroundImage: 'none',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              borderBottom: '1px solid #e8edf5',
            }
            : undefined
        }
      >
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-20 align-self-center">
              <div className="site-logo eduleb-brand-logo">
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src="/img/logo/mindsprint-logo.png"
                    alt="Mindsprint"
                    style={{
                      maxHeight: '44px',
                      width: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </Link>
              </div>
            </div>

            <div className="col-60 d-flex justify-content-center">
              <nav id="main-menu">
                <ul>
                  {navItems.map((item) => {
                    const hasChildren = Boolean(item.children?.length);
                    return (
                      <li
                        key={item.label}
                        className={hasChildren ? 'menu-item-has-children' : undefined}
                      >
                        {item.href ? (
                          <Link to={item.href}>{item.label}</Link>
                        ) : (
                          <a href="#">{item.label}</a>
                        )}
                        {hasChildren && (
                          <ul>
                            {item.children!.map((child) => (
                              <li key={`${item.label}-${child.label}`}>
                                <Link to={child.href}>{child.label}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="col-20 text-end align-self-center eduleb-nav-actions eduleb-nav-actions--desktop">
              {user ? (
                <>
                  <Link to={dashboardPath} className="header-btn me-2">
                    Dashboard
                  </Link>
                  <button type="button" className="btn_one" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn_one">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          id="sm_menu_ham"
          className={mobileOpen ? 'open' : ''}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`sm_menu_outer slide${mobileOpen ? ' active' : ''}`}>
        <ul className="mobile_menu">
          {navItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openMobileSub === item.label;
            return (
              <li key={`m-${item.label}`} className={isOpen ? 'active' : undefined}>
                {hasChildren ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMobileSub(isOpen ? null : item.label);
                      }}
                    >
                      {item.label}
                    </a>
                    <ul className="sub-menu" style={{ display: isOpen ? 'block' : 'none' }}>
                      {item.children!.map((child) => (
                        <li key={`m-${item.label}-${child.label}`}>
                          <Link to={child.href} onClick={closeMobile}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link to={item.href!} onClick={closeMobile}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
          {user ? (
            <>
              <li>
                <Link to={dashboardPath} onClick={closeMobile}>
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#logout"
                  onClick={(e) => {
                    e.preventDefault();
                    void handleLogout();
                  }}
                >
                  Logout
                </a>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" onClick={closeMobile}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
