import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackCourses = [
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

export default function CoursesSection({ content }: { content?: HomepageContent['courses'] }) {
  const courses = content?.items?.length ? content.items : fallbackCourses;
  return (
    <section className="home_course section-padding">
      <div className="container">
        <div className="row align-items-center mb-4">
          <div className="col-lg-8 col-sm-6 col-xs-12" data-aos="fade-right">
            <div className="section-title mb-0">
              <h2 data-aos="fade-up" data-aos-delay="100">
                {content?.title || 'Featured Online Mock Tests & Practice Examinations'}
              </h2>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6 col-xs-12" data-aos="fade-left" data-aos-delay="150">
            <div className="cour_btn text-lg-end">
              <Link to={content?.cta?.href || '/exams'} className="btn_one">
                {content?.cta?.label || 'View All Tests'} <i className="ti-arrow-top-right" />
              </Link>
            </div>
          </div>
        </div>
        <div className="row">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="col-lg-4 col-sm-6 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={(index % 3) * 120}
            >
              <div className="single_course eduleb-hover-lift">
                <div className="single_c_img" data-aos="zoom-in" data-aos-delay={(index % 3) * 120 + 80}>
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
  );
}
