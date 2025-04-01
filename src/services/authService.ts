
import api from './api';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

const AUTH_TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  async login(data: LoginData): Promise<void> {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data.data;
    
    // Store auth information
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/users/me');
      const user = response.data.data;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  },

  getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default authService;
