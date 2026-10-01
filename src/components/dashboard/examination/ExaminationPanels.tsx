import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import type { QuestionImportSummary } from '@/services/examination.service';
import { parseApiError } from '@/lib/errors';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { createTestApiSchema, type CreateTestApiFormValues } from '@/validators/schemas';
import type { ExamResult, ExamTest, Question, TestAttempt } from '@/types/examination';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { profileSettingsSchema, type ProfileSettingsFormValues } from '@/validators/schemas';
import ExamAttemptPlayer from './ExamAttemptPlayer';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import AdminExamGuide from '@/components/dashboard/AdminExamGuide';
import { FieldHint, SearchField } from '@/components/ui/FieldHint';
import { EdtpBtn, EdtpField, EdtpFormActions, EdtpRowActions, EdtpSelect } from '@/components/ui/CrudUI';
import { confirmDelete, showError, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import { formatCountdown, msUntil } from '@/utils/countdown';
import { normalizePositiveIntInput, parsePositiveIntInput } from '@/utils/positiveIntInput';
import { getOptionText, getQuestionText } from '@/utils/questionContent';
import { QuestionPreviewModal } from '@/components/dashboard/QuestionPreviewModal';
import type { ExamResultQuestion } from '@/types/examination';

type QuestionType = 'mcq' | 'msq' | 'true_false' | 'fill_blank' | 'integer' | 'numerical';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ',
  msq: 'MSQ',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  integer: 'Integer',
  numerical: 'Numerical',
};

function needsTwoOptions(type: QuestionType) {
  return type === 'mcq' || type === 'msq';
}

function needsAnswerOnly(type: QuestionType) {
  return type === 'fill_blank' || type === 'integer' || type === 'numerical';
}

const QB_PREFS_KEY = 'edutech.questionBank.hierarchy';

type McqOptionCount = 2 | 3 | 4 | 5;

type QbPrefs = {
  departmentId?: string;
  subjectId?: string;
  topicId?: string;
  marksPerQuestion?: number;
  optionCount?: McqOptionCount;
};

function loadQbPrefs(): QbPrefs {
  try {
    return JSON.parse(localStorage.getItem(QB_PREFS_KEY) || '{}') as QbPrefs;
  } catch {
    return {};
  }
}

function saveQbPrefs(prefs: QbPrefs) {
  localStorage.setItem(QB_PREFS_KEY, JSON.stringify({ ...loadQbPrefs(), ...prefs }));
}

const DEFAULT_OPTION_TEXTS = ['', '', '', '', ''];

function parseMarksInput(raw: string): number | null {
  return parsePositiveIntInput(raw);
}

function normalizeMarksInput(raw: string): string {
  return normalizePositiveIntInput(raw, 1);
}

