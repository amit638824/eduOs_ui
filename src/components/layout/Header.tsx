import { Link, NavLink } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import { mainNavigation } from '@/data/navigation';

export default function Header() {
  const { brand } = siteContent;

  return (
    <header>
      <div className="headerarea headerarea__2 header__sticky header__area">
        <div className="container desktop__menu__wrapper">
          <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-6">
              <div className="headerarea__left">
                <div className="headerarea__left__logo">
                  <Link to="/">
                    <img loading="lazy" src={brand.logo} alt={brand.name} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-xl-7 col-lg-7 main_menu_wrap">
              <div className="headerarea__main__menu">
                <nav>
                  <ul>
                    {mainNavigation.map((item) => (
                      <li key={item.href}>
                        {item.children ? (
                          <>
                            <Link className="headerarea__has__dropdown" to={item.href}>
                              {item.label}
                              <i className="icofont-rounded-down" />
                            </Link>
                            <ul className="headerarea__submenu">
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <Link to={child.href}>
                                    {child.label}
                                    {child.badge && (
                                      <span className="mega__menu__label">{child.badge}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <NavLink to={item.href} end={item.href === '/'}>
                            {item.label}
                          </NavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-6">
              <div className="headerarea__right">
                <div className="headerarea__login">
                  <Link to="/login">Login</Link>
                </div>
                <div className="headerarea__button">
                  <Link className="default__button" to="/register">
                    Sign Up Free
                  </Link>
                </div>
                <div className="mobile-off-canvas">
                  <a className="mobile-aside-button" href="#">
                    <i className="icofont-navigation-menu" />
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
