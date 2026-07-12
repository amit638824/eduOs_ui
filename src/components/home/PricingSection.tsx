import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import SectionTitle from '@/components/ui/SectionTitle';

export default function PricingSection() {
  const { pricing } = siteContent;

  return (
    <div className="pricingarea sp_bottom_100 sp_top_90">
      <div className="container">
        <div className="row" data-aos="fade-up">
          <div className="col-12">
            <SectionTitle badge={pricing.badge} title={pricing.title} centered />
          </div>
        </div>
        <div className="row">
          {pricing.plans.map((plan) => (
            <div key={plan.name} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12" data-aos="fade-up">
              <div className="pricingarea__content__wraper">
                <div className="pricingarea__heading">
                  <div className="pricingarea__plan__type">
                    <h6>{plan.name}</h6>
                    <img loading="lazy" src={plan.icon} alt="" />
                  </div>
                  <div className="pricingarea__number">
                    <h1>
                      <span className="price__currency">$</span>
                      {plan.price}
                      <span className="price__durition">{plan.period}</span>
                    </h1>
                  </div>
                  <p>{plan.description}</p>
                </div>
                <div className="pricingarea__list">
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature.text}>
                        <i className={feature.included ? 'icofont-check' : 'icofont-close close__button'} />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`pricingarea__button${plan.highlighted ? ' pricingarea__button__2' : ''}`}>
                  <Link className="default__button" to={plan.name === 'INSTITUTION' ? '/schools' : '/register'}>
                    {plan.cta}
                  </Link>
                </div>
                <div className="pricingarea__text">
                  <p>No credit card required for free plan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
