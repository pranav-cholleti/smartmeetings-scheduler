
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  CheckCircle2, ChevronLeft, ChevronRight, Search, 
  SortAsc
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import TaskCard from "@/components/TaskCard";

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

  // Update task progress mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, progress }: { taskId: string, progress: "Not Started" | "In Progress" | "Completed" | "Blocked" }) => 
      taskService.updateTaskProgress(taskId, progress),
    onSuccess: () => {
      toast.success("Task progress updated successfully");
      // Refetch tasks based on active tab
      if (activeTab === "assigned") {
        refetchAssigned();
      } else {
        refetchScheduled();
      }
    },
    onError: (error) => {
      toast.error("Failed to update task progress");
      console.error("Error updating task progress:", error);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      toast.success("Task deleted successfully");
      // Refetch tasks based on active tab
      if (activeTab === "assigned") {
        refetchAssigned();
      } else {
        refetchScheduled();
      }
    },
    onError: (error) => {
      toast.error("Failed to delete task");
      console.error("Error deleting task:", error);
    }
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

  const handleUpdateProgress = (taskId: string, progress: "Not Started" | "In Progress" | "Completed" | "Blocked") => {
    updateTaskMutation.mutate({ taskId, progress });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const getTaskData = () => {
    return activeTab === "assigned" ? assignedTasks : scheduledTasks;
  };

  const isLoading = activeTab === "assigned" ? loadingAssigned : loadingScheduled;
  const taskData = getTaskData();
  const totalItems = taskData?.totalTasks || 0;
  const totalPages = taskData?.totalPages || 1;
  const tasks = taskData?.tasks || [];

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
              {tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onUpdateProgress={handleUpdateProgress}
                  onDelete={handleDeleteTask}
                  isUpdating={updateTaskMutation.isPending}
                  isDeleting={deleteTaskMutation.isPending}
                  updatingTaskId={updateTaskMutation.variables?.taskId}
                  deletingTaskId={deleteTaskMutation.variables as string | undefined}
                />
              ))}
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
              {tasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onUpdateProgress={handleUpdateProgress}
                  onDelete={handleDeleteTask}
                  isUpdating={updateTaskMutation.isPending}
                  isDeleting={deleteTaskMutation.isPending}
                  updatingTaskId={updateTaskMutation.variables?.taskId}
                  deletingTaskId={deleteTaskMutation.variables as string | undefined}
                />
              ))}
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
