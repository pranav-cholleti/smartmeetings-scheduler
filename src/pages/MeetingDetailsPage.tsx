import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, ChevronLeft, Clock, Download, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { meetingService } from "@/services/meetingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Spinner } from "@/components/ui/spinner";

export default function MeetingDetailsPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [currentTab, setCurrentTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Fetch meeting details
  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => meetingService.getMeetingDetails(meetingId!),
  });

  // Fetch dashboard data
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["meeting-dashboard", meetingId],
    queryFn: () => meetingService.getDashboard(meetingId!),
    enabled: !!meetingId && currentTab === "dashboard",
    onSettled: (data) => {
      if (data) setDashboardData(data);
    }
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };

  // Generate placeholder stats if data isn't available
  const getStatsData = () => {
    if (dashboardData) return dashboardData;
    
    return {
      taskCompletion: {
        completed: 0,
        total: 0,
        percentage: 0
      },
      tasksByPriority: [
        { name: 'High', value: 0 },
        { name: 'Medium', value: 0 },
        { name: 'Low', value: 0 }
      ],
      tasksByStatus: [
        { name: 'Not Started', value: 0 },
        { name: 'In Progress', value: 0 },
        { name: 'Completed', value: 0 },
        { name: 'Blocked', value: 0 }
      ],
      actionItemsByAssignee: [] 
    };
  };

  // Colors for pie chart
  const TASK_STATUS_COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444'];
  const PRIORITY_COLORS = ['#ef4444', '#f97316', '#22c55e'];

  // Handle download minutes
  const handleDownloadMinutes = async () => {
    try {
      await meetingService.generateMinutesPdf(meetingId!);
      toast.success("Minutes PDF generated successfully");
    } catch (error) {
      toast.error("Failed to generate minutes PDF");
      console.error("Error generating PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Failed to load meeting details</h3>
            <p className="text-muted-foreground">Please try again later</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/meetings">Go Back to Meetings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getStatsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/meetings">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{meeting?.name}</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard" disabled={!meetingId}>Dashboard</TabsTrigger>
          <TabsTrigger value="minutes" disabled>Minutes</TabsTrigger>
          <TabsTrigger value="actions" disabled>Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>Information about the meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(meeting.dateTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{meeting.isOnline ? 'Online Meeting' : 'In-Person Meeting'}</span>
              </div>
              {meeting.meetingLink && (
                <div className="flex items-center space-x-2">
                  <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Join Meeting
                  </a>
                </div>
              )}
              {meeting.additionalComments && (
                <div>
                  <p className="text-sm font-medium">Additional Comments:</p>
                  <p className="text-sm text-muted-foreground">{meeting.additionalComments}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleDownloadMinutes}>
                <Download className="h-4 w-4 mr-2" />
                Download Minutes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>List of people attending the meeting</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {meeting.attendees?.map((attendee) => (
                <div key={attendee.userId} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${attendee.email}.png`} />
                    <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{attendee.name}</p>
                    <p className="text-xs text-muted-foreground">{attendee.email}</p>
                    {attendee.isHost && <Badge variant="secondary">Host</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          {loadingDashboard ? (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Dashboard</CardTitle>
                <CardDescription>Analyzing meeting insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion</CardTitle>
                  <CardDescription>Overall progress of assigned tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="font-medium">{stats.taskCompletion.percentage}%</span>
                    </div>
                    <Progress value={stats.taskCompletion.percentage} className="h-2" />
                    <div className="text-sm text-muted-foreground mt-2">
                      <span>{stats.taskCompletion.completed} out of {stats.taskCompletion.total} tasks completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Priority</CardTitle>
                  <CardDescription>Distribution of tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.tasksByPriority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tasks by Status</CardTitle>
                  <CardDescription>Distribution of tasks by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.tasksByStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {
                          stats.tasksByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={TASK_STATUS_COLORS[index % TASK_STATUS_COLORS.length]} />)
                        }
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="minutes">
          <div>Minutes Content</div>
        </TabsContent>

        <TabsContent value="actions">
          <div>Actions Content</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
