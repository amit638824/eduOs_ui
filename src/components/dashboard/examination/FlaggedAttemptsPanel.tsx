import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { EdtpBtn, EdtpSelect } from '@/components/ui/CrudUI';
import { showError, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import type { ProctoringSummary } from '@/types/examination';

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
};

export function FlaggedAttemptsPanel() {
  const [rows, setRows] = useState<FlaggedRow[]>([]);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ event: string; at: string }[]>([]);

  const load = () => {
    setLoading(true);
    examinationService
      .listFlaggedAttempts(1, 50, filter)
      .then((res) => setRows(res.data as FlaggedRow[]))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

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
      load();
    } catch (err) {
      showError('Review', parseApiError(err));
    }
  };

  return (
    <>
      <DashboardPageHeader
        badge="Integrity"
        title="Flagged Attempts"
        subtitle="Review attempts that exceeded proctoring thresholds (tabs, fullscreen, copy/paste)."
      />
      <div className="dashboard__content__wraper">
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        <div className="sp_bottom_15" style={{ maxWidth: 280 }}>
          <EdtpSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending review</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All flagged</option>
          </EdtpSelect>
        </div>
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Test</th>
                <th>Violations</th>
                <th>Score</th>
                <th>Status</th>
                <th />
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
                        <strong>{name}</strong>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                          {row.email}
                        </p>
                      </td>
                      <td>{row.test_title}</td>
                      <td>
                        <span className="edtp-badge edtp-badge--inactive">Flagged</span>
                        <p className="mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                          Tabs {s?.tab_switches ?? 0} · FS {s?.fullscreen_exits ?? 0} · CP{' '}
                          {s?.copy_paste_attempts ?? 0}
                        </p>
                      </td>
                      <td>{row.percentage != null ? `${Number(row.percentage).toFixed(1)}%` : '—'}</td>
                      <td>{row.proctoring_review_status ?? 'pending'}</td>
                      <td className="d-flex flex-wrap gap-1">
                        <EdtpBtn variant="ghost" size="sm" onClick={() => void openTimeline(row.id)}>
                          Timeline
                        </EdtpBtn>
                        {row.result_attempt_id ? (
                          <Link
                            to={`/dashboard/exam-result/${row.result_attempt_id}`}
                            className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                          >
                            Result
                          </Link>
                        ) : null}
                        <EdtpBtn variant="success" size="sm" onClick={() => void review(row.id, 'reviewed')}>
                          Reviewed
                        </EdtpBtn>
                        <EdtpBtn variant="ghost" size="sm" onClick={() => void review(row.id, 'dismissed')}>
                          Dismiss
                        </EdtpBtn>
                      </td>
                    </tr>
                    {expandedId === row.id ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="sca-proctor-timeline">
                            <strong>Proctoring timeline</strong>
                            {timeline.length === 0 ? (
                              <p className="text-muted mb-0">No events.</p>
                            ) : (
                              <ul>
                                {timeline.map((ev, i) => (
                                  <li key={`${ev.at}-${i}`}>
                                    <code>{ev.event}</code> · {formatDateTime(ev.at)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>No flagged attempts in this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
