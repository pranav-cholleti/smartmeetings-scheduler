
// User related types
export interface User {
  userId: string;
  name: string;
  email: string;
  organisation?: string;
  age?: number;
  employmentPosition?: string;
  mobile?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organisation: string;
  age?: number;
  employmentPosition?: string;
  mobile?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Meeting related types
export interface Meeting {
  meetingId: string;
  name: string;
  dateTime: string;
  userRole: 'host' | 'attendee';
}

export interface MeetingDetails {
  _id: string;
  name: string;
  dateTime: string;
  hostId: string;
  organisation: string;
  attendees: AttendeeWithDetails[];
  meetingLink?: string;
  isOnline: boolean;
  additionalComments?: string;
  uploadedMinutes?: {
    originalFilename: string;
    storagePath: string;
    mimeType: string;
    uploadedAt: string;
  };
  extractedMinutesText?: string;
  formattedMinutesText?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
  userRole: 'host' | 'attendee';
}

export interface CreateMeetingData {
  name: string;
  dateTime: string;
  attendees?: string[];
  isOnline: boolean;
  meetingLink?: string;
  additionalComments?: string;
}

export interface UpdateMeetingData {
  name?: string;
  dateTime?: string;
  isOnline?: boolean;
  meetingLink?: string;
  additionalComments?: string;
}

export interface Attendee {
  userId: string;
  role: 'host' | 'attendee';
}

export interface AttendeeWithDetails extends Attendee {
  name: string;
  email: string;
}

export interface MeetingsResponse {
  meetings: Meeting[];
  totalPages: number;
  currentPage: number;
  totalMeetings: number;
}

// Task related types
export interface Task {
  taskId: string;
  taskName: string;
  meeting: {
    meetingId: string;
    name: string;
  } | null;
  assignees: { userId: string; name: string }[];
  deadline: string;
  priority: number;
  progress: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  additionalComments?: string;
  createdBy: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
  totalTasks: number;
}

export interface CreateTaskData {
  meetingId: string;
  taskName: string;
  assignees: string[];
  deadline: string;
  priority: number;
  additionalComments?: string;
}

export interface UpdateTaskData {
  taskName?: string;
  assignees?: string[];
  deadline?: string;
  priority?: number;
  progress?: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  additionalComments?: string;
}

export interface ActionItemSuggestion {
  taskName: string;
  suggestedAssignees: string[];
  deadline: string | null;
  priority: number;
  context: string;
}

export interface DashboardData {
  aiSummary: string;
  taskStats: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  assignees: { userId: string; name: string }[];
  aiPdfAvailable: boolean;
  actionItems: Task[];
}
