import { useState } from 'react';
import PageBanner from '@/components/eduleb/PageBanner';

const faqs = [
  {
    q: 'What does it take to become an instructor?',
    a: 'We welcome passionate educators and subject matter experts. You can register as an instructor to start creating question banks and mock tests.',
  },
  {
    q: 'How can I contact an instructor?',
    a: 'You can reach instructors from the instructor page or via the contact form. We reply within 24 hours on business days.',
  },
  {
    q: 'How can I purchase a test or course?',
    a: 'Browse All Courses, open course details, then click Register Today or Enroll Now to continue.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes, eligible courses support refunds within the stated window. Contact support for help.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <PageBanner title="FAQ" crumb="FAQ" />
      <section className="faq_area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              {faqs.map((item, idx) => (
                <div className="single_faq" key={item.q} style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    className="btn_one"
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => setOpen(open === idx ? -1 : idx)}
                  >
                    {item.q}
                  </button>
                  {open === idx && (
                    <p style={{ padding: '16px 8px 0' }}>{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
