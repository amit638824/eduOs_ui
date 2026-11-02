import type { HomepageContent } from '@/types/homepage';

const fallbackSteps = [
  {
    cls: 'sc_one',
    num: '01',
    title: 'Select or Build Exam / Test',
    text: 'Pick from curated question banks or generate custom AI-assisted test papers with defined marking schemes.',
  },
  {
    cls: 'sc_two',
    num: '02',
    title: 'Secure AI Proctoring',
    text: 'Attempt exams with automated anti-cheat monitoring, fullscreen lockdown, tab-switch detection, and webcam verification.',
  },
  {
    cls: 'sc_three',
    num: '03',
    title: 'Instant Evaluation & Deep Analytics',
    text: 'Receive real-time automated scoring, accuracy breakdowns, percentile ranks, and topic-wise performance insights.',
  },
  {
    cls: 'sc_four',
    num: '04',
    title: 'Verified Digital Certification',
    text: 'Instantly download tamper-proof, QR-verified digital certificates and detailed scorecards for academic or career credentials.',
  },
];

export default function JourneySection({ content }: { content?: HomepageContent['journey'] }) {
  const steps = content?.steps?.length
    ? content.steps.map((s) => ({
        cls: s.cls,
        num: s.num,
        title: [s.title, s.line2].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
        text: s.text,
      }))
    : fallbackSteps;

  return (
    <section
      className="top_cat__area section-padding"
      style={{
        backgroundImage: 'url(/eduleb/img/bg/shape-1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up" data-aos-duration="1000">
          <h2>{content?.title || 'How Our Online Examination System Works'}</h2>
          <p>
            {content?.description ||
              'From AI-driven test creation to proctored execution and instant verified results, experience an end-to-end digital assessment workflow.'}
          </p>
        </div>
        <div className="row g-3 eduleb-journey-row">
          {steps.map((s, index) => (
            <div
              key={s.num}
              className="col-lg-3 col-sm-6 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={index * 120}
              data-aos-duration="1000"
            >
              <div className="single_tp eduleb-hover-lift">
                <div className="single_tp__head">
                  <span className={s.cls}>{s.num}</span>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
