import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackParagraphs = [
  'Mindsprint is a modern digital examination platform engineered for colleges, schools, coaching institutes, and corporate recruiters to conduct high-stakes assessments with total integrity.',
  'From multi-tier question banks and AI test generation to robust proctoring and automated report cards, our cloud system handles thousands of concurrent exam attempts effortlessly.',
];

const fallbackPoints = [
  'AI-powered anti-cheat proctoring with tab-switch & webcam monitoring',
  'Dynamic question bank supporting MCQs, numericals & subjective grading',
  'Automated evaluation, percentile rankings & instant scorecard delivery',
  'Multi-tenant support for institutes, branches, examiners & evaluators',
];

export default function AboutSection({ content }: { content?: HomepageContent['about'] }) {
  const paragraphs = content?.paragraphs?.length ? content.paragraphs : fallbackParagraphs;
  const points = content?.points?.length ? content.points : fallbackPoints;

  return (
    <section className="ab_area section-padding">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-duration="900">
            <div className="ab_img eduleb-hover-lift" data-aos="zoom-in" data-aos-delay="150">
              <img src={content?.image || '/eduleb/img/about1.png'} className="img-fluid" alt="Online examination system" />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left" data-aos-duration="900">
            <div className="ab_content">
              <h2 data-aos="fade-up" data-aos-delay="100">
                {content?.title || 'Enterprise-Grade Online Examination & Assessment Ecosystem'}
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
                  {content?.cta?.label || 'Browse Practice Tests'} <i className="ti-arrow-top-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
