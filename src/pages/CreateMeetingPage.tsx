import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { meetingService } from "@/services/meetingService";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Form schema
const formSchema = z.object({
  name: z.string().min(3, "Meeting name must be at least 3 characters"),
  dateTime: z.date(),
  attendees: z.array(z.string()),
  isOnline: z.boolean().default(true),
  meetingLink: z.string().optional(),
  additionalComments: z.string().optional(),
});

// Meeting creation form component
export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dateTime: new Date(),
      attendees: [],
      isOnline: true,
      meetingLink: "",
      additionalComments: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const meetingData = {
        ...values,
        dateTime: format(values.dateTime, "yyyy-MM-dd'T'HH:mm:ss"),
        attendees: selectedUsers.map(user => user.id),
      };
      
      const createdMeeting = await meetingService.createMeeting(meetingData);
      toast.success("Meeting created successfully");
      navigate(`/meetings/${createdMeeting.meetingId}`);
    } catch (error) {
      toast.error("Failed to create meeting");
      console.error("Error creating meeting:", error);
    }
  };

  // Fetch organization users
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["organization-users", searchQuery],
    queryFn: () => meetingService.getOrganizationUsers(searchQuery),
  });

  // Handle adding a user as attendee
  const handleAddUser = (user: { id: string; name: string; email: string }) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      form.setValue('attendees', [...form.getValues('attendees'), user.id]);
    }
  };

  // Handle removing a user from attendees
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    form.setValue('attendees', form.getValues('attendees').filter(id => id !== userId));
  };

  // Filter users for dropdown
  const filteredUsers = users?.filter(user => 
    !selectedUsers.some(selectedUser => selectedUser.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Meeting</CardTitle>
        <CardDescription>Schedule a new meeting with your team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meeting name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date and Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP h:mm a")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the date and time for the meeting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Attendees</FormLabel>
              <Card className="border-none shadow-sm">
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <Badge key={user.id} variant="secondary" className="gap-x-2 items-center">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user.name}
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Attendees
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px]">
                      <div className="space-y-2">
                        <Input
                          type="search"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {loadingUsers ? (
                          <p>Loading users...</p>
                        ) : filteredUsers && filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <Button
                              key={user.id}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleAddUser(user)}
                            >
                              <Avatar className="mr-2 h-5 w-5">
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {user.name} ({user.email})
                            </Button>
                          ))
                        ) : (
                          <p>No users found.</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
              <FormDescription>
                Add people to the meeting.
              </FormDescription>
              <FormMessage />
            </div>
            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Online Meeting</FormLabel>
                    <FormDescription>
                      Enable if this meeting will be conducted online.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.getValues("isOnline") && (
              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter meeting link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional comments here."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter>
              <Button type="submit">Create Meeting</Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
