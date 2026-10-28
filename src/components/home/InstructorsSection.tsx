import type { HomepageContent } from '@/types/homepage';

const fallbackInstructors = [
  {
    img: '/eduleb/img/team/team1.jpg',
    name: 'Bilkis Vabi',
    role: 'Web designer',
    courses: '04 Course',
    students: '27 Student',
  },
  {
    img: '/eduleb/img/team/team2.jpg',
    name: 'Mood Wasim',
    role: 'TemplateMonster company',
    courses: '06 Course',
    students: '41 Student',
  },
  {
    img: '/eduleb/img/team/team3.jpg',
    name: 'Shyinn tim',
    role: 'Codecanyou',
    courses: '13 Course',
    students: '31 Student',
  },
  {
    img: '/eduleb/img/team/team4.jpg',
    name: 'Shorif shorifa',
    role: 'Tsc chottor',
    courses: '07 Course',
    students: '24 Student',
  },
];

export default function InstructorsSection({ content }: { content?: HomepageContent['instructors'] }) {
  const instructors = content?.items?.length ? content.items : fallbackInstructors;
  return (
    <section className="team_area section-padding">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">{content?.title || 'Meet our Instructors'}</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            {content?.description ||
              'We offer a brand new approach to the most basic learning paradigms. Choose from a wide range of learning options and gain new skills! Our school is know.'}
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
