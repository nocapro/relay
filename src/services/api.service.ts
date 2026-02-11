import { Transaction } from "@/types/app.types";

// --- Mock Data (Moved from App.tsx) ---
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-8f92a1',
    status: 'PENDING',
    description: 'Refactor authentication middleware to support JWT rotation',
    timestamp: 'Just now',
    files: ['src/middleware/auth.ts', 'src/config/jwt.ts'],
    reasoning: 'The user requested JWT rotation. I am updating the auth middleware to check for an expiring token and issue a new one if within the refresh window. This ensures seamless user sessions without frequent re-logins.',
    provider: 'Anthropic',
    model: 'claude-3.5-sonnet',
    cost: '$0.024',
    tokens: '1,240'
  },
  {
    id: 'tx-7b21c4',
    status: 'FAILED',
    description: 'Fix race condition in user profile update',
    timestamp: '2 mins ago',
    files: ['src/services/userService.ts'],
    reasoning: 'Attempting to use optimistic locking on the user record update. However, the current schema does not support versioning, causing the patch to fail validation.',
    provider: 'OpenAI',
    model: 'gpt-4o',
    cost: '$0.045',
    tokens: '2,100'
  },
  {
    id: 'tx-3d55e2',
    status: 'APPLIED',
    description: 'Add Tailwind CSS configuration for dark mode',
    timestamp: '15 mins ago',
    files: ['tailwind.config.js', 'src/styles/globals.css'],
    reasoning: 'Enabling class-based dark mode in Tailwind config and adding base styles for the dark theme.',
    provider: 'Anthropic',
    model: 'claude-3.5-sonnet',
    cost: '$0.012',
    tokens: '850'
  },
  {
    id: 'tx-1a99f3',
    status: 'COMMITTED',
    description: 'Initialize project structure with Vite + React',
    timestamp: '1 hour ago',
    files: ['package.json', 'vite.config.ts', 'src/App.tsx'],
    reasoning: 'Setting up the initial scaffold based on user requirements. Created base configuration files and entry points.',
    provider: 'OpenRouter',
    model: 'mistral-large',
    cost: '$0.008',
    tokens: '400'
  },
  {
    id: 'tx-9c88b2',
    status: 'REVERTED',
    description: 'Temporary logging for debug (Reverted)',
    timestamp: '2 hours ago',
    files: ['src/utils/logger.ts'],
    reasoning: 'Added verbose logging to trace a connection issue. Issue resolved, reverting changes to keep production log volume low.',
    provider: 'Anthropic',
    model: 'claude-3.5-haiku',
    cost: '$0.005',
    tokens: '320'
  }
];

// --- Elysia Client Stub ---
// In a real app, this would use fetch/axios or the official Elysia Eden client
export const api = {
  transactions: {
    list: async (): Promise<Transaction[]> => {
      // Simulate network delay
      // await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_TRANSACTIONS;
    },
    updateStatus: async (id: string, status: Transaction['status']) => {
      console.log(`[API] Updating transaction ${id} to ${status}`);
      return { success: true };
    }
  }
};