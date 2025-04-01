
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, Download, FileText, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TaskProgressChart } from "@/components/TaskProgressChart";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import meetingService from "@/services/meetingService";
import minutesService from "@/services/minutesService";

export function MeetingDashboard() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Fetch meeting details - changed getMeetingById to getMeetingDetails
  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingService.getMeetingDetails(meetingId || ''),
    enabled: !!meetingId,
  });

  const isHost = meeting?.userRole === 'host';

  // Calculate task statistics for charts
  const getTaskStatistics = () => {
    if (!meeting?.actionItems || meeting.actionItems.length === 0) {
      return {
        taskCompletion: { completed: 0, total: 0, percentage: 0 },
        tasksByStatus: [
          { name: 'Not Started', value: 0 },
          { name: 'In Progress', value: 0 },
          { name: 'Completed', value: 0 },
          { name: 'Blocked', value: 0 },
        ],
        tasksByPriority: [
          { name: 'High (1-3)', value: 0 },
          { name: 'Medium (4-7)', value: 0 },
          { name: 'Low (8-10)', value: 0 },
        ],
      };
    }

    const tasks = meeting.actionItems;
    const total = tasks.length;
    const completed = tasks.filter(task => task.progress === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Count tasks by status
    const notStarted = tasks.filter(task => task.progress === 'Not Started').length;
    const inProgress = tasks.filter(task => task.progress === 'In Progress').length;
    const blocked = tasks.filter(task => task.progress === 'Blocked').length;

    // Count tasks by priority
    const highPriority = tasks.filter(task => task.priority <= 3).length;
    const mediumPriority = tasks.filter(task => task.priority > 3 && task.priority <= 7).length;
    const lowPriority = tasks.filter(task => task.priority > 7).length;

    return {
      taskCompletion: { completed, total, percentage },
      tasksByStatus: [
        { name: 'Not Started', value: notStarted },
        { name: 'In Progress', value: inProgress },
        { name: 'Completed', value: completed },
        { name: 'Blocked', value: blocked },
      ],
      tasksByPriority: [
        { name: 'High (1-3)', value: highPriority },
        { name: 'Medium (4-7)', value: mediumPriority },
        { name: 'Low (8-10)', value: lowPriority },
      ],
    };
  };

  const handleGeneratePdf = async () => {
    if (!meetingId) return;
    
    setIsGeneratingPdf(true);
    try {
      const result = await minutesService.generateMinutesPdf(meetingId);
      if (result.success) {
        toast.success("PDF generated successfully!");
        refetch();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!meetingId) return;
    
    setIsDownloadingPdf(true);
    try {
      const filename = `meeting-${meetingId}-minutes.pdf`;
      const success = await minutesService.downloadMinutesPdf(meetingId, filename);
      if (success) {
        toast.success("PDF downloaded successfully!");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // For empty state or loading
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Failed to load meeting dashboard</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the meeting information.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const { taskCompletion, tasksByStatus, tasksByPriority } = getTaskStatistics();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{meeting.title}</h1>
          <p className="text-muted-foreground">
            Dashboard Overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/meetings/${meetingId}`}>
              <FileText className="mr-2 h-4 w-4" />
              Meeting Details
            </Link>
          </Button>
          {meeting.minutesPdfUrl && (
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="gap-2"
            >
              {isDownloadingPdf ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
              Download Minutes PDF
            </Button>
          )}
          {isHost && !meeting.minutesPdfUrl && (
            <Button
              size="sm"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="gap-2"
            >
              {isGeneratingPdf ? <Spinner size="sm" /> : <FileText className="h-4 w-4" />}
              Generate Minutes PDF
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* AI Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Meeting Summary</CardTitle>
          <CardDescription>
            Generated summary based on meeting minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meeting.aiSummary ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: meeting.aiSummary }} />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No AI summary available for this meeting yet.</p>
              {isHost && (
                <p className="mt-2">
                  Generate a meeting summary by uploading and processing meeting minutes.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <TaskProgressChart 
        taskCompletion={taskCompletion} 
        tasksByStatus={tasksByStatus} 
        tasksByPriority={tasksByPriority} 
      />

      {/* Attendees Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendees & Action Items</CardTitle>
            <CardDescription>
              People involved in this meeting
            </CardDescription>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                View All
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Meeting Participants</SheetTitle>
                <SheetDescription>
                  All attendees and their roles
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Host section */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    Host
                    <Badge className="ml-2">1</Badge>
                  </h3>
                  <div className="space-y-2">
                    {meeting.attendees
                      .filter(a => a.role === 'host')
                      .map(host => (
                        <div key={host._id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{host.name}</p>
                            <p className="text-sm text-muted-foreground">{host.email}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Attendees section */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    Attendees
                    <Badge className="ml-2">
                      {meeting.attendees.filter(a => a.role === 'attendee').length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {meeting.attendees
                      .filter(a => a.role === 'attendee')
                      .map(attendee => (
                        <div key={attendee._id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            <p className="text-sm text-muted-foreground">{attendee.email}</p>
                          </div>
                          <div>
                            <Badge variant="outline">
                              {meeting.actionItems.filter(item => 
                                item.assignees.some(a => a._id === attendee._id)
                              ).length} tasks
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {meeting.attendees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {meeting.attendees
                .slice(0, 6)
                .map(attendee => (
                  <div key={attendee._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="truncate">
                      <p className="font-medium truncate">{attendee.name}</p>
                      <div className="flex items-center">
                        <Badge variant="outline" className="truncate">
                          {meeting.actionItems.filter(item => 
                            item.assignees.some(a => a._id === attendee._id)
                          ).length} tasks
                        </Badge>
                        <Badge 
                          variant={attendee.role === 'host' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {attendee.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No attendees added to this meeting.</p>
          )}
          {meeting.attendees.length > 6 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                + {meeting.attendees.length - 6} more attendees
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minutes Preview */}
      {meeting.minutesText && (
        <Card>
          <CardHeader>
            <CardTitle>Meeting Minutes</CardTitle>
            <CardDescription>
              Extracted from uploaded document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor initialValue={meeting.minutesText} readOnly={true} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
