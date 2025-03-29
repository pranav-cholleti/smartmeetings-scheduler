
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Trash, X } from "lucide-react";

import { meetingService } from "@/services/meetingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Form schema validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Meeting name must be at least 3 characters",
  }),
  dateTime: z.date({
    required_error: "Please select a date and time for the meeting",
  }),
  isOnline: z.boolean().default(true),
  meetingLink: z.string().optional(),
  additionalComments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const [selectedAttendees, setSelectedAttendees] = useState<{userId: string; name: string; email: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isOnline: true,
      meetingLink: "",
      additionalComments: "",
    },
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (data: FormValues & { attendees: string[] }) => {
      return meetingService.createMeeting({
        name: data.name,
        dateTime: data.dateTime.toISOString(),
        attendees: data.attendees,
        isOnline: data.isOnline,
        meetingLink: data.meetingLink,
        additionalComments: data.additionalComments,
      });
    },
    onSuccess: (data) => {
      toast.success("Meeting created successfully!");
      navigate(`/meetings/${data._id}`);
    },
    onError: () => {
      toast.error("Failed to create meeting");
    },
  });

  // Fetch organization users for attendee selection
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["organization-users", searchTerm],
    queryFn: () => meetingService.getOrganizationUsers(searchTerm),
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const attendeeIds = selectedAttendees.map(attendee => attendee.userId);
    createMeetingMutation.mutate({
      ...values,
      attendees: attendeeIds,
    });
  };

  // Handle adding attendees
  const handleSelectAttendee = (user: {userId: string; name: string; email: string}) => {
    if (!selectedAttendees.some(attendee => attendee.userId === user.userId)) {
      setSelectedAttendees(prev => [...prev, user]);
    }
    setSearchTerm("");
  };

  // Handle removing attendees
  const handleRemoveAttendee = (userId: string) => {
    setSelectedAttendees(prev => prev.filter(attendee => attendee.userId !== userId));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Meeting</CardTitle>
          <CardDescription>Schedule a new meeting and invite attendees</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Quarterly Planning Meeting" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for your meeting
                    </FormDescription>
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
                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP p")
                            ) : (
                              <span>Pick a date</span>
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
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const date = field.value || new Date();
                              const [hours, minutes] = e.target.value.split(":");
                              date.setHours(parseInt(hours), parseInt(minutes));
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the date and time for the meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Attendees</FormLabel>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedAttendees.map((attendee) => (
                    <Badge key={attendee.userId} variant="secondary" className="pl-2 flex items-center gap-1">
                      <Avatar className="h-4 w-4 mr-1">
                        <AvatarImage src={`https://avatar.vercel.sh/${attendee.email}.png`} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {attendee.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => handleRemoveAttendee(attendee.userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Command>
                  <CommandInput 
                    placeholder="Search for people..." 
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>No users found</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      {users && users.map((user) => (
                        <CommandItem
                          key={user.userId}
                          onSelect={() => handleSelectAttendee({
                            userId: user.userId,
                            name: user.name,
                            email: user.email
                          })}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <FormDescription>
                  Search and select people to invite to this meeting
                </FormDescription>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="isOnline"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Online Meeting</FormLabel>
                      <FormDescription>
                        Toggle if this is an online meeting
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

              {form.watch("isOnline") && (
                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://meet.google.com/..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a link for participants to join the online meeting
                      </FormDescription>
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
                        placeholder="Please prepare the quarterly reports before the meeting..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional information or instructions for attendees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMeetingMutation.isPending}
                >
                  {createMeetingMutation.isPending ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
