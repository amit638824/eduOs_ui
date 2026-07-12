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

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setApiError('');
    setMessage('');
    try {
      const result = await authService.forgotPassword(values.email);
      setMessage((result.message as string) ?? 'Check your email for reset instructions.');
      if (result.devResetToken) {
        setDevToken(result.devResetToken as string);
      }
    } catch (err) {
      setApiError(parseApiError(err));
    }
  };

  return (
    <>
      <Breadcrumb title="Forgot Password" />
      <div className="loginarea auth-page-section">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-md-8 offset-md-2" data-aos="fade-up">
              <div className="loginarea__wraper">
                <div className="login__heading">
                  <h3 className="login__title">Reset your password</h3>
                  <p>Enter your email and we will send reset instructions.</p>
                </div>
                {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
                {message && <p className="form-success sp_bottom_15">{message}</p>}
                {devToken && (
                  <p className="sp_bottom_15">
                    Dev reset token: <code>{devToken}</code>{' '}
                    <Link to={`/reset-password?token=${devToken}`}>Reset now</Link>
                  </p>
                )}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="login__form">
                    <input
                      type="email"
                      className={inputClassName('common__login__input', !!errors.email)}
                      placeholder="Email"
                      autoComplete="off"
                      {...register('email')}
                    />
                    <FormError message={errors.email?.message} />
                  </div>
                  <button type="submit" className="default__button auth-submit-btn w-100">
                    Send Reset Link
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
