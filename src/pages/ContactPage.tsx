import PageBanner from '@/components/eduleb/PageBanner';
import { siteContent } from '@/data/siteContent';

export default function ContactPage() {
  const { contact } = siteContent;

  return (
    <>
      <PageBanner title="Contact" crumb="Contact" />
      <section className="contact_area section-padding eduleb-contact">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-5 col-sm-12 col-xs-12">
              <div className="contact_info">
                <h4>Contact Info</h4>
                <p>
                  Have a question about exams, courses, or institute onboarding? Reach out and our
                  team will get back to you shortly.
                </p>
                <div className="sf_contact">
                  <span className="ti-map" />
                  <p>{contact.address}</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile" />
                  <p>{contact.phone}</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email" />
                  <p>{contact.email}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-sm-12 col-xs-12">
              <div className="contact eduleb-contact-form">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row">
                    <div className="form-group col-md-6">
                      <input
                        type="text"
                        className="form-control eduleb-contact-input"
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <input
                        type="email"
                        className="form-control eduleb-contact-input"
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        className="form-control eduleb-contact-input"
                        placeholder="Subject"
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <textarea
                        className="form-control eduleb-contact-input eduleb-contact-textarea"
                        rows={6}
                        placeholder="Message"
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <button type="submit" className="btn_one eduleb-contact-btn">
                        Send Message <i className="ti-arrow-top-right" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
