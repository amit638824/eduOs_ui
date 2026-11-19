import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <div className="footer section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_footer">
                <Link
                  to="/"
                  style={{
                    display: 'inline-block',
                    marginBottom: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src="/img/logo/techwagger-logo-light.png"
                    alt="Techwagger"
                    style={{
                      maxHeight: '60px',
                      height: '60px',
                      width: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      marginBottom: '0',
                    }}
                  />
                </Link>
                <p style={{ marginTop: '8px', marginBottom: '16px' }}>
                  Mindsprint is a next-generation online examination, CBT mock test, and e-assessment
                  platform with AI anti-cheat proctoring and verified digital certifications.
                </p>
                <div className="social_profile">
                  <ul
                    className="footer-social-list"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      gap: '12px',
                      margin: '16px 0 0',
                      padding: 0,
                      listStyle: 'none',
                    }}
                  >
                    <li style={{ display: 'inline-flex', width: 'auto', margin: 0 }}>
                      <a href="https://twitter.com/techwagger" target="_blank" rel="noreferrer" aria-label="Twitter">
                        <i className="fa-solid fa-x" />
                      </a>
                    </li>
                    <li style={{ display: 'inline-flex', width: 'auto', margin: 0 }}>
                      <a href="https://facebook.com/techwagger" target="_blank" rel="noreferrer" aria-label="Facebook">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li style={{ display: 'inline-flex', width: 'auto', margin: 0 }}>
                      <a href="https://instagram.com/techwagger" target="_blank" rel="noreferrer" aria-label="Instagram">
                        <i className="fa-brands fa-instagram" />
                      </a>
                    </li>
                    <li style={{ display: 'inline-flex', width: 'auto', margin: 0 }}>
                      <a href="https://linkedin.com/company/techwagger" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <i className="fa-brands fa-linkedin-in" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Platform Links</h4>
                <ul>
                  <li>
                    <Link to="/about">About Platform</Link>
                  </li>
                  <li>
                    <Link to="/exams">Practice Tests</Link>
                  </li>
                  <li>
                    <Link to="/pricing">Pricing Plans</Link>
                  </li>
                  {/* <li>
                    <Link to="/faq">Frequently Asked</Link>
                  </li> */}
                  <li>
                    <Link to="/contact">Contact Support</Link>
                  </li>
                  <li>
                    <Link to="/login?as=instructor">Instructor Login</Link>
                  </li>
                  <li>
                    <Link to="/login?as=teacher">Become A Teacher</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Popular Exams</h4>
                <ul>
                  <li>
                    <Link to="/exams/hardware-networking">Hardware &amp; Network</Link>
                  </li>
                  <li>
                    <Link to="/exams/govt-it">CCC &amp; O Level</Link>
                  </li>
                  <li>
                    <Link to="/exams/computer-application">Computer Applications</Link>
                  </li>
                  <li>
                    <Link to="/exams/programming">Programming &amp; Code</Link>
                  </li>
                  <li>
                    <Link to="/exams">Aptitude &amp; Reasoning</Link>
                  </li>
                  <li>
                    <Link to="/exams/diploma">Diploma Assessments</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Contact Info</h4>
                <div className="sf_contact" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span className="sf_icon">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=L-3%2F141%2C+Vinay+Khand%2C+Gomti+Nagar%2C+Lucknow%2C+Uttar+Pradesh+%E2%80%93+226010%2C+India"
                      target="_blank"
                      rel="noreferrer"
                    >
                      L-3/141, Vinay Khand, Gomti Nagar, Lucknow, UP – 226010
                    </a>
                  </p>
                </div>
                <div className="sf_contact" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span className="sf_icon">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>
                    <a href="tel:+918840622729">+91 8840 622 729</a>
                  </p>
                </div>

                <div className="sf_contact" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span className="sf_icon">
                    <i className="fa-solid fa-envelope" />
                  </span>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>
                    <a href="mailto:Vivek@techwagger.com">Vivek@techwagger.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="foot_copy">
        <div className="container">
          <div className="footer_copyright text-center py-3">
            <p className="m-0" style={{ fontSize: '13px', color: '#93a2c2' }}>
              &copy; {new Date().getFullYear()} Techwagger Solutions Pvt. Ltd. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
