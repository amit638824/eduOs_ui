import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function TestimonialsSection() {
  const { testimonials } = siteContent;

  return (
    <div className="aboutarea__3 testimonial__area__2 sp_bottom_90 sp_top_120">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12 col-12 custom__review__grid" data-aos="fade-up">
            <div className="section__title aboutarea__3__section__title">
              <div className="section__title__button">
                <div className="default__small__button">{testimonials.badge}</div>
              </div>
              <div className="section__title__heading">
                <h2>
                  {testimonials.title.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i === 0 && <br />}
                    </span>
                  ))}
                </h2>
              </div>
            </div>
            <div className="aboutarea__3__content">
              <p>{testimonials.description}</p>
            </div>
            <div className="aboutarea__3__button">
              <Link className="default__button" to="/about">
                Read More Stories
                <i className="icofont-long-arrow-right" />
              </Link>
            </div>
          </div>

          {testimonials.items.map((item) => (
            <div
              key={item.name}
              className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12 custom__review__grid"
              data-aos="fade-up"
            >
              <div className="aboutarea__content__wraper__3">
                <div className="aboutarea__para__3">
                  <p>{item.quote}</p>
                  <div className="aboutarea__icon__3">
                    <i className="icofont-quote-left" />
                  </div>
                </div>
                <div className="aboutarea__img__3">
                  <img loading="lazy" src={item.image} alt={item.name} />
                  <div className="aboutarea__img__name">
                    <h6>{item.name}</h6>
                    <p>{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="aboutarea__img__3">
        <img loading="lazy" className="aboutarea__3__img__1" src="/img/about/about_6.png" alt="" />
        <img loading="lazy" className="aboutarea__3__img__2" src="/img/about/about_7.png" alt="" />
        <img loading="lazy" className="aboutarea__3__img__3" src="/img/about/about_9.png" alt="" />
      </div>
    </div>
  );
}
