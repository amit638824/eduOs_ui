import { siteContent } from '@/data/siteContent';

export default function TopBar() {
  const { contact, social } = siteContent;

  return (
    <div className="topbararea topbararea--2">
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-6">
            <div className="topbar__left">
              <ul>
                <li>Call Us: {contact.phone}</li>
                <li>- Mail Us: {contact.email}</li>
              </ul>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6">
            <div className="topbar__right">
              <div className="topbar__icon">
                <i className="icofont-location-pin" />
              </div>
              <div className="topbar__text">
                <p>{contact.address}</p>
              </div>
              <div className="topbar__list">
                <ul>
                  {social.map((item) => (
                    <li key={item.platform}>
                      <a href={item.href} target="_blank" rel="noreferrer">
                        <i className={item.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
