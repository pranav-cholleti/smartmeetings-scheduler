
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  BarChart,
  Trash,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MeetingCardProps {
  id: string;
  title: string;
  dateTime: string;
  duration?: number;
  location?: string;
  attendees?: number;
  userRole: "host" | "attendee" | "invitee";
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  onDeleteClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
}

export default function MeetingCard({
  id,
  title,
  dateTime,
  duration = 60,
  location = "Online",
  attendees = 0,
  userRole = "attendee",
  status = "upcoming",
  onDeleteClick,
  onEditClick,
}: MeetingCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const date = parseISO(dateTime);
  const formattedDate = format(date, "MMM dd, yyyy");
  const formattedTime = format(date, "h:mm a");
  const formattedDuration = `${Math.floor(duration / 60)}h ${duration % 60}m`;
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  // Status badge styling
  const statusBadgeVariant = () => {
    switch (status) {
      case 'ongoing': return 'default';
      case 'upcoming': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  // Role badge styling
  const roleBadgeVariant = () => {
    switch (userRole) {
      case 'host': return 'default';
      case 'attendee': return 'secondary';
      case 'invitee': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{title}</h3>
                <Badge variant={statusBadgeVariant()} className="text-xs">
                  {status}
                </Badge>
                <Badge variant={roleBadgeVariant()} className="text-xs">
                  {userRole}
                </Badge>
              </div>
              
              <div className="flex items-center mt-2 text-muted-foreground text-sm">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span className="mr-4">{formattedDate}</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{formattedTime}</span>
                <span className="mx-1">•</span>
                <span>{formattedDuration}</span>
              </div>
            </div>
            
            <div className="flex items-center mt-3 md:mt-0 gap-2">
              <Link to={`/meetings/${id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              
              <Link to={`/meetings/${id}/dashboard`}>
                <Button variant="default" size="sm" className="flex items-center">
                  <BarChart className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userRole === "host" && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onEditClick?.(id)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteClick?.(id)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Meeting
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpanded}
            className="mt-2 text-xs text-muted-foreground flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> 
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> 
                Show more
              </>
            )}
          </Button>
        </div>
        
        {/* Expanded content */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 bg-muted/30",
          expanded ? "max-h-48" : "max-h-0"
        )}>
          <div className="p-4 pt-0 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Location</h4>
                <p className="text-sm text-muted-foreground">{location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Details</h4>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {attendees} {attendees === 1 ? 'attendee' : 'attendees'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created {timeAgo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
