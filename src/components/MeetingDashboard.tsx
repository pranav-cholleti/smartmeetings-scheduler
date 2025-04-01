
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Download, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { TaskProgressChart } from "./TaskProgressChart";
import { Task } from "@/types";
import { toast } from "sonner";
import minutesService from "@/services/minutesService";
import { ProgressStatus } from "./TaskProgressDialog";

interface MeetingDashboardProps {
  meetingId: string;
  aiSummary?: string;
  tasks: Task[];
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  isHost: boolean;
  isLoading?: boolean;
}

export default function MeetingDashboard({
  meetingId,
  aiSummary = "Meeting summary not available yet",
  tasks = [],
  assignees = [],
  isHost,
  isLoading = false,
}: MeetingDashboardProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    "Not Started": 0,
    "In Progress": 0,
    Completed: 0,
    Blocked: 0,
  });

  // Calculate task statistics when tasks change
  useEffect(() => {
    if (!tasks) return;
    
    const stats = {
      total: tasks.length,
      "Not Started": 0,
      "In Progress": 0,
      Completed: 0,
      Blocked: 0,
    };
    
    tasks.forEach((task) => {
      const status = task.progress as ProgressStatus;
      if (status && stats[status] !== undefined) {
        stats[status]++;
      } else {
        stats["Not Started"]++;
      }
    });
    
    setTaskStats(stats);
  }, [tasks]);

  // Format for chart display
  const chartData = Object.entries(taskStats)
    .filter(([key]) => key !== "total")
    .map(([name, value]) => ({ name, value }));

  const handleGeneratePdf = async () => {
    if (!meetingId) return;
    
    setGeneratingPdf(true);
    try {
      const result = await minutesService.generateMinutesPdf(meetingId);
      if (result.success) {
        toast.success("PDF generated successfully");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!meetingId) return;
    
    setDownloadingPdf(true);
    try {
      const success = await minutesService.downloadMinutesPdf(meetingId);
      if (success) {
        toast.success("PDF downloaded successfully");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading meeting dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl">AI Meeting Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <p>{aiSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>

        {/* Completed Tasks Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {taskStats.Completed}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({taskStats.total > 0
                  ? Math.round((taskStats.Completed / taskStats.total) * 100)
                  : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* In Progress Tasks Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {taskStats["In Progress"]}
            </div>
          </CardContent>
        </Card>

        {/* Blocked Tasks Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {taskStats.Blocked}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Progress Chart & Assignees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card className="shadow-md">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-xl">Task Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-80">
            <TaskProgressChart data={chartData} />
          </CardContent>
        </Card>

        {/* Assignees */}
        <Card className="shadow-md">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Task Assignees
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {assignees.length === 0 ? (
              <p className="text-muted-foreground">No assignees yet</p>
            ) : (
              <ul className="space-y-2">
                {assignees.map((user) => (
                  <li key={user.id} className="flex items-center p-2 rounded-md bg-muted/30">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {isHost && (
          <Button 
            variant="default" 
            onClick={handleGeneratePdf} 
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Generating PDF...
              </>
            ) : (
              <>Generate AI Minutes PDF</>
            )}
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={handleDownloadPdf} 
          disabled={downloadingPdf}
          className="flex items-center"
        >
          {downloadingPdf ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Minutes PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
