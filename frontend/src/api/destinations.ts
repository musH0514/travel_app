// ========== 目的地 API ==========

import api from './client';
import type { Destination } from '@/utils/types';

// 获取目的地列表
export async function getDestinations(params?: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: Destination[]; total: number }> {
  return api.get('/api/destinations', { params: params as Record<string, string | number | undefined> });
}

// 根据 ID 获取目的地详情
export async function getDestinationById(id: string): Promise<Destination> {
  return api.get(`/api/destinations/${id}`);
}

// 搜索目的地
export async function searchDestinations(query: string): Promise<Destination[]> {
  return api.get('/api/destinations/search', { params: { q: query } });
}

// 获取推荐目的地（基于用户偏好）
export async function getRecommendedDestinations(
  preferences: {
    style?: string;
    budgetLevel?: string;
    weatherPreference?: string;
  }
): Promise<Destination[]> {
  return api.post('/api/destinations/recommend', preferences);
}
