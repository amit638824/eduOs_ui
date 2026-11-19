import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const courses = [
  {
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    tag: 'Govt IT',
    title: 'CCC (Course on Computer Concepts) Comprehensive Mock Exam',
    lessons: '100 Questions',
    duration: '90 Mins',
    price: 'Free Practice',
  },
  {
    img: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80',
    tag: 'Hardware',
    title: 'PC Hardware & Network Engineering Certification Exam',
    lessons: '80 Questions',
    duration: '60 Mins',
    price: 'Free Practice',
  },
  {
    img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80',
    tag: 'Govt IT',
    title: 'O Level (M1-R5) Information Technology Tools Practice Paper',
    lessons: '100 Questions',
    duration: '120 Mins',
    price: 'Free Practice',
  },
  {
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    tag: 'Software',
    title: 'Advanced Computer Applications & Office Automation Test',
    lessons: '60 Questions',
    duration: '45 Mins',
    price: 'Free Practice',
  },
  {
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    tag: 'Coding',
    title: 'Python Programming & Problem Solving Skill Assessment',
    lessons: '50 Questions',
    duration: '60 Mins',
    price: '₹49.00',
  },
  {
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    tag: 'Aptitude',
    title: 'Quantitative Aptitude & Logical Reasoning Mock Challenge',
    lessons: '75 Questions',
    duration: '75 Mins',
    price: 'Free Practice',
  },
];

export default function CoursePage() {
  return (
    <>
      <PageBanner title="Online Mock Tests & Exams" crumb="Examinations" />
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            {courses.map((course) => (
              <div key={course.title} className="col-lg-4 col-sm-6 col-xs-12">
                <div className="single_course">
                  <div className="single_c_img">
                    <img src={course.img} className="img-fluid" alt={course.title} />
                    <span>{course.tag}</span>
                  </div>
                  <div className="my-2" style={{ color: '#f59e0b' }}>
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                  </div>
                  <h4>
                    <Link to="/exams">{course.title}</Link>
                  </h4>
                  <p>
                    <span className="ti-book"> </span> {course.lessons}
                  </p>
                  <p>
                    <span className="ti-alarm-clock"> </span>
                    {course.duration}
                  </p>
                  <div className="price">{course.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
