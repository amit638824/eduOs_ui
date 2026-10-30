import type { HomepageContent } from '@/types/homepage';

const fallbackSteps = [
  {
    cls: 'sc_one',
    num: '01',
    title: 'Select or Build',
    line2: 'Exam / Test',
    text: 'Pick from curated question banks or generate custom AI-assisted test papers with defined marking schemes.',
  },
  {
    cls: 'sc_two',
    num: '02',
    title: 'Secure AI',
    line2: 'Proctoring',
    text: 'Attempt exams with automated anti-cheat monitoring, fullscreen lockdown, tab-switch detection, and webcam verification.',
  },
  {
    cls: 'sc_three',
    num: '03',
    title: 'Instant Evaluation',
    line2: '& Deep Analytics',
    text: 'Receive real-time automated scoring, accuracy breakdowns, percentile ranks, and topic-wise performance insights.',
  },
  {
    cls: 'sc_four',
    num: '04',
    title: 'Verified Digital',
    line2: 'Certification',
    text: 'Instantly download tamper-proof, QR-verified digital certificates and detailed scorecards for academic or career credentials.',
  },
];

export default function JourneySection({ content }: { content?: HomepageContent['journey'] }) {
  const steps = content?.steps?.length ? content.steps : fallbackSteps;
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
        <div className="row">
          {steps.map((s, index) => (
            <div
              key={s.num}
              className="col-lg-3 col-sm-6 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={index * 120}
              data-aos-duration="1000"
            >
              <div className="single_tp eduleb-hover-lift">
                <span className={s.cls}>{s.num}</span>
                <h3>
                  {s.title} <br />
                  {s.line2}
                </h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
