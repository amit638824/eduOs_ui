import { siteContent } from '@/data/siteContent';

export default function FooterNewsletter() {
  const { newsletter } = siteContent.footer;

  return (
    <div className="footerarea__newsletter__wraper">
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
          <div className="footerarea__text">
            <h3>
              {newsletter.title} <span>{newsletter.titleHighlight}</span> ?
            </h3>
            <p>{newsletter.description}</p>
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
          <div className="footerarea__newsletter">
            <div className="footerarea__newsletter__input">
              <form action="#" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder={newsletter.placeholder} />
                <div className="footerarea__newsletter__button">
                  <button type="submit" className="subscribe__btn">
                    {newsletter.buttonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
