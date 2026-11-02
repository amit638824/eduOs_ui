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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      token: tokenFromUrl,
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (tokenFromUrl) setValue('token', tokenFromUrl);
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
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

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <input type="hidden" {...register('token')} />
                  <FormError message={errors.token?.message} />

                  <div className="login__form">
                    <label className="form__label" htmlFor="resetPassword">
                      New password
                    </label>
                    <PasswordInput
                      id="resetPassword"
                      inputClass="common__login__input"
                      placeholder="Enter a new password"
                      hasError={!!errors.password}
                      autoComplete="new-password"
                      disabled={!tokenFromUrl || submitting}
                      {...register('password')}
                    />
                    <FormError message={errors.password?.message} />
                  </div>

                  <div className="login__form">
                    <label className="form__label" htmlFor="resetConfirmPassword">
                      Confirm password
                    </label>
                    <PasswordInput
                      id="resetConfirmPassword"
                      inputClass="common__login__input"
                      placeholder="Re-enter your password"
                      hasError={!!errors.confirmPassword}
                      autoComplete="new-password"
                      disabled={!tokenFromUrl || submitting}
                      {...register('confirmPassword')}
                    />
                    <FormError message={errors.confirmPassword?.message} />
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
