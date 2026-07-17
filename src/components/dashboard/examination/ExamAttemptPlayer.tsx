import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { confirmAction } from '@/lib/swal';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useExamProctoring } from '@/hooks/useExamProctoring';
import { siteContent } from '@/data/siteContent';
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

type PaletteStatus = 'not-viewed' | 'not-attempted' | 'answered' | 'review' | 'review-answered';

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isAnswered(q: AttemptQuestion): boolean {
  if (q.answer?.selectedOptionIds?.length) return true;
  if (q.answer?.text?.trim()) return true;
  if (q.answer?.value != null && !Number.isNaN(Number(q.answer.value))) return true;
  return false;
}

function getPaletteStatus(
  q: AttemptQuestion,
  idx: number,
  currentIdx: number,
  visitedSet: Set<string>,
  reviewSet: Set<string>,
): { status: PaletteStatus; isCurrent: boolean } {
  const isCurrent = idx === currentIdx;
  const answered = isAnswered(q);
  const review = reviewSet.has(q.question_id);
  const visited = visitedSet.has(q.question_id);

  if (answered && review) return { status: 'review-answered', isCurrent };
  if (review) return { status: 'review', isCurrent };
  if (answered) return { status: 'answered', isCurrent };
  if (visited) return { status: 'not-attempted', isCurrent };
  return { status: 'not-viewed', isCurrent };
}

