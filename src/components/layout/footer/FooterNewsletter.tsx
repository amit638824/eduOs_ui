import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { siteContent } from '@/data/siteContent';
import { FormError } from '@/components/ui/FormField';
import { newsletterSchema, type NewsletterFormValues } from '@/validators/schemas';

export default function FooterNewsletter() {
  const { newsletter } = siteContent.footer;
  const [subscribed, setSubscribed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: yupResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    setSubscribed(true);
    reset();
  };

  return (
    <div className="ms-newsletter-card" data-aos="fade-up">
      <div className="row align-items-center g-4">
        <div className="col-lg-6 col-12">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(165, 180, 252, 0.3)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700 }}>
            <span className="ms-badge-pulse" style={{ background: '#a5b4fc' }} />
            <span>EXAM ALERTS &amp; INSIGHTS</span>
          </div>

          <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '8px' }}>
            {newsletter.title} <span className="ms-gradient-text">{newsletter.titleHighlight}</span>
          </h3>

          <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {newsletter.description}
          </p>
        </div>

        <div className="col-lg-6 col-12">
          {subscribed ? (
            <div className="p-3 rounded-3 d-flex align-items-center gap-3" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✓
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>You're Subscribed!</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.825rem' }}>We'll send you updates on new mock exams and exam patterns.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="d-flex flex-sm-row flex-column gap-2">
                <div style={{ flexGrow: 1 }}>
                  <input
                    type="email"
                    placeholder={newsletter.placeholder}
                    className="ms-input"
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      height: '50px',
                    }}
                    {...register('email')}
                  />
                  <FormError message={errors.email?.message} />
                </div>
                <button
                  type="submit"
                  className="ms-btn ms-btn-primary ms-btn-lg"
                  style={{ height: '50px', whiteSpace: 'nowrap' }}
                >
                  <span>{newsletter.buttonText}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                No spam ever. Unsubscribe with 1 click anytime.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
