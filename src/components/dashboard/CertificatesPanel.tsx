import { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
import { Link } from 'react-router-dom';
import { examinationService } from '@/services';
import type { Certificate } from '@/services/examination.service';
import { parseApiError } from '@/lib/errors';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/dateFormat';
import { showError, showSuccess, confirmAction } from '@/lib/swal';
import { downloadCertificateReactPdf } from '@/pdf/downloadCertificate';
import {
  CertificatePreviewModal,
  type CertificateTemplate,
} from '@/components/dashboard/CertificatePreviewModal';
import { FiSearch, FiX, FiDownload, FiTrash2, FiExternalLink } from 'react-icons/fi';
import '@/styles/organizations.css';

export function CertificatesPanel({ mode = 'mine' }: { mode?: 'mine' | 'org' }) {
  const { user } = useAuth();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [certBusy, setCertBusy] = useState(false);
  const withLoader = useDashboardLoader();
  const canRevoke =
    user?.roles.some((r) => ['super_admin', 'org_admin', 'staff'].includes(r)) ?? false;

  const {
    items,
    pagination,
    page,
    limit,
    searchQuery: searchTerm,
    loading,
    error,
    setSearchQuery: setSearchTerm,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh: load,
  } = useServerList<Certificate>({
    fetcher: async ({ page: p, limit: l, search }) => {
      if (mode === 'org') {
        return examinationService.listCertificates(p, l, search || undefined);
      }
      // "My certificates" API is not paginated: search + slice locally so the UI stays consistent.
      const all = await examinationService.listMyCertificates();
      const q = search.toLowerCase();
      const matched = q
        ? all.filter(
            (c) =>
              c.certificate_no?.toLowerCase().includes(q) ||
              c.student_name?.toLowerCase().includes(q) ||
              c.test_title?.toLowerCase().includes(q) ||
              c.verification_code?.toLowerCase().includes(q),
          )
        : all;
      const total = matched.length;
      return {
        data: matched.slice((p - 1) * l, p * l),
        pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
      };
    },
    deps: [mode],
    defaultLimit: 10,
  });

  useDashboardLoadingEffect(loading);

  const download = (cert: Certificate) => {
    setSelectedCert(cert);
  };

  const confirmDownload = async (template: CertificateTemplate) => {
    if (!selectedCert) return;

    setCertBusy(true);

    await withLoader(async () => {
      try {
        const full = await examinationService
          .getCertificate(selectedCert.id)
          .catch(() => selectedCert);

        await downloadCertificateReactPdf(full, template);
        setSelectedCert(null);
        showSuccess('Downloaded', 'Certificate PDF saved.');
      } catch (err) {
        showError('Download failed', parseApiError(err));
      } finally {
        setCertBusy(false);
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
    <div className="org-panel-page">
      <div className="org-page-header">
        <div className="org-page-header-left">
          <h2 className="org-page-title">{mode === 'org' ? 'Certificates' : 'My Certificates'}</h2>
          <p className="org-page-desc">
            {mode === 'org'
              ? 'Issued exam certificates for this organization. Students can verify publicly with the verification code.'
              : 'Certificates issued for your exams. Share the verification code to confirm authenticity.'}
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Certificates</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Certificate' : 'Certificates'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Public verification endpoint:{' '}
              <Link to="/verify-certificate" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                /verify-certificate <FiExternalLink style={{ fontSize: 12, verticalAlign: 'middle' }} />
              </Link>
            </p>
          </div>

          <div className="org-controls-row">
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search certificate, student, test…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>CERTIFICATE NO</th>
                {mode === 'org' && <th>STUDENT</th>}
                <th>TEST</th>
                <th>SCORE</th>
                <th>VERIFY CODE</th>
                <th>STATUS</th>
                <th>ISSUED</th>
                <th className="edtp-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                      {c.certificate_no}
                    </code>
                  </td>
                  {mode === 'org' && (
                    <td>
                      <strong style={{ color: '#0f172a', fontWeight: 600 }}>{c.student_name}</strong>
                    </td>
                  )}
                  <td>
                    <span style={{ color: '#334155', fontWeight: 500 }}>{c.test_title ?? '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#059669' }}>
                      {c.total_score != null
                        ? `${c.total_score}/${c.max_score} (${Number(c.percentage).toFixed(1)}%)`
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <code style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                      {c.verification_code}
                    </code>
                  </td>
                  <td>
                    <span
                      className={`org-status-badge ${
                        c.status === 'issued' ? 'org-status-badge--active' : 'org-status-badge--inactive'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.825rem' }}>{formatDateTime(c.issued_at)}</td>
                  <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-start', alignItems: 'center' }}>
                      {mode === 'org' && c.status === 'issued' && (
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--secondary"
                          onClick={() => void download(c)}
                        >
                          <FiDownload style={{ fontSize: 13 }} /> PDF
                        </button>
                      )}
                      {canRevoke && c.status === 'issued' && (
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--danger"
                          onClick={() => void revoke(c)}
                        >
                          <FiTrash2 style={{ fontSize: 13 }} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={mode === 'org' ? 8 : 7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    {!searchTerm.trim() ? 'No certificates yet.' : 'No certificates match your search query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={loading}
        />
      </div>

      {mode === 'org' && (
        <CertificatePreviewModal
          open={selectedCert !== null}
          studentName={selectedCert?.student_name || 'Student'}
          examTitle={selectedCert?.test_title || 'Examination'}
          percentage={Number(selectedCert?.percentage ?? 0)}
          onClose={() => setSelectedCert(null)}
          onConfirm={(template) => {
            void confirmDownload(template);
          }}
          busy={certBusy}
        />
      )}
    </div>
  );
}
