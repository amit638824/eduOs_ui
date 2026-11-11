import { useState, useMemo } from 'react';
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
import {
  FiSearch,
  FiX,
  FiDownload,
  FiTrash2,
  FiExternalLink,
  FiEye,
  FiCopy,
  FiCheck,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import '@/styles/organizations.css';

export function CertificatesPanel({ mode = 'mine' }: { mode?: 'mine' | 'org' }) {
  const { user } = useAuth();
  const [certBusy, setCertBusy] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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
      const q = search.trim().toLowerCase();
      const matched = q
        ? all.filter(
            (c) =>
              c.certificate_no?.toLowerCase().includes(q) ||
              c.test_title?.toLowerCase().includes(q) ||
              c.verification_code?.toLowerCase().includes(q) ||
              c.student_name?.toLowerCase().includes(q),
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

  const stats = useMemo(() => {
    let sumPct = 0;
    let countPct = 0;
    let active = 0;
    for (const c of items) {
      if (c.status === 'issued') active++;
      if (c.percentage != null && !isNaN(Number(c.percentage))) {
        sumPct += Number(c.percentage);
        countPct++;
      }
    }
    const avgVal = countPct > 0 ? sumPct / countPct : null;
    return {
      total: pagination.total,
      avgScore:
        avgVal != null
          ? avgVal % 1 === 0
            ? `${avgVal.toFixed(0)}%`
            : `${avgVal.toFixed(1)}%`
          : '100%',
      activeCount: active || pagination.total,
    };
  }, [items, pagination.total]);

  const download = async (cert: Certificate, template: CertificateTemplate = 'classic') => {
    setCertBusy(true);
    try {
      const full = await examinationService.getCertificate(cert.id).catch(() => cert);
      await downloadCertificateReactPdf(full, template);
      showSuccess('Downloaded', `${cert.certificate_no} (${template}) PDF saved.`);
    } catch (err) {
      showError('Download failed', parseApiError(err));
    } finally {
      setCertBusy(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showSuccess('Copied', `Verification code ${code} copied.`);
      setTimeout(() => {
        setCopiedCode((prev) => (prev === code ? null : prev));
      }, 2000);
    } catch {
      showError('Copy failed', 'Could not copy to clipboard.');
    }
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

  const formatPercentage = (pct: number | null | undefined) => {
    if (pct == null || isNaN(Number(pct))) return '—';
    const n = Number(pct);
    return n % 1 === 0 ? `${n.toFixed(0)}%` : `${n.toFixed(1)}%`;
  };

  return (
    <div className="org-panel-root">
      {/* Top Header */}
      <div className="org-top-bar">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="org-page-title mb-0">Certificates</h2>
            <span className="org-count-badge">{pagination.total}</span>
          </div>
          <p className="org-page-desc mt-1">
            {mode === 'org'
              ? 'Issued exam certificates for this organization. Students can verify publicly with the verification code.'
              : 'View, download and verify your achievements.'}
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      {/* 4 Summary KPI Metric Cards */}
      <div className="sca-result-stats-grid">
        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--score">
              <FiAward />
            </span>
            <span className="sca-result-stat-label">Total Certificates</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--score">
              {stats.total}
            </span>
          </div>
          <span className="sca-result-stat-hint">Issued &amp; verified</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--pass">
              <FiTrendingUp />
            </span>
            <span className="sca-result-stat-label">Average Score</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--pass">
              {stats.avgScore}
            </span>
          </div>
          <span className="sca-result-stat-hint">Exam performance</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--pass">
              <FiCheckCircle />
            </span>
            <span className="sca-result-stat-label">Certificate Status</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--pass">
              Active
            </span>
          </div>
          <span className="sca-result-stat-hint">Cryptographically authentic</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--percentile">
              <FiShield />
            </span>
            <span className="sca-result-stat-label">Public Verification</span>
          </div>
          <div className="sca-result-stat-value-row">
            <Link
              to="/verify-certificate"
              style={{
                textDecoration: 'none',
                color: '#7c3aed',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              /verify <FiExternalLink style={{ fontSize: 14 }} />
            </Link>
          </div>
          <span className="sca-result-stat-hint">Public verification endpoint</span>
        </div>
      </div>

      {/* Toolbar with Search and Verification Link */}
      <div className="sca-certificates-toolbar">
        <div className="org-search-box sca-cert-search-box">
          <FiSearch className="org-search-icon" />
          <input
            type="text"
            className="org-search-input"
            placeholder="Search by certificate no., test name, code…"
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

        <Link
          to="/verify-certificate"
          className="sca-cert-verify-link"
          title="Verify certificate authenticity"
        >
          <FiShield style={{ fontSize: 14 }} />
          <span>Public verification endpoint: <strong>/verify-certificate</strong></span>
          <FiExternalLink style={{ fontSize: 12, marginLeft: 2 }} />
        </Link>
      </div>

      {/* Signature Table Card */}
      <div className="org-table-card sca-certificates-card">
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Certificate No.</th>
                {mode === 'org' && <th style={{ textTransform: 'none', color: '#ffffff' }}>Student</th>}
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Test Name</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Score</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Verification Code</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Status</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Issued On</th>
                <th className="edtp-th-actions" style={{ textTransform: 'none', color: '#ffffff' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                      {c.certificate_no}
                    </code>
                  </td>
                  {mode === 'org' && (
                    <td>
                      <strong style={{ color: '#0f172a', fontWeight: 600 }}>{c.student_name}</strong>
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem' }}>{c.test_title ?? '—'}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Online Test</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.875rem' }}>
                      {formatPercentage(c.percentage)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                        {c.verification_code}
                      </code>
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--secondary"
                        onClick={() => void handleCopyCode(c.verification_code)}
                        style={{
                          width: 26,
                          height: 26,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        title="Copy verification code"
                        aria-label={`Copy verification code ${c.verification_code}`}
                      >
                        {copiedCode === c.verification_code ? (
                          <FiCheck style={{ fontSize: 13, color: '#059669' }} />
                        ) : (
                          <FiCopy style={{ fontSize: 13 }} />
                        )}
                      </button>
                    </div>
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
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--edit"
                        onClick={() => setPreviewCert(c)}
                        title="View certificate"
                        aria-label={`View ${c.certificate_no}`}
                      >
                        <FiEye style={{ fontSize: 14 }} />
                      </button>
                      {c.status === 'issued' && (
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--download"
                          onClick={() => void download(c)}
                          disabled={certBusy}
                          title="Download certificate PDF"
                          aria-label={`Download ${c.certificate_no}`}
                        >
                          <FiDownload style={{ fontSize: 14 }} />
                        </button>
                      )}
                      {canRevoke && c.status === 'issued' && (
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--danger"
                          onClick={() => void revoke(c)}
                          title="Revoke certificate"
                          aria-label="Revoke certificate"
                        >
                          <FiTrash2 style={{ fontSize: 14 }} />
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

      {previewCert && (
        <CertificatePreviewModal
          open={Boolean(previewCert)}
          studentName={
            previewCert.student_name ||
            [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
            'Student'
          }
          examTitle={previewCert.test_title || 'Examination'}
          percentage={previewCert.percentage != null ? Number(previewCert.percentage) : 100}
          onClose={() => setPreviewCert(null)}
          onConfirm={async (template) => {
            await download(previewCert, template);
            setPreviewCert(null);
          }}
          busy={certBusy}
        />
      )}
    </div>
  );
}
