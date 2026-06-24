import api from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    preferences: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string;
  };
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  preferences: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  return api.post('/api/auth/login', data);
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  return api.post('/api/auth/register', data);
}

export async function getCurrentUser(): Promise<UserResponse> {
  return api.get('/api/auth/me');
}

export async function updateProfile(data: Partial<UserResponse>): Promise<UserResponse> {
  return api.put('/api/auth/me', data);
}
