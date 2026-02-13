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
  onError?: (error: Event) => void
): (() => void) => {
  const baseUrl = getBaseUrl();
  const eventSource = new EventSource(`${baseUrl}/api/events`);

  eventSource.onmessage = (event) => {
    try {
      const data: SimulationEvent = JSON.parse(event.data);
      onEvent(data);
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) onError(error);
    // Auto-reconnect is handled by EventSource by default, 
    // but we can add custom reconnection logic here if needed
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
};

export { api };
