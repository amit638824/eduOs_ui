import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FormError, PasswordInput, inputClassName } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';
import { siteContent } from '@/data/siteContent';
import { loginSchema, quickSignupSchema, type LoginFormValues, type QuickSignupFormValues } from '@/validators/schemas';

export default function LoginPage() {
  const { brand } = siteContent;
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<QuickSignupFormValues>({
    resolver: yupResolver(quickSignupSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onLogin = async (values: LoginFormValues) => {
    setApiError('');
    setSubmitting(true);
    try {
      const result = await login(values);
      if (typeof result === 'object' && 'requiresMfa' in result && result.requiresMfa) {
        setMfaToken(result.mfaToken);
        return;
      }
      if (typeof result === 'string') {
        navigate(result);
      }
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSubmitting(true);
    try {
      const path = await completeMfaLogin(mfaToken, mfaCode);
      navigate(path);
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onQuickSignup = () => {
    navigate('/register');
  };

  return (
    <>
      <Breadcrumb title="Log In" />
      <div className="loginarea auth-page-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-md-8 offset-md-2" data-aos="fade-up">
              <ul className="nav tab__button__wrap text-center" id="loginTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="single__tab__link active"
                    data-bs-toggle="tab"
                    data-bs-target="#loginPanel"
                    type="button"
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="single__tab__link"
                    data-bs-toggle="tab"
                    data-bs-target="#signupPanel"
                    type="button"
                  >
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>

            <div className="tab-content tab__content__wrapper" id="loginTabContent" data-aos="fade-up">
              <div className="tab-pane fade active show" id="loginPanel" role="tabpanel">
                <div className="col-xl-8 col-md-8 offset-md-2">
                  <div className="loginarea__wraper">
                    <div className="login__heading">
                      <h5 className="login__title">Login to {brand.name}</h5>
                      <p className="login__description">
                        Don&apos;t have an account?{' '}
                        <Link to="/register">Sign up for free</Link>
                      </p>
                    </div>
                    {mfaToken ? (
                      <form onSubmit={onMfaSubmit} noValidate>
                        {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
                        <p className="sp_bottom_15">Enter your MFA backup code to continue.</p>
                        <div className="login__form">
                          <input
                            className="common__login__input"
                            placeholder="MFA code"
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            required
                          />
                        </div>
                        <div className="login__button">
                          <button type="submit" className="default__button auth-submit-btn" disabled={submitting}>
                            {submitting ? 'Verifying...' : 'Verify & Log In'}
                          </button>
                        </div>
                      </form>
                    ) : (
                    <form onSubmit={handleLoginSubmit(onLogin)} noValidate autoComplete="off">
                      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
                      <div className="login__form">
                        <label className="form__label" htmlFor="loginEmail">
                          Email or Enrollment No.
                        </label>
                        <input
                          id="loginEmail"
                          className={inputClassName('common__login__input', !!loginErrors.email)}
                          type="text"
                          placeholder="you@example.com or ENR-2026-0001"
                          autoComplete="username"
                          {...registerLogin('email')}
                        />
                        <FormError message={loginErrors.email?.message} />
                      </div>
                      <div className="login__form">
                        <label className="form__label" htmlFor="loginPassword">
                          Password
                        </label>
                        <PasswordInput
                          id="loginPassword"
                          inputClass="common__login__input"
                          hasError={!!loginErrors.password}
                          placeholder="Enter your password"
                          autoComplete="off"
                          {...registerLogin('password')}
                        />
                        <FormError message={loginErrors.password?.message} />
                      </div>
                      <div className="login__form d-flex justify-content-between flex-wrap gap-2">
                        <div className="form__check">
                          <input id="rememberMe" type="checkbox" />
                          <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <div className="text-end login__form__link">
                          <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                      </div>
                      <div className="login__button">
                        <button
                          type="submit"
                          className="default__button auth-submit-btn"
                          disabled={submitting}
                        >
                          {submitting ? 'Logging in...' : 'Log In'}
                        </button>
                      </div>
                    </form>
                    )}
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="signupPanel" role="tabpanel">
                <div className="col-xl-8 offset-md-2">
                  <div className="loginarea__wraper">
                    <div className="login__heading">
                      <h5 className="login__title">Create Account</h5>
                      <p className="login__description">
                        Already registered? <Link to="/login">Log in</Link>
                      </p>
                    </div>
                    <form onSubmit={handleSignupSubmit(onQuickSignup)} noValidate autoComplete="off">
                      <div className="login__form">
                        <label className="form__label" htmlFor="signupFullName">
                          Full name
                        </label>
                        <input
                          id="signupFullName"
                          className={inputClassName('common__login__input', !!signupErrors.fullName)}
                          type="text"
                          placeholder="Your full name"
                          {...registerSignup('fullName')}
                        />
                        <FormError message={signupErrors.fullName?.message} />
                      </div>
                      <div className="login__form">
                        <label className="form__label" htmlFor="signupEmail">
                          Email
                        </label>
                        <input
                          id="signupEmail"
                          className={inputClassName('common__login__input', !!signupErrors.email)}
                          type="email"
                          placeholder="you@school.edu"
                          {...registerSignup('email')}
                        />
                        <FormError message={signupErrors.email?.message} />
                      </div>
                      <div className="login__form">
                        <label className="form__label" htmlFor="signupPassword">
                          Password
                        </label>
                        <PasswordInput
                          id="signupPassword"
                          inputClass="common__login__input"
                          hasError={!!signupErrors.password}
                          placeholder="Create password"
                          autoComplete="new-password"
                          {...registerSignup('password')}
                        />
                        <FormError message={signupErrors.password?.message} />
                      </div>
                      <div className="login__button">
                        <button type="submit" className="default__button auth-submit-btn">
                          Sign Up Free
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
