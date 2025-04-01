
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, AlertCircle, CheckCircle, UserCircle, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { meetingService } from "@/services/meetingService";
import { taskService } from "@/services/taskService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskProgressChart } from "@/components/TaskProgressChart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingTasks, setPendingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Fetch upcoming meetings
  const { data: meetingsData, isLoading: loadingMeetings } = useQuery({
    queryKey: ["upcoming-meetings"],
    queryFn: () => meetingService.getMeetings(1, 5),
  });

  // Fetch assigned tasks
  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ["assigned-tasks"],
    queryFn: () => taskService.getAssignedTasks(1, 5),
  });

  // Fetch task statistics
  const { data: taskStats, isLoading: loadingTaskStats } = useQuery({
    queryKey: ["task-statistics"],
    queryFn: () => taskService.getTaskStatistics(),
  });

  // Calculate pending/completed tasks from task data
  useEffect(() => {
    if (tasksData?.tasks) {
      const pending = tasksData.tasks.filter(
        task => task.progress !== "Completed"
      ).length;
      const completed = tasksData.tasks.filter(
        task => task.progress === "Completed"
      ).length;
      
      setPendingTasks(pending);
      setCompletedTasks(completed);
    }
  }, [tasksData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your meetings and tasks</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Task Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Pending Tasks</span>
                  </div>
                  <Badge variant="outline">{pendingTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Completed Tasks</span>
                  </div>
                  <Badge variant="outline">{completedTasks}</Badge>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{tasksData?.tasks ? 
                      `${Math.round((completedTasks / (pendingTasks + completedTasks || 1)) * 100)}%` : 
                      '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={tasksData?.tasks ? 
                      (completedTasks / (pendingTasks + completedTasks || 1)) * 100 : 
                      0} 
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link to="/tasks">
                View all tasks
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Profile Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.organisation && (
                    <Badge variant="outline" className="mt-1">
                      {user.organisation}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link to="/profile">
                Edit profile
                <Settings className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Next Meeting Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMeetings ? (
              <Skeleton className="h-12 w-full" />
            ) : meetingsData?.meetings && meetingsData.meetings.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium">{meetingsData.meetings[0].name}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>{formatDate(meetingsData.meetings[0].dateTime)}</span>
                </div>
                <Badge variant={meetingsData.meetings[0].userRole === "host" ? "default" : "secondary"}>
                  {meetingsData.meetings[0].userRole === "host" ? "Hosting" : "Attending"}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming meetings</p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            {meetingsData?.meetings && meetingsData.meetings.length > 0 ? (
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to={`/meetings/${meetingsData.meetings[0].meetingId}`}>
                  View details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="link" size="sm" className="px-0">
                <Link to="/meetings/create">
                  Schedule a meeting
                  <CalendarIcon className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Meetings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your next 5 meetings</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMeetings ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : meetingsData?.meetings && meetingsData.meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetingsData.meetings.map((meeting) => (
                    <Link 
                      to={`/meetings/${meeting.meetingId}`} 
                      key={meeting.meetingId}
                      className="flex items-start space-x-4 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{formatDate(meeting.dateTime)}</span>
                        </div>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {meeting.userRole === "host" ? "Host" : "Attendee"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No upcoming meetings</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/meetings">View all meetings</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasksData.tasks.map((task) => (
                    <div 
                      key={task.taskId}
                      className="flex items-start justify-between space-x-4 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <h3 className="font-medium">{task.taskName}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                            {task.progress}
                          </span>
                          <span className="text-muted-foreground">Due: {format(new Date(task.deadline), "MMM d")}</span>
                          {task.meeting && (
                            <Link to={`/meetings/${task.meeting.meetingId}`} className="text-primary underline-offset-4 hover:underline">
                              {task.meeting.name}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                          ${task.priority === 3 ? "bg-red-100 text-red-800" : 
                            task.priority === 2 ? "bg-yellow-100 text-yellow-800" : 
                            "bg-green-100 text-green-800"}`}>
                          {task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No tasks assigned to you</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/tasks">View all tasks</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {loadingTaskStats ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full" />
              ))}
            </div>
          ) : taskStats ? (
            <TaskProgressChart 
              taskCompletion={{
                total: taskStats.tasksByStatus.reduce((acc, curr) => acc + curr.value, 0),
                completed: taskStats.tasksByStatus.find(s => s.name === "Completed")?.value || 0,
                percentage: taskStats.completionRate
              }}
              tasksByStatus={taskStats.tasksByStatus}
              tasksByPriority={taskStats.tasksByPriority}
            />
          ) : (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">No task statistics available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
