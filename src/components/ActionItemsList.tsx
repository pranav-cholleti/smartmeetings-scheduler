
import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActionItemSuggestion } from '@/types';

interface ActionItemsListProps {
  actionItems: ActionItemSuggestion[];
  onExtractItems?: () => Promise<void>;
  isLoading?: boolean;
}

export function ActionItemsList({ actionItems, onExtractItems, isLoading = false }: ActionItemsListProps) {
  const getPriorityDetails = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
      case 2:
        return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default:
        return { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Tasks and action items from this meeting</CardDescription>
      </CardHeader>
      <CardContent>
        {actionItems && actionItems.length > 0 ? (
          <div className="space-y-4">
            {actionItems.map((item, index) => {
              const priorityInfo = getPriorityDetails(item.priority);
              
              return (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{item.taskName}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.deadline ? format(new Date(item.deadline), "MMM d, yyyy") : "No deadline"}
                        </Badge>
                        <Badge variant="outline" className={priorityInfo.color}>
                          Priority: {priorityInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {item.suggestedAssignees && item.suggestedAssignees.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Suggested assignees:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.suggestedAssignees.map((assignee) => (
                          <Badge key={assignee} variant="secondary" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assignee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {item.context && (
                    <div className="mt-3 text-sm text-muted-foreground border-t pt-2">
                      <p className="italic">{item.context}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No action items found for this meeting</p>
            {onExtractItems && (
              <Button 
                variant="outline" 
                onClick={onExtractItems}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Extract Action Items from Minutes"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
