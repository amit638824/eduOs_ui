import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { inputClassName } from '@/components/ui/FormField';
import { parseApiError } from '@/lib/errors';
import * as authService from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/validators/schemas';

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!apiError && !message) return;
    const timer = window.setTimeout(() => {
      setApiError('');
      setMessage('');
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [apiError, message]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onInvalid = () => {
    setApiError('Please enter a registered email address.');
  };

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError('');
    setMessage('');
    setSubmitting(true);
    try {
      const result = await authService.forgotPassword(values.email);
      const resMsg = (result?.message as string) || '';
      if (!resMsg || resMsg.includes('If the email exists') || resMsg.includes('If an account exists')) {
        setMessage('Email sent successfully');
      } else {
        setMessage(resMsg || 'Email sent successfully');
      }
      if (result?.devResetToken) {
        setDevToken(result.devResetToken as string);
      }
    } catch (err) {
      const errMessage = parseApiError(err);
      if (
        !errMessage ||
        errMessage.toLowerCase().includes('validation failed') ||
        errMessage.toLowerCase().includes('validation')
      ) {
        setApiError('Please enter a registered email address.');
      } else if (
        errMessage.toLowerCase().includes('not registered') ||
        errMessage.toLowerCase().includes('not found') ||
        errMessage.toLowerCase() === 'user' ||
        errMessage.toLowerCase().includes('does not exist')
      ) {
        setApiError('This email address is not registered. Please enter a registered email address.');
      } else {
        setApiError(errMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="loginarea auth-page-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8" data-aos="fade-up">
              <div className="loginarea__wraper auth-card">
                <div className="login__heading">
                  <h3 className="login__title">Reset Your Password</h3>
                  <p className="login__description">
                    Enter your email address, and we'll send you a password reset link.
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

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
                  <div className="login__form">
                    <label className="form__label" htmlFor="forgotEmail">
                      Email Address
                    </label>
                    <input
                      id="forgotEmail"
                      type="email"
                      className={inputClassName('common__login__input', !!errors.email)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  <div className="login__button">
                    <button
                      type="submit"
                      className="default__button auth-submit-btn"
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>

                <p className="auth-back-link">
                  <Link to="/login">Back to Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
