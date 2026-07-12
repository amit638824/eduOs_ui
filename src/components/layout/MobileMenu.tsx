import { Link } from 'react-router-dom';
import { mainNavigation } from '@/data/navigation';
import { siteContent } from '@/data/siteContent';

export default function MobileMenu() {
  const { social } = siteContent;

  return (
    <div className="mobile-off-canvas-active">
      <a className="mobile-aside-close" href="#">
        <i className="icofont icofont-close-line" />
      </a>
      <div className="header-mobile-aside-wrap">
        <div className="mobile-search">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Search practice tests…" />
            <button type="submit" className="button-search">
              <i className="icofont icofont-search-2" />
            </button>
          </form>
        </div>

        <div className="mobile-menu-wrap headerarea">
          <div className="mobile-navigation">
            <nav>
              <ul className="mobile-menu">
                {mainNavigation.map((item) => (
                  <li
                    key={item.href}
                    className={item.children ? 'menu-item-has-children' : undefined}
                  >
                    <Link to={item.href}>{item.label}</Link>
                    {item.children && (
                      <ul className="dropdown">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link to={child.href}>{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mobile-curr-lang-wrap">
          <div className="single-mobile-curr-lang">
            <a className="mobile-account-active" href="#">
              My Account <i className="icofont-thin-down" />
            </a>
            <div className="lang-curr-dropdown account-dropdown-active">
              <ul>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Create Account</Link>
                </li>
                <li>
                  <Link to="/dashboard/student-dashboard">Student Dashboard</Link>
                </li>
                <li>
                  <Link to="/dashboard/teacher-dashboard">Teacher Dashboard</Link>
                </li>
                <li>
                  <Link to="/dashboard/admin-dashboard">Admin Panel</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mobile-social-wrap">
          {social.map((item) => (
            <a key={item.platform} className={item.platform.toLowerCase()} href={item.href}>
              <i className={`icofont ${item.icon}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
