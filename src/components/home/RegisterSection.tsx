import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function RegisterSection() {
  const { register } = siteContent;

  return (
    <div className="registerarea sp_top_90">
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
              <form onSubmit={(e) => e.preventDefault()}>
                <input className="register__input" type="text" placeholder="Full Name" />
                <div className="row">
                  <div className="col-xl-6">
                    <input className="register__input" type="email" placeholder="Email Address" />
                  </div>
                  <div className="col-xl-6">
                    <input className="register__input" type="tel" placeholder="Phone (US)" />
                  </div>
                </div>
                <input className="register__input" type="text" placeholder="School / Institution" />
                <textarea
                  className="register__input textarea"
                  cols={30}
                  rows={4}
                  defaultValue="Tell us which exams you're preparing for..."
                />
                <div className="registerarea__button">
                  <Link className="default__button" to="/register">
                    Sign Up Free
                    <i className="icofont-long-arrow-right" />
                  </Link>
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
