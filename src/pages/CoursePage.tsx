import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const courses = [
  {
    img: '/eduleb/img/course/1.png',
    tag: 'Govt IT',
    title: 'CCC (Course on Computer Concepts) Comprehensive Mock Exam',
    lessons: '100 Questions',
    duration: '90 Mins',
    price: 'Free Practice',
  },
  {
    img: '/eduleb/img/course/2.png',
    tag: 'Hardware',
    title: 'PC Hardware & Network Engineering Certification Exam',
    lessons: '80 Questions',
    duration: '60 Mins',
    price: 'Free Practice',
  },
  {
    img: '/eduleb/img/course/3.png',
    tag: 'Govt IT',
    title: 'O Level (M1-R5) Information Technology Tools Practice Paper',
    lessons: '100 Questions',
    duration: '120 Mins',
    price: 'Free Practice',
  },
  {
    img: '/eduleb/img/course/4.png',
    tag: 'Software',
    title: 'Advanced Computer Applications & Office Automation Test',
    lessons: '60 Questions',
    duration: '45 Mins',
    price: 'Free Practice',
  },
  {
    img: '/eduleb/img/course/5.png',
    tag: 'Coding',
    title: 'Python Programming & Problem Solving Skill Assessment',
    lessons: '50 Questions',
    duration: '60 Mins',
    price: '₹49.00',
  },
  {
    img: '/eduleb/img/course/6.png',
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
