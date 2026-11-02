import type { HomepageContent } from '@/types/homepage';

const fallbackInstructors = [
  {
    img: '/eduleb/img/team/team1.jpg',
    name: 'Prof. Rajesh Sharma',
    role: 'Head of IT & Computer Examinations',
    courses: '45+ Tests',
    students: '12,500+ Assessed',
  },
  {
    img: '/eduleb/img/team/team2.jpg',
    name: 'Dr. Priya Verma',
    role: 'Aptitude & Competitive Exam Specialist',
    courses: '60+ Tests',
    students: '18,200+ Assessed',
  },
  {
    img: '/eduleb/img/team/team3.jpg',
    name: 'Er. Amit Srivastava',
    role: 'Software & Coding Assessment Lead',
    courses: '35+ Tests',
    students: '9,800+ Assessed',
  },
  {
    img: '/eduleb/img/team/team4.jpg',
    name: 'Sunita Mishra',
    role: 'Govt IT & NIELIT Certification Mentor',
    courses: '50+ Tests',
    students: '15,000+ Assessed',
  },
];

export default function InstructorsSection({ content }: { content?: HomepageContent['instructors'] }) {
  const instructors = content?.items?.length ? content.items : fallbackInstructors;
  return (
    <section className="team_area section-padding">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">{content?.title || 'Our Examination Faculty & Assessment Experts'}</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            {content?.description ||
              'Our question papers and mock tests are designed, peer-reviewed, and verified by certified educators and industry leaders.'}
          </p>
        </div>
        <div className="row">
          {instructors.map((ins, index) => (
            <div
              key={ins.name}
              className="col-lg-3 col-sm-6 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <div className="our-team eduleb-hover-lift">
                <div className="team-content" data-aos="zoom-in" data-aos-delay={index * 120 + 80}>
                  <a href="#">
                    <img src={ins.img} alt={ins.name} />
                  </a>
                  <ul className="social-links">
                    <li>
                      <a href="#">
                        <i className="fa-solid fa-x" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-linkedin-in" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="team-prof">
                  <h3>{ins.name}</h3>
                  <span>{ins.role}</span>
                </div>
                <div className="sth_det2">
                  <span className="ti-file">
                    {' '}
                    <u>{ins.courses}</u>
                  </span>
                  <span className="ti-user">
                    {' '}
                    <u>{ins.students}</u>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
