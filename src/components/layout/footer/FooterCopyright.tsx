import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function FooterCopyright() {
  const { brand, footer } = siteContent;

  return (
    <div className="footerarea__copyright__wrapper footerarea__copyright__wrapper__2">
      <div className="row">
        <div className="col-xl-3 col-lg-3">
          <div className="copyright__logo">
            <Link to="/">
              <img loading="lazy" src={brand.logoFooter} alt={brand.name} height={40} />
            </Link>
          </div>
        </div>
        <div className="col-xl-6 col-lg-6">
          <div className="footerarea__copyright__content footerarea__copyright__content__2">
            <p>
              Copyright © <span>{footer.copyright.year}</span> {footer.copyright.brand}. All
              Rights Reserved. {footer.copyright.product}.
            </p>
          </div>
        </div>
        <div className="col-xl-3 col-lg-3">
          <div className="footerarea__icon footerarea__icon__2">
            <ul>
              {footer.social.map((item) => (
                <li key={item.platform}>
                  <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.platform}>
                    <i className={item.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
