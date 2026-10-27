const steps = [
  { cls: 'sc_one', num: '01', title: 'Expert', line2: 'Teacher' },
  { cls: 'sc_two', num: '02', title: 'Quality', line2: 'Education' },
  { cls: 'sc_three', num: '03', title: 'Remote', line2: 'Learning' },
  { cls: 'sc_four', num: '04', title: 'Life Time', line2: 'Support' },
];

export default function JourneySection() {
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
          <h2>Start your journey With us</h2>
          <p>
            We offer a brand new approach to the most basic learning paradigms. Choose from a wide
            range of learning options and gain new skills! Our school is know.
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
                <p>Lorem ipsum dolor sit amet, consectetur notted adipisicing elit ut labore.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
