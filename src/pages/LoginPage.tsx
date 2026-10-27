import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormError, PasswordInput, inputClassName } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';
import {
  clearRememberedLogin,
  loadRememberedLogin,
  saveRememberedLogin,
} from '@/lib/rememberLogin';
import { loginSchema, type LoginFormValues } from '@/validators/schemas';

export default function LoginPage() {
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const remembered = loadRememberedLogin();
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(remembered));

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      loginId: remembered?.loginId ?? '',
      password: remembered?.password ?? '',
    },
  });

  useEffect(() => {
    document.body.classList.add('eduleb-login-route');
    return () => document.body.classList.remove('eduleb-login-route');
  }, []);

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      setApiError('Your session expired. Please log in again.');
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = loadRememberedLogin();
    if (saved) {
      setRememberMe(true);
      resetLogin({ loginId: saved.loginId, password: saved.password });
    }
  }, [resetLogin]);

  const onLogin = async (values: LoginFormValues) => {
    setApiError('');
    setSubmitting(true);
    try {
      if (rememberMe) {
        saveRememberedLogin(values.loginId, values.password);
      } else {
        clearRememberedLogin();
      }
      const result = await login({
        email: values.loginId.trim(),
        password: values.password,
      });
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

  return (
    <section className="ms-login-page">
      <div className="ms-login-blobs" aria-hidden>
        <span className="ms-login-blob ms-login-blob--tl" />
        <span className="ms-login-blob ms-login-blob--br" />
        <span className="ms-login-dots" />
      </div>

      <div className="container ms-login-wrap">
        <div className="ms-login-grid">
          <div className="ms-login-promo">
            <div className="ms-login-brand">
              <img src="/img/logo/techwagger-logo.png" alt="Techwagger" />
              <div>
                <strong>Techwagger</strong>
                <span>Learn. Assess. Achieve.</span>
              </div>
            </div>

            <h1>
              Welcome Back, <em>Learner!</em>
            </h1>
            <p className="ms-login-lead">
              Manage your examinations, assessments, and student activities from one centralized
              dashboard.
            </p>

            <ul className="ms-login-features">
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--purple">
                  <i className="ti-clipboard" aria-hidden />
                </span>
                <div>
                  <strong>Smart Exam Management</strong>
                  <span>Create, schedule, and monitor exams with ease</span>
                </div>
              </li>
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--green">
                  <i className="ti-bar-chart" aria-hidden />
                </span>
                <div>
                  <strong>Real-Time Performance</strong>
                  <span>Track student progress and results instantly</span>
                </div>
              </li>
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--blue">
                  <i className="ti-lock" aria-hidden />
                </span>
                <div>
                  <strong>Secure &amp; Reliable</strong>
                  <span>Enterprise-grade security for your assessments</span>
                </div>
              </li>
            </ul>

            <div className="ms-login-scene" aria-hidden>
              <div className="ms-login-plant">
                <span className="ms-login-plant-pot" />
                <span className="ms-login-plant-leaf ms-login-plant-leaf--l" />
                <span className="ms-login-plant-leaf ms-login-plant-leaf--r" />
              </div>
              <div className="ms-login-books">
                <span className="ms-login-book ms-login-book--1" />
                <span className="ms-login-book ms-login-book--2" />
              </div>
              <div className="ms-login-laptop">
                <div className="ms-login-laptop-screen">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="ms-login-laptop-base" />
              </div>
              <div className="ms-login-paper">
                <i className="ti-crown" />
                <strong>Online Exam</strong>
                <em />
                <em />
                <em />
              </div>
            </div>
          </div>

          <div className="ms-login-card">
            <div className="ms-login-card-hello">
              <i className="ti-user" aria-hidden />
              Hello, Learner!
            </div>
            <h2>Login to Techwagger</h2>
            <p className="ms-login-card-sub">
              Access your dashboard to manage examinations and monitor performance.
            </p>

            {mfaToken ? (
              <form onSubmit={onMfaSubmit} noValidate className="ms-login-form">
                {apiError && <p className="ms-login-error">{apiError}</p>}
                <p className="ms-login-hint">Enter your MFA backup code to continue.</p>
                <div className="ms-login-field">
                  <label htmlFor="mfaCode">MFA code</label>
                  <div className="ms-login-input-wrap">
                    <i className="ti-lock" aria-hidden />
                    <input
                      id="mfaCode"
                      className="ms-login-input"
                      placeholder="Enter MFA code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="ms-login-btn" disabled={submitting}>
                  {submitting ? 'Verifying...' : 'Verify & Log In →'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleLoginSubmit(onLogin)}
                noValidate
                autoComplete="off"
                className="ms-login-form"
              >
                {apiError && <p className="ms-login-error">{apiError}</p>}

                <div className="ms-login-field">
                  <label htmlFor="loginId">Email or Enrollment No.</label>
                  <div className="ms-login-input-wrap">
                    <i className="ti-email" aria-hidden />
                    <input
                      id="loginId"
                      className={inputClassName('ms-login-input', !!loginErrors.loginId)}
                      type="text"
                      inputMode="text"
                      placeholder="Enter your email or enrollment number"
                      autoComplete="username"
                      {...registerLogin('loginId')}
                    />
                  </div>
                  <FormError message={loginErrors.loginId?.message} />
                </div>

                <div className="ms-login-field">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="ms-login-input-wrap ms-login-input-wrap--pass">
                    <i className="ti-lock" aria-hidden />
                    <PasswordInput
                      id="loginPassword"
                      inputClass="ms-login-input"
                      hasError={!!loginErrors.password}
                      placeholder="Enter your password"
                      autoComplete={rememberMe ? 'current-password' : 'off'}
                      {...registerLogin('password')}
                    />
                  </div>
                  <FormError message={loginErrors.password?.message} />
                </div>

                <div className="ms-login-meta">
                  <label className="ms-login-remember" htmlFor="rememberMe">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRememberMe(checked);
                        if (!checked) clearRememberedLogin();
                      }}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="ms-login-forgot">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className="ms-login-btn" disabled={submitting}>
                  {submitting ? 'Logging in...' : 'Log In →'}
                </button>

                <p className="ms-login-secure">
                  <i className="ti-lock" aria-hidden />
                  Secure access to your examination management dashboard.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="ms-login-copy">© {new Date().getFullYear()} Techwagger. All rights reserved.</p>
      </div>
    </section>
  );
}
