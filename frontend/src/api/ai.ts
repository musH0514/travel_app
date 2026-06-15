// ========== AI 服务 API ==========
// 调用后端 AI 服务进行智能行程规划

import api from './client';
import type { AiPlanRequest, AiPlanResponse, Itinerary, LuggageSuggestion, Restaurant } from '@/utils/types';

// AI 生成完整行程方案
export async function generateTripPlan(
  preferences: AiPlanRequest
): Promise<AiPlanResponse> {
  return api.post('/api/ai/generate-plan', preferences);
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
  return api.post(`/api/ai/optimize`, { tripId, constraints });
}

// AI 生成行李建议
export async function getLuggageSuggestions(
  destination: string,
  weather: string,
  duration: number
): Promise<LuggageSuggestion[]> {
  return api.post('/api/ai/luggage-suggestions', {
    destination,
    weather,
    duration,
  });
}

// AI 推荐沿途美食
export async function getFoodRecommendations(
  tripId: string
): Promise<Restaurant[]> {
  return api.post('/api/ai/food-recommendations', { tripId });
}
