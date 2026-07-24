import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
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
import { confirmDelete, showSuccess } from '@/lib/swal';
import { formatDateTime } from '@/utils/dateFormat';
import { normalizePositiveIntInput, parsePositiveIntInput } from '@/utils/positiveIntInput';

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
    (user?.roles.some((r) => ['org_admin', 'super_admin', 'branch_admin'].includes(r)) ?? false);

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
  const [optionCount, setOptionCount] = useState<McqOptionCount>(() => loadQbPrefs().optionCount ?? 4);
  const [optionTexts, setOptionTexts] = useState<string[]>(() => [...DEFAULT_OPTION_TEXTS]);
  const [correct, setCorrect] = useState('1');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [message, setMessage] = useState('');
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
  }, [branches]);

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
    setOpt2('');
    setCorrect('1');
    setQuestionType('mcq');
    setMarksInput(String(loadQbPrefs().marksPerQuestion ?? 1));
    setEditingId(null);
  };

  const clearOptionInputs = () => {
    setOptionTexts([...DEFAULT_OPTION_TEXTS]);
    setOpt1('');
    setOpt2('');
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
        setNewQ(q.content?.text ?? '');
        if (q.department_id) setDepartmentId(q.department_id);
        if (q.subject_id) setSubjectId(q.subject_id);
        if (q.topic_id) setTopicId(q.topic_id);

        const opts = q.options ?? [];
        if (q.type === 'true_false') {
          const trueOpt = opts.find((o) => o.content?.text === 'True');
          setCorrect(trueOpt?.is_correct ? 'true' : 'false');
          setOpt1('');
          setOpt2('');
        } else if (q.type === 'fill_blank' || q.type === 'integer' || q.type === 'numerical') {
          const text = opts[0]?.content?.text;
          const value = opts[0]?.content?.value;
          setOpt1(text != null ? String(text) : value != null ? String(value) : '');
          setOpt2('');
          setCorrect('1');
        } else {
          const count = Math.min(5, Math.max(2, opts.length || 4)) as McqOptionCount;
          setOptionCount(count);
          setOptionTexts(
            Array.from({ length: 5 }, (_, i) => opts[i]?.content?.text ?? ''),
          );
          const correctIdx = opts.findIndex((o) => o.is_correct ?? o.isCorrect);
          setCorrect(String(correctIdx >= 0 ? correctIdx + 1 : 1));
          setOpt1('');
          setOpt2('');
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
        await loadQuestions();
      });
      showSuccess('Deleted!', 'Question has been deleted.');
    } catch (err) {
      setError(parseApiError(err));
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
    const payload = {
      type: questionType,
      content: { text: newQ },
      marks,
      difficulty: 2,
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
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
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
              {questions
                .filter((q) => {
                  const qSearch = questionSearch.trim().toLowerCase();
                  if (!qSearch) return true;
                  return (
                    (q.content?.text ?? '').toLowerCase().includes(qSearch) ||
                    (q.department_name ?? '').toLowerCase().includes(qSearch) ||
                    (q.subject_name ?? '').toLowerCase().includes(qSearch) ||
                    (q.topic_name ?? '').toLowerCase().includes(qSearch) ||
                    (q.type ?? '').toLowerCase().includes(qSearch)
                  );
                })
                .map((q) => (
                <tr key={q.id} className={editingId === q.id ? 'edtp-row--editing' : undefined}>
                  <td>{q.content?.text ?? '—'}</td>
                  <td>{q.department_name ?? '—'}</td>
                  <td>{q.subject_name ?? '—'}</td>
                  <td>{q.topic_name ?? '—'}</td>
                  <td><span className="edtp-badge edtp-badge--role">{q.type}</span></td>
                  <td>{q.status}</td>
                  <td>
                    <EdtpRowActions>
                      <EdtpBtn variant="secondary" onClick={() => void handleEdit(q.id)}>
                        Edit
                      </EdtpBtn>
                      <EdtpBtn variant="danger" onClick={() => void handleDelete(q.id)}>
                        Delete
                      </EdtpBtn>
                    </EdtpRowActions>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={7}>No questions yet. Select department → subject → topic and add your first question.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
    await withLoader(async () => {
      try {
        await examinationService.publishTest(id);
        showSuccess('Published', 'Test is now live.');
        load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const startEdit = (t: ExamTest) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDuration(String(t.duration_minutes ?? 60));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const duration = parsePositiveIntInput(editDuration);
    if (duration == null || duration < 1) {
      setError('Duration must be at least 1 minute.');
      return;
    }
    setError('');
    await withLoader(async () => {
      try {
        await examinationService.updateTest(editingId, {
          title: editTitle.trim(),
          durationMinutes: duration,
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
      status === 'live' ? 'edtp-badge--active' : status === 'draft' ? 'edtp-badge--role' : 'edtp-badge--inactive';
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
          <Link to="/dashboard/create-test" className="default__button small-btn">+ Create Test</Link>
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
                      {t.status === 'draft' && (
                        <>
                          <Link
                            to={`/dashboard/test-builder/${t.id}`}
                            className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                          >
                            Build
                          </Link>
                          <EdtpBtn variant="success" onClick={() => publish(t.id)}>
                            Publish
                          </EdtpBtn>
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

  useEffect(() => {
    setPageLoading(true);
    examinationService
      .listMyAssignedTests()
      .then(setTests)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setPageLoading(false));
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
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setStartingId(null);
    }
  };

  const resume = (t: ExamTest) => {
    if (t.attempt_id) navigate(`/dashboard/exam/${t.id}/attempt/${t.attempt_id}`);
  };

  const statusMeta = (t: ExamTest) => {
    const st = t.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted') {
      return { label: 'Completed', cls: 'edtp-badge--active' };
    }
    if (st === 'in_progress') {
      return { label: 'In progress', cls: 'edtp-badge--role' };
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
    return (
      <EdtpBtn
        variant="primary"
        size="md"
        disabled={loading}
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
          passingMarks: 40,
          instructions: 'Read all questions carefully. Do not switch tabs during the exam.',
          config: {
            departmentId: values.departmentId,
            departmentName: dept?.name,
            subjectId: values.subjectId,
            subjectName: subject?.name,
            topicId: values.topicId,
            topicName: topic?.name,
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
            <div className="col-12">
              <label htmlFor="aboutExam">Description (optional)</label>
              <textarea id="aboutExam" rows={3} className={inputClassName('register__input', !!errors.description)} {...register('description')} />
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

export function ExamResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    examinationService
      .getResult(attemptId)
      .then(setResult)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useDashboardLoadingEffect(loading);

  if (error) return <p className="login__error">{error}</p>;
  if (!result) return null;

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Result — {result.test_title}</h4>
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
      <Link className="default__button" to="/dashboard/student-reviews">
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
