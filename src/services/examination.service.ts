import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  AttemptQuestion,
  CreateQuestionInput,
  CreateTestInput,
  ExamResult,
  ExamTest,
  OrgAnalytics,
  Question,
  Subject,
  TestAttempt,
} from '@/types/examination';

const base = '/examination';

export async function getAnalyticsOverview(): Promise<OrgAnalytics> {
  const { data } = await api.get<ApiResponse<OrgAnalytics>>(`${base}/analytics/overview`);
  return data.data;
}

export async function listSubjects(page = 1, limit = 50) {
  const { data } = await api.get<PaginatedResponse<Subject>>(`${base}/subjects`, {
    params: { page, limit },
  });
  return data;
}

export async function listQuestions(page = 1, limit = 20, status?: string) {
  const { data } = await api.get<PaginatedResponse<Question>>(`${base}/questions`, {
    params: { page, limit, status },
  });
  return data;
}

export async function createQuestion(input: CreateQuestionInput) {
  const { data } = await api.post<ApiResponse<Question>>(`${base}/questions`, input);
  return data.data;
}

export async function approveQuestion(id: string) {
  const { data } = await api.post<ApiResponse<Question>>(`${base}/questions/${id}/approve`);
  return data.data;
}

export async function listTests(page = 1, limit = 20, status?: string) {
  const { data } = await api.get<PaginatedResponse<ExamTest>>(`${base}/tests`, {
    params: { page, limit, status },
  });
  return data;
}

export async function listMyAssignedTests() {
  const { data } = await api.get<ApiResponse<ExamTest[]>>(`${base}/tests/my`);
  return data.data;
}

export async function getTest(id: string) {
  const { data } = await api.get<ApiResponse<ExamTest & { sections?: unknown[]; questions?: unknown[] }>>(
    `${base}/tests/${id}`,
  );
  return data.data;
}

export async function updateTest(id: string, input: Partial<CreateTestInput & { status?: string }>) {
  const { data } = await api.patch<ApiResponse<ExamTest>>(`${base}/tests/${id}`, input);
  return data.data;
}

export async function addTestSection(testId: string, name: string) {
  const { data } = await api.post<ApiResponse<unknown>>(`${base}/tests/${testId}/sections`, { name });
  return data.data;
}

export async function addQuestionToTest(testId: string, questionId: string) {
  const { data } = await api.post<ApiResponse<unknown>>(`${base}/tests/${testId}/questions`, {
    questionId,
  });
  return data.data;
}

export async function createTest(input: CreateTestInput) {
  const { data } = await api.post<ApiResponse<ExamTest>>(`${base}/tests`, input);
  return data.data;
}

export async function publishTest(id: string) {
  const { data } = await api.post<ApiResponse<ExamTest>>(`${base}/tests/${id}/publish`);
  return data.data;
}

export async function startAttempt(testId: string) {
  const { data } = await api.post<ApiResponse<TestAttempt>>(`${base}/tests/${testId}/start`);
  return data.data;
}

export async function getAttempt(attemptId: string) {
  const { data } = await api.get<
    ApiResponse<TestAttempt & { questions: AttemptQuestion[]; duration_minutes: number }>
  >(`${base}/attempts/${attemptId}`);
  return data.data;
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  answer: Record<string, unknown>,
) {
  const { data } = await api.post<ApiResponse<unknown>>(`${base}/attempts/${attemptId}/answers`, {
    questionId,
    answer,
  });
  return data.data;
}

export async function submitAttempt(attemptId: string, autoSubmit = false) {
  const { data } = await api.post<ApiResponse<ExamResult>>(`${base}/attempts/${attemptId}/submit`, {
    autoSubmit,
  });
  return data.data;
}

export async function logProctoringEvent(
  attemptId: string,
  event: string,
  detail?: Record<string, unknown>,
) {
  const { data } = await api.post<ApiResponse<{ tab_switch_count: number }>>(
    `${base}/attempts/${attemptId}/proctoring`,
    { event, detail },
  );
  return data.data;
}

export async function getMyStats() {
  const { data } = await api.get<ApiResponse<import('@/types/examination').StudentStats>>(
    `${base}/stats/my`,
  );
  return data.data;
}

export async function listAttempts(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<TestAttempt>>(`${base}/attempts`, {
    params: { page, limit },
  });
  return data;
}

export async function listMyResults() {
  const { data } = await api.get<ApiResponse<ExamResult[]>>(`${base}/results/my`);
  return data.data;
}

export async function getResult(attemptId: string) {
  const { data } = await api.get<ApiResponse<ExamResult>>(`${base}/results/${attemptId}`);
  return data.data;
}

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  const { data } = await api.patch<ApiResponse<unknown>>('/users/me', input);
  return data.data;
}
