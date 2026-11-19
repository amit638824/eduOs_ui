import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@/styles/mindsprint-home.css';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
            <div className="cta-box">
              <div>
                <h2>Let's make online exams simpler.</h2>
                <p>
                  Looking for an online examination solution for your school or coaching institute? Connect with the
                  MindSprint team to discuss your requirements and request a demo.
                </p>
              </div>
              <a className="btn" href="mailto:connect@techwagger.com?subject=MindSprint%20Demo%20Request">
                Request a Demo&nbsp; →
              </a>
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
                <a href="mailto:connect@techwagger.com">Contact Sales</a>
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
