import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseApiError } from '@/lib/errors';
import { notify } from '@/lib/toast';
import type { AiGenerateInput, AiJob } from '@/services/examination.service';
import * as examinationService from '@/services/examination.service';
import '@/styles/organizations.css';
import { FiZap, FiRefreshCw, FiCpu } from 'react-icons/fi';

const TYPES = [
  ['mcq', 'MCQ'],
  ['msq', 'MSQ'],
  ['true_false', 'True/False'],
  ['fill_blank', 'Fill in the Blanks'],
  ['integer', 'Integer'],
  ['numerical', 'Numerical'],
  ['assertion_reason', 'Assertion-Reason'],
  ['match_following', 'Match the Following'],
  ['matrix_match', 'Matrix Match'],
  ['paragraph', 'Paragraph'],
  ['case_study', 'Case Study'],
  ['subjective', 'Subjective'],
] as const;

function jobErrors(job: AiJob | null): { question?: string; reason: string }[] {
  if (!job?.errors_json) return [];
  if (Array.isArray(job.errors_json)) return job.errors_json;
  try {
    const parsed = JSON.parse(job.errors_json) as unknown;
    return Array.isArray(parsed) ? (parsed as { question?: string; reason: string }[]) : [];
  } catch {
    return [];
  }
}

export function AiBuildPanel() {
  const [examName, setExamName] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<AiGenerateInput['difficulty']>('mixed');
  const [language, setLanguage] = useState('en');
  const [syllabusText, setSyllabusText] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({ mcq: 4, numerical: 2 });
  const [topicId, setTopicId] = useState('');
  const [targetMarks, setTargetMarks] = useState('20');
  const [job, setJob] = useState<AiJob | null>(null);
  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof examinationService.getAiUsage>> | null>(null);
  const [blueprint, setBlueprint] = useState<string>('');
  const [mapped, setMapped] = useState<string>('');
  const [recs, setRecs] = useState<string>('');
  const [dupes, setDupes] = useState<string>('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedTypes = useMemo(
    () =>
      TYPES.filter((item) => (counts[item[0]] ?? 0) > 0).map((item) => ({
        type: item[0],
        count: counts[item[0]],
      })),
    [counts],
  );

  const payload = (): AiGenerateInput => ({
    examName: examName.trim(),
    department: department.trim(),
    subject: subject.trim(),
    chapter: chapter.trim() || undefined,
    topic: topic.trim(),
    difficulty,
    language,
    questionTypes: selectedTypes,
    syllabusText: syllabusText.trim() || undefined,
  });

  const refreshLists = async () => {
    const [history, spend] = await Promise.all([
      examinationService.listAiJobs(),
      examinationService.getAiUsage(),
    ]);
    setJobs(history);
    setUsage(spend);
  };

  useEffect(() => {
    void refreshLists().catch((err) => setError(parseApiError(err)));
  }, []);

  useEffect(() => {
    if (!job || (job.status !== 'queued' && job.status !== 'running')) return;
    const timer = window.setInterval(() => {
      void examinationService.getAiJob(job.id).then((next) => {
        setJob(next);
        if (next.status === 'failed' && next.error_message) {
          setError(next.error_message);
          notify.error(next.error_message);
        }
        if (next.status === 'completed' || next.status === 'failed') void refreshLists();
      }).catch((err) => setError(parseApiError(err)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  const run = async (action: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const generate = () =>
    run(async () => {
      if (!selectedTypes.length) throw new Error('Select at least one question type');
      const created = await examinationService.generateAiQuestions(payload());
      setJob(created);
    });

  return (
    <div className="org-panel-root">
      <div className="org-top-bar">
        <div>
          <h2 className="org-page-title">Build with AI</h2>
          <p className="org-page-desc">
            Generate original practice questions and two draft tests. Nothing goes live until you publish it.
          </p>
        </div>
      </div>

      {usage && !usage.openai_configured ? (
        <div className="org-error-banner" style={{ marginBottom: 16 }}>
          Add OPENAI_API_KEY to the API server environment, then restart the API. Model: {usage.model}.
        </div>
      ) : null}
      {error ? <div className="org-error-banner" style={{ marginBottom: 16 }}>{error}</div> : null}

      {/* ── Top Stat Cards (Matching Payments Menu) ── */}
      <div className="org-stats-row" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1.2fr', marginBottom: 20 }}>
        {/* Info Card */}
        <div className="org-info-card">
          <div className="org-info-card-icon">
            <FiCpu />
          </div>
          <div className="org-info-card-text">
            <h3 className="org-info-card-title">AI Engine</h3>
            <p className="org-info-card-desc">
              Model: {usage?.model || 'gpt-4o-mini'} · {usage?.openai_configured !== false ? 'Active & Ready' : 'API Key Required'}
            </p>
          </div>
        </div>

        {/* Stat 1: Completed */}
        <div className="org-stat-card">
          <span className="org-stat-card-val org-stat-card-val--success">
            {usage?.completed ?? 0}
          </span>
          <span className="org-stat-card-lbl">Completed</span>
        </div>

        {/* Stat 2: Failed */}
        <div className="org-stat-card">
          <span className="org-stat-card-val org-stat-card-val--warning">
            {usage?.failed ?? 0}
          </span>
          <span className="org-stat-card-lbl">Failed</span>
        </div>

        {/* Stat 3: Total Requests */}
        <div className="org-stat-card">
          <span className="org-stat-card-val">
            {usage?.requests ?? 0}
          </span>
          <span className="org-stat-card-lbl">Total Requests</span>
        </div>

        {/* Stat 4: Est. Cost */}
        <div className="org-stat-card">
          <span className="org-stat-card-val" style={{ color: '#2563eb' }}>
            ${Number(usage?.estimated_cost_usd ?? 0).toFixed(4)}
          </span>
          <span className="org-stat-card-lbl">Est. Cost USD</span>
        </div>
      </div>

      <div className="org-table-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            Generate Questions &amp; Tests
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            Specify subject, topic, difficulty and target question distribution.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <label className="org-form-label">Exam name</label>
              <input className="org-form-input" value={examName} onChange={(e) => setExamName(e.target.value)} required placeholder="e.g. Physics Midterm" />
            </div>
            <div className="col-md-4">
              <label className="org-form-label">Department</label>
              <input className="org-form-input" value={department} onChange={(e) => setDepartment(e.target.value)} required placeholder="e.g. Science" />
            </div>
            <div className="col-md-4">
              <label className="org-form-label">Subject</label>
              <input className="org-form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Thermodynamics" />
            </div>
            <div className="col-md-4">
              <label className="org-form-label">Chapter</label>
              <input className="org-form-input" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Chapter 2" />
            </div>
            <div className="col-md-4">
              <label className="org-form-label">Topic</label>
              <input className="org-form-input" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. Laws of Thermodynamics" />
            </div>
            <div className="col-md-2">
              <label className="org-form-label">Difficulty</label>
              <select className="org-form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as AiGenerateInput['difficulty'])}>
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="org-form-label">Language</label>
              <select className="org-form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="col-12">
              <label className="org-form-label">Syllabus or topic list (optional)</label>
              <textarea
                className="org-form-input"
                rows={3}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="One topic per line. Use Chapter: Topic to map both."
              />
            </div>
            {TYPES.map(([type, label]) => (
              <div className="col-md-3" key={type}>
                <label className="org-form-label" style={{ fontSize: '0.8rem' }}>{label}</label>
                <input
                  className="org-form-input"
                  type="number"
                  min={0}
                  max={50}
                  value={counts[type] ?? 0}
                  onChange={(e) => setCounts((prev) => ({ ...prev, [type]: Number(e.target.value) || 0 }))}
                />
              </div>
            ))}

            {/* Centered navigation buttons with theme gradient */}
            <div
              className="col-12"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 14,
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid #f1f5f9',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="org-add-btn"
                type="submit"
                disabled={busy}
                style={{ height: 42, padding: '0 22px', fontSize: '0.875rem' }}
              >
                <FiZap style={{ marginRight: 6 }} /> {busy ? 'Working…' : 'Generate draft tests'}
              </button>
              <button
                className="org-btn-outline-primary"
                type="button"
                disabled={busy}
                style={{ height: 42, padding: '0 20px', fontSize: '0.875rem' }}
                onClick={() =>
                  void run(async () => {
                    const plan = await examinationService.previewAiBlueprint(payload());
                    setBlueprint(
                      `${plan.source ?? 'local'} blueprint: ${plan.totalQuestions} questions, ${plan.totalMarks} marks. ${plan.notes ?? ''}`,
                    );
                  })
                }
              >
                Preview blueprint
              </button>
              <button
                className="org-btn-outline-primary"
                type="button"
                disabled={busy}
                style={{ height: 42, padding: '0 20px', fontSize: '0.875rem' }}
                onClick={() =>
                  void run(async () => {
                    const result = await examinationService.mapAiSyllabus(payload());
                    setTopicId(result.topics[0]?.topicId ?? '');
                    setMapped(result.topics.map((item) => `${item.chapter} → ${item.topic}`).join('\n') || 'No topics found');
                  })
                }
              >
                Map syllabus
              </button>
            </div>
          </div>
        </form>
      </div>

      {blueprint ? (
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20, whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#334155' }}>
          <strong>Blueprint:</strong> {blueprint}
        </div>
      ) : null}
      {mapped ? (
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20, whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#334155' }}>
          <strong>Syllabus Map:</strong>
          {'\n'}{mapped}
        </div>
      ) : null}

      {job ? (
        <div className="org-table-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Generation {job.status}</h5>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>
            {job.progress_current} / {job.progress_total} saved · {job.skipped_count} skipped
          </p>
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
            <div
              style={{
                width: `${Math.min(100, (job.progress_current / Math.max(job.progress_total, 1)) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {job.error_message && job.error_message !== error ? (
            <div className="org-error-banner" style={{ marginBottom: 12 }}>{job.error_message}</div>
          ) : null}
          {jobErrors(job).length > 0 ? (
            <ul style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 16 }}>
              {jobErrors(job).slice(0, 8).map((item, index) => (
                <li key={`${item.reason}-${index}`}>{item.reason}{item.question ? ` — ${item.question}` : ''}</li>
              ))}
            </ul>
          ) : null}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {job.topic_test_id ? (
              <Link className="org-btn-outline-primary" to={`/dashboard/test-builder/${job.topic_test_id}`}>
                Review topic test
              </Link>
            ) : null}
            {job.mock_test_id ? (
              <Link className="org-btn-outline-primary" to={`/dashboard/test-builder/${job.mock_test_id}`}>
                Review mock test
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="org-table-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Question bank recommendations</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="org-form-label">Topic ID from syllabus map</label>
            <input className="org-form-input" value={topicId} onChange={(e) => setTopicId(e.target.value)} placeholder="Topic UUID" />
          </div>
          <div className="col-md-2">
            <label className="org-form-label">Target marks</label>
            <input className="org-form-input" value={targetMarks} onChange={(e) => setTargetMarks(e.target.value)} />
          </div>
          <div className="col-md-6 d-flex align-items-end gap-2">
            <button
              type="button"
              className="org-btn-outline-primary"
              style={{ height: 38, padding: '0 18px', fontSize: '0.85rem' }}
              onClick={() =>
                void run(async () => {
                  const level = difficulty === 'easy' ? 1 : difficulty === 'hard' ? 5 : 3;
                  const result = await examinationService.recommendBankQuestions(
                    topicId || undefined,
                    level,
                    Number(targetMarks) || 20,
                  );
                  setRecs(
                    result.questions.length
                      ? result.questions.map((q) => `${q.topic_name ?? 'Topic'} · ${q.type} · ${q.marks} marks · ${q.content}`).join('\n')
                      : 'No matching approved questions.',
                  );
                })
              }
            >
              Recommend
            </button>
            <button
              type="button"
              className="org-btn-outline-primary"
              style={{ height: 38, padding: '0 18px', fontSize: '0.85rem' }}
              onClick={() =>
                void run(async () => {
                  const result = await examinationService.findAiDuplicates();
                  setDupes(
                    result.pairs.length
                      ? result.pairs.map((pair) => pair.text).join('\n')
                      : 'No similar questions found in the latest 800.',
                  );
                })
              }
            >
              Find duplicates
            </button>
          </div>
        </div>
        {recs ? <div style={{ marginTop: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{recs}</div> : null}
        {dupes ? <div style={{ marginTop: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{dupes}</div> : null}
      </div>

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Generation History</h3>
              <span className="org-count-badge">
                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
              </span>
            </div>
            <p className="org-card-subtitle">AI test generation requests, token consumption, and status log</p>
          </div>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>WHEN</th>
                <th>REQUEST</th>
                <th>STATUS</th>
                <th>SAVED</th>
                <th>SKIPPED</th>
                <th>COST</th>
                <th style={{ textAlign: 'right', minWidth: 120 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: '#475569' }}>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
                  <td>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{item.request_json?.examName}</strong>
                    {item.request_json?.topic ? <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>{item.request_json.topic}</span> : null}
                  </td>
                  <td>
                    <span
                      className={`org-status-badge ${
                        item.status === 'completed'
                          ? 'org-status-badge--active'
                          : item.status === 'failed'
                            ? 'org-status-badge--inactive'
                            : 'org-status-badge--pending'
                      }`}
                      style={item.status === 'failed' ? { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' } : undefined}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{item.created_count}</td>
                  <td style={{ color: '#475569' }}>{item.skipped_count}</td>
                  <td style={{ color: '#475569' }}>${Number(item.estimated_cost_usd ?? 0).toFixed(4)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                      {item.status === 'failed' ? (
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--edit"
                          onClick={() =>
                            void run(async () => {
                              const next = await examinationService.retryAiJob(item.id);
                              setJob(next);
                            })
                          }
                        >
                          <FiRefreshCw style={{ fontSize: 13 }} /> Retry
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    No generation history yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PracticeInsights() {
  const [summary, setSummary] = useState('');
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    void examinationService.getPracticeInsights().then((data) => {
      setSummary(data.summary);
      setLines(
        data.recommendations.flatMap((item) =>
          item.questions.map((q) => `${item.topic.topic_name}: ${q.text}`),
        ),
      );
    }).catch(() => undefined);
  }, []);

  if (!summary) return null;
  return (
    <div className="edtp-form-card sp_bottom_20">
      <h5>Practice recommendations</h5>
      <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
      {lines.length > 0 ? (
        <ul>
          {lines.slice(0, 8).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ReportInsights({ testId }: { testId: string }) {
  const [summary, setSummary] = useState('');
  const [wrong, setWrong] = useState<{ question: string; option: string; selected_pct: number }[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await examinationService.getReportInsights(testId);
      setSummary(data.summary);
      setWrong(data.common_wrong ?? []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sp_bottom_15">
      <button type="button" className="edtp-btn edtp-btn--secondary edtp-btn--sm" disabled={busy} onClick={() => void load()}>
        {busy ? 'Writing insights…' : 'AI report insights'}
      </button>
      {error ? <p className="login__error mt-2">{error}</p> : null}
      {summary ? <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{summary}</p> : null}
      {wrong.length > 0 ? (
        <ul>
          {wrong.map((item) => (
            <li key={`${item.question}-${item.option}`}>
              {item.question || 'Question'} — common wrong answer “{item.option}” ({item.selected_pct}%)
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
