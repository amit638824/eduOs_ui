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

/** Detects pure repeated characters like "gggggg...", "vvvvvv..." or lack of character variance in long strings */
export function hasRepetitivePattern(text: string): boolean {
  if (!text) return false;
  // 6 or more consecutive identical characters (case-insensitive)
  if (/(.)\1{5,}/i.test(text)) return true;
  // If string has 20+ non-whitespace characters, check distinct characters
  const cleaned = text.replace(/\s+/g, '').toLowerCase();
  if (cleaned.length >= 20) {
    const uniqueChars = new Set(cleaned.split('')).size;
    if (uniqueChars < 4) return true;
  }
  return false;
}

export function validateQuestionText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Question text is required.';
  }
  if (trimmed.length < 5) {
    return 'Question text must be at least 5 characters.';
  }
  if (trimmed.length > 50) {
    return 'Question text cannot exceed 50 characters.';
  }
  if (!/[a-zA-Z0-9\u00C0-\u024F\u0900-\u097F]/.test(trimmed)) {
    return 'Question text must contain meaningful letters or numbers.';
  }
  return null;
}

export function validateOptionText(
  text: string,
  index: number,
  allOptions: string[]
): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return `Option ${index + 1} is required.`;
  }
  if (trimmed.length > 20) {
    return `Option ${index + 1} cannot exceed 20 characters.`;
  }
  if (hasRepetitivePattern(trimmed)) {
    return `Option ${index + 1} cannot contain repetitive characters or gibberish.`;
  }
  // Duplicate check across active options
  const lower = trimmed.toLowerCase();
  for (let i = 0; i < allOptions.length; i++) {
    if (i !== index && allOptions[i]?.trim().toLowerCase() === lower) {
      return `Option ${index + 1} is identical to Option ${i + 1}. Each option must be unique.`;
    }
  }
  return null;
}

