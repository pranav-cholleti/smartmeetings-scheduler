
import { useState, useEffect, useRef } from 'react';
import { QueryFunction, UseQueryOptions, useQuery } from '@tanstack/react-query';

interface UsePollingQueryOptions<TData> extends Omit<UseQueryOptions<TData, Error, TData>, 'queryFn'> {
  pollingInterval: number; // Interval in milliseconds
  stopPollingWhen?: (data: TData) => boolean; // Function to determine when to stop polling
  onStopPolling?: () => void; // Callback when polling stops
}

/**
 * Custom hook for polling an API endpoint at regular intervals
 */
export function usePollingQuery<TData>(
  queryFn: QueryFunction<TData>,
  options: UsePollingQueryOptions<TData>
) {
  const { 
    pollingInterval, 
    stopPollingWhen, 
    onStopPolling,
    ...queryOptions 
  } = options;
  
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const onStopPollingRef = useRef(onStopPolling);
  
  // Update the ref when the callback changes
  useEffect(() => {
    onStopPollingRef.current = onStopPolling;
  }, [onStopPolling]);
  
  // Use Tanstack Query with polling enabled
  const query = useQuery({
    ...queryOptions,
    queryFn,
    refetchInterval: isPolling ? pollingInterval : false,
  });
  
  // Check if we should stop polling based on data
  useEffect(() => {
    if (!isPolling || !query.data) return;
    
    if (stopPollingWhen && stopPollingWhen(query.data)) {
      setIsPolling(false);
      
      // Call the callback if it exists
      if (onStopPollingRef.current) {
        onStopPollingRef.current();
      }
    }
  }, [query.data, isPolling, stopPollingWhen]);
  
  return {
    ...query,
    isPolling,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
  };
}
