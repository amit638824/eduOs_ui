import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { parseApiError } from '@/lib/errors';
import * as authService from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/validators/schemas';

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError('');
    setMessage('');
    setSubmitting(true);
    try {
      const result = await authService.forgotPassword(values.email);
      setMessage(
        (result.message as string) ??
          'If an account exists for this email, you will receive reset instructions shortly.',
      );
      if (result.devResetToken) {
        setDevToken(result.devResetToken as string);
      }
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Forgot Password" />
      <div className="loginarea auth-page-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8" data-aos="fade-up">
              <div className="loginarea__wraper auth-card">
                <div className="login__heading">
                  <h3 className="login__title">Reset your password</h3>
                  <p className="login__description">
                    Enter your email and we will send reset instructions.
                  </p>
                </div>

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
                {devToken && (
                  <p className="login__hint auth-dev-token">
                    Dev reset token:{' '}
                    <Link to={`/reset-password?token=${devToken}`}>Open reset link</Link>
                  </p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="login__form">
                    <label className="form__label" htmlFor="forgotEmail">
                      Email address
                    </label>
                    <input
                      id="forgotEmail"
                      type="email"
                      className={inputClassName('common__login__input', !!errors.email)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...register('email')}
                    />
                    <FormError message={errors.email?.message} />
                  </div>
                  <div className="login__button">
                    <button
                      type="submit"
                      className="default__button auth-submit-btn"
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : 'Send reset link'}
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
