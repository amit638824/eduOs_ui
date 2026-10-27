import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-duration="900">
            <div className="ab_img eduleb-hover-lift" data-aos="zoom-in" data-aos-delay="150">
              <img src="/eduleb/img/about1.png" className="img-fluid" alt="image" />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left" data-aos-duration="900">
            <div className="ab_content">
              <h2 data-aos="fade-up" data-aos-delay="100">
                We Are Providing The Online Course In Global World
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
        </div>
      </div>
    </section>
  );
}
