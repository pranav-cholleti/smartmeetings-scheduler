
import { Task } from "@/types";

/**
 * Sorts tasks based on the following criteria:
 * 1. Primary sort by priority (ascending, where lower number is higher priority)
 * 2. For same priority tasks, sort incomplete tasks with approaching deadlines first
 * 3. Then sort by completion status (incomplete tasks before complete)
 */
export const sortTasksComplex = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // First sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    const aIsIncomplete = a.progress !== "Completed";
    const bIsIncomplete = b.progress !== "Completed";
    
    // If one task is complete and the other isn't, put incomplete first
    if (aIsIncomplete !== bIsIncomplete) {
      return aIsIncomplete ? -1 : 1;
    }
    
    // If both tasks have the same completion status and are incomplete,
    // sort by deadline (approaching deadlines first)
    if (aIsIncomplete && bIsIncomplete) {
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      return deadlineA - deadlineB;
    }
    
    // If both are complete, sort by completion date if available
    if (a.completedAt && b.completedAt) {
      const completedAtA = new Date(a.completedAt).getTime();
      const completedAtB = new Date(b.completedAt).getTime();
      return completedAtB - completedAtA; // Most recently completed first
    }
    
    // Default sorting by task name
    return a.taskName.localeCompare(b.taskName);
  });
};

/**
 * Overloaded function that takes a tasks array and filters with complete sort criteria
 */
export const sortAndFilterTasks = (
  tasks: Task[],
  filters?: {
    progress?: Array<"Not Started" | "In Progress" | "Completed" | "Blocked">;
    priority?: "high" | "medium" | "low";
    searchTerm?: string;
  }
): Task[] => {
  let filteredTasks = [...tasks];
  
  // Apply progress filter
  if (filters?.progress && filters.progress.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      filters.progress?.includes(task.progress)
    );
  }
  
  // Apply priority filter
  if (filters?.priority) {
    filteredTasks = filteredTasks.filter(task => {
      if (filters.priority === "high") return task.priority <= 3;
      if (filters.priority === "medium") return task.priority > 3 && task.priority <= 7;
      if (filters.priority === "low") return task.priority > 7;
      return true;
    });
  }
  
  // Apply search filter
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(task => {
      return (
        task.taskName.toLowerCase().includes(term) ||
        task.meeting?.name.toLowerCase().includes(term) ||
        task.assignees.some(a => a.name.toLowerCase().includes(term))
      );
    });
  }
  
  // Apply complex sorting
  return sortTasksComplex(filteredTasks);
};
