// ========== AI 服务 API ==========
// 调用后端 AI 服务进行智能行程规划

import api from './client';
import type { AiPlanRequest, AiPlanResponse, Itinerary, LuggageSuggestion, Restaurant } from '@/utils/types';

/** 端到端规划响应（落库后返回 trip_id） */
export interface PlanTripResponse {
  trip_id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_budget?: Record<string, number>;
  preferences?: Record<string, unknown>;
  weather?: Record<string, unknown>;
  tips?: string[];
  is_mock?: boolean;
  itinerary?: Array<Record<string, unknown>>;
  destinations?: Array<Record<string, unknown>>;
  status?: string;
}

export interface PlanTripRequest {
  city?: string;
  destinations?: string[];
  start_date: string;
  end_date: string;
  styles: string[];
  budget_level: string;
  special_requirements?: string;
}

/**
 * 创建行程页「开始规划」：天气 → LLM → 地图 → 落库
 * 超时加长，因链路含 LLM + 多个第三方 API
 */
export async function planTrip(payload: PlanTripRequest): Promise<PlanTripResponse> {
  return api.post('/api/ai/plan-trip', payload, { timeout: 120000 });
}

// AI 生成完整行程方案（旧接口，不落库）
export async function generateTripPlan(
  preferences: AiPlanRequest
): Promise<AiPlanResponse> {
  return api.post('/api/ai/generate-plan', {
    preferences: {
      styles: preferences.styles,
      budgetLevel: preferences.budgetLevel,
      specialRequirements: preferences.specialRequirements,
      startDate: preferences.startDate,
      endDate: preferences.endDate,
    },
    destinations: preferences.destinations.map((name) => ({ name })),
  }, { timeout: 120000 });
}

// AI 优化现有行程（根据约束条件）
export async function optimizeItinerary(
  tripId: string,
  constraints: {
    timeEfficiency?: boolean;
    costEfficiency?: boolean;
    weatherAvoidance?: boolean;
  }
): Promise<Itinerary> {
  return api.post(`/api/ai/optimize`, { trip_id: tripId, constraints });
}

// AI 生成行李建议
export async function getLuggageSuggestions(
  destination: string,
  weather: string,
  duration: number
): Promise<LuggageSuggestion[]> {
  return api.post('/api/ai/luggage-suggestions', {
    destination,
    weather_forecast: { summary: weather },
    duration,
  });
}

// AI 推荐沿途美食
export async function getFoodRecommendations(
  tripId: string
): Promise<Restaurant[]> {
  return api.post('/api/ai/food-recommendations', { trip_id: tripId });
}
