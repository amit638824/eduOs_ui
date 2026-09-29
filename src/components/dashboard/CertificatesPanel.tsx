import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examinationService } from '@/services';
import type { Certificate } from '@/services/examination.service';
import { parseApiError } from '@/lib/errors';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { EdtpBtn, EdtpAlert } from '@/components/ui/CrudUI';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/dateFormat';
import { showError, showSuccess, confirmAction } from '@/lib/swal';
import { downloadCertificateReactPdf } from '@/pdf/downloadCertificate';

export function CertificatesPanel({ mode = 'mine' }: { mode?: 'mine' | 'org' }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Certificate[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const withLoader = useDashboardLoader();
  const canRevoke =
    user?.roles.some((r) => ['super_admin', 'org_admin', 'staff'].includes(r)) ?? false;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'org') {
        const res = await examinationService.listCertificates(1, 100);
        setItems(res.data);
      } else {
        setItems(await examinationService.listMyCertificates());
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [mode]);

  useDashboardLoadingEffect(loading);

  const download = async (cert: Certificate) => {
    await withLoader(async () => {
      try {
        const full = await examinationService.getCertificate(cert.id).catch(() => cert);
        await downloadCertificateReactPdf(full);
        showSuccess('Downloaded', 'Certificate PDF saved.');
      } catch (err) {
        showError('Download failed', parseApiError(err));
      }
    });
  };

  const revoke = async (cert: Certificate) => {
    const ok = await confirmAction({
      title: 'Revoke certificate?',
      text: `${cert.certificate_no} will no longer verify as authentic.`,
      confirmText: 'Yes, revoke',
      confirmColor: '#d33',
    });
    if (!ok) return;
    await withLoader(async () => {
      try {
        await examinationService.revokeCertificate(cert.id);
        showSuccess('Revoked');
        await load();
      } catch (err) {
        showError('Revoke failed', parseApiError(err));
      }
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Credentials"
        title={mode === 'org' ? 'Certificates' : 'My Certificates'}
        subtitle={
          mode === 'org'
            ? 'Issued exam certificates for this organization. Students can verify publicly with the verification code.'
            : 'Download your certificates and share the verification code for authenticity checks.'
        }
      />
      <div className="dashboard__content__wraper">
        {error && <EdtpAlert type="error">{error}</EdtpAlert>}
        <p className="text-muted sp_bottom_15" style={{ fontSize: '0.875rem' }}>
          Public verify:{' '}
          <Link to="/verify-certificate">/verify-certificate</Link>
        </p>
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Certificate No</th>
                {mode === 'org' && <th>Student</th>}
                <th>Test</th>
                <th>Score</th>
                <th>Code</th>
                <th>Status</th>
                <th>Issued</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <code className="edtp-code">{c.certificate_no}</code>
                  </td>
                  {mode === 'org' && <td>{c.student_name}</td>}
                  <td>{c.test_title ?? '—'}</td>
                  <td>
                    {c.total_score != null
                      ? `${c.total_score}/${c.max_score} (${Number(c.percentage).toFixed(1)}%)`
                      : '—'}
                  </td>
                  <td>
                    <code className="edtp-code">{c.verification_code}</code>
                  </td>
                  <td>{c.status}</td>
                  <td>{formatDateTime(c.issued_at)}</td>
                  <td>
                    <div className="edtp-row-actions">
                      {c.status === 'issued' && (
                        <EdtpBtn variant="secondary" onClick={() => void download(c)}>
                          PDF
                        </EdtpBtn>
                      )}
                      {canRevoke && c.status === 'issued' && (
                        <EdtpBtn variant="danger" onClick={() => void revoke(c)}>
                          Revoke
                        </EdtpBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={mode === 'org' ? 8 : 7}>No certificates yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
