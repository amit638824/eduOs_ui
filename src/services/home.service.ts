import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { HomepageContent } from '@/types/homepage';

export async function getHomepage(): Promise<HomepageContent> {
  const { data } = await api.get<ApiResponse<HomepageContent>>('/public/home', { skipToast: true });
  return data.data;
}