export function validateSingleAnswer(type: QuestionType, val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) {
    return type === 'fill_blank' ? 'Correct answer text is required.' : 'Correct value is required.';
  }
  if (type === 'fill_blank') {
    if (trimmed.length > 20) return 'Answer text cannot exceed 20 characters.';
    if (hasRepetitivePattern(trimmed)) return 'Answer text cannot contain repetitive characters or gibberish.';
  } else if (type === 'integer') {
    const num = Number(trimmed);
    if (!Number.isInteger(num)) return 'Please enter a valid integer (whole number).';
  } else if (type === 'numerical') {
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return 'Please enter a valid numeric value.';
  }
  return null;
}

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

  const [questionTextError, setQuestionTextError] = useState<string | null>(null);
  const [questionTextTouched, setQuestionTextTouched] = useState(false);

  const [optionErrors, setOptionErrors] = useState<(string | null)[]>([null, null, null, null, null]);
  const [optionsTouched, setOptionsTouched] = useState<boolean[]>([false, false, false, false, false]);

  const [opt1Error, setOpt1Error] = useState<string | null>(null);
  const [opt1Touched, setOpt1Touched] = useState(false);

  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const opt1InputRef = useRef<HTMLInputElement>(null);

  const resetValidation = () => {
    setQuestionTextError(null);
    setQuestionTextTouched(false);
    setOptionErrors([null, null, null, null, null]);
    setOptionsTouched([false, false, false, false, false]);
    setOpt1Error(null);
    setOpt1Touched(false);
  };

  // Sync initial department / subject / topic when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialDepartmentId) setDepartmentId(initialDepartmentId);
      if (initialSubjectId) setSubjectId(initialSubjectId);
      if (initialTopicId) setTopicId(initialTopicId);
      setError('');
      setMessage('');
      resetValidation();
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
    // Revalidate remaining active options
    const activeTexts = optionTexts.slice(0, count);
    const nextErrors = [...optionErrors];
    for (let i = 0; i < count; i++) {
      if (optionsTouched[i]) {
        nextErrors[i] = validateOptionText(optionTexts[i] ?? '', i, activeTexts);
      }
    }
    setOptionErrors(nextErrors);
  };

  const handleQuestionTextChange = (value: string) => {
    const limited = value.slice(0, 50);
    setQuestionText(limited);
    if (questionTextTouched || questionTextError) {
      setQuestionTextError(validateQuestionText(limited));
    }
  };

  const handleQuestionTextBlur = () => {
    setQuestionTextTouched(true);
    setQuestionTextError(validateQuestionText(questionText));
  };

  const handleOptionTextChange = (index: number, value: string) => {
    const limited = value.slice(0, 20);
    const nextTexts = [...optionTexts];
    nextTexts[index] = limited;
    setOptionTexts(nextTexts);

    if (optionsTouched[index] || optionErrors[index]) {
      const activeTexts = nextTexts.slice(0, optionCount);
      const nextErrors = [...optionErrors];
      nextErrors[index] = validateOptionText(limited, index, activeTexts);
      // Also update duplicate check on any other touched options
      for (let i = 0; i < optionCount; i++) {
        if (i !== index && optionsTouched[i]) {
          nextErrors[i] = validateOptionText(nextTexts[i] ?? '', i, activeTexts);
        }
      }
      setOptionErrors(nextErrors);
    }
  };

  const handleOptionBlur = (index: number) => {
    const nextTouched = [...optionsTouched];
    nextTouched[index] = true;
    setOptionsTouched(nextTouched);

    const activeTexts = optionTexts.slice(0, optionCount);
    const nextErrors = [...optionErrors];
    nextErrors[index] = validateOptionText(optionTexts[index] ?? '', index, activeTexts);
    for (let i = 0; i < optionCount; i++) {
      if (i !== index && nextTouched[i]) {
        nextErrors[i] = validateOptionText(optionTexts[i] ?? '', i, activeTexts);
      }
    }
    setOptionErrors(nextErrors);
  };

  const handleOpt1Change = (value: string) => {
    setOpt1(value);
    if (opt1Touched || opt1Error) {
      setOpt1Error(validateSingleAnswer(questionType, value));
    }
  };

  const handleOpt1Blur = () => {
    setOpt1Touched(true);
    setOpt1Error(validateSingleAnswer(questionType, opt1));
  };

  const buildOptions = () => {
    if (questionType === 'true_false') {
      return [
        { content: { text: 'True' }, isCorrect: correct === 'true' },
        { content: { text: 'False' }, isCorrect: correct === 'false' },
      ];
    }
    if (questionType === 'fill_blank') {
      return [{ content: { text: opt1.trim() }, isCorrect: true }];
    }
    if (questionType === 'integer' || questionType === 'numerical') {
      const num = Number(opt1.trim());
      return [{ content: { text: opt1.trim(), value: isNaN(num) ? undefined : num }, isCorrect: true }];
    }
    // MCQ / MSQ
    const chosenIndex = Math.max(0, parseInt(correct, 10) - 1);
    return optionTexts.slice(0, optionCount).map((text, idx) => ({
      content: { text: text.trim() },
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
    resetValidation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!departmentId || !subjectId || !topicId) {
      setError('Please select department, subject, and topic for the question.');
      drawerBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const marks = parsePositiveIntInput(marksInput);
    if (marks == null || marks < 1) {
      setError('Marks per question must be at least 1.');
      drawerBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Question Text
    const qErr = validateQuestionText(questionText);
    setQuestionTextTouched(true);
    setQuestionTextError(qErr);

    let hasValidationError = Boolean(qErr);
    let firstInvalidElement: HTMLElement | null = null;

    if (qErr && !firstInvalidElement) {
      firstInvalidElement = questionTextareaRef.current;
    }

    // Validate options
    if (questionType === 'mcq' || questionType === 'msq') {
      const activeTexts = optionTexts.slice(0, optionCount);
      const newOptionErrors: (string | null)[] = [null, null, null, null, null];
      for (let i = 0; i < optionCount; i++) {
        const err = validateOptionText(optionTexts[i] ?? '', i, activeTexts);
        newOptionErrors[i] = err;
        if (err) {
          hasValidationError = true;
          if (!firstInvalidElement) {
            firstInvalidElement = optionInputRefs.current[i];
          }
        }
      }
      setOptionsTouched([true, true, true, true, true]);
      setOptionErrors(newOptionErrors);
    } else if (questionType === 'fill_blank' || questionType === 'integer' || questionType === 'numerical') {
      const singleErr = validateSingleAnswer(questionType, opt1);
      setOpt1Touched(true);
      setOpt1Error(singleErr);
      if (singleErr) {
        hasValidationError = true;
        if (!firstInvalidElement) {
          firstInvalidElement = opt1InputRef.current;
        }
      }
    }

    if (hasValidationError) {
      setError('Please fix the highlighted validation errors before saving.');
      if (firstInvalidElement) {
        firstInvalidElement.focus();
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const difficulty = Number(difficultyInput);
    const negativeMarks = Number(negativeMarksInput);

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
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                onBlur={handleQuestionTextBlur}
                maxLength={50}
                style={{
                  height: '96px',
                  minHeight: '96px',
                  maxHeight: '96px',
                  resize: 'none',
                  borderColor: questionTextError ? '#ef4444' : undefined,
                  boxShadow: questionTextError ? '0 0 0 1px #ef4444' : undefined,
                }}
                aria-invalid={Boolean(questionTextError)}
                required
              />
              {questionTextError && (
                <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{questionTextError}</span>
                </div>
              )}
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
                  {questionType === 'fill_blank' ? 'Correct Answer Text' : 'Correct Value'} <span className="org-required-star">*</span>
                </label>
                <input
                  ref={opt1InputRef}
                  className="org-form-input"
                  placeholder={questionType === 'fill_blank' ? 'Answer text' : 'Numeric value'}
                  value={opt1}
                  onChange={(e) => handleOpt1Change(e.target.value)}
                  onBlur={handleOpt1Blur}
                  maxLength={questionType === 'fill_blank' ? 20 : undefined}
                  style={{
                    borderColor: opt1Error ? '#ef4444' : undefined,
                    boxShadow: opt1Error ? '0 0 0 1px #ef4444' : undefined,
                  }}
                  aria-invalid={Boolean(opt1Error)}
                  required
                />
                {opt1Error && (
                  <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{opt1Error}</span>
                  </div>
                )}
              </div>
            )}

            {/* MCQ / MSQ Options */}
            {(questionType === 'mcq' || questionType === 'msq') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="org-form-label">Options &amp; Correct Answer</label>
                {Array.from({ length: optionCount }, (_, index) => {
                  const err = optionErrors[index];
                  return (
                    <div key={index} className="org-form-field">
                      <label className="org-form-hint">Option {index + 1} <span className="org-required-star">*</span></label>
                      <input
                        ref={(el) => {
                          optionInputRefs.current[index] = el;
                        }}
                        className="org-form-input"
                        placeholder={`Enter text for Option ${index + 1}`}
                        value={optionTexts[index] ?? ''}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        onBlur={() => handleOptionBlur(index)}
                        maxLength={20}
                        style={{
                          borderColor: err ? '#ef4444' : undefined,
                          boxShadow: err ? '0 0 0 1px #ef4444' : undefined,
                        }}
                        aria-invalid={Boolean(err)}
                        required
                      />
                      {err && (
                        <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>{err}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

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
