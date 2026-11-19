import type { HomepageContent } from '@/types/homepage';

const fallbackCourses = [
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

export default function CoursesSection({ content }: { content?: HomepageContent['courses'] }) {
  const courses = content?.items?.length ? content.items : fallbackCourses;
  return (
    <section className="home_course section-padding">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">
            {content?.title || 'Featured Online Mock Tests & Practice Examinations'}
          </h2>
          <p data-aos="fade-up" data-aos-delay="150">
            Prepare for top competitive exams, government certifications, and skill tests with real-time proctored mock assessments.
          </p>
        </div>
        <div className="row g-4 align-items-stretch">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="col-lg-4 col-sm-6 col-xs-12 d-flex"
              data-aos="fade-up"
              data-aos-delay={(index % 3) * 120}
            >
              <div className="single_course eduleb-hover-lift w-100 d-flex flex-column text-center">
                <div
                  className="single_c_img"
                  data-aos="zoom-in"
                  data-aos-delay={(index % 3) * 120 + 80}
                  style={{
                    height: '200px',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    borderRadius: '18px 18px 0 0',
                    margin: 0,
                  }}
                >
                  <img
                    src={course.img}
                    className="img-fluid"
                    alt={course.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <span style={{ background: '#3156d8', color: '#fff' }}>{course.tag}</span>
                </div>
                <div className="my-2 pt-3" style={{ color: '#f59e0b' }}>
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                  <i className="fa fa-star" />
                </div>
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    lineHeight: 1.4,
                    minHeight: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    margin: '0 0 12px',
                  }}
                >
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#14213d' }}>
                    {course.title}
                  </a>
                </h4>
                <div className="mb-3" style={{ fontSize: '13.5px', color: '#64718a' }}>
                  <span className="ti-book me-1" style={{ color: '#3156d8' }} /> {course.lessons}
                  <span className="mx-2">|</span>
                  <span className="ti-alarm-clock me-1" style={{ color: '#3156d8' }} /> {course.duration}
                </div>
                <div className="price mt-auto" style={{ borderTop: '1px solid #e8e8e9', padding: '12px 20px', color: '#3156d8', fontWeight: 700 }}>
                  {course.price}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row mt-5">
          <div className="col-12 text-center" data-aos="fade-up">
            <a href="#" onClick={(e) => e.preventDefault()} className="btn_one">
              {content?.cta?.label || 'View All Tests'} <i className="ti-arrow-top-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
