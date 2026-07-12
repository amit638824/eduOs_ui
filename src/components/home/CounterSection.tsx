import { siteContent } from '@/data/siteContent';

export default function CounterSection() {
  const { counters } = siteContent;

  return (
    <div className="counterarea sp_bottom_100 sp_top_50">
      <div className="container">
        <div className="row">
          {counters.map((stat) => (
            <div key={stat.label} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12" data-aos="fade-up">
              <div className="counterarea__text__wraper">
                <div className="counter__img">
                  <img loading="lazy" src={stat.icon} alt="" />
                </div>
                <div className="counter__content__wraper">
                  <div className="counter__number">
                    <span className="counter">{stat.value}</span>
                    {stat.suffix}
                  </div>
                  <p>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
