import { Transaction } from "@/types/app.types";

// --- Mock Data (Moved from App.tsx) ---
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-8f92a1',
    status: 'PENDING',
    description: 'Refactor authentication middleware to support JWT rotation',
    timestamp: 'Just now',
    files: [
      {
        path: 'src/middleware/auth.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -12,6 +12,14 @@
 async function authMiddleware(req: Request, res: Response, next: NextFunction) {
   const token = req.headers.authorization?.split(' ')[1];
   
   if (!token) {
-    return res.status(401).json({ message: 'No token provided' });
+    // Check for refresh token in cookies
+    const refreshToken = req.cookies['refresh_token'];
+    if (!refreshToken) {
+      return res.status(401).json({ message: 'Authentication required' });
+    }
+    
+    // Rotate tokens
+    const newTokens = await rotateTokens(refreshToken);
   }
 }`
      },
      {
        path: 'src/config/jwt.ts',
        status: 'created',
        language: 'typescript',
        diff: `@@ -0,0 +1,8 @@
+export const JWT_CONFIG = {
+  secret: process.env.JWT_SECRET || 'dev-secret',
+  expiresIn: '15m',
+  refreshExpiresIn: '7d',
+  issuer: 'relaycode-api',
+  audience: 'relaycode-web'
+};`
      }
    ],
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
    files: [
      {
        path: 'src/services/userService.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -45,7 +45,8 @@
   async updateUser(id: string, data: Partial<User>) {
     const user = await db.users.findUnique({ where: { id } });
     
-    return db.users.update({
+    // Fix: Add version check for optimistic locking
+    return db.users.update({
       where: { id, version: user.version },
       data: { ...data, version: user.version + 1 }
     });`
      }
    ],
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
    files: [
      {
        path: 'tailwind.config.js',
        status: 'modified',
        language: 'javascript',
        diff: `@@ -4,6 +4,7 @@
   content: ["./src/**/*.{ts,tsx}"],
   theme: {
     extend: {},
   },
+  darkMode: "class",
   plugins: [],
 }`
      }
    ],
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
    files: [
      {
        path: 'package.json',
        status: 'created',
        language: 'json',
        diff: `@@ -0,0 +1,25 @@
+{
+  "name": "new-project",
+  "version": "0.0.1",
+  "type": "module"
+}`
      }
    ],
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
    files: [
      {
        path: 'src/utils/logger.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -20,4 +20,4 @@
   warn: (msg: string) => console.warn(msg),
   error: (msg: string) => console.error(msg),
-  debug: (msg: string) => console.debug(msg),
+  // debug: (msg: string) => console.debug(msg), // Reverting debug log
 }`
      }
    ],
    reasoning: 'Added verbose logging to trace a connection issue. Issue resolved, reverting changes to keep production log volume low.',
    provider: 'Anthropic',
    model: 'claude-3.5-haiku',
    cost: '$0.005',
    tokens: '320'
  }
];

// --- Event System for "Live" Simulation ---
type TransactionCallback = (tx: Transaction) => void;

class TransactionSocket {
  private subscribers: TransactionCallback[] = [];
  private interval: any;

  subscribe(callback: TransactionCallback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Simulates finding a new patch in the clipboard
  startEmitting() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      // In a real app, this would be data from the backend/clipboard
      const randomTx = MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
      const newTx = { ...randomTx, id: `tx-${Math.random().toString(36).substr(2, 6)}`, timestamp: 'Just now', status: 'PENDING' as const };
      this.subscribers.forEach(cb => cb(newTx));
    }, 8000); // New patch every 8 seconds
  }

  stopEmitting() {
    clearInterval(this.interval);
    this.interval = null;
  }
}

// --- Elysia Client Stub ---
// In a real app, this would use fetch/axios or the official Elysia Eden client
export const api = {
  socket: new TransactionSocket(),
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