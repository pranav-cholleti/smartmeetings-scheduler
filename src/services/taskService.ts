
import api from './api';
import { 
  Task, 
  TasksResponse, 
  CreateTaskData, 
  UpdateTaskData 
} from '../types';

export const taskService = {
  // Create a new task
  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data.data;
  },

  // Get tasks assigned to the current user
  async getAssignedTasks(
    page = 1, 
    limit = 10, 
    search?: string, 
    sortBy: string = 'priority', 
    sortOrder: string = 'asc', 
    filter?: string
  ): Promise<TasksResponse> {
    const response = await api.get('/tasks/assigned', {
      params: { page, limit, search, sortBy, sortOrder, filter }
    });
    return response.data.data;
  },

  // Get tasks scheduled by the current user (as host)
  async getScheduledTasks(
    page = 1, 
    limit = 10, 
    search?: string, 
    sortBy: string = 'priority', 
    sortOrder: string = 'asc', 
    filter?: string
  ): Promise<TasksResponse> {
    const response = await api.get('/tasks/scheduled', {
      params: { page, limit, search, sortBy, sortOrder, filter }
    });
    return response.data.data;
  },

  // Update a task
  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.data;
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<{taskId: string}> {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data.data;
  },

  // Get users in same organisation
  async getOrganisationUsers(search?: string): Promise<{userId: string, name: string, email: string}[]> {
    const response = await api.get('/users/organisation', {
      params: { search }
    });
    return response.data.data;
  }
};

export default taskService;
