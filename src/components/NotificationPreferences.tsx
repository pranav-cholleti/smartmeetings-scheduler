
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Bell, Clock, CheckCircle, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: true,
    meetingReminders: true,
    taskDeadlineReminders: true,
    aiInsights: true,
  });
  
  const { isLoading: isLoadingPreferences } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const data = await userService.getNotificationPreferences();
      setPreferences(data);
      return data;
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (newPreferences: typeof preferences) => {
      await userService.updateNotificationPreferences(newPreferences);
    },
    onSuccess: () => {
      toast.success("Notification preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update notification preferences");
    },
  });
  
  const handleSave = async () => {
    await mutation.mutateAsync(preferences);
  };
  
  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  if (isLoadingPreferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
          </div>
          <Switch
            checked={preferences.email}
            onCheckedChange={() => handleToggle("email")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Meeting Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminders before your meetings</p>
            </div>
          </div>
          <Switch
            checked={preferences.meetingReminders}
            onCheckedChange={() => handleToggle("meetingReminders")}
            disabled={!preferences.email}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Task Deadline Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified about approaching task deadlines</p>
            </div>
          </div>
          <Switch
            checked={preferences.taskDeadlineReminders}
            onCheckedChange={() => handleToggle("taskDeadlineReminders")}
            disabled={!preferences.email}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <div>
              <p className="font-medium">AI Insights</p>
              <p className="text-sm text-muted-foreground">Receive AI-generated insights about your meetings</p>
            </div>
          </div>
          <Switch
            checked={preferences.aiInsights}
            onCheckedChange={() => handleToggle("aiInsights")}
            disabled={!preferences.email}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={mutation.isPending}
          className="w-full"
        >
          {mutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

export default NotificationPreferences;
