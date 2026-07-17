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
      setMessage('Password reset successful. Redirecting to login…');
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
          <div className="row">
            <div className="col-xl-6 col-md-8 offset-md-2" data-aos="fade-up">
              <div className="loginarea__wraper">
                <div className="login__heading">
                  <h3 className="login__title">Set new password</h3>
                  <p>Choose a strong password for your account.</p>
                </div>
                {!tokenFromUrl && (
                  <p className="login__error sp_bottom_15">
                    Reset link is missing or invalid.{' '}
                    <Link to="/forgot-password">Request a new link</Link>
                  </p>
                )}
                {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
                {message && <p className="form-success sp_bottom_15">{message}</p>}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <input type="hidden" {...register('token')} />
                  <FormError message={errors.token?.message} />
                  <div className="login__form sp_bottom_15">
                    <PasswordInput
                      placeholder="New password"
                      hasError={!!errors.password}
                      autoComplete="new-password"
                      disabled={!tokenFromUrl || submitting}
                      {...register('password')}
                    />
                    <FormError message={errors.password?.message} />
                  </div>
                  <div className="login__form sp_bottom_15">
                    <PasswordInput
                      placeholder="Confirm password"
                      hasError={!!errors.confirmPassword}
                      autoComplete="new-password"
                      disabled={!tokenFromUrl || submitting}
                      {...register('confirmPassword')}
                    />
                    <FormError message={errors.confirmPassword?.message} />
                  </div>
                  <button
                    type="submit"
                    className="default__button auth-submit-btn w-100"
                    disabled={!tokenFromUrl || submitting}
                  >
                    {submitting ? 'Saving…' : 'Reset Password'}
                  </button>
                </form>
                <p className="sp_top_20 text-center">
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
