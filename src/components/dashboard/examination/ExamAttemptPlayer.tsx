import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useExamProctoring } from '@/hooks/useExamProctoring';
import type { AttemptQuestion, ExamSecurityConfig, TestAttempt } from '@/types/examination';
import '@/styles/exam-player.css';

const DEFAULT_CONFIG: ExamSecurityConfig = {
  shuffleQuestions: false,
  shuffleOptions: false,
  negativeMarking: false,
  fullScreen: true,
  browserLock: true,
  blockCopyPaste: true,
  autoSubmit: true,
  allowResume: true,
  maxTabSwitches: 5,
};

type AttemptData = TestAttempt & {
  questions: AttemptQuestion[];
  duration_minutes: number;
  instructions?: string | null;
  config?: ExamSecurityConfig;
  remaining_seconds?: number;
  tab_switch_count?: number;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isAnswered(q: AttemptQuestion): boolean {
  if (q.answer?.selectedOptionIds?.length) return true;
  if (q.answer?.text?.trim()) return true;
  if (q.answer?.value != null && !Number.isNaN(Number(q.answer.value))) return true;
  return false;
}

export default function ExamAttemptPlayer() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [error, setError] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const config = attempt?.config ?? DEFAULT_CONFIG;

  const load = useCallback(async (silent = false) => {
    if (!attemptId) return;
    if (!silent) setPageLoading(true);
    try {
      const data = await examinationService.getAttempt(attemptId);
      setAttempt(data as AttemptData);
      setRemaining(data.remaining_seconds ?? data.duration_minutes * 60);
      setTabWarnings(data.tab_switch_count ?? 0);
      setError('');
    } catch (err) {
      const msg = parseApiError(err);
      if (msg.includes('TIME_EXPIRED')) {
        navigate(`/dashboard/exam-result/${attemptId}`);
        return;
      }
      setError(msg);
    } finally {
      if (!silent) setPageLoading(false);
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  useDashboardLoadingEffect(pageLoading || submitting);

  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      const result = await examinationService.submitAttempt(attemptId, true);
      navigate(`/dashboard/exam-result/${result.attempt_id ?? attemptId}`);
    } catch (err) {
      setError(parseApiError(err));
      setSubmitting(false);
    }
  }, [attemptId, navigate, submitting]);

  const { enterFullscreen } = useExamProctoring({
    attemptId: attemptId ?? '',
    enabled: examStarted && attempt?.status === 'in_progress',
    config,
    onTabSwitch: (count) => {
      setTabWarnings(count);
      setWarning(`Warning: Tab switch detected (${count}/${config.maxTabSwitches})`);
    },
    onMaxViolations: () => {
      setWarning('Maximum tab switches exceeded. Submitting exam...');
      void handleAutoSubmit();
    },
  });

  useEffect(() => {
    if (!examStarted || attempt?.status !== 'in_progress') return;
    if (remaining <= 0) {
      if (config.autoSubmit) void handleAutoSubmit();
      return;
    }
    const t = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [examStarted, remaining, attempt?.status, config.autoSubmit, handleAutoSubmit]);

  const startExam = async () => {
    const ok = await enterFullscreen();
    if (config.fullScreen && !ok) {
      setWarning('Please allow fullscreen mode to continue the exam.');
      return;
    }
    setExamStarted(true);
    void examinationService.logProctoringEvent(attemptId!, 'exam_started');
  };

  const selectOption = async (questionId: string, optionId: string, current?: string[], multi = false) => {
    if (!attemptId) return;
    let selected: string[];
    if (multi) {
      selected = current?.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...(current ?? []), optionId];
    } else {
      selected = [optionId];
    }
    await examinationService.saveAnswer(attemptId, questionId, { selectedOptionIds: selected });
    await load(true);
  };

  const saveTextAnswer = async (questionId: string, value: string, field: 'text' | 'value') => {
    if (!attemptId) return;
    const answer = field === 'text' ? { text: value } : { value: Number(value) };
    await examinationService.saveAnswer(attemptId, questionId, answer);
    await load(true);
  };

  const submit = async () => {
    if (!attemptId) return;
    if (!window.confirm('Submit test? You cannot change answers after submission.')) return;
    setSubmitting(true);
    try {
      const result = await examinationService.submitAttempt(attemptId, false);
      if (document.fullscreenElement) await document.exitFullscreen();
      navigate(`/dashboard/exam-result/${result.attempt_id ?? attemptId}`);
    } catch (err) {
      setError(parseApiError(err));
      setSubmitting(false);
    }
  };

  const toggleReview = (questionId: string) => {
    setReviewSet((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const questions = attempt?.questions ?? [];
  const current = questions[currentIdx];
  const answeredCount = useMemo(() => questions.filter(isAnswered).length, [questions]);

  if (error && !attempt) return <p className="login__error">{error}</p>;
  if (!attempt) return null;

  if (!examStarted) {
    return (
      <div className="exam-intro">
        <h3>{attempt.test_title ?? 'Online Examination'}</h3>
        <p>
          <strong>Duration:</strong> {attempt.duration_minutes} minutes ·{' '}
          <strong>Questions:</strong> {questions.length}
        </p>
        {attempt.instructions && (
          <div className="sp_top_15">
            <strong>Instructions:</strong>
            <p>{attempt.instructions}</p>
          </div>
        )}
        <ul>
          {config.fullScreen && <li>Exam will run in fullscreen mode</li>}
          {config.browserLock && (
            <li>Do not switch tabs — max {config.maxTabSwitches} warnings allowed</li>
          )}
          {config.blockCopyPaste && <li>Copy / paste is disabled during exam</li>}
          {config.autoSubmit && <li>Test auto-submits when timer ends</li>}
          {config.negativeMarking && <li>Negative marking applies for wrong answers</li>}
        </ul>
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        <button type="button" className="default__button" onClick={startExam}>
          Enter Fullscreen &amp; Start Exam
        </button>
      </div>
    );
  }

  if (!current) return <p>No questions in this test.</p>;

  const selected = current.answer?.selectedOptionIds ?? [];
  const isMulti = current.type === 'msq';
  const inputType = isMulti ? 'checkbox' : 'radio';

  return (
    <div className="exam-player-overlay">
      <div className="exam-player-topbar">
        <div>
          <h4>{attempt.test_title}</h4>
          <small>
            Q {currentIdx + 1}/{questions.length} · Answered: {answeredCount}
          </small>
        </div>
        <div className={`exam-timer${remaining <= 300 ? ' exam-timer--warning' : ''}`}>
          {formatTime(remaining)}
        </div>
      </div>

      {(warning || tabWarnings > 0) && (
        <div className="exam-warning-banner" style={{ margin: '12px 20px 0' }}>
          {warning || `Tab switches: ${tabWarnings}/${config.maxTabSwitches}`}
        </div>
      )}

      <div className="exam-player-body">
        <aside className="exam-palette">
          <h6>Question Palette</h6>
          <div className="exam-palette-grid">
            {questions.map((q, i) => {
              let cls = 'exam-palette-btn';
              if (i === currentIdx) cls += ' exam-palette-btn--active';
              else if (reviewSet.has(q.question_id)) cls += ' exam-palette-btn--review';
              else if (isAnswered(q)) cls += ' exam-palette-btn--answered';
              return (
                <button key={q.question_id} type="button" className={cls} onClick={() => setCurrentIdx(i)}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="exam-legend">
            <span><i style={{ background: '#dcfce7' }} /> Answered</span>
            <span><i style={{ background: '#fef9c3' }} /> Review</span>
            <span><i style={{ background: '#2563eb' }} /> Current</span>
          </div>
        </aside>

        <main className="exam-main">
          <h5>
            Question {currentIdx + 1}{' '}
            <small className="text-muted">
              ({current.type} · {current.marks} mark{current.marks !== 1 ? 's' : ''})
            </small>
          </h5>
          <p className="sp_top_15 sp_bottom_20">{current.content?.text}</p>

          {(current.type === 'mcq' || current.type === 'msq' || current.type === 'true_false') && (
            <ul className="list-unstyled">
              {current.options.map((opt) => (
                <li key={opt.id} className="sp_bottom_12">
                  <label style={{ cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <input
                      type={inputType}
                      name={current.question_id}
                      checked={selected.includes(opt.id)}
                      onChange={() => selectOption(current.question_id, opt.id, selected, isMulti)}
                    />
                    <span>{opt.content?.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {current.type === 'fill_blank' && (
            <input
              className="register__input"
              defaultValue={current.answer?.text ?? ''}
              onBlur={(e) => saveTextAnswer(current.question_id, e.target.value, 'text')}
              placeholder="Type your answer"
            />
          )}

          {(current.type === 'integer' || current.type === 'numerical') && (
            <input
              className="register__input"
              type="number"
              step={current.type === 'numerical' ? '0.01' : '1'}
              defaultValue={current.answer?.value ?? ''}
              onBlur={(e) => saveTextAnswer(current.question_id, e.target.value, 'value')}
              placeholder="Enter number"
            />
          )}

          <div className="exam-nav-actions">
            <button
              type="button"
              className="dashboard__small__btn__2"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="dashboard__small__btn__2"
              disabled={currentIdx >= questions.length - 1}
              onClick={() => setCurrentIdx((i) => i + 1)}
            >
              Next
            </button>
            <button
              type="button"
              className="dashboard__small__btn__2"
              onClick={() => toggleReview(current.question_id)}
            >
              {reviewSet.has(current.question_id) ? 'Unmark Review' : 'Mark for Review'}
            </button>
            <button
              type="button"
              className="default__button"
              disabled={submitting}
              onClick={submit}
              style={{ marginLeft: 'auto' }}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
