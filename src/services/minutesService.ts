
import api from "./api";

export const minutesService = {
  /**
   * Upload minutes file for a meeting
   */
  async uploadMinutesFile(
    meetingId: string,
    file: File
  ): Promise<{ success: boolean; minutesText: string }> {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post<{
      success: boolean;
      data: { minutesText: string };
    }>(`/meetings/${meetingId}/minutes/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return {
      success: response.data.success,
      minutesText: response.data.data.minutesText,
    };
  },

  /**
   * Update minutes text for a meeting
   */
  async updateMinutesText(
    meetingId: string,
    minutesText: string
  ): Promise<{ success: boolean }> {
    const response = await api.put<{ success: boolean }>(
      `/meetings/${meetingId}/minutes`,
      {
        minutesText,
      }
    );
    
    return response.data;
  },

  /**
   * Extract action items using AI
   */
  async extractActionItems(
    meetingId: string
  ): Promise<{
    success: boolean;
    actionItems: Array<{
      taskName: string;
      assigneeIds: string[];
      deadline: string;
      priority: number;
      progress: string;
      additionalComments?: string;
    }>;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        actionItems: Array<{
          taskName: string;
          assigneeIds: string[];
          deadline: string;
          priority: number;
          progress: string;
          additionalComments?: string;
        }>;
      };
    }>(`/meetings/${meetingId}/extract-action-items`);
    
    return {
      success: response.data.success,
      actionItems: response.data.data.actionItems,
    };
  },

  /**
   * Generate minutes PDF
   */
  async generateMinutesPdf(
    meetingId: string
  ): Promise<{ success: boolean; pdfUrl?: string }> {
    const response = await api.post<{
      success: boolean;
      data: { pdfUrl?: string };
    }>(`/meetings/${meetingId}/minutes/generate-pdf`);
    
    return {
      success: response.data.success,
      pdfUrl: response.data.data.pdfUrl,
    };
  },

  /**
   * Download minutes PDF
   */
  async downloadMinutesPdf(meetingId: string, filename?: string): Promise<boolean> {
    return api.download(`/meetings/${meetingId}/minutes/pdf`, filename || `meeting-${meetingId}-minutes.pdf`);
  },
};

export default minutesService;
