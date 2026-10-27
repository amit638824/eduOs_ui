import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const plans = [
  {
    name: 'Basic',
    price: '29',
    features: [
      'Access to 20 courses',
      'Community support',
      'Certificate of completion',
      'Weekly practice quizzes',
      'Progress tracking dashboard',
      'Mobile app access',
    ],
  },
  {
    name: 'Standard',
    price: '49',
    features: [
      'Access to 80 courses',
      'Priority email support',
      'Offline downloads',
      'Certificate of completion',
      'Mock exams & analytics',
      'Live doubt sessions (2/mo)',
      'Study planner & reminders',
    ],
  },
  {
    name: 'Premium',
    price: '99',
    features: [
      'Unlimited courses',
      '1:1 mentoring sessions',
      'Lifetime downloads',
      'Career guidance support',
      'All mock tests unlocked',
      'Priority live doubt support',
      'Interview prep materials',
      'Early access to new courses',
    ],
  },
];

export default function EdulebPricingPage() {
  return (
    <>
      <PageBanner title="Pricing Plan" crumb="Pricing Plan" />
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            {plans.map((plan) => (
              <div key={plan.name} className="col-lg-4 col-sm-6 col-xs-12">
                <div className="single_course eduleb-pricing-card">
                  <h4>{plan.name}</h4>
                  <div className="eduleb-pricing-price">
                    ${plan.price}
                    <span>/mo</span>
                  </div>
                  <ul className="eduleb-pricing-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <i className="ti-check" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="btn_one">
                    Get Started <i className="ti-arrow-top-right" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
