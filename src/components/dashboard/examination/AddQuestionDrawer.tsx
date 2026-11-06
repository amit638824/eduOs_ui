import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiHelpCircle,
  FiLock,
} from 'react-icons/fi';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { showSuccess } from '@/lib/swal';
import { parsePositiveIntInput, normalizePositiveIntInput } from '@/utils/positiveIntInput';

export type QuestionType = 'mcq' | 'msq' | 'true_false' | 'fill_blank' | 'integer' | 'numerical';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ (Single Choice)',
  msq: 'MSQ (Multiple Choice)',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  integer: 'Integer',
  numerical: 'Numerical',
};

export type McqOptionCount = 2 | 3 | 4 | 5;

const DEFAULT_OPTION_TEXTS = ['', '', '', '', ''];

export interface AddQuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newQuestionId?: string) => void;
  initialDepartmentId?: string;
  initialDepartmentName?: string;
  initialSubjectId?: string;
  initialSubjectName?: string;
  initialTopicId?: string;
  initialTopicName?: string;
  departments?: { id: string; name: string }[];
  isScopeLocked?: boolean;
}

export function AddQuestionDrawer({
  isOpen,
  onClose,
  onSuccess,
  initialDepartmentId,
  initialDepartmentName,
  initialSubjectId,
  initialSubjectName,
  initialTopicId,
  initialTopicName,
  departments: propDepartments,
  isScopeLocked = false,
}: AddQuestionDrawerProps) {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>(propDepartments || []);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  const [departmentId, setDepartmentId] = useState(initialDepartmentId || '');
  const [subjectId, setSubjectId] = useState(initialSubjectId || '');
  const [topicId, setTopicId] = useState(initialTopicId || '');

  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [marksInput, setMarksInput] = useState('1');
  const [difficultyInput, setDifficultyInput] = useState('2');
  const [negativeMarksInput, setNegativeMarksInput] = useState('0');
  const [optionCount, setOptionCount] = useState<McqOptionCount>(4);
  const [optionTexts, setOptionTexts] = useState<string[]>([...DEFAULT_OPTION_TEXTS]);
  const [correct, setCorrect] = useState('1');
  const [opt1, setOpt1] = useState('');

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial department / subject / topic when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialDepartmentId) setDepartmentId(initialDepartmentId);
      if (initialSubjectId) setSubjectId(initialSubjectId);
      if (initialTopicId) setTopicId(initialTopicId);
      setError('');
      setMessage('');
    }
  }, [isOpen, initialDepartmentId, initialSubjectId, initialTopicId]);

  // Sync departments if passed as props
  useEffect(() => {
    if (propDepartments && propDepartments.length > 0) {
      setDepartments(propDepartments);
    }
  }, [propDepartments]);

  // Fetch subjects when department changes
  useEffect(() => {
    if (!departmentId) {
      setSubjects([]);
      setSubjectId('');
      setTopics([]);
      setTopicId('');
      return;
    }
    let cancelled = false;
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((r) => {
        if (cancelled) return;
        const list = r.data.map((s) => ({ id: s.id, name: s.name }));
        setSubjects(list);
        if (initialSubjectId && list.some((s) => s.id === initialSubjectId)) {
          setSubjectId(initialSubjectId);
        } else if (!list.some((s) => s.id === subjectId)) {
          setSubjectId(list[0]?.id || '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId, initialSubjectId]);

  // Fetch topics when subject changes
  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicId('');
      return;
    }
    let cancelled = false;
    examinationService
      .listTopicsForSubject(subjectId)
      .then((topicList) => {
        if (cancelled) return;
        const list = (topicList || []).map((t: any) => ({ id: t.id, name: t.name }));
        setTopics(list);
        if (initialTopicId && list.some((t: any) => t.id === initialTopicId)) {
          setTopicId(initialTopicId);
        } else if (!list.some((t: any) => t.id === topicId)) {
          setTopicId(list[0]?.id || '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId, initialTopicId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAddSubject = async () => {
    if (!departmentId || !newSubjectName.trim()) return;
    setError('');
    try {
      const created = await examinationService.createSubject({
        name: newSubjectName.trim(),
        departmentId,
      });
      setSubjects((prev) => [...prev, { id: created.id, name: created.name }]);
      setSubjectId(created.id);
      setTopicId('');
      setNewSubjectName('');
      setShowAddSubject(false);
      setMessage(`Subject "${created.name}" created.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleAddTopic = async () => {
    if (!subjectId || !newTopicName.trim()) return;
    setError('');
    try {
      const created = await examinationService.createTopicForSubject(subjectId, {
        name: newTopicName.trim(),
      });
      setTopics((prev) => [...prev, { id: created.id, name: created.name }]);
      setTopicId(created.id);
      setNewTopicName('');
      setShowAddTopic(false);
      setMessage(`Topic "${created.name}" created.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleOptionCountChange = (count: McqOptionCount) => {
    setOptionCount(count);
    if (Number(correct) > count) {
      setCorrect('1');
    }
  };

  const handleOptionTextChange = (index: number, value: string) => {
    setOptionTexts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildOptions = () => {
    if (questionType === 'true_false') {
      return [
        { content: { text: 'True' }, isCorrect: correct === 'true' },
        { content: { text: 'False' }, isCorrect: correct === 'false' },
      ];
    }
    if (questionType === 'fill_blank') {
      return [{ content: { text: opt1 }, isCorrect: true }];
    }
    if (questionType === 'integer' || questionType === 'numerical') {
      return [{ content: { text: opt1 }, isCorrect: true }];
    }
    // MCQ / MSQ
    const chosenIndex = Math.max(0, parseInt(correct, 10) - 1);
    return optionTexts.slice(0, optionCount).map((text, idx) => ({
      content: { text },
      isCorrect: idx === chosenIndex,
    }));
  };

  const resetForm = () => {
    setQuestionText('');
    setOptionTexts([...DEFAULT_OPTION_TEXTS]);
    setOpt1('');
    setCorrect('1');
    setQuestionType('mcq');
    setMarksInput('1');
    setNegativeMarksInput('0');
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!departmentId || !subjectId || !topicId) {
      setError('Please select department, subject, and topic for the question.');
      return;
    }

    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    const marks = parsePositiveIntInput(marksInput);
    if (marks == null || marks < 1) {
      setError('Marks per question must be at least 1.');
      return;
    }

    const difficulty = Number(difficultyInput);
    const negativeMarks = Number(negativeMarksInput);

    // Validate options
    if (questionType === 'mcq' || questionType === 'msq') {
      for (let i = 0; i < optionCount; i++) {
        if (!optionTexts[i]?.trim()) {
          setError(`Please enter text for Option ${i + 1}.`);
          return;
        }
      }
    } else if (questionType === 'fill_blank' || questionType === 'integer' || questionType === 'numerical') {
      if (!opt1.trim()) {
        setError('Please enter the correct answer/value.');
        return;
      }
    }

    const payload = {
      type: questionType,
      content: { text: questionText.trim() },
      marks,
      difficulty,
      negativeMarks: isNaN(negativeMarks) ? 0 : negativeMarks,
      topicId,
      options: buildOptions(),
    };

    setSubmitting(true);
    try {
      const created = await examinationService.createQuestion(payload);
      try {
        await examinationService.approveQuestion(created.id);
      } catch {
        // Ignored if auto-approved by server
      }
      showSuccess('Question Added', 'The question was created and approved.');
      resetForm();
      onClose();
      onSuccess(created.id);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="org-drawer-overlay is-open" onClick={onClose} aria-hidden="true" />
      <div
        className="org-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="addQuestionDrawerTitle"
        style={{ zIndex: 1050 }}
      >
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <FiHelpCircle />
            </div>
            <div>
              <h3 className="org-drawer-title" id="addQuestionDrawerTitle">
                Add New Question
              </h3>
              <p className="org-drawer-desc">
                Configure question details, options, and scoring attributes
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="org-drawer-body" ref={drawerBodyRef}>
            {error && (
              <div className="mad-alert-error" role="alert" style={{ marginBottom: 16 }}>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="mad-alert-success" role="alert" style={{ marginBottom: 16 }}>
                <span>{message}</span>
              </div>
            )}

            {/* Scope Lock Banner */}
            {isScopeLocked && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  marginBottom: 16,
                  fontSize: '0.8rem',
                  color: '#1e40af',
                  fontWeight: 600,
                }}
              >
                <FiLock style={{ color: '#2563eb', flexShrink: 0, fontSize: '0.95rem' }} />
                <span>
                  Hierarchy locked to exam paper: {initialDepartmentName || 'Department'} &rarr; {initialSubjectName || 'Subject'} &rarr; {initialTopicName || 'Topic'}
                </span>
              </div>
            )}

            {/* Department */}
            <div className="org-form-field">
              <label className="org-form-label">
                Department <span className="org-required-star">*</span>
              </label>
              <select
                className="org-form-input"
                value={departmentId}
                onChange={(e) => {
                  if (isScopeLocked) return;
                  setDepartmentId(e.target.value);
                }}
                disabled={isScopeLocked}
                style={
                  isScopeLocked
                    ? { background: '#f1f5f9', color: '#475569', cursor: 'not-allowed', borderColor: '#cbd5e1' }
                    : undefined
                }
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
                {initialDepartmentId && initialDepartmentName && !departments.some((d) => d.id === initialDepartmentId) && (
                  <option value={initialDepartmentId}>{initialDepartmentName}</option>
                )}
              </select>
            </div>

            {/* Subject */}
            <div className="org-form-field">
              <label className="org-form-label">
                Subject <span className="org-required-star">*</span>
              </label>
              <select
                className="org-form-input"
                value={subjectId}
                onChange={(e) => {
                  if (isScopeLocked) return;
                  setSubjectId(e.target.value);
                }}
                disabled={isScopeLocked || !departmentId}
                style={
                  isScopeLocked
                    ? { background: '#f1f5f9', color: '#475569', cursor: 'not-allowed', borderColor: '#cbd5e1' }
                    : undefined
                }
                required
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                {initialSubjectId && initialSubjectName && !subjects.some((s) => s.id === initialSubjectId) && (
                  <option value={initialSubjectId}>{initialSubjectName}</option>
                )}
              </select>
              {!isScopeLocked && departmentId && (
                <div style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="org-pill"
                    style={{ cursor: 'pointer', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                    onClick={() => setShowAddSubject((v) => !v)}
                  >
                    {showAddSubject ? 'Cancel' : '+ Add Subject'}
                  </button>
                </div>
              )}
              {!isScopeLocked && showAddSubject && departmentId && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input
                    className="org-form-input"
                    placeholder="Subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ padding: '6px 14px', width: 'auto', minWidth: 'auto' }}
                    onClick={() => void handleAddSubject()}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Topic */}
            <div className="org-form-field">
              <label className="org-form-label">
                Topic <span className="org-required-star">*</span>
              </label>
              <select
                className="org-form-input"
                value={topicId}
                onChange={(e) => {
                  if (isScopeLocked) return;
                  setTopicId(e.target.value);
                }}
                disabled={isScopeLocked || !subjectId}
                style={
                  isScopeLocked
                    ? { background: '#f1f5f9', color: '#475569', cursor: 'not-allowed', borderColor: '#cbd5e1' }
                    : undefined
                }
                required
              >
                <option value="">Select topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                {initialTopicId && initialTopicName && !topics.some((t) => t.id === initialTopicId) && (
                  <option value={initialTopicId}>{initialTopicName}</option>
                )}
              </select>
              {!isScopeLocked && subjectId && (
                <div style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="org-pill"
                    style={{ cursor: 'pointer', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                    onClick={() => setShowAddTopic((v) => !v)}
                  >
                    {showAddTopic ? 'Cancel' : '+ Add Topic'}
                  </button>
                </div>
              )}
              {!isScopeLocked && showAddTopic && subjectId && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input
                    className="org-form-input"
                    placeholder="Topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ padding: '6px 14px', width: 'auto', minWidth: 'auto' }}
                    onClick={() => void handleAddTopic()}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Question Type & Difficulty */}
            <div className="org-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">Question Type</label>
                <select
                  className="org-form-input"
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value as QuestionType);
                    setOptionTexts([...DEFAULT_OPTION_TEXTS]);
                    setOpt1('');
                  }}
                >
                  {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                    <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div className="org-form-field">
                <label className="org-form-label">Difficulty (1–5)</label>
                <select
                  className="org-form-input"
                  value={difficultyInput}
                  onChange={(e) => setDifficultyInput(e.target.value)}
                >
                  <option value="1">1 — Easy</option>
                  <option value="2">2</option>
                  <option value="3">3 — Medium</option>
                  <option value="4">4</option>
                  <option value="5">5 — Hard</option>
                </select>
              </div>
            </div>

            {/* Marks & Negative Marks */}
            <div className="org-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">
                  Marks per Question <span className="org-required-star">*</span>
                </label>
                <input
                  type="number"
                  className="org-form-input"
                  min={1}
                  step={1}
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  onBlur={() => setMarksInput(normalizePositiveIntInput(marksInput, 1))}
                  required
                />
              </div>

              <div className="org-form-field">
                <label className="org-form-label">Negative Marks</label>
                <input
                  type="number"
                  className="org-form-input"
                  min={0}
                  step={0.25}
                  value={negativeMarksInput}
                  onChange={(e) => setNegativeMarksInput(e.target.value)}
                />
              </div>
            </div>

            {/* Options Count for MCQ/MSQ */}
            {(questionType === 'mcq' || questionType === 'msq') && (
              <div className="org-form-field">
                <label className="org-form-label">Number of Options</label>
                <select
                  className="org-form-input"
                  value={optionCount}
                  onChange={(e) => handleOptionCountChange(Number(e.target.value) as McqOptionCount)}
                >
                  <option value={2}>2 Options</option>
                  <option value={3}>3 Options</option>
                  <option value={4}>4 Options</option>
                  <option value={5}>5 Options</option>
                </select>
              </div>
            )}

            {/* Question Text */}
            <div className="org-form-field">
              <label className="org-form-label">
                Question Text <span className="org-required-star">*</span>
              </label>
              <textarea
                ref={questionTextareaRef}
                className="org-form-input"
                rows={3}
                placeholder="Enter the complete question text..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{ height: '96px', minHeight: '96px', maxHeight: '96px', resize: 'none' }}
                required
              />
            </div>

            {/* True/False Answer */}
            {questionType === 'true_false' && (
              <div className="org-form-field">
                <label className="org-form-label">Correct Answer</label>
                <select
                  className="org-form-input"
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}

            {/* Fill in Blank / Integer / Numerical */}
            {(questionType === 'fill_blank' || questionType === 'integer' || questionType === 'numerical') && (
              <div className="org-form-field">
                <label className="org-form-label">
                  {questionType === 'fill_blank' ? 'Correct Answer Text' : 'Correct Value'}
                </label>
                <input
                  className="org-form-input"
                  placeholder={questionType === 'fill_blank' ? 'Answer text' : 'Numeric value'}
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  required
                />
              </div>
            )}

            {/* MCQ / MSQ Options */}
            {(questionType === 'mcq' || questionType === 'msq') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="org-form-label">Options &amp; Correct Answer</label>
                {Array.from({ length: optionCount }, (_, index) => (
                  <div key={index} className="org-form-field">
                    <label className="org-form-hint">Option {index + 1}</label>
                    <input
                      className="org-form-input"
                      placeholder={`Enter text for Option ${index + 1}`}
                      value={optionTexts[index] ?? ''}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}

                <div className="org-form-field" style={{ marginTop: 4 }}>
                  <label className="org-form-label">Select Correct Option</label>
                  <select
                    className="org-form-input"
                    value={correct}
                    onChange={(e) => setCorrect(e.target.value)}
                  >
                    {Array.from({ length: optionCount }, (_, index) => (
                      <option key={index} value={String(index + 1)}>
                        Option {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="org-drawer-footer">
            <button
              type="button"
              className="org-drawer-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="org-drawer-submit"
              disabled={submitting || !topicId}
            >
              {submitting ? 'Saving…' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
