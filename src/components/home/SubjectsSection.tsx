import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function SubjectsSection() {
  const { subjects } = siteContent;
  const [leftCol, rightCol] = [subjects.items.slice(0, 2), subjects.items.slice(2, 4)];

  return (
    <div className="populerarea__2 sp_top_50 sp_bottom_50">
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 about__wrap__content" data-aos="fade-up">
            <div className="service__animate__shape__1">
              <img loading="lazy" src="/img/service/service__shape__1.png" alt="" />
            </div>
            <div className="populerarea__content__wraper__2">
              <div className="section__title">
                <div className="section__title__button">
                  <div className="default__small__button">{subjects.badge}</div>
                </div>
                <div className="section__title__heading">
                  <h2>
                    {subjects.title.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i === 0 && <br />}
                      </span>
                    ))}
                  </h2>
                </div>
              </div>
              <div className="populerarea__content__2">
                <p className="populerarea__para__1">{subjects.description}</p>
                <p className="populerarea__para__2">{subjects.secondaryDescription}</p>
              </div>
              <div className="populerarea__button__2">
                <Link className="default__button" to="/exams">
                  Explore All Exams
                  <i className="icofont-long-arrow-right" />
                </Link>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 service__wrap__content">
            <div className="service__animate__shape__2">
              <img loading="lazy" src="/img/service/service__shape__bg__1.png" alt="" />
            </div>
            <div className="row">
              {[leftCol, rightCol].map((col, colIndex) => (
                <div key={colIndex} className="col-xl-6 col-lg-6 col-md-6 col-sm-12" data-aos="fade-up">
                  {col.map((subject, index) => (
                    <div
                      key={subject.title}
                      className={`single__service${colIndex === 1 && index === 0 ? ' ss_margin' : ''}`}
                    >
                      <div className="service__img">
                        <i className={`service__icon ${subject.icon}`} style={{ fontSize: '2.5rem', color: '#5F2DED' }} />
                      </div>
                      <div className="service__content service__content__2">
                        <h3>
                          <Link to={subject.href}>{subject.title}</Link>
                        </h3>
                        <p>{subject.description}</p>
                      </div>
                      <div className="service__button">
                        <Link to={subject.href}>
                          View Exams
                          <i className="icofont-long-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
