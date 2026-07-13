import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import type { ExamCategorySlug } from '@/utils/routes';

const categoryFilterMap: Record<ExamCategorySlug, string> = {
  'hardware-networking': 'filter-hardware',
  'computer-application': 'filter-software',
  diploma: 'filter-diploma',
  'govt-it': 'filter-govt',
  programming: 'filter-cert',
  certification: 'filter-cert',
};

export default function ExamGridSection({ activeCategory }: { activeCategory?: ExamCategorySlug }) {
  const { exams } = siteContent;
  const items = activeCategory
    ? exams.items.filter((exam) => exam.filterClass === categoryFilterMap[activeCategory])
    : exams.items;

  return (
    <div className="gridarea gridarea__2">
      <div className="container">
        <div className="row grid__row">
          <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12" data-aos="fade-up">
            <div className="section__title__2">
              <div className="section__title__button">
                <div className="default__small__button">{exams.badge}</div>
              </div>
              <div className="section__title__heading__2 section__title__heading__3 heading__fontsize__2">
                <h2>{exams.title}</h2>
              </div>
            </div>
          </div>
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12" data-aos="fade-up">
            <div className="gridfilter_nav grid__filter__2 gridFilter">
              {exams.filters.map((filter, index) => (
                <button
                  key={filter.filter}
                  type="button"
                  className={index === 0 ? 'active' : ''}
                  data-filter={filter.filter}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row grid" data-aos="fade-up">
          {items.map((exam) => (
            <div
              key={exam.id}
              className={`col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 grid-item ${exam.filterClass}`}
            >
              <div className="gridarea__wraper">
                <div className="gridarea__img">
                  <Link to={`/exams/${exam.id}`}>
                    <img loading="lazy" src={exam.image} alt={exam.title} />
                  </Link>
                  <div className="gridarea__small__button">
                    <div className={`grid__badge ${exam.badgeColor ?? ''}`.trim()}>{exam.badge}</div>
                  </div>
                  <div className="gridarea__small__icon">
                    <a href="#">
                      <i className="icofont-heart-alt" />
                    </a>
                  </div>
                </div>
                <div className="gridarea__content">
                  <div className="gridarea__list">
                    <ul>
                      <li>
                        <i className="icofont-book-alt" /> {exam.lessons} Sections
                      </li>
                      <li>
                        <i className="icofont-clock-time" /> {exam.duration}
                      </li>
                    </ul>
                  </div>
                  <div className="gridarea__heading">
                    <h3>
                      <Link to={`/exams/${exam.id}`}>{exam.title}</Link>
                    </h3>
                  </div>
                  <div className="gridarea__price">
                    {exam.price}
                    {exam.originalPrice && (
                      <>
                        {' '}
                        <del>/{exam.originalPrice}</del>
                      </>
                    )}
                  </div>
                  <div className="gridarea__bottom">
                    <Link to="/dashboard/teacher-dashboard">
                      <div className="gridarea__small__img">
                        <img loading="lazy" src={exam.instructorImg} alt={exam.instructor} />
                        <div className="gridarea__small__content">
                          <h6>{exam.instructor}</h6>
                        </div>
                      </div>
                    </Link>
                    <div className="gridarea__star">
                      {Array.from({ length: exam.rating }).map((_, i) => (
                        <i key={i} className="icofont-star" />
                      ))}
                      <span>({exam.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
