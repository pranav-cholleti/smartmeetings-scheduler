
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { MinutesEditor } from "@/components/MinutesEditor";
import { ActionItemsList } from "@/components/ActionItemsList";
import { TaskProgressChart } from "@/components/TaskProgressChart";

export default function MeetingDetailsPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [currentTab, setCurrentTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);

  // Fetch meeting details
  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => meetingService.getMeetingDetails(meetingId!),
  });

  // Fetch dashboard data - Fix: Removing onSuccess and using useEffect instead
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["meeting-dashboard", meetingId],
    queryFn: () => meetingService.getDashboard(meetingId!),
    enabled: !!meetingId && currentTab === "dashboard",
  });

  // Update dashboard data when it changes
  React.useEffect(() => {
    if (dashboard) {
      setDashboardData(dashboard);
    }
  }, [dashboard]);

  // Mutation for updating minutes
  const updateMinutesMutation = useMutation({
    mutationFn: (content: string) => meetingService.updateMinutes(meetingId!, content),
    onSuccess: () => {
      toast.success("Minutes saved successfully");
      setIsEditingMinutes(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to save minutes");
    }
  });

  // Mutation for extracting action items
  const extractActionItemsMutation = useMutation({
    mutationFn: () => meetingService.extractActionItems(meetingId!),
    onSuccess: () => {
      toast.success("Action items extracted successfully");
      // Refetch dashboard data to get new action items
      refetch();
    },
    onError: () => {
      toast.error("Failed to extract action items");
    }
  });

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

  // Handle edit minutes
  const handleEditMinutes = () => {
    setIsEditingMinutes(true);
  };

  // Handle save minutes
  const handleSaveMinutes = async (content: string) => {
    await updateMinutesMutation.mutateAsync(content);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
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

  // Generate dashboard data
  const stats = dashboardData ? dashboardData : {
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
    ]
  };

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
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
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
              <Button onClick={handleDownloadMinutes} className="mr-2">
                <Download className="h-4 w-4 mr-2" />
                Download Minutes
              </Button>
              <Button variant="outline" onClick={handleEditMinutes}>
                Edit Minutes
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
                    {attendee.role === "host" && <Badge variant="secondary">Host</Badge>}
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
            <TaskProgressChart 
              taskCompletion={{
                total: stats.tasksByStatus.reduce((acc, curr) => acc + curr.value, 0),
                completed: stats.tasksByStatus.find(s => s.name === "Completed")?.value || 0,
                percentage: stats.taskCompletion?.percentage || 0
              }}
              tasksByStatus={stats.tasksByStatus}
              tasksByPriority={stats.tasksByPriority}
            />
          )}
        </TabsContent>

        <TabsContent value="minutes" className="space-y-4">
          {isEditingMinutes ? (
            <MinutesEditor 
              initialContent={meeting?.formattedMinutesText || meeting?.extractedMinutesText || ""}
              onSave={handleSaveMinutes}
              onCancel={() => setIsEditingMinutes(false)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Minutes</CardTitle>
                <CardDescription>
                  Summary and notes from the meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meeting?.formattedMinutesText ? (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: meeting.formattedMinutesText.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : meeting?.extractedMinutesText ? (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: meeting.extractedMinutesText.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : meeting?.uploadedMinutes ? (
                  <div className="text-center p-4">
                    <p>Minutes have been uploaded as a file.</p>
                    <Button variant="outline" className="mt-2" onClick={handleDownloadMinutes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Minutes
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">No minutes available for this meeting yet.</p>
                    <Button variant="outline" className="mt-4" onClick={handleEditMinutes}>
                      Add Minutes
                    </Button>
                  </div>
                )}
              </CardContent>
              {(meeting?.formattedMinutesText || meeting?.extractedMinutesText) && (
                <CardFooter>
                  <Button variant="outline" onClick={handleEditMinutes}>
                    Edit Minutes
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {meeting?.aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>Automatically generated summary of the meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: meeting.aiSummary.replace(/\n/g, '<br/>') }} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ActionItemsList
            actionItems={dashboard?.actionItems || []}
            onExtractItems={async () => await extractActionItemsMutation.mutateAsync()}
            isLoading={extractActionItemsMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
