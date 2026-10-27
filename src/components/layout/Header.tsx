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
  { label: 'Course', href: '/course' },
  { label: 'Page', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const LOGO_SRC = '/img/logo/techwagger-logo.png';

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
                <Link to="/">
                  <img src={LOGO_SRC} alt="Techwagger" />
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

            <div className="col-20 d-none d-xl-block text-end align-self-center eduleb-nav-actions">
              {user ? (
                <>
                  <Link to={dashboardPath} className="header-btn">
                    Dashboard
                  </Link>
                  <button type="button" className="btn_one" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn_one eduleb-signin-btn">
                  Sign In
                </Link>
              )}
            </div>

            <div
              id="sm_menu_ham"
              className={mobileOpen ? 'open' : ''}
              onClick={() => setMobileOpen((v) => !v)}
              role="button"
              tabIndex={0}
              aria-label="Toggle menu"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setMobileOpen((v) => !v);
              }}
            >
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
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
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
