// ========== 行程 API ==========

import api from './client';
import type { TripPlan, Itinerary, TripPreferences } from '@/utils/types';

// 创建新行程
export async function createTripPlan(plan: {
  destinations: string[];
  startDate: string;
  endDate: string;
  preferences: TripPreferences;
}): Promise<TripPlan> {
  return api.post('/api/trips', plan);
}

// 获取所有行程列表
export async function getTripPlans(): Promise<TripPlan[]> {
  return api.get('/api/trips');
}

// 根据 ID 获取行程详情
export async function getTripPlanById(id: string): Promise<TripPlan> {
  return api.get(`/api/trips/${id}`);
}

// 更新行程
export async function updateTripPlan(
  id: string,
  plan: Partial<TripPlan>
): Promise<TripPlan> {
  return api.put(`/api/trips/${id}`, plan);
}

// 删除行程
export async function deleteTripPlan(id: string): Promise<void> {
  return api.delete(`/api/trips/${id}`);
}

// 获取行程的详细日程
export async function getItinerary(tripId: string): Promise<Itinerary> {
  return api.get(`/api/trips/${tripId}/itinerary`);
}

// 比较行程的两个版本（多云版 vs 下雨版）
export async function compareTripVersions(
  tripId: string,
  versionA: 'sunny' | 'rainy',
  versionB: 'sunny' | 'rainy'
): Promise<{ versionA: Itinerary; versionB: Itinerary }> {
  return api.get(`/api/trips/${tripId}/compare`, {
    params: { versionA, versionB } as Record<string, string | number | undefined>,
  });
}
