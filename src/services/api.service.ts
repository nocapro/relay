import { Transaction, Prompt } from "@/types/app.types";

// --- Mock Data ---

// New: Mock Prompts Database
const MOCK_PROMPTS: Prompt[] = [
  {
    id: 'prompt-1',
    title: 'Refactor Authentication System',
    content: 'Refactor authentication middleware to support JWT rotation and improve security.',
    timestamp: '10 mins ago'
  },
  {
    id: 'prompt-2',
    title: 'Fix Race Conditions',
    content: 'Fix race condition in user profile update and optimize database queries.',
    timestamp: '2 hours ago'
  },
  {
    id: 'prompt-3',
    title: 'Project Initialization',
    content: 'Initialize project structure with Vite, React, and Tailwind configuration.',
    timestamp: '1 day ago'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-complex-auth',
    status: 'PENDING',
    description: 'Security Overhaul: JWT Rotation & Session Management',
    timestamp: 'Just now',
    createdAt: new Date().toISOString(),
    promptId: 'prompt-1',
    author: 'alice',
    provider: 'Anthropic',
    model: 'claude-3.5-sonnet',
    cost: '$0.032',
    tokens: '1,850',
    reasoning: `### Architectural Security Report: JWT Rotation
We are implementing **Sliding Sessions** to improve both security and user experience.

#### Key Objectives:
1. **Short-lived Access Tokens**: Access tokens now expire in 15 minutes.
2. **Refresh Token Rotation**: Every time a session is refreshed, a *new* refresh token is issued, and the old one is invalidated (Detects reuse).
3. **In-memory Token Store**: Added \`TokenStore\` to track active session IDs for instant revocation.

> **Security Note:** This change requires the backend to support the \`/rotate\` endpoint which is defined in the accompanying server-side patch.`,
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
        path: 'src/hooks/useAuth.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -8,4 +8,12 @@
+  const login = async (creds: Credentials) => {
+    const res = await api.post('/login', creds);
+    setUser(res.user);
+  };
+
+  const logout = () => {
+    setUser(null);
+    document.cookie = 'refresh_token=; Max-Age=0';
+  };`
      },
      {
        path: 'src/services/tokenStore.ts',
        status: 'created',
        language: 'typescript',
        diff: `@@ -0,0 +1,15 @@
+export class TokenStore {
+  private static cache = new Map<string, string>();
+
+  static set(id: string, val: string) {
+    this.cache.set(id, val);
+  }
+
+  static get(id: string) {
+    return this.cache.get(id);
+  }
+}`
      },
      {
        path: 'src/types/auth.types.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -2,4 +2,5 @@
+ export interface User {
+   id: string;
+   email: string;
+   role: 'admin' | 'user';
+   lastSeen: string;
+ }`
      },
      {
        path: 'src/utils/crypto.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -1,3 +1,6 @@
+ import crypto from 'crypto';
+
+ export const hashToken = (t: string) =>
+   crypto.createHash('sha256').update(t).digest('hex');`
      }
    ],
    blocks: []
  },
  {
    id: 'tx-fullstack-notify',
    status: 'PENDING',
    description: 'Feature: Real-time Notification System with Socket.io',
    timestamp: 'Just now',
    createdAt: new Date().toISOString(),
    promptId: 'prompt-2',
    author: 'system',
    provider: 'Claude',
    model: '3.5 Sonnet',
    cost: '$0.084',
    tokens: '4,120',
    reasoning: 'Implementing full-stack notifications.',
    files: [], // Populated via blocks below for logic consistency
    blocks: [
      { type: 'markdown', content: `### Notification System Architecture
I am implementing a robust real-time notification engine. This involves updating the database schema, creating a WebSocket gateway, and adding frontend hooks.

#### 1. Database Schema
First, we need to track notification state and read/unread status.` },
      { type: 'file', file: {
        path: 'prisma/schema.prisma',
        status: 'modified',
        language: 'prisma',
        diff: `@@ -45,6 +45,14 @@
 model User {
   id    String @id @default(cuid())
   email String @unique
+  notifications Notification[]
 }

+model Notification {
+  id        String   @id @default(cuid())
+  userId    String
+  user      User     @relation(fields: [userId], references: [id])
+  type      String
+  message   String
+  read      Boolean  @default(false)
+  createdAt DateTime @default(now())
+}`
      }},
      { type: 'markdown', content: `#### 2. WebSocket Gateway
Now, let's create the NestJS gateway to handle client connections and emit events.` },
      { type: 'file', file: {
        path: 'server/src/notifications/notifications.gateway.ts',
        status: 'created',
        language: 'typescript',
        diff: `@@ -0,0 +1,15 @@
+@WebSocketGateway({ cors: true })
+export class NotificationsGateway {
+  @WebSocketServer() server: Server;
+
+  sendToUser(userId: string, data: any) {
+    this.server.to(userId).emit('notification', data);
+  }
+}`
      }},
      { type: 'markdown', content: `#### 3. Frontend Integration
The following 5 files set up the React state management, hooks, and UI components for the notification bell.` },
      { type: 'file', file: {
        path: 'client/src/hooks/useNotifications.ts',
        status: 'created',
        language: 'typescript',
        diff: `@@ -0,0 +1,10 @@
+export const useNotifications = () => {
+  const [notes, setNotes] = useState([]);
+  useEffect(() => {
+    socket.on('notification', (n) => setNotes(prev => [n, ...prev]));
+  }, []);
+  return notes;
+};`
      }},
      { type: 'file', file: {
        path: 'client/src/store/notification.slice.ts',
        status: 'created',
        language: 'typescript',
        diff: `@@ -0,0 +1,5 @@
+export const createNotificationSlice = (set) => ({
+  unreadCount: 0,
+  increment: () => set(s => ({ unreadCount: s.unreadCount + 1 })),
+});`
      }},
      { type: 'file', file: {
        path: 'client/src/components/NotificationBell.tsx',
        status: 'created',
        language: 'tsx',
        diff: `@@ -0,0 +1,8 @@
+export const NotificationBell = () => {
+  const count = useStore(s => s.unreadCount);
+  return <div className="relative"><Bell />{count > 0 && <span>{count}</span>}</div>;
+};`
      }},
      { type: 'file', file: {
        path: 'client/src/styles/notifications.css',
        status: 'created',
        language: 'css',
        diff: `@@ -0,0 +1,4 @@
+.notification-item {
+  @apply p-4 border-b border-zinc-800 hover:bg-zinc-900;
+}`
      }},
      { type: 'file', file: {
        path: 'server/src/main.ts',
        status: 'modified',
        language: 'typescript',
        diff: `@@ -5,4 +5,5 @@
+   const app = await NestFactory.create(AppModule);
+   app.enableCors();
++  app.useWebSocketAdapter(new IoAdapter(app));
+   await app.listen(3000);`
      }},
      { type: 'markdown', content: `### Final Considerations
The Socket.io adapter must be installed on the server for this to work. I have updated the \`package.json\` below.` },
      { type: 'file', file: {
        path: 'server/package.json',
        status: 'modified',
        language: 'json',
        diff: `@@ -12,4 +12,5 @@
+   "dependencies": {
+     "@nestjs/common": "^10.0.0",
+     "@nestjs/core": "^10.0.0",
++    "@nestjs/platform-socket.io": "^10.0.0"
+   }`
      }}
    ]
  },
  {
    id: 'tx-7b21c5',
    status: 'APPLIED',
    description: 'Optimize database connection pooling',
    timestamp: '5 mins ago',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    promptId: 'prompt-2',
    author: 'alice',
    files: [],
    reasoning: 'Added connection pooling to reduce latency.',
    provider: 'Anthropic',
    model: 'claude-3.5-sonnet',
    cost: '$0.015',
    tokens: '900'
  },
  {
    id: 'tx-3d55e2',
    status: 'APPLIED',
    description: 'Add Tailwind CSS configuration for dark mode',
    timestamp: '15 mins ago',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    promptId: 'prompt-3',
    author: 'system',
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
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    promptId: 'prompt-3',
    author: 'system',
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
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    promptId: 'prompt-2',
    author: 'charlie',
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
    const prompts = ['prompt-1', 'prompt-2', 'prompt-3'];
    this.interval = setInterval(() => {
      // In a real app, this would be data from the backend/clipboard
      const randomTx = MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
      const newTx = { 
        ...randomTx, 
        id: `tx-${Math.random().toString(36).substr(2, 6)}`, 
        promptId: prompts[Math.floor(Math.random() * prompts.length)],
        timestamp: 'Just now', 
        createdAt: new Date().toISOString(),
        status: 'PENDING' as const 
      };
      this.subscribers.forEach(cb => cb(newTx));
    }, 8000); // New patch every 8 seconds
  }

  stopEmitting() {
    clearInterval(this.interval);
    this.interval = null;
  }
}

// --- API Client ---
export const api = {
  socket: new TransactionSocket(),
  transactions: {
    list: async (): Promise<Transaction[]> => {
      return MOCK_TRANSACTIONS;
    },
    prompts: {
      list: async (): Promise<Prompt[]> => MOCK_PROMPTS,
      get: async (id: string) => MOCK_PROMPTS.find(p => p.id === id)
    },
    updateStatus: async (id: string, status: Transaction['status']) => {
      console.log(`[API] Updating transaction ${id} to ${status}`);
      return { success: true };
    }
  }
};