import { useState, useEffect } from 'react';
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

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'activation_needed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status !== 'idle' && status !== 'loading') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      notify.warning('Please fill in all required fields.');
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
          _subject: formData.subject.trim()
            ? `[Mindsprint Contact] ${formData.subject.trim()}`
            : `[Mindsprint Contact] New Message from ${formData.name.trim()}`,
          message: formData.message.trim(),
          _captcha: 'false',
          _template: 'table',
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && (result?.success === 'true' || result?.success === true)) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        notify.success('Your message has been sent successfully!');
      } else if (
        result?.message &&
        typeof result.message === 'string' &&
        result.message.toLowerCase().includes('activation')
      ) {
        setStatus('activation_needed');
        notify.info('Form activation email sent! Please check your inbox.');
      } else {
        const msg = result?.message || 'Failed to send message. Please try again later.';
        setStatus('error');
        setErrorMessage(msg);
        notify.error(msg);
      }
    } catch {
      const msg = 'Unable to connect to the email service. Please check your internet connection.';
      setStatus('error');
      setErrorMessage(msg);
      notify.error(msg);
    }
  };

  return (
    <>
      <PageBanner title="Contact" crumb="Contact" />
      <section className="contact_area section-padding eduleb-contact">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-5 col-sm-12 col-xs-12">
              <div className="contact_info">
                <h4>Contact Info</h4>
                <p>
                  Have a question about exams, courses, or institute onboarding? Reach out and our
                  team will get back to you shortly.
                </p>
                <div className="sf_contact">
                  <span className="ti-map" />
                  <p>{contact.address}</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-mobile" />
                  <p>{contact.phone}</p>
                </div>
                <div className="sf_contact">
                  <span className="ti-email" />
                  <p>{contact.email}</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-sm-12 col-xs-12">
              <div className="contact eduleb-contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="form-group col-md-6">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control eduleb-contact-input"
                        placeholder="Name"
                        required
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control eduleb-contact-input"
                        placeholder="Email"
                        required
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-control eduleb-contact-input"
                        placeholder="Subject"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div className="form-group col-md-12">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-control eduleb-contact-input eduleb-contact-textarea"
                        rows={6}
                        placeholder="Message"
                        required
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div className="col-md-12">
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
                            padding: '12px 16px',
                            backgroundColor: '#fffbeb',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            fontSize: '14px',
                            marginTop: '16px',
                          }}
                        >
                          <strong>Action Required:</strong> An activation email has been sent to <strong>{CONTACT_RECIPIENT_EMAIL}</strong>. Please check your inbox (or Spam folder) and click the <em>&quot;Activate Form&quot;</em> link once to begin receiving messages.
                        </div>
                      )}

                      {status === 'error' && (
                        <div
                          className="alert alert-danger mt-3"
                          style={{
                            borderRadius: '8px',
                            padding: '12px 16px',
                            backgroundColor: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            fontSize: '14px',
                            marginTop: '16px',
                          }}
                        >
                          <strong>Error:</strong> {errorMessage || 'Failed to send message. Please try again.'}
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