function paletteClass(status: PaletteStatus, isCurrent: boolean) {
  return [
    'exam-palette-btn',
    `exam-palette-btn--${status}`,
    isCurrent ? 'exam-palette-btn--current' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export default function ExamAttemptPlayer() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [error, setError] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const config = attempt?.config ?? DEFAULT_CONFIG;
  const questions = attempt?.questions ?? [];
  const current = questions[currentIdx];

  const load = useCallback(async (silent = false) => {
    if (!attemptId) return;
    if (!silent) setPageLoading(true);
    try {
      const data = await examinationService.getAttempt(attemptId);
      setAttempt(data as AttemptData);
      setRemaining(data.remaining_seconds ?? data.duration_minutes * 60);
      setTabWarnings(data.tab_switch_count ?? 0);
      setError('');
      setVisitedSet((prev) => {
        const next = new Set(prev);
        (data.questions ?? []).forEach((q: AttemptQuestion) => {
          if (isAnswered(q)) next.add(q.question_id);
        });
        return next;
      });
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

  const goToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    const q = questions[idx];
    if (q) {
      setVisitedSet((prev) => new Set(prev).add(q.question_id));
    }
  };

  useEffect(() => {
    if (current?.question_id) {
      setVisitedSet((prev) => new Set(prev).add(current.question_id));
    }
  }, [current?.question_id]);

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
    if (questions[0]) {
      setVisitedSet((prev) => new Set(prev).add(questions[0].question_id));
    }
    void examinationService.logProctoringEvent(attemptId!, 'exam_started');
  };

  const flashSave = () => {
    setSaveMsg('Answer saved');
    window.setTimeout(() => setSaveMsg(''), 2000);
  };

  const patchQuestionAnswer = (
    questionId: string,
    answer: NonNullable<AttemptQuestion['answer']>,
  ) => {
    setAttempt((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.question_id === questionId ? { ...q, answer } : q,
        ),
      };
    });
    setVisitedSet((prev) => new Set(prev).add(questionId));
  };

  const selectOption = (
    questionId: string,
    optionId: string,
    currentSelected?: string[],
    multi = false,
  ) => {
    if (!attemptId) return;
    let selected: string[];
    if (multi) {
      selected = currentSelected?.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...(currentSelected ?? []), optionId];
    } else {
      selected = [optionId];
    }

    patchQuestionAnswer(questionId, { selectedOptionIds: selected });
    flashSave();

    void examinationService
      .saveAnswer(attemptId, questionId, { selectedOptionIds: selected })
      .catch((err) => setError(parseApiError(err)));
  };

  const saveTextAnswer = (questionId: string, value: string, field: 'text' | 'value') => {
    if (!attemptId) return;
    const answer =
      field === 'text'
        ? { text: value }
        : { value: Number(value) };

    patchQuestionAnswer(questionId, answer);
    flashSave();

    void examinationService
      .saveAnswer(attemptId, questionId, answer)
      .catch((err) => setError(parseApiError(err)));
  };

  const clearCurrentAnswer = () => {
    if (!attemptId || !current) return;
    const empty = { selectedOptionIds: [] as string[], text: '', value: undefined };
    patchQuestionAnswer(current.question_id, empty);
    flashSave();

    void examinationService
      .saveAnswer(attemptId, current.question_id, {
        selectedOptionIds: [],
        text: '',
        value: null,
      })
      .catch((err) => setError(parseApiError(err)));
  };

  const submit = async () => {
    if (!attemptId) return;
    const ok = await confirmAction({
      title: 'Submit test?',
      text: 'You cannot change answers after submission.',
      icon: 'warning',
      confirmText: 'Yes, submit it!',
      confirmColor: '#3085d6',
    });
    if (!ok) return;
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

  const toggleReview = () => {
    if (!current) return;
    setReviewSet((prev) => {
      const next = new Set(prev);
      if (next.has(current.question_id)) next.delete(current.question_id);
      else next.add(current.question_id);
      return next;
    });
    setVisitedSet((prev) => new Set(prev).add(current.question_id));
  };

  const counts = useMemo(() => {
    let answered = 0;
    let review = 0;
    let notVisited = 0;
    questions.forEach((q) => {
      if (isAnswered(q)) answered += 1;
      if (reviewSet.has(q.question_id)) review += 1;
      if (!visitedSet.has(q.question_id)) notVisited += 1;
    });
    return { answered, review, notVisited };
  }, [questions, reviewSet, visitedSet]);

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

  return (
    <div className="exam-player-overlay">
      <header className="exam-player-topbar">
        <div className="exam-player-topbar__brand">
          <img src={siteContent.brand.logo} alt={siteContent.brand.name} />
          <span>Online Exam</span>
        </div>
        <div className="exam-player-topbar__center">
          <h4>{attempt.test_title}</h4>
          <small>
            Question {currentIdx + 1} of {questions.length}
          </small>
        </div>
        <div className="exam-player-topbar__right">
          <span className="exam-timer-label">Time Left</span>
          <div className={`exam-timer${remaining <= 300 ? ' exam-timer--warning' : ''}`}>
            {formatTime(remaining)}
          </div>
        </div>
      </header>

      {(warning || tabWarnings > 0) && (
        <div className="exam-warning-banner">
          {warning || `Tab switches: ${tabWarnings}/${config.maxTabSwitches}`}
        </div>
      )}

      <div className="exam-player-body">
        <main className="exam-main">
          <div className="exam-main__head">
            <h5>
              Question No. {currentIdx + 1}{' '}
              <small>({current.marks} mark{current.marks !== 1 ? 's' : ''})</small>
            </h5>
            <span className="exam-qtype-badge">
              {current.type === 'mcq' ? 'Single Choice' : current.type.replace('_', ' ')}
            </span>
          </div>

          <p className="exam-question-text">{current.content?.text}</p>

          {(current.type === 'mcq' || current.type === 'msq' || current.type === 'true_false') && (
            <ul className="exam-options">
              {current.options.map((opt, optIdx) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <li key={opt.id}>
                    <label
                      className={`exam-option${isSelected ? ' exam-option--selected' : ''}`}
                    >
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={current.question_id}
                        checked={isSelected}
                        onChange={() =>
                          selectOption(current.question_id, opt.id, selected, isMulti)
                        }
                      />
                      <span className="exam-option__label">
                        {OPTION_LETTERS[optIdx] ?? optIdx + 1}
                      </span>
                      <span className="exam-option__text">{opt.content?.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {current.type === 'fill_blank' && (
            <input
              className="exam-text-input"
              key={current.question_id}
              defaultValue={current.answer?.text ?? ''}
              onBlur={(e) => saveTextAnswer(current.question_id, e.target.value, 'text')}
              placeholder="Type your answer"
            />
          )}

          {(current.type === 'integer' || current.type === 'numerical') && (
            <input
              className="exam-text-input"
              key={current.question_id}
              type="number"
              step={current.type === 'numerical' ? '0.01' : '1'}
              defaultValue={current.answer?.value ?? ''}
              onBlur={(e) => saveTextAnswer(current.question_id, e.target.value, 'value')}
              placeholder="Enter number"
            />
          )}

          {saveMsg && (
            <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#16a34a' }}>{saveMsg}</p>
          )}

          <div className="exam-nav-actions">
            <button
              type="button"
              className="exam-btn exam-btn--outline"
              disabled={currentIdx === 0}
              onClick={() => goToQuestion(currentIdx - 1)}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="exam-btn exam-btn--primary"
              onClick={() => flashSave()}
            >
              Save
            </button>
            <button type="button" className="exam-btn exam-btn--outline" onClick={toggleReview}>
              {reviewSet.has(current.question_id) ? 'Unmark Review' : 'Review Later'}
            </button>
            <button type="button" className="exam-btn exam-btn--ghost" onClick={clearCurrentAnswer}>
              Clear Selection
            </button>
            <button
              type="button"
              className="exam-btn exam-btn--outline"
              disabled={currentIdx >= questions.length - 1}
              onClick={() => goToQuestion(currentIdx + 1)}
            >
              Next →
            </button>
            <button
              type="button"
              className="exam-btn exam-btn--danger"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? 'Submitting...' : 'Finish Test'}
            </button>
          </div>
        </main>

        <aside className="exam-palette">
          <div className="exam-palette__head">
            <h6>Question Palette</h6>
            <div className="exam-palette__summary">
              <div className="exam-palette__stat">
                <strong>{counts.answered}</strong>
                <span>Answered</span>
              </div>
              <div className="exam-palette__stat">
                <strong>{counts.review}</strong>
                <span>Review</span>
              </div>
              <div className="exam-palette__stat">
                <strong>{counts.notVisited}</strong>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

          <div className="exam-palette__grid-wrap">
            <div className="exam-palette-grid">
              {questions.map((q, i) => {
                const { status, isCurrent } = getPaletteStatus(
                  q,
                  i,
                  currentIdx,
                  visitedSet,
                  reviewSet,
                );
                return (
                  <button
                    key={q.question_id}
                    type="button"
                    className={paletteClass(status, isCurrent)}
                    onClick={() => goToQuestion(i)}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="exam-palette__legend">
            <h6>Legend</h6>
            <div className="exam-legend">
              <span><i className="leg-not-viewed" /> Not viewed yet</span>
              <span><i className="leg-not-attempted" /> Visited, not answered</span>
              <span><i className="leg-answered" /> Answered</span>
              <span><i className="leg-review" /> Marked for review</span>
              <span><i className="leg-review-answered" /> Answered + review</span>
              <span><i className="leg-current" /> Current question</span>
            </div>
          </div>

          <div className="exam-palette__footer">
            <button type="button" className="exam-btn exam-btn--danger" disabled={submitting} onClick={submit}>
              Finish Test
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
