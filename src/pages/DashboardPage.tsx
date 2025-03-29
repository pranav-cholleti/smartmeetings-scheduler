
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, MoreHorizontal, PlusCircle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { taskService } from "@/services/taskService";
import { meetingService } from "@/services/meetingService";
import { Task, Meeting } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    tasks: true,
    meetings: true,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get high priority tasks
        const tasksResponse = await taskService.getAssignedTasks(1, 5, undefined, 'priority', 'asc');
        setRecentTasks(tasksResponse.tasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(prev => ({ ...prev, tasks: false }));
      }
      
      try {
        // Get upcoming meetings
        const meetingsResponse = await meetingService.getMeetings(1, 5, undefined, 'dateTime', 'asc');
        setUpcomingMeetings(meetingsResponse.meetings || []);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(prev => ({ ...prev, meetings: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const getTaskStatusBadge = (progress: string) => {
    switch (progress) {
      case "Not Started":
        return <Badge variant="outline" className="bg-gray-200 text-gray-800">Not Started</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "Completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "Blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{progress}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
  
    if (isSameDay(date, today)) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, tomorrow)) {
      return 'Tomorrow, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(date, yesterday)) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">
            Your meeting dashboard overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/meetings/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Meeting
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium">{user?.organisation}</p>
                <p className="text-muted-foreground text-sm">
                  {user?.employmentPosition || "No position specified"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div>{user?.email}</div>
                {user?.mobile && (
                  <>
                    <div className="text-muted-foreground">Mobile:</div>
                    <div>{user?.mobile}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Meetings
              </CardTitle>
              <CardDescription>
                Your next scheduled meetings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/meetings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading.meetings ? (
              <div className="flex justify-center my-8">
                <Spinner size="lg" />
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming meetings</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/meetings/create">Schedule a meeting</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.meetingId} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <Link 
                        to={`/meetings/${meeting.meetingId}`}
                        className="font-medium hover:underline"
                      >
                        {meeting.name}
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {getRelativeTime(meeting.dateTime)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={meeting.userRole === 'host' ? 'bg-primary/10 text-primary' : ''}>
                        {meeting.userRole === 'host' ? 'Host' : 'Attendee'}
                      </Badge>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/meetings/${meeting.meetingId}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>
              Your prioritized tasks
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/tasks">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading.tasks ? (
            <div className="flex justify-center my-8">
              <Spinner size="lg" />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.taskId} className="p-4 border rounded-md">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-medium">{task.taskName}</div>
                      {task.meeting && (
                        <Link 
                          to={`/meetings/${task.meeting.meetingId}`} 
                          className="text-sm text-primary hover:underline"
                        >
                          {task.meeting.name}
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getTaskStatusBadge(task.progress)}
                      <Badge variant="outline" className={`task-priority-${task.priority}`}>
                        Priority: {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Due: {formatDate(task.deadline)}
                  </div>
                  {task.additionalComments && (
                    <p className="mt-2 text-sm text-gray-700">{task.additionalComments}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
