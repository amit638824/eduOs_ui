import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { siteContent } from '@/data/siteContent';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';
import { FormError, PasswordInput, inputClassName } from '@/components/ui/FormField';
import { registerSchema, type RegisterFormValues } from '@/validators/schemas';

export default function RegisterSection({ variant = 'default' }: { variant?: 'default' | 'auth' }) {
  const { register: registerContent } = siteContent;
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

  return (
    <div
      className={
        variant === 'auth'
          ? 'registerarea auth-register-section sp_top_50'
          : 'registerarea sp_top_90'
      }
    >
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="registerarea__wraper">
              <div className="section__title registerarea__section__title">
                <div className="section__title__button">
                  <div className="default__small__button">{registerContent.badge}</div>
                </div>
                <div className="section__title__heading heading__underline">
                  <h2>
                    Create Your <span>Account</span> &amp; Get free access to{' '}
                    <small>{registerContent.count}</small> practice tests
                  </h2>
                </div>
              </div>
              <div className="registerarea__content">
                <div className="registerarea__video">
                  <div className="video__pop__btn">
                    <a className="video-btn" href="https://www.youtube.com/watch?v=vHdclsdkp28">
                      <img loading="lazy" src="/img/icon/video.png" alt="Watch demo" />
                    </a>
                  </div>
                  <div className="registerarea__para">
                    <p>{registerContent.videoText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="registerarea__form">
              <div className="registerarea__form__heading">
                <h4>{registerContent.formTitle}</h4>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
                {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
                <div className="row">
                  <div className="col-xl-6">
                    <div className="register-field">
                      <label className="register__label" htmlFor="regFirstName">
                        First Name
                      </label>
                      <input
                        id="regFirstName"
                        className={inputClassName('register__input', !!errors.firstName)}
                        type="text"
                        placeholder="First Name"
                        autoComplete="off"
                        {...register('firstName')}
                      />
                      <FormError message={errors.firstName?.message} />
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="register-field">
                      <label className="register__label" htmlFor="regLastName">
                        Last Name
                      </label>
                      <input
                        id="regLastName"
                        className={inputClassName('register__input', !!errors.lastName)}
                        type="text"
                        placeholder="Last Name"
                        autoComplete="off"
                        {...register('lastName')}
                      />
                      <FormError message={errors.lastName?.message} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-6">
                    <div className="register-field">
                      <label className="register__label" htmlFor="regEmail">
                        Email Address
                      </label>
                      <input
                        id="regEmail"
                        className={inputClassName('register__input', !!errors.email)}
                        type="email"
                        placeholder="Email Address"
                        autoComplete="off"
                        {...register('email')}
                      />
                      <FormError message={errors.email?.message} />
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="register-field">
                      <label className="register__label" htmlFor="regPhone">
                        Phone <span className="register__optional">(optional)</span>
                      </label>
                      <input
                        id="regPhone"
                        className={inputClassName('register__input', !!errors.phone)}
                        type="tel"
                        placeholder="Phone"
                        autoComplete="off"
                        {...register('phone')}
                      />
                      <FormError message={errors.phone?.message} />
                    </div>
                  </div>
                </div>
                <div className="register-field">
                  <label className="register__label" htmlFor="regPassword">
                    Password
                  </label>
                  <PasswordInput
                    id="regPassword"
                    inputClass="register__input"
                    hasError={!!errors.password}
                    placeholder="Min 8 chars, upper, lower, number, special"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  <FormError message={errors.password?.message} />
                </div>
                <div className="registerarea__button">
                  <button
                    type="submit"
                    className="default__button auth-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Account...' : 'Sign Up Free'}
                    <i className="icofont-long-arrow-right" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="registerarea__img">
        <img loading="lazy" className="register__1" src="/img/register/register__1.png" alt="" />
        <img loading="lazy" className="register__2" src="/img/register/register__2.png" alt="" />
        <img loading="lazy" className="register__3" src="/img/register/register__3.png" alt="" />
      </div>
    </div>
  );
}