export function QuestionBankPanel() {
  const { user } = useAuth();
  const { branches } = useOrganization();
  const isTeacher = user?.roles.includes('teacher') ?? false;
  const canAddTopic =
    isTeacher ||
    (user?.roles.some((r) =>
      ['org_admin', 'super_admin', 'branch_admin', 'staff'].includes(r),
    ) ?? false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  const [departmentId, setDepartmentId] = useState(() => loadQbPrefs().departmentId ?? '');
  const [subjectId, setSubjectId] = useState(() => loadQbPrefs().subjectId ?? '');
  const [topicId, setTopicId] = useState(() => loadQbPrefs().topicId ?? '');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [deptsLoading, setDeptsLoading] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [error, setError] = useState('');
  const [newQ, setNewQ] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [marksInput, setMarksInput] = useState(() => String(loadQbPrefs().marksPerQuestion ?? 1));
  const [difficultyInput, setDifficultyInput] = useState('2');
  const [negativeMarksInput, setNegativeMarksInput] = useState('0');
  const [optionCount, setOptionCount] = useState<McqOptionCount>(() => loadQbPrefs().optionCount ?? 4);
  const [optionTexts, setOptionTexts] = useState<string[]>(() => [...DEFAULT_OPTION_TEXTS]);
  const [correct, setCorrect] = useState('1');
  const [opt1, setOpt1] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([]);
  const [hierarchyTick, setHierarchyTick] = useState(0);
  const [importingCsv, setImportingCsv] = useState(false);
  const [importSummary, setImportSummary] = useState<QuestionImportSummary | null>(null);
  const [previewQuestionId, setPreviewQuestionId] = useState<string | null>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const withLoader = useDashboardLoader();

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examinationService.listQuestions(1, 100);
      setQuestions(res.data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, []);

  useEffect(() => {
    saveQbPrefs({ departmentId, subjectId, topicId });
  }, [departmentId, subjectId, topicId]);

  useEffect(() => {
    const marks = parseMarksInput(marksInput);
    if (marks != null && marks >= 1) {
      saveQbPrefs({ marksPerQuestion: marks });
    }
  }, [marksInput]);

  useEffect(() => {
    saveQbPrefs({ optionCount });
  }, [optionCount]);

  useEffect(() => {
    const branchId = branches[0]?.id;
    if (!branchId) return;
    setDeptsLoading(true);
    platformService
      .listDepartments(branchId, 1, 50)
      .then((r) => {
        const list = r.data.map((d) => ({ id: d.id, name: d.name }));
        setDepartments(list);
        setDepartmentId((current) => {
          if (current && list.some((d) => d.id === current)) return current;
          const prefs = loadQbPrefs();
          if (prefs.departmentId && list.some((d) => d.id === prefs.departmentId)) {
            return prefs.departmentId;
          }
          return current;
        });
      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setDeptsLoading(false));
  }, [branches, hierarchyTick]);

  useEffect(() => {
    if (!departmentId) {
      setSubjects([]);
      setSubjectsLoading(false);
      return;
    }
    let cancelled = false;
    setSubjectsLoading(true);
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((r) => {
        if (cancelled) return;
        const list = r.data.map((s) => ({ id: s.id, name: s.name }));
        setSubjects(list);
        setSubjectId((current) => {
          if (current && list.some((s) => s.id === current)) return current;
          const prefs = loadQbPrefs();
          if (prefs.subjectId && list.some((s) => s.id === prefs.subjectId)) return prefs.subjectId;
          return '';
        });
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicsLoading(false);
      return;
    }
    let cancelled = false;
    setTopicsLoading(true);
    examinationService
      .listTopicsForSubject(subjectId)
      .then((list) => {
        if (cancelled) return;
        const mapped = list.map((t) => ({ id: t.id, name: t.name }));
        setTopics(mapped);
        setTopicId((current) => {
          if (current && mapped.some((t) => t.id === current)) return current;
          const prefs = loadQbPrefs();
          if (prefs.topicId && mapped.some((t) => t.id === prefs.topicId)) return prefs.topicId;
          return '';
        });
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setTopicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  useDashboardLoadingEffect(loading);

  const resetQuestionFields = () => {
    setNewQ('');
    setOptionTexts([...DEFAULT_OPTION_TEXTS]);
    setOpt1('');
    setCorrect('1');
    setQuestionType('mcq');
    setMarksInput(String(loadQbPrefs().marksPerQuestion ?? 1));
    setEditingId(null);
  };

  const clearOptionInputs = () => {
    setOptionTexts([...DEFAULT_OPTION_TEXTS]);
    setOpt1('');
    setCorrect('1');
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
      return [{ content: { value: Number(opt1) || 0 }, isCorrect: true }];
    }
    return optionTexts.slice(0, optionCount).map((text, index) => ({
      content: { text },
      isCorrect: correct === String(index + 1),
    }));
  };

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id);
    setSubjectId('');
    setTopicId('');
  };

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    setTopicId('');
  };

  const handleAddSubject = async () => {
    if (!departmentId || !newSubjectName.trim()) return;
    setError('');
    await withLoader(async () => {
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
        setMessage(`Subject "${created.name}" added.`);
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleAddTopic = async () => {
    if (!subjectId || !newTopicName.trim()) return;
    setError('');
    await withLoader(async () => {
      try {
        const created = await examinationService.createTopicForSubject(subjectId, {
          name: newTopicName.trim(),
        });
        setTopics((prev) => [...prev, { id: created.id, name: created.name }]);
        setTopicId(created.id);
        setNewTopicName('');
        setShowAddTopic(false);
        setMessage(`Topic "${created.name}" added.`);
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleEdit = async (id: string) => {
    setError('');
    setMessage('');
    await withLoader(async () => {
      try {
        const q = await examinationService.getQuestion(id);
        setEditingId(q.id);
        setQuestionType(q.type as QuestionType);
        setNewQ(getQuestionText(q.content, ''));
        if (q.department_id) setDepartmentId(q.department_id);
        if (q.subject_id) setSubjectId(q.subject_id);
        if (q.topic_id) setTopicId(q.topic_id);
        setDifficultyInput(String(q.difficulty ?? 2));
        setNegativeMarksInput(String((q as { negative_marks?: number }).negative_marks ?? 0));

        const opts = q.options ?? [];
        if (q.type === 'true_false') {
          const trueOpt = opts.find((o) => getOptionText(o.content) === 'True');
          setCorrect(trueOpt?.is_correct ? 'true' : 'false');
          setOpt1('');
        } else if (q.type === 'fill_blank' || q.type === 'integer' || q.type === 'numerical') {
          setOpt1(getOptionText(opts[0]?.content) === '—' ? '' : getOptionText(opts[0]?.content));
          setCorrect('1');
        } else {
          const count = Math.min(5, Math.max(2, opts.length || 4)) as McqOptionCount;
          setOptionCount(count);
          setOptionTexts(
            Array.from({ length: 5 }, (_, i) => {
              const t = getOptionText(opts[i]?.content);
              return t === '—' ? '' : t;
            }),
          );
          const correctIdx = opts.findIndex((o) => o.is_correct ?? o.isCorrect);
          setCorrect(String(correctIdx >= 0 ? correctIdx + 1 : 1));
          setOpt1('');
        }
        if (q.marks != null) {
          setMarksInput(String(q.marks));
        }
        setMessage('Editing question — update and save, or cancel.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete({
      title: 'Delete question?',
      text: "You won't be able to revert this!",
      confirmText: 'Yes, delete it!',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await examinationService.deleteQuestion(id);
        if (editingId === id) resetQuestionFields();
        setSelectedDeleteIds((prev) => prev.filter((x) => x !== id));
        await loadQuestions();
      });
      showSuccess('Deleted!', 'Question has been deleted.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeleteIds.length === 0) return;
    const ok = await confirmDelete({
      title: `Delete ${selectedDeleteIds.length} question(s)?`,
      text: "Selected questions will be removed from the bank. You won't be able to revert this!",
      confirmText: 'Yes, delete selected',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        for (const id of selectedDeleteIds) {
          await examinationService.deleteQuestion(id);
        }
        if (editingId && selectedDeleteIds.includes(editingId)) resetQuestionFields();
        setSelectedDeleteIds([]);
        await loadQuestions();
      });
      showSuccess('Deleted!', `${selectedDeleteIds.length} question(s) deleted.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleCsvImport = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setMessage('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Upload a .csv file.');
      showError('Invalid file', 'Only CSV files are supported.');
      return;
    }
    if (file.size > 1_500_000) {
      setError('CSV is too large. Maximum size is 1.5 MB (~500 questions).');
      showError('File too large', 'Maximum size is 1.5 MB.');
      return;
    }
    const csvText = await file.text();
    setImportingCsv(true);
    try {
      const summary = await withLoader(() => examinationService.importQuestionsFromCsv(csvText));
      setImportSummary(summary);
      setHierarchyTick((n) => n + 1);
      await loadQuestions();
      const parts = [
        `${summary.created} added`,
        `${summary.skipped} duplicates skipped`,
        `${summary.errors} errors`,
      ];
      if (summary.errors > 0) {
        showError('Import finished with errors', parts.join(', '));
        setError(
          `Imported with errors: ${parts.join(', ')}. Check the summary below.`,
        );
      } else {
        showSuccess('Bulk import complete', parts.join(', '));
        setMessage(`Bulk import complete: ${parts.join(', ')}.`);
      }
    } catch (err) {
      setError(parseApiError(err));
      showError('Import failed', parseApiError(err));
    } finally {
      setImportingCsv(false);
      if (csvFileRef.current) csvFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!departmentId || !subjectId || !topicId) {
      setError('Select department, subject, and topic before saving a question.');
      return;
    }
    const marks = parseMarksInput(marksInput);
    if (marks == null || marks < 1) {
      setError('Marks per question must be at least 1.');
      return;
    }
    const difficulty = Number(difficultyInput);
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
      setError('Difficulty must be an integer from 1 to 5.');
      return;
    }
    const negativeMarks = Number(negativeMarksInput);
    if (!Number.isFinite(negativeMarks) || negativeMarks < 0) {
      setError('Negative marks must be 0 or more.');
      return;
    }
    const payload = {
      type: questionType,
      content: { text: newQ },
      marks,
      difficulty,
      negativeMarks,
      topicId,
      options: buildOptions(),
    };
    await withLoader(async () => {
      try {
        if (editingId) {
          await examinationService.updateQuestion(editingId, payload);
          setMessage('Question updated.');
          resetQuestionFields();
        } else {
          const created = await examinationService.createQuestion(payload);
          try {
            await examinationService.approveQuestion(created.id);
            setMessage(`${QUESTION_TYPE_LABELS[questionType]} question added. Department / subject / topic kept for next question.`);
          } catch {
            setMessage('Question created (pending approval). Hierarchy kept for next question.');
          }
          setNewQ('');
          clearOptionInputs();
        }
        await loadQuestions();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Step 1"
        title="Question Bank"
        subtitle="Department → subject → topic stay selected after each add. Edit or delete anytime from the list."
      />
      <div className="qb-csv-bar">
        <input
          ref={csvFileRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => void handleCsvImport(e.target.files?.[0])}
        />
        <a
          className="edtp-btn edtp-btn--secondary edtp-btn--sm"
          href="/templates/question-bank-import.csv"
          download="question-bank-import-example.csv"
        >
          Download example CSV
        </a>
        <EdtpBtn
          variant="primary"
          disabled={importingCsv}
          onClick={() => csvFileRef.current?.click()}
        >
          {importingCsv ? 'Importing…' : 'Bulk import CSV'}
        </EdtpBtn>
        <p className="qb-csv-bar__hint">
          Matching department, subject, chapter and topic names are reused. Duplicate questions
          (same topic + type + text) are skipped. Max 500 rows.
        </p>
      </div>
      {importSummary && (
        <div className="qb-import-summary">
          <strong>Last import:</strong> {importSummary.created} created, {importSummary.skipped} skipped,{' '}
          {importSummary.errors} errors
          {(importSummary.createdDepartments > 0 ||
            importSummary.createdSubjects > 0 ||
            importSummary.createdTopics > 0) && (
            <>
              {' '}
              · new master data: {importSummary.createdDepartments} departments,{' '}
              {importSummary.createdSubjects} subjects, {importSummary.createdChapters} chapters,{' '}
              {importSummary.createdTopics} topics
            </>
          )}
          {importSummary.rows.filter((r) => r.status === 'error').length > 0 && (
            <ul className="qb-import-summary__errors">
              {importSummary.rows
                .filter((r) => r.status === 'error')
                .slice(0, 8)
                .map((r) => (
                  <li key={r.row}>
                    Row {r.row}: {r.reason}
                    {r.question ? ` — ${r.question}` : ''}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      <AdminExamGuide activeStep={1} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title">
          <h4>{editingId ? 'Edit Question' : 'Add Question'}</h4>
          {editingId && (
            <button type="button" className="dashboard__small__btn__2" onClick={resetQuestionFields}>
              Cancel edit
            </button>
          )}
        </div>
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}
        <form onSubmit={handleSubmit} className="edtp-form-card sp_bottom_30">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <EdtpSelect
                loading={deptsLoading}
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                required
              >
                <option value="">{deptsLoading ? 'Loading departments…' : 'Select department'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint loading={deptsLoading} loadingText="Fetching departments…" />
              {!deptsLoading && (
                <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                  Stays selected until you change it. Org Admin adds departments.
                </p>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Subject</label>
              <EdtpSelect
                loading={subjectsLoading}
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!departmentId || subjectsLoading}
                required
              >
                <option value="">
                  {subjectsLoading ? 'Loading subjects…' : 'Select subject'}
                </option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint
                loading={subjectsLoading}
                empty={Boolean(departmentId && !subjectsLoading && subjects.length === 0)}
                emptyText="No subjects in this department. Add one below."
                loadingText="Fetching subjects…"
              />
              {departmentId && !subjectsLoading && (
                <button
                  type="button"
                  className="dashboard__small__btn__2 mt-2"
                  onClick={() => setShowAddSubject((v) => !v)}
                >
                  {showAddSubject ? 'Cancel' : '+ Add Subject'}
                </button>
              )}
              {showAddSubject && departmentId && (
                <div className="edtp-inline-field mt-2">
                  <input
                    className="register__input"
                    placeholder="Subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <button type="button" className="default__button" onClick={handleAddSubject}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Topic</label>
              <EdtpSelect
                loading={topicsLoading}
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId || topicsLoading}
                required
              >
                <option value="">
                  {topicsLoading ? 'Loading topics…' : 'Select topic'}
                </option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint
                loading={topicsLoading}
                empty={Boolean(subjectId && !topicsLoading && topics.length === 0)}
                emptyText="No topics yet. Add one below."
                loadingText="Fetching topics…"
              />
              {canAddTopic && subjectId && !topicsLoading && (
                <button
                  type="button"
                  className="dashboard__small__btn__2 mt-2"
                  onClick={() => setShowAddTopic((v) => !v)}
                >
                  {showAddTopic ? 'Cancel' : '+ Add Topic'}
                </button>
              )}
              {showAddTopic && subjectId && (
                <div className="edtp-inline-field mt-2">
                  <input
                    className="register__input"
                    placeholder="Topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <button type="button" className="default__button" onClick={handleAddTopic}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <EdtpField label="Question Type" hint="Choose how students will answer.">
                <EdtpSelect
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value as QuestionType);
                    clearOptionInputs();
                  }}
                >
                  {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                    <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
                  ))}
                </EdtpSelect>
              </EdtpField>
            </div>
            <div className="col-md-4">
              <EdtpField label="Marks per Question" hint="Stays selected until you change it.">
                <input
                  type="number"
                  className="register__input edtp-number-input"
                  min={1}
                  step={1}
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  onBlur={() => setMarksInput(normalizeMarksInput(marksInput))}
                  required
                />
              </EdtpField>
            </div>
            <div className="col-md-4">
              <EdtpField label="Difficulty (1–5)" hint="1 = easy, 5 = hard.">
                <EdtpSelect value={difficultyInput} onChange={(e) => setDifficultyInput(e.target.value)}>
                  <option value="1">1 — Easy</option>
                  <option value="2">2</option>
                  <option value="3">3 — Medium</option>
                  <option value="4">4</option>
                  <option value="5">5 — Hard</option>
                </EdtpSelect>
              </EdtpField>
            </div>
            <div className="col-md-4">
              <EdtpField label="Negative marks" hint="Penalty if wrong (0 = none).">
                <input
                  type="number"
                  className="register__input edtp-number-input"
                  min={0}
                  step={0.25}
                  value={negativeMarksInput}
                  onChange={(e) => setNegativeMarksInput(e.target.value)}
                />
              </EdtpField>
            </div>
            <div className="col-md-4">
              <EdtpField
                label="Number of Options"
                hint={
                  needsTwoOptions(questionType)
                    ? 'Default 4. Stays selected until you change it.'
                    : 'Available for MCQ and MSQ only.'
                }
              >
                <EdtpSelect
                  value={optionCount}
                  disabled={!needsTwoOptions(questionType)}
                  onChange={(e) => handleOptionCountChange(Number(e.target.value) as McqOptionCount)}
                >
                  <option value={2}>2 options</option>
                  <option value={3}>3 options</option>
                  <option value={4}>4 options</option>
                  <option value={5}>5 options</option>
                </EdtpSelect>
              </EdtpField>
            </div>
            <div className="col-12">
              <label className="form-label">Question Text</label>
              <input
                className="register__input"
                placeholder="Enter the question"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                required
              />
            </div>
            {questionType === 'true_false' && (
              <div className="col-md-4">
                <label className="form-label">Correct Answer</label>
                <EdtpSelect value={correct} onChange={(e) => setCorrect(e.target.value)}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </EdtpSelect>
              </div>
            )}
            {needsAnswerOnly(questionType) && (
              <div className="col-md-6">
                <label className="form-label">
                  {questionType === 'fill_blank' ? 'Correct Answer' : 'Correct Value'}
                </label>
                <input
                  className="register__input"
                  placeholder={questionType === 'fill_blank' ? 'Answer text' : 'Numeric value'}
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  required
                />
              </div>
            )}
            {needsTwoOptions(questionType) && (
              <>
                {Array.from({ length: optionCount }, (_, index) => (
                  <div key={index} className="col-md-4">
                    <EdtpField label={`Option ${index + 1}`}>
                      <input
                        className="register__input"
                        value={optionTexts[index] ?? ''}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        required
                      />
                    </EdtpField>
                  </div>
                ))}
                <div className="col-md-4">
                  <EdtpField label="Correct">
                    <EdtpSelect value={correct} onChange={(e) => setCorrect(e.target.value)}>
                      {Array.from({ length: optionCount }, (_, index) => (
                        <option key={index} value={String(index + 1)}>
                          Option {index + 1}
                        </option>
                      ))}
                    </EdtpSelect>
                  </EdtpField>
                </div>
                {(optionCount + 1) % 3 !== 0 &&
                  Array.from({ length: 3 - ((optionCount + 1) % 3) }, (_, i) => (
                    <div key={`opt-spacer-${i}`} className="col-md-4 edtp-form-col-spacer" aria-hidden />
                  ))}
              </>
            )}
            <div className="col-12">
              <EdtpFormActions>
                <EdtpBtn type="submit" variant="primary" size="md" disabled={!topicId}>
                  {editingId
                    ? `Update ${QUESTION_TYPE_LABELS[questionType]} Question`
                    : `Add ${QUESTION_TYPE_LABELS[questionType]} Question`}
                </EdtpBtn>
                {editingId && (
                  <EdtpBtn variant="ghost" size="md" onClick={resetQuestionFields}>
                    Cancel
                  </EdtpBtn>
                )}
              </EdtpFormActions>
            </div>
          </div>
        </form>

        <div className="dashboard__section__title">
          <h4>Questions ({questions.length})</h4>
        </div>
        <SearchField
          value={questionSearch}
          onChange={setQuestionSearch}
          placeholder="Search questions by text, department, subject, topic…"
        />
        {(() => {
          const filteredQuestions = questions.filter((q) => {
            const qSearch = questionSearch.trim().toLowerCase();
            if (!qSearch) return true;
            return (
              getQuestionText(q.content, '').toLowerCase().includes(qSearch) ||
              (q.department_name ?? '').toLowerCase().includes(qSearch) ||
              (q.subject_name ?? '').toLowerCase().includes(qSearch) ||
              (q.topic_name ?? '').toLowerCase().includes(qSearch) ||
              (q.type ?? '').toLowerCase().includes(qSearch)
            );
          });
          const allFilteredSelected =
            filteredQuestions.length > 0 &&
            filteredQuestions.every((q) => selectedDeleteIds.includes(q.id));
          return (
        <div className="dashboard__table table-responsive">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 sp_bottom_15">
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              {selectedDeleteIds.length > 0
                ? `${selectedDeleteIds.length} selected`
                : 'Select questions to delete in bulk'}
            </span>
            <EdtpBtn
              variant="danger"
              disabled={selectedDeleteIds.length === 0}
              onClick={() => void handleBulkDelete()}
            >
              Delete Selected ({selectedDeleteIds.length})
            </EdtpBtn>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: 48 }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allFilteredSelected}
                    onChange={() => {
                      if (allFilteredSelected) {
                        setSelectedDeleteIds((prev) =>
                          prev.filter((id) => !filteredQuestions.some((q) => q.id === id)),
                        );
                      } else {
                        setSelectedDeleteIds((prev) => {
                          const next = new Set(prev);
                          filteredQuestions.forEach((q) => next.add(q.id));
                          return [...next];
                        });
                      }
                    }}
                    aria-label="Select all questions"
                  />
                </th>
                <th>Question</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Topic</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => {
                const label = getQuestionText(q.content);
                return (
                <tr key={q.id} className={editingId === q.id ? 'edtp-row--editing' : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedDeleteIds.includes(q.id)}
                      onChange={() =>
                        setSelectedDeleteIds((prev) =>
                          prev.includes(q.id) ? prev.filter((x) => x !== q.id) : [...prev, q.id],
                        )
                      }
                      aria-label={`Select ${label}`}
                    />
                  </td>
                  <td className="edtp-q-cell">{label}</td>
                  <td>{q.department_name ?? '—'}</td>
                  <td>{q.subject_name ?? '—'}</td>
                  <td>{q.topic_name ?? '—'}</td>
                  <td><span className="edtp-badge edtp-badge--role">{q.type}</span></td>
                  <td>{q.status}</td>
                  <td>
                    <EdtpRowActions>
                      <EdtpBtn variant="ghost" onClick={() => setPreviewQuestionId(q.id)}>
                        Preview
                      </EdtpBtn>
                      <EdtpBtn variant="secondary" onClick={() => void handleEdit(q.id)}>
                        Edit
                      </EdtpBtn>
                      <EdtpBtn variant="danger" onClick={() => void handleDelete(q.id)}>
                        Delete
                      </EdtpBtn>
                    </EdtpRowActions>
                  </td>
                </tr>
                );
              })}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={8}>No questions yet. Select department → subject → topic and add your first question.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
          );
        })()}
      </div>
      <QuestionPreviewModal
        questionId={previewQuestionId}
        onClose={() => setPreviewQuestionId(null)}
      />
    </>
  );
}

export function TestsListPanel({ title }: { title: string }) {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('60');
  const [editPassingMarks, setEditPassingMarks] = useState('40');
  const [editInstructions, setEditInstructions] = useState('');
  const [editShuffleQuestions, setEditShuffleQuestions] = useState(false);
  const [editShuffleOptions, setEditShuffleOptions] = useState(false);
  const [editNegativeMarking, setEditNegativeMarking] = useState(false);
  const [editFullScreen, setEditFullScreen] = useState(true);
  const [editAllowResume, setEditAllowResume] = useState(true);
  const [editReleaseAnswers, setEditReleaseAnswers] = useState(false);
  const [editMaxTabSwitches, setEditMaxTabSwitches] = useState('5');
  const withLoader = useDashboardLoader();

  const load = () => {
    setLoading(true);
    examinationService
      .listTests(1, 50)
      .then((res) => setTests(res.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useDashboardLoadingEffect(loading);

  const publish = async (id: string) => {
    setError('');
    await withLoader(async () => {
      try {
        await examinationService.publishTest(id, { mode: 'live_now' });
        showSuccess('Published', 'Test is now live.');
        load();
      } catch (err) {
        const msg = parseApiError(err);
        setError(msg);
        showError('Publish failed', msg);
      }
    });
  };

  const startEdit = (t: ExamTest) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDuration(String(t.duration_minutes ?? 60));
    setEditPassingMarks(String(t.passing_marks ?? 40));
    setEditInstructions(t.instructions ?? '');
    const cfg = (t.config ?? {}) as Record<string, unknown>;
    setEditShuffleQuestions(Boolean(cfg.shuffleQuestions));
    setEditShuffleOptions(Boolean(cfg.shuffleOptions));
    setEditNegativeMarking(Boolean(cfg.negativeMarking));
    setEditFullScreen(cfg.fullScreen !== false);
    setEditAllowResume(cfg.allowResume !== false);
    setEditReleaseAnswers(Boolean(cfg.releaseAnswers));
    setEditMaxTabSwitches(String(cfg.maxTabSwitches ?? 5));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const duration = parsePositiveIntInput(editDuration);
    if (duration == null || duration < 1) {
      setError('Duration must be at least 1 minute.');
      return;
    }
    const passing = Number(editPassingMarks);
    if (!Number.isFinite(passing) || passing < 0) {
      setError('Passing marks must be 0 or more.');
      return;
    }
    const maxTabs = Number(editMaxTabSwitches);
    if (!Number.isInteger(maxTabs) || maxTabs < 0) {
      setError('Max tab switches must be 0 or more.');
      return;
    }
    setError('');
    await withLoader(async () => {
      try {
        const current = tests.find((x) => x.id === editingId);
        const prevConfig = (current?.config ?? {}) as Record<string, unknown>;
        await examinationService.updateTest(editingId, {
          title: editTitle.trim(),
          durationMinutes: duration,
          passingMarks: passing,
          instructions: editInstructions.trim(),
          config: {
            ...prevConfig,
            shuffleQuestions: editShuffleQuestions,
            shuffleOptions: editShuffleOptions,
            negativeMarking: editNegativeMarking,
            fullScreen: editFullScreen,
            allowResume: editAllowResume,
            releaseAnswers: editReleaseAnswers,
            maxTabSwitches: maxTabs,
            browserLock: true,
            blockCopyPaste: true,
            autoSubmit: true,
          },
        });
        setEditingId(null);
        showSuccess('Updated', 'Test details saved.');
        load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const remove = async (id: string, name: string) => {
    const ok = await confirmDelete({
      title: 'Delete test?',
      text: `“${name}” will be archived and hidden from lists.`,
      confirmText: 'Yes, delete',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await examinationService.deleteTest(id);
        load();
      });
      showSuccess('Deleted!', `${name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const statusBadge = (status: string) => {
    const cls =
      status === 'live'
        ? 'edtp-badge--active'
        : status === 'scheduled'
          ? 'edtp-badge--role'
          : status === 'draft'
            ? 'edtp-badge--role'
            : 'edtp-badge--inactive';
    return <span className={`edtp-badge ${cls}`}>{status}</span>;
  };

  return (
    <>
      <DashboardPageHeader
        badge="Step 3–5"
        title={title}
        subtitle="Build draft tests, publish when ready, then assign students so they can attempt."
      />
      <AdminExamGuide activeStep={3} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0">Test List</h4>
          <Link to="/dashboard/create-test" className="edtp-btn edtp-btn--primary edtp-btn--md">
            + Create Test
          </Link>
        </div>
        {error && <p className="login__error sp_bottom_15">{error}</p>}

        {editingId && (
          <div className="edtp-form-card sp_bottom_20">
            <h5>Edit test</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label>Title</label>
                <input
                  className="register__input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label>Duration (minutes)</label>
                <input
                  className="register__input edtp-number-input"
                  type="number"
                  min={1}
                  step={1}
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  onBlur={() => setEditDuration(normalizePositiveIntInput(editDuration, 60))}
                />
              </div>
              <div className="col-md-3">
                <label>Passing marks</label>
                <input
                  className="register__input edtp-number-input"
                  type="number"
                  min={0}
                  value={editPassingMarks}
                  onChange={(e) => setEditPassingMarks(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label>Instructions</label>
                <textarea
                  className="register__input"
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                />
              </div>
              <div className="col-12">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editShuffleQuestions} onChange={(e) => setEditShuffleQuestions(e.target.checked)} />
                      Shuffle questions
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editShuffleOptions} onChange={(e) => setEditShuffleOptions(e.target.checked)} />
                      Shuffle options
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editNegativeMarking} onChange={(e) => setEditNegativeMarking(e.target.checked)} />
                      Negative marking
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editFullScreen} onChange={(e) => setEditFullScreen(e.target.checked)} />
                      Fullscreen
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editAllowResume} onChange={(e) => setEditAllowResume(e.target.checked)} />
                      Allow resume
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" checked={editReleaseAnswers} onChange={(e) => setEditReleaseAnswers(e.target.checked)} />
                      Release answer key
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label>Max tab switches</label>
                    <input
                      className="register__input edtp-number-input"
                      type="number"
                      min={0}
                      value={editMaxTabSwitches}
                      onChange={(e) => setEditMaxTabSwitches(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <EdtpFormActions>
                  <EdtpBtn variant="primary" onClick={() => void saveEdit()}>Save</EdtpBtn>
                  <EdtpBtn variant="ghost" onClick={() => setEditingId(null)}>Cancel</EdtpBtn>
                </EdtpFormActions>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>{t.duration_minutes} min</td>
                  <td>{t.total_marks ?? '—'}</td>
                  <td>
                    <EdtpRowActions>
                      <EdtpBtn variant="secondary" onClick={() => startEdit(t)}>Edit</EdtpBtn>
                      {(t.status === 'draft' || t.status === 'scheduled') && (
                        <>
                          <Link
                            to={`/dashboard/test-builder/${t.id}`}
                            className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                          >
                            {t.status === 'draft' ? 'Build / Publish' : 'Manage'}
                          </Link>
                          {t.status === 'draft' && (
                            <EdtpBtn variant="success" onClick={() => void publish(t.id)}>
                              Publish Now
                            </EdtpBtn>
                          )}
                        </>
                      )}
                      {t.status === 'live' && (
                        <Link
                          to={`/dashboard/test-builder/${t.id}`}
                          className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                        >
                          Manage & Assign
                        </Link>
                      )}
                      <EdtpBtn variant="danger" onClick={() => void remove(t.id, t.title)}>
                        Delete
                      </EdtpBtn>
                    </EdtpRowActions>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr><td colSpan={5}>No tests yet. <Link to="/dashboard/create-test">Create your first test</Link>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function StudentTestsPanel() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setPageLoading(true);
    examinationService
      .listMyAssignedTests()
      .then(setTests)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setPageLoading(false));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useDashboardLoadingEffect(loading || pageLoading);

  const start = async (testId: string) => {
    setLoading(true);
    setStartingId(testId);
    setError('');
    try {
      const attempt = await examinationService.startAttempt(testId);
      navigate(`/dashboard/exam/${testId}/attempt/${attempt.id}`);
    } catch (err) {
      const msg = parseApiError(err);
      setError(msg);
      showError('Cannot start', msg);
      // Refresh list in case schedule flipped to live
      examinationService.listMyAssignedTests().then(setTests).catch(() => undefined);
    } finally {
      setLoading(false);
      setStartingId(null);
    }
  };

  const resume = (t: ExamTest) => {
    if (t.attempt_id) navigate(`/dashboard/exam/${t.id}/attempt/${t.attempt_id}`);
  };

  const opensInMs = (t: ExamTest) => {
    void nowTick;
    const startAt = t.scheduled_start ?? t.scheduled_at;
    if (!startAt) return null;
    const ms = msUntil(startAt);
    if (ms == null) return null;
    if (t.status === 'scheduled' || ms > 0) return Math.max(0, ms);
    return null;
  };

  const statusMeta = (t: ExamTest) => {
    const st = t.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted') {
      return { label: 'Completed', cls: 'edtp-badge--active' };
    }
    if (st === 'in_progress') {
      return { label: 'In progress', cls: 'edtp-badge--role' };
    }
    const wait = opensInMs(t);
    if (wait != null && wait > 0) {
      return { label: 'Scheduled', cls: 'edtp-badge--role' };
    }
    return { label: 'Not started', cls: 'edtp-badge--inactive' };
  };

  const renderAction = (t: ExamTest) => {
    const st = t.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted') {
      const resultId = t.result_attempt_id ?? t.attempt_id;
      return resultId ? (
        <Link to={`/dashboard/exam-result/${resultId}`} className="edtp-btn edtp-btn--secondary edtp-btn--md">
          View Result
        </Link>
      ) : (
        <span className="text-muted">Completed</span>
      );
    }
    if (st === 'in_progress' && t.attempt_id) {
      return (
        <EdtpBtn variant="primary" size="md" disabled={loading} onClick={() => resume(t)}>
          Resume Test
        </EdtpBtn>
      );
    }
    const wait = opensInMs(t);
    if (wait != null && wait > 0) {
      return (
        <span className="sca-exam-countdown" title={t.scheduled_start ?? t.scheduled_at ?? ''}>
          Starts in {formatCountdown(wait)}
        </span>
      );
    }
    return (
      <EdtpBtn
        variant="primary"
        size="md"
        disabled={loading || startingId === t.id}
        onClick={() => void start(t.id)}
      >
        {startingId === t.id ? 'Starting…' : 'Start Test'}
      </EdtpBtn>
    );
  };

  return (
    <>
      <DashboardPageHeader
        badge="Online Tests"
        title="My Assigned Tests"
        subtitle="Start, resume or view results for your institute examinations."
      />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0">Available Tests</h4>
          <span className="badge bg-primary">{tests.length}</span>
        </div>
        {error && <p className="login__error sp_bottom_15">{error}</p>}

        {tests.length === 0 && !error && !pageLoading ? (
          <div className="sca-student-tests-empty">
            <h5>No tests assigned yet</h5>
            <p className="text-muted mb-0">
              When your institute publishes and assigns an exam, it will appear here.
            </p>
          </div>
        ) : (
          <div className="sca-student-tests-grid">
            {tests.map((t) => {
              const status = statusMeta(t);
              return (
                <article key={t.id} className="sca-student-test-card">
                  <div className="sca-student-test-card__top">
                    <span className={`edtp-badge ${status.cls}`}>{status.label}</span>
                    {t.result_percentage != null && (
                      <span className="sca-student-test-card__score">
                        {Number(t.result_percentage).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <h5 className="sca-student-test-card__title">{t.title}</h5>
                  <ul className="sca-student-test-card__meta">
                    <li>
                      <span>Duration</span>
                      <strong>{t.duration_minutes} min</strong>
                    </li>
                    <li>
                      <span>Passing</span>
                      <strong>{t.passing_marks ?? '—'}</strong>
                    </li>
                    {t.total_marks != null && (
                      <li>
                        <span>Total marks</span>
                        <strong>{t.total_marks}</strong>
                      </li>
                    )}
                  </ul>
                  <div className="sca-student-test-card__action">{renderAction(t)}</div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export function AttemptsListPanel({
  title,
  readOnly = false,
}: {
  title: string;
  readOnly?: boolean;
}) {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .listAttempts(1, 50)
      .then((res) => setAttempts(res.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Score</th>
              <th>Started</th>
              {!readOnly && <th />}
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.test_title ?? a.test_id}</td>
                <td>{a.status.replace('_', ' ')}</td>
                <td>{a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : '—'}</td>
                <td>{formatDateTime(a.started_at)}</td>
                {!readOnly && (
                  <td>
                    {a.status === 'in_progress' && (
                      <button
                        type="button"
                        className="dashboard__small__btn__2"
                        onClick={() => navigate(`/dashboard/exam/${a.test_id}/attempt/${a.id}`)}
                      >
                        Resume
                      </button>
                    )}
                    {(a.status === 'submitted' || a.status === 'auto_submitted') && (
                      <Link to={`/dashboard/exam-result/${a.id}`} className="dashboard__small__btn__2">
                        Result
                      </Link>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 4 : 5}>No attempts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultsPanel() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .listMyResults()
      .then(setResults)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>My Results</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Rank</th>
              <th>Percentile</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.test_title ?? r.test_id}</td>
                <td>
                  {r.total_score}/{r.max_score}
                </td>
                <td>{Number(r.percentage).toFixed(1)}%</td>
                <td>{r.rank != null ? `#${r.rank}` : '—'}</td>
                <td>{r.percentile != null ? `${Number(r.percentile).toFixed(1)}%` : '—'}</td>
                <td>{formatDateTime(r.created_at)}</td>
                <td>
                  <Link to={`/dashboard/exam-result/${r.attempt_id}`} className="dashboard__small__btn__2">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreateTestPanel() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const { branches } = useOrganization();
  const withLoader = useDashboardLoader();
  useDashboardLoadingEffect(deptsLoading);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTestApiFormValues>({
    resolver: yupResolver(createTestApiSchema),
    defaultValues: {
      title: '',
      duration: '60',
      description: '',
      departmentId: '',
      subjectId: '',
      topicId: '',
      passingMarks: '40',
      instructions: 'Read all questions carefully. Do not switch tabs during the exam.',
      shuffleQuestions: false,
      shuffleOptions: false,
      negativeMarking: false,
      fullScreen: true,
      allowResume: true,
      releaseAnswers: false,
      maxTabSwitches: '5',
    },
  });

  const departmentId = watch('departmentId');
  const subjectId = watch('subjectId');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDeptsLoading(true);
      try {
        const branchId = branches[0]?.id;
        const deptRes = branchId
          ? await platformService.listDepartments(branchId, 1, 50)
          : { data: [] as { id: string; name: string }[] };
        if (cancelled) return;
        setDepartments(deptRes.data.map((d) => ({ id: d.id, name: d.name })));
      } catch (err) {
        if (!cancelled) setApiError(parseApiError(err));
      } finally {
        if (!cancelled) setDeptsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branches]);

  useEffect(() => {
    setValue('subjectId', '');
    setValue('topicId', '');
    setSubjects([]);
    setTopics([]);
    if (!departmentId) {
      setSubjectsLoading(false);
      return;
    }
    let cancelled = false;
    setSubjectsLoading(true);
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((r) => {
        if (!cancelled) setSubjects(r.data.map((s) => ({ id: s.id, name: s.name })));
      })
      .catch((err) => {
        if (!cancelled) setApiError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId, setValue]);

  useEffect(() => {
    setValue('topicId', '');
    setTopics([]);
    if (!subjectId) {
      setTopicsLoading(false);
      return;
    }
    let cancelled = false;
    setTopicsLoading(true);
    examinationService
      .listTopicsForSubject(subjectId)
      .then((list) => {
        if (!cancelled) setTopics(list.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch(() => {
        if (!cancelled) setTopics([]);
      })
      .finally(() => {
        if (!cancelled) setTopicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId, setValue]);

  const onSubmit = async (values: CreateTestApiFormValues) => {
    setApiError('');
    setMessage('');
    const dept = departments.find((d) => d.id === values.departmentId);
    const subject = subjects.find((s) => s.id === values.subjectId);
    const topic = topics.find((t) => t.id === values.topicId);
    const duration = parsePositiveIntInput(values.duration);
    if (duration == null || duration < 1) {
      setApiError('Duration must be at least 1 minute.');
      return;
    }
    await withLoader(async () => {
      try {
        const test = await examinationService.createTest({
          title: values.title,
          description: values.description,
          durationMinutes: duration,
          passingMarks: Number(values.passingMarks),
          instructions: values.instructions || 'Read all questions carefully.',
          config: {
            departmentId: values.departmentId,
            departmentName: dept?.name,
            subjectId: values.subjectId,
            subjectName: subject?.name,
            topicId: values.topicId,
            topicName: topic?.name,
            shuffleQuestions: Boolean(values.shuffleQuestions),
            shuffleOptions: Boolean(values.shuffleOptions),
            negativeMarking: Boolean(values.negativeMarking),
            fullScreen: Boolean(values.fullScreen),
            allowResume: Boolean(values.allowResume),
            releaseAnswers: Boolean(values.releaseAnswers),
            maxTabSwitches: Number(values.maxTabSwitches) || 5,
            browserLock: true,
            blockCopyPaste: true,
            autoSubmit: true,
          },
        });
        reset();
        navigate(`/dashboard/test-builder/${test.id}`);
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Create Test"
        title="Create Test"
        subtitle="Pick department → subject → topic, then save a draft and add questions."
      />
      <AdminExamGuide activeStep={2} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title">
          <h4>New Exam Draft</h4>
        </div>
        {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="edtp-form-card">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="departmentId">Department</label>
              <EdtpSelect
                id="departmentId"
                hasError={!!errors.departmentId}
                loading={deptsLoading}
                {...register('departmentId')}
              >
                <option value="">{deptsLoading ? 'Loading departments…' : 'Select department'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint loading={deptsLoading} loadingText="Fetching departments…" />
              <FormError message={errors.departmentId?.message} />
            </div>
            <div className="col-md-4">
              <label htmlFor="subjectId">Subject</label>
              <EdtpSelect
                id="subjectId"
                hasError={!!errors.subjectId}
                loading={subjectsLoading}
                disabled={!departmentId}
                {...register('subjectId')}
              >
                <option value="">{subjectsLoading ? 'Loading subjects…' : 'Select subject'}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint
                loading={subjectsLoading}
                empty={Boolean(departmentId && !subjectsLoading && subjects.length === 0)}
                emptyText="No subjects for this department."
                loadingText="Fetching subjects…"
              />
              <FormError message={errors.subjectId?.message} />
            </div>
            <div className="col-md-4">
              <label htmlFor="topicId">Topic</label>
              <EdtpSelect
                id="topicId"
                hasError={!!errors.topicId}
                loading={topicsLoading}
                disabled={!subjectId}
                {...register('topicId')}
              >
                <option value="">{topicsLoading ? 'Loading topics…' : 'Select topic'}</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint
                loading={topicsLoading}
                empty={Boolean(subjectId && !topicsLoading && topics.length === 0)}
                emptyText="No topics found for this subject."
                loadingText="Fetching topics…"
              />
              <FormError message={errors.topicId?.message} />
            </div>
            <div className="col-12">
              <label htmlFor="examTitle">Exam Title</label>
              <input id="examTitle" className={inputClassName('register__input', !!errors.title)} {...register('title')} />
              <FormError message={errors.title?.message} />
            </div>
            <div className="col-md-6">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                min={1}
                step={1}
                className={inputClassName('register__input edtp-number-input', !!errors.duration)}
                {...register('duration', {
                  onBlur: (e) => {
                    setValue('duration', normalizePositiveIntInput(e.target.value, 60), {
                      shouldValidate: true,
                    });
                  },
                })}
              />
              <FormError message={errors.duration?.message} />
            </div>
            <div className="col-md-6">
              <label htmlFor="passingMarks">Passing marks</label>
              <input
                id="passingMarks"
                type="number"
                min={0}
                step={1}
                className={inputClassName('register__input edtp-number-input', !!errors.passingMarks)}
                {...register('passingMarks')}
              />
              <FormError message={errors.passingMarks?.message} />
            </div>
            <div className="col-12">
              <label htmlFor="aboutExam">Description (optional)</label>
              <textarea id="aboutExam" rows={2} className={inputClassName('register__input', !!errors.description)} {...register('description')} />
            </div>
            <div className="col-12">
              <label htmlFor="instructions">Exam instructions</label>
              <textarea
                id="instructions"
                rows={3}
                className={inputClassName('register__input', !!errors.instructions)}
                {...register('instructions')}
              />
              <FormError message={errors.instructions?.message} />
            </div>
            <div className="col-12">
              <h5 className="mb-2">Exam rules</h5>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('shuffleQuestions')} /> Shuffle questions
                  </label>
                </div>
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('shuffleOptions')} /> Shuffle options
                  </label>
                </div>
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('negativeMarking')} /> Negative marking
                  </label>
                </div>
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('fullScreen')} /> Fullscreen required
                  </label>
                </div>
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('allowResume')} /> Allow resume
                  </label>
                </div>
                <div className="col-md-4">
                  <label className="d-flex align-items-center gap-2">
                    <input type="checkbox" {...register('releaseAnswers')} /> Release answer key
                  </label>
                </div>
                <div className="col-md-4">
                  <label htmlFor="maxTabSwitches">Max tab switches</label>
                  <input
                    id="maxTabSwitches"
                    type="number"
                    min={0}
                    className={inputClassName('register__input edtp-number-input', !!errors.maxTabSwitches)}
                    {...register('maxTabSwitches')}
                  />
                  <FormError message={errors.maxTabSwitches?.message} />
                </div>
              </div>
            </div>
            <div className="col-12">
              <button type="submit" className="default__button auth-submit-btn">Save &amp; Build Test</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export function ExamAttemptPage() {
  return <ExamAttemptPlayer />;
}

function questionText(content: ExamResultQuestion['content']): string {
  return getQuestionText(content);
}

function formatStudentAnswer(q: ExamResultQuestion): string {
  const raw = q.answer as unknown;
  let answer = raw as ExamResultQuestion['answer'];
  if (typeof raw === 'string') {
    try {
      answer = JSON.parse(raw) as ExamResultQuestion['answer'];
    } catch {
      answer = null;
    }
  }
  if (!answer) return '—';
  if (answer.text != null && String(answer.text).trim() !== '') return String(answer.text);
  if (answer.value != null && String(answer.value) !== '') return String(answer.value);
  const selected = answer.selectedOptionIds ?? [];
  if (selected.length === 0) return '—';
  const labels = selected.map((id) => {
    const opt = q.options?.find((o) => o.id === id);
    const label = getOptionText(opt?.content);
    return label === '—' ? id.slice(0, 8) : label;
  });
  return labels.join(', ');
}

function formatCorrectAnswer(q: ExamResultQuestion): string {
  const correct = (q.options ?? []).filter((o) => o.is_correct);
  if (correct.length === 0) return '—';
  return correct.map((o) => getOptionText(o.content)).join(', ');
}

export function ExamResultPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [certBusy, setCertBusy] = useState(false);
  const [existingCert, setExistingCert] = useState<Awaited<
    ReturnType<typeof examinationService.listMyCertificates>
  >[number] | null>(null);
  const withLoader = useDashboardLoader();
  const roles = user?.roles ?? [];
  const isStaffLike = roles.some((r) =>
    ['super_admin', 'org_admin', 'staff', 'branch_admin'].includes(r),
  );
  const isTeacherOnly = roles.includes('teacher') && !isStaffLike;
  const isStudent = roles.includes('student') && !isStaffLike && !roles.includes('teacher');
  const canIssueAsStaff = isStaffLike || isTeacherOnly;
  const backHref = isStudent
    ? '/dashboard/student-reviews'
    : isTeacherOnly
      ? '/dashboard/teacher-reviews'
      : '/dashboard/admin-reviews';

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    examinationService
      .getResult(attemptId)
      .then(async (res) => {
        setResult(res);
        try {
          if (isStudent) {
            const mine = await examinationService.listMyCertificates();
            setExistingCert(mine.find((c) => c.result_id === res.id && c.status === 'issued') ?? null);
          } else {
            const org = await examinationService.listCertificates(1, 100);
            setExistingCert(
              org.data.find((c) => c.result_id === res.id && c.status === 'issued') ?? null,
            );
          }
        } catch {
          setExistingCert(null);
        }
      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [attemptId, isStudent]);

  useDashboardLoadingEffect(loading);

  const handleIssueCertificate = async () => {
    if (!result?.id) return;
    setCertBusy(true);
    await withLoader(async () => {
      try {
        const cert = await examinationService.issueCertificate(result.id);
        setExistingCert(cert);
        showSuccess('Certificate issued', cert.certificate_no);
        const { downloadCertificateReactPdf } = await import('@/pdf/downloadCertificate');
        await downloadCertificateReactPdf(cert);
      } catch (err) {
        showError('Certificate', parseApiError(err));
      } finally {
        setCertBusy(false);
      }
    });
  };

  const handleDownloadCertificate = async () => {
    if (!existingCert) return;
    setCertBusy(true);
    await withLoader(async () => {
      try {
        const { downloadCertificateReactPdf } = await import('@/pdf/downloadCertificate');
        await downloadCertificateReactPdf(existingCert);
      } catch (err) {
        showError('Certificate', parseApiError(err));
      } finally {
        setCertBusy(false);
      }
    });
  };

  if (error) return <p className="login__error">{error}</p>;
  if (!result) return null;

  const studentName = [result.first_name, result.last_name].filter(Boolean).join(' ');
  const questions = result.questions ?? [];
  const passing = result.passing_marks != null && Number(result.passing_marks) > 0
    ? Number(result.total_score) >= Number(result.passing_marks)
    : Number(result.percentage) >= 40;
  const showAnswerKey = Boolean(result.answers_released) || canIssueAsStaff;

  const renderCertCta = () => {
    if (existingCert) {
      return (
        <EdtpBtn variant="primary" disabled={certBusy} onClick={() => void handleDownloadCertificate()}>
          {certBusy ? 'Preparing…' : 'Download PDF'}
        </EdtpBtn>
      );
    }
    if (!passing) return null;
    if (canIssueAsStaff) {
      return (
        <EdtpBtn variant="primary" disabled={certBusy} onClick={() => void handleIssueCertificate()}>
          {certBusy ? 'Issuing…' : 'Issue certificate'}
        </EdtpBtn>
      );
    }
    if (isStudent) {
      return (
        <EdtpBtn variant="primary" disabled={certBusy} onClick={() => void handleIssueCertificate()}>
          {certBusy ? 'Issuing…' : 'Get certificate PDF'}
        </EdtpBtn>
      );
    }
    return null;
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Result — {result.test_title}</h4>
        {studentName ? <p className="text-muted mb-0">Student: {studentName}</p> : null}
      </div>
      <div className="d-flex flex-wrap gap-2 sp_bottom_20">
        <Link to={backHref} className="edtp-btn edtp-btn--secondary edtp-btn--sm">
          Back
        </Link>
        {renderCertCta()}
        <Link to="/verify-certificate" className="edtp-btn edtp-btn--ghost edtp-btn--sm">
          Verify certificate
        </Link>
      </div>
      <div className="row">
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">{result.total_score}/{result.max_score}</div>
              <p>Score</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">{Number(result.percentage).toFixed(1)}%</div>
              <p>Percentage</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">
                {result.rank != null ? `#${result.rank}` : '—'}
              </div>
              <p>Rank</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">
                {result.percentile != null ? `${Number(result.percentile).toFixed(1)}%` : '—'}
              </div>
              <p>Percentile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="edtp-form-card sp_bottom_20">
        <h5 className="sp_bottom_15">Question-wise analysis</h5>
        {!showAnswerKey && isStudent ? (
          <p className="text-muted sp_bottom_15 mb-0">
            Answer key is hidden until the instructor releases it.
          </p>
        ) : null}
        {questions.length === 0 ? (
          <p className="text-muted mb-0">No per-question details available for this attempt.</p>
        ) : (
          questions.map((q, index) => {
            const selectedIds = new Set(q.answer?.selectedOptionIds ?? []);
            const opts = q.options ?? [];
            const hasOptions = opts.length > 0;
            return (
              <div key={q.question_id} className="sca-exam-result-q">
                <div className="sca-exam-result-q__head">
                  <strong>Q{index + 1}.</strong>
                  <span>{questionText(q.content)}</span>
                  {showAnswerKey && q.is_correct != null ? (
                    <span className={`edtp-badge ${q.is_correct ? 'edtp-badge--active' : 'edtp-badge--inactive'}`}>
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  ) : null}
                  <span className="sca-exam-result-q__meta">
                    Marks: {Number(q.marks_awarded ?? 0)} / {Number(q.marks)}
                  </span>
                </div>
                {showAnswerKey && hasOptions ? (
                  <ul className="sca-exam-result-q__options">
                    {opts.map((o) => {
                      const selected = selectedIds.has(o.id);
                      const correct = Boolean(o.is_correct);
                      let cls = 'sca-exam-result-opt';
                      if (correct) cls += ' sca-exam-result-opt--correct';
                      else if (selected) cls += ' sca-exam-result-opt--wrong';
                      return (
                        <li key={o.id} className={cls}>
                          {getOptionText(o.content)}
                          {correct ? ' ✓' : ''}
                          {selected && !correct ? ' (your answer)' : ''}
                          {selected && correct ? ' (your answer)' : ''}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="sca-exam-result-q__answers">
                    {showAnswerKey ? (
                      <div>
                        <strong>Correct answer:</strong> {formatCorrectAnswer(q)}
                      </div>
                    ) : null}
                    <div>
                      <strong>Student answered:</strong> {formatStudentAnswer(q)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Link className="edtp-btn edtp-btn--primary edtp-btn--md" to={backHref}>
        Back to Results
      </Link>
    </div>
  );
}

export function ProfileSettingsApiForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const withLoader = useDashboardLoader();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSettingsFormValues>({
    resolver: yupResolver(profileSettingsSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      bio: '',
    },
  });

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    setApiError('');
    await withLoader(async () => {
      try {
        await examinationService.updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        });
        await refreshUser();
        setMessage('Profile updated successfully.');
        onSuccess?.();
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" className={inputClassName('register__input', !!errors.firstName)} {...register('firstName')} />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" className={inputClassName('register__input', !!errors.lastName)} {...register('lastName')} />
          <FormError message={errors.lastName?.message} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" disabled className="register__input" {...register('email')} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="phone">Phone</label>
          <input id="phone" className={inputClassName('register__input', !!errors.phone)} {...register('phone')} />
          <FormError message={errors.phone?.message} />
        </div>
        <div className="col-xl-12">
          <button type="submit" className="default__button">Update Profile</button>
        </div>
      </div>
    </form>
  );
}
