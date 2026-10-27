import { Link } from 'react-router-dom';

export default function WhyChooseSection() {
  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-sm-12 col-xs-12">
            <div className="ab_content">
              <h2>Why Choose Us For Your Online Education Courses</h2>
              <p>
                We offer a brand new approach to the most basic learning paradigms. Choose from a
                wide range of learning options and gain new skills! Our school is know.
              </p>
              <p>
                We offer a brand new approach to the most basic learning paradigms. Choose from a
                wide range of learning options and gain new skills! Our school is know.
              </p>
              <ul>
                <li>
                  <span className="ti-check" /> Get access to <b>12,000+</b> of our top courses
                </li>
                <li>
                  <span className="ti-check" /> Popular topic to learn now in our online courses for
                  student
                </li>
                <li>
                  <span className="ti-check" /> Find the right instructor for you
                </li>
              </ul>
              <Link className="btn_one" to="/exams">
                View All Courses <i className="ti-arrow-top-right" />
              </Link>
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12">
            <div className="ab_img">
              <img src="/eduleb/img/about3.png" className="img-fluid" alt="image" />
              <div className="home_ps2">
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
