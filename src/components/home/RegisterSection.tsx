import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';

export default function RegisterSection({ variant = 'default' }: { variant?: 'default' | 'auth' }) {
  const { register } = siteContent;
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const dashboardPath = await registerUser({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role: 'student',
      });
      navigate(dashboardPath);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={
        variant === 'auth'
          ? 'registerarea auth-register-section sp_top_50'
          : 'registerarea sp_top_90'
      }
    >
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="registerarea__wraper">
              <div className="section__title registerarea__section__title">
                <div className="section__title__button">
                  <div className="default__small__button">{register.badge}</div>
                </div>
                <div className="section__title__heading heading__underline">
                  <h2>
                    Create Your <span>Account</span> &amp; Get free access to{' '}
                    <small>{register.count}</small> practice tests
                  </h2>
                </div>
              </div>
              <div className="registerarea__content">
                <div className="registerarea__video">
                  <div className="video__pop__btn">
                    <a className="video-btn" href="https://www.youtube.com/watch?v=vHdclsdkp28">
                      <img loading="lazy" src="/img/icon/video.png" alt="Watch demo" />
                    </a>
                  </div>
                  <div className="registerarea__para">
                    <p>{register.videoText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="registerarea__form">
              <div className="registerarea__form__heading">
                <h4>{register.formTitle}</h4>
              </div>
              <form onSubmit={handleSubmit}>
                {error && <p className="login__error sp_bottom_15">{error}</p>}
                <div className="row">
                  <div className="col-xl-6">
                    <input
                      className="register__input"
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-xl-6">
                    <input
                      className="register__input"
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-6">
                    <input
                      className="register__input"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-xl-6">
                    <input
                      className="register__input"
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <input
                  className="register__input"
                  type="password"
                  placeholder="Password (min 8 chars, upper, lower, number, special)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="registerarea__button">
                  <button type="submit" className="default__button" disabled={submitting}>
                    {submitting ? 'Creating Account...' : 'Sign Up Free'}
                    <i className="icofont-long-arrow-right" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="registerarea__img">
        <img loading="lazy" className="register__1" src="/img/register/register__1.png" alt="" />
        <img loading="lazy" className="register__2" src="/img/register/register__2.png" alt="" />
        <img loading="lazy" className="register__3" src="/img/register/register__3.png" alt="" />
      </div>
    </div>
  );
}
