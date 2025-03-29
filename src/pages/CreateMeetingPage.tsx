
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { meetingService } from "@/services/meetingService";
import { taskService } from "@/services/taskService";

const formSchema = z.object({
  name: z.string().min(3, "Meeting name must be at least 3 characters"),
  dateTime: z.date({
    required_error: "Date and time are required",
  }),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().optional()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Meeting link must start with http:// or https://"
    ),
  additionalComments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{userId: string, name: string, email: string}[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<{userId: string, name: string, email: string}[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isOnline: false,
      meetingLink: "",
      additionalComments: "",
    },
  });

  const watchIsOnline = form.watch("isOnline");
  
  // Validate meetingLink when isOnline changes
  useEffect(() => {
    if (watchIsOnline) {
      form.trigger("meetingLink");
    }
  }, [watchIsOnline, form]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const users = await taskService.getOrganisationUsers(query);
      // Filter out already selected attendees
      const filteredUsers = users.filter(
        (user) => !selectedAttendees.some((selected) => selected.userId === user.userId)
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const addAttendee = (attendee: {userId: string, name: string, email: string}) => {
    setSelectedAttendees([...selectedAttendees, attendee]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeAttendee = (userId: string) => {
    setSelectedAttendees(selectedAttendees.filter((a) => a.userId !== userId));
  };

  async function onSubmit(data: FormValues) {
    // Validate meeting link for online meetings
    if (data.isOnline && (!data.meetingLink || !data.meetingLink.trim())) {
      toast.error("Meeting link is required for online meetings");
      return;
    }

    setLoading(true);
    try {
      const meetingData = {
        name: data.name,
        dateTime: data.dateTime.toISOString(),
        attendees: selectedAttendees.map(a => a.userId),
        isOnline: data.isOnline,
        meetingLink: data.isOnline ? data.meetingLink : undefined,
        additionalComments: data.additionalComments?.trim() || undefined,
      };

      const response = await meetingService.createMeeting(meetingData);
      toast.success("Meeting created successfully!");
      navigate(`/meetings/${response._id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Meeting</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new meeting with your team
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Quarterly Review" {...field} />
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
                  <FormLabel>Date and Time*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                        className="p-3 pointer-events-auto"
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              field.onChange(newDate);
                            }}
                            defaultValue={
                              field.value 
                              ? `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}`
                              : "12:00"
                            }
                          />
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Attendees</FormLabel>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for users in your organisation"
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              {/* Selected attendees */}
              {selectedAttendees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedAttendees.map((attendee) => (
                    <Badge key={attendee.userId} variant="secondary" className="flex items-center gap-1">
                      {attendee.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => removeAttendee(attendee.userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Search results */}
              {searching ? (
                <div className="flex justify-center py-2">
                  <Spinner size="sm" />
                </div>
              ) : searchResults.length > 0 ? (
                <Card className="mt-2 p-2 max-h-60 overflow-y-auto">
                  <ul>
                    {searchResults.map((user) => (
                      <li key={user.userId}>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex items-start justify-start w-full text-left p-2"
                          onClick={() => addAttendee(user)}
                        >
                          <div>
                            <p>{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : searchQuery.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">No users found</p>
              )}
              
              <p className="text-xs text-muted-foreground">
                {selectedAttendees.length === 0 
                  ? "No attendees selected yet" 
                  : `${selectedAttendees.length} attendee${selectedAttendees.length > 1 ? 's' : ''} selected`}
              </p>
            </div>

            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Online Meeting</FormLabel>
                    <FormDescription>
                      Check this if the meeting will be conducted online
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {watchIsOnline && (
              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://meet.google.com/..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL for the online meeting (required for online meetings)
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
                      placeholder="Add any additional information about this meeting..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Spinner className="mr-2" size="sm" />}
                Create Meeting
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
