import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { EdtpAlert } from '@/components/ui/CrudUI';
import { formatDateTime } from '@/utils/dateFormat';
import PageBanner from '@/components/eduleb/PageBanner';

export default function VerifyCertificatePage() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') ?? '');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runVerify = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter a certificate number or verification code.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await examinationService.verifyCertificatePublic(trimmed);
      setResult(data);
      setParams(trimmed ? { code: trimmed } : {});
    } catch (err) {
      setError(parseApiError(err));
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

  return (
    <div className="eduleb-verify-page">
      <PageBanner
        title="Verify Certificate"
        crumb="Verify"
        tone="soft"
        subtitle="Enter the certificate number or verification code printed on the PDF."
      />

      <section className="eduleb-verify-body eduleb-page-merge">
        <div className="container eduleb-verify-wrap">
          <form
            className="eduleb-verify-card"
            onSubmit={(e) => {
              e.preventDefault();
              void runVerify(code);
            }}
          >
            <label className="eduleb-verify-label" htmlFor="verify-code">
              Certificate / verification code
            </label>
            <input
              id="verify-code"
              className="eduleb-verify-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. EDM-2026-… or ABC12DEF34"
              autoComplete="off"
            />
            <button type="submit" className="eduleb-verify-btn" disabled={loading}>
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </form>

          {error && (
            <div className="sp_top_20">
              <EdtpAlert type="error">{error}</EdtpAlert>
            </div>
          )}

          {result && (
            <div
              className={`eduleb-verify-result${valid ? ' is-valid' : ' is-invalid'}`}
            >
              <h5 className="mb-2">{valid ? 'Authentic certificate' : 'Not valid'}</h5>
              <p className="text-muted">{String(result.message ?? '')}</p>
              {valid && (
                <dl className="eduleb-verify-dl">
                  <div>
                    <strong>Student:</strong> {String(result.student_name ?? '—')}
                  </div>
                  <div>
                    <strong>Enrollment No:</strong> {String(result.enrollment_no ?? '—')}
                  </div>
                  <div>
                    <strong>Exam:</strong> {String(result.test_title ?? '—')}
                  </div>
                  <div>
                    <strong>Organization:</strong> {String(result.organization ?? '—')}
                  </div>
                  <div>
                    <strong>Performance:</strong> {Number(result.percentage ?? 0).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Certificate No:</strong> {String(result.certificate_no ?? '—')}
                  </div>
                  <div>
                    <strong>Verification code:</strong> {String(result.verification_code ?? '—')}
                  </div>
                  <div>
                    <strong>Status:</strong> {String(result.status ?? '—')}
                  </div>
                  <div>
                    <strong>Issued:</strong> {formatDateTime(result.issued_at as string)}
                  </div>
                </dl>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
