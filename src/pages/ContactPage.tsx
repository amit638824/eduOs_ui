import { useState, useEffect, useRef } from 'react';
import PageBanner from '@/components/eduleb/PageBanner';
import { siteContent } from '@/data/siteContent';
import { notify } from '@/lib/toast';

// Target email address where contact messages are sent.
const CONTACT_RECIPIENT_EMAIL = 'connect@techwagger.com';

export default function ContactPage() {
  const { contact } = siteContent;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'activation_needed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    // Split on whitespace or punctuation delimiters
    const tokens = trimmed.split(/[\s,;:/|]+/i).filter(Boolean);
    let total = 0;
    for (const token of tokens) {
      if (token.length > 15) {
        // Continuous unspaced text (e.g. keyboard mash or long unbroken letters): every 5 characters counts as a word
        total += Math.ceil(token.length / 5);
      } else {
        total += 1;
      }
    }
    return total;
  };

  const wordCount = countWords(formData.message);

  const trimToMaxWords = (text: string, maxWords: number = 300): string => {
    if (countWords(text) <= maxWords) return text;
    let low = 0;
    let high = text.length;
    let best = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const sub = text.slice(0, mid);
      if (countWords(sub) <= maxWords) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return text.slice(0, best).trimEnd();
  };

  const lastWordLimitWarnRef = useRef<number>(0);

  const triggerLimitWarning = (customMsg?: string) => {
    const msg = customMsg || 'Word limit reached! You cannot type more than 300 words.';
    const now = Date.now();
    if (now - lastWordLimitWarnRef.current > 1200) {
      lastWordLimitWarnRef.current = now;
      notify.warning(msg);
    }
  };

  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Always allow modifier shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Cmd+..., etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Always allow navigation and deletion keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Tab',
      'Escape',
    ];
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // If user has text selected in textarea, typing replaces it, so allow typing (onChange/onPaste will validate word count)
    const target = e.currentTarget;
    if (target.selectionStart !== target.selectionEnd) {
      return;
    }

    const currentText = formData.message;
    const currentWords = countWords(currentText);

    // If 300 words are already reached:
    if (currentWords >= 300) {
      // 1. If pressing Space or Enter: user is attempting to start a 301st word
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerLimitWarning();
        return;
      }

      // 2. If the text already ends with whitespace or delimiter, 300 words are completed and any char would start word 301
      if (/[\s,;:/|]$/.test(currentText)) {
        e.preventDefault();
        triggerLimitWarning();
        return;
      }

      // 3. If the current token being typed has already reached the single-word max limit (15 chars)
      const lastToken = currentText.split(/[\s,;:/|]+/).pop() || '';
      if (lastToken.length >= 15) {
        e.preventDefault();
        triggerLimitWarning();
        return;
      }
    }
  };

  const handleMessagePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText) return;

    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const currentVal = formData.message;
    const simulatedVal = currentVal.slice(0, start) + pasteText + currentVal.slice(end);

    const totalWords = countWords(simulatedVal);
    if (totalWords > 300) {
      e.preventDefault();
      const clamped = trimToMaxWords(simulatedVal, 300);
      setFormData((prev) => ({ ...prev, message: clamped }));
      triggerLimitWarning('Maximum limit reached (300 words). Pasted text was trimmed.');

      if (clamped.trim().length >= 10) {
        setErrors((prev) => ({ ...prev, message: '' }));
      }
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Name is required.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (trimmed.length > 30) return 'Name cannot exceed 30 characters.';
        if (!/^[A-Za-z]/.test(trimmed)) return 'Name must start with a letter.';
        if (!/^[A-Za-z][A-Za-z\s'-]*$/.test(trimmed)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
        }
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
        return '';
      }
      case 'subject': {
        const trimmed = value.trim();
        if (!trimmed) return 'Subject is required.';
        if (trimmed.length < 3) return 'Subject must be at least 3 characters.';
        return '';
      }
      case 'message': {
        const trimmed = value.trim();
        if (!trimmed) return 'Message is required.';
        if (trimmed.length < 10) return 'Message must be at least 10 characters.';
        const words = countWords(trimmed);
        if (words > 300) return `Message cannot exceed 300 words (currently ${words} words).`;
        return '';
      }
      default:
        return '';
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'message') {
      const words = countWords(value);
      if (words > 300) {
        // Hard block typing/pasting beyond 300 words by clamping to exactly 300 words
        const clamped = trimToMaxWords(value, 300);
        setFormData((prev) => ({ ...prev, message: clamped }));
        triggerLimitWarning();
        setErrors((prev) => ({
          ...prev,
          message: 'Maximum limit of 300 words reached.',
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, message: value }));

      if (touched.message) {
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, message: err }));
      } else {
        setErrors((prev) => ({ ...prev, message: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const err = validateField(name, value);
      if (touched[name as keyof typeof touched] || (name === 'name' && value.trim().length > 30)) {
        setErrors((prev) => ({ ...prev, [name]: err }));
      }
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
    const subjectErr = validateField('subject', formData.subject);
    const messageErr = validateField('message', formData.message);

    const validationErrors = {
      name: nameErr,
      email: emailErr,
      subject: subjectErr,
      message: messageErr,
    };

    setErrors(validationErrors);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (wordCount > 300) {
      notify.warning(`Message exceeds the 300-word limit (currently ${wordCount} words). Please shorten your message.`);
      return;
    }

    if (nameErr || emailErr || subjectErr || messageErr) {
      notify.warning('Please fix the errors in the form before submitting.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_RECIPIENT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          _subject: `[Mindsprint Contact] ${formData.subject.trim()}`,
          message: formData.message.trim(),
          _captcha: 'false',
          _template: 'table',
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && (result?.success === 'true' || result?.success === true)) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTouched({ name: false, email: false, subject: false, message: false });
        setErrors({});
        notify.success('Your message has been sent successfully!');
      } else if (
        result?.message &&
        typeof result.message === 'string' &&
        result.message.toLowerCase().includes('activation')
      ) {
        setStatus('activation_needed');
        notify.info('Activation pending on recipient mailbox. You can also send directly via email client.');
      } else {
        const msg = result?.message || 'Failed to submit via online form. Please use the direct email link below.';
        setStatus('error');
        setErrorMessage(msg);
        notify.error(msg);
      }
    } catch {
      const msg = 'Unable to connect to the email service. You can send your message directly using the email client link below.';
      setStatus('error');
      setErrorMessage(msg);
      notify.error(msg);
    }
  };

  const mailtoUrl = `mailto:${CONTACT_RECIPIENT_EMAIL}?subject=${encodeURIComponent(
    formData.subject.trim() ? `[Mindsprint Contact] ${formData.subject.trim()}` : '[Mindsprint Contact] Inquiry'
  )}&body=${encodeURIComponent(
    `Name: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nMessage:\n${formData.message.trim()}`
  )}`;

  return (
    <>
      <PageBanner
        title="Contact"
        crumb="Contact"
        tone="soft"
        subtitle="Have a question about exams, courses, or institute onboarding? Reach out and our team will get back to you shortly."
      />
      <section className="contact_area section-padding eduleb-contact eduleb-page-merge">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-5 col-sm-12 col-xs-12">
              <div className="contact_info">
                <h4>Contact Info</h4>
                <p style={{ marginBottom: '28px', color: '#64748b', lineHeight: 1.6 }}>
                  Have a question about exams, courses, or institute onboarding? Reach out and our
                  team will get back to you shortly.
                </p>
                <div className="sf_contact" style={{ marginBottom: '16px' }}>
                  <span className="ti-map" />
                  <p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                      title="View location on Google Maps"
                    >
                      {contact.address}
                    </a>
                  </p>
                </div>
                <div className="sf_contact" style={{ marginBottom: '16px' }}>
                  <span className="ti-mobile" />
                  <p>
                    <a
                      href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                      title="Call us directly"
                    >
                      {contact.phone}
                    </a>
                  </p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email" />
                  <p>
                    <a
                      href={`mailto:${contact.email}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                      title="Send us an email"
                    >
                      {contact.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-sm-12 col-xs-12">
              <div className="contact eduleb-contact-form">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="form-group col-md-6 mb-3">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={50}
                        className={`form-control eduleb-contact-input ${(touched.name || formData.name.trim().length > 30) && errors.name ? 'is-invalid' : ''}`}
                        placeholder="Name *"
                        required
                        disabled={status === 'loading'}
                        style={(touched.name || formData.name.trim().length > 30) && errors.name ? { borderColor: '#ef4444' } : {}}
                      />
                      {(touched.name || formData.name.trim().length > 30) && errors.name && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          {errors.name}
                        </div>
                      )}
                    </div>
                    <div className="form-group col-md-6 mb-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`form-control eduleb-contact-input ${touched.email && errors.email ? 'is-invalid' : ''}`}
                        placeholder="Email *"
                        required
                        disabled={status === 'loading'}
                        style={touched.email && errors.email ? { borderColor: '#ef4444' } : {}}
                      />
                      {touched.email && errors.email && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div className="form-group col-md-12 mb-3">
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`form-control eduleb-contact-input ${touched.subject && errors.subject ? 'is-invalid' : ''}`}
                        placeholder="Subject *"
                        required
                        disabled={status === 'loading'}
                        style={touched.subject && errors.subject ? { borderColor: '#ef4444' } : {}}
                      />
                      {touched.subject && errors.subject && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          {errors.subject}
                        </div>
                      )}
                    </div>
                    <div className="form-group col-md-12 mb-2">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onKeyDown={handleMessageKeyDown}
                        onPaste={handleMessagePaste}
                        onBlur={handleBlur}
                        className={`form-control eduleb-contact-input eduleb-contact-textarea ${((touched.message && errors.message) || wordCount >= 300) ? 'is-invalid' : ''}`}
                        rows={6}
                        placeholder="Message (max 300 words) *"
                        required
                        disabled={status === 'loading'}
                        style={wordCount >= 300 ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.15)' } : (touched.message && errors.message) ? { borderColor: '#ef4444' } : {}}
                      />
                      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap" style={{ gap: '6px' }}>
                        <div>
                          {wordCount >= 300 ? (
                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <i className="ti-alert" />
                              Maximum limit of 300 words reached. Typing is disabled until words are removed.
                            </span>
                          ) : touched.message && errors.message ? (
                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                              {errors.message}
                            </span>
                          ) : null}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: wordCount >= 300 ? '#ef4444' : wordCount >= 280 ? '#b45309' : '#64748b',
                            marginLeft: 'auto',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: wordCount >= 300 ? '#fee2e2' : wordCount >= 280 ? '#fef3c7' : '#f1f5f9',
                            border: wordCount >= 300 ? '1px solid #fca5a5' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {wordCount} / 300 words {wordCount >= 300 ? '(Limit Reached)' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-12 mt-2">
                      <button
                        type="submit"
                        className="btn_one eduleb-contact-btn"
                        disabled={status === 'loading'}
                        style={{
                          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                          opacity: status === 'loading' ? 0.8 : 1,
                        }}
                      >
                        {status === 'loading' ? (
                          <>
                            Sending...{' '}
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                              style={{
                                marginLeft: 6,
                                display: 'inline-block',
                                width: 14,
                                height: 14,
                                borderWidth: 2,
                              }}
                            />
                          </>
                        ) : (
                          <>
                            Send Message <i className="ti-arrow-top-right" />
                          </>
                        )}
                      </button>

                      {status === 'success' && (
                        <div
                          className="alert alert-success mt-3"
                          style={{
                            borderRadius: '8px',
                            padding: '12px 16px',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            fontSize: '14px',
                            marginTop: '16px',
                          }}
                        >
                          <strong>Success!</strong> Your message has been sent successfully. We will get back to you shortly.
                        </div>
                      )}

                      {status === 'activation_needed' && (
                        <div
                          className="alert alert-warning mt-3"
                          style={{
                            borderRadius: '8px',
                            padding: '14px 16px',
                            backgroundColor: '#fffbeb',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            fontSize: '14px',
                            marginTop: '16px',
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <strong>Form Activation Required:</strong> FormSubmit requires a one-time activation. An activation link was sent to <strong>{CONTACT_RECIPIENT_EMAIL}</strong>.
                          </div>
                          <div>
                            You can send your message directly via your email client right now:
                          </div>
                          <a
                            href={mailtoUrl}
                            className="btn_one eduleb-contact-btn mt-2"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '12px',
                              padding: '6px 14px',
                              textDecoration: 'none',
                            }}
                          >
                            Open in Email Client <i className="ti-arrow-top-right" />
                          </a>
                        </div>
                      )}

                      {status === 'error' && (
                        <div
                          className="alert alert-danger mt-3"
                          style={{
                            borderRadius: '8px',
                            padding: '14px 16px',
                            backgroundColor: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            fontSize: '14px',
                            marginTop: '16px',
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <strong>Submission Error:</strong> {errorMessage || 'Failed to send message.'}
                          </div>
                          <div>
                            You can send your message directly to us via your email client:
                          </div>
                          <a
                            href={mailtoUrl}
                            className="btn_one eduleb-contact-btn mt-2"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '12px',
                              padding: '6px 14px',
                              textDecoration: 'none',
                            }}
                          >
                            Send via Email Client <i className="ti-arrow-top-right" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
