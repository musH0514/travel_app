import type { TripPlan, Destination, Itinerary, ItineraryDay, ItineraryItem, Budget, WeatherForecast, WeatherAlert } from './types';

const CATEGORY_MAP: Record<string, string> = {
  '自然风光': 'natural',
  '人文历史': 'culture',
  '美食购物': 'food',
  '主题乐园': 'shopping',
  '城市地标': 'shopping',
  '住宿': 'shopping',
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
  'natural': '自然风光',
  'culture': '人文历史',
  'food': '美食购物',
  'shopping': '美食购物',
};

const TIME_SLOT_MAP: Record<string, string> = {
  '08:00': '上午',
  '13:00': '下午',
  '18:00': '晚上',
  '10:00': '上午',
};

function getTimeSlot(startTime: string | null): string {
  if (!startTime) return '上午';
  const hour = startTime.slice(0, 5);
  if (hour >= '18:00') return '晚上';
  if (hour >= '13:00') return '下午';
  return '上午';
}

function getTransportMode(mode: string | null): '自驾' | '公交' | '步行' | '打车' | '地铁' {
  const validModes = ['自驾', '公交', '步行', '打车', '地铁'] as const;
  if (mode && validModes.includes(mode as typeof validModes[number])) {
    return mode as typeof validModes[number];
  }
  return '步行';
}

export function adaptTrip(backendTrip: Record<string, unknown>): TripPlan {
  const destinations = (backendTrip.destinations as Array<Record<string, unknown>> | null) || [];
  const totalBudget = backendTrip.total_budget as Record<string, number> | null;
  const preferences = backendTrip.preferences as Record<string, string> | null;
  const status = backendTrip.status as string;

  const statusMap: Record<string, 'ongoing' | 'planned' | 'completed'> = {
    'draft': 'planned',
    'planning': 'planned',
    'confirmed': 'ongoing',
    'ongoing': 'ongoing',
    'completed': 'completed',
  };

  return {
    id: backendTrip.id as string,
    userId: backendTrip.user_id as string,
    destinations: destinations.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      name: d.name as string,
      description: d.description as string || '',
      location: (d.location as { lat: number; lng: number }) || { lat: 0, lng: 0 },
      images: d.images as string[] || [],
      category: d.category as string || '',
      rating: (d.rating as number) || 0,
      price: (d.price as number) || (d.budget_per_person as number) || 0,
      tags: d.tags as string[] || [],
      duration: (d.duration as number) || (d.suggested_duration as number) || 0,
    })),
    startDate: backendTrip.start_date as string,
    endDate: backendTrip.end_date as string,
    budget: {
      total: totalBudget?.total || 0,
      transport: totalBudget?.transport || 0,
      accommodation: totalBudget?.accommodation || 0,
      food: totalBudget?.food || 0,
      tickets: totalBudget?.tickets || 0,
      other: totalBudget?.other || 0,
    },
    preferences: {
      style: (preferences?.style as TripPlan['preferences']['style']) || '休闲度假',
      budgetLevel: (preferences?.budgetLevel as TripPlan['preferences']['budgetLevel']) || '舒适型',
    },
    weatherConcerns: [],
    status: statusMap[status] || 'planned',
    createdAt: backendTrip.created_at as string,
    updatedAt: backendTrip.updated_at as string,
  };
}

export function adaptDestination(backendDest: Record<string, unknown>): Destination {
  const categoryMap: Record<string, string> = {
    '自然风光': 'natural',
    '人文历史': 'culture',
    '美食购物': 'food',
    '主题乐园': 'shopping',
    '城市地标': 'shopping',
    '住宿': 'shopping',
  };

  return {
    id: backendDest.id as string,
    name: backendDest.name as string,
    description: backendDest.description as string || '',
    location: (backendDest.location as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    images: (backendDest.images as string[]) || [],
    category: categoryMap[(backendDest.category as string)] || (backendDest.category as string) || '',
    rating: (backendDest.rating as number) || 0,
    price: (backendDest.budget_per_person as number) || 0,
    tags: (backendDest.tags as string[]) || [],
    duration: (backendDest.suggested_duration as number) || 2,
  };
}

export function adaptItinerary(
  tripId: string,
  items: Array<Record<string, unknown>>
): Itinerary {
  const dayMap = new Map<number, ItineraryDay>();

  for (const item of items) {
    const dayNumber = item.day_number as number;
    if (!dayMap.has(dayNumber)) {
      dayMap.set(dayNumber, {
        date: '',
        dayNumber,
        items: [],
      });
    }

    const startTime = item.start_time as string | null;
    const endTime = item.end_time as string | null;
    const transportDetail = item.transport_detail as Record<string, unknown> | null;

    const itineraryItem: ItineraryItem = {
      day: dayNumber,
      timeSlot: getTimeSlot(startTime),
      destination: {
        id: item.destination_id as string || '',
        name: '',
        description: '',
        location: { lat: 0, lng: 0 },
        images: [],
        category: '',
        rating: 0,
        price: 0,
        tags: [],
        duration: 0,
      },
      activity: item.notes as string || item.activity_type as string || '',
      transport: {
        mode: getTransportMode(item.transport_mode as string | null),
        duration: (transportDetail?.duration as number) || 0,
        cost: (transportDetail?.cost as number) || 0,
        route: (transportDetail?.route as string) || '',
      },
      estimatedCost: (item.estimated_cost as number) || 0,
    };

    dayMap.get(dayNumber)!.items.push(itineraryItem);

    if (!dayMap.get(dayNumber)!.date && startTime) {
      dayMap.get(dayNumber)!.date = startTime.slice(0, 10);
    }
  }

  const sortedDays = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, day]) => day);

  const day1Date = sortedDays[0]?.date || '';
  const tripStartDate = day1Date;

  return {
    tripId,
    version: 'sunny',
    days: sortedDays.map((day, idx) => ({
      ...day,
      date: day.date || (tripStartDate ? new Date(new Date(tripStartDate).getTime() + (day.dayNumber - 1) * 86400000).toISOString().slice(0, 10) : ''),
    })),
  };
}

export function adaptWeatherForecast(backendData: Array<Record<string, unknown>>): WeatherForecast[] {
  if (!Array.isArray(backendData)) return [];
  return backendData.map((d) => ({
    date: d.fxDate as string || d.date as string || '',
    condition: d.textDay as string || d.condition as string || 'sunny',
    temp: (d.tempMax as number) || (d.temp as number) || 0,
    high: (d.tempMax as number) || 0,
    low: (d.tempMin as number) || 0,
    humidity: (d.humidity as number) || 0,
    windSpeed: (d.windSpeed as number) || 0,
    icon: d.iconDay as string || d.icon as string || 'sunny',
  }));
}

export function adaptWeatherAlert(backendData: unknown): WeatherAlert[] {
  if (!backendData || typeof backendData !== 'object') return [];
  const data = backendData as Record<string, unknown>;
  const alerts = data.alerts as Array<Record<string, unknown>> | null;
  if (!Array.isArray(alerts)) return [];
  return alerts.map((a) => ({
    type: a.type as string || '未知',
    severity: (a.severity as WeatherAlert['severity']) || 'yellow',
    message: a.message as string || a.text as string || '',
    date: a.date as string || '',
  }));
}
