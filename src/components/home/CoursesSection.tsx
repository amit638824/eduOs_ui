import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackCourses = [
  {
    img: '/eduleb/img/course/1.png',
    tag: 'Education',
    title: 'Complete User fundamentals beginners to advanced',
    lessons: '12 Course',
    duration: '2 Hrs 32 Min',
    price: 'Course Fee - 99$',
  },
  {
    img: '/eduleb/img/course/2.png',
    tag: 'UI/UX',
    title: 'Advanced Android 12 & Kotlin Development Course',
    lessons: '41 Course',
    duration: '3 Hrs 32 Min',
    price: 'Course Fee - 49$',
  },
  {
    img: '/eduleb/img/course/3.png',
    tag: 'Lifestyle',
    title: 'Complete HTML, CSS and Javascript Course',
    lessons: '32 Course',
    duration: '2 Hrs 32 Min',
    price: 'Course Fee - Free',
  },
  {
    img: '/eduleb/img/course/4.png',
    tag: 'Science',
    title: 'IOS and Swift Complete iOS Application Development',
    lessons: '19 Course',
    duration: '2 Hrs 32 Min',
    price: 'Course Fee - 59$',
  },
  {
    img: '/eduleb/img/course/5.png',
    tag: 'Modern',
    title: 'Learn graphics design with a best IT Trainer',
    lessons: '22 Course',
    duration: '2 Hrs 32 Min',
    price: 'Course Fee - 79$',
  },
  {
    img: '/eduleb/img/course/6.png',
    tag: 'Marketing',
    title: 'Complete data science for your next business',
    lessons: '11 Course',
    duration: '2 Hrs 32 Min',
    price: 'Course Fee - 39$',
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
                {content?.title || 'Join with more than 80,000+ Courses & Learning creators.'}
              </h2>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6 col-xs-12" data-aos="fade-left" data-aos-delay="150">
            <div className="cour_btn text-lg-end">
              <Link to={content?.cta.href || '/exams'} className="btn_one">
                {content?.cta.label || 'View all Courses'} <i className="ti-arrow-top-right" />
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
                  <img src={course.img} className="img-fluid" alt="course-image" />
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
