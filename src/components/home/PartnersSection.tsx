const logos = [
  '/eduleb/img/clients/1.png',
  '/eduleb/img/clients/2.png',
  '/eduleb/img/clients/3.png',
  '/eduleb/img/clients/4.png',
  '/eduleb/img/clients/5.png',
  '/eduleb/img/clients/6.png',
];

export default function PartnersSection() {
  return (
    <div className="partner-logo section-padding" data-aos="fade-up">
      <div className="container">
        <div className="row part_bg align-items-center">
          <div className="col-lg-4 col-sm-4 col-xs-12">
            <div className="partner_title">
              <h3>
                Helping <span>86,000+</span> global companies take the gloves off
              </h3>
            </div>
          </div>
          <div className="col-lg-8 col-sm-8 col-xs-12 text-center">
            <div className="partner">
              {logos.map((src) => (
                <a key={src} href="#" className="eduleb-hover-lift">
                  <img src={src} alt="partner" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
