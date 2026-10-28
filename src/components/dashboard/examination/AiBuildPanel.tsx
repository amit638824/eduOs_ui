import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { parseApiError } from '@/lib/errors';
import { notify } from '@/lib/toast';
import type { AiGenerateInput, AiJob } from '@/services/examination.service';
import * as examinationService from '@/services/examination.service';

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
    <>
      <DashboardPageHeader
        badge="AI"
        title="Build with AI"
        subtitle="Generate original practice questions and two draft tests. Nothing goes live until you publish it."
      />
      <div className="dashboard__content__wraper">
        {usage && !usage.openai_configured ? (
          <p className="login__error sp_bottom_15">
            Add OPENAI_API_KEY to the API server environment, then restart the API. Model: {usage.model}.
          </p>
        ) : null}
        {error ? <p className="login__error sp_bottom_15">{error}</p> : null}

        {usage ? (
          <div className="row g-3 sp_bottom_20">
            {[
              ['Requests', usage.requests],
              ['Completed', usage.completed],
              ['Failed', usage.failed],
              ['Prompt tokens', usage.prompt_tokens],
              ['Completion tokens', usage.completion_tokens],
              ['Est. cost USD', Number(usage.estimated_cost_usd).toFixed(4)],
            ].map((item) => (
              <div className="col-md-2" key={item[0]}>
                <div className="edtp-form-card">
                  <small className="text-muted">{item[0]}</small>
                  <strong style={{ display: 'block' }}>{item[1]}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <form
          className="edtp-form-card sp_bottom_20"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <label>Exam name</label>
              <input className="register__input" value={examName} onChange={(e) => setExamName(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label>Department</label>
              <input className="register__input" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label>Subject</label>
              <input className="register__input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label>Chapter</label>
              <input className="register__input" value={chapter} onChange={(e) => setChapter(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label>Topic</label>
              <input className="register__input" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            </div>
            <div className="col-md-2">
              <label>Difficulty</label>
              <select className="register__input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as AiGenerateInput['difficulty'])}>
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="col-md-2">
              <label>Language</label>
              <select className="register__input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="col-12">
              <label>Syllabus or topic list (optional)</label>
              <textarea
                className="register__input"
                rows={4}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="One topic per line. Use Chapter: Topic to map both."
              />
            </div>
            {TYPES.map(([type, label]) => (
              <div className="col-md-3" key={type}>
                <label>{label}</label>
                <input
                  className="register__input"
                  type="number"
                  min={0}
                  max={50}
                  value={counts[type] ?? 0}
                  onChange={(e) => setCounts((prev) => ({ ...prev, [type]: Number(e.target.value) || 0 }))}
                />
              </div>
            ))}
            <div className="col-12 d-flex flex-wrap gap-2">
              <button className="edtp-btn edtp-btn--primary edtp-btn--md" type="submit" disabled={busy}>
                {busy ? 'Working…' : 'Generate draft tests'}
              </button>
              <button
                className="edtp-btn edtp-btn--secondary edtp-btn--md"
                type="button"
                disabled={busy}
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
                className="edtp-btn edtp-btn--secondary edtp-btn--md"
                type="button"
                disabled={busy}
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

        {blueprint ? <p className="sp_bottom_15" style={{ whiteSpace: 'pre-wrap' }}>{blueprint}</p> : null}
        {mapped ? <p className="sp_bottom_15" style={{ whiteSpace: 'pre-wrap' }}>{mapped}</p> : null}

        {job ? (
          <div className="edtp-form-card sp_bottom_20">
            <h5>Generation {job.status}</h5>
            <p className="mb-1">
              {job.progress_current} / {job.progress_total} saved · {job.skipped_count} skipped
            </p>
            <progress value={job.progress_current} max={Math.max(job.progress_total, 1)} />
            {job.error_message && job.error_message !== error ? (
              <p className="login__error">{job.error_message}</p>
            ) : null}
            {jobErrors(job).length > 0 ? (
              <ul>
                {jobErrors(job).slice(0, 8).map((item, index) => (
                  <li key={`${item.reason}-${index}`}>{item.reason}{item.question ? ` — ${item.question}` : ''}</li>
                ))}
              </ul>
            ) : null}
            <div className="d-flex flex-wrap gap-2">
              {job.topic_test_id ? (
                <Link className="edtp-btn edtp-btn--secondary edtp-btn--sm" to={`/dashboard/test-builder/${job.topic_test_id}`}>
                  Review topic test
                </Link>
              ) : null}
              {job.mock_test_id ? (
                <Link className="edtp-btn edtp-btn--secondary edtp-btn--sm" to={`/dashboard/test-builder/${job.mock_test_id}`}>
                  Review mock test
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="edtp-form-card sp_bottom_20">
          <h5>Question bank recommendations</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label>Topic id from syllabus map</label>
              <input className="register__input" value={topicId} onChange={(e) => setTopicId(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label>Target marks</label>
              <input className="register__input" value={targetMarks} onChange={(e) => setTargetMarks(e.target.value)} />
            </div>
            <div className="col-md-6 d-flex align-items-end gap-2">
              <button
                type="button"
                className="edtp-btn edtp-btn--secondary edtp-btn--sm"
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
                className="edtp-btn edtp-btn--secondary edtp-btn--sm"
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
          {recs ? <p className="sp_top_15" style={{ whiteSpace: 'pre-wrap' }}>{recs}</p> : null}
          {dupes ? <p className="sp_top_15" style={{ whiteSpace: 'pre-wrap' }}>{dupes}</p> : null}
        </div>

        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Request</th>
                <th>Status</th>
                <th>Saved</th>
                <th>Skipped</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((item) => (
                <tr key={item.id}>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
                  <td>{item.request_json?.examName} · {item.request_json?.topic}</td>
                  <td>{item.status}</td>
                  <td>{item.created_count}</td>
                  <td>{item.skipped_count}</td>
                  <td>{Number(item.estimated_cost_usd ?? 0).toFixed(4)}</td>
                  <td>
                    {item.status === 'failed' ? (
                      <button
                        type="button"
                        className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                        onClick={() =>
                          void run(async () => {
                            const next = await examinationService.retryAiJob(item.id);
                            setJob(next);
                          })
                        }
                      >
                        Retry
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7}>No generation history yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
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
