import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';
import { FormError, PasswordInput } from '@/components/ui/FormField';
import { registerSchema, type RegisterFormValues } from '@/validators/schemas';

interface RegisterSectionProps {
  variant?: 'default' | 'auth';
}

export default function RegisterSection({ variant = 'default' }: RegisterSectionProps = {}) {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError('');
    setSubmitting(true);
    try {
      const dashboardPath = await registerUser({
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone?.trim() || undefined,
        role: 'student',
      });
      navigate(dashboardPath);
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // If used on /register page, show the actual registration form
  if (variant === 'auth') {
    return (
      <section className="container py-5" data-aos="fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="p-4 p-sm-5 bg-white rounded-4 border shadow-sm">
              <h2 className="ms-title-bold text-center mb-2" style={{ fontSize: '1.85rem' }}>
                Create Your Account
              </h2>
              <p className="ms-subtitle-text text-center mx-auto mb-4">
                Start practicing mock exams and track your progress today.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
                {apiError && (
                  <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '0.85rem' }}>
                    {apiError}
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-sm-6 col-12">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>First Name</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. Rahul"
                      {...register('firstName')}
                    />
                    <FormError message={errors.firstName?.message} />
                  </div>
                  <div className="col-sm-6 col-12">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Last Name</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. Verma"
                      {...register('lastName')}
                    />
                    <FormError message={errors.lastName?.message} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                  />
                  <FormError message={errors.email?.message} />
                </div>

                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone (optional)</label>
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register('phone')}
                  />
                  <FormError message={errors.phone?.message} />
                </div>

                <div className="mb-4">
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                  <PasswordInput
                    id="regPassword"
                    inputClass="form-control"
                    hasError={!!errors.password}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  <FormError message={errors.password?.message} />
                </div>

                <button
                  type="submit"
                  className="ms-btn-coral w-100"
                  disabled={submitting}
                  style={{ justifyContent: 'center' }}
                >
                  {submitting ? 'Creating Account...' : 'Sign Up Free'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant used on homepage: matches Image 2 bottom CTA banner
  return (
    <section className="container" data-aos="fade-up">
      <div className="ms-cta-dark-banner">
        <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
          <div className="col-xl-8 col-lg-7 col-12">
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              READY TO START?
            </div>

            <h2 style={{ fontSize: '2.35rem', fontWeight: 850, color: '#ffffff', lineHeight: 1.25, marginBottom: '14px' }}>
              Create Your Account &amp; Get <span style={{ color: '#f97316' }}>Free Access</span> to Practice Tests
            </h2>

            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0, maxWidth: '580px' }}>
              Join thousands of students and take the first step towards your dream exam.
            </p>

            {/* 3 Perks */}
            <div className="d-flex flex-wrap gap-4 mt-3">
              <div className="d-flex align-items-center gap-2" style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                <span>Free mock tests</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                <span>No credit card required</span>
              </div>
              <div className="d-flex align-items-center gap-2" style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                <span>Instant access</span>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-5 col-12 text-lg-end">
            <Link to="/register" className="ms-btn-coral ms-btn-lg">
              <span>Get Started For Free</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
