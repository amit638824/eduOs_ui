export type QuestionType =
  | 'mcq'
  | 'msq'
  | 'true_false'
  | 'fill_blank'
  | 'integer'
  | 'numerical'
  | 'assertion_reason'
  | 'match_following'
  | 'matrix_match'
  | 'paragraph'
  | 'case_study'
  | 'subjective';

export type TestStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled' | 'archived';

export interface Subject {
  id: string;
  name: string;
  code?: string | null;
  language: string;
  department_id?: string | null;
}

export interface QuestionOption {
  id: string;
  content: { text?: string };
  is_correct?: boolean;
  isCorrect?: boolean;
  sort_order?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  status: string;
  content: { text?: string };
  marks: number;
  difficulty?: number | null;
  topic_id?: string | null;
  subject_id?: string | null;
  department_id?: string | null;
  topic_name?: string | null;
  subject_name?: string | null;
  department_name?: string | null;
  options?: QuestionOption[];
}

export interface ExamTest {
  id: string;
  title: string;
  description?: string | null;
  status: TestStatus;
  duration_minutes: number;
  passing_marks?: number | null;
  total_marks?: number | null;
  instructions?: string | null;
  config?: Record<string, unknown> | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  attempt_id?: string | null;
  attempt_status?: string | null;
  attempt_submitted_at?: string | null;
  result_attempt_id?: string | null;
  result_percentage?: number | null;
}

export interface ExamSecurityConfig {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  negativeMarking: boolean;
  fullScreen: boolean;
  browserLock: boolean;
  blockCopyPaste: boolean;
  autoSubmit: boolean;
  allowResume: boolean;
  maxTabSwitches: number;
  releaseAnswers: boolean;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  status: string;
  started_at: string;
  submitted_at?: string | null;
  test_title?: string;
  total_score?: number | null;
  max_score?: number | null;
  percentage?: number | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  result_attempt_id?: string | null;
  instructions?: string | null;
  config?: ExamSecurityConfig;
  remaining_seconds?: number;
  ends_at?: string;
  tab_switch_count?: number;
  duration_minutes?: number;
  passing_marks?: number | null;
}

export interface AttemptQuestion {
  question_id: string;
  type: QuestionType;
  content: { text?: string };
  marks: number;
  sort_order: number;
  answer?: { selectedOptionIds?: string[]; text?: string; value?: number } | null;
  options: QuestionOption[];
}

export interface ExamResultQuestion {
  question_id: string;
  type: QuestionType | string;
  content?: { text?: string } | string;
  marks: number | string;
  answer?: {
    selectedOptionIds?: string[];
    text?: string;
    value?: number | string;
  } | null;
  is_correct?: boolean | null;
  marks_awarded?: number | string | null;
  options?: {
    id: string;
    content?: { text?: string; value?: number };
    is_correct?: boolean;
    sort_order?: number;
  }[];
}

export interface ExamResult {
  id: string;
  attempt_id: string;
  test_id: string;
  student_id?: string;
  test_title?: string;
  first_name?: string;
  last_name?: string;
  total_score: number;
  max_score: number;
  percentage: number;
  accuracy?: number | null;
  rank?: number | null;
  percentile?: number | null;
  passing_marks?: number | null;
  created_at: string;
  answers_released?: boolean;
  release_answers?: boolean;
  questions?: ExamResultQuestion[];
}

export interface OrgAnalytics {
  students: number;
  teachers: number;
  questions: number;
  tests: number;
  attempts: number;
  results: number;
  branches: number;
  assignments?: number;
  certificates_issued?: number;
  pass_rate?: number;
  score_distribution?: {
    below_40: number;
    from_40_60: number;
    from_60_80: number;
    above_80: number;
  };
  recent_tests?: {
    id: string;
    title: string;
    status: string;
    attempt_count: number;
    result_count: number;
    avg_percentage: number;
  }[];
}

export interface StudentStats {
  assigned_tests: number;
  attempts: number;
  results: number;
  in_progress: number;
  certificates_count?: number;
}

export interface CreateQuestionInput {
  type: QuestionType;
  content: { text: string };
  explanation?: string;
  marks?: number;
  negativeMarks?: number;
  difficulty?: number;
  topicId: string;
  options?: { content: { text?: string; value?: number }; isCorrect: boolean }[];
}

export interface CreateTestInput {
  title: string;
  description?: string;
  durationMinutes?: number;
  passingMarks?: number;
  instructions?: string;
  config?: Record<string, unknown>;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  sort_order?: number;
}

export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  difficulty?: number | null;
}
