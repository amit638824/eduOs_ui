import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <div className="footer section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single_footer">
                <Link to="/">
                  <img src="/img/logo/techwagger-logo.png" alt="Techwagger - Mindsprint" />
                </Link>
                <p>
                  Mindsprint is a next-generation online examination, CBT mock test, and e-assessment
                  platform with AI anti-cheat proctoring and verified digital certifications.
                </p>
                <div className="social_profile">
                  <ul>
                    <li>
                      <a className="f_facebook" href="https://twitter.com/techwagger" target="_blank" rel="noreferrer" aria-label="Twitter">
                        <i className="fa-solid fa-x" />
                      </a>
                    </li>
                    <li>
                      <a className="f_twitter" href="https://facebook.com/techwagger" target="_blank" rel="noreferrer" aria-label="Facebook">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a className="f_instagram" href="https://instagram.com/techwagger" target="_blank" rel="noreferrer" aria-label="Instagram">
                        <i className="fa-brands fa-instagram" />
                      </a>
                    </li>
                    <li>
                      <a className="f_linkedin" href="https://linkedin.com/company/techwagger" target="_blank" rel="noreferrer" aria-label="LinkedIn">
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
                    <Link to="/schools">For Institutes</Link>
                  </li>
                  <li>
                    <Link to="/pricing">Pricing Plans</Link>
                  </li>
                  <li>
                    <Link to="/faq">Frequently Asked</Link>
                  </li>
                  <li>
                    <Link to="/contact">Contact Support</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Popular Exams</h4>
                <ul>
                  <li>
                    <Link to="/exams">Hardware &amp; Network</Link>
                  </li>
                  <li>
                    <Link to="/exams">CCC &amp; O Level</Link>
                  </li>
                  <li>
                    <Link to="/exams">Computer Applications</Link>
                  </li>
                  <li>
                    <Link to="/exams">Programming &amp; Code</Link>
                  </li>
                  <li>
                    <Link to="/exams">Aptitude &amp; Reasoning</Link>
                  </li>
                  <li>
                    <Link to="/exams">Diploma Assessments</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Contact Info</h4>
                <div className="sf_contact">
                  <span className="ti-map" />
                  <p>L-3/141, Vinay Khand, Gomti Nagar, Lucknow, Uttar Pradesh – 226010, India</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile" />
                  <p> +91 8840 622 729</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile" />
                  <p>
                    <a href="https://wa.me/918840622729" target="_blank" rel="noreferrer">Contact via WhatsApp</a>
                  </p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email" />
                  <p>connect@techwagger.com</p>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Mobile Testing</h4>
                <p>Attempt mock tests and check scorecards anytime on mobile.</p>
                <Link to="/exams">
                  <img src="/eduleb/img/google-play.jpg" className="foot_img" alt="Google Play" />
                </Link>
                <Link to="/exams">
                  <img src="/eduleb/img/app-store.jpg" className="foot_img" alt="App Store" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="foot_copy">
        <div className="footer_copyright">
          <p>
            &copy; {new Date().getFullYear()} Mindsprint — Enterprise Online Examination Platform. Techwagger Solutions Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </>
  );
}
