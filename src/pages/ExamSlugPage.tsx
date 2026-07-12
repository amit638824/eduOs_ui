import { Link, Navigate, useParams } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getExamCategoryTitle, isExamCategorySlug } from '@/utils/routes';
import ExamsPage from './ExamsPage';

export default function ExamSlugPage() {
  const { slug = '' } = useParams();
  const exam = siteContent.exams.items.find((item) => item.id === slug);

  if (exam) {
    return (
      <>
        <Breadcrumb title={exam.title} />
        <div className="course__details sp_top_100 sp_bottom_100">
          <div className="container">
            <div className="row">
              <div className="col-xl-8 col-lg-8">
                <div className="course__details__img">
                  <img loading="lazy" src={exam.image} alt={exam.title} />
                </div>
                <div className="course__details__heading">
                  <h3>{exam.title}</h3>
                  <p>{exam.category}</p>
                </div>
                <ul className="course__details__info">
                  <li>
                    <i className="icofont-book-alt" /> {exam.lessons} Sections
                  </li>
                  <li>
                    <i className="icofont-clock-time" /> {exam.duration}
                  </li>
                  <li>
                    <i className="icofont-star" /> {exam.rating} ({exam.reviews} reviews)
                  </li>
                </ul>
              </div>
              <div className="col-xl-4 col-lg-4">
                <div className="course__details__sidebar">
                  <div className="course__details__price">
                    <h4>{exam.price}</h4>
                    {exam.originalPrice && <del>{exam.originalPrice}</del>}
                  </div>
                  <div className="course__details__btn">
                    <Link className="default__button" to="/register">
                      Enroll Now
                    </Link>
                    <Link className="default__button" to="/exams">
                      Back to Tests
                    </Link>
                  </div>
                  <p>Instructor: {exam.instructor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isExamCategorySlug(slug)) {
    return <ExamsPage category={slug} title={getExamCategoryTitle(slug)} />;
  }

  return <Navigate to="/exams" replace />;
}
