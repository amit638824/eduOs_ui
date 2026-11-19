import { useEffect, useState } from 'react';
import type { HomepageContent } from '@/types/homepage';

const fallbackTestimonials = [
  {
    avatar: '/eduleb/img/testimonial/7.jpg',
    name: 'Aman Gupta',
    company: 'CCC Exam Candidate',
    text: 'Practicing on Mindsprint helped me clear my CCC certification on the first attempt! The mock test interface is identical to the real exam pattern and the instant scorecard highlighted my weak topics.',
  },
  {
    avatar: '/eduleb/img/testimonial/6.jpg',
    name: 'Sneha Rastogi',
    company: 'Diploma Student',
    text: 'The timed assessments and detailed accuracy analysis boosted my confidence immensely. Receiving an authentic verified certificate after completing my course exam was seamless.',
  },
  {
    avatar: '/eduleb/img/testimonial/9.jpg',
    name: 'Vikram Patel',
    company: 'IT Academy Instructor',
    text: 'Managing 500+ students and conducting batch-wise terminal examinations used to take weeks. With Mindsprint, test assignment, automated evaluation, and report generation take just minutes.',
  },
  {
    avatar: '/eduleb/img/testimonial/8.jpg',
    name: 'Pooja Tiwari',
    company: 'Competitive Exam Aspirant',
    text: 'The question quality in quantitative aptitude and reasoning is top-notch. The sectional countdown timer and review flags made me exam-ready.',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&h=200&q=80',
    name: 'Rohan Mehta',
    company: 'Python Certification Candidate',
    text: 'The coding test questions and instant answer explanations gave me real practical clarity. Highly recommended for every serious learner.',
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
            {content?.title || 'What Students & Educators Say About Mindsprint'}
          </h2>
        </div>
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-right" data-aos-delay="150">
            <div className="ab_img" data-aos="zoom-in" data-aos-delay="200">
              <img
                src={content?.image || '/eduleb/img/educators.jpg'}
                className="img-fluid"
                alt="Student reviews"
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)',
                  display: 'block',
                }}
              />
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 col-xs-12" data-aos="fade-left" data-aos-delay="200">
            <div id="testimonial-slider" className="eduleb-testimonial-slider" data-aos="zoom-in" data-aos-delay="250">
              <div className="testimonial" key={`${item.name}-${index}`}>
                <img src="/eduleb/img/quote.png" alt="Quote" />
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
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{
                      width: '65px',
                      height: '65px',
                      minWidth: '65px',
                      minHeight: '65px',
                      maxWidth: '65px',
                      maxHeight: '65px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      aspectRatio: '1 / 1',
                      display: 'inline-block',
                      float: 'left',
                      marginRight: '15px',
                      border: '4px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                    }}
                  />
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
