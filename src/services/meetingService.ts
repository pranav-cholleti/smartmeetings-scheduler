
import api from './api';
import { 
  Meeting, 
  MeetingDetails, 
  CreateMeetingData, 
  UpdateMeetingData,
  MeetingsResponse,
  ActionItemSuggestion,
  DashboardData,
  AttendeeWithDetails
} from '../types';

export const meetingService = {
  // Get meetings the user is part of
  async getMeetings(
    page = 1, 
    limit = 10, 
    search?: string, 
    sortBy: string = 'dateTime', 
    sortOrder: string = 'desc', 
    filter?: string
  ): Promise<MeetingsResponse> {
    const response = await api.get('/meetings', {
      params: { page, limit, search, sortBy, sortOrder, filter }
    });
    return response.data.data;
  },

  // Get a specific meeting's details
  async getMeetingDetails(meetingId: string): Promise<MeetingDetails> {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data.data;
  },

  // Create a new meeting
  async createMeeting(data: CreateMeetingData): Promise<MeetingDetails> {
    const response = await api.post('/meetings', data);
    return response.data.data;
  },

  // Update a meeting
  async updateMeeting(meetingId: string, data: UpdateMeetingData): Promise<MeetingDetails> {
    const response = await api.put(`/meetings/${meetingId}`, data);
    return response.data.data;
  },

  // Add an attendee to a meeting
  async addAttendee(meetingId: string, userId: string): Promise<AttendeeWithDetails[]> {
    const response = await api.post(`/meetings/${meetingId}/attendees`, { userId });
    return response.data.data;
  },

  // Promote an attendee to host
  async promoteAttendee(meetingId: string, userId: string): Promise<AttendeeWithDetails[]> {
    const response = await api.put(`/meetings/${meetingId}/attendees/${userId}/promote`);
    return response.data.data;
  },

  // Remove an attendee
  async removeAttendee(meetingId: string, userId: string): Promise<AttendeeWithDetails[]> {
    const response = await api.delete(`/meetings/${meetingId}/attendees/${userId}`);
    return response.data.data;
  },

  // Upload minutes file
  async uploadMinutes(meetingId: string, file: File): Promise<{filename: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/meetings/${meetingId}/minutes/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Update the formatted minutes text
  async updateMinutes(meetingId: string, formattedMinutesText: string): Promise<{meetingId: string}> {
    const response = await api.put(`/meetings/${meetingId}/minutes`, { formattedMinutesText });
    return response.data.data;
  },

  // Extract action items using AI
  async extractActionItems(meetingId: string): Promise<ActionItemSuggestion[]> {
    const response = await api.post(`/meetings/${meetingId}/extract-actions`);
    return response.data.data;
  },

  // Get meeting dashboard data
  async getDashboardData(meetingId: string): Promise<DashboardData> {
    const response = await api.get(`/meetings/${meetingId}/dashboard`);
    return response.data.data;
  },

  // Save all meeting action items at once
  async saveActionItems(meetingId: string, actionItems: any[]): Promise<{
    created: number,
    updated: number,
    deleted: number,
    errors: any[]
  }> {
    const response = await api.put(`/meetings/${meetingId}/action-items`, { actionItems });
    return response.data.data;
  },

  // Generate a PDF of the meeting minutes
  async generatePDF(meetingId: string): Promise<{meetingId: string}> {
    const response = await api.post(`/meetings/${meetingId}/minutes/generate-pdf`);
    return response.data.data;
  },
};

export default meetingService;
