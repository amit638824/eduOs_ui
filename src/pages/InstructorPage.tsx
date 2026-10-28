import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const instructors = [
  { img: 'team1.jpg', name: 'Bilkis Vabi', role: 'Web designer', courses: '04', students: '27' },
  { img: 'team2.jpg', name: 'Mood Wasim', role: 'TemplateMonster company', courses: '06', students: '41' },
  { img: 'team3.jpg', name: 'Shyinn tim', role: 'Codecanyou', courses: '13', students: '31' },
  { img: 'team4.jpg', name: 'Shorif shorifa', role: 'Tsc chottor', courses: '07', students: '24' },
];

export default function InstructorPage() {
  return (
    <>
      <PageBanner title="Instructor" crumb="Instructor" />
      <section className="team_area section-padding">
        <div className="container">
          <div className="row">
            {instructors.map((t) => (
              <div key={t.name} className="col-lg-3 col-sm-6 col-xs-12">
                <div className="our-team">
                  <div className="team-content">
                    <Link to="/instructor-details-page">
                      <img src={`/eduleb/img/team/${t.img}`} alt="" />
                    </Link>
                    <ul className="social-links">
                      <li>
                        <a href="#0">
                          <i className="fa-solid fa-x" />
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          <i className="fa-brands fa-facebook-f" />
                        </a>
                      </li>
                      <li>
                        <a href="#0">
                          <i className="fa-brands fa-linkedin-in" />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="team-prof">
                    <h3>{t.name}</h3>
                    <span>{t.role}</span>
                  </div>
                  <div className="sth_det2">
                    <span className="ti-file">
                      {' '}
                      <u>{t.courses} Course</u>
                    </span>
                    <span className="ti-user">
                      {' '}
                      <u>{t.students} Student</u>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
