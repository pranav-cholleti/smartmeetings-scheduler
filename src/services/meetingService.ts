
import api from "./api";
import { Meeting, MeetingDetails, MeetingsResponse, User } from "../types";

export const meetingService = {
  // Get all meetings with pagination, search, sort, and filter
  async getMeetings(
    page = 1,
    limit = 10,
    search?: string,
    sortBy = "dateTime",
    sortOrder = "desc",
    filter?: string
  ): Promise<MeetingsResponse> {
    const params = { page, limit, search, sortBy, sortOrder, filter };
    const response = await api.get("/meetings", { params });
    return response.data.data;
  },

  // Create a new meeting
  async createMeeting(data: {
    name: string;
    dateTime: string;
    attendees?: string[];
    isOnline: boolean;
    meetingLink?: string;
    additionalComments?: string;
  }): Promise<MeetingDetails> {
    const response = await api.post("/meetings", data);
    return response.data.data;
  },

  // Get meeting details
  async getMeetingDetails(meetingId: string): Promise<MeetingDetails> {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data.data;
  },

  // Update meeting
  async updateMeeting(
    meetingId: string,
    data: {
      name?: string;
      dateTime?: string;
      isOnline?: boolean;
      meetingLink?: string;
      additionalComments?: string;
    }
  ): Promise<MeetingDetails> {
    const response = await api.put(`/meetings/${meetingId}`, data);
    return response.data.data;
  },

  // Add attendee to meeting
  async addAttendee(meetingId: string, userId: string): Promise<any> {
    const response = await api.post(`/meetings/${meetingId}/attendees`, { userId });
    return response.data.data;
  },

  // Promote attendee to host
  async promoteAttendee(meetingId: string, userId: string): Promise<any> {
    const response = await api.put(`/meetings/${meetingId}/attendees/${userId}/promote`);
    return response.data.data;
  },

  // Remove attendee from meeting
  async removeAttendee(meetingId: string, userId: string): Promise<any> {
    const response = await api.delete(`/meetings/${meetingId}/attendees/${userId}`);
    return response.data.data;
  },

  // Upload minutes file
  async uploadMinutesFile(meetingId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/meetings/${meetingId}/minutes/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Update formatted minutes text
  async updateMinutes(meetingId: string, formattedMinutesText: string): Promise<any> {
    const response = await api.put(`/meetings/${meetingId}/minutes`, 
      { formattedMinutesText }
    );
    return response.data.data;
  },

  // Extract action items via AI
  async extractActionItems(meetingId: string): Promise<any> {
    const response = await api.post(`/meetings/${meetingId}/extract-actions`);
    return response.data.data;
  },

  // Get meeting dashboard data
  async getDashboard(meetingId: string): Promise<any> {
    const response = await api.get(`/meetings/${meetingId}/dashboard`);
    return response.data.data;
  },

  // Generate AI minutes PDF
  async generateMinutesPdf(meetingId: string): Promise<any> {
    const response = await api.post(`/meetings/${meetingId}/minutes/generate-pdf`);
    return response.data.data;
  },

  // Save meeting action items (batch)
  async saveActionItems(meetingId: string, actionItems: any[]): Promise<any> {
    const response = await api.put(`/meetings/${meetingId}/action-items`, 
      { actionItems }
    );
    return response.data.data;
  },

  // Get organization users for attendee selection
  async getOrganizationUsers(search?: string): Promise<User[]> {
    const params = { search };
    const response = await api.get("/users/organisation", { params });
    return response.data.data;
  },
};

export default meetingService;
