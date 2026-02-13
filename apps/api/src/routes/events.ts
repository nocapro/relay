import { Elysia } from 'elysia';
import { db } from '../store';
import type { SimulationEvent } from '../models';

export const eventsRoutes = new Elysia({ prefix: '/events' })
  .get('/', ({ set }) => {
    // Set SSE headers
    set.headers['Content-Type'] = 'text/event-stream';
    set.headers['Cache-Control'] = 'no-cache';
    set.headers['Connection'] = 'keep-alive';

    const stream = new ReadableStream({
      start(controller) {
        // Subscribe to store updates
        const unsubscribe = db.subscribe((transaction) => {
          const event: SimulationEvent = {
            transactionId: transaction.id,
            status: transaction.status,
            timestamp: new Date().toISOString(),
          };
          
          // SSE format: data: {...}\n\n
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        });

        // Cleanup on close
        return () => {
          unsubscribe();
        };
      },
    });

    return new Response(stream);
  });