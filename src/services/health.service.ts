import api from '@/lib/api';

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  timestamp: string;
  services?: { database: string };
}

export async function checkHealth(): Promise<HealthCheckResponse> {
  const { data } = await api.get<HealthCheckResponse>('/health');
  return data;
}
