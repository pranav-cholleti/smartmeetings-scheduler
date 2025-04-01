
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ExternalLink, MoreVertical, Trash2, Edit, LayoutDashboard } from 'lucide-react';
import { Meeting } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface MeetingCardProps {
  meeting: Meeting;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  deletingId?: string;
}

export default function MeetingCard({ 
  meeting, 
  onDelete,
  isDeleting,
  deletingId 
}: MeetingCardProps) {
  const formattedDate = format(
    new Date(meeting.dateTime),
    'MMM d, yyyy h:mm a'
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete && window.confirm('Are you sure you want to delete this meeting?')) {
      onDelete(meeting.meetingId);
    }
  };

  const isCurrentlyDeleting = isDeleting && deletingId === meeting.meetingId;

  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <Link 
              to={`/meetings/${meeting.meetingId}`}
              className="flex-1 hover:underline focus:underline font-medium"
            >
              {meeting.name}
            </Link>
            
            <div className="flex items-center">
              <Badge variant={meeting.userRole === 'host' ? 'default' : 'secondary'}>
                {meeting.userRole === 'host' ? 'Host' : 'Attendee'}
              </Badge>
              {onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 ml-2"
                      disabled={isCurrentlyDeleting}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/meetings/${meeting.meetingId}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/meetings/${meeting.meetingId}/dashboard`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {meeting.userRole === 'host' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={`/meetings/${meeting.meetingId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Meeting
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={handleDelete}
                          disabled={isCurrentlyDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isCurrentlyDeleting ? 'Deleting...' : 'Delete Meeting'}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/meetings/${meeting.meetingId}`}>
                View Details
              </Link>
            </Button>
            
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/meetings/${meeting.meetingId}/dashboard`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
