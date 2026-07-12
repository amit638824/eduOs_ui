import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('student1@edutech.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const dashboardPath = await login({ email, password });
      navigate(dashboardPath);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Log In" variant="compact" />
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
                      <h5 className="login__title">Login to EduTest Pro</h5>
                      <p className="login__description">
                        Don&apos;t have an account?{' '}
                        <Link to="/register">Sign up for free</Link>
                      </p>
                    </div>
                    <form onSubmit={handleLogin}>
                      {error && <p className="login__error sp_bottom_15">{error}</p>}
                      <div className="login__form">
                        <label className="form__label">Email address</label>
                        <input
                          className="common__login__input"
                          type="email"
                          placeholder="student1@edutech.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="login__form">
                        <label className="form__label">Password</label>
                        <input
                          className="common__login__input"
                          type="password"
                          placeholder="Password@123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="login__form d-flex justify-content-between flex-wrap gap-2">
                        <div className="form__check">
                          <input id="rememberMe" type="checkbox" />
                          <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <div className="text-end login__form__link">
                          <Link to="/help">Forgot password?</Link>
                        </div>
                      </div>
                      <div className="login__button">
                        <button type="submit" className="default__button" disabled={submitting}>
                          {submitting ? 'Logging in...' : 'Log In'}
                        </button>
                      </div>
                    </form>
                    <p className="login__hint sp_top_15">
                      Demo: student1@edutech.com · teacher1@edutech.com · orgadmin@edutech.com
                    </p>
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
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="login__form">
                        <label className="form__label">Full name</label>
                        <input className="common__login__input" type="text" placeholder="Your full name" />
                      </div>
                      <div className="login__form">
                        <label className="form__label">Email</label>
                        <input className="common__login__input" type="email" placeholder="you@school.edu" />
                      </div>
                      <div className="login__form">
                        <label className="form__label">Password</label>
                        <input className="common__login__input" type="password" placeholder="Create password" />
                      </div>
                      <div className="login__button">
                        <Link className="default__button" to="/register">
                          Sign Up Free
                        </Link>
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
