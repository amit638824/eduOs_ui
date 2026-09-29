import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { EdtpBtn, EdtpField, EdtpAlert } from '@/components/ui/CrudUI';
import { formatDateTime } from '@/utils/dateFormat';
import { siteContent } from '@/data/siteContent';

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
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="text-center sp_bottom_30">
        <img src={siteContent.brand.logo} alt={siteContent.brand.name} height={48} />
        <h1 className="mt-3" style={{ fontSize: '1.75rem' }}>
          Verify Certificate
        </h1>
        <p className="text-muted mb-0">
          Enter the certificate number or verification code printed on the PDF.
        </p>
      </div>

      <form
        className="edtp-form-card"
        onSubmit={(e) => {
          e.preventDefault();
          void runVerify(code);
        }}
      >
        <EdtpField label="Certificate / verification code" htmlFor="verify-code">
          <input
            id="verify-code"
            className="register__input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. EDM-2026-… or ABC12DEF34"
            autoComplete="off"
          />
        </EdtpField>
        <EdtpBtn type="submit" variant="primary" size="md" disabled={loading}>
          {loading ? 'Checking…' : 'Verify'}
        </EdtpBtn>
      </form>

      {error && (
        <div className="sp_top_20">
          <EdtpAlert type="error">{error}</EdtpAlert>
        </div>
      )}

      {result && (
        <div
          className="edtp-form-card sp_top_20"
          style={{
            borderColor: valid ? '#16a34a' : '#dc2626',
            borderWidth: 2,
          }}
        >
          <h5 className="mb-2">{valid ? 'Authentic certificate' : 'Not valid'}</h5>
          <p className="text-muted">{String(result.message ?? '')}</p>
          {valid && (
            <dl className="mb-0" style={{ display: 'grid', gap: 8 }}>
              <div>
                <strong>Student:</strong> {String(result.student_name ?? '—')}
              </div>
              <div>
                <strong>Exam:</strong> {String(result.test_title ?? '—')}
              </div>
              <div>
                <strong>Organization:</strong> {String(result.organization ?? '—')}
              </div>
              <div>
                <strong>Score:</strong> {String(result.score ?? '—')} (
                {Number(result.percentage ?? 0).toFixed(1)}%)
              </div>
              <div>
                <strong>Certificate No:</strong> {String(result.certificate_no ?? '—')}
              </div>
              <div>
                <strong>Issued:</strong> {formatDateTime(result.issued_at as string)}
              </div>
              <div>
                <strong>Fingerprint:</strong>{' '}
                <code className="edtp-code">{String(result.fingerprint ?? '')}</code>
              </div>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
