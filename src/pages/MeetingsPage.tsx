
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarIcon, ChevronLeft, ChevronRight, PlusCircle, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { meetingService } from "@/services/meetingService";
import { Meeting } from "@/types";

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("dateTime");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMeetings: 0,
    limit: 10,
  });

  const fetchMeetings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await meetingService.getMeetings(
        page, 
        pagination.limit, 
        searchQuery || undefined,
        sortBy,
        sortOrder,
        filter
      );
      setMeetings(response.meetings);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalMeetings: response.totalMeetings,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMeetings(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMeetings(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
  
    if (isSameDay(date, today)) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, tomorrow)) {
      return 'Tomorrow, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    return formatDate(dateString);
  };

  const handleViewDashboard = (meetingId: string) => {
    navigate(`/meetings/${meetingId}?tab=dashboard`);
  };
  
  const handleViewDetails = (meetingId: string) => {
    navigate(`/meetings/${meetingId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your meetings
          </p>
        </div>
        <Button asChild>
          <Link to="/meetings/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Meeting
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search meetings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <div className="flex gap-2">
          <Select 
            defaultValue={filter || "all"} 
            onValueChange={(value) => setFilter(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="host">As Host</SelectItem>
              <SelectItem value="attendee">As Attendee</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateTime">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-3 mb-4">
                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No meetings found</h3>
              <p className="text-muted-foreground text-center mt-1 mb-4">
                {searchQuery || filter 
                  ? "No meetings match your current filters." 
                  : "You don't have any meetings yet."}
              </p>
              <Button asChild>
                <Link to="/meetings/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Meeting
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          meetings.map((meeting) => (
            <Card key={meeting.meetingId} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className="mr-4 hidden md:block">
                      <div className="bg-muted p-2 rounded flex items-center justify-center h-12 w-12">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{meeting.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {getRelativeTime(meeting.dateTime)}
                      </div>
                      <Badge variant={meeting.userRole === 'host' ? 'default' : 'outline'} className="mt-2">
                        {meeting.userRole === 'host' ? 'Host' : 'Attendee'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDashboard(meeting.meetingId)}
                    >
                      Dashboard
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(meeting.meetingId)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/meetings/${meeting.meetingId}?tab=minutes`)}>
                          View Minutes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/meetings/${meeting.meetingId}?tab=actions`)}>
                          Action Items
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Pagination */}
        {!loading && meetings.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {meetings.length} of {pagination.totalMeetings} meetings
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
