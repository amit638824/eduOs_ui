import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  FiAward,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiDownload,
  FiPrinter,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { examinationService } from '@/services';
import type { Certificate } from '@/services/examination.service';
import { parseApiError } from '@/lib/errors';
import { EdtpAlert } from '@/components/ui/CrudUI';
import { formatDate, formatDateTime } from '@/utils/dateFormat';
import PageBanner from '@/components/eduleb/PageBanner';
import { downloadCertificateReactPdf } from '@/pdf/downloadCertificate';
import '@/styles/certificate-verification.css';

export default function VerifyCertificatePage() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') ?? '');
  const [lastVerifiedCode, setLastVerifiedCode] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const runVerify = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a certificate number or verification code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await examinationService.verifyCertificatePublic(trimmed);
      setResult(data);
      if (data.valid === true) {
        setLastVerifiedCode(trimmed.toUpperCase());
      }
      setParams(trimmed ? { code: trimmed } : {});
    } catch (err) {
      setError(parseApiError(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = params.get('code');
    if (initial) void runVerify(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = result?.valid === true;
  const isAlreadyVerified =
    valid &&
    Boolean(lastVerifiedCode) &&
    code.trim().toUpperCase() === lastVerifiedCode;

  // Generate QR code for the verified certificate
  useEffect(() => {
    if (result && valid) {
      const vCode = String(result.verification_code || code);
      const url = `${window.location.origin}/verify-certificate?code=${encodeURIComponent(vCode)}`;
      QRCode.toDataURL(url, { margin: 1, width: 140 })
        .then(setQrUrl)
        .catch(() => undefined);
    } else {
      setQrUrl('');
    }
  }, [result, valid, code]);

  const handleCopyCode = async () => {
    if (!result?.verification_code) return;
    try {
      await navigator.clipboard.writeText(String(result.verification_code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || !valid) return;
    setPdfBusy(true);
    try {
      const certForPdf: Certificate = {
        id: String(result.certificate_no ?? 'cert'),
        result_id: '',
        student_id: '',
        certificate_no: String(result.certificate_no ?? ''),
        verification_code: String(result.verification_code ?? ''),
        status: (result.status as 'issued' | 'revoked') ?? 'issued',
        issued_at: String(result.issued_at ?? new Date().toISOString()),
        test_title: String(result.test_title ?? 'Examination'),
        percentage: Number(result.percentage ?? 0),
        student_name: String(result.student_name ?? 'Student'),
        org_name: String(result.organization ?? 'MindSprint'),
        enrollment_no: result.enrollment_no ? String(result.enrollment_no) : null,
      };
      await downloadCertificateReactPdf(certForPdf);
    } catch (err) {
      console.error('Failed to download certificate PDF:', err);
    } finally {
      setPdfBusy(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const studentName = String(result?.student_name || 'Student Name');
  const testTitle = String(result?.test_title || 'Examination');
  const orgName = String(result?.organization || 'MindSprint');
  const enrollmentNo = result?.enrollment_no ? String(result.enrollment_no) : null;
  const certificateNo = String(result?.certificate_no || '—');
  const verificationCode = String(result?.verification_code || '—');
  const status = String(result?.status || 'issued');
  const issuedAt = String(result?.issued_at || new Date().toISOString());
  const scorePercentage = Number(result?.percentage ?? 0);
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate?code=${encodeURIComponent(verificationCode)}`;

  return (
    <div className="eduleb-verify-page">
      <PageBanner
        title="Verify Certificate"
        crumb="Verify"
        tone="soft"
        subtitle="Enter the certificate number or verification code printed on the PDF."
      />

      <section className="eduleb-verify-body eduleb-page-merge">
        <div className="container eduleb-verify-wrap ms-verify-container">
          {/* Certificate Verification Input Form */}
          <form
            className="eduleb-verify-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isAlreadyVerified) {
                void runVerify(code);
              }
            }}
          >
            <label className="eduleb-verify-label" htmlFor="verify-code">
              Certificate / verification code
            </label>
            <input
              id="verify-code"
              className="eduleb-verify-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              placeholder="e.g. EDM-2026-… or ABC12DEF34"
              autoComplete="off"
            />
            {isAlreadyVerified ? (
              <button
                type="button"
                className="eduleb-verify-btn is-verified"
                disabled={true}
                title="Certificate is already verified"
              >
                <FiCheck style={{ marginRight: 6, fontSize: 16 }} />
                Verified
              </button>
            ) : (
              <button
                type="submit"
                className="eduleb-verify-btn"
                disabled={loading}
              >
                {loading ? 'Checking…' : 'Verify'}
              </button>
            )}
          </form>

          {error && (
            <div className="sp_top_20">
              <EdtpAlert type="error">{error}</EdtpAlert>
            </div>
          )}

          {/* Invalid result state */}
          {result && !valid && (
            <div className="eduleb-verify-result is-invalid">
              <h5 className="mb-2">Not valid</h5>
              <p className="text-muted">{String(result.message ?? 'No certificate found for this code.')}</p>
            </div>
          )}

          {/* Verified Result Card (Manager's Layout) */}
          {result && valid && (
            <>
              <div className="ms-cert-verify-card">
                {/* Header */}
                <div className="ms-cert-verify-card__header">
                  <div className="ms-cert-verify-brand">
                    <div className="ms-cert-brand-icon">
                      <FiAward />
                    </div>
                    <div>
                      <strong className="ms-cert-brand-title">MINDSPRINT</strong>
                      <span className="ms-cert-brand-sub">CERTIFICATION PORTAL</span>
                    </div>
                  </div>
                  <span className="ms-cert-badge-official">
                    <FiShield /> Official Verification
                  </span>
                </div>

                {/* Hero Seal */}
                <div className="ms-cert-hero">
                  <div className="ms-cert-hero-icon">
                    <FiCheckCircle />
                  </div>
                  <h3 className="ms-cert-hero-title">Certificate Verified</h3>
                  <p className="ms-cert-hero-sub">
                    This certificate is authentic and verified against official records.
                  </p>
                  <span className="ms-cert-hero-pill">VALID CERTIFICATE</span>
                </div>

                {/* Content Sections */}
                <div className="ms-cert-body">
                  {/* Section 1: Student Information */}
                  <div className="ms-cert-section">
                    <h5 className="ms-cert-section-title">Student Information</h5>
                    <div className="ms-cert-student-box">
                      <div className="ms-cert-avatar-row">
                        <div className="ms-cert-avatar">
                          <FiUser />
                        </div>
                        <div>
                          <h4 className="ms-cert-student-name">{studentName}</h4>
                          <span className="ms-cert-student-tag">Student</span>
                        </div>
                      </div>
                      <div className="ms-cert-student-grid">
                        <div>
                          <span className="ms-cert-meta-label">Enrollment Number</span>
                          <strong className="ms-cert-meta-val">{enrollmentNo || '—'}</strong>
                        </div>
                        <div>
                          <span className="ms-cert-meta-label">Examination</span>
                          <strong className="ms-cert-meta-val">{testTitle || '—'}</strong>
                        </div>
                        <div>
                          <span className="ms-cert-meta-label">Organization</span>
                          <strong className="ms-cert-meta-val">{orgName || 'MindSprint'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Examination Performance */}
                  <div className="ms-cert-section">
                    <h5 className="ms-cert-section-title">Examination Performance</h5>
                    <div className="ms-cert-perf-box">
                      <div className="ms-cert-perf-header">
                        <span className="ms-cert-meta-label">Overall Score</span>
                        <strong className="ms-cert-perf-score">{scorePercentage.toFixed(1)}%</strong>
                      </div>
                      <div className="ms-cert-perf-track">
                        <div
                          className="ms-cert-perf-fill"
                          style={{ width: `${Math.min(100, Math.max(0, scorePercentage))}%` }}
                        />
                      </div>
                      <span className="ms-cert-perf-rating">
                        {scorePercentage >= 80
                          ? 'Excellent performance'
                          : scorePercentage >= 60
                          ? 'Good performance'
                          : 'Passing performance'}
                      </span>
                    </div>
                  </div>

                  {/* Section 3: Certificate Details */}
                  <div className="ms-cert-section">
                    <h5 className="ms-cert-section-title">Certificate Details</h5>
                    <div className="ms-cert-details-box">
                      <div className="ms-cert-details-grid">
                        <div>
                          <span className="ms-cert-meta-label">Certificate Number</span>
                          <strong className="ms-cert-meta-val">{certificateNo}</strong>
                        </div>
                        <div>
                          <span className="ms-cert-meta-label">Verification Code</span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <strong className="ms-cert-meta-val">{verificationCode}</strong>
                            <button
                              type="button"
                              className="ms-cert-copy-btn"
                              onClick={handleCopyCode}
                              title={copied ? 'Copied!' : 'Copy verification code'}
                              aria-label="Copy verification code"
                            >
                              {copied ? <FiCheck style={{ color: '#059669' }} /> : <FiCopy />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="ms-cert-meta-label">Certificate Status</span>
                          <span
                            className={`ms-cert-status-badge ms-cert-status-badge--${
                              status.toLowerCase() === 'revoked' ? 'revoked' : 'issued'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <div>
                          <span className="ms-cert-meta-label">Issued Date</span>
                          <strong className="ms-cert-meta-val">{formatDateTime(issuedAt)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authenticity Confirmed Banner */}
                  <div className="ms-cert-confirmed-banner">
                    <FiCheckCircle className="ms-cert-confirmed-icon" />
                    <div>
                      <strong>Authenticity Confirmed</strong>
                      <p>The certificate details match the official records of {orgName}.</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ms-cert-actions">
                    <button
                      type="button"
                      className="ms-cert-btn-download"
                      onClick={handleDownloadPdf}
                      disabled={pdfBusy}
                    >
                      <FiDownload /> {pdfBusy ? 'Generating PDF…' : 'Download Certificate'}
                    </button>
                    <button type="button" className="ms-cert-btn-print" onClick={handlePrint}>
                      <FiPrinter /> Print Certificate
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="ms-cert-footer">
                  <span>Powered by {orgName} · Secure Certificate Verification System</span>
                </div>
              </div>

              {/* Original Issued Certificate (Matching Manager's Specification) */}
              <div className="ms-authentic-cert-wrap">
                <div className="ms-authentic-cert-header-bar">
                  <div>
                    <h4 className="ms-authentic-cert-section-title">Original Issued Certificate</h4>
                    <p className="ms-authentic-cert-section-desc">
                      Official cryptographically verified credential document
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="ms-cert-btn-sm"
                      onClick={handleDownloadPdf}
                      disabled={pdfBusy}
                    >
                      <FiDownload /> PDF
                    </button>
                    <button type="button" className="ms-cert-btn-sm" onClick={handlePrint}>
                      <FiPrinter /> Print
                    </button>
                  </div>
                </div>

                <div className="ms-authentic-cert-canvas" id="authentic-certificate-print-area">
                  {/* Geometric Double Corners */}
                  <div className="ms-corner-bracket ms-corner-bracket--tl" />
                  <div className="ms-corner-bracket-gold ms-corner-bracket-gold--tl" />
                  <div className="ms-corner-bracket ms-corner-bracket--tr" />
                  <div className="ms-corner-bracket-gold ms-corner-bracket-gold--tr" />
                  <div className="ms-corner-bracket ms-corner-bracket--bl" />
                  <div className="ms-corner-bracket-gold ms-corner-bracket-gold--bl" />
                  <div className="ms-corner-bracket ms-corner-bracket--br" />
                  <div className="ms-corner-bracket-gold ms-corner-bracket-gold--br" />

                  <div className="ms-authentic-cert-inner">
                    {/* Top Header */}
                    <div className="ms-authentic-cert-top">
                      <div className="ms-authentic-cert-brand">
                        <div className="ms-authentic-cert-logo-circle">Tw</div>
                        <div>
                          <div className="ms-authentic-cert-brand-name">MINDSPRINT</div>
                          <div className="ms-authentic-cert-brand-motto">IDEAS | SOLUTIONS | IMPACT</div>
                        </div>
                      </div>
                      <div className="ms-authentic-cert-slogan">
                        PEOPLE IDEAS TECHNOLOGY<br />A BRIGHTER TOMORROW
                      </div>
                    </div>

                    {/* Title Area */}
                    <div className="ms-authentic-cert-title-area">
                      <h1 className="ms-authentic-cert-title">CERTIFICATE</h1>
                      <div className="ms-authentic-cert-gold-rule" />
                      <h3 className="ms-authentic-cert-subtitle">OF APPRECIATION</h3>
                    </div>

                    {/* Recipient */}
                    <div className="ms-authentic-cert-recipient-area">
                      <span className="ms-authentic-cert-presented-to">PROUDLY PRESENTED TO</span>
                      <h2 className="ms-authentic-cert-name">{studentName}</h2>
                      <div className="ms-authentic-cert-name-underline" />
                    </div>

                    {/* Narrative */}
                    <p className="ms-authentic-cert-narrative">
                      In sincere appreciation of your successful completion of{' '}
                      <strong>{testTitle}</strong> and your dedication, effort, and commitment to
                      excellence. Your hard work and achievement have been recognized through this
                      certificate of appreciation. Thank you for your valuable contribution to{' '}
                      <strong>{orgName}</strong>. Keep learning, keep creating, keep inspiring!
                    </p>

                    {/* 3 Pillars */}
                    <div className="ms-authentic-cert-pillars">
                      <div className="ms-authentic-cert-pillar">
                        <span className="ms-pillar-label">CERTIFICATE ISSUE</span>
                        <strong className="ms-pillar-val">{formatDate(issuedAt)}</strong>
                      </div>
                      <div className="ms-authentic-cert-pillar">
                        <span className="ms-pillar-label">CERTIFICATE NO.</span>
                        <strong className="ms-pillar-val">{certificateNo}</strong>
                      </div>
                      <div className="ms-authentic-cert-pillar">
                        <span className="ms-pillar-label">PERFORMANCE</span>
                        <strong className="ms-pillar-val">{scorePercentage.toFixed(1)}%</strong>
                      </div>
                    </div>

                    {/* Bottom Area: Seal, Signature, QR */}
                    <div className="ms-authentic-cert-bottom">
                      <div className="ms-authentic-cert-seal">
                        <div className="ms-seal-outer">
                          <div className="ms-seal-inner">
                            <span className="ms-seal-top">MI</span>
                            <span className="ms-seal-bottom">AUTHENTIC</span>
                          </div>
                        </div>
                      </div>

                      <div className="ms-authentic-cert-sign">
                        <div className="ms-sign-line" />
                        <strong className="ms-sign-title">{orgName}</strong>
                        <span className="ms-sign-sub">Certificate Authority</span>
                      </div>

                      <div className="ms-authentic-cert-qr">
                        {qrUrl ? (
                          <img src={qrUrl} alt="Scan to verify" className="ms-qr-img" />
                        ) : (
                          <div className="ms-qr-placeholder" />
                        )}
                        <span className="ms-qr-label">Scan to verify</span>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="ms-authentic-cert-footer-text">
                      <div className="ms-footer-caps">INNOVATION INTO REALITY</div>
                      <div className="ms-footer-details">
                        Certificate No: {certificateNo} · Verification Code: {verificationCode} · Verify: {verifyUrl}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
