
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { taskService } from "@/services/taskService";
import { Task, TasksResponse } from "@/types";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("asc");

  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    limit: 10,
  });

  const fetchTasks = async (tab: string, page = 1) => {
    setLoading(true);
    try {
      let response: TasksResponse;
      
      if (tab === "assigned") {
        response = await taskService.getAssignedTasks(
          page,
          pagination.limit,
          searchQuery || undefined,
          sortBy,
          sortOrder,
          filter
        );
        setAssignedTasks(response.tasks);
      } else {
        response = await taskService.getScheduledTasks(
          page,
          pagination.limit,
          searchQuery || undefined,
          sortBy,
          sortOrder,
          filter
        );
        setScheduledTasks(response.tasks);
      }
      
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalTasks: response.totalTasks,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filter, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks(activeTab, 1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTasks(activeTab, newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const getTaskStatusBadge = (progress: string) => {
    const className = `task-status-${progress.toLowerCase().replace(/\s+/g, "-")}`;
    return <Badge className={className}>{progress}</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    return (
      <Badge variant="outline" className={`task-priority-${priority}`}>
        P{priority}
      </Badge>
    );
  };

  const currentTasks = activeTab === "assigned" ? assignedTasks : scheduledTasks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your tasks across all meetings
        </p>
      </div>

      <Tabs defaultValue="assigned" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled by Me</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  <SelectItem value="all">All</SelectItem>
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
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="assigned">
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : assignedTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No tasks found</h3>
                    <p className="text-muted-foreground text-center mt-1">
                      {searchQuery || filter
                        ? "No tasks match your current filters."
                        : "You don't have any assigned tasks yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                renderTasksList(currentTasks)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : scheduledTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No tasks found</h3>
                    <p className="text-muted-foreground text-center mt-1">
                      {searchQuery || filter
                        ? "No tasks match your current filters."
                        : "You haven't scheduled any tasks yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                renderTasksList(currentTasks)
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Pagination */}
      {!loading && currentTasks.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {currentTasks.length} of {pagination.totalTasks} tasks
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
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  function renderTasksList(tasks: Task[]) {
    return (
      <>
        {tasks.map((task) => (
          <Card key={task.taskId} className="overflow-hidden">
            <div className={`h-1 task-priority-${task.priority}`} />
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{task.taskName}</h3>
                    {getPriorityBadge(task.priority)}
                    {getTaskStatusBadge(task.progress)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Due:</span> {formatDate(task.deadline)}
                  </p>
                  
                  {task.meeting && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Meeting:</span>
                      <Button variant="link" asChild className="h-auto p-0 text-primary">
                        <Link to={`/meetings/${task.meeting.meetingId}`}>
                          {task.meeting.name} <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sm text-muted-foreground">Assignees:</span>
                      {task.assignees.map((assignee) => (
                        <Badge key={assignee._id} variant="outline" className="ml-1">
                          {assignee.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {task.additionalComments && (
                    <p className="text-sm text-gray-700 mt-2">{task.additionalComments}</p>
                  )}
                </div>
                
                {activeTab === "assigned" && (
                  <div className="mt-4 md:mt-0 flex md:flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </div>
                )}
                
                {activeTab === "scheduled" && (
                  <div className="mt-4 md:mt-0 flex md:flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }
}
