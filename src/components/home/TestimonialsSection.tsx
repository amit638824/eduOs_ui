import { useEffect, useState } from 'react';

const testimonials = [
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

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const item = testimonials[index];

  return (
    <section className="testi_area section-padding">
      <div className="container">
        <div className="section-title">
          <h2>
            What Student’s Say To Do <br />
            Their Online Course
          </h2>
        </div>
        <div className="row">
          <div className="col-lg-6 col-sm-12 col-xs-12">
            <div className="ab_img">
              <img src="/eduleb/img/review.png" className="img-fluid" alt="image" />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12">
            <div id="testimonial-slider" className="eduleb-testimonial-slider">
              <div className="testimonial" key={`${item.name}-${index}`}>
                <img src="/eduleb/img/quote.png" alt="" />
                <div className="testimonial_content">
                  <i className="ti-star" />
                  <i className="ti-star" />
                  <i className="ti-star" />
                  <i className="ti-star" />
                  <i className="ti-star" />
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
