
import api from './api';
import { User } from '../types';

export const userService = {
  /**
   * Search users in the same organization
   * @param search Search term
   * @param limit Maximum number of results to return
   */
  async searchUsers(search: string, limit: number = 10): Promise<User[]> {
    const response = await api.get('/users/organisation', {
      params: { search, limit }
    });
    return response.data.data;
  },
  
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data;
  },
  
  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', userData);
    return response.data.data;
  },
  
  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    email: boolean;
    meetingReminders: boolean;
    taskDeadlineReminders: boolean;
    aiInsights: boolean;
  }): Promise<{ success: boolean }> {
    const response = await api.put('/users/me/notification-preferences', preferences);
    return response.data;
  },
  
  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<{
    email: boolean;
    meetingReminders: boolean;
    taskDeadlineReminders: boolean;
    aiInsights: boolean;
  }> {
    const response = await api.get('/users/me/notification-preferences');
    return response.data.data;
  },
};

export default userService;
