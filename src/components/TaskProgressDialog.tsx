
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type ProgressStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";

interface TaskProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (progress: ProgressStatus) => void;
  isLoading: boolean;
  taskName?: string;
  currentProgress?: ProgressStatus;
  taskId?: string;
}

export default function TaskProgressDialog({
  isOpen,
  onClose,
  onUpdate,
  isLoading,
  taskName = "Task",
  currentProgress,
  taskId,
}: TaskProgressDialogProps) {
  const [selectedProgress, setSelectedProgress] = useState<ProgressStatus | undefined>(
    currentProgress
  );

  // Reset selected progress when dialog opens with new task
  useEffect(() => {
    setSelectedProgress(currentProgress);
  }, [currentProgress, isOpen]);

  const handleSubmit = () => {
    if (selectedProgress) {
      onUpdate(selectedProgress);
      toast.success(`Task status updated to ${selectedProgress}`);
    }
  };
  
  const handleDialogClose = () => {
    // Reset the selected progress when dialog closes
    setSelectedProgress(currentProgress);
    onClose();
  };

  const getProgressBadgeVariant = (status: ProgressStatus) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "default";
      case "Blocked":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Task Progress</DialogTitle>
          <DialogDescription>
            {taskName ? `Update progress for "${taskName}"` : "Update task progress status"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {currentProgress && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Current status:</span>
              <Badge variant={getProgressBadgeVariant(currentProgress) as any}>
                {currentProgress}
              </Badge>
            </div>
          )}
          
          <Select
            value={selectedProgress}
            onValueChange={(value) => setSelectedProgress(value as ProgressStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new progress status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleDialogClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedProgress || isLoading || selectedProgress === currentProgress}
            variant={selectedProgress === "Completed" ? "secondary" : "default"}
            className={selectedProgress === "Completed" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
