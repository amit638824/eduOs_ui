import { useEffect, useState } from 'react';
import type { HomepageContent } from '@/types/homepage';

const fallbackTestimonials = [
  {
    avatar: '/eduleb/img/testimonial/1.png',
    name: 'Ajmain Adil',
    company: 'Groton Inc',
    text: 'Aqestic optio amet a ququam saepe aliquid voluate dicta fuga dolor saerror sed earum a magni soluta quam minus dolor dolor sed earum a magni soluta autem dolor error error sit quam minus sint rem a rerum dolobus veritatis delectus.',
  },
  {
    avatar: '/eduleb/img/testimonial/2.png',
    name: 'Sharukh Khan',
    company: 'Red Chili Inc',
    text: 'Aqestic optio amet a ququam saepe aliquid voluate dicta fuga dolor saerror sed earum a magni soluta quam minus dolor dolor sed earum a magni soluta autem dolor error error sit quam minus sint rem a rerum dolobus veritatis delectus.',
  },
  {
    avatar: '/eduleb/img/testimonial/3.png',
    name: 'Anushka sharma',
    company: 'Naika Company',
    text: 'Aqestic optio amet a ququam saepe aliquid voluate dicta fuga dolor saerror sed earum a magni soluta quam minus dolor dolor sed earum a magni soluta autem dolor error error sit quam minus sint rem a rerum dolobus veritatis delectus.',
  },
  {
    avatar: '/eduleb/img/testimonial/4.png',
    name: 'Ajmain Adil',
    company: 'Groton Inc',
    text: 'Aqestic optio amet a ququam saepe aliquid voluate dicta fuga dolor saerror sed earum a magni soluta quam minus dolor dolor sed earum a magni soluta autem dolor error error sit quam minus sint rem a rerum dolobus veritatis delectus.',
  },
  {
    avatar: '/eduleb/img/testimonial/5.png',
    name: 'Ajmain Adil',
    company: 'Groton Inc',
    text: 'Aqestic optio amet a ququam saepe aliquid voluate dicta fuga dolor saerror sed earum a magni soluta quam minus dolor dolor sed earum a magni soluta autem dolor error error sit quam minus sint rem a rerum dolobus veritatis delectus.',
  },
];

export default function TestimonialsSection({ content }: { content?: HomepageContent['testimonials'] }) {
  const testimonials = content?.items?.length ? content.items : fallbackTestimonials;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const item = testimonials[index % testimonials.length];

  return (
    <section className="testi_area section-padding">
      <div className="container">
        <div className="section-title" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">
            {content?.title || 'What Student’s Say To Do Their Online Course'}
          </h2>
        </div>
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-delay="150">
            <div className="ab_img" data-aos="zoom-in" data-aos-delay="200">
              <img src={content?.image || '/eduleb/img/review.png'} className="img-fluid" alt="image" />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left" data-aos-delay="200">
            <div id="testimonial-slider" className="eduleb-testimonial-slider" data-aos="zoom-in" data-aos-delay="250">
              <div className="testimonial" key={`${item.name}-${index}`}>
                <img src="/eduleb/img/quote.png" alt="" />
                <div className="testimonial_content">
                  <div className="mb-2" style={{ color: '#f59e0b' }}>
                    <i className="ti-star" />
                    <i className="ti-star" />
                    <i className="ti-star" />
                    <i className="ti-star" />
                    <i className="ti-star" />
                  </div>
                  <p>{item.text}</p>
                </div>
                <div className="testi_pic_title">
                  <img src={item.avatar} alt={item.name} />
                  <h4>{item.name}</h4>
                  <p>{item.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
