import { Elysia, sse } from 'elysia';
import { db } from '../store';
import type { SimulationEvent } from '../models';

export const eventsRoutes = new Elysia({ prefix: '/events' })
  .get('/', async function* ({ set }) {
    // Set headers before first yield (required by Elysia)
    set.headers['Cache-Control'] = 'no-cache';
    set.headers['Connection'] = 'keep-alive';
    set.headers['X-Accel-Buffering'] = 'no';

    // Event buffer and notification mechanism
    const events: SimulationEvent[] = [];
    let notify: (() => void) | null = null;
    
    // Subscribe to database changes
    const unsubscribe = db.subscribe((transaction) => {
      events.push({
        transactionId: transaction.id,
        status: transaction.status,
        timestamp: new Date().toISOString(),
      });
      if (notify) {
        notify();
        notify = null;
      }
    });

    try {
      // Send initial connection event
      yield sse({ event: 'connected', data: { timestamp: new Date().toISOString() } });
      
      while (true) {
        // Wait for events if buffer is empty
        if (events.length === 0) {
          await new Promise<void>(resolve => { notify = resolve; });
        }
        
        // Flush all pending events
        while (events.length > 0) {
          const event = events.shift()!;
          yield sse({ event: 'message', data: event });
        }
      }
    } finally {
      // Cleanup subscription when client disconnects
      unsubscribe();
    }
  });