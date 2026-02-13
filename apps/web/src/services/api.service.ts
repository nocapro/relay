import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@relaycode/api';
import type { SimulationEvent } from '@relaycode/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(getBaseUrl());

// SSE Connection for real-time simulation updates
export const connectToSimulationStream = (
  onEvent: (event: SimulationEvent) => void,
  onConnectionChange?: (isConnected: boolean) => void,
  onError?: (error: Event, isNetworkError: boolean) => void
): (() => void) => {
  const baseUrl = getBaseUrl();
  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;
  let intentionalClose = false;

  const connect = () => {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`${baseUrl}/api/events`);
    
    eventSource.onopen = () => {
      reconnectAttempts = 0;
      onConnectionChange?.(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SimulationEvent = JSON.parse(event.data);
        onEvent(data);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (error) => {
      // Check if eventSource is closed (network error) or just no data (server timeout)
      const isNetworkError = eventSource?.readyState === EventSource.CLOSED;
      
      if (!intentionalClose) {
        onConnectionChange?.(false);
      }
      
      if (onError) onError(error, isNetworkError);
      
      // Attempt to reconnect with exponential backoff (only for network errors)
      if (isNetworkError && !intentionalClose && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
          connect();
        }, delay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    };
  };

  connect();

  // Return cleanup function
  return () => {
    intentionalClose = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

export { api };
