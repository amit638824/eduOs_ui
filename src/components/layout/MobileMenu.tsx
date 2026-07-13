import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resolveHeaderNavigation, buildAccountLinks } from '@/data/navigation';
import { siteContent } from '@/data/siteContent';
import { useAuth } from '@/context/AuthContext';
import { FormError, inputClassName } from '@/components/ui/FormField';
import HamburgerIcon from '@/components/ui/HamburgerIcon';
import { searchSchema, type SearchFormValues } from '@/validators/schemas';

export default function MobileMenu() {
  const { social } = siteContent;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navItems = resolveHeaderNavigation(user, pathname);
  const accountLinks = buildAccountLinks(user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: yupResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSearch = (values: SearchFormValues) => {
    navigate(`/exams?search=${encodeURIComponent(values.query)}`);
    reset();
  };

  const handleAccountAction = async (link: (typeof accountLinks)[number]) => {
    if (link.action === 'logout') {
      await logout();
      navigate('/login');
      return;
    }
    navigate(link.href);
  };

  return (
    <div className="mobile-off-canvas-active">
      <a className="mobile-aside-close sca-hamburger-btn sca-hamburger-btn--close" href="#" aria-label="Close menu">
        <HamburgerIcon open />
      </a>
      <div className="header-mobile-aside-wrap">
        <div className="mobile-search">
          <form className="search-form" onSubmit={handleSubmit(onSearch)} noValidate>
            <input
              type="text"
              placeholder="Search practice tests…"
              className={inputClassName('', !!errors.query)}
              {...register('query')}
            />
            <FormError message={errors.query?.message} />
            <button type="submit" className="button-search">
              <i className="icofont icofont-search-2" />
            </button>
          </form>
        </div>

        <div className="mobile-menu-wrap headerarea">
          <div className="mobile-navigation">
            <nav>
              <ul className="mobile-menu">
                {navItems.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <Link to={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mobile-curr-lang-wrap">
          <div className="single-mobile-curr-lang">
            <a className="mobile-account-active" href="#">
              {user ? `Hi, ${user.firstName}` : 'My Account'}{' '}
              <i className="icofont-thin-down" />
            </a>
            <div className="lang-curr-dropdown account-dropdown-active">
              <ul>
                {accountLinks.map((link) => (
                  <li key={link.label}>
                    {link.action === 'logout' ? (
                      <button
                        type="button"
                        className="dashboard-nav-logout mobile-account-logout"
                        onClick={() => handleAccountAction(link)}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
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
