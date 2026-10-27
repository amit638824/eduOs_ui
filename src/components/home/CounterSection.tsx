import CountUp from 'react-countup';

const counters = [
  { icon: 'ti-folder', tone: 'sc_one', end: 134, label: 'Our Online Course' },
  { icon: 'ti-medall-alt', tone: 'sc_two', end: 299, label: 'Academic Programs' },
  { icon: 'ti-id-badge', tone: 'sc_three', end: 684, label: 'Certified Students' },
  { icon: 'ti-user', tone: 'sc_four', end: 941, label: 'Enrolled Students' },
];

export default function CounterSection() {
  return (
    <section className="count_area counter_feature">
      <div className="container">
        <div className="row">
          {counters.map((item, index) => (
            <div
              key={item.label}
              className="col-lg-3 col-sm-6 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="single-counter eduleb-hover-lift">
                <span className={`${item.icon} ${item.tone}`} aria-hidden="true" />
                <h2 className="counter-num">
                  <CountUp end={item.end} duration={2} enableScrollSpy scrollSpyOnce />
                </h2>
                <p>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
