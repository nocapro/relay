import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { transactionsRoutes } from './routes/transactions';
import { promptsRoutes } from './routes/prompts';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || 'localhost';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Relaycode API Documentation',
        version: '1.0.0'
      }
    }
  }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .group('/api', (app) => 
    app
      .get('/version', () => ({ version: '1.2.4', environment: 'stable' }))
      .use(transactionsRoutes)
      .use(promptsRoutes)
  )
  .listen({ port, hostname: host });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;