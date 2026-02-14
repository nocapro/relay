import createClient from 'openapi-fetch';
import type { paths } from '../types/api';

export const client = createClient<paths>({
  baseUrl: typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000',
});

export const api = client;
