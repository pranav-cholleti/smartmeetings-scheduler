
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarIcon, ChevronLeft, Clock, Download, User, Edit, Upload } from "lucide-react";
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
import TaskProgressDialog from "@/components/TaskProgressDialog";

export default function MeetingDetailsPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [currentTab, setCurrentTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [isUploadingMinutes, setIsUploadingMinutes] = useState(false);
  const [minutesFile, setMinutesFile] = useState<File | null>(null);

  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => meetingService.getMeetingDetails(meetingId!),
  });

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["meeting-dashboard", meetingId],
    queryFn: () => meetingService.getDashboard(meetingId!),
    enabled: !!meetingId && currentTab === "dashboard",
  });

  useEffect(() => {
    if (dashboard) {
      setDashboardData(dashboard);
    }
  }, [dashboard]);

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

  const extractActionItemsMutation = useMutation({
    mutationFn: () => meetingService.extractActionItems(meetingId!),
    onSuccess: () => {
      toast.success("Action items extracted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to extract action items");
    }
  });

  const uploadMinutesMutation = useMutation({
    mutationFn: (file: File) => meetingService.uploadMinutesFile(meetingId!, file),
    onSuccess: () => {
      toast.success("Minutes uploaded successfully");
      setIsUploadingMinutes(false);
      setMinutesFile(null);
      refetch();
    },
    onError: () => {
      toast.error("Failed to upload minutes");
    }
  });

  const handleDownloadMinutes = async () => {
    try {
      await meetingService.generateMinutesPdf(meetingId!);
      toast.success("Minutes PDF generated successfully");
    } catch (error) {
      toast.error("Failed to generate minutes PDF");
      console.error("Error generating PDF:", error);
    }
  };

  const handleEditMinutes = () => {
    setIsEditingMinutes(true);
  };

  const handleSaveMinutes = async (content: string) => {
    await updateMinutesMutation.mutateAsync(content);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMinutesFile(e.target.files[0]);
    }
  };

  const handleUploadMinutes = async () => {
    if (minutesFile) {
      await uploadMinutesMutation.mutateAsync(minutesFile);
    }
  };

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

  // Safe calculation of stats with null checks
  const stats = {
    taskCompletion: {
      completed: dashboardData?.tasksByStatus?.find(s => s.name === "Completed")?.value || 0,
      total: dashboardData?.tasksByStatus?.reduce((acc, curr) => acc + (curr.value || 0), 0) || 0,
      percentage: dashboardData?.taskCompletion?.percentage || 0
    },
    tasksByPriority: dashboardData?.tasksByPriority || [],
    tasksByStatus: dashboardData?.tasksByStatus || []
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>Information about the meeting</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditingMeeting(!isEditingMeeting)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditingMeeting ? "Cancel" : "Edit"}
              </Button>
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
            <>
              <Card>
                <CardHeader>
                  <CardTitle>AI Meeting Summary</CardTitle>
                  <CardDescription>Generated summary of the meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {dashboardData?.aiSummary ? (
                      <div dangerouslySetInnerHTML={{ __html: dashboardData.aiSummary.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="text-muted-foreground">No AI summary available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <TaskProgressChart 
                taskCompletion={{
                  total: stats.taskCompletion.total,
                  completed: stats.taskCompletion.completed,
                  percentage: stats.taskCompletion.percentage
                }}
                tasksByStatus={stats.tasksByStatus}
                tasksByPriority={stats.tasksByPriority}
              />
            </>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meeting Minutes</CardTitle>
                  <CardDescription>
                    Summary and notes from the meeting
                  </CardDescription>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadingMinutes(!isUploadingMinutes)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Minutes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isUploadingMinutes && (
                  <div className="border rounded-md p-4 mb-4">
                    <h3 className="font-medium mb-2">Upload Minutes File</h3>
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="mb-4"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUploadingMinutes(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUploadMinutes}
                        disabled={!minutesFile || uploadMinutesMutation.isPending}
                      >
                        {uploadMinutesMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
                        Upload
                      </Button>
                    </div>
                  </div>
                )}

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
                    <div className="flex justify-center space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setIsUploadingMinutes(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Minutes
                      </Button>
                      <Button onClick={handleEditMinutes}>
                        Create Minutes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              {(meeting?.formattedMinutesText || meeting?.extractedMinutesText) && (
                <CardFooter>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleEditMinutes}>
                      Edit Minutes
                    </Button>
                    <Button onClick={handleDownloadMinutes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
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
