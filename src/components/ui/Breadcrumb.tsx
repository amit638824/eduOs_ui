import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  title: string;
  items?: BreadcrumbItem[];
  variant?: 'default' | 'compact';
}

export default function Breadcrumb({
  title,
  items = [{ label: 'Home', href: '/' }],
  variant = 'default',
}: BreadcrumbProps) {
  const crumbs: BreadcrumbItem[] = [...items];
  if (crumbs[crumbs.length - 1]?.label !== title) {
    crumbs.push({ label: title });
  }

  const areaClass =
    variant === 'compact' ? 'breadcrumbarea breadcrumbarea--auth' : 'breadcrumbarea';

  return (
    <div className={areaClass}>
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="breadcrumb__content__wraper" data-aos="fade-up">
              <div className="breadcrumb__title">
                <h2 className="heading">{title}</h2>
              </div>
              <div className="breadcrumb__inner">
                <ul>
                  {crumbs.map((item, i) => (
                    <li key={`${item.label}-${i}`}>
                      {item.href && i < crumbs.length - 1 ? (
                        <Link to={item.href}>{item.label}</Link>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`shape__icon__2${variant === 'compact' ? ' shape__icon__2--compact' : ''}`}>
        <img loading="lazy" className="shape__icon__img shape__icon__img__1" src="/img/herobanner/herobanner__1.png" alt="" />
        <img loading="lazy" className="shape__icon__img shape__icon__img__2" src="/img/herobanner/herobanner__2.png" alt="" />
        <img loading="lazy" className="shape__icon__img shape__icon__img__3" src="/img/herobanner/herobanner__3.png" alt="" />
        <img loading="lazy" className="shape__icon__img shape__icon__img__4" src="/img/herobanner/herobanner__5.png" alt="" />
      </div>
    </div>
  );
}
