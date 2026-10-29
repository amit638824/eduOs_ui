import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
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
import { getTestsListPath } from '@/utils/dashboardRole';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { profileSettingsSchema, type ProfileSettingsFormValues } from '@/validators/schemas';
import ExamAttemptPlayer from './ExamAttemptPlayer';
import { PracticeInsights } from './AiBuildPanel';
import AdminExamGuide, { ExamStepper } from '@/components/dashboard/AdminExamGuide';
import { FieldHint } from '@/components/ui/FieldHint';
import { EdtpBtn, EdtpSelect } from '@/components/ui/CrudUI';
import { confirmAction, confirmDelete, showError, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import { normalizePositiveIntInput, parsePositiveIntInput } from '@/utils/positiveIntInput';
import { getOptionText, getQuestionText } from '@/utils/questionContent';
import { QuestionPreviewModal } from '@/components/dashboard/QuestionPreviewModal';
import {
  CertificatePreviewModal,
  type CertificateTemplate,
} from '@/components/dashboard/CertificatePreviewModal';
import '@/styles/organizations.css';
import type { ExamResultQuestion } from '@/types/examination';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiDownload,
  FiUpload,
  FiEye,
  FiEdit3,
  FiZap,
  FiTrash2,
  FiHelpCircle,
  FiArrowRight,
  FiCheckCircle,
  FiList,
  FiPlay,
  FiAward,
  FiArrowLeft,
  FiUser,
} from 'react-icons/fi';

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

  const {
    items: questions,
    pagination,
    page,
    limit,
    searchQuery: questionSearch,
    loading,
    error,
    setError,
    setSearchQuery: setQuestionSearch,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh: loadQuestions,
  } = useServerList<Question>({
    fetcher: ({ page: p, limit: l, search }) =>
      examinationService.listQuestions(p, l, undefined, search || undefined),
    defaultLimit: 10,
  });
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
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [deptsLoading, setDeptsLoading] = useState(false);
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const withLoader = useDashboardLoader();

  const openAddDrawer = () => {
    resetQuestionFields();
    setError('');
    setMessage('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    if (editingId) resetQuestionFields();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

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
        setIsDrawerOpen(true);
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
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
      setError('This looks like an Excel workbook. In Excel use Save As → CSV, then upload that file.');
      showError('Save as CSV', 'Excel workbooks are not imported. Save the sheet as CSV first.');
      return;
    }
    const encoding =
      bytes[0] === 0xff && bytes[1] === 0xfe
        ? 'utf-16le'
        : bytes[0] === 0xfe && bytes[1] === 0xff
          ? 'utf-16be'
          : 'utf-8';
    const csvText = new TextDecoder(encoding).decode(bytes);
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
          setIsDrawerOpen(false);
        } else {
          const created = await examinationService.createQuestion(payload);
          try {
            await examinationService.approveQuestion(created.id);
            setMessage(`${QUESTION_TYPE_LABELS[questionType]} question added successfully.`);
          } catch {
            setMessage('Question created (pending approval).');
          }
          setNewQ('');
          clearOptionInputs();
          setIsDrawerOpen(false);
        }
        await loadQuestions();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const improveQuestion = async (id: string) => {
    setError('');
    try {
      const improved = await withLoader(() => examinationService.improveQuestion(id));
      setMessage(`Improved wording. Difficulty is now ${improved.difficulty}. You can edit it again.`);
      showSuccess('Question improved', 'Grammar, wording, and distractors were updated.');
      await loadQuestions();
    } catch (err) {
      setError(parseApiError(err));
      showError('Improve failed', parseApiError(err));
    }
  };

  const handleDistractors = async (id: string) => {
    setError('');
    try {
      const preview = await withLoader(() => examinationService.generateDistractors(id, false));
      const lines = preview.options
        .map((opt) => `${opt.isCorrect ? 'Correct' : 'Wrong'}: ${opt.text}${opt.whyWrong ? ` — ${opt.whyWrong}` : ''}`)
        .join('\n');
      const ok = await confirmAction({
        title: 'Replace distractors?',
        text: lines || 'No options returned.',
        confirmText: 'Save options',
      });
      if (!ok) return;
      await examinationService.generateDistractors(id, true, preview.options);
      showSuccess('Distractors saved', 'Incorrect options were replaced.');
      await loadQuestions();
    } catch (err) {
      setError(parseApiError(err));
      showError('Distractors failed', parseApiError(err));
    }
  };

  const allFilteredSelected =
    questions.length > 0 &&
    questions.every((q) => selectedDeleteIds.includes(q.id));

  return (
    <div className="org-panel-root">
      {/* ── Top Bar: Page Title + Progress + Next Action ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">Question Bank</h1>
          <p className="org-page-desc">
            Department → subject → topic stay selected after each add. Edit or delete anytime from the list.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/dashboard/create-test"
            className="org-add-btn"
            style={{ textDecoration: 'none' }}
          >
            <span>Next: Create the exam</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Progress Stepper - preserved */}
      <div style={{ margin: '14px 0 20px' }}>
        <AdminExamGuide activeStep={1} compact />
      </div>

      {error && (
        <div className="mad-alert-error" role="alert" style={{ marginBottom: '16px' }}>
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="mad-alert-success" role="alert" style={{ marginBottom: '16px' }}>
          <span>{message}</span>
        </div>
      )}

      {importSummary && (
        <div className="qb-import-summary" style={{ marginBottom: '16px', borderRadius: '12px' }}>
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

      {/* ── Main Full-Width Table Card ── */}
      <div className="org-table-card">
        {/* Card Header with Search, CSV buttons & Add Question Button */}
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Questions Library</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Question' : 'Questions'}
              </span>
            </div>
            <p className="org-card-subtitle">Manage, curate and organize verified examination questions bank</p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search questions by text, department, topic…"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
              />
              {questionSearch && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={clearSearch}
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Hidden CSV Input */}
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => void handleCsvImport(e.target.files?.[0])}
            />

            {/* Download Example CSV */}
            <a
              className="org-drawer-cancel"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem', gap: '6px', textDecoration: 'none' }}
              href="/templates/question-bank-import.csv"
              download="question-bank-import-example.csv"
              title="Download question bank import CSV template"
            >
              <FiDownload />
              <span>Example CSV</span>
            </a>

            {/* Bulk Import CSV */}
            <button
              type="button"
              className="org-drawer-cancel"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
              disabled={importingCsv}
              onClick={() => csvFileRef.current?.click()}
              title="Bulk import questions from CSV"
            >
              <FiUpload />
              <span>{importingCsv ? 'Importing…' : 'Bulk Import CSV'}</span>
            </button>

            {/* Bulk Delete button if selected */}
            {selectedDeleteIds.length > 0 && (
              <button
                type="button"
                className="org-action-btn org-action-btn--danger"
                onClick={() => void handleBulkDelete()}
              >
                <FiTrash2 />
                <span>Delete Selected ({selectedDeleteIds.length})</span>
              </button>
            )}

            {/* + Add Question Button */}
            <button
              type="button"
              className="org-add-btn"
              onClick={openAddDrawer}
              id="btnAddQuestion"
            >
              <FiPlus className="org-add-btn-icon" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Continuous Gradient Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="org-table">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allFilteredSelected}
                    onChange={() => {
                      if (allFilteredSelected) {
                        setSelectedDeleteIds((prev) =>
                          prev.filter((id) => !questions.some((q) => q.id === id)),
                        );
                      } else {
                        setSelectedDeleteIds((prev) => {
                          const next = new Set(prev);
                          questions.forEach((q) => next.add(q.id));
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
                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => {
                const label = getQuestionText(q.content);
                return (
                  <tr key={q.id} className={editingId === q.id ? 'edtp-row--editing' : undefined}>
                    <td style={{ textAlign: 'center' }}>
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
                    <td style={{ fontWeight: 600, color: '#0f172a', maxWidth: '340px' }}>
                      <div style={{ wordBreak: 'break-word', lineHeight: 1.4 }}>{label}</div>
                    </td>
                    <td>{q.department_name ?? '—'}</td>
                    <td>{q.subject_name ?? '—'}</td>
                    <td>{q.topic_name ?? '—'}</td>
                    <td>
                      <span className="org-role-badge org-role-badge--student" style={{ fontSize: '0.72rem' }}>
                        {QUESTION_TYPE_LABELS[q.type as QuestionType] ?? q.type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`org-status-badge ${
                          q.status === 'approved' ? 'org-status-badge--active' : 'org-status-badge--inactive'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div className="org-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--switch"
                          onClick={() => setPreviewQuestionId(q.id)}
                          title="Preview question"
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--edit"
                          onClick={() => void handleEdit(q.id)}
                          title="Edit question"
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          type="button"
                          className="org-icon-btn"
                          style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed' }}
                          onClick={() => void improveQuestion(q.id)}
                          title="Improve wording with AI"
                        >
                          <FiZap />
                        </button>
                        {(q.type === 'mcq' || q.type === 'msq') && (
                          <button
                            type="button"
                            className="org-icon-btn"
                            style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706' }}
                            onClick={() => void handleDistractors(q.id)}
                            title="Generate AI distractors"
                          >
                            <FiList />
                          </button>
                        )}
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--delete"
                          onClick={() => void handleDelete(q.id)}
                          title="Delete question"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                    No questions found. Click <strong>+ Add Question</strong> above or import questions from CSV.
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

      {/* ── Side Drawer for Adding/Editing Questions ── */}
      <div
        className={`org-drawer-overlay ${isDrawerOpen ? 'is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div
        className={`org-drawer ${isDrawerOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawerQuestionTitle"
      >
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <FiHelpCircle />
            </div>
            <div>
              <h3 className="org-drawer-title" id="drawerQuestionTitle">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h3>
              <p className="org-drawer-desc">
                Configure question details, options and scoring attributes
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
        >
          <div className="org-drawer-body">
            {error && (
              <div className="mad-alert-error" role="alert" style={{ marginBottom: '12px' }}>
                <span>{error}</span>
              </div>
            )}

            {/* Department */}
            <div className="org-form-field">
              <label className="org-form-label">
                Department <span className="org-required-star">*</span>
              </label>
              <EdtpSelect
                loading={deptsLoading}
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                required
                className="org-form-input"
              >
                <option value="">{deptsLoading ? 'Loading departments…' : 'Select department'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </EdtpSelect>
              <FieldHint loading={deptsLoading} loadingText="Fetching departments…" />
              {!deptsLoading && (
                <span className="org-form-hint">
                  Stays selected until you change it. Org Admin adds departments.
                </span>
              )}
            </div>

            {/* Subject */}
            <div className="org-form-field">
              <label className="org-form-label">
                Subject <span className="org-required-star">*</span>
              </label>
              <EdtpSelect
                loading={subjectsLoading}
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!departmentId || subjectsLoading}
                required
                className="org-form-input"
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
                <div style={{ marginTop: '4px' }}>
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
              {showAddSubject && departmentId && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    className="org-form-input"
                    placeholder="Subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ padding: '6px 14px' }}
                    onClick={handleAddSubject}
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
              <EdtpSelect
                loading={topicsLoading}
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId || topicsLoading}
                required
                className="org-form-input"
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
                <div style={{ marginTop: '4px' }}>
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
              {showAddTopic && subjectId && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    className="org-form-input"
                    placeholder="Topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ padding: '6px 14px' }}
                    onClick={handleAddTopic}
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
                    clearOptionInputs();
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
                  onBlur={() => setMarksInput(normalizeMarksInput(marksInput))}
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
            {needsTwoOptions(questionType) && (
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
                className="org-form-input"
                rows={3}
                placeholder="Enter the complete question text..."
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
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
            {needsAnswerOnly(questionType) && (
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
            {needsTwoOptions(questionType) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                <div className="org-form-field" style={{ marginTop: '4px' }}>
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
            <button type="button" className="org-drawer-cancel" onClick={closeDrawer}>
              Cancel
            </button>
            <button
              type="submit"
              className="org-drawer-submit"
              disabled={!topicId}
            >
              {editingId ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>

      <QuestionPreviewModal
        questionId={previewQuestionId}
        onClose={() => setPreviewQuestionId(null)}
      />
    </div>
  );
}

export function TestsListPanel({ title }: { title: string }) {
  const {
    items: tests,
    pagination,
    page,
    limit,
    searchQuery: searchTerm,
    loading,
    error,
    setError,
    setSearchQuery: setSearchTerm,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh: load,
  } = useServerList<ExamTest>({
    fetcher: ({ page: p, limit: l, search }) =>
      examinationService.listTests(p, l, undefined, search || undefined),
    defaultLimit: 10,
  });
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
  const [editMaxAttempts, setEditMaxAttempts] = useState('1');
  const [editScoringPolicy, setEditScoringPolicy] = useState<'latest' | 'highest'>('latest');
  const [editMaxFullscreenExits, setEditMaxFullscreenExits] = useState('3');
  const [editMaxCopyPasteAttempts, setEditMaxCopyPasteAttempts] = useState('3');
  const [editExamType, setEditExamType] = useState<'official' | 'practice'>('official');
  const [editCertificationEnabled, setEditCertificationEnabled] = useState(true);
  const withLoader = useDashboardLoader();

  useDashboardLoadingEffect(loading);

  const startEdit = (t: ExamTest) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDuration(String(t.duration_minutes ?? 60));
    setEditPassingMarks(String(t.passing_marks ?? 40));
    setEditInstructions(t.instructions ?? '');
    const cfg = (t.config ?? {}) as Record<string, unknown>;
    setEditExamType(cfg.examType === 'practice' ? 'practice' : 'official');
    setEditCertificationEnabled(cfg.certificationEnabled !== false);
    setEditShuffleQuestions(Boolean(cfg.shuffleQuestions));
    setEditShuffleOptions(Boolean(cfg.shuffleOptions));
    setEditNegativeMarking(Boolean(cfg.negativeMarking));
    setEditFullScreen(cfg.fullScreen !== false);
    setEditAllowResume(cfg.allowResume !== false);
    setEditReleaseAnswers(Boolean(cfg.releaseAnswers));
    setEditMaxTabSwitches(String(cfg.maxTabSwitches ?? 5));
    setEditMaxAttempts(String(cfg.maxAttempts ?? 1));
    setEditScoringPolicy(cfg.scoringPolicy === 'highest' ? 'highest' : 'latest');
    setEditMaxFullscreenExits(String(cfg.maxFullscreenExits ?? 3));
    setEditMaxCopyPasteAttempts(String(cfg.maxCopyPasteAttempts ?? 3));
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
            examType: editExamType,
            certificationEnabled: editExamType === 'official' && editCertificationEnabled,
            shuffleQuestions: editShuffleQuestions,
            shuffleOptions: editShuffleOptions,
            negativeMarking: editNegativeMarking,
            fullScreen: editFullScreen,
            allowResume: editAllowResume,
            releaseAnswers: editReleaseAnswers,
            maxTabSwitches: maxTabs,
            maxAttempts:
              editExamType === 'official'
                ? 1
                : Math.min(10, Math.max(1, Number(editMaxAttempts) || 1)),
            scoringPolicy: editScoringPolicy,
            maxFullscreenExits: Math.max(0, Number(editMaxFullscreenExits) || 0),
            maxCopyPasteAttempts: Math.max(0, Number(editMaxCopyPasteAttempts) || 0),
            browserLock: true,
            blockCopyPaste: true,
            autoSubmit: true,
          },
        });
        setEditingId(null);
        showSuccess('Updated', 'Test details saved.');
        await load();
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
        await load();
      });
      showSuccess('Deleted!', `${name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const statusBadge = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      live: 'Live',
      completed: 'Completed',
      cancelled: 'Cancelled',
      archived: 'Archived',
    };
    if (status === 'live') {
      return <span className="org-status-badge org-status-badge--active">Live</span>;
    }
    if (status === 'draft') {
      return <span className="org-status-badge org-status-badge--inactive">Draft</span>;
    }
    if (status === 'scheduled') {
      return <span className="org-status-badge org-status-badge--pending">Scheduled</span>;
    }
    if (status === 'completed' || status === 'cancelled') {
      return <span className="org-status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>{labels[status] ?? status}</span>;
    }
    return <span className="org-status-badge org-status-badge--inactive">{labels[status] ?? status}</span>;
  };

  return (
    <div className="org-panel-root">
      <div className="org-top-bar">
        <div>
          <h2 className="org-page-title">{title}</h2>
          <p className="org-page-desc">
            A draft is not live yet. Press Continue setup, add questions, publish, then assign students.
          </p>
        </div>
        <Link to="/dashboard/create-test" className="org-add-btn">
          <FiPlus /> Create Test
        </Link>
      </div>

      <AdminExamGuide activeStep={3} compact />

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Tests</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Test' : 'Tests'}
              </span>
            </div>
            <p className="org-card-subtitle">Manage, schedule, and assign assessment tests</p>
          </div>

          <div className="org-controls-row">
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search tests by title or status…"
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
          </div>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>TITLE</th>
                <th>STATUS</th>
                <th>DURATION</th>
                <th>MARKS</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: 220 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{t.title}</strong>
                  </td>
                  <td>{statusBadge(t.status)}</td>
                  <td style={{ color: '#475569' }}>{t.duration_minutes} min</td>
                  <td style={{ color: '#475569', fontWeight: 500 }}>{t.total_marks ?? '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {t.status === 'draft' && (
                        <Link
                          to={`/dashboard/test-builder/${t.id}?step=build`}
                          className="org-action-btn org-action-btn--switch"
                          title="Continue setup"
                        >
                          <FiPlay style={{ fontSize: 13 }} /> Setup
                        </Link>
                      )}
                      {(t.status === 'scheduled' || t.status === 'live') && (
                        <Link
                          to={`/dashboard/test-builder/${t.id}?step=assign`}
                          className="org-action-btn org-action-btn--switch"
                          title="Assign students"
                        >
                          <FiZap style={{ fontSize: 13 }} /> Assign
                        </Link>
                      )}
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--edit"
                        disabled={t.status === 'completed'}
                        title={t.status === 'completed' ? 'Completed tests cannot be edited' : 'Edit test details'}
                        onClick={() => {
                          if (t.status !== 'completed') startEdit(t);
                        }}
                      >
                        <FiEdit3 style={{ fontSize: 13 }} /> Edit
                      </button>
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--danger"
                        onClick={() => void remove(t.id, t.title)}
                        title="Delete test"
                      >
                        <FiTrash2 style={{ fontSize: 13 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    {!searchTerm.trim() ? (
                      <>No tests yet. <Link to="/dashboard/create-test" style={{ color: '#2563eb', fontWeight: 600 }}>Create your first test</Link>.</>
                    ) : (
                      'No tests match your search filter.'
                    )}
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

      {editingId && (
        <>
          <div className="org-drawer-overlay" onClick={() => setEditingId(null)} />
          <div className="org-drawer">
            <div className="org-drawer-header">
              <div>
                <h3 className="org-drawer-title">Edit Test Details</h3>
                <p className="org-drawer-subtitle">Update duration, scoring, and examination security rules</p>
              </div>
              <button
                type="button"
                className="org-drawer-close"
                onClick={() => setEditingId(null)}
                aria-label="Close drawer"
              >
                <FiX />
              </button>
            </div>
            <div className="org-drawer-body">
              <div className="org-form-field">
                <label className="org-form-label">Test Title</label>
                <input
                  className="org-form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Midterm Physics Examination"
                />
              </div>

              <div className="org-grid-2">
                <div className="org-form-field">
                  <label className="org-form-label">Duration (minutes)</label>
                  <input
                    className="org-form-input"
                    type="number"
                    min={1}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    onBlur={() => setEditDuration(normalizePositiveIntInput(editDuration, 60))}
                  />
                </div>
                <div className="org-form-field">
                  <label className="org-form-label">Passing marks</label>
                  <input
                    className="org-form-input"
                    type="number"
                    min={0}
                    value={editPassingMarks}
                    onChange={(e) => setEditPassingMarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="org-grid-2">
                <div className="org-form-field">
                  <label className="org-form-label" htmlFor="editExamType">Exam Type</label>
                  <select
                    id="editExamType"
                    className="org-form-select"
                    value={editExamType}
                    onChange={(e) => {
                      const type = e.target.value as 'official' | 'practice';
                      setEditExamType(type);
                      if (type === 'official') {
                        setEditMaxAttempts('1');
                        setEditCertificationEnabled(true);
                      } else {
                        setEditCertificationEnabled(false);
                      }
                    }}
                  >
                    <option value="official">Official Exam</option>
                    <option value="practice">Practice Exam</option>
                  </select>
                </div>
                <div className="org-form-field" style={{ justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 500, color: '#334155', cursor: 'pointer', marginTop: 24 }}>
                    <input
                      type="checkbox"
                      checked={editCertificationEnabled}
                      disabled={editExamType === 'practice'}
                      onChange={(e) => setEditCertificationEnabled(e.target.checked)}
                      style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                    />
                    Enable Certificate Generation
                  </label>
                </div>
              </div>

              <div className="org-form-field">
                <label className="org-form-label">Instructions</label>
                <textarea
                  className="org-form-input"
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Instructions displayed to students before starting..."
                />
              </div>

              <div style={{ marginTop: 12, padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Exam &amp; Security Rules</h5>
                <div className="org-grid-3">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editShuffleQuestions} onChange={(e) => setEditShuffleQuestions(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Shuffle questions
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editShuffleOptions} onChange={(e) => setEditShuffleOptions(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Shuffle options
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editNegativeMarking} onChange={(e) => setEditNegativeMarking(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Negative marking
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editFullScreen} onChange={(e) => setEditFullScreen(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Fullscreen required
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editAllowResume} onChange={(e) => setEditAllowResume(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Allow resume
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editReleaseAnswers} onChange={(e) => setEditReleaseAnswers(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    Release answers
                  </label>
                </div>

                <div className="org-grid-2" style={{ marginTop: 12 }}>
                  <div className="org-form-field">
                    <label className="org-form-label" style={{ fontSize: '0.75rem' }}>Max Tab Switches</label>
                    <input
                      className="org-form-input"
                      type="number"
                      min={0}
                      value={editMaxTabSwitches}
                      onChange={(e) => setEditMaxTabSwitches(e.target.value)}
                    />
                  </div>
                  <div className="org-form-field">
                    <label className="org-form-label" style={{ fontSize: '0.75rem' }}>Scoring Policy</label>
                    <select
                      className="org-form-select"
                      value={editScoringPolicy}
                      onChange={(e) => setEditScoringPolicy(e.target.value as 'latest' | 'highest')}
                    >
                      <option value="latest">Latest attempt</option>
                      <option value="highest">Highest score</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="org-drawer-footer">
              <button
                type="button"
                className="org-drawer-btn-cancel"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="org-add-btn"
                onClick={() => void saveEdit()}
              >
                <FiCheckCircle /> Save Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function readTestConfig(config: ExamTest['config']): Record<string, unknown> {
  if (!config) return {};
  if (typeof config === 'string') {
    try {
      return JSON.parse(config) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return config;
}

function isPracticeExam(test: ExamTest) {
  const config = readTestConfig(test.config);
  return config.examType === 'practice' || config.exam_type === 'practice';
}

function practiceAttemptsRemaining(test: ExamTest) {
  const config = readTestConfig(test.config);
  const maxAttempts = Math.max(1, Number(config.maxAttempts ?? 1) || 1);
  const used = Number(test.submitted_attempt_count ?? 0);
  return Math.max(0, maxAttempts - used);
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

  // Update countdown every second
  useEffect(() => {
    const id = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

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

      // Refresh in case the exam became live
      examinationService
        .listMyAssignedTests()
        .then(setTests)
        .catch(() => undefined);
    } finally {
      setLoading(false);
      setStartingId(null);
    }
  };

  const resume = (t: ExamTest) => {
    if (t.attempt_id) {
      navigate(`/dashboard/exam/${t.id}/attempt/${t.attempt_id}`);
    }
  };

  /*
   * Assignment schedule has priority.
   * If there is no assignment schedule, use test schedule.
   */
  const getScheduledStart = (t: ExamTest) => {
    return (
      t.effective_scheduled_start ??
      t.scheduled_start ??
      t.scheduled_at ??
      null
    );
  };

  const opensInMs = (t: ExamTest) => {
    // Make React re-render every second.
    void nowTick;

    const startAt = getScheduledStart(t);

    if (!startAt) {
      return null;
    }

    const target = new Date(startAt).getTime();

    if (!Number.isFinite(target)) {
      return null;
    }

    const remaining = target - Date.now();

    if (remaining > 0) {
      return remaining;
    }

    return null;
  };

  const formatExamCountdown = (milliseconds: number) => {
    const totalSeconds = Math.max(
      0,
      Math.floor(milliseconds / 1000),
    );

    const days = Math.floor(totalSeconds / 86400);

    const hours = Math.floor(
      (totalSeconds % 86400) / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds = totalSeconds % 60;

    return [
      `${String(days).padStart(2, '0')} Days`,
      `${String(hours).padStart(2, '0')} Hours`,
      `${String(minutes).padStart(2, '0')} Minutes`,
      `${String(seconds).padStart(2, '0')} Seconds`,
    ].join(' : ');
  };

  const officialWindowEnded = (t: ExamTest) => {
    void nowTick;
    if (isPracticeExam(t)) return false;
    const st = t.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted' || st === 'in_progress') {
      return false;
    }
    if (!t.scheduled_end) return false;
    const end = new Date(t.scheduled_end).getTime();
    return Number.isFinite(end) && end < Date.now();
  };

  const statusMeta = (t: ExamTest) => {
    const st = t.attempt_status;

    if (
      st === 'submitted' ||
      st === 'auto_submitted'
    ) {
      return {
        label: 'Completed',
        cls: 'edtp-badge--active',
      };
    }

    if (st === 'in_progress') {
      return {
        label: 'In progress',
        cls: 'edtp-badge--role',
      };
    }

    if (officialWindowEnded(t)) {
      return {
        label: 'Exam Time Ended',
        cls: 'edtp-badge--danger',
      };
    }

    const wait = opensInMs(t);

    if (wait != null && wait > 0) {
      return {
        label: 'Scheduled',
        cls: 'edtp-badge--role',
      };
    }

    return {
      label: 'Live',
      cls: 'edtp-badge--active',
    };
  };

  const renderAction = (t: ExamTest) => {
    const st = t.attempt_status;

    /*
     * Completed exam
     */
    if (
      st === 'submitted' ||
      st === 'auto_submitted'
    ) {
      const resultId =
        t.result_attempt_id ?? t.attempt_id;
      const canRetest = isPracticeExam(t) && practiceAttemptsRemaining(t) > 0;

      return (
        <div className="d-flex flex-wrap gap-2">
          {resultId ? (
            <Link
              to={`/dashboard/exam-result/${resultId}`}
              className="edtp-btn edtp-btn--secondary edtp-btn--md"
            >
              View Result
            </Link>
          ) : (
            <span className="text-muted">
              Completed
            </span>
          )}
          {canRetest ? (
            <EdtpBtn
              variant="primary"
              size="md"
              disabled={loading || startingId === t.id}
              onClick={() => void start(t.id)}
            >
              {startingId === t.id ? 'Starting…' : 'Retest'}
            </EdtpBtn>
          ) : null}
        </div>
      );
    }

    /*
     * Exam already started but not submitted
     */
    if (
      st === 'in_progress' &&
      t.attempt_id
    ) {
      return (
        <EdtpBtn
          variant="primary"
          size="md"
          disabled={loading}
          onClick={() => resume(t)}
        >
          Resume Test
        </EdtpBtn>
      );
    }

    /*
     * Scheduled exam
     */
    const wait = opensInMs(t);

    if (wait != null && wait > 0) {
      return (
        <div className="sca-student-exam-schedule">
          <div className="sca-student-exam-schedule__label">
            Exam starts in
          </div>

          <div
            className="sca-student-exam-countdown-large"
            title={getScheduledStart(t) ?? ''}
          >
            {formatExamCountdown(wait)}
          </div>
        </div>
      );
    }

    if (officialWindowEnded(t)) {
      return (
        <span className="edtp-badge edtp-badge--danger">Exam Time Ended</span>
      );
    }

    /*
     * Exam is live
     */
    return (
      <div className="sca-student-exam-live">
        <div className="sca-student-exam-live__status">
          <span className="sca-student-exam-live__dot" />
          Exam is Live
        </div>

        <EdtpBtn
          variant="primary"
          size="md"
          disabled={
            loading ||
            startingId === t.id
          }
          onClick={() => void start(t.id)}
        >
          {startingId === t.id
            ? 'Starting…'
            : 'Start Exam'}
        </EdtpBtn>
      </div>
    );
  };

  return (
    <div className="org-panel-root">
      <div className="org-top-bar">
        <div>
          <h2 className="org-page-title">My Assigned Tests</h2>
          <p className="org-page-desc">
            Start, resume, or view results for your institute examinations.
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card sca-student-tests-panel">
        <div className="org-card-header" style={{ marginBottom: 16 }}>
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Available Tests</h3>
              <span className="org-count-badge">{tests.length}</span>
            </div>
            <p className="org-card-subtitle">Live, scheduled, and completed exams assigned to you</p>
          </div>
        </div>

        {tests.length === 0 &&
          !error &&
          !pageLoading ? (
          <div className="sca-student-tests-empty">
            <h5>No tests assigned yet</h5>

            <p className="text-muted mb-0">
              When your institute publishes and
              assigns an exam, it will appear here.
            </p>
          </div>
        ) : (
          <div className="sca-student-tests-grid">
            {tests.map((t) => {
              const status = statusMeta(t);

              const scheduledStart =
                getScheduledStart(t);

              const wait = opensInMs(t);

              const score = t.result_percentage != null ? Number(t.result_percentage) : null;
              let examConfig: Record<string, unknown> = {};
              try {
                examConfig = typeof t.config === 'string'
                  ? JSON.parse(t.config) as Record<string, unknown>
                  : (t.config ?? {}) as Record<string, unknown>;
              } catch {
                examConfig = {};
              }
              const isPractice = examConfig.examType === 'practice';

              return (
                <article
                  key={t.id}
                  className="sca-student-test-card"
                >
                  <div className="sca-student-test-card__top">
                    <div className="sca-student-test-card__badges">
                      <span className={`edtp-badge ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className={`edtp-badge ${isPractice ? 'edtp-badge--role' : 'edtp-badge--active'}`}>
                        {isPractice ? 'Practice Exam' : 'Official Exam'}
                      </span>
                    </div>

                    {score != null && Number.isFinite(score) && (
                      <div
                        className="sca-student-test-card__ring"
                        style={{ ['--score' as string]: String(Math.max(0, Math.min(100, score))) }}
                      >
                        <span>{score.toFixed(1)}%</span>
                        <small>Score</small>
                      </div>
                    )}
                  </div>

                  <h5 className="sca-student-test-card__title">
                    {t.title}
                  </h5>

                  {scheduledStart && (
                    <div className="sca-student-exam-date-time">
                      <div>
                        <span>
                          Scheduled Date
                        </span>

                        <strong>
                          {new Date(
                            scheduledStart,
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            },
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Scheduled Time
                        </span>

                        <strong>
                          {new Date(
                            scheduledStart,
                          ).toLocaleTimeString(
                            'en-IN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            },
                          )}
                        </strong>
                      </div>
                    </div>
                  )}

                  {wait != null &&
                    wait > 0 && (
                      <div className="sca-student-exam-countdown-box">
                        <span>
                          Exam starts in
                        </span>

                        <strong>
                          {formatExamCountdown(
                            wait,
                          )}
                        </strong>
                      </div>
                    )}

                  {officialWindowEnded(t) && (
                    <div className="sca-student-exam-live-banner">
                      <strong className="edtp-badge edtp-badge--danger">
                        Exam Time Ended
                      </strong>
                    </div>
                  )}

                  {wait == null &&
                    scheduledStart &&
                    !officialWindowEnded(t) && (
                      <div className="sca-student-exam-live-banner">
                        <span className="sca-student-exam-live__dot" />

                        <strong>
                          Exam is Live
                        </strong>
                      </div>
                    )}

                  <ul className="sca-student-test-card__meta">
                    <li>
                      <span>Duration</span>

                      <strong>
                        {t.duration_minutes} min
                      </strong>
                    </li>

                    <li>
                      <span>Passing</span>

                      <strong>
                        {t.passing_marks ?? '—'}
                      </strong>
                    </li>

                    {t.total_marks != null && (
                      <li>
                        <span>
                          Total marks
                        </span>

                        <strong>
                          {t.total_marks}
                        </strong>
                      </li>
                    )}
                  </ul>

                  <div className="sca-student-test-card__action">
                    {renderAction(t)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
  const {
    items: attempts,
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
  } = useServerList<TestAttempt>({
    fetcher: ({ page: p, limit: l, search }) =>
      examinationService.listAttempts(p, l, search || undefined),
    defaultLimit: 10,
  });

  useDashboardLoadingEffect(loading);

  return (
    <div className="org-panel-root">
      <div className="org-page-header">
        <div className="org-page-header-left">
          <h2 className="org-page-title">{title}</h2>
          <p className="org-page-desc">
            Track and review student examination sessions, results, and proctoring status.
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Attempts</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Attempt' : 'Attempts'}
              </span>
            </div>
            <p className="org-card-subtitle">Real-time records of student tests, scores, and proctoring logs</p>
          </div>

          <div className="org-controls-row">
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search attempts by test title or status…"
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
          </div>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>TEST</th>
                <th>STATUS</th>
                <th>SCORE</th>
                <th>STARTED</th>
                {!readOnly && <th style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: 150 }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>
                      {a.test_title ?? a.test_id}
                    </strong>
                    {a.proctoring_flagged ? (
                      <span
                        className="org-status-badge"
                        style={{
                          marginLeft: 8,
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                        }}
                      >
                        Flagged
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span
                      className={`org-status-badge ${
                        a.status === 'submitted' || a.status === 'auto_submitted'
                          ? 'org-status-badge--active'
                          : a.status === 'in_progress'
                            ? 'org-status-badge--pending'
                            : 'org-status-badge--inactive'
                      }`}
                    >
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        background:
                          a.percentage != null && Number(a.percentage) >= 40
                            ? 'rgba(16, 185, 129, 0.1)'
                            : '#f1f5f9',
                        color:
                          a.percentage != null && Number(a.percentage) >= 40
                            ? '#059669'
                            : '#475569',
                      }}
                    >
                      {a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{formatDateTime(a.started_at)}</td>
                  {!readOnly && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'nowrap' }}>
                        {a.status === 'in_progress' && (
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--switch"
                            onClick={() => navigate(`/dashboard/exam/${a.test_id}/attempt/${a.id}`)}
                          >
                            <FiPlay style={{ fontSize: 13 }} /> Resume
                          </button>
                        )}
                        {(a.status === 'submitted' || a.status === 'auto_submitted') && (
                          <Link
                            to={`/dashboard/exam-result/${a.id}`}
                            className="org-action-btn org-action-btn--edit"
                          >
                            <FiEye style={{ fontSize: 13 }} /> Result
                          </Link>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {attempts.length === 0 && !loading && (
                <tr>
                  <td colSpan={readOnly ? 4 : 5} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    {!searchTerm.trim() ? 'No attempts found.' : 'No attempts match your search filter.'}
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

export function ResultsPanel() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredResults = !searchTerm.trim()
    ? results
    : results.filter(
        (r) =>
          (r.test_title && r.test_title.toLowerCase().includes(searchTerm.toLowerCase())),
      );

  return (
    <div className="org-panel-root">
      <div className="org-top-bar">
        <div>
          <h2 className="org-page-title">My Results</h2>
          <p className="org-page-desc">Review your past test scores, ranks, and percentiles.</p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">My Results</h3>
              <span className="org-count-badge">
                {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'}
              </span>
            </div>
            <p className="org-card-subtitle">Review your past test scores, ranks, and percentiles</p>
          </div>

          <div className="org-controls-row">
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search results by test name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>TEST</th>
                <th>SCORE</th>
                <th>PERCENTAGE</th>
                <th>RANK</th>
                <th>PERCENTILE</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: 100 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{r.test_title ?? r.test_id}</strong>
                  </td>
                  <td style={{ color: '#475569' }}>
                    {r.total_score}/{r.max_score}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        background: Number(r.percentage) >= 40 ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                        color: Number(r.percentage) >= 40 ? '#059669' : '#475569',
                      }}
                    >
                      {Number(r.percentage).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{r.rank != null ? `#${r.rank}` : '—'}</td>
                  <td style={{ color: '#475569' }}>{r.percentile != null ? `${Number(r.percentile).toFixed(1)}%` : '—'}</td>
                  <td style={{ color: '#475569' }}>{formatDateTime(r.created_at)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/dashboard/exam-result/${r.attempt_id}`}
                        className="org-action-btn org-action-btn--edit"
                      >
                        <FiEye style={{ fontSize: 13 }} /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    {results.length === 0 ? 'No results found.' : 'No results match your search filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  const [formStep, setFormStep] = useState(1);
  const { branches } = useOrganization();
  const withLoader = useDashboardLoader();
  useDashboardLoadingEffect(deptsLoading);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<CreateTestApiFormValues>({
    resolver: yupResolver(createTestApiSchema),
    shouldUnregister: false,
    defaultValues: {
      title: '',
      duration: '60',
      description: '',
      departmentId: '',
      subjectId: '',
      topicId: '',
      passingMarks: '40',
      examType: 'official',
      certificationEnabled: true,
      instructions: 'Read all questions carefully. Do not switch tabs during the exam.',
      shuffleQuestions: false,
      shuffleOptions: false,
      negativeMarking: false,
      fullScreen: true,
      allowResume: true,
      releaseAnswers: false,
      maxTabSwitches: '5',
      maxAttempts: '1',
      scoringPolicy: 'latest',
      maxFullscreenExits: '3',
      maxCopyPasteAttempts: '3',
    },
  });

  const departmentId = watch('departmentId');
  const subjectId = watch('subjectId');
  const examType = watch('examType');
  const { user } = useAuth();
  const draftStorageKey = user?.id ? `edumatra:create-test-draft:${user.id}` : null;
  const [draftReady, setDraftReady] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const preserveSubjectForDept = useRef<string | null>(null);
  const preserveTopicForSubject = useRef<string | null>(null);
  const pauseDraftSave = useRef(false);

  useEffect(() => {
    if (!draftStorageKey) return;
    pauseDraftSave.current = true;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<CreateTestApiFormValues>;
        if (typeof draft.departmentId === 'string' && draft.departmentId) {
          preserveSubjectForDept.current = draft.departmentId;
        }
        if (typeof draft.subjectId === 'string' && draft.subjectId) {
          preserveTopicForSubject.current = draft.subjectId;
        }
        reset({
          title: '',
          duration: '60',
          description: '',
          departmentId: '',
          subjectId: '',
          topicId: '',
          passingMarks: '40',
          examType: 'official',
          certificationEnabled: true,
          instructions: 'Read all questions carefully. Do not switch tabs during the exam.',
          shuffleQuestions: false,
          shuffleOptions: false,
          negativeMarking: false,
          fullScreen: true,
          allowResume: true,
          releaseAnswers: false,
          maxTabSwitches: '5',
          maxAttempts: '1',
          scoringPolicy: 'latest',
          maxFullscreenExits: '3',
          maxCopyPasteAttempts: '3',
          ...draft,
        });
        setDraftNote('Draft saved');
      }
    } catch {
      /* ignore corrupt draft */
    }
    pauseDraftSave.current = false;
    setDraftReady(true);
  }, [draftStorageKey, reset]);

  useEffect(() => {
    if (!draftReady || !draftStorageKey) return;
    let timer: number | undefined;
    const subscription = watch((values) => {
      if (pauseDraftSave.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        try {
          localStorage.setItem(draftStorageKey, JSON.stringify(values));
          setDraftNote('Draft saved');
        } catch {
          /* ignore quota errors */
        }
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [draftReady, draftStorageKey, watch]);

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
    if (!draftReady) return;
    const preserveSubject =
      preserveSubjectForDept.current != null &&
      preserveSubjectForDept.current === departmentId;
    if (preserveSubject) {
      preserveSubjectForDept.current = null;
    } else {
      setValue('subjectId', '');
      setValue('topicId', '');
      setSubjects([]);
      setTopics([]);
    }
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
  }, [departmentId, setValue, draftReady]);

  useEffect(() => {
    if (!draftReady) return;
    const preserveTopic =
      preserveTopicForSubject.current != null &&
      preserveTopicForSubject.current === subjectId;
    if (preserveTopic) {
      preserveTopicForSubject.current = null;
    } else {
      setValue('topicId', '');
      setTopics([]);
    }
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
  }, [subjectId, setValue, draftReady]);

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
            examType: values.examType,
            certificationEnabled: values.examType === 'official' && Boolean(values.certificationEnabled),
            shuffleQuestions: Boolean(values.shuffleQuestions),
            shuffleOptions: Boolean(values.shuffleOptions),
            negativeMarking: Boolean(values.negativeMarking),
            fullScreen: Boolean(values.fullScreen),
            allowResume: Boolean(values.allowResume),
            releaseAnswers: Boolean(values.releaseAnswers),
            maxTabSwitches: Number(values.maxTabSwitches) || 5,
            maxAttempts:
              values.examType === 'official'
                ? 1
                : Math.min(10, Math.max(1, Number(values.maxAttempts) || 1)),
            scoringPolicy: values.scoringPolicy === 'highest' ? 'highest' : 'latest',
            maxFullscreenExits: Math.max(0, Number(values.maxFullscreenExits) || 0),
            maxCopyPasteAttempts: Math.max(0, Number(values.maxCopyPasteAttempts) || 0),
            browserLock: true,
            blockCopyPaste: true,
            autoSubmit: true,
          },
        });
        pauseDraftSave.current = true;
        if (draftStorageKey) localStorage.removeItem(draftStorageKey);
        reset();
        navigate(`/dashboard/test-builder/${test.id}`);
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  const goNext = async () => {
    const fields: (keyof CreateTestApiFormValues)[] =
      formStep === 1
        ? ['departmentId', 'subjectId', 'topicId', 'title']
        : ['duration', 'passingMarks', 'maxAttempts'];
    const ok = await trigger(fields);
    if (ok) setFormStep((step) => Math.min(3, step + 1));
  };

  return (
    <>
      <div className="org-panel-root">
        <div className="org-top-bar">
          <div>
            <h2 className="org-page-title">Create Test</h2>
            <p className="org-page-desc">
              Step 2: Fill Details, then Scoring, then Rules. Your typing is kept in this browser until you save.
            </p>
          </div>
          <Link
            to={getTestsListPath(user?.roles ?? [])}
            className="org-btn-outline-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <FiList /> Edit saved tests
          </Link>
        </div>

        {apiError && <div className="org-error-banner" style={{ marginBottom: 16 }}>{apiError}</div>}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 10,
              color: '#059669',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ width: '100%' }}>
          <ExamStepper
            activeStep={formStep}
            onStep={(step) => setFormStep(step)}
            steps={[
              { step: 1, title: 'Details', desc: 'Subject and title' },
              { step: 2, title: 'Scoring', desc: 'Time and marks' },
              { step: 3, title: 'Rules', desc: 'Security settings' },
            ]}
          />

          <div className="org-table-card" style={{ padding: '24px 28px', marginTop: 16 }}>
          <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              {formStep === 1 ? '1. Exam details' : formStep === 2 ? '2. Time and scoring' : '3. Rules and security'}
            </h4>
            {draftNote ? <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>{draftNote}</p> : null}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              {formStep === 1 && (
                <>
                  <div className="col-md-4">
                    <label className="org-form-label" htmlFor="departmentId">Department</label>
                    <EdtpSelect
                      id="departmentId"
                      className="org-form-select"
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
                    <label className="org-form-label" htmlFor="subjectId">Subject</label>
                    <EdtpSelect
                      id="subjectId"
                      className="org-form-select"
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
                    <label className="org-form-label" htmlFor="topicId">Topic</label>
                    <EdtpSelect
                      id="topicId"
                      className="org-form-select"
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
                    <label className="org-form-label" htmlFor="examTitle">Exam Title</label>
                    <input
                      id="examTitle"
                      className={inputClassName('org-form-input', !!errors.title)}
                      placeholder="e.g. Midterm Examination 2026"
                      {...register('title')}
                    />
                    <FormError message={errors.title?.message} />
                  </div>
                  <div className="col-12">
                    <label className="org-form-label" htmlFor="aboutExam">Description (optional)</label>
                    <textarea
                      id="aboutExam"
                      rows={3}
                      className={inputClassName('org-form-input', !!errors.description)}
                      placeholder="Write brief description or instructions about this examination..."
                      {...register('description')}
                    />
                  </div>
                </>
              )}
              {formStep === 2 && (
                <>
                  <div className="col-md-6">
                    <label className="org-form-label" htmlFor="duration">Duration (minutes)</label>
                    <input
                      id="duration"
                      type="number"
                      min={1}
                      step={1}
                      className={inputClassName('org-form-input', !!errors.duration)}
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
                    <label className="org-form-label" htmlFor="passingMarks">Passing marks</label>
                    <input
                      id="passingMarks"
                      type="number"
                      min={0}
                      step={1}
                      className={inputClassName('org-form-input', !!errors.passingMarks)}
                      {...register('passingMarks')}
                    />
                    <FormError message={errors.passingMarks?.message} />
                  </div>
                  <div className="col-md-6">
                    <label className="org-form-label" htmlFor="examType">Exam Type</label>
                    <select
                      id="examType"
                      className="org-form-select"
                      {...register('examType', {
                        onChange: (e) => {
                          const type = e.target.value as 'official' | 'practice';
                          if (type === 'official') {
                            setValue('maxAttempts', '1');
                            setValue('certificationEnabled', true);
                          } else {
                            setValue('certificationEnabled', false);
                          }
                        },
                      })}
                    >
                      <option value="official">Official Exam</option>
                      <option value="practice">Practice Exam</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="org-form-label">Certificate Generation</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          disabled={examType === 'practice'}
                          {...register('certificationEnabled')}
                          style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                        />
                        Enable Certificate Generation
                      </label>
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {examType === 'practice'
                        ? 'Certificates are disabled for practice exams.'
                        : 'Certificates can be issued for eligible students when enabled.'}
                    </small>
                  </div>
                  <div className="col-12">
                    <label className="org-form-label" htmlFor="instructions">Exam instructions</label>
                    <textarea
                      id="instructions"
                      rows={3}
                      className={inputClassName('org-form-input', !!errors.instructions)}
                      placeholder="Instructions displayed to candidates before they start..."
                      {...register('instructions')}
                    />
                    <FormError message={errors.instructions?.message} />
                  </div>
                </>
              )}
              {formStep === 3 && (
                <div className="col-12">
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Security &amp; Proctoring Rules</h5>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('shuffleQuestions')} style={{ accentColor: '#2563eb' }} /> Shuffle questions
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('shuffleOptions')} style={{ accentColor: '#2563eb' }} /> Shuffle options
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('negativeMarking')} style={{ accentColor: '#2563eb' }} /> Negative marking
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('fullScreen')} style={{ accentColor: '#2563eb' }} /> Fullscreen required
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('allowResume')} style={{ accentColor: '#2563eb' }} /> Allow resume
                      </label>
                    </div>
                    <div className="col-md-4">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                        <input type="checkbox" {...register('releaseAnswers')} style={{ accentColor: '#2563eb' }} /> Release answer key
                      </label>
                    </div>

                    <div className="col-md-4" style={{ marginTop: 12 }}>
                      <label className="org-form-label" htmlFor="maxTabSwitches">Max tab switches</label>
                      <input
                        id="maxTabSwitches"
                        type="number"
                        min={0}
                        className={inputClassName('org-form-input', !!errors.maxTabSwitches)}
                        {...register('maxTabSwitches')}
                      />
                      <FormError message={errors.maxTabSwitches?.message} />
                    </div>
                    <div className="col-md-4" style={{ marginTop: 12 }}>
                      <label className="org-form-label" htmlFor="maxAttempts">Max attempts</label>
                      {examType === 'official' ? (
                        <>
                          <input id="maxAttempts" type="number" className="org-form-input" value={1} disabled />
                          <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Official exams allow 1 attempt only.</small>
                        </>
                      ) : (
                        <select id="maxAttempts" className="org-form-select" {...register('maxAttempts')}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                            <option key={count} value={String(count)}>{count} {count === 1 ? 'Attempt' : 'Attempts'}</option>
                          ))}
                        </select>
                      )}
                      <FormError message={errors.maxAttempts?.message} />
                    </div>
                    <div className="col-md-4" style={{ marginTop: 12 }}>
                      <label className="org-form-label" htmlFor="scoringPolicy">Scoring policy</label>
                      <select id="scoringPolicy" className="org-form-select" {...register('scoringPolicy')}>
                        <option value="latest">Latest attempt</option>
                        <option value="highest">Highest score</option>
                      </select>
                    </div>
                    <div className="col-md-6" style={{ marginTop: 8 }}>
                      <label className="org-form-label" htmlFor="maxFullscreenExits">Flag: fullscreen exits</label>
                      <input
                        id="maxFullscreenExits"
                        type="number"
                        min={0}
                        className={inputClassName('org-form-input', !!errors.maxFullscreenExits)}
                        {...register('maxFullscreenExits')}
                      />
                    </div>
                    <div className="col-md-6" style={{ marginTop: 8 }}>
                      <label className="org-form-label" htmlFor="maxCopyPasteAttempts">Flag: copy/paste</label>
                      <input
                        id="maxCopyPasteAttempts"
                        type="number"
                        min={0}
                        className={inputClassName('org-form-input', !!errors.maxCopyPasteAttempts)}
                        {...register('maxCopyPasteAttempts')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Centered navigation buttons with identical dimensions */}
              <div
                className="col-12"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormStep((step) => step - 1)}
                    style={{
                      width: 170,
                      height: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: '#f8fafc',
                      color: '#334155',
                      border: '1.5px solid #cbd5e1',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    Back
                  </button>
                )}
                {formStep < 3 ? (
                  <button
                    type="button"
                    className="org-add-btn"
                    onClick={() => void goNext()}
                    style={{
                      width: 170,
                      height: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  >
                    Next <FiArrowRight style={{ marginLeft: 6 }} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="org-add-btn"
                    style={{
                      width: 190,
                      height: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  >
                    <FiCheckCircle style={{ marginRight: 6 }} /> Save &amp; Build Test
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
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
  const navigate = useNavigate();
  const handleReattempt = async () => {
    if (!result?.test_id) return;

    try {
      setError('');

      const attempt = await examinationService.startAttempt(
        result.test_id,
      );

      navigate(
        `/dashboard/exam/${result.test_id}/attempt/${attempt.id}`,
      );
    } catch (err) {
      const msg = parseApiError(err);
      setError(msg);
      showError('Cannot start', msg);
    }
  };
  const { user } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [certBusy, setCertBusy] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [existingCert, setExistingCert] = useState<Awaited<
    ReturnType<typeof examinationService.listMyCertificates>
  >[number] | null>(null);
  const [certLookupDone, setCertLookupDone] = useState(false);
  const [history, setHistory] = useState<Awaited<
    ReturnType<typeof examinationService.listAttemptHistory>
  > | null>(null);
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
    setCertLookupDone(false);
    setExistingCert(null);
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
        } finally {
          setCertLookupDone(true);
        }
        try {

          const hist = await examinationService.listAttemptHistory(
            res.test_id,
            canIssueAsStaff ? res.student_id : undefined,
          );
          console.log('Attempt history response:', hist);
          setHistory(hist);
        } catch (err) {
          console.error('Attempt history error:', err);
          setHistory(null);
        }



      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [attemptId, isStudent, canIssueAsStaff]);

  useEffect(() => {
    if (!certLookupDone || !isStudent || !result || existingCert) return;
    let cfg: Record<string, unknown> = {};
    const raw = (result as ExamResult & { config?: unknown; certification_enabled?: boolean }).config;
    try {
      cfg = typeof raw === 'string'
        ? JSON.parse(raw) as Record<string, unknown>
        : (raw ?? {}) as Record<string, unknown>;
    } catch {
      cfg = {};
    }
    const practice =
      result.exam_type === 'practice' ||
      cfg.examType === 'practice' ||
      cfg.exam_type === 'practice';
    const certDisabled =
      (result as ExamResult & { certification_enabled?: boolean }).certification_enabled === false ||
      cfg.certificationEnabled === false;
    if (practice || certDisabled) return;
    const passed =
      result.passing_marks != null && Number(result.passing_marks) > 0
        ? Number(result.total_score) >= Number(result.passing_marks)
        : Number(result.percentage) >= 40;
    if (!passed || !result.id) return;
    let cancelled = false;
    setCertBusy(true);
    void examinationService
      .issueCertificate(result.id)
      .then((cert) => {
        if (!cancelled) setExistingCert(cert);
      })
      .catch((err) => {
        if (!cancelled) showError('Certificate', parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setCertBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [certLookupDone, isStudent, result, existingCert]);

  useDashboardLoadingEffect(loading);
  const handlePreviewCertificate = () => {
    if (!result) return;
    setShowCertificatePreview(true);
  };


  const handleIssueCertificate = async (template: CertificateTemplate) => {
    if (!result?.id) return;

    setCertBusy(true);

    await withLoader(async () => {
      try {
        const cert = await examinationService.issueCertificate(result.id);
        setExistingCert(cert);
        setShowCertificatePreview(false);

        showSuccess('Certificate issued', cert.certificate_no);

        const { downloadCertificateReactPdf } = await import('@/pdf/downloadCertificate');
        await downloadCertificateReactPdf(cert, template);
      } catch (err) {
        showError('Certificate', parseApiError(err));
      } finally {
        setCertBusy(false);
      }
    });
  };



  const handlePreviewExistingCertificate = () => {
    if (!existingCert) return;
    setShowCertificatePreview(true);
  };

  if (error) return <p className="login__error">{error}</p>;
  if (!result) return null;

  const studentName = [result.first_name, result.last_name].filter(Boolean).join(' ');
  const questions = result.questions ?? [];
  const passing = result.passing_marks != null && Number(result.passing_marks) > 0
    ? Number(result.total_score) >= Number(result.passing_marks)
    : Number(result.percentage) >= 40;
  const showAnswerKey = Boolean(result.answers_released) || canIssueAsStaff;
  const flagged = Boolean(result.proctoring_flagged || result.proctoring_summary?.flagged);

  const renderCertCta = () => {
    const buttons: ReactNode[] = [];
    const resultMeta = result as ExamResult & {
      exam_type?: 'official' | 'practice';
      certification_enabled?: boolean;
      config?: unknown;
    };
    let resultConfig: Record<string, unknown> = {};
    try {
      resultConfig = typeof resultMeta.config === 'string'
        ? JSON.parse(resultMeta.config) as Record<string, unknown>
        : (resultMeta.config ?? {}) as Record<string, unknown>;
    } catch {
      resultConfig = {};
    }
    if (
      resultMeta.exam_type === 'practice' ||
      resultConfig.examType === 'practice' ||
      resultMeta.certification_enabled === false ||
      resultConfig.certificationEnabled === false
    ) {
      return buttons;
    }
    if (isStudent) {
      if (existingCert) {
        buttons.push(
          <Link
            key="issued"
            to="/dashboard/student-certificates"
            className="org-action-btn org-action-btn--switch"
            style={{ height: 36, padding: '0 14px' }}
          >
            <FiAward />
            <span>Certificate issued · {existingCert.certificate_no}</span>
          </Link>,
        );
      } else if (passing && certBusy) {
        buttons.push(
          <span key="issuing" className="text-muted" style={{ fontSize: '0.875rem' }}>
            Issuing certificate…
          </span>,
        );
      }
      return buttons;
    }
    if (passing && !existingCert) {
      buttons.push(
        <button
          key="preview"
          type="button"
          className="org-action-btn org-action-btn--switch"
          style={{ height: 36, padding: '0 14px' }}
          disabled={certBusy}
          onClick={() => void handlePreviewCertificate()}
        >
          <FiEye />
          <span>Preview certificate</span>
        </button>,
      );
    }
    if (existingCert) {
      buttons.push(
        <button
          key="dl"
          type="button"
          className="org-add-btn"
          style={{ height: 36, padding: '0 16px' }}
          disabled={certBusy}
          onClick={handlePreviewExistingCertificate}
        >
          <FiAward />
          <span>Choose template & download</span>
        </button>,
      );
    } else if (passing && canIssueAsStaff) {
      buttons.push(
        <button
          key="issue"
          type="button"
          className="org-add-btn"
          style={{ height: 36, padding: '0 16px' }}
          disabled={certBusy}
          onClick={handlePreviewCertificate}
        >
          <FiAward />
          <span>{certBusy ? 'Issuing…' : 'Issue certificate'}</span>
        </button>,
      );
    }
    return buttons;
  };

  return (
    <div className="org-panel-page">
      <div className="org-page-header">
        <div className="org-page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="org-page-title">Result — {result.test_title}</h2>
            {flagged ? (
              <span className="org-status-badge org-status-badge--inactive">
                Flagged
              </span>
            ) : (
              <span className="org-status-badge org-status-badge--active">
                Completed
              </span>
            )}
          </div>
          {studentName && (
            <p className="org-page-desc" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiUser style={{ fontSize: 14 }} /> Student: <strong style={{ color: '#0f172a' }}>{studentName}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to={backHref}
            className="org-btn-secondary"
            style={{ height: 36, padding: '0 16px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <FiArrowLeft /> Back to Results
          </Link>
          {renderCertCta()}
        </div>
      </div>

      {isStudent ? <PracticeInsights /> : null}

      {/* Attempts / Policy info bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {history && history.attempts.length > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569', margin: 0 }} htmlFor="attemptHistory">
                Attempt:
              </label>
              <select
                id="attemptHistory"
                className="org-form-select"
                style={{ width: 'auto', minWidth: 200, height: 34, padding: '4px 10px', fontSize: '0.825rem' }}
                value={attemptId}
                onChange={(e) => navigate(`/dashboard/exam-result/${e.target.value}`)}
              >
                {history.attempts.map((a) => (
                  <option key={a.attempt_id} value={a.attempt_id}>
                    #{a.attempt_number}
                    {a.is_official ? ' (official)' : ''}
                    {' · '}
                    {a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : a.status}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {history && (
            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Attempt progress: <strong>{history.completed_attempts} completed</strong> · {history.attempts_remaining} remaining · Policy: {history.scoring_policy} · max {history.max_attempts}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {(() => {
            const isPractice = result.exam_type === 'practice';
            const attemptsLeft = Math.max(0, Number(history?.attempts_remaining ?? 0));
            const maxAttempts = Number(history?.max_attempts ?? 0);

            if (!isPractice || !history) {
              return null;
            }

            return (
              <>
                <span className="org-count-badge" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  Attempts left: {attemptsLeft} of {maxAttempts}
                </span>

                {attemptsLeft > 0 && (
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ height: 34, padding: '0 14px' }}
                    onClick={() => void handleReattempt()}
                  >
                    <FiPlay />
                    <span>Retest</span>
                  </button>
                )}
              </>
            );
          })()}

          <Link
            to="/verify-certificate"
            className="org-btn-outline-primary"
            style={{ height: 34, padding: '0 12px', fontSize: '0.8rem' }}
          >
            <FiCheckCircle />
            <span>Verify certificate</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="org-stat-card">
          <span className="org-stat-label">Total Score</span>
          <strong className="org-stat-value" style={{ color: '#2563eb' }}>
            {result.total_score} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>/ {result.max_score}</span>
          </strong>
          <span className="org-stat-hint">Marks scored in this attempt</span>
        </div>

        <div className="org-stat-card">
          <span className="org-stat-label">Percentage</span>
          <strong className="org-stat-value" style={{ color: passing ? '#16a34a' : '#dc2626' }}>
            {Number(result.percentage).toFixed(1)}%
          </strong>
          <span className="org-stat-hint">{passing ? 'Passing criteria met' : 'Below passing score'}</span>
        </div>

        <div className="org-stat-card">
          <span className="org-stat-label">Rank</span>
          <strong className="org-stat-value" style={{ color: '#0f172a' }}>
            {result.rank != null ? `#${result.rank}` : '—'}
          </strong>
          <span className="org-stat-hint">Position in overall exam cohort</span>
        </div>

        <div className="org-stat-card">
          <span className="org-stat-label">Percentile</span>
          <strong className="org-stat-value" style={{ color: '#7c3aed' }}>
            {result.percentile != null ? `${Number(result.percentile).toFixed(1)}%` : '—'}
          </strong>
          <span className="org-stat-hint">Percentile score ranking</span>
        </div>
      </div>

      {/* Proctoring Timeline Card */}
      {canIssueAsStaff && result.proctoring_timeline ? (
        <div className="org-table-card">
          <div className="org-card-header">
            <div className="org-title-group">
              <div className="org-title-row">
                <h3 className="org-card-title">Proctoring Timeline</h3>
                {flagged ? (
                  <span className="org-status-badge org-status-badge--inactive">
                    Flagged
                  </span>
                ) : (
                  <span className="org-count-badge">
                    {result.proctoring_timeline.length} Events
                  </span>
                )}
              </div>
              <p className="org-card-subtitle">
                Monitored activity, integrity events, and tab switches during the test session
              </p>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {result.proctoring_summary?.flag_reasons?.length ? (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <strong style={{ color: '#dc2626', fontSize: '0.85rem' }}>Flag Reasons:</strong>
                <ul style={{ margin: '6px 0 0 16px', color: '#991b1b', fontSize: '0.825rem' }}>
                  {result.proctoring_summary.flag_reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.proctoring_timeline.length === 0 ? (
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
                No proctoring events recorded. Session completed cleanly.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.proctoring_timeline.map((ev, i) => {
                  const isFlaggedEvent =
                    ev.event.includes('exit') || ev.event.includes('switch') || ev.event.includes('blur');
                  return (
                    <div
                      key={`${ev.at}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.825rem',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: isFlaggedEvent ? '#dc2626' : '#2563eb',
                            background: isFlaggedEvent ? '#fee2e2' : '#dbeafe',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {ev.event}
                        </span>
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {formatDateTime(ev.at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Question-wise Analysis Card */}
      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Question-wise Analysis</h3>
              <span className="org-count-badge">
                {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Detailed breakdown of student answers, marks awarded, and correct solutions
            </p>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!showAnswerKey && isStudent ? (
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
              Answer key is hidden until the instructor releases it.
            </p>
          ) : null}

          {questions.length === 0 ? (
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>
              No per-question details available for this attempt.
            </p>
          ) : (
            questions.map((q, index) => {
              const selectedIds = new Set(q.answer?.selectedOptionIds ?? []);
              const opts = q.options ?? [];
              const hasOptions = opts.length > 0;
              return (
                <div
                  key={q.question_id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#152559',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        Q{index + 1}
                      </span>
                      <strong style={{ fontSize: '0.925rem', color: '#0f172a' }}>
                        {questionText(q.content)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {showAnswerKey && q.is_correct != null ? (
                        <span
                          className={`org-status-badge ${
                            q.is_correct ? 'org-status-badge--active' : 'org-status-badge--inactive'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {q.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      ) : null}
                      <span className="org-count-badge" style={{ fontSize: '0.72rem' }}>
                        Marks: {Number(q.marks_awarded ?? 0)} / {Number(q.marks)}
                      </span>
                    </div>
                  </div>

                  {showAnswerKey && hasOptions ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {opts.map((o) => {
                        const selected = selectedIds.has(o.id);
                        const correct = Boolean(o.is_correct);
                        let bg = '#ffffff';
                        let borderColor = '#e2e8f0';
                        let color = '#334155';

                        if (correct) {
                          bg = '#ecfdf5';
                          borderColor = '#a7f3d0';
                          color = '#065f46';
                        } else if (selected) {
                          bg = '#fef2f2';
                          borderColor = '#fecaca';
                          color = '#991b1b';
                        }

                        return (
                          <div
                            key={o.id}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 8,
                              border: `1px solid ${borderColor}`,
                              background: bg,
                              color: color,
                              fontSize: '0.85rem',
                              fontWeight: correct || selected ? 600 : 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{getOptionText(o.content)}</span>
                            <span>
                              {correct ? ' ✓ Correct' : ''}
                              {selected && !correct ? ' (your answer)' : ''}
                              {selected && correct ? ' (your answer)' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {showAnswerKey ? (
                        <div>
                          <strong style={{ color: '#059669' }}>Correct answer:</strong> {formatCorrectAnswer(q)}
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
      </div>

      <div>
        <Link
          to={backHref}
          className="org-btn-secondary"
          style={{ height: 40, padding: '0 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <FiArrowLeft />
          <span>Back to Results</span>
        </Link>
      </div>

      <CertificatePreviewModal
        open={showCertificatePreview}
        studentName={studentName || 'Student'}
        examTitle={result.test_title || 'Examination'}
        percentage={Number(result.percentage ?? 0)}
        onClose={() => setShowCertificatePreview(false)}
        onConfirm={(template) => {
          if (existingCert) {
            setCertBusy(true);
            void withLoader(async () => {
              try {
                const { downloadCertificateReactPdf } = await import('@/pdf/downloadCertificate');
                await downloadCertificateReactPdf(existingCert, template);
                setShowCertificatePreview(false);
              } catch (err) {
                showError('Certificate', parseApiError(err));
              } finally {
                setCertBusy(false);
              }
            });
          } else {
            void handleIssueCertificate(template);
          }
        }}
        busy={certBusy}
      />
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: '100%' }}>
      {apiError && (
        <div className="mad-alert-error" role="alert" style={{ marginBottom: '16px' }}>
          <span>{apiError}</span>
        </div>
      )}
      {message && (
        <div className="mad-alert-success" role="alert" style={{ marginBottom: '16px' }}>
          <span>{message}</span>
        </div>
      )}
      <div className="org-grid-2" style={{ gap: '16px' }}>
        <div className="org-form-field">
          <label className="org-form-label" htmlFor="firstName">
            First Name <span className="org-required-star">*</span>
          </label>
          <input
            id="firstName"
            className="org-form-input"
            placeholder="First name"
            {...register('firstName')}
          />
          <FormError message={errors.firstName?.message} />
        </div>

        <div className="org-form-field">
          <label className="org-form-label" htmlFor="lastName">
            Last Name <span className="org-required-star">*</span>
          </label>
          <input
            id="lastName"
            className="org-form-input"
            placeholder="Last name"
            {...register('lastName')}
          />
          <FormError message={errors.lastName?.message} />
        </div>

        <div className="org-form-field">
          <label className="org-form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            disabled
            className="org-form-input"
            style={{ background: 'var(--db-bg, #f1f5f9)', color: '#64748b' }}
            {...register('email')}
          />
          <span className="org-form-hint">Email address is managed by platform administrator.</span>
        </div>

        <div className="org-form-field">
          <label className="org-form-label" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            className="org-form-input"
            placeholder="e.g. +91 9876543210"
            {...register('phone')}
          />
          <FormError message={errors.phone?.message} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', width: '100%' }}>
        <button
          type="submit"
          className="org-add-btn"
          style={{ padding: '9px 36px', fontSize: '0.875rem', borderRadius: '10px' }}
        >
          Update Profile
        </button>
      </div>
    </form>
  );
}
