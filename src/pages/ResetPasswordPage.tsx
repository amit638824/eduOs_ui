import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FormError, PasswordInput } from '@/components/ui/FormField';
import { parseApiError } from '@/lib/errors';
import * as authService from '@/services/auth.service';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/validators/schemas';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: tokenFromUrl,
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password') || '';
  const confirmVal = watch('confirmPassword') || '';

  // Suppress warnings on the first 1-4 keystrokes while user is actively typing.
  // Show warnings only once they type at least 5 letters, OR if they submit the form.
  const showPasswordError = Boolean(
    errors.password?.message && (hasSubmitted || passwordVal.length >= 5)
  );

  const showConfirmError = Boolean(
    errors.confirmPassword?.message && (hasSubmitted || confirmVal.length >= 4)
  );

  useEffect(() => {
    if (tokenFromUrl) setValue('token', tokenFromUrl);
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setHasSubmitted(true);
    setApiError('');
    setSubmitting(true);
    try {
      await authService.resetPassword(values.token, values.password);
      setMessage('Your password has been reset. Redirecting to login…');
      window.setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Reset Password" />
      <div className="loginarea auth-page-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8" data-aos="fade-up">
              <div className="loginarea__wraper auth-card">
                <div className="login__heading">
                  <h3 className="login__title">Set a new password</h3>
                  <p className="login__description">
                    Choose a strong password for your account.
                  </p>
                </div>

                {!tokenFromUrl && (
                  <div className="auth-alert auth-alert--error" role="alert">
                    Reset link is missing or invalid.{' '}
                    <Link to="/forgot-password">Request a new link</Link>
                  </div>
                )}
                {apiError && (
                  <div className="auth-alert auth-alert--error" role="alert">
                    {apiError}
                  </div>
                )}
                {message && (
                  <div className="auth-alert auth-alert--success" role="status">
                    {message}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit, () => setHasSubmitted(true))}
                  noValidate
                >
                  <input type="hidden" {...register('token')} />
                  <FormError message={errors.token?.message} />

                  <div className="login__form">
                    <label className="form__label" htmlFor="resetPassword">
                      New password
                    </label>
                    <div className="ms-login-input-wrap ms-login-input-wrap--pass">
                      <svg
                        className="ms-input-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <PasswordInput
                        id="resetPassword"
                        inputClass="ms-login-input"
                        placeholder="Enter a new password"
                        hasError={showPasswordError}
                        autoComplete="new-password"
                        disabled={!tokenFromUrl || submitting}
                        {...register('password')}
                      />
                    </div>
                    <FormError message={showPasswordError ? errors.password?.message : undefined} />
                  </div>

                  <div className="login__form">
                    <label className="form__label" htmlFor="resetConfirmPassword">
                      Confirm password
                    </label>
                    <div className="ms-login-input-wrap ms-login-input-wrap--pass">
                      <svg
                        className="ms-input-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <PasswordInput
                        id="resetConfirmPassword"
                        inputClass="ms-login-input"
                        placeholder="Re-enter your password"
                        hasError={showConfirmError}
                        autoComplete="new-password"
                        disabled={!tokenFromUrl || submitting}
                        {...register('confirmPassword')}
                      />
                    </div>
                    <FormError message={showConfirmError ? errors.confirmPassword?.message : undefined} />
                  </div>

                  <div className="login__button">
                    <button
                      type="submit"
                      className="default__button auth-submit-btn"
                      disabled={!tokenFromUrl || submitting}
                    >
                      {submitting ? 'Saving…' : 'Reset password'}
                    </button>
                  </div>
                </form>

                <p className="auth-back-link">
                  <Link to="/login">Back to login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
