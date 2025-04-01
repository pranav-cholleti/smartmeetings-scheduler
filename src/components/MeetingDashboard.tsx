
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle, CheckCircle, Clock, UserCircle } from "lucide-react";
import { TaskProgressChart } from "@/components/TaskProgressChart";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MeetingDashboardProps {
  isLoading: boolean;
  dashboardData: any;
  isHost: boolean;
  onGeneratePdf: () => void;
  isGeneratingPdf: boolean;
}

export function MeetingDashboard({
  isLoading,
  dashboardData,
  isHost,
  onGeneratePdf,
  isGeneratingPdf
}: MeetingDashboardProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No dashboard data available</h3>
            <p className="mt-1 text-muted-foreground">
              There might not be enough data to generate a dashboard yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe calculation of stats with null checks
  const taskStats = {
    total: dashboardData.taskStats?.total || 0,
    notStarted: dashboardData.taskStats?.notStarted || 0,
    inProgress: dashboardData.taskStats?.inProgress || 0,
    completed: dashboardData.taskStats?.completed || 0,
    blocked: dashboardData.taskStats?.blocked || 0,
  };
  
  const completionRate = taskStats.total > 0 ? 
    Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  
  const tasksByStatus = [
    { name: "Not Started", value: taskStats.notStarted },
    { name: "In Progress", value: taskStats.inProgress },
    { name: "Completed", value: taskStats.completed },
    { name: "Blocked", value: taskStats.blocked },
  ];
  
  const tasksByPriority = dashboardData.tasksByPriority || [];

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI Meeting Summary</CardTitle>
          <CardDescription>Generated summary of the meeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="prose max-w-none">
            {dashboardData.aiSummary ? (
              <div dangerouslySetInnerHTML={{ __html: dashboardData.aiSummary.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="text-muted-foreground">No AI summary available yet.</p>
            )}
          </div>
          {isHost && (
            <div className="pt-4">
              <Button 
                onClick={onGeneratePdf} 
                disabled={isGeneratingPdf || !dashboardData.aiSummary}
              >
                {isGeneratingPdf && <Spinner className="mr-2 h-4 w-4" />}
                <Download className="mr-2 h-4 w-4" />
                Generate AI Minutes PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Work Progress</CardTitle>
          <CardDescription>Overview of tasks and completion status</CardDescription>
        </CardHeader>
        <CardContent>
          {taskStats.total > 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-muted/50 p-3 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-bold">{taskStats.notStarted}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md text-center">
                  <p className="text-xs text-blue-700">In Progress</p>
                  <p className="text-2xl font-bold text-blue-700">{taskStats.inProgress}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-md text-center">
                  <p className="text-xs text-green-700">Completed</p>
                  <p className="text-2xl font-bold text-green-700">{taskStats.completed}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-md text-center">
                  <p className="text-xs text-red-700">Blocked</p>
                  <p className="text-2xl font-bold text-red-700">{taskStats.blocked}</p>
                </div>
              </div>

              <TaskProgressChart 
                taskCompletion={{
                  total: taskStats.total,
                  completed: taskStats.completed,
                  percentage: completionRate
                }}
                tasksByStatus={tasksByStatus}
                tasksByPriority={tasksByPriority}
              />
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No tasks have been created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignees */}
      {dashboardData.assignees && dashboardData.assignees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assignees</CardTitle>
            <CardDescription>People assigned to tasks in this meeting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {dashboardData.assignees.map((assignee: any) => (
                <div key={assignee.userId} className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${assignee.name}.png`} />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{assignee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignee.taskCount || 0} task{assignee.taskCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
