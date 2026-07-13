import { Link } from 'react-router-dom';
import type { DashboardCourseItem } from '@/data/dashboardData';

export function DashboardFilterRow() {
  return (
    <div className="row">
      <div className="col-xl-6 col-lg-4 col-md-4 col-12">
        <div className="dashboard__select__heading">
          <span>Courses</span>
        </div>
        <div className="dashboard__selector">
          <select className="form-select" defaultValue="all">
            <option value="all">All</option>
            <option value="hardware">Hardware & Networking</option>
            <option value="software">Computer Application</option>
            <option value="diploma">Diploma Course</option>
            <option value="govt">CCC / O Level</option>
          </select>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-4 col-12">
        <div className="dashboard__select__heading">
          <span>SORT BY</span>
        </div>
        <div className="dashboard__selector">
          <select className="form-select" defaultValue="default">
            <option value="default">Default</option>
            <option value="trending">Trending</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-4 col-12">
        <div className="dashboard__select__heading">
          <span>SORT BY OFFER</span>
        </div>
        <div className="dashboard__selector">
          <select className="form-select" defaultValue="free">
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function DashboardStarRating({ count }: { count: number }) {
  return (
    <div className="dashboard__table__star">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="icofont-star" />
      ))}
    </div>
  );
}

export function DashboardCourseCard({ course }: { course: DashboardCourseItem }) {
  return (
    <div className="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12 sp_bottom_20">
      <div className="gridarea__wraper">
        <div className="gridarea__img">
          <Link to="/exams">
            <img loading="lazy" src={course.img} alt={course.title} />
          </Link>
          <div className="gridarea__small__button">
            <div className={`grid__badge ${course.badgeClass ?? ''}`.trim()}>{course.badge}</div>
          </div>
          {course.showHeart && (
            <div className="gridarea__small__icon">
              <a href="#!" onClick={(e) => e.preventDefault()}>
                <i className="icofont-heart-alt" />
              </a>
            </div>
          )}
        </div>
        <div className="gridarea__content">
          <div className="gridarea__list">
            <ul>
              <li>
                <i className="icofont-book-alt" /> {course.lessons}
              </li>
              <li>
                <i className="icofont-clock-time" /> {course.duration}
              </li>
            </ul>
          </div>
          <div className="gridarea__heading">
            <h3>
              <Link to="/exams">{course.title}</Link>
            </h3>
          </div>
          <div className={`gridarea__price${course.free ? ' green__color' : ''}`}>
            {course.price}
            {course.originalPrice && <del>{course.originalPrice}</del>}
            {course.free && <span>.Free</span>}
          </div>
          <div className="gridarea__bottom">
            <a href="#!" onClick={(e) => e.preventDefault()}>
              <div className="gridarea__small__img">
                <img loading="lazy" src={course.instructorImg} alt={course.instructor} />
                <div className="gridarea__small__content">
                  <h6>{course.instructor}</h6>
                </div>
              </div>
            </a>
            <div className="gridarea__star">
              {Array.from({ length: course.rating }).map((_, i) => (
                <i key={i} className="icofont-star" />
              ))}
              <span>({course.reviews})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTabButtons({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <ul className="nav about__button__wrap dashboard__button__wrap">
      {tabs.map((tab) => (
        <li key={tab} className="nav-item">
          <button
            type="button"
            className={`single__tab__link${active === tab ? ' active' : ''}`}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        </li>
      ))}
    </ul>
  );
}
