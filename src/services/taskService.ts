
import api from "./api";
import { Task, TasksResponse } from "../types";
import { ProgressStatus } from "@/components/TaskProgressDialog";

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
    const response = await api.get("/tasks/assigned", { params });
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
    const response = await api.get("/tasks/scheduled", { params });
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
    const response = await api.post("/tasks", data);
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
      progress?: ProgressStatus;
      additionalComments?: string;
    }
  ): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.data;
  },
  
  // Update task progress (for assignees)
  async updateTaskProgress(
    taskId: string,
    progress: ProgressStatus
  ): Promise<Task> {
    return this.updateTask(taskId, { progress });
  },
  
  // Delete a task
  async deleteTask(taskId: string): Promise<{ taskId: string }> {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data.data;
  },

  // Get task statistics
  async getTaskStatistics(): Promise<{
    tasksByStatus: { name: string; value: number }[];
    tasksByPriority: { name: string; value: number }[];
    completionRate: number;
  }> {
    const response = await api.get("/tasks/statistics");
    return response.data.data;
  },
  
  // Get tasks by meeting id
  async getTasksByMeetingId(meetingId: string): Promise<Task[]> {
    const response = await api.get(`/tasks/meeting/${meetingId}`);
    return response.data.data;
  },
  
  // Batch update tasks
  async batchUpdateTasks(tasks: {
    taskId: string;
    taskName?: string;
    assignees?: string[];
    deadline?: string;
    priority?: number;
    progress?: ProgressStatus;
    additionalComments?: string;
  }[]): Promise<Task[]> {
    const response = await api.put(`/tasks/batch`, { tasks });
    return response.data.data;
  },
  
  // Save action items for a meeting
  async saveActionItems(
    meetingId: string,
    actionItems: {
      id?: string;
      taskName: string;
      assigneeIds: string[];
      deadline: string;
      priority: number;
      progress?: ProgressStatus;
      additionalComments?: string;
    }[]
  ): Promise<Task[]> {
    const response = await api.put(`/meetings/${meetingId}/action-items`, { actionItems });
    return response.data.data;
  }
};

export default taskService;
