
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Plus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/services/meetingService";
import { taskService } from "@/services/taskService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);

  // Fetch recent meetings
  const { data: recentMeetings, isLoading: loadingMeetings } = useQuery({
    queryKey: ['meetings', 'recent'],
    queryFn: () => meetingService.getMeetings(1, 3),
  });

  // Fetch assigned tasks
  const { data: assignedTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', 'assigned'],
    queryFn: () => taskService.getAssignedTasks(1, 5),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTaskStatusColor = (progress: string) => {
    switch (progress) {
      case 'Not Started': return 'bg-gray-200';
      case 'In Progress': return 'bg-blue-200';
      case 'Completed': return 'bg-green-200';
      case 'Blocked': return 'bg-red-200';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {showWelcomeCard && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to SmartMinutes</h3>
                <p className="text-sm text-muted-foreground">
                  Streamline your meetings with AI-powered minutes, task management, and analytics.
                </p>
              </div>
              <div className="flex gap-3 self-end md:self-center">
                <Button variant="outline" asChild>
                  <Link to="/meetings/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowWelcomeCard(false)}>
                  ✕
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-primary" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-2xl font-semibold">{user?.organisation}</p>
            <p className="text-sm text-muted-foreground">
              {user?.employmentPosition || 'Team Member'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {loadingMeetings ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : (
              <p className="text-2xl font-semibold">
                {recentMeetings?.totalMeetings || 0}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/meetings">View all meetings</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : (
              <p className="text-2xl font-semibold">
                {assignedTasks?.totalTasks || 0}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">View all tasks</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meetings */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Recent Meetings</CardTitle>
            <CardDescription>Your recently scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMeetings ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentMeetings?.meetings && recentMeetings.meetings.length > 0 ? (
              recentMeetings.meetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{meeting.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(meeting.dateTime)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/meetings/${meeting.meetingId}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No meetings scheduled yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/meetings/create">Schedule a meeting</Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/meetings">
                View All Meetings
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* My Tasks */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingTasks ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : assignedTasks?.tasks && assignedTasks.tasks.length > 0 ? (
              assignedTasks.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.progress)}`} />
                    <div>
                      <p className="font-medium">{task.taskName}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.meeting?.name || "No meeting"} · Due: {formatDate(task.deadline)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tasks#${task.taskId}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No tasks assigned to you</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/tasks">
                View All Tasks
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
