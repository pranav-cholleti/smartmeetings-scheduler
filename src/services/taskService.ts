
import api from "./api";
import { Task, TasksResponse } from "../types";

export const taskService = {
  // Get tasks assigned to current user
  async getAssignedTasks(
    page = 1, 
    limit = 10,
    search?: string,
    sortBy = "priority",
    sortOrder = "asc",
    filter?: string
  ): Promise<TasksResponse> {
    const params = { page, limit, search, sortBy, sortOrder, filter };
    const response = await api.get<{ success: boolean; data: TasksResponse }>(
      "/tasks/assigned",
      { params }
    );
    return response.data.data;
  },
  
  // Get tasks scheduled by current user as host
  async getScheduledTasks(
    page = 1, 
    limit = 10,
    search?: string,
    sortBy = "priority",
    sortOrder = "asc",
    filter?: string
  ): Promise<TasksResponse> {
    const params = { page, limit, search, sortBy, sortOrder, filter };
    const response = await api.get<{ success: boolean; data: TasksResponse }>(
      "/tasks/scheduled",
      { params }
    );
    return response.data.data;
  },
  
  // Create a new task
  async createTask(data: {
    meetingId: string;
    taskName: string;
    assignees: string[];
    deadline: string;
    priority: number;
    additionalComments?: string;
  }): Promise<Task> {
    const response = await api.post<{ success: boolean; data: Task }>(
      "/tasks",
      data
    );
    return response.data.data;
  },
  
  // Update an existing task
  async updateTask(
    taskId: string,
    data: {
      taskName?: string;
      assignees?: string[];
      deadline?: string;
      priority?: number;
      progress?: "Not Started" | "In Progress" | "Completed" | "Blocked";
      additionalComments?: string;
    }
  ): Promise<Task> {
    const response = await api.put<{ success: boolean; data: Task }>(
      `/tasks/${taskId}`,
      data
    );
    return response.data.data;
  },
  
  // Update task progress (for assignees)
  async updateTaskProgress(
    taskId: string,
    progress: "Not Started" | "In Progress" | "Completed" | "Blocked"
  ): Promise<Task> {
    return this.updateTask(taskId, { progress });
  },
  
  // Delete a task
  async deleteTask(taskId: string): Promise<{ taskId: string }> {
    const response = await api.delete<{ success: boolean; data: { taskId: string } }>(
      `/tasks/${taskId}`
    );
    return response.data.data;
  },

  // Get task statistics
  async getTaskStatistics(): Promise<{
    tasksByStatus: { name: string; value: number }[];
    tasksByPriority: { name: string; value: number }[];
    completionRate: number;
  }> {
    const response = await api.get<{ 
      success: boolean; 
      data: {
        tasksByStatus: { name: string; value: number }[];
        tasksByPriority: { name: string; value: number }[];
        completionRate: number;
      } 
    }>("/tasks/statistics");
    return response.data.data;
  }
};

export default taskService;
