import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

export default function AboutSection({ content }: { content?: HomepageContent['about'] }) {
  const paragraphs = content?.paragraphs?.length
    ? content.paragraphs
    : [
        'We offer a brand new approach to the most basic learning paradigms. Choose from a wide range of learning options and gain new skills! Our school is know.',
        'We offer a brand new approach to the most basic learning paradigms. Choose from a wide range of learning options and gain new skills! Our school is know.',
      ];
  const points = content?.points?.length
    ? content.points
    : [
        'Get access to 12,000+ of our top courses',
        'Popular topic to learn now in our online courses for student',
        'Find the right instructor for you',
      ];
  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-duration="900">
            <div className="ab_img eduleb-hover-lift" data-aos="zoom-in" data-aos-delay="150">
              <img src={content?.image || '/eduleb/img/about1.png'} className="img-fluid" alt="image" />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left" data-aos-duration="900">
            <div className="ab_content">
              <h2 data-aos="fade-up" data-aos-delay="100">
                {content?.title || 'We Are Providing The Online Course In Global World'}
              </h2>
              {paragraphs.map((text, index) => (
                <p key={text} data-aos="fade-up" data-aos-delay={150 + index * 50}>
                  {text}
                </p>
              ))}
              <ul>
                {points.map((point, index) => (
                  <li key={point} data-aos="fade-up" data-aos-delay={250 + index * 50}>
                    <span className="ti-check" /> {point}
                  </li>
                ))}
              </ul>
              <div data-aos="fade-up" data-aos-delay="400">
                <Link className="btn_one" to={content?.cta.href || '/exams'}>
                  {content?.cta.label || 'View All Courses'} <i className="ti-arrow-top-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
