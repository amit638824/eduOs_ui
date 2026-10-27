import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const courses = [
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

export default function CoursePage() {
  return (
    <>
      <PageBanner title="All Course" crumb="Course" />
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            {courses.map((course) => (
              <div key={course.title} className="col-lg-4 col-sm-6 col-xs-12">
                <div className="single_course">
                  <div className="single_c_img">
                    <img src={course.img} className="img-fluid" alt="course-image" />
                    <span>{course.tag}</span>
                  </div>
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <h4>
                    <Link to="/course-details">{course.title}</Link>
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
