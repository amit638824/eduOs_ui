import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PasswordInput, inputClassName } from '@/components/ui/FormField';
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
      {/* Background accents: Left organic leaves + Top right dot matrix + Bottom right ambient glow */}
      <div className="ms-login-blobs" aria-hidden>
        {/* Left side ambient leaves matching reference */}
        <svg className="ms-login-leaf-art" viewBox="0 0 260 600" fill="none">
          <path
            d="M-40 60 C40 40 120 110 90 200 C60 280 -40 260 -40 260 Z"
            fill="#dbeafe"
            fillOpacity="0.55"
          />
          <path
            d="M-50 220 C20 180 130 240 120 340 C110 430 0 410 -50 410 Z"
            fill="#bae6fd"
            fillOpacity="0.45"
          />
          <path
            d="M-30 360 C30 320 90 380 75 440 C60 490 -30 470 -30 470 Z"
            fill="#c7d2fe"
            fillOpacity="0.4"
          />
          <path
            d="M-60 440 C40 410 110 490 80 570 C50 630 -60 620 -60 620 Z"
            fill="#e0e7ff"
            fillOpacity="0.5"
          />
        </svg>

        {/* Top-right dotted grid accent matching reference */}
        <div className="ms-login-dots-grid" />

        {/* Bottom-right soft ambient glow */}
        <span className="ms-login-ambient-glow" />
      </div>

      <div className="container ms-login-wrap">
        <div className="ms-login-grid">
          {/* LEFT PROMO COLUMN */}
          <div className="ms-login-promo">
            <div className="ms-login-brand">
              <div className="ms-brand-logo-wrap">
                <img src="/img/logo/techwagger-logo.png" alt="Techwagger" className="ms-brand-logo-img" />
              </div>
              <div>
                <strong>Mindsprint</strong>
                <span>Learn. Assess. Achieve.</span>
              </div>
            </div>

            <h1 className="ms-login-main-title">
              Welcome <span className="ms-highlight-blue">Back!</span>
            </h1>
            <p className="ms-login-lead">
              Manage your examinations, assessments, and student activities from one centralized dashboard.
            </p>

            <ul className="ms-login-features">
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <div>
                  <strong>Smart Exam Management</strong>
                  <span>Create, organize, and manage online examinations with ease.</span>
                </div>
              </li>
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
                <div>
                  <strong>Real-Time Performance</strong>
                  <span>Track student results, assessment scores, and overall performance.</span>
                </div>
              </li>
              <li>
                <span className="ms-login-feat-icon ms-login-feat-icon--blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </span>
                <div>
                  <strong>Secure &amp; Reliable</strong>
                  <span>Manage exams and student records through a secure platform.</span>
                </div>
              </li>
            </ul>

            {/* High-fidelity Vector Desk Scene */}
            <div className="ms-login-scene" aria-hidden>
              <svg
                className="ms-login-vector-art"
                viewBox="0 0 440 210"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soft ground shadow */}
                <ellipse cx="225" cy="188" rx="195" ry="12" fill="#e2e8f0" fillOpacity="0.6" />

                {/* Stack of books on the left */}
                <g>
                  {/* Bottom book: Royal Blue */}
                  <rect x="24" y="176" width="76" height="12" rx="2" fill="#2563eb" />
                  <rect x="24" y="178" width="73" height="8" rx="1" fill="#1d4ed8" />
                  <line x1="28" y1="180" x2="28" y2="184" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="32" y1="180" x2="32" y2="184" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="96" y="178" width="4" height="8" fill="#ffffff" />

                  {/* Top book: Purple, slightly angled */}
                  <g transform="rotate(-3 28 168)">
                    <rect x="28" y="164" width="72" height="12" rx="2" fill="#7c3aed" />
                    <rect x="28" y="166" width="69" height="8" rx="1" fill="#6d28d9" />
                    <line x1="32" y1="168" x2="32" y2="172" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="96" y="166" width="4" height="8" fill="#ffffff" />
                  </g>
                </g>

                {/* Potted Plant */}
                <g>
                  <path d="M48 156 L52 180 Q52 183 55 183 L69 183 Q72 183 72 180 L76 156 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
                  <rect x="46" y="153" width="32" height="4" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
                  <path d="M62 153 Q58 120 62 106 Q69 124 62 153 Z" fill="#22c55e" />
                  <path d="M60 144 Q40 126 43 112 Q56 124 60 144 Z" fill="#16a34a" />
                  <path d="M64 144 Q83 126 80 112 Q68 124 64 144 Z" fill="#4ade80" />
                  <path d="M62 135 Q53 117 59 104 Q66 119 62 135 Z" fill="#86efac" />
                </g>

                {/* Open Laptop */}
                <g>
                  {/* Base */}
                  <path d="M102 182 L266 182 Q269 182 267 186 L261 189 Q259 190 255 190 L113 190 Q109 190 107 186 L101 186 Q99 182 102 182 Z" fill="#94a3b8" />
                  <rect x="156" y="184" width="56" height="3" rx="1.5" fill="#cbd5e1" />

                  {/* Screen Frame */}
                  <rect x="112" y="90" width="144" height="92" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="184" cy="94" r="1.5" fill="#64748b" />

                  {/* Screen Content Area */}
                  <rect x="117" y="98" width="134" height="80" rx="4" fill="#ffffff" />

                  {/* Top Bar inside Screen */}
                  <rect x="117" y="98" width="134" height="8" fill="#f1f5f9" />
                  <circle cx="122" cy="102" r="1.5" fill="#ef4444" />
                  <circle cx="127" cy="102" r="1.5" fill="#f59e0b" />
                  <circle cx="132" cy="102" r="1.5" fill="#10b981" />
                  <rect x="146" y="100.5" width="40" height="3" rx="1.5" fill="#cbd5e1" />

                  {/* Left Sidebar inside Screen */}
                  <rect x="117" y="106" width="22" height="72" fill="#1e293b" />
                  <circle cx="128" cy="113" r="2.5" fill="#3861fb" />
                  <circle cx="128" cy="121" r="2.5" fill="#94a3b8" />
                  <circle cx="128" cy="129" r="2.5" fill="#94a3b8" />
                  <circle cx="128" cy="137" r="2.5" fill="#94a3b8" />
                  <circle cx="128" cy="145" r="2.5" fill="#94a3b8" />

                  {/* Content widgets inside screen */}
                  <rect x="143" y="110" width="48" height="22" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                  <rect x="147" y="113" width="16" height="2" rx="1" fill="#94a3b8" />
                  <rect x="147" y="117" width="26" height="3.5" rx="1" fill="#0f172a" />
                  <rect x="147" y="124" width="40" height="2.5" rx="1.2" fill="#e2e8f0" />
                  <rect x="147" y="124" width="28" height="2.5" rx="1.2" fill="#2563eb" />

                  <rect x="195" y="110" width="52" height="22" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                  <rect x="199" y="113" width="16" height="2" rx="1" fill="#94a3b8" />
                  <rect x="199" y="117" width="22" height="3.5" rx="1" fill="#0f172a" />
                  <rect x="199" y="124" width="44" height="2.5" rx="1.2" fill="#e2e8f0" />
                  <rect x="199" y="124" width="34" height="2.5" rx="1.2" fill="#10b981" />

                  {/* Bar Chart widget */}
                  <rect x="143" y="136" width="58" height="38" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                  <rect x="147" y="139" width="20" height="2" rx="1" fill="#94a3b8" />
                  <line x1="147" y1="168" x2="195" y2="168" stroke="#e2e8f0" strokeWidth="0.8" />
                  <rect x="150" y="155" width="6" height="13" rx="1.5" fill="#8b5cf6" />
                  <rect x="159" y="147" width="6" height="21" rx="1.5" fill="#3b82f6" />
                  <rect x="168" y="151" width="6" height="17" rx="1.5" fill="#06b6d4" />
                  <rect x="177" y="142" width="6" height="26" rx="1.5" fill="#2563eb" />
                  <rect x="186" y="149" width="6" height="19" rx="1.5" fill="#10b981" />

                  {/* Donut Chart widget */}
                  <rect x="205" y="136" width="42" height="38" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
                  <rect x="209" y="139" width="18" height="2" rx="1" fill="#94a3b8" />
                  <circle cx="226" cy="157" r="10" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="226" cy="157" r="10" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="38 60" strokeDashoffset="10" />
                  <circle cx="226" cy="157" r="10" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="18 60" strokeDashoffset="-28" />
                </g>

                {/* Floating Analytics Speech Bubble */}
                <g transform="translate(232, 42)">
                  <circle cx="22" cy="22" r="19" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
                  <path d="M15 36 L20 32 L13 32 Z" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
                  <rect x="12" y="22" width="3.5" height="9" rx="1" fill="#3b82f6" />
                  <rect x="18" y="17" width="3.5" height="14" rx="1" fill="#2563eb" />
                  <rect x="24" y="13" width="3.5" height="18" rx="1" fill="#1d4ed8" />
                  <circle cx="26" cy="10" r="1.5" fill="#f59e0b" />
                </g>

                {/* Online Exam Card */}
                <g>
                  <rect x="290" y="94" width="86" height="92" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <rect x="290" y="94" width="86" height="24" rx="8" fill="#eff6ff" />
                  <rect x="290" y="110" width="86" height="8" fill="#eff6ff" />
                  <text x="333" y="110" textAnchor="middle" fill="#2563eb" fontSize="8.5" fontWeight="700" fontFamily="Roboto, sans-serif">
                    Online Exam
                  </text>

                  {/* Checklist items */}
                  <rect x="299" y="126" width="7" height="7" rx="1.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
                  <path d="M301 129.5 L302.5 131 L306 127.5" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="310" y="128" width="54" height="3" rx="1.5" fill="#94a3b8" />

                  <rect x="299" y="139" width="7" height="7" rx="1.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
                  <path d="M301 142.5 L302.5 144 L306 140.5" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="310" y="141" width="44" height="3" rx="1.5" fill="#94a3b8" />

                  <rect x="299" y="152" width="7" height="7" rx="1.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
                  <path d="M301 155.5 L302.5 157 L306 153.5" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="310" y="154" width="50" height="3" rx="1.5" fill="#94a3b8" />

                  {/* Progress bar */}
                  <rect x="299" y="168" width="67" height="4" rx="2" fill="#e2e8f0" />
                  <rect x="299" y="168" width="48" height="4" rx="2" fill="#2563eb" />
                </g>

                {/* Graduation Cap floating above the Exam Card */}
                <g transform="translate(320, 64) rotate(-8)">
                  <path d="M26 12 L0 23 L26 34 L52 23 Z" fill="#1e293b" />
                  <path d="M12 28.5 V37 C12 37 17 42 26 42 C35 42 40 37 40 37 V28.5" fill="#0f172a" />
                  <circle cx="26" cy="23" r="2.5" fill="#f59e0b" />
                  <path d="M26 23 Q38 27 45 36" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="45" cy="38" r="2" fill="#f59e0b" />
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT FLOATING LOGIN CARD */}
          <div className="ms-login-card">
            <h2>Login to Mindsprint</h2>
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
                    <svg className="ms-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="mfaCode"
                      className="ms-login-input"
                      placeholder="Enter MFA code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ms-error-slot" />
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
                    <svg className="ms-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
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
                  <div className="ms-error-slot" aria-live="polite">
                    {loginErrors.loginId?.message && (
                      <span className="ms-error-text">{loginErrors.loginId.message}</span>
                    )}
                  </div>
                </div>

                <div className="ms-login-field">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="ms-login-input-wrap ms-login-input-wrap--pass">
                    <svg className="ms-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <PasswordInput
                      id="loginPassword"
                      inputClass="ms-login-input"
                      hasError={!!loginErrors.password}
                      placeholder="Enter your password"
                      autoComplete={rememberMe ? 'current-password' : 'off'}
                      {...registerLogin('password')}
                    />
                  </div>
                  <div className="ms-error-slot" aria-live="polite">
                    {loginErrors.password?.message && (
                      <span className="ms-error-text">{loginErrors.password.message}</span>
                    )}
                  </div>
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
                
                  <span>Secure access to your examination management dashboard.</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
