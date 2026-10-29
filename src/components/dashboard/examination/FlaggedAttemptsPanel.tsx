import { Fragment, useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
import { Link } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { showError, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import type { ProctoringSummary } from '@/types/examination';
import {
  FiShield,
  FiClock,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiEye,
  FiCalendar,
} from 'react-icons/fi';
import '@/styles/organizations.css';

type FlaggedRow = {
  id: string;
  test_id: string;
  test_title?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status: string;
  started_at: string;
  submitted_at?: string | null;
  percentage?: number | null;
  result_attempt_id?: string | null;
  proctoring_review_status?: string;
  proctoring_summary?: ProctoringSummary;
  total_violations?: number;
  severity?: 'low' | 'medium' | 'high' | null;
};

export function FlaggedAttemptsPanel() {
  const [filter, setFilter] = useState('pending');
  const [testId, setTestId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [severity, setSeverity] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ event: string; at: string }[]>([]);

  const {
    items: rows,
    pagination,
    page,
    limit,
    loading,
    error,
    onPageChange,
    onLimitChange,
    refresh: load,
  } = useServerList<FlaggedRow>({
    fetcher: async ({ page: p, limit: l }) => {
      const res = await examinationService.listFlaggedAttempts(p, l, filter, {
        testId: testId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        severity: severity ? (severity as 'low' | 'medium' | 'high') : undefined,
      });
      return { data: res.data as unknown as FlaggedRow[], pagination: res.pagination };
    },
    deps: [filter, testId, dateFrom, dateTo, severity],
    defaultLimit: 10,
  });

  useDashboardLoadingEffect(loading);

  const openTimeline = async (attemptId: string) => {
    if (expandedId === attemptId) {
      setExpandedId(null);
      return;
    }
    try {
      const data = await examinationService.getAttemptProctoring(attemptId);
      setTimeline(data.proctoring_timeline ?? []);
      setExpandedId(attemptId);
    } catch (err) {
      showError('Proctoring', parseApiError(err));
    }
  };

  const review = async (attemptId: string, status: 'reviewed' | 'dismissed') => {
    try {
      await examinationService.updateProctoringReview(attemptId, status);
      showSuccess('Updated', `Marked as ${status}`);
      await load();
    } catch (err) {
      showError('Review', parseApiError(err));
    }
  };

  return (
    <div className="org-panel-page">
      {/* ── Page Header ── */}
      <div className="org-page-header">
        <div className="org-page-header-left">
          <h2 className="org-page-title">Flagged Attempts</h2>
          <p className="org-page-desc" style={{ margin: 0, whiteSpace: 'nowrap' }}>
            Review attempts that exceeded proctoring thresholds (tabs, fullscreen, copy/paste).
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      {/* ── Table Card ── */}
      <div className="org-table-card">
        {/* Card Header: Title on Left, Filters on Right */}
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Proctoring Violations</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Attempt' : 'Attempts'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Inspect suspicious behavior timeline and take proctoring review actions
            </p>
          </div>

          <div className="org-controls-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Status Select */}
            <select
              className="org-form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: 155, height: 38, fontSize: '0.85rem' }}
            >
              <option value="pending">Pending review</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="all">All flagged</option>
            </select>

            {/* Severity Select */}
            <select
              className="org-form-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ width: 140, height: 38, fontSize: '0.85rem' }}
            >
              <option value="">All severities</option>
              <option value="low">Low severity</option>
              <option value="medium">Medium severity</option>
              <option value="high">High severity</option>
            </select>

            {/* Test ID Filter */}
            <div className="org-search-box" style={{ width: 180 }}>
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Filter by Test ID…"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              />
              {testId && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setTestId('')}
                  aria-label="Clear filter"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Date Filter Toolbar */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafbfc',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: '0.825rem',
            color: '#64748b',
          }}
        >
          <span style={{ fontWeight: 600, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiCalendar /> Date Range:
          </span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="org-form-input"
              style={{ width: 145, height: 32, padding: '2px 8px', fontSize: '0.8rem' }}
            />
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="org-form-input"
              style={{ width: 145, height: 32, padding: '2px 8px', fontSize: '0.8rem' }}
            />
          </label>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              className="org-action-btn org-action-btn--secondary"
              style={{ height: 28, padding: '0 10px', fontSize: '0.75rem' }}
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
            >
              Reset dates
            </button>
          )}
        </div>

        {/* Table Wrap */}
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>TEST</th>
                <th>VIOLATIONS</th>
                <th>SCORE</th>
                <th>REVIEW STATUS</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: 260 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email;
                const s = row.proctoring_summary;
                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#0f172a', fontWeight: 600 }}>{name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{row.email}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{row.test_title ?? row.test_id}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                          {formatDateTime(row.started_at)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span
                            className="org-status-badge"
                            style={{
                              background:
                                row.severity === 'high'
                                  ? '#fef2f2'
                                  : row.severity === 'medium'
                                    ? '#fffbeb'
                                    : '#f8fafc',
                              color:
                                row.severity === 'high'
                                  ? '#dc2626'
                                  : row.severity === 'medium'
                                    ? '#b45309'
                                    : '#475569',
                              border: `1px solid ${row.severity === 'high'
                                  ? '#fecaca'
                                  : row.severity === 'medium'
                                    ? '#fde68a'
                                    : '#e2e8f0'
                                }`,
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          >
                            {row.severity ? `${row.severity} severity` : 'Flagged'}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                            {row.total_violations ?? 0} violations
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>
                          Tabs: <strong>{s?.tab_switches ?? 0}</strong> · Fullscreen:{' '}
                          <strong>{s?.fullscreen_exits ?? 0}</strong> · Copy-Paste:{' '}
                          <strong>{s?.copy_paste_attempts ?? 0}</strong>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          {row.percentage != null ? `${Number(row.percentage).toFixed(1)}%` : '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`org-status-badge ${row.proctoring_review_status === 'reviewed'
                              ? 'org-status-badge--active'
                              : row.proctoring_review_status === 'dismissed'
                                ? 'org-status-badge--inactive'
                                : 'org-status-badge--pending'
                            }`}
                        >
                          {row.proctoring_review_status ?? 'pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--secondary"
                            onClick={() => void openTimeline(row.id)}
                            title="Inspect violations timeline"
                          >
                            <FiClock style={{ fontSize: 13 }} /> Timeline
                          </button>
                          {row.result_attempt_id ? (
                            <Link
                              to={`/dashboard/exam-result/${row.result_attempt_id}`}
                              className="org-action-btn org-action-btn--switch"
                              title="View exam result"
                            >
                              <FiEye style={{ fontSize: 13 }} /> Result
                            </Link>
                          ) : null}
                          {row.proctoring_review_status !== 'reviewed' && (
                            <button
                              type="button"
                              className="org-action-btn org-action-btn--edit"
                              onClick={() => void review(row.id, 'reviewed')}
                              title="Mark as reviewed and verified"
                            >
                              <FiCheckCircle style={{ fontSize: 13 }} /> Reviewed
                            </button>
                          )}
                          {row.proctoring_review_status !== 'dismissed' && (
                            <button
                              type="button"
                              className="org-action-btn org-action-btn--danger"
                              onClick={() => void review(row.id, 'dismissed')}
                              title="Dismiss flag"
                            >
                              <FiX style={{ fontSize: 13 }} /> Dismiss
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr>
                        <td colSpan={6} style={{ background: '#f8fafc', padding: '16px 24px' }}>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiClock /> Proctoring Activity Timeline
                              </strong>
                              <button
                                type="button"
                                className="org-action-btn org-action-btn--secondary"
                                style={{ height: 26, padding: '0 8px', fontSize: '0.75rem' }}
                                onClick={() => setExpandedId(null)}
                              >
                                Close
                              </button>
                            </div>
                            {timeline.length === 0 ? (
                              <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
                                No logged proctoring events recorded for this attempt.
                              </p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {timeline.map((ev, i) => (
                                  <div
                                    key={`${ev.at}-${i}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      background: '#f8fafc',
                                      borderRadius: 6,
                                      border: '1px solid #f1f5f9',
                                      fontSize: '0.825rem',
                                    }}
                                  >
                                    <code style={{ color: '#2563eb', fontWeight: 600 }}>{ev.event}</code>
                                    <span style={{ color: '#64748b' }}>{formatDateTime(ev.at)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <FiShield style={{ fontSize: 32, color: '#10b981', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4 }}>No Flagged Attempts</strong>
                    <span>No test attempts match the selected filter criteria.</span>
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
    </div>
  );
}
