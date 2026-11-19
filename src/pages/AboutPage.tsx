import { Link } from 'react-router-dom';
import JourneySection from '@/components/home/JourneySection';
import AboutSection from '@/components/home/AboutSection';
import CounterSection from '@/components/home/CounterSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function AboutPage() {
  return (
    <>
      <div className="eduleb-about-flow">
        <JourneySection />
      </div>
      <AboutSection />

      <CounterSection />

      <section className="insfreecourse section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div
                className="single_ins"
                style={{
                  backgroundImage: 'url(/eduleb/img/ins1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                }}
              >
                <div className="single_ins_content">
                  <h4>For Educators</h4>
                  <h1>Create &amp; Conduct Exams</h1>
                  <p>Design question banks, schedule batches, and auto-evaluate student performance.</p>
                  <Link className="btn_one" to="/pricing">
                    View Pricing <i className="ti-arrow-top-right" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-sm-12 col-xs-12">
              <div
                className="single_ins"
                style={{
                  backgroundImage: 'url(/eduleb/img/ins2.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                }}
              >
                <div className="single_ins_content">
                  <h4>For Candidates</h4>
                  <h1>Practice Free Mock Tests</h1>
                  <p>Attempt timed test papers with instant scorecard, ranking, and weak topic insights.</p>
                  <Link className="btn_one" to="/exams">
                    Start Test Now <i className="ti-arrow-top-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </>
  );
}
