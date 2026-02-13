import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@relaycode/api';

const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>('http://localhost:3000');
export { api };
