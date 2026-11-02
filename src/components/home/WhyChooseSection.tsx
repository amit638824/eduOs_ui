import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackParagraphs = [
  'Mindsprint eliminates the complexity of organizing offline examinations. Our cloud architecture scales from classroom quizzes to high-stakes state-level evaluations.',
  'With automated AI proctoring, instant multi-format question rendering, immediate scoring, and tamper-proof certificate generation, assessment integrity is guaranteed.',
];

const fallbackPoints = [
  'Smart AI Anti-Cheating & Fullscreen Lockdown Protection',
  'Instant Evaluation with Topic-Wise Accuracy & Percentile',
  'Curated Question Bank with LaTeX Math & Coding Questions',
  'Digitally Signed Certificates with QR Code Verification',
  'Multi-Branch & Role-Based Access for Educational Organizations',
];

export default function WhyChooseSection({ content }: { content?: HomepageContent['why'] }) {
  const paragraphs = content?.paragraphs?.length ? content.paragraphs : fallbackParagraphs;
  const points = content?.points?.length ? content.points : fallbackPoints;

  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right">
            <div className="ab_content">
              <h2 data-aos="fade-up" data-aos-delay="100">
                {content?.title || 'Why Institutions & Students Choose Mindsprint'}
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
                <Link className="btn_one" to={content?.cta?.href || '/exams'}>
                  {content?.cta?.label || 'Start Online Test'} <i className="ti-arrow-top-right" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left">
            <div className="ab_img" data-aos="zoom-in" data-aos-delay="150">
              <img src={content?.image || '/eduleb/img/about3.png'} className="img-fluid" alt="Why choose Mindsprint" />
              <div className="home_ps2" data-aos="zoom-in" data-aos-delay="300">
                <span className="ti-book" aria-hidden />
                <div className="home_ps2__text">
                  <h2>{content?.statValue || '250+'}</h2>
                  <p>{content?.statLabel || 'Active Mock Tests'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
