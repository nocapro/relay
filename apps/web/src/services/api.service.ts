import { client } from '@/lib/api.client';
import type { components } from '../types/api';

export type Transaction = components["schemas"]["Transaction"];
export type TransactionStatus = components["schemas"]["TransactionStatus"];

export interface SimulationEvent {
  transactionId: string;
  status: TransactionStatus;
  timestamp: string;
  progress?: number;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const connectToSimulationStream = (
  onEvent: (event: SimulationEvent) => void,
  onConnectionChange?: (isConnected: boolean) => void,
  onError?: (error: Event, isNetworkError: boolean) => void
): (() => void) => {
  const baseUrl = getBaseUrl();
  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
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
      const isNetworkError = eventSource?.readyState === EventSource.CLOSED;
      
      if (!intentionalClose) {
        onConnectionChange?.(false);
      }
      
      if (onError) onError(error, isNetworkError);
      
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

  return () => {
    intentionalClose = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

export { client };
