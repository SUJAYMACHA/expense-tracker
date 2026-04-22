import api from './client';

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
    };
  };
}

export const authAPI = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () =>
    api.get('/user/me'),
};
