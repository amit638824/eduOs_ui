import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const plans = [
  {
    name: 'Free Demo',
    price: '0',
    currency: '₹',
    features: [
      '5 free mock tests / month',
      'Basic scorecard & answer key',
      'Instant test ranking',
      'Verified certificate preview',
      'Mobile web test player',
    ],
  },
  {
    name: 'Student Pro',
    price: '199',
    currency: '₹',
    features: [
      'Unlimited mock tests & practice papers',
      'Detailed topic-wise weak area analysis',
      'Assigned institute examinations',
      'AI-powered performance recommendations',
      'Full verified certificate download',
      'Priority academic support',
    ],
  },
  {
    name: 'Institute / Academy',
    price: '999',
    currency: '₹',
    features: [
      'Unlimited students & exam batches',
      'Custom question bank & AI test builder',
      'Live AI anti-cheating proctoring',
      'Subjective evaluation & rubric marking',
      'Batch-wise analytics & CSV export',
      'Custom branded certificate generator',
    ],
  },
];

export default function EdulebPricingPage() {
  return (
    <>
      <PageBanner title="Assessment Pricing Plans" crumb="Pricing" />
      <section className="home_course section-padding">
        <div className="container">
          <div className="row">
            {plans.map((plan) => (
              <div key={plan.name} className="col-lg-4 col-sm-6 col-xs-12">
                <div className="single_course eduleb-pricing-card">
                  <h4>{plan.name}</h4>
                  <div className="eduleb-pricing-price">
                    {plan.currency}{plan.price}
                    <span>/mo</span>
                  </div>
                  <ul className="eduleb-pricing-features">
                    {plan.features.map((feat) => (
                      <li key={feat}>
                        <i className="ti-check" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link to="/login" className="btn_one w-100 text-center">
                      Get Started <i className="ti-arrow-top-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
