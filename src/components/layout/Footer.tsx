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
                  <img src="/img/logo/techwagger-logo.png" alt="Techwagger" />
                </Link>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae risus nec dui
                  venenatis dignissim.
                </p>
                <div className="social_profile">
                  <ul>
                    <li>
                      <a className="f_facebook" href="#">
                        <i className="fa-solid fa-x" />
                      </a>
                    </li>
                    <li>
                      <a className="f_twitter" href="#">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a className="f_instagram" href="#">
                        <i className="fa-brands fa-instagram" />
                      </a>
                    </li>
                    <li>
                      <a className="f_linkedin" href="#">
                        <i className="fa-brands fa-linkedin-in" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>About Mindsprint</h4>
                <ul>
                  <li>
                    <Link to="/about">About us</Link>
                  </li>
                  <li>
                    <Link to="/login">Instructor Login</Link>
                  </li>
                  <li>
                    <Link to="/login">Become A Teacher</Link>
                  </li>
                  <li>
                    <Link to="/about">All Instrustors</Link>
                  </li>
                  <li>
                    <Link to="/help">Asked Question</Link>
                  </li>
                  <li>
                    <Link to="/help">Contact us</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-xs-12">
              <div className="single_footer">
                <h4>Popular Courese</h4>
                <ul>
                  <li>
                    <Link to="/exams">Development</Link>
                  </li>
                  <li>
                    <Link to="/exams">Arts &amp; design</Link>
                  </li>
                  <li>
                    <Link to="/exams">Visual Design</Link>
                  </li>
                  <li>
                    <Link to="/exams">Graphic Design</Link>
                  </li>
                  <li>
                    <Link to="/exams">Code Inspection</Link>
                  </li>
                  <li>
                    <Link to="/exams">Digital Marketing</Link>
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
                    <a href="tel: +91 8840 622 729">Contact Whatsapp</a>
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
                <h4>Download App</h4>
                <p>Download our app from app store and goole play store.</p>
                <Link to="/">
                  <img src="/eduleb/img/google-play.jpg" className="foot_img" alt="Google Play" />
                </Link>
                <Link to="/">
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
            &copy; 2024. Mindsprint. All Rights Reserved.
          </p>
        </div>
      </div>
    </>
  );
}
