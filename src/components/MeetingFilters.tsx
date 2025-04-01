
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface MeetingFiltersProps {
  onSearch: (search: string) => void;
  onSort: (field: string, order: "asc" | "desc") => void;
  onFilter: (filter: string) => void;
  initialSearch?: string;
  initialSortField?: string;
  initialSortOrder?: "asc" | "desc";
  initialFilter?: string;
  className?: string;
}

export default function MeetingFilters({
  onSearch,
  onSort,
  onFilter,
  initialSearch = "",
  initialSortField = "dateTime",
  initialSortOrder = "asc",
  initialFilter = "",
  className,
}: MeetingFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [filter, setFilter] = useState(initialFilter);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  // Effect to handle initial values
  useEffect(() => {
    setSearch(initialSearch);
    setSortField(initialSortField);
    setSortOrder(initialSortOrder);
    setFilter(initialFilter);
    
    // Set applied filters based on initial filter
    if (initialFilter) {
      setAppliedFilters(initialFilter.split(","));
    } else {
      setAppliedFilters([]);
    }
  }, [initialSearch, initialSortField, initialSortOrder, initialFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  const handleSortFieldChange = (value: string) => {
    setSortField(value);
    onSort(value, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onSort(sortField, newOrder);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    
    // Update applied filters
    if (value && !appliedFilters.includes(value)) {
      const newFilters = [...appliedFilters, value];
      setAppliedFilters(newFilters);
      onFilter(newFilters.join(","));
    }
  };

  const handleRemoveFilter = (filterToRemove: string) => {
    const newFilters = appliedFilters.filter(f => f !== filterToRemove);
    setAppliedFilters(newFilters);
    onFilter(newFilters.join(","));
  };

  const handleClearFilters = () => {
    setAppliedFilters([]);
    onFilter("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search meetings..."
              className="pl-8 w-full"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </form>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <Select value={sortField} onValueChange={handleSortFieldChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateTime">Date & Time</SelectItem>
              <SelectItem value="title">Meeting Name</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSortOrderToggle}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
          </Button>
        </div>

        {/* Filter Control */}
        <div>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="host">I'm the Host</SelectItem>
              <SelectItem value="attendee">I'm an Attendee</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applied Filters */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground mr-1">Filters:</span>
          {appliedFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-foreground"
                onClick={() => handleRemoveFilter(filter)}
              />
            </Badge>
          ))}
          {appliedFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
