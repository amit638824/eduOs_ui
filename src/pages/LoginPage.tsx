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
    <section className="eduleb-login-page">
        <div className="container">
          <div className="eduleb-login-shell" data-aos="fade-up">
            <div className="eduleb-login-aside">
              <div className="eduleb-login-logo-wrap">
                <img
                  src="/img/logo/techwagger-logo.png"
                  alt="Techwagger"
                  className="eduleb-login-logo"
                />
              </div>
              <h2>Welcome back</h2>
              <p>
                Sign in to continue your mock tests, track scores, and pick up where you left off.
              </p>
              <ul className="eduleb-login-perks">
                <li>
                  <i className="ti-check" aria-hidden /> Realistic exam experience
                </li>
                <li>
                  <i className="ti-check" aria-hidden /> Detailed performance analysis
                </li>
                <li>
                  <i className="ti-check" aria-hidden /> Personalized practice insights
                </li>
              </ul>
            </div>

            <div className="eduleb-login-card">
              <div className="eduleb-login-card-head">
                <h3>Log in to Mindsprint</h3>
                <p>Enter your credentials to access your dashboard</p>
              </div>

              {mfaToken ? (
                <form onSubmit={onMfaSubmit} noValidate className="eduleb-login-form">
                  {apiError && <p className="eduleb-login-error">{apiError}</p>}
                  <p className="eduleb-login-hint">Enter your MFA backup code to continue.</p>
                  <div className="eduleb-login-field">
                    <label htmlFor="mfaCode">MFA code</label>
                    <input
                      id="mfaCode"
                      className="eduleb-login-input"
                      placeholder="Enter MFA code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="eduleb-login-submit" disabled={submitting}>
                    {submitting ? 'Verifying...' : 'Verify & Log In'}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleLoginSubmit(onLogin)}
                  noValidate
                  autoComplete="off"
                  className="eduleb-login-form"
                >
                  {apiError && <p className="eduleb-login-error">{apiError}</p>}

                  <div className="eduleb-login-field">
                    <label htmlFor="loginId">Email or Enrollment No.</label>
                    <input
                      id="loginId"
                      className={inputClassName('eduleb-login-input', !!loginErrors.loginId)}
                      type="text"
                      inputMode="text"
                      placeholder="you@example.com or ENR-2026-0001"
                      autoComplete="username"
                      {...registerLogin('loginId')}
                    />
                    <FormError message={loginErrors.loginId?.message} />
                  </div>

                  <div className="eduleb-login-field">
                    <label htmlFor="loginPassword">Password</label>
                    <PasswordInput
                      id="loginPassword"
                      inputClass="eduleb-login-input"
                      hasError={!!loginErrors.password}
                      placeholder="Enter your password"
                      autoComplete={rememberMe ? 'current-password' : 'off'}
                      {...registerLogin('password')}
                    />
                    <FormError message={loginErrors.password?.message} />
                  </div>

                  <div className="eduleb-login-meta">
                    <label className="eduleb-login-remember" htmlFor="rememberMe">
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
                    <Link to="/forgot-password" className="eduleb-login-forgot">
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" className="eduleb-login-submit" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log In'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}
