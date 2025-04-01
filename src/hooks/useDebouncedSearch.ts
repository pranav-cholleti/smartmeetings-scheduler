
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UseDebouncedSearchOptions {
  debounceTime?: number;
  minChars?: number;
  enabled?: boolean;
}

/**
 * Custom hook for debounced search with React Query
 */
export function useDebouncedSearch<TData>(
  searchFn: (query: string) => Promise<TData>,
  options: UseDebouncedSearchOptions = {}
) {
  const {
    debounceTime = 300,
    minChars = 2,
    enabled = true,
  } = options;
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  
  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceTime]);
  
  // Query with the debounced search term
  const queryEnabled = enabled && debouncedSearchTerm.length >= minChars;
  
  const query = useQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: () => searchFn(debouncedSearchTerm),
    enabled: queryEnabled,
    staleTime: 30000, // Consider results fresh for 30 seconds
  });
  
  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    ...query,
    isReady: queryEnabled,
  };
}
