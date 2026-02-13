import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@relaycode/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(getBaseUrl());
export { api };
