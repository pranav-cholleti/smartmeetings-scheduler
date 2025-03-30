
import { useState } from "react";
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

type ProgressStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";

interface TaskProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (progress: ProgressStatus) => void;
  isLoading: boolean;
  taskName?: string;
  currentProgress?: ProgressStatus;
}

export default function TaskProgressDialog({
  isOpen,
  onClose,
  onUpdate,
  isLoading,
  taskName = "Task",
  currentProgress,
}: TaskProgressDialogProps) {
  const [selectedProgress, setSelectedProgress] = useState<ProgressStatus | undefined>(
    currentProgress
  );

  const handleSubmit = () => {
    if (selectedProgress) {
      onUpdate(selectedProgress);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Task Progress</DialogTitle>
          <DialogDescription>
            {taskName ? `Update progress for "${taskName}"` : "Update task progress status"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select
            value={selectedProgress}
            onValueChange={(value) => setSelectedProgress(value as ProgressStatus)}
          >
            <SelectTrigger>
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedProgress || isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
