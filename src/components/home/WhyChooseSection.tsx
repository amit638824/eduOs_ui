import { Link } from 'react-router-dom';

export default function WhyChooseSection() {
  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right">
            <div className="ab_content">
              <h2 data-aos="fade-up" data-aos-delay="100">
                Why Choose Us For Your Online Education Courses
              </h2>
              <p data-aos="fade-up" data-aos-delay="150">
                We offer a brand new approach to the most basic learning paradigms. Choose from a
                wide range of learning options and gain new skills! Our school is know.
              </p>
              <p data-aos="fade-up" data-aos-delay="200">
                We offer a brand new approach to the most basic learning paradigms. Choose from a
                wide range of learning options and gain new skills! Our school is know.
              </p>
              <ul>
                <li data-aos="fade-up" data-aos-delay="250">
                  <span className="ti-check" /> Get access to <b>12,000+</b> of our top courses
                </li>
                <li data-aos="fade-up" data-aos-delay="300">
                  <span className="ti-check" /> Popular topic to learn now in our online courses for
                  student
                </li>
                <li data-aos="fade-up" data-aos-delay="350">
                  <span className="ti-check" /> Find the right instructor for you
                </li>
              </ul>
              <div data-aos="fade-up" data-aos-delay="400">
                <Link className="btn_one" to="/exams">
                  View All Courses <i className="ti-arrow-top-right" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left">
            <div className="ab_img" data-aos="zoom-in" data-aos-delay="150">
              <img src="/eduleb/img/about3.png" className="img-fluid" alt="image" />
              <div className="home_ps2" data-aos="zoom-in" data-aos-delay="300">
                <span className="ti-book" />
                <h2>3300+</h2>
                <p>Online Course</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
