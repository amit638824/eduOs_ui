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
  published_at?: string | null;
  scheduled_at?: string | null;
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

export interface ExamResult {
  id: string;
  attempt_id: string;
  test_id: string;
  test_title?: string;
  total_score: number;
  max_score: number;
  percentage: number;
  accuracy?: number | null;
  rank?: number | null;
  percentile?: number | null;
  created_at: string;
}

export interface OrgAnalytics {
  students: number;
  teachers: number;
  questions: number;
  tests: number;
  attempts: number;
  results: number;
  branches: number;
}

export interface CreateQuestionInput {
  type: QuestionType;
  content: { text: string };
  explanation?: string;
  marks?: number;
  difficulty?: number;
  options?: { content: { text?: string; value?: number }; isCorrect: boolean }[];
}

export interface CreateTestInput {
  title: string;
  description?: string;
  durationMinutes?: number;
  passingMarks?: number;
  instructions?: string;
}
