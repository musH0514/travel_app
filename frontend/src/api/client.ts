// ========== TripWise API 客户端 ==========
// 基于 fetch 的轻量级 API 请求封装

import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';

// 自定义 API 错误类
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 请求配置类型
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  timeout?: number;
}

// 获取存储的 JWT Token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// 构建完整 URL
function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// 核心请求方法
async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, params, timeout = 30000 } = config;

  // 构建 URL
  const url = buildUrl(path, params);

  // 设置请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // 添加认证 Token
  const token = getAuthToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 处理 401 未授权 - 清除 Token 并跳转
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      if (typeof window !== 'undefined') {
        window.location.href = '/profile';
      }
      throw new ApiError('登录已过期，请重新登录', 401);
    }

    // 解析响应
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.detail || `请求失败 (${response.status})`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    // 网络错误处理
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError('网络连接失败，请检查网络设置', 0);
    }

    // 超时错误
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('请求超时，请稍后重试', 0);
    }

    throw new ApiError('请求发生未知错误', 0, error);
  }
}

// 导出便捷方法
export const api = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'GET' }),

  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'PUT', body }),

  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'DELETE' }),
};

export default api;
