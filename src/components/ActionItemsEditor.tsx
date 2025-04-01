
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Save, Trash2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressStatus } from './TaskProgressDialog';
import { Task, User } from '@/types';

interface ActionItemsEditorProps {
  actionItems: Task[];
  isHost: boolean;
  meetingId: string;
  onSave: (items: any[]) => Promise<void>;
  onExtract: () => Promise<void>;
  availableUsers: User[];
  isLoading?: boolean;
  isExtracting?: boolean;
}

export function ActionItemsEditor({
  actionItems = [],
  isHost,
  meetingId,
  onSave,
  onExtract,
  availableUsers = [],
  isLoading = false,
  isExtracting = false,
}: ActionItemsEditorProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Initialize items from props
  useEffect(() => {
    if (actionItems?.length) {
      setItems(actionItems.map(item => ({
        ...item,
        isNew: false,
        isModified: false
      })));
    } else {
      setItems([]);
    }
  }, [actionItems]);

  const handleAddItem = () => {
    const newItem = {
      taskId: `new-${Date.now()}`,
      taskName: '',
      assignees: [],
      deadline: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: 3,
      progress: 'Not Started' as ProgressStatus,
      additionalComments: '',
      isNew: true,
      isModified: true
    };
    setItems([...items, newItem]);
    setExpandedItem(newItem.taskId);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      isModified: true
    };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSaveItems = async () => {
    // Filter out only items that are new or modified
    const itemsToSave = items
      .filter(item => item.isNew || item.isModified)
      .map(({ isNew, isModified, ...item }) => ({
        ...item,
        meetingId
      }));
    
    if (itemsToSave.length > 0) {
      await onSave(itemsToSave);
    }
  };

  const toggleItem = (taskId: string) => {
    if (expandedItem === taskId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(taskId);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Action Items</CardTitle>
          <CardDescription>Tasks and action items from this meeting</CardDescription>
        </div>
        <div className="flex space-x-2">
          {isHost && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              )}
              <Button 
                onClick={onExtract}
                disabled={isExtracting}
                variant="secondary"
              >
                {isExtracting && <Spinner className="mr-2 h-4 w-4" />}
                Extract with AI
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-6">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No action items found</p>
            {isHost && (
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={handleAddItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Action Item
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Task</TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <React.Fragment key={item.taskId}>
                  <TableRow className={expandedItem === item.taskId ? "bg-muted/50" : ""}>
                    <TableCell>
                      {isEditing && expandedItem === item.taskId ? (
                        <Input 
                          value={item.taskName} 
                          onChange={(e) => handleUpdateItem(index, 'taskName', e.target.value)} 
                          placeholder="Task name" 
                        />
                      ) : (
                        item.taskName
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && expandedItem === item.taskId ? (
                        <Select 
                          onValueChange={(value) => handleUpdateItem(index, 'assignees', [...item.assignees, { _id: value, name: availableUsers.find(u => u.userId === value)?.name || '' }])}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.userId} value={user.userId}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.assignees?.map((assignee: any) => (
                            <div 
                              key={assignee._id} 
                              className="bg-muted rounded px-2 py-1 text-xs flex items-center"
                            >
                              {assignee.name}
                              {isEditing && expandedItem === item.taskId && (
                                <X
                                  className="h-3 w-3 ml-1 cursor-pointer" 
                                  onClick={() => handleUpdateItem(
                                    index, 
                                    'assignees', 
                                    item.assignees.filter((a: any) => a._id !== assignee._id)
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && expandedItem === item.taskId ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {item.deadline ? format(new Date(item.deadline), 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={item.deadline ? new Date(item.deadline) : undefined}
                              onSelect={(date) => handleUpdateItem(index, 'deadline', date ? format(date, 'yyyy-MM-dd') : '')}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        format(new Date(item.deadline), 'MMM d, yyyy')
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && expandedItem === item.taskId ? (
                        <Select 
                          value={String(item.priority)} 
                          onValueChange={(value) => handleUpdateItem(index, 'priority', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Low (1)</SelectItem>
                            <SelectItem value="2">Medium (2)</SelectItem>
                            <SelectItem value="3">High (3)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          item.priority === 3 ? "bg-red-100 text-red-800" : 
                          item.priority === 2 ? "bg-yellow-100 text-yellow-800" : 
                          "bg-green-100 text-green-800"
                        )}>
                          {item.priority === 3 ? "High" : item.priority === 2 ? "Medium" : "Low"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && expandedItem === item.taskId ? (
                        <Select 
                          value={item.progress} 
                          onValueChange={(value) => handleUpdateItem(index, 'progress', value as ProgressStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Progress" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          item.progress === "Completed" ? "bg-green-100 text-green-800" :
                          item.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
                          item.progress === "Blocked" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        )}>
                          {item.progress}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItem(item.taskId)}
                      >
                        {expandedItem === item.taskId ? 'Close' : 'Details'}
                      </Button>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedItem === item.taskId && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={6} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium">Additional Comments</h4>
                            {isEditing ? (
                              <Textarea 
                                value={item.additionalComments || ''} 
                                onChange={(e) => handleUpdateItem(index, 'additionalComments', e.target.value)}
                                placeholder="Add comments or context..."
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.additionalComments || 'No additional comments'}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter>
          <div className="w-full flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveItems} disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              <Save className="mr-2 h-4 w-4" />
              Save Action Items
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
