import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import { resolveHeaderNavigation } from '@/data/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';
import HamburgerIcon from '@/components/ui/HamburgerIcon';

export default function Header() {
  const { brand } = siteContent;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isDashboard = pathname.startsWith('/dashboard');
  const headerVariant = isDashboard ? 'headerarea__3' : 'headerarea__2';
  const dashboardPath = user ? getDefaultDashboardPath(user.roles) : '/login';
  const navItems = resolveHeaderNavigation(user, pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header>
      <div className={`headerarea ${headerVariant} header__sticky header__area`}>
        <div className="container desktop__menu__wrapper">
          <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-6">
              <div className="headerarea__left">
                <div className="headerarea__left__logo">
                  <Link to={user ? dashboardPath : '/'}>
                    <img loading="lazy" src={brand.logo} alt={brand.name} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-xl-7 col-lg-7 main_menu_wrap">
              <div className="headerarea__main__menu">
                <nav>
                  <ul>
                    {navItems.map((item) => (
                      <li key={`${item.href}-${item.label}`}>
                        <NavLink to={item.href} end={item.href === '/'}>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-6">
              <div className="headerarea__right">
                {user ? (
                  <>
                    <div className="headerarea__login">
                      <Link to={dashboardPath} title="Go to dashboard">
                        {user.firstName}
                      </Link>
                    </div>
                    <div className="headerarea__button">
                      <button type="button" className="default__button header-logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="headerarea__login">
                      <Link to="/login">Login</Link>
                    </div>
                    <div className="headerarea__button">
                      <Link className="default__button" to="/register">
                        Sign Up Free
                      </Link>
                    </div>
                  </>
                )}
                <div className="mobile-off-canvas">
                  <a className="mobile-aside-button sca-hamburger-btn" href="#" aria-label="Open menu">
                    <HamburgerIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
