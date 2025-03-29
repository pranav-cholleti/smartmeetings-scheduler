
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface TaskProgressChartProps {
  taskCompletion: {
    completed: number;
    total: number;
    percentage: number;
  };
  tasksByStatus: {
    name: string;
    value: number;
  }[];
  tasksByPriority: {
    name: string;
    value: number;
  }[];
}

export function TaskProgressChart({ taskCompletion, tasksByStatus, tasksByPriority }: TaskProgressChartProps) {
  // Colors for charts
  const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444'];
  const PRIORITY_COLORS = ['#ef4444', '#f97316', '#22c55e'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Task Completion Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Task Completion</CardTitle>
          <CardDescription>Overall progress of assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="font-medium">{taskCompletion.percentage}%</span>
            </div>
            <Progress value={taskCompletion.percentage} className="h-2" />
            
            <div className="text-sm text-muted-foreground mt-2">
              <span>{taskCompletion.completed} out of {taskCompletion.total} tasks completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tasks by Status</CardTitle>
          <CardDescription>Distribution of tasks by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            {tasksByStatus.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-muted-foreground">No task data available</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Priority */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tasks by Priority</CardTitle>
          <CardDescription>Distribution of tasks by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {tasksByPriority.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByPriority}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Task Count">
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-muted-foreground">No priority data available</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
