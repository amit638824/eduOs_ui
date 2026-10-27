import PageBanner from '@/components/eduleb/PageBanner';

export default function ContactPage() {
  return (
    <>
      <PageBanner title="Contact" crumb="Contact" />
      <section className="contact_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 col-sm-12 col-xs-12">
              <div className="contact_info">
                <h4>Contact Info</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae risus nec dui
                  venenatis dignissim.
                </p>
                <div className="sf_contact">
                  <span className="ti-map" />
                  <p>2570 Quadra Street Victoria Road, New York, Canada</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile" />
                  <p>+88 457 845 695</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email" />
                  <p>example@yourmail.com</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-sm-12 col-xs-12">
              <div className="contact">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row">
                    <div className="form-group col-md-6">
                      <input type="text" className="form-control" placeholder="Name" required />
                    </div>
                    <div className="form-group col-md-6">
                      <input type="email" className="form-control" placeholder="Email" required />
                    </div>
                    <div className="form-group col-md-12">
                      <input type="text" className="form-control" placeholder="Subject" />
                    </div>
                    <div className="form-group col-md-12">
                      <textarea className="form-control" rows={6} placeholder="Message" required />
                    </div>
                    <div className="col-md-12 text-center">
                      <button type="submit" className="btn_one">
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
