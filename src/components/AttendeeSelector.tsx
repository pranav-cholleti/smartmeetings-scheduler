
import React, { useState } from 'react';
import { PlusCircle, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { userService } from '@/services/userService';
import { User } from '@/types';

interface AttendeeProps {
  selectedAttendees: User[];
  onChange: (attendees: User[]) => void;
}

export function AttendeeSelector({ selectedAttendees, onChange }: AttendeeProps) {
  const [open, setOpen] = useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    data: searchResults,
    isLoading,
  } = useDebouncedSearch<User[]>(
    async (query) => {
      const users = await userService.searchUsers(query);
      return users;
    },
    { minChars: 2 }
  );
  
  const handleSelect = (user: User) => {
    if (!selectedAttendees.some(a => a.userId === user.userId)) {
      onChange([...selectedAttendees, user]);
    }
    setSearchTerm('');
    setOpen(false);
  };
  
  const handleRemove = (userId: string) => {
    onChange(selectedAttendees.filter(a => a.userId !== userId));
  };
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAttendees.length === 0 && (
            <p className="text-sm text-muted-foreground">No attendees selected</p>
          )}
          {selectedAttendees.map((attendee) => (
            <Badge 
              variant="secondary" 
              key={attendee.userId}
              className="flex items-center gap-1 pl-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage 
                  src={`https://avatar.vercel.sh/${attendee.email}.png`} 
                  alt={attendee.name} 
                />
                <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{attendee.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1"
                onClick={() => handleRemove(attendee.userId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-full justify-start">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Attendees
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]" align="start">
            <Command>
              <CommandInput 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  ) : (
                    "No users found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults?.map((user) => {
                    const isSelected = selectedAttendees.some(
                      (attendee) => attendee.userId === user.userId
                    );
                    
                    return (
                      <CommandItem
                        key={user.userId}
                        value={user.userId}
                        onSelect={() => handleSelect(user)}
                        disabled={isSelected}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage 
                            src={`https://avatar.vercel.sh/${user.email}.png`} 
                            alt={user.name} 
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 ml-auto" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default AttendeeSelector;
