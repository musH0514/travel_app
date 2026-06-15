// ========== 天气 API ==========

import api from './client';
import type { WeatherForecast, WeatherAlert, Itinerary } from '@/utils/types';

// 获取天气预报
export async function getWeatherForecast(
  location: { lat: number; lng: number },
  dates: { start: string; end: string }
): Promise<WeatherForecast[]> {
  return api.get('/api/weather/forecast', {
    params: {
      lat: location.lat,
      lng: location.lng,
      start: dates.start,
      end: dates.end,
    } as Record<string, string | number | undefined>,
  });
}

// 获取天气预警
export async function getWeatherAlert(
  location: { lat: number; lng: number }
): Promise<WeatherAlert[]> {
  return api.get('/api/weather/alert', {
    params: {
      lat: location.lat,
      lng: location.lng,
    } as Record<string, string | number | undefined>,
  });
}

// 根据天气情况获取备选方案
export async function getBackupPlan(
  weatherCondition: string,
  originalPlan: Itinerary
): Promise<Itinerary> {
  return api.post('/api/weather/backup-plan', {
    weatherCondition,
    originalPlan,
  });
}
