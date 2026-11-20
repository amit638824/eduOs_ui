import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/errors';
import type { ApiResponse } from '@/types/api';
import '@/styles/mindsprint-home.css';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Demo / Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    subject: false,
    message: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  }>({});

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Name is required.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (trimmed.length > 50) return 'Name cannot exceed 50 characters.';
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
        return '';
      }
      case 'phone': {
        const trimmed = value.trim();
        if (trimmed && !/^[0-9+\-\s()]{7,20}$/.test(trimmed)) {
          return 'Please enter a valid phone number.';
        }
        return '';
      }
      case 'subject': {
        const trimmed = value.trim();
        if (!trimmed) return 'Institute or organization name is required.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
      case 'message': {
        const trimmed = value.trim();
        if (!trimmed) return 'Please tell us about your requirements.';
        if (trimmed.length < 10) return 'Message must be at least 10 characters.';
        if (value.length > 300) return 'Message cannot exceed 300 characters.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 300) {
      return;
    }
    const formatted =
      (name === 'name' || name === 'subject') && value.length === 1
        ? value.toUpperCase()
        : value;

    setFormData((prev) => ({ ...prev, [name]: formatted }));

    if (touched[name as keyof typeof touched]) {
      const err = validateField(name, formatted);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }

    if (status !== 'idle' && status !== 'loading') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField('phone', formData.phone);
    const subjectErr = validateField('subject', formData.subject);
    const messageErr = validateField('message', formData.message);

    const validationErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      subject: subjectErr,
      message: messageErr,
    };

    setErrors(validationErrors);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });

    if (nameErr || emailErr || phoneErr || subjectErr || messageErr) {
      notify.warning('Please fill in the required fields correctly.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data } = await api.post<ApiResponse<{ message: string }>>('/public/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: `[Demo Request] ${formData.subject.trim()}`,
        message: formData.message.trim(),
      });

      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTouched({ name: false, email: false, phone: false, subject: false, message: false });
        setErrors({});
        notify.success('Your demo request has been sent successfully! Our team will reach out shortly.');
      } else {
        const msg = data.message || 'Failed to submit demo request. Please try again.';
        setStatus('error');
        setErrorMessage(msg);
        notify.error(msg);
      }
    } catch (err) {
      const msg = parseApiError(err) || 'Unable to send demo request. Please email vivek@techwagger.com directly.';
      setStatus('error');
      setErrorMessage(msg);
      notify.error(msg);
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMenuOpen(false);

    if (window.location.pathname !== '/') {
      navigate('/' + targetId);
      return;
    }

    const id = targetId.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', targetId);
    }
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <>
      <div className="top">
        <div className="wrap">
          <span>Online Examination • Mock Tests • Assessments</span>
          <span>
            <b>For Schools</b> &nbsp;|&nbsp; <b>For Coaching Institutes</b> &nbsp;|&nbsp; <b>For Learners</b>
          </span>
        </div>
      </div>

      <header>
        <div className="wrap nav">
          <a className="logo" href="#home" onClick={(e) => scrollToSection(e, '#home')} aria-label="MindSprint Home">
            <img src="/img/logo/mindsprint-logo.png" alt="MindSprint" />
          </a>
          <nav className={`links ${menuOpen ? 'show' : ''}`} id="links">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')}>
              Home
            </a>
            <a href="#audience" onClick={(e) => scrollToSection(e, '#audience')}>
              Solutions
            </a>
            <a href="#features" onClick={(e) => scrollToSection(e, '#features')}>
              Why MindSprint
            </a>
            <a href="#how" onClick={(e) => scrollToSection(e, '#how')}>
              How It Works
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
              Contact
            </a>
          </nav>
          <div className="nav-cta">
            <Link className="btn outline" to="/login" onClick={handleLoginClick}>
              Login
            </Link>
            <a className="btn primary" href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
              Request a Demo&nbsp; →
            </a>
            <button
              className="menu"
              aria-label="Open menu"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="wrap hero-grid">
            <div>
              <div className="pill">
                <i className="dot" /> Your online examination partner
              </div>
              <h1>
                Prepare better.
                <br />
                Perform with <span>confidence.</span>
              </h1>
              <p className="intro">
                Bring online exams, mock tests and assessments together with MindSprint. A convenient digital
                examination experience for schools, coaching institutes and learners across India.
              </p>
              <div className="actions">
                <a className="btn primary" href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
                  Explore MindSprint&nbsp; →
                </a>
                <a className="btn outline" href="#audience" onClick={(e) => scrollToSection(e, '#audience')}>
                  Discover Solutions
                </a>
              </div>
              <div className="subnote">
                <span className="check">✓</span>
                <span>For academic assessments, practice tests and mock examinations</span>
              </div>
            </div>
            <div className="visual">
              <div className="float float-a">
                <span className="float-icon">📝</span>
                <strong>Mock Tests</strong>
                <small>Practise with purpose</small>
              </div>

              <div className="exam-window">
                <div className="window-head">
                  <b>MindSprint&nbsp; / &nbsp;Sample Assessment</b>
                  <span className="status">● ONLINE TEST</span>
                </div>
                <div className="mock-title">
                  <small>DEMO EXAM INTERFACE</small>
                  <h3>Practice Assessment</h3>
                  <small>Sample question preview</small>
                </div>
                <div className="question">
                  <small>QUESTION 01 &nbsp; • &nbsp; GENERAL AWARENESS</small>
                  <p>Which is the capital of Madhya Pradesh?</p>
                  <div className="option">A. Indore</div>
                  <div className="option selected">B. Bhopal &nbsp; ✓</div>
                  <div className="option">C. Jabalpur</div>
                  <div className="option">D. Gwalior</div>
                </div>
                <div className="window-foot">
                  <span>Sample interface preview</span>
                  <Link to="/exams" className="mini-btn">
                    Next Question&nbsp; →
                  </Link>
                </div>
              </div>

              <div className="float float-b">
                <span className="float-icon">🎯</span>
                <strong>Online Assessments</strong>
                <small>One digital destination</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="audience">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">Who can use MindSprint?</div>
              <h2>Made for India's learning ecosystem</h2>
              <p>Support your institution's examination needs with an online platform for assessments and practice.</p>
            </div>
            <div className="audience">
              <article className="card">
                <div className="ico">🏫</div>
                <h3>Schools & Colleges</h3>
                <p>Conduct academic assessments and organise online examinations for your students.</p>
              </article>
              <article className="card">
                <div className="ico">🎓</div>
                <h3>Coaching Institutes</h3>
                <p>Offer mock tests and practice assessments to help learners prepare consistently.</p>
              </article>
              <article className="card">
                <div className="ico">📖</div>
                <h3>Students & Aspirants</h3>
                <p>Access online tests and practise in a digital examination environment.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section feature-band" id="features">
          <div className="wrap feature-grid">
            <div className="left">
              <div className="eyebrow">A focused exam experience</div>
              <h2>Everything starts with a better assessment experience.</h2>
              <p>
                MindSprint is designed around the core needs of online examinations, mock tests and assessments. Give
                your learners and institution a clear digital space for testing and practice.
              </p>
              <a className="btn primary" href="#contact">
                Discuss Your Requirements&nbsp; →
              </a>
            </div>
            <div className="feature-list">
              <div className="feature">
                <span className="symbol">💻</span>
                <b>Online Examinations</b>
                <small>Conduct assessments through a digital platform.</small>
              </div>
              <div className="feature">
                <span className="symbol">🎯</span>
                <b>Mock Tests</b>
                <small>Support practice and exam preparation.</small>
              </div>
              <div className="feature">
                <span className="symbol">📋</span>
                <b>Assessments</b>
                <small>Organise tests around your learning requirements.</small>
              </div>
              <div className="feature">
                <span className="symbol">🏢</span>
                <b>Institution Use</b>
                <small>Designed for schools and coaching institutes.</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">Simple to get started</div>
              <h2>Take your assessments online</h2>
              <p>Start a conversation with our team to explore how MindSprint can fit your examination process.</p>
            </div>
            <div className="steps">
              <article className="step">
                <span className="num">01</span>
                <h3>Share Your Requirements</h3>
                <p>Tell us about your school, coaching institute or assessment needs.</p>
              </article>
              <article className="step">
                <span className="num">02</span>
                <h3>Explore the Platform</h3>
                <p>Connect with our team for a walkthrough of the MindSprint portal.</p>
              </article>
              <article className="step">
                <span className="num">03</span>
                <h3>Get Started</h3>
                <p>Plan your online examination and mock-test journey with MindSprint.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="cta" id="contact">
          <div className="wrap">
            <div className="ms-demo-box">
              {/* Left Column: Platform info & benefits */}
              <div className="ms-demo-info">
                <span className="ms-demo-eyebrow">Request a Demo</span>
                <h2>Let's make online exams simpler.</h2>
                <p>
                  Looking for an online examination solution for your school, college, or coaching institute?
                  Connect with the MindSprint team for a live walkthrough, test paper authoring preview, and personalized onboarding plan.
                </p>

                <div className="ms-demo-perks">
                  <div className="ms-demo-perk-item">
                    <span className="ms-demo-check">✓</span>
                    <div>
                      <strong>Complete Platform Walkthrough</strong>
                      <span>Live demo of question bank, exam authoring, proctoring, and grading.</span>
                    </div>
                  </div>
                  <div className="ms-demo-perk-item">
                    <span className="ms-demo-check">✓</span>
                    <div>
                      <strong>Customized for Your Institution</strong>
                      <span>Tailored setup for schools, universities, coaching centers, and training hubs.</span>
                    </div>
                  </div>
                  <div className="ms-demo-perk-item">
                    <span className="ms-demo-check">✓</span>
                    <div>
                      <strong>Instant Pilot &amp; Academic Support</strong>
                      <span>Quick onboarding with dedicated technical and examination controller help.</span>
                    </div>
                  </div>
                </div>

                <div className="ms-demo-direct-contact">
                  <div className="ms-demo-contact-chip">
                    <span className="ms-chip-icon">📞</span>
                    <div>
                      <small>Call us directly</small>
                      <a href="tel:+918840622729">+91 8840 622 729</a>
                    </div>
                  </div>
                  <div className="ms-demo-contact-chip">
                    <span className="ms-chip-icon">✉️</span>
                    <div>
                      <small>Email our team</small>
                      <a href="mailto:vivek@techwagger.com">vivek@techwagger.com</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Working Form */}
              <div className="ms-demo-form-card">
                <h3>Schedule Your Demo</h3>
                <p className="ms-demo-card-subtitle">
                  Fill in your details below and our team will get in touch shortly.
                </p>

                {status === 'success' ? (
                  <div className="ms-demo-success-box">
                    <div className="ms-demo-success-icon">✓</div>
                    <h4>Thank You!</h4>
                    <p>Your demo request has been submitted successfully. Our team will contact you within 24 hours.</p>
                    <button
                      type="button"
                      className="btn primary ms-demo-reset-btn"
                      onClick={() => setStatus('idle')}
                    >
                      Send Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="ms-demo-form">
                    {errorMessage && (
                      <div className="auth-alert auth-alert--error" role="alert" style={{ marginBottom: 12 }}>
                        {errorMessage}
                      </div>
                    )}

                    <div className="ms-demo-field-row">
                      <div className="ms-demo-field">
                        <label htmlFor="demo-name">
                          Full Name <span>*</span>
                        </label>
                        <input
                          id="demo-name"
                          type="text"
                          name="name"
                          placeholder="e.g. Dr. Rajesh Kumar"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={status === 'loading'}
                          className={errors.name && touched.name ? 'is-invalid' : ''}
                        />
                        {errors.name && touched.name && <span className="ms-demo-error">{errors.name}</span>}
                      </div>

                      <div className="ms-demo-field">
                        <label htmlFor="demo-email">
                          Email Address <span>*</span>
                        </label>
                        <input
                          id="demo-email"
                          type="email"
                          name="email"
                          placeholder="name@school.edu.in"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={status === 'loading'}
                          className={errors.email && touched.email ? 'is-invalid' : ''}
                        />
                        {errors.email && touched.email && <span className="ms-demo-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="ms-demo-field-row">
                      <div className="ms-demo-field">
                        <label htmlFor="demo-phone">
                          Phone Number
                        </label>
                        <input
                          id="demo-phone"
                          type="tel"
                          name="phone"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={status === 'loading'}
                          className={errors.phone && touched.phone ? 'is-invalid' : ''}
                        />
                        {errors.phone && touched.phone && <span className="ms-demo-error">{errors.phone}</span>}
                      </div>

                      <div className="ms-demo-field">
                        <label htmlFor="demo-subject">
                          Institute / Organization <span>*</span>
                        </label>
                        <input
                          id="demo-subject"
                          type="text"
                          name="subject"
                          placeholder="School / College / Coaching Name"
                          value={formData.subject}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={status === 'loading'}
                          className={errors.subject && touched.subject ? 'is-invalid' : ''}
                        />
                        {errors.subject && touched.subject && <span className="ms-demo-error">{errors.subject}</span>}
                      </div>
                    </div>

                    <div className="ms-demo-field">
                      <div className="ms-demo-label-row">
                        <label htmlFor="demo-message">
                          Message / Requirements <span>*</span>
                        </label>
                        <span className={`ms-demo-char-count${formData.message.length >= 300 ? ' is-max' : ''}`}>
                          {formData.message.length}/300 characters
                        </span>
                      </div>
                      <textarea
                        id="demo-message"
                        name="message"
                        rows={3}
                        maxLength={300}
                        placeholder="Tell us about student count, types of exams, or preferred demo timings... (Max 300 characters)"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={status === 'loading'}
                        className={errors.message && touched.message ? 'is-invalid' : ''}
                      />
                      {errors.message && touched.message && <span className="ms-demo-error">{errors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className="btn primary ms-demo-submit-btn"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Submitting Request...' : 'Request a Demo →'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="footgrid">
            <div>
              <a
                className="logo footer-logo-badge"
                href="#home"
                onClick={(e) => scrollToSection(e, '#home')}
                aria-label="MindSprint Home"
              >
                <img src="/img/logo/mindsprint-logo.png" alt="MindSprint" />
              </a>
              <p>
                Online exams, mock tests and assessments — bringing a smarter digital examination experience to
                India's learning community.
              </p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footlinks">
                <a href="#audience" onClick={(e) => scrollToSection(e, '#audience')}>
                  Solutions
                </a>
                <a href="#features" onClick={(e) => scrollToSection(e, '#features')}>
                  Why MindSprint
                </a>
                <a href="#how" onClick={(e) => scrollToSection(e, '#how')}>
                  How It Works
                </a>
              </div>
            </div>
            <div>
              <h4>Get Started</h4>
              <div className="footlinks">
                <Link to="/login" onClick={handleLoginClick}>
                  Login to Portal
                </Link>
                <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
                  Request a Demo
                </a>
                <a href="mailto:vivek@techwagger.com">Contact Sales</a>
              </div>
            </div>
          </div>
          <div className="copyright">
            <span>© {new Date().getFullYear()} MindSprint. All rights reserved.</span>
            <span>Learn • Practise • Progress</span>
          </div>
        </div>
      </footer>
    </>
  );
}
