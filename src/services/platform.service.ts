import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const base = '/platform';

export interface Notification {
  id: string;
  channel: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: string;
  currency: string;
  status: string;
  gateway_ref?: string;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  roles: string[];
  created_at: string;
}

export interface Department {
  id: string;
  branch_id: string;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  user_email?: string;
  created_at: string;
}

export interface OrgSetting {
  id: string;
  key: string;
  value: unknown;
}

export async function listNotifications(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<Notification>>(`${base}/notifications`, {
    params: { page, limit },
  });
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<ApiResponse<unknown>>(`${base}/notifications/${id}/read`);
  return data.data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post<ApiResponse<unknown>>(`${base}/notifications/read-all`);
  return data.data;
}

export async function getUnreadCount() {
  const { data } = await api.get<ApiResponse<{ count: number }>>(`${base}/notifications/unread-count`);
  return data.data.count;
}

export async function listPayments(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<Payment>>(`${base}/payments`, {
    params: { page, limit },
  });
  return data;
}

export async function getWallet() {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`${base}/payments/wallet`);
  return data.data;
}

export interface PaymentConfig {
  razorpayKeyId: string | null;
  currency: string;
  gateway: 'razorpay' | 'demo';
}

export interface RazorpayOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function getPaymentConfig() {
  const { data } = await api.get<ApiResponse<PaymentConfig>>(`${base}/payments/config`);
  return data.data;
}

export async function createRazorpayOrder(amount: number) {
  const { data } = await api.post<ApiResponse<RazorpayOrder>>(`${base}/payments/create-order`, {
    amount,
  });
  return data.data;
}

export async function verifyRazorpayPayment(input: {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { data } = await api.post<ApiResponse<unknown>>(`${base}/payments/verify`, input);
  return data.data;
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const { data } = await api.get<PaginatedResponse<PlatformUser>>(`${base}/users`, {
    params: { page, limit, search },
  });
  return data;
}

export async function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'student' | 'teacher' | 'org_admin';
}) {
  const { data } = await api.post<ApiResponse<PlatformUser>>(`${base}/users`, input);
  return data.data;
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
  const { data } = await api.patch<ApiResponse<unknown>>(`${base}/users/${userId}/status`, { status });
  return data.data;
}

export async function listDepartments(branchId: string, page = 1, limit = 50) {
  const { data } = await api.get<PaginatedResponse<Department>>(
    `${base}/branches/${branchId}/departments`,
    { params: { page, limit } },
  );
  return data;
}

export async function createDepartment(branchId: string, input: { name: string; code?: string }) {
  const { data } = await api.post<ApiResponse<Department>>(
    `${base}/branches/${branchId}/departments`,
    input,
  );
  return data.data;
}

export async function listAcademicSessions(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<AcademicSession>>(`${base}/academic-sessions`, {
    params: { page, limit },
  });
  return data;
}

export async function createAcademicSession(input: {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) {
  const { data } = await api.post<ApiResponse<AcademicSession>>(`${base}/academic-sessions`, input);
  return data.data;
}

export async function getSettings(keys?: string[]) {
  const { data } = await api.get<ApiResponse<OrgSetting[]>>(`${base}/settings`, {
    params: keys ? { keys: keys.join(',') } : undefined,
  });
  return data.data;
}

export async function upsertSetting(key: string, value: unknown) {
  const { data } = await api.put<ApiResponse<OrgSetting>>(`${base}/settings`, { key, value });
  return data.data;
}

export async function listAuditLogs(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<AuditLog>>(`${base}/audit-logs`, {
    params: { page, limit },
  });
  return data;
}

export async function listSessions() {
  const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>(`/auth/sessions`);
  return data.data;
}

export async function revokeSession(id: string) {
  const { data } = await api.delete<ApiResponse<unknown>>(`/auth/sessions/${id}`);
  return data.data;
}

export async function getOrgOverviewReport() {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`${base}/reports/overview`);
  return data.data;
}

export async function getTestReport(testId: string) {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
    `${base}/reports/tests/${testId}`,
  );
  return data.data;
}

export async function exportTestReport(testId: string) {
  const response = await api.get(`${base}/reports/tests/${testId}/export`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}

export async function enableMfa() {
  const { data } = await api.post<ApiResponse<{ mfaEnabled: boolean; devBackupCode?: string }>>(
    `/auth/mfa/enable`,
  );
  return data.data;
}

export async function disableMfa() {
  const { data } = await api.post<ApiResponse<unknown>>(`/auth/mfa/disable`);
  return data.data;
}
