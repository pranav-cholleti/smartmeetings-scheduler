
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { meetingService } from "@/services/meetingService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Calendar, Clock, Edit, ExternalLink, 
  MapPin, MessageSquare, Save, Upload, Users, X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { MeetingDetails, User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MeetingDetailsPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState("");
  const [selectedTab, setSelectedTab] = useState("details");
  const [isAddingAttendee, setIsAddingAttendee] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch meeting details
  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingId ? meetingService.getMeetingDetails(meetingId) : Promise.reject("No meeting ID"),
    onSuccess: (data) => {
      setEditedMinutes(data.formattedMinutesText || "");
    }
  });

  // Search organization users query
  const { data: orgUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['organizationUsers', searchTerm],
    queryFn: () => meetingService.getOrganizationUsers(searchTerm),
    enabled: isAddingAttendee
  });

  // Add attendee mutation
  const addAttendeeMutation = useMutation({
    mutationFn: (userId: string) => 
      meetingId ? meetingService.addAttendee(meetingId, userId) : Promise.reject("No meeting ID"),
    onSuccess: () => {
      toast.success("Attendee added successfully");
      refetch();
      setIsAddingAttendee(false);
    },
    onError: (error) => {
      toast.error("Failed to add attendee");
      console.error(error);
    }
  });

  // Update meeting minutes mutation
  const updateMinutesMutation = useMutation({
    mutationFn: (text: string) => 
      meetingId ? meetingService.updateMinutes(meetingId, text) : Promise.reject("No meeting ID"),
    onSuccess: () => {
      toast.success("Minutes saved successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to save minutes");
      console.error(error);
    }
  });

  // Upload minutes file mutation
  const uploadMinutesMutation = useMutation({
    mutationFn: (file: File) => 
      meetingId ? meetingService.uploadMinutesFile(meetingId, file) : Promise.reject("No meeting ID"),
    onSuccess: () => {
      toast.success("File uploaded successfully. Processing started.");
      setTimeout(() => refetch(), 2000); // Refresh after a short delay to allow processing
    },
    onError: (error) => {
      toast.error("Failed to upload file");
      console.error(error);
    }
  });

  // Extract action items mutation
  const extractActionsMutation = useMutation({
    mutationFn: () => 
      meetingId ? meetingService.extractActionItems(meetingId) : Promise.reject("No meeting ID"),
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.info("No action items found in the minutes");
      } else {
        toast.success(`${data.length} action items extracted`);
        setSelectedTab("actions");
      }
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to extract action items");
      console.error(error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Meeting not found</h2>
        <p className="text-muted-foreground mb-6">
          The meeting you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/meetings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meetings
        </Button>
      </div>
    );
  }

  const isHost = meeting.userRole === 'host';
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX files only.");
      return;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }
    
    uploadMinutesMutation.mutate(file);
  };

  const filterAttendees = (role: 'host' | 'attendee') => {
    return meeting.attendees.filter(attendee => attendee.role === role);
  };

  const hosts = filterAttendees('host');
  const attendees = filterAttendees('attendee');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/meetings')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
          <h1 className="text-3xl font-bold">{meeting.name}</h1>
          <div className="flex items-center mt-1 text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(meeting.dateTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={meeting.isOnline ? "outline" : "default"}>
            {meeting.isOnline ? "Online" : "In-Person"}
          </Badge>
          <Badge variant={isHost ? "default" : "outline"}>
            {isHost ? "Host" : "Attendee"}
          </Badge>
        </div>
      </div>

      <Tabs 
        defaultValue="details" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Meeting Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Meeting Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meeting.isOnline && meeting.meetingLink && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Meeting Link</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={meeting.meetingLink} 
                      readOnly 
                      className="bg-muted"
                    />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => window.open(meeting.meetingLink, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {!meeting.isOnline && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>In-person meeting</span>
                  </div>
                </div>
              )}
              {meeting.additionalComments && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Additional Comments</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{meeting.additionalComments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Participants</CardTitle>
              {isHost && (
                <Dialog open={isAddingAttendee} onOpenChange={setIsAddingAttendee}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Add Attendee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Attendee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Search by name or email"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {loadingUsers ? (
                          <div className="flex justify-center p-4">
                            <Spinner />
                          </div>
                        ) : (orgUsers && orgUsers.length > 0) ? (
                          <div className="space-y-2">
                            {orgUsers.map((user) => (
                              <div 
                                key={user.userId} 
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => addAttendeeMutation.mutate(user.userId)}
                                  disabled={addAttendeeMutation.isPending}
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-4">
                            No users found. Try a different search term.
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Hosts ({hosts.length})</h3>
                  <div className="space-y-2">
                    {hosts.map((host) => (
                      <div 
                        key={host.userId} 
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{host.name}</p>
                          <p className="text-xs text-muted-foreground">{host.email}</p>
                        </div>
                        <Badge>Host</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Attendees ({attendees.length})</h3>
                  {attendees.length > 0 ? (
                    <div className="space-y-2">
                      {attendees.map((attendee) => (
                        <div 
                          key={attendee.userId} 
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{attendee.name}</p>
                            <p className="text-xs text-muted-foreground">{attendee.email}</p>
                          </div>
                          {isHost && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                Promote to Host
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No additional attendees
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Minutes Tab */}
        <TabsContent value="minutes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Meeting Minutes</CardTitle>
              {isHost && (
                <div className="flex items-center gap-2">
                  {meeting.uploadedMinutes ? (
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {meeting.uploadedMinutes.originalFilename}
                    </p>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        disabled={uploadMinutesMutation.isPending}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadMinutesMutation.isPending ? "Uploading..." : "Upload Minutes"}
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isHost && (
                <div className="flex items-center justify-end gap-2 mb-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateMinutesMutation.mutate(editedMinutes)}
                        disabled={updateMinutesMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Minutes
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Minutes
                    </Button>
                  )}
                </div>
              )}
              
              {isEditing ? (
                <Textarea
                  value={editedMinutes}
                  onChange={(e) => setEditedMinutes(e.target.value)}
                  className="min-h-[400px]"
                  placeholder="Enter meeting minutes here..."
                />
              ) : meeting.formattedMinutesText ? (
                <div className="p-4 border rounded-md min-h-[400px] whitespace-pre-line">
                  {meeting.formattedMinutesText}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <h3 className="text-lg font-medium mb-2">No minutes available yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isHost 
                      ? "Upload minutes or create them directly here" 
                      : "The meeting host hasn't added any minutes yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Action Items</CardTitle>
              {isHost && meeting.formattedMinutesText && (
                <Button
                  variant="outline"
                  onClick={() => extractActionsMutation.mutate()}
                  disabled={extractActionsMutation.isPending || !meeting.formattedMinutesText}
                >
                  <span className="mr-2">🤖</span>
                  Extract Action Items
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium mb-2">Action Items Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  This feature is under development. Check back later!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Meeting Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  The meeting dashboard with analytics and progress tracking is coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
