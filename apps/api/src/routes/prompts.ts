import { Elysia, t } from 'elysia';
import { db } from '../store';
import { Prompt } from '../models';

export const promptsRoutes = new Elysia({ prefix: '/prompts' })
  .get('/', () => db.getPrompts(), {
    response: t.Array(Prompt)
  });