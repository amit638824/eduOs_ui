import { useEffect, useRef, useState, useMemo, type ReactNode } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import type { QuestionImportSummary } from '@/services/examination.service';
import type { Department } from '@/services/platform.service';
import { parseApiError } from '@/lib/errors';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { createTestApiSchema, type CreateTestApiFormValues } from '@/validators/schemas';
import type { ExamResult, ExamTest, Question, TestAttempt } from '@/types/examination';
import { useAuth } from '@/context/AuthContext';
import { getTestsListPath, getDefaultDashboardPath } from '@/utils/dashboardRole';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { profileSettingsSchema, type ProfileSettingsFormValues } from '@/validators/schemas';
import ExamAttemptPlayer from './ExamAttemptPlayer';
import AdminExamGuide, { ExamStepper } from '@/components/dashboard/AdminExamGuide';
import { FieldHint } from '@/components/ui/FieldHint';
import { EdtpBtn, EdtpSelect } from '@/components/ui/CrudUI';
import { confirmAction, confirmDelete, showError, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import { normalizePositiveIntInput, parsePositiveIntInput } from '@/utils/positiveIntInput';
import { getOptionText, getQuestionText } from '@/utils/questionContent';
import { QuestionPreviewModal } from '@/components/dashboard/QuestionPreviewModal';
import { BulkImportCsvModal } from './BulkImportCsvModal';
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
  FiInfo,
  FiArrowRight,
  FiRefreshCw,
  FiCheckCircle,
  FiList,
  FiPlay,
  FiAward,
  FiUser,
  FiArrowLeft,
  FiCheck,
  FiFileText,
  FiTrendingUp,
  FiTarget,
  FiClock,
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
      examinationService.listQuestions(p, l, undefined, search || undefined, { skipToast: true }),
    defaultLimit: 50,
  });

  // Master data for filters & drawer
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  // 4 Filter states
  const [branchFilter, setBranchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [subjFilter, setSubjFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  // Dropdown options for filters
  const [filterSubjects, setFilterSubjects] = useState<{ id: string; name: string }[]>([]);
  const [filterTopics, setFilterTopics] = useState<{ id: string; name: string }[]>([]);
  const [filterSubjectsLoading, setFilterSubjectsLoading] = useState(false);
  const [filterTopicsLoading, setFilterTopicsLoading] = useState(false);

  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  const [justAddedMsg, setJustAddedMsg] = useState<string | null>(null);
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
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const withLoader = useDashboardLoader();

  const openAddDrawer = () => {
    resetQuestionFields();
    setDepartmentId('');
    setSubjectId('');
    setTopicId('');
    setSubjects([]);
    setTopics([]);
    setError('');
    setMessage('');
    setJustAddedMsg(null);
    setAddedCount(0);
    setIsDrawerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setJustAddedMsg(null);
    setAddedCount(0);
    setDepartmentId('');
    setSubjectId('');
    setTopicId('');
    setSubjects([]);
    setTopics([]);
    resetQuestionFields();
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
    const marks = parseMarksInput(marksInput);
    if (marks != null && marks >= 1) {
      saveQbPrefs({ marksPerQuestion: marks });
    }
  }, [marksInput]);

  useEffect(() => {
    saveQbPrefs({ optionCount });
  }, [optionCount]);

  // Load all departments across all branches for multi-campus support
  useEffect(() => {
    if (!branches || branches.length === 0) {
      setAllDepartments([]);
      setDepartments([]);
      return;
    }
    let active = true;
    setDeptsLoading(true);
    Promise.all(
      branches.map((b) =>
        platformService
          .listDepartments(b.id, 1, 100)
          .then((r) =>
            ((r.data || []) as Department[]).map((d) => ({
              ...d,
              branch_id: (d as any).branch_id || (d as any).branchId || b.id,
            })),
          )
          .catch(() => []),
      ),
    )
      .then((lists) => {
        if (!active) return;
        const flat = lists.flat();
        setAllDepartments(flat);
        const mapped = flat.map((d) => ({ id: d.id, name: d.name }));
        setDepartments(mapped);
        setDepartmentId((current) => {
          if (current && mapped.some((d) => d.id === current)) return current;
          return '';
        });
      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => {
        if (active) setDeptsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [branches, hierarchyTick]);

  // Load subjects when deptFilter changes
  useEffect(() => {
    if (!deptFilter) {
      setFilterSubjects([]);
      setFilterSubjectsLoading(false);
      return;
    }
    let cancelled = false;
    setFilterSubjectsLoading(true);
    examinationService
      .listSubjects(1, 100, deptFilter)
      .then((r) => {
        if (cancelled) return;
        setFilterSubjects(r.data.map((s) => ({ id: s.id, name: s.name })));
      })
      .catch(() => {
        if (!cancelled) setFilterSubjects([]);
      })
      .finally(() => {
        if (!cancelled) setFilterSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deptFilter, hierarchyTick]);

  // Load topics when subjFilter changes
  useEffect(() => {
    if (!subjFilter) {
      setFilterTopics([]);
      setFilterTopicsLoading(false);
      return;
    }
    let cancelled = false;
    setFilterTopicsLoading(true);
    examinationService
      .listTopicsForSubject(subjFilter)
      .then((list) => {
        if (cancelled) return;
        setFilterTopics(list.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch(() => {
        if (!cancelled) setFilterTopics([]);
      })
      .finally(() => {
        if (!cancelled) setFilterTopicsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjFilter, hierarchyTick]);

  const handleBranchFilterChange = (bId: string) => {
    setBranchFilter(bId);
    if (bId && deptFilter) {
      const match = allDepartments.find((d) => d.id === deptFilter && d.branch_id === bId);
      if (!match) {
        setDeptFilter('');
        setSubjFilter('');
        setTopicFilter('');
      }
    }
  };

  const handleDeptFilterChange = (dId: string) => {
    setDeptFilter(dId);
    setSubjFilter('');
    setTopicFilter('');
    if (dId && !branchFilter) {
      const match = allDepartments.find((d) => d.id === dId);
      if (match?.branch_id) {
        setBranchFilter(match.branch_id);
      }
    }
  };

  const handleSubjFilterChange = (sId: string) => {
    setSubjFilter(sId);
    setTopicFilter('');
  };

  const resetFilters = () => {
    setBranchFilter('');
    setDeptFilter('');
    setSubjFilter('');
    setTopicFilter('');
    setQuestionSearch('');
  };

  const hasActiveFilters = Boolean(
    branchFilter || deptFilter || subjFilter || topicFilter || questionSearch,
  );

  const availableFilterDepts = useMemo(() => {
    if (!branchFilter) {
      const seen = new Set<string>();
      return allDepartments.filter((d) => {
        const key = d.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return allDepartments.filter((d) => d.branch_id === branchFilter);
  }, [allDepartments, branchFilter]);

  // Cascading filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (branchFilter) {
        const qDeptId = q.department_id;
        const qDeptName = (q.department_name || '').toLowerCase().trim();
        const dept = allDepartments.find(
          (d) =>
            (qDeptId && d.id === qDeptId) ||
            (qDeptName && d.name.toLowerCase().trim() === qDeptName),
        );
        if (!dept || dept.branch_id !== branchFilter) {
          return false;
        }
      }

      if (deptFilter) {
        const qDeptId = q.department_id;
        const qDeptName = (q.department_name || '').toLowerCase().trim();
        const selectedDept = allDepartments.find((d) => d.id === deptFilter);
        const selectedDeptName = (selectedDept?.name || '').toLowerCase().trim();

        const matchId = qDeptId && qDeptId === deptFilter;
        const matchName =
          selectedDeptName &&
          qDeptName &&
          (qDeptName === selectedDeptName ||
            qDeptName.replace(/s$/, '') === selectedDeptName.replace(/s$/, ''));
        if (!matchId && !matchName) return false;
      }

      if (subjFilter) {
        const qSubjId = q.subject_id;
        const qSubjName = (q.subject_name || '').toLowerCase().trim();
        const selectedSubj = filterSubjects.find((s) => s.id === subjFilter);
        const selectedSubjName = (selectedSubj?.name || '').toLowerCase().trim();

        const matchId = qSubjId && qSubjId === subjFilter;
        const matchName = selectedSubjName && qSubjName && qSubjName === selectedSubjName;
        if (!matchId && !matchName) return false;
      }

      if (topicFilter) {
        const qTopicId = q.topic_id;
        const qTopicName = (q.topic_name || '').toLowerCase().trim();
        const selectedTopic = filterTopics.find((t) => t.id === topicFilter);
        const selectedTopicName = (selectedTopic?.name || '').toLowerCase().trim();

        const matchId = qTopicId && qTopicId === topicFilter;
        const matchName = selectedTopicName && qTopicName && qTopicName === selectedTopicName;
        if (!matchId && !matchName) return false;
      }

      if (questionSearch.trim()) {
        const term = questionSearch.toLowerCase().trim();
        const text = getQuestionText(q.content).toLowerCase();
        const dept = (q.department_name || '').toLowerCase();
        const subj = (q.subject_name || '').toLowerCase();
        const topic = (q.topic_name || '').toLowerCase();
        if (
          !text.includes(term) &&
          !dept.includes(term) &&
          !subj.includes(term) &&
          !topic.includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    questions,
    branchFilter,
    deptFilter,
    subjFilter,
    topicFilter,
    questionSearch,
    allDepartments,
    filterSubjects,
    filterTopics,
  ]);

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
        setHierarchyTick((n) => n + 1);
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
        setHierarchyTick((n) => n + 1);
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

  const submitQuestionForm = async (andAnother: boolean = false) => {
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
          showSuccess('Question updated', 'Question has been updated successfully.');
          closeDrawer();
        } else {
          const created = await examinationService.createQuestion(payload);
          try {
            await examinationService.approveQuestion(created.id);
            setMessage(`${QUESTION_TYPE_LABELS[questionType]} question added successfully.`);
          } catch {
            setMessage('Question created (pending approval).');
          }
          if (andAnother) {
            setNewQ('');
            clearOptionInputs();
            setAddedCount((c) => c + 1);
            setJustAddedMsg('Question added successfully! You can add another question below.');
            setTimeout(() => {
              drawerBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              questionTextareaRef.current?.focus();
            }, 30);
          } else {
            showSuccess('Question created', 'Question added to library successfully.');
            closeDrawer();
          }
        }
        await loadQuestions();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestionForm(false);
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
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => selectedDeleteIds.includes(q.id));

  return (
    <div className="org-panel-root">

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
                {hasActiveFilters
                  ? `${filteredQuestions.length} of ${pagination.total} Questions`
                  : `${pagination.total} ${pagination.total === 1 ? 'Question' : 'Questions'}`}
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
              onClick={() => setIsBulkImportModalOpen(true)}
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

        {/* ── 4-Tier Cascading Filter Toolbar (Branch -> Department -> Subject -> Topic) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {/* 1. Branch / Campus Filter */}
          <div style={{ flex: '1 1 160px', minWidth: 150 }}>
            <select
              className="org-form-select"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={branchFilter}
              onChange={(e) => handleBranchFilterChange(e.target.value)}
            >
              <option value="">All Branches / Campuses</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Department Filter */}
          <div style={{ flex: '1 1 180px', minWidth: 170 }}>
            <select
              className="org-form-select"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={deptFilter}
              onChange={(e) => handleDeptFilterChange(e.target.value)}
            >
              <option value="">All Departments</option>
              {availableFilterDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Subject Filter */}
          <div style={{ flex: '1 1 180px', minWidth: 170 }}>
            <select
              className="org-form-select"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={subjFilter}
              onChange={(e) => handleSubjFilterChange(e.target.value)}
              disabled={filterSubjectsLoading}
            >
              <option value="">
                {filterSubjectsLoading ? 'Loading subjects…' : 'All Subjects'}
              </option>
              {filterSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Topic Filter */}
          <div style={{ flex: '1 1 180px', minWidth: 170 }}>
            <select
              className="org-form-select"
              style={{ height: 38, fontSize: '0.8125rem' }}
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              disabled={filterTopicsLoading}
            >
              <option value="">
                {filterTopicsLoading ? 'Loading topics…' : 'All Topics'}
              </option>
              {filterTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="org-drawer-cancel"
              style={{
                height: 38,
                padding: '0 14px',
                fontSize: '0.8125rem',
                gap: 6,
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
              onClick={resetFilters}
              title="Reset all filters"
            >
              <FiRefreshCw style={{ fontSize: 13 }} />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Continuous Gradient Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="org-table">
            <thead>
              <tr>
                <th className="org-table-check">
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
                <th className="edtp-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => {
                const label = getQuestionText(q.content);
                return (
                  <tr key={q.id} className={editingId === q.id ? 'edtp-row--editing' : undefined}>
                    <td className="org-table-check">
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
                    <td className="org-td-actions" style={{ textAlign: 'left' }}>
                      <div className="org-actions-cell" style={{ justifyContent: 'flex-start' }}>
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
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="org-empty-state" style={{ padding: '36px 16px', textAlign: 'center' }}>
                      <FiHelpCircle className="org-empty-icon" />
                      <p className="org-empty-title">No questions found</p>
                      <p className="org-empty-desc">
                        {hasActiveFilters
                          ? 'No questions match the selected branch, department, subject, or topic filters.'
                          : 'No questions found. Click + Add Question above or import questions from CSV.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          className="org-drawer-cancel"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            margin: '8px auto 0',
                            padding: '6px 14px',
                            fontSize: '0.8125rem',
                          }}
                          onClick={resetFilters}
                        >
                          <FiRefreshCw style={{ fontSize: 13 }} />
                          <span>Reset filters</span>
                        </button>
                      )}
                    </div>
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
          <div className="org-drawer-body" ref={drawerBodyRef}>
            {justAddedMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderLeft: '4px solid #10b981',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: '16px',
                }}
              >
                <FiCheckCircle style={{ color: '#059669', fontSize: '1.25rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46' }}>
                    {justAddedMsg} {addedCount > 1 ? `(${addedCount} questions added in this batch)` : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: 2 }}>
                    Question saved. Continue adding more questions below, or click <strong>Cancel</strong> to close.
                  </div>
                </div>
              </div>
            )}

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
                ref={questionTextareaRef}
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
            {!editingId ? (
              <>
                <button
                  type="button"
                  className="org-drawer-submit"
                  disabled={!topicId}
                  onClick={() => void submitQuestionForm(true)}
                >
                  Save & Add Another
                </button>
                <button
                  type="submit"
                  className="org-drawer-submit"
                  disabled={!topicId}
                >
                  Save Question
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="org-drawer-submit"
                style={{ gridColumn: '1 / -1' }}
                disabled={!topicId}
              >
                Update Question
              </button>
            )}
          </div>
        </form>
      </div>

      <QuestionPreviewModal
        questionId={previewQuestionId}
        onClose={() => setPreviewQuestionId(null)}
      />

      <BulkImportCsvModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        departments={departments}
        onImportSuccess={(summary) => {
          setImportSummary(summary);
          setHierarchyTick((n) => n + 1);
          void loadQuestions();
          showSuccess(
            'Bulk import complete',
            `${summary.created} added, ${summary.skipped} skipped, ${summary.errors} errors`,
          );
        }}
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
    setError('');
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
    const current = tests.find((x) => x.id === editingId);
    if (current?.total_marks != null && current.total_marks > 0 && passing >= current.total_marks) {
      setError(`Passing marks (${passing}) cannot be greater than or equal to total marks (${current.total_marks}).`);
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
                <th className="edtp-th-actions">ACTIONS</th>
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
                  <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {t.status === 'draft' && (
                        <Link
                          to={`/dashboard/test-builder/${t.id}?step=build`}
                          className="org-action-btn org-action-btn--switch"
                          title="Continue setup"
                          aria-label="Continue setup"
                        >
                          <FiPlay style={{ fontSize: 14 }} />
                        </Link>
                      )}
                      {(t.status === 'scheduled' || t.status === 'live') && (
                        <Link
                          to={`/dashboard/test-builder/${t.id}?step=assign`}
                          className="org-action-btn org-action-btn--switch"
                          title="Assign students"
                          aria-label="Assign students"
                        >
                          <FiZap style={{ fontSize: 14 }} />
                        </Link>
                      )}
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--edit"
                        disabled={t.status === 'completed'}
                        title={t.status === 'completed' ? 'Completed tests cannot be edited' : 'Edit test details'}
                        aria-label="Edit test details"
                        onClick={() => {
                          if (t.status !== 'completed') startEdit(t);
                        }}
                      >
                        <FiEdit3 style={{ fontSize: 14 }} />
                      </button>
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--danger"
                        onClick={() => void remove(t.id, t.title)}
                        title="Delete test"
                        aria-label="Delete test"
                      >
                        <FiTrash2 style={{ fontSize: 14 }} />
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

      {/* ── Side Drawer for Editing Test Details ── */}
      <div
        className={`org-drawer-overlay ${editingId ? 'is-open' : ''}`}
        onClick={() => setEditingId(null)}
        aria-hidden="true"
      />
      <div
        className={`org-drawer ${editingId ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawerEditTestTitle"
      >
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <FiEdit3 />
            </div>
            <div>
              <h3 className="org-drawer-title" id="drawerEditTestTitle">Edit Test Details</h3>
              <p className="org-drawer-desc">Update duration, scoring, and examination security rules</p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={() => setEditingId(null)}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>
            <div className="org-drawer-body">
              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
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
                  <label className="org-form-label">
                    Passing marks {(() => {
                      const t = tests.find((x) => x.id === editingId);
                      return t?.total_marks != null && t.total_marks > 0 ? `(Total marks: ${t.total_marks})` : '';
                    })()}
                  </label>
                  <input
                    className="org-form-input"
                    type="number"
                    min={0}
                    value={editPassingMarks}
                    onChange={(e) => setEditPassingMarks(e.target.value)}
                  />
                  {(() => {
                    const t = tests.find((x) => x.id === editingId);
                    return t?.total_marks != null && t.total_marks > 0 ? (
                      <span className="org-form-hint">
                        Must be strictly less than total marks (${t.total_marks}).
                      </span>
                    ) : null;
                  })()}
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
                <div className="org-form-field" style={{ justifyContent: 'flex-start' }}>
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

                <div className="org-grid-3" style={{ marginTop: 10 }}>
                  <div className="org-form-field">
                    <label className="org-form-label" style={{ fontSize: '0.75rem' }}>Max Attempts</label>
                    {editExamType === 'official' ? (
                      <input className="org-form-input" type="number" value={1} disabled title="Official exams allow 1 attempt" />
                    ) : (
                      <select
                        className="org-form-select"
                        value={editMaxAttempts}
                        onChange={(e) => setEditMaxAttempts(e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                          <option key={c} value={String(c)}>{c} {c === 1 ? 'Attempt' : 'Attempts'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="org-form-field">
                    <label className="org-form-label" style={{ fontSize: '0.75rem' }}>Flag: Fullscreen Exits</label>
                    <input
                      className="org-form-input"
                      type="number"
                      min={0}
                      value={editMaxFullscreenExits}
                      onChange={(e) => setEditMaxFullscreenExits(e.target.value)}
                    />
                  </div>
                  <div className="org-form-field">
                    <label className="org-form-label" style={{ fontSize: '0.75rem' }}>Flag: Copy/Paste</label>
                    <input
                      className="org-form-input"
                      type="number"
                      min={0}
                      value={editMaxCopyPasteAttempts}
                      onChange={(e) => setEditMaxCopyPasteAttempts(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="org-drawer-footer">
              <button
                type="button"
                className="org-drawer-cancel"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="org-drawer-submit"
                onClick={() => void saveEdit()}
              >
                Save Changes
              </button>
            </div>
          </div>
      <div style={{ display: 'none' }}></div>
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
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'practice' | 'completed'>('all');

  const counts = useMemo(() => {
    let practice = 0;
    let official = 0;
    let completed = 0;
    for (const t of tests) {
      if (isPracticeExam(t)) practice++;
      else official++;
      if (t.attempt_status === 'submitted' || t.attempt_status === 'auto_submitted') completed++;
    }
    return { all: tests.length, official, practice, completed };
  }, [tests]);

  const filteredTests = useMemo(() => {
    if (activeTab === 'practice') return tests.filter(isPracticeExam);
    if (activeTab === 'official') return tests.filter((t) => !isPracticeExam(t));
    if (activeTab === 'completed') return tests.filter((t) => t.attempt_status === 'submitted' || t.attempt_status === 'auto_submitted');
    return tests;
  }, [tests, activeTab]);

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
        <div className="d-flex flex-column gap-2 w-100">
          {resultId ? (
            <Link
              to={`/dashboard/exam-result/${resultId}`}
              className="edtp-btn edtp-btn--secondary edtp-btn--md d-inline-flex align-items-center justify-content-center gap-2"
            >
              <FiEye style={{ fontSize: 15 }} />
              <span>View Result</span>
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
          <div className="d-flex align-items-center gap-2">
            <h2 className="org-page-title mb-0">Assigned Tests</h2>
            <span className="org-count-badge">{tests.length}</span>
          </div>
          <p className="org-page-desc mt-1">
            Access your assigned examinations, continue pending tests, or review your results.
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      {/* Interactive Quick Filter Tabs */}
      {tests.length > 0 && (
        <div className="sca-student-tests-filters">
          <button
            type="button"
            className={`sca-student-filter-tab${activeTab === 'all' ? ' sca-student-filter-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All Tests</span>
            <span className="sca-student-filter-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`sca-student-filter-tab${activeTab === 'official' ? ' sca-student-filter-tab--active' : ''}`}
            onClick={() => setActiveTab('official')}
          >
            <span>Official Exams</span>
            <span className="sca-student-filter-count">{counts.official}</span>
          </button>
          <button
            type="button"
            className={`sca-student-filter-tab${activeTab === 'practice' ? ' sca-student-filter-tab--active' : ''}`}
            onClick={() => setActiveTab('practice')}
          >
            <span>Practice Exams</span>
            <span className="sca-student-filter-count">{counts.practice}</span>
          </button>
          <button
            type="button"
            className={`sca-student-filter-tab${activeTab === 'completed' ? ' sca-student-filter-tab--active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span>Completed</span>
            <span className="sca-student-filter-count">{counts.completed}</span>
          </button>
        </div>
      )}

      <div className="org-table-card sca-student-tests-panel">
        {filteredTests.length === 0 &&
          !error &&
          !pageLoading ? (
          <div className="sca-student-tests-empty">
            <h5>{tests.length === 0 ? 'No tests assigned yet' : 'No tests found in this category'}</h5>

            <p className="text-muted mb-0">
              {tests.length === 0
                ? 'When your institute publishes and assigns an exam, it will appear here.'
                : 'Try selecting a different filter above to see your assigned tests.'}
            </p>
          </div>
        ) : (
          <div className="sca-student-tests-grid">
            {filteredTests.map((t) => {
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
                      <span className={`edtp-badge ${isPractice ? 'edtp-badge--practice' : 'edtp-badge--official'}`}>
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
          <div className="d-flex align-items-center gap-2">
            <h2 className="org-page-title mb-0">{title}</h2>
            <span className="org-count-badge">{pagination.total}</span>
          </div>
          <p className="org-page-desc mt-1">
            Track and review student examination sessions, results, and proctoring status.
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      {/* Search Toolbar on Left */}
      <div className="sca-results-toolbar">
        <div className="org-search-box sca-results-search-box">
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

      <div className="org-table-card sca-attempts-card">

        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Test</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Status</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Score</th>
                <th style={{ textTransform: 'none', color: '#ffffff' }}>Started</th>
                {!readOnly && <th className="edtp-th-actions" style={{ textTransform: 'none', color: '#ffffff' }}>Actions</th>}
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
                    <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'nowrap' }}>
                        {a.status === 'in_progress' && (
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--switch"
                            onClick={() => navigate(`/dashboard/exam/${a.test_id}/attempt/${a.id}`)}
                            title="Resume attempt"
                            aria-label="Resume attempt"
                          >
                            <FiPlay style={{ fontSize: 14 }} />
                          </button>
                        )}
                        {(a.status === 'submitted' || a.status === 'auto_submitted') && (
                          <Link
                            to={`/dashboard/exam-result/${a.id}`}
                            className="org-action-btn org-action-btn--edit"
                            title="View result"
                            aria-label="View result"
                          >
                            <FiEye style={{ fontSize: 14 }} />
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

  const stats = useMemo(() => {
    const total = results.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: '—',
        passed: 0,
        failed: 0,
      };
    }
    let sumPercentage = 0;
    let passed = 0;
    for (const r of results) {
      sumPercentage += Number(r.percentage || 0);
      const isPass =
        r.passing_marks != null && Number(r.passing_marks) > 0
          ? Number(r.total_score) >= Number(r.passing_marks)
          : Number(r.percentage) >= 40;
      if (isPass) {
        passed++;
      }
    }
    const avgScore = `${(sumPercentage / total).toFixed(1)}%`;
    const failed = total - passed;
    return {
      total,
      avgScore,
      passed,
      failed,
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const q = searchTerm.toLowerCase();
    return results.filter(
      (r) => r.test_title && r.test_title.toLowerCase().includes(q),
    );
  }, [results, searchTerm]);

  return (
    <div className="org-panel-page">
      <div className="org-page-header mb-3">
        <div className="org-page-header-left">
          <div className="d-flex align-items-center gap-2">
            <h2 className="org-page-title mb-0">Results</h2>
            {results.length > 0 && (
              <span className="org-count-badge">{results.length}</span>
            )}
          </div>
          <p className="org-page-desc mt-1" style={{ margin: 0 }}>
            Track your examination performance and progress.
          </p>
        </div>
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      {/* 4 KPI Stat Cards */}
      <div className="sca-result-stats-grid mb-4">
        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--score">
              <FiFileText />
            </span>
            <span className="sca-result-stat-label">Total Tests</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--score">
              {stats.total}
            </span>
          </div>
          <span className="sca-result-stat-hint">Examinations completed</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--pass">
              <FiTrendingUp />
            </span>
            <span className="sca-result-stat-label">Average Score</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--pass">
              {stats.avgScore}
            </span>
          </div>
          <span className="sca-result-stat-hint">Overall cohort performance</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--pass">
              <FiCheck />
            </span>
            <span className="sca-result-stat-label">Passed</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--pass">
              {stats.passed}
            </span>
          </div>
          <span className="sca-result-stat-hint">Met passing threshold</span>
        </div>

        <div className="sca-result-stat-card">
          <div className="sca-result-stat-header">
            <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--fail">
              <FiX />
            </span>
            <span className="sca-result-stat-label">Failed</span>
          </div>
          <div className="sca-result-stat-value-row">
            <span className="sca-result-stat-num sca-result-stat-num--fail">
              {stats.failed}
            </span>
          </div>
          <span className="sca-result-stat-hint">Below passing mark</span>
        </div>
      </div>

      {/* Search Toolbar on Left */}
      <div className="sca-results-toolbar">
        <div className="org-search-box sca-results-search-box">
          <FiSearch className="org-search-icon" />
          <input
            type="text"
            className="org-search-input"
            placeholder="Search by test name…"
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

      {/* Table Card */}
      <div className="org-table-card sca-assignments-card sca-results-card">
        <div className="org-table-wrap">
          <table className="org-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Rank</th>
                <th>Percentile</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th className="edtp-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r) => {
                const isPass =
                  r.passing_marks != null && Number(r.passing_marks) > 0
                    ? Number(r.total_score) >= Number(r.passing_marks)
                    : Number(r.percentage) >= 40;

                return (
                  <tr key={r.id}>
                    <td>
                      <span className="sca-assignment-title">{r.test_title ?? r.test_id}</span>
                      <span className="sca-assignment-subtitle">
                        <span className="sca-live-dot" />
                        Online Test
                      </span>
                    </td>
                    <td>
                      <span className="sca-assignment-marks">{r.total_score} / {r.max_score}</span>
                    </td>
                    <td>
                      <div className="sca-progress-cell">
                        <span className="sca-progress-pct" style={{ color: isPass ? '#059669' : '#dc2626' }}>
                          {Number(r.percentage).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontWeight: 600 }}>
                        {r.rank != null ? `#${r.rank}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontWeight: 600 }}>
                        {r.percentile != null ? `${Number(r.percentile).toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatDateTime(r.created_at)}
                      </span>
                    </td>
                    <td>
                      {isPass ? (
                        <span className="sca-status-pill sca-status-pill--completed">
                          <FiCheck className="sca-status-icon" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="sca-status-pill sca-status-pill--incorrect">
                          <FiX className="sca-status-icon" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="org-td-actions edtp-td-actions" style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'flex-start' }}>
                        <Link
                          to={`/dashboard/exam-result/${r.attempt_id}`}
                          className="edtp-action-pill edtp-action-pill--result"
                          title="View Result"
                          aria-label="View Result"
                        >
                          <FiEye className="edtp-action-pill-icon" />
                          <span>View</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 4 }}>
                      {results.length === 0 ? 'No results found.' : 'No results match your search filter.'}
                    </div>
                    {searchTerm && (
                      <button
                        type="button"
                        className="sca-assignments-reset-filter"
                        onClick={() => setSearchTerm('')}
                      >
                        Reset search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {results.length > 0 && (
          <div className="sca-assignments-footer">
            <span>
              Showing <strong>{filteredResults.length}</strong> of <strong>{results.length}</strong> {results.length === 1 ? 'result' : 'results'}
            </span>
            {filteredResults.length !== results.length && (
              <button
                type="button"
                className="sca-assignments-reset-filter"
                onClick={() => setSearchTerm('')}
              >
                View all results
              </button>
            )}
          </div>
        )}
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
    shouldUnregister: false,
    defaultValues: {
      title: '',
      duration: '',
      description: '',
      departmentId: '',
      subjectId: '',
      topicId: '',
      passingMarks: '',
      examType: 'official',
      certificationEnabled: true,
      instructions: '',
      shuffleQuestions: false,
      shuffleOptions: false,
      negativeMarking: false,
      fullScreen: true,
      allowResume: true,
      releaseAnswers: false,
      maxTabSwitches: '',
      maxAttempts: '',
      scoringPolicy: 'latest',
      maxFullscreenExits: '',
      maxCopyPasteAttempts: '',
    },
  });

  const departmentId = watch('departmentId');
  const subjectId = watch('subjectId');
  const topicId = watch('topicId');
  const examTitle = watch('title');
  const duration = watch('duration');
  const passingMarks = watch('passingMarks');
  const examType = watch('examType');
  const maxTabSwitches = watch('maxTabSwitches');
  const maxAttempts = watch('maxAttempts');

  const { user } = useAuth();

  // Clear any existing cached draft so user always starts with a fresh blank test
  useEffect(() => {
    if (user?.id) {
      try {
        localStorage.removeItem(`edumatra:create-test-draft:${user.id}`);
      } catch {
        /* ignore */
      }
    }
  }, [user?.id]);

  const isDetailsComplete = Boolean(
    departmentId?.trim() &&
    subjectId?.trim() &&
    topicId?.trim() &&
    examTitle?.trim() &&
    examTitle.trim().length >= 3
  );

  const isScoringFieldsFilled = Boolean(
    duration !== '' &&
    duration != null &&
    !Number.isNaN(Number(duration)) &&
    Number(duration) >= 1 &&
    passingMarks !== '' &&
    passingMarks != null &&
    !Number.isNaN(Number(passingMarks)) &&
    Number(passingMarks) >= 0
  );

  const isScoringComplete = Boolean(isDetailsComplete && isScoringFieldsFilled);

  const isRulesFieldsFilled = Boolean(
    maxTabSwitches !== '' &&
    maxTabSwitches != null &&
    !Number.isNaN(Number(maxTabSwitches)) &&
    Number(maxTabSwitches) >= 0 &&
    maxAttempts !== '' &&
    maxAttempts != null &&
    !Number.isNaN(Number(maxAttempts)) &&
    Number(maxAttempts) >= 1
  );

  const isRulesComplete = Boolean(isScoringComplete && isRulesFieldsFilled);

  const stepperActiveStep = !isDetailsComplete ? 1 : !isScoringComplete ? 2 : 3;

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
            examType: values.examType,
            certificationEnabled: values.examType === 'official' && Boolean(values.certificationEnabled),
            shuffleQuestions: Boolean(values.shuffleQuestions),
            shuffleOptions: Boolean(values.shuffleOptions),
            negativeMarking: Boolean(values.negativeMarking),
            fullScreen: Boolean(values.fullScreen),
            allowResume: Boolean(values.allowResume),
            releaseAnswers: Boolean(values.releaseAnswers),
            maxTabSwitches: values.maxTabSwitches !== '' ? Number(values.maxTabSwitches) : 5,
            maxAttempts:
              values.examType === 'official'
                ? 1
                : Math.min(10, Math.max(1, Number(values.maxAttempts) || 1)),
            scoringPolicy: values.scoringPolicy === 'highest' ? 'highest' : 'latest',
            maxFullscreenExits: values.maxFullscreenExits !== '' ? Math.max(0, Number(values.maxFullscreenExits)) : 3,
            maxCopyPasteAttempts: values.maxCopyPasteAttempts !== '' ? Math.max(0, Number(values.maxCopyPasteAttempts)) : 3,
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
      <div className="org-panel-root">
        <div className="org-top-bar">
          <div>
            <h2 className="org-page-title">Create Test</h2>
          </div>
          <Link
            to={getTestsListPath(user?.roles ?? [])}
            className="org-btn-outline-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <FiList /> Edit saved tests
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #3b82f6',
            borderRadius: 10,
            padding: '12px 18px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px' }}>
            <FiInfo style={{ color: '#2563eb', fontSize: '1.25rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              <strong>Prerequisite:</strong> To create a test, please first go to the Question Bank tab to add your subjects, topics, and questions.
            </span>
          </div>
          <Link
            to="/dashboard/admin-question-bank"
            className="org-btn-outline-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8125rem',
              padding: '6px 14px',
              textDecoration: 'none',
              background: '#ffffff',
              flexShrink: 0,
            }}
          >
            <span>Go to Question Bank</span>
            <FiArrowRight />
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
            activeStep={stepperActiveStep}
            canOpen={() => true}
            onStep={(step) => {
              const id = step === 1 ? 'sec-details' : step === 2 ? 'sec-scoring' : 'sec-rules';
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            steps={[
              { step: 1, title: 'Details', desc: 'Subject and title', completed: isDetailsComplete },
              { step: 2, title: 'Scoring', desc: 'Time and marks', completed: isScoringComplete },
              { step: 3, title: 'Rules', desc: 'Security settings', completed: isRulesComplete },
            ]}
          />

          <div className="org-table-card" style={{ padding: '24px 28px', marginTop: 16 }}>
            <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Create New Examination
              </h4>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Section 1: Exam Details */}
              <div id="sec-details" style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid #f1f5f9' }}>
                <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                  1. Exam Details
                </h5>
                <div className="row g-3">
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
                </div>
              </div>

              {/* Section 2: Time and Scoring */}
              <div id="sec-scoring" style={{ marginBottom: 28, paddingBottom: 22, borderBottom: '1px solid #f1f5f9' }}>
                <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                  2. Time &amp; Scoring
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="org-form-label" htmlFor="duration">Duration (minutes)</label>
                    <input
                      id="duration"
                      type="number"
                      min={1}
                      step={1}
                      placeholder="e.g. 60"
                      className={inputClassName('org-form-input', !!errors.duration)}
                      {...register('duration')}
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
                      placeholder="e.g. 40"
                      className={inputClassName('org-form-input', !!errors.passingMarks)}
                      {...register('passingMarks')}
                    />
                    <span className="org-form-hint">
                      Total marks of questions added in the next step must exceed this value.
                    </span>
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
                      placeholder="Instructions displayed to candidates before they start (e.g. Read all questions carefully)..."
                      {...register('instructions')}
                    />
                    <FormError message={errors.instructions?.message} />
                  </div>
                </div>
              </div>

              {/* Section 3: Security & Proctoring Rules */}
              <div id="sec-rules" style={{ marginBottom: 28 }}>
                <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                  3. Security &amp; Proctoring Rules
                </h5>
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
                      placeholder="e.g. 5"
                      className={inputClassName('org-form-input', !!errors.maxTabSwitches)}
                      {...register('maxTabSwitches')}
                    />
                    <FormError message={errors.maxTabSwitches?.message} />
                  </div>
                  <div className="col-md-4" style={{ marginTop: 12 }}>
                    <label className="org-form-label" htmlFor="maxAttempts">Max attempts</label>
                    <input
                      id="maxAttempts"
                      type="number"
                      min={1}
                      placeholder="e.g. 1"
                      className={inputClassName('org-form-input', !!errors.maxAttempts)}
                      {...register('maxAttempts')}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {examType === 'official'
                        ? 'Official exams allow 1 attempt only.'
                        : 'Allowed attempts for this practice exam.'}
                    </small>
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
                      placeholder="e.g. 3"
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
                      placeholder="e.g. 3"
                      className={inputClassName('org-form-input', !!errors.maxCopyPasteAttempts)}
                      {...register('maxCopyPasteAttempts')}
                    />
                  </div>
                </div>
              </div>

              {/* Form submit button */}
              <div
                className="col-12"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="submit"
                  className="org-add-btn"
                  style={{
                    minWidth: 200,
                    height: 46,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    padding: '0 24px',
                    boxSizing: 'border-box',
                  }}
                >
                  <FiCheckCircle style={{ marginRight: 8, fontSize: '1.05rem' }} /> Save &amp; Build Test
                </button>
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
      const attempt = await examinationService.startAttempt(result.test_id);
      navigate(`/dashboard/exam/${result.test_id}/attempt/${attempt.id}`);
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
  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const withLoader = useDashboardLoader();
  const roles = user?.roles ?? [];
  const isStaffLike = roles.some((r) =>
    ['super_admin', 'org_admin', 'staff', 'branch_admin'].includes(r),
  );
  const isTeacherOnly = roles.includes('teacher') && !isStaffLike;
  const isStudent = roles.includes('student') && !isStaffLike && !roles.includes('teacher');
  const canIssueAsStaff = isStaffLike || isTeacherOnly;

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

  const questions = result?.questions ?? [];

  const questionCounts = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    for (const q of questions) {
      const isCorr = q.is_correct ?? Number(q.marks_awarded) > 0;
      if (isCorr) {
        correct++;
      } else {
        incorrect++;
      }
    }
    return {
      all: questions.length,
      correct,
      incorrect,
    };
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (questionFilter === 'all') return questions;
    return questions.filter((q) => {
      const isCorr = q.is_correct ?? Number(q.marks_awarded) > 0;
      return questionFilter === 'correct' ? isCorr : !isCorr;
    });
  }, [questions, questionFilter]);

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

  const cleanName = [result.first_name, result.last_name]
    .filter((s): s is string => Boolean(s))
    .map((s) => s.trim().replace(/^[\s.]+|[\s.]+$/g, ''))
    .filter(Boolean)
    .join(' ');
  const studentName = cleanName || (result.student_id ? `Student #${result.student_id}` : 'Student');

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
            className="edtp-action-pill edtp-action-pill--cert"
            title="Download Certificate"
          >
            <FiAward className="edtp-action-pill-icon" />
            <span>Certificate Issued · {existingCert.certificate_no}</span>
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
          className="edtp-action-pill edtp-action-pill--result"
          disabled={certBusy}
          onClick={() => void handlePreviewCertificate()}
        >
          <FiEye className="edtp-action-pill-icon" />
          <span>Preview Certificate</span>
        </button>,
      );
    }
    if (existingCert) {
      buttons.push(
        <button
          key="dl"
          type="button"
          className="edtp-action-pill edtp-action-pill--start"
          disabled={certBusy}
          onClick={handlePreviewExistingCertificate}
        >
          <FiAward className="edtp-action-pill-icon" />
          <span>Download Certificate</span>
        </button>,
      );
    } else if (passing && canIssueAsStaff) {
      buttons.push(
        <button
          key="issue"
          type="button"
          className="edtp-action-pill edtp-action-pill--start"
          disabled={certBusy}
          onClick={handlePreviewCertificate}
        >
          <FiAward className="edtp-action-pill-icon" />
          <span>{certBusy ? 'Issuing…' : 'Issue Certificate'}</span>
        </button>,
      );
    }
    return buttons;
  };

  return (
    <div className="org-panel-page">
      {/* Back to Tests Link */}
      <div>
        <Link to="/dashboard/student-enrolled-courses" className="sca-result-back-link">
          <FiArrowLeft className="sca-result-back-icon" />
          <span>Back to Tests</span>
        </Link>
      </div>

      <div className="org-page-header">
        <div className="org-page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="org-page-title mb-0">Result — {result.test_title}</h2>
            {flagged ? (
              <span className="org-status-badge org-status-badge--inactive">
                Flagged
              </span>
            ) : (
              <span className="org-status-badge org-status-badge--active">
                Completed
              </span>
            )}
            {result.exam_type === 'official' && (
              <span className="edtp-badge edtp-badge--official">Official Exam</span>
            )}
          </div>
          <div className="sca-result-meta-row mt-1">
            <span className="sca-result-meta-item">
              <FiUser className="sca-result-meta-icon" />
              <span>Student: <strong>{studentName}</strong></span>
            </span>
            {result.created_at && (
              <span className="sca-result-meta-item">
                <FiClock className="sca-result-meta-icon" />
                <span>Submitted: {formatDateTime(result.created_at)}</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {renderCertCta()}
        </div>
      </div>

      <div className="sca-exam-result-scroll">
        {/* Attempts / Policy info bar */}
        <div className="sca-result-attempt-strip">
          <div className="sca-result-attempt-left">
            {history && history.attempts.length > 1 && (
              <div className="sca-result-attempt-select-wrap">
                <label className="sca-result-attempt-label" htmlFor="attemptHistory">
                  Attempt:
                </label>
                <select
                  id="attemptHistory"
                  className="org-form-select sca-result-attempt-select"
                  value={attemptId}
                  onChange={(e) => navigate(`/dashboard/exam-result/${e.target.value}`)}
                >
                  {history.attempts.map((a) => (
                    <option key={a.attempt_id} value={a.attempt_id}>
                      #{a.attempt_number}
                      {result.exam_type === 'official' && a.is_official ? ' (official)' : ''}
                      {' · '}
                      {a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : a.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {history && (
              <div className="sca-result-attempt-chips">
                <span className="sca-result-chip">
                  <span><strong>{history.completed_attempts}</strong> of <strong>{history.max_attempts}</strong> completed</span>
                </span>
                <span className="sca-result-chip">
                  <span>Remaining: <strong>{history.attempts_remaining}</strong></span>
                </span>
                <span className="sca-result-chip">
                  <span>Policy: <strong style={{ textTransform: 'capitalize' }}>{history.scoring_policy}</strong></span>
                </span>
              </div>
            )}
          </div>

          {(() => {
            const isPractice = result.exam_type === 'practice';
            const attemptsLeft = Math.max(0, Number(history?.attempts_remaining ?? 0));
            const maxAttempts = Number(history?.max_attempts ?? 0);

            if (!isPractice || !history) return null;

            return (
              <div className="sca-result-attempt-right">
                <span className="sca-result-chip sca-result-chip--highlight">
                  <span>Attempts Left: <strong>{attemptsLeft} of {maxAttempts}</strong></span>
                </span>
                {attemptsLeft > 0 && (
                  <button
                    type="button"
                    className="edtp-action-pill edtp-action-pill--start"
                    onClick={() => void handleReattempt()}
                  >
                    <FiPlay className="edtp-action-pill-icon edtp-action-pill-icon--fill" />
                    <span>Retest</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* 4 Modern Stat Cards */}
        <div className="sca-result-stats-grid">
          <div className="sca-result-stat-card">
            <div className="sca-result-stat-header">
              <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--score">
                <FiFileText />
              </span>
              <span className="sca-result-stat-label">Total Score</span>
            </div>
            <div className="sca-result-stat-value-row">
              <span className="sca-result-stat-num sca-result-stat-num--score">
                {result.total_score}
              </span>
              <span className="sca-result-stat-max">/ {result.max_score}</span>
            </div>
            <span className="sca-result-stat-hint">Marks scored in this attempt</span>
          </div>

          <div className="sca-result-stat-card">
            <div className="sca-result-stat-header">
              <span className={`sca-result-stat-icon-wrap ${passing ? 'sca-result-stat-icon-wrap--pass' : 'sca-result-stat-icon-wrap--fail'}`}>
                <FiTrendingUp />
              </span>
              <span className="sca-result-stat-label">Percentage</span>
            </div>
            <div className="sca-result-stat-value-row">
              <span className={`sca-result-stat-num ${passing ? 'sca-result-stat-num--pass' : 'sca-result-stat-num--fail'}`}>
                {Number(result.percentage).toFixed(1)}%
              </span>
            </div>
            <span className="sca-result-stat-hint">{passing ? 'Passing criteria met' : 'Below passing score'}</span>
          </div>

          <div className="sca-result-stat-card">
            <div className="sca-result-stat-header">
              <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--rank">
                <FiAward />
              </span>
              <span className="sca-result-stat-label">Cohort Rank</span>
            </div>
            <div className="sca-result-stat-value-row">
              <span className="sca-result-stat-num sca-result-stat-num--rank">
                {result.rank != null ? `#${result.rank}` : '—'}
              </span>
            </div>
            <span className="sca-result-stat-hint">Position in overall exam cohort</span>
          </div>

          <div className="sca-result-stat-card">
            <div className="sca-result-stat-header">
              <span className="sca-result-stat-icon-wrap sca-result-stat-icon-wrap--percentile">
                <FiTarget />
              </span>
              <span className="sca-result-stat-label">Percentile</span>
            </div>
            <div className="sca-result-stat-value-row">
              <span className="sca-result-stat-num sca-result-stat-num--percentile">
                {result.percentile != null ? `${Number(result.percentile).toFixed(1)}%` : '—'}
              </span>
            </div>
            <span className="sca-result-stat-hint">Percentile score ranking</span>
          </div>
        </div>

        {/* Proctoring Timeline Card */}
        {canIssueAsStaff && result.proctoring_timeline ? (
          <div className="org-table-card mb-4">
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
        <div className="org-table-card sca-result-q-card-container">
          <div className="sca-result-q-header">
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

            {/* Question Filter Tabs */}
            {questions.length > 0 && (
              <div className="sca-student-tests-filters sca-result-q-filters">
                <button
                  type="button"
                  className={`sca-student-filter-tab sca-result-q-filter-tab ${questionFilter === 'all' ? 'sca-student-filter-tab--active' : ''}`}
                  onClick={() => setQuestionFilter('all')}
                >
                  <span>All Questions</span>
                  <span className="sca-student-filter-count">{questionCounts.all}</span>
                </button>
                <button
                  type="button"
                  className={`sca-student-filter-tab sca-result-q-filter-tab ${questionFilter === 'correct' ? 'sca-student-filter-tab--active' : ''}`}
                  onClick={() => setQuestionFilter('correct')}
                >
                  <span>Correct</span>
                  <span className="sca-student-filter-count">{questionCounts.correct}</span>
                </button>
                <button
                  type="button"
                  className={`sca-student-filter-tab sca-result-q-filter-tab ${questionFilter === 'incorrect' ? 'sca-student-filter-tab--active' : ''}`}
                  onClick={() => setQuestionFilter('incorrect')}
                >
                  <span>Incorrect</span>
                  <span className="sca-student-filter-count">{questionCounts.incorrect}</span>
                </button>
              </div>
            )}
          </div>

          <div className="sca-result-q-list">
            {filteredQuestions.length === 0 ? (
              <div className="sca-result-q-empty">
                <p>No questions match the selected filter.</p>
                <button
                  type="button"
                  className="sca-assignments-reset-filter"
                  onClick={() => setQuestionFilter('all')}
                >
                  View all questions
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, index) => {
                const originalIndex = questions.findIndex((orig) => orig.question_id === q.question_id);
                const qNumber = originalIndex !== -1 ? originalIndex + 1 : index + 1;
                const selectedIds = new Set(q.answer?.selectedOptionIds ?? []);
                const opts = q.options ?? [];
                const hasOptions = opts.length > 0;
                const isCorrect = q.is_correct ?? Number(q.marks_awarded) > 0;

                return (
                  <div key={q.question_id} className="sca-result-q-item">
                    <div className="sca-result-q-item-header">
                      <div className="sca-result-q-item-title-wrap">
                        <span className="sca-result-q-badge">
                          Q{qNumber}
                        </span>
                        <strong className="sca-result-q-text">
                          {questionText(q.content)}
                        </strong>
                      </div>

                      <div className="sca-result-q-badges">
                        {q.is_correct != null || q.marks_awarded != null ? (
                          <span
                            className={`sca-status-pill ${
                              isCorrect ? 'sca-status-pill--completed' : 'sca-status-pill--incorrect'
                            }`}
                          >
                            {isCorrect ? <FiCheck className="sca-status-icon" /> : <FiX className="sca-status-icon" />}
                            <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                          </span>
                        ) : null}
                        <span className="sca-result-marks-badge">
                          Marks: <strong>{Number(q.marks_awarded ?? 0)}</strong> / {Number(q.marks)}
                        </span>
                      </div>
                    </div>

                    {hasOptions ? (
                      <div className="sca-result-options-list">
                        {opts.map((o, optIdx) => {
                          const optLetter = String.fromCharCode(65 + optIdx);
                          const selected = selectedIds.has(o.id);
                          const correct = Boolean(o.is_correct);
                          const isStudentCorrectChoice = selected && (q.is_correct === true || Number(q.marks_awarded) > 0);

                          let optClass = 'sca-result-option';
                          if ((showAnswerKey && correct) || isStudentCorrectChoice) {
                            optClass += ' sca-result-option--correct';
                          } else if (selected) {
                            optClass += ' sca-result-option--selected-wrong';
                          }

                          return (
                            <div key={o.id} className={optClass}>
                              <div className="sca-result-option-left">
                                <span className="sca-result-option-letter">{optLetter}</span>
                                <span className="sca-result-option-text">{getOptionText(o.content)}</span>
                              </div>
                              <div className="sca-result-option-right">
                                {showAnswerKey && correct && (
                                  <span className="sca-result-pill-correct">
                                    <FiCheck className="sca-status-icon" /> Correct Answer
                                  </span>
                                )}
                                {selected && (
                                  <span
                                    className={`sca-result-pill-selected ${
                                      (showAnswerKey && correct) || isStudentCorrectChoice
                                        ? 'sca-result-pill-selected--correct'
                                        : 'sca-result-pill-selected--wrong'
                                    }`}
                                  >
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="sca-result-non-mcq-wrap">
                        {showAnswerKey && (
                          <div style={{ color: '#059669' }}>
                            <strong>Correct Answer:</strong> {formatCorrectAnswer(q)}
                          </div>
                        )}
                        <div>
                          <strong>Student Answered:</strong> {formatStudentAnswer(q)}
                        </div>
                      </div>
                    )}

                    {(q as { explanation?: string }).explanation && (
                      <div className="sca-result-explanation">
                        <FiInfo className="sca-result-explanation-icon" />
                        <div>
                          <strong>Explanation:</strong> {(q as { explanation?: string }).explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
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
  const isFirstTimeSession = typeof window !== 'undefined' && sessionStorage.getItem('first_time_login') === 'true';
  const dashboardPath = user ? getDefaultDashboardPath(user.roles) : '/dashboard';
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
          lastName: values.lastName?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
        });
        await refreshUser();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('first_time_login');
          if (user?.id) localStorage.setItem(`onboarded_${user.id}`, 'true');
        }
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
      {isFirstTimeSession && !user.phone && (
        <div
          style={{
            background: 'var(--db-accent-soft, rgba(59, 130, 246, 0.08))',
            border: '1px solid var(--db-border, #e2e8f0)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.875rem',
            color: 'var(--db-text, #1e293b)',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>👋</span>
          <div>
            <strong>Welcome, {user.firstName || 'there'}!</strong>
            <p style={{ margin: 0, color: 'var(--db-muted, #64748b)', fontSize: '0.8125rem' }}>
              Please enter your phone number to complete your profile setup.
            </p>
          </div>
        </div>
      )}
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
            Last Name
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
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="org-form-input"
            placeholder="Enter 10-digit number."
            {...register('phone')}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
            }}
          />
          <FormError message={errors.phone?.message} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '24px', width: '100%', flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="org-add-btn"
          style={{ padding: '9px 36px', fontSize: '0.875rem', borderRadius: '10px' }}
        >
          Update Profile
        </button>
        {(user.phone || isFirstTimeSession) && (
          <Link
            to={dashboardPath}
            className="org-drawer-cancel"
            style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '10px', textDecoration: 'none' }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('first_time_login');
                if (user?.id) localStorage.setItem(`onboarded_${user.id}`, 'true');
              }
            }}
          >
            Continue to Dashboard →
          </Link>
        )}
      </div>
    </form>
  );
}
