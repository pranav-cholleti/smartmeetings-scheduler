
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Search, 
  SortAsc, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types";
import { Link } from "react-router-dom";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<"assigned" | "scheduled">("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
  });
  
  // Fetch assigned tasks
  const {
    data: assignedTasks,
    isLoading: loadingAssigned,
    refetch: refetchAssigned,
  } = useQuery({
    queryKey: [
      'tasks', 
      'assigned', 
      pagination.currentPage, 
      searchQuery, 
      filter, 
      sortBy, 
      sortOrder
    ],
    queryFn: () => taskService.getAssignedTasks(
      pagination.currentPage,
      pagination.limit,
      searchQuery || undefined,
      sortBy,
      sortOrder,
      filter
    ),
    enabled: activeTab === "assigned",
  });

  // Fetch scheduled tasks
  const {
    data: scheduledTasks,
    isLoading: loadingScheduled,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: [
      'tasks', 
      'scheduled', 
      pagination.currentPage, 
      searchQuery, 
      filter, 
      sortBy, 
      sortOrder
    ],
    queryFn: () => taskService.getScheduledTasks(
      pagination.currentPage,
      pagination.limit,
      searchQuery || undefined,
      sortBy,
      sortOrder,
      filter
    ),
    enabled: activeTab === "scheduled",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "assigned") {
      refetchAssigned();
    } else {
      refetchScheduled();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "assigned" | "scheduled");
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = activeTab === "assigned" 
      ? assignedTasks?.totalPages || 1 
      : scheduledTasks?.totalPages || 1;
      
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination({ ...pagination, currentPage: newPage });
    }
  };

  const getTaskData = () => {
    return activeTab === "assigned" ? assignedTasks : scheduledTasks;
  };

  const isLoading = activeTab === "assigned" ? loadingAssigned : loadingScheduled;
  const taskData = getTaskData();
  const totalItems = taskData?.totalTasks || 0;
  const totalPages = taskData?.totalPages || 1;
  const tasks = taskData?.tasks || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getProgressBadgeStyle = (progress: string) => {
    switch (progress) {
      case 'Not Started':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'In Progress':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Completed':
        return "bg-green-100 text-green-800 border-green-200";
      case 'Blocked':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) return <Badge className="bg-red-500">High</Badge>;
    if (priority <= 7) return <Badge className="bg-amber-500">Medium</Badge>;
    return <Badge className="bg-green-500">Low</Badge>;
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.taskId} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{task.taskName}</h3>
              {getPriorityBadge(task.priority)}
            </div>
            <div className="text-sm text-muted-foreground">
              {task.meeting ? (
                <Link 
                  to={`/meetings/${task.meeting.meetingId}`} 
                  className="hover:underline flex items-center gap-1"
                >
                  <span>From: {task.meeting.name}</span>
                </Link>
              ) : (
                <span>No meeting associated</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due: {formatDate(task.deadline)}
              </span>
              <Badge variant="outline" className={getProgressBadgeStyle(task.progress)}>
                {task.progress}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {task.assignees.map((assignee) => (
                <Badge key={assignee._id} variant="secondary" className="text-xs">
                  {assignee.name}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-auto justify-end">
              <Button size="sm" variant="outline">
                Update Progress
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your tasks from all meetings
        </p>
      </div>
      
      <Tabs 
        defaultValue="assigned" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled by Me</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <div className="flex gap-2">
            <Select 
              defaultValue={filter || "all"} 
              onValueChange={(value) => setFilter(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="taskName">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <div className="flex items-center">
                    <SortAsc className="mr-2 h-4 w-4" />
                    Ascending
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center">
                    <SortAsc className="mr-2 h-4 w-4 rotate-180" />
                    Descending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="assigned">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">No tasks assigned to you</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <p className="text-center text-muted-foreground">
                  {searchQuery || filter
                    ? "No tasks match your current filters."
                    : "You don't have any tasks assigned to you yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {tasks.map((task) => renderTaskCard(task))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">No tasks scheduled by you</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <p className="text-center text-muted-foreground">
                  {searchQuery || filter
                    ? "No tasks match your current filters."
                    : "You haven't scheduled any tasks as a meeting host yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {tasks.map((task) => renderTaskCard(task))}
            </div>
          )}
        </TabsContent>

        {/* Pagination */}
        {!isLoading && tasks.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {tasks.length} of {totalItems} tasks
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm">
                Page {pagination.currentPage} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
