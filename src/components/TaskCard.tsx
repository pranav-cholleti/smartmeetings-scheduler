
import { useState } from "react";
import { Link } from "react-router-dom";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Clock, X } from "lucide-react";
import TaskProgressDialog from "./TaskProgressDialog";

interface TaskCardProps {
  task: Task;
  onUpdateProgress: (taskId: string, progress: "Not Started" | "In Progress" | "Completed" | "Blocked") => void;
  onDelete: (taskId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  updatingTaskId?: string;
  deletingTaskId?: string;
}

export default function TaskCard({
  task,
  onUpdateProgress,
  onDelete,
  isUpdating,
  isDeleting,
  updatingTaskId,
  deletingTaskId,
}: TaskCardProps) {
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

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

  const handleProgressUpdate = (progress: "Not Started" | "In Progress" | "Completed" | "Blocked") => {
    onUpdateProgress(task.taskId, progress);
    setIsProgressDialogOpen(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete(task.taskId);
    }
  };

  return (
    <>
      <Card className="mb-4">
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
                  <Badge key={assignee.userId} variant="secondary" className="text-xs">
                    {assignee.name}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-auto justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsProgressDialogOpen(true)}
                  disabled={isUpdating && task.taskId === updatingTaskId}
                >
                  {isUpdating && task.taskId === updatingTaskId ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : null}
                  Update Progress
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-500"
                  onClick={handleDelete}
                  disabled={isDeleting && task.taskId === deletingTaskId}
                >
                  {isDeleting && task.taskId === deletingTaskId ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskProgressDialog 
        isOpen={isProgressDialogOpen}
        onClose={() => setIsProgressDialogOpen(false)}
        onUpdate={handleProgressUpdate}
        isLoading={isUpdating && task.taskId === updatingTaskId}
        taskName={task.taskName}
        currentProgress={task.progress}
      />
    </>
  );
}
