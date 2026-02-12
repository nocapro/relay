# Directory Structure
```
src/
  components/
    common/
      placeholder.view.tsx
    layout/
      command-palette.layout.tsx
      header.layout.tsx
      navigation.layout.tsx
    ui/
      diff-viewer.ui.tsx
      status-badge.ui.tsx
  features/
    transactions/
      components/
        action-bar.component.tsx
        transaction-card.component.tsx
  hooks/
    mobile.hook.ts
  pages/
    dashboard.page.tsx
  routes/
    dashboard.tsx
    history.tsx
    settings.tsx
  services/
    api.service.ts
  store/
    slices/
      transaction.slice.ts
      ui.slice.ts
    root.store.ts
  styles/
    main.style.css
  types/
    app.types.ts
  utils/
    cn.util.ts
    diff.util.ts
    group.util.ts
  root.tsx
  routes.ts
package.json
tsconfig.json
vite.config.ts
```

# Files

## File: src/components/common/placeholder.view.tsx
```typescript
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  icon: LucideIcon;
}

export const PlaceholderView = ({ title, icon: Icon }: PlaceholderViewProps) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-zinc-500 animate-in fade-in zoom-in duration-300">
    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 mb-6 shadow-2xl">
      <Icon className="w-12 h-12 text-zinc-400" />
    </div>
    <h2 className="text-2xl font-bold text-zinc-200 mb-2">{title}</h2>
    <p className="text-sm text-zinc-500 max-w-xs text-center">This module is currently under active development. Check back in the next release.</p>
    <button className="mt-8 px-6 py-2 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium hover:bg-zinc-700 transition-colors">
       Notify me when ready
    </button>
  </div>
);
```

## File: src/components/layout/header.layout.tsx
```typescript
import { Terminal, ChevronDown, GitBranch, Search, Settings } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";

export const Header = () => {
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "h-16 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 transition-all",
      isMobile ? "px-4" : "px-8"
    )}>
      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
        {isMobile && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
             <Terminal className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
          <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all" />
          <span className="text-sm font-medium text-zinc-300 truncate max-w-[120px] md:max-w-none">relaycode-web</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </div>
        <div className="hidden md:block h-4 w-px bg-zinc-800" />
        <div className="hidden md:flex items-center gap-2 text-zinc-400">
          <GitBranch className="w-4 h-4" />
          <span className="text-sm font-mono hover:text-zinc-200 cursor-pointer transition-colors">main</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setCmdOpen(true)}
          className="p-2 md:px-3 md:py-1.5 flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 rounded-lg transition-all"
        >
          <Search className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden md:inline text-sm">Search</span>
          <div className="hidden md:flex gap-1 ml-2">
             <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">⌘K</span>
          </div>
        </button>
        <button className="hidden md:block p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
```

## File: src/hooks/mobile.hook.ts
```typescript
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

## File: src/routes/history.tsx
```typescript
import { Clock } from 'lucide-react';
import { PlaceholderView } from '@/components/common/placeholder.view';

export default function HistoryRoute() {
  return <PlaceholderView title="Transaction History" icon={Clock} />;
}
```

## File: src/routes/settings.tsx
```typescript
import { Settings } from 'lucide-react';
import { PlaceholderView } from '@/components/common/placeholder.view';

export default function SettingsRoute() {
  return <PlaceholderView title="System Settings" icon={Settings} />;
}
```

## File: src/utils/cn.util.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## File: src/utils/group.util.ts
```typescript
import { Transaction, Prompt, GroupByStrategy } from '@/types/app.types';

export interface GroupedData {
  id: string;
  label: string;
  count: number;
  transactions: Transaction[];
}

// Helper to get relative date
const getRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  return 'Older';
};

export function groupTransactions(
  transactions: Transaction[],
  prompts: Prompt[],
  strategy: GroupByStrategy
): GroupedData[] {
  if (strategy === 'none' || !transactions.length) {
    return [{
      id: 'all',
      label: 'All Transactions',
      count: transactions.length,
      transactions
    }];
  }

  const groups = new Map<string, { label: string; transactions: Transaction[] }>();

  // 1. Sort transactions by date first for consistent ordering
  const sorted = [...transactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sorted.forEach(tx => {
    let key = 'unknown';
    let label = 'Unknown';

    switch (strategy) {
      case 'prompt': {
        key = tx.promptId;
        const prompt = prompts.find(p => p.id === tx.promptId);
        label = prompt?.title || 'Orphaned Transactions';
        break;
      }
      case 'date': {
        key = getRelativeDate(tx.createdAt);
        label = key;
        break;
      }
      case 'author': {
        key = tx.author || 'unknown';
        label = tx.author ? `@${tx.author}` : 'Unknown Author';
        break;
      }
      case 'status': {
        key = tx.status;
        label = tx.status.charAt(0) + tx.status.slice(1).toLowerCase();
        break;
      }
      case 'files': {
        // Group by the first file path or "No Files"
        const firstFile = tx.files[0];
        key = firstFile?.path || 'no-files';
        label = firstFile?.path || 'No Files Attached';
        break;
      }
    }

    if (!groups.has(key)) {
      groups.set(key, { label, transactions: [] });
    }
    groups.get(key)!.transactions.push(tx);
  });

  // Convert map to array and calculate counts
  return Array.from(groups.entries()).map(([id, data]) => ({
    id,
    label: data.label,
    count: data.transactions.length,
    transactions: data.transactions
  }));
}
```

## File: src/routes.ts
```typescript
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/dashboard.tsx'),
  route('history', 'routes/history.tsx'),
  route('settings', 'routes/settings.tsx'),
] satisfies RouteConfig;
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["node"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

## File: src/components/layout/command-palette.layout.tsx
```typescript
import { Search, Play, CheckCircle2, FileText, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from "@/store/root.store";
import { useState, useMemo } from 'react';

export const CommandPalette = () => {
  const isCmdOpen = useStore((state) => state.isCmdOpen);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const transactions = useStore((state) => state.transactions);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const matches: any[] = [];

    transactions.forEach(tx => {
      if (tx.description.toLowerCase().includes(query.toLowerCase())) {
        matches.push({ type: 'tx', id: tx.id, title: tx.description, subtitle: 'Transaction' });
      }

      tx.blocks?.forEach((block: any) => {
        if (block.type === 'markdown' && block.content.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ type: 'doc', id: tx.id, title: 'Reasoning match...', subtitle: tx.description });
        }
        if (block.type === 'file' && block.file.path.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ type: 'file', id: tx.id, title: block.file.path, subtitle: tx.description });
        }
      });
    });
    return matches.slice(0, 5);
  }, [query, transactions]);

  if (!isCmdOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none text-sm h-6"
          />
          <span className="text-xs text-zinc-600 border border-zinc-800 px-1.5 rounded">ESC</span>
        </div>
        <div className="p-2 space-y-1 max-h-96 overflow-y-auto custom-scrollbar-thin">
          {results.length > 0 ? (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Search Results</div>
              {results.map((res, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                  {res.type === 'file' ? <Code2 className="w-4 h-4 text-zinc-500" /> : <FileText className="w-4 h-4 text-zinc-500" />}
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="truncate w-full">{res.title}</span>
                    <span className="text-[10px] text-zinc-600 truncate w-full">{res.subtitle}</span>
                  </div>
                </button>
              ))}
            </>
          ) : query ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No matches found for "{query}"</div>
          ) : (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                <Play className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
                Resume Monitoring
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                <CheckCircle2 className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
                Approve All Pending
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
```

## File: src/components/layout/navigation.layout.tsx
```typescript
import { Activity, Settings, Clock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { cn } from "@/utils/cn.util";
import { useIsMobile } from "@/hooks/mobile.hook";

const navItems = [
  { path: '/', icon: Activity, label: 'Stream' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20",
                  isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <div className={cn("p-1.5 rounded-full transition-all", isActive ? "bg-indigo-500/10" : "bg-transparent")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-zinc-800/60 bg-zinc-950 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">Relaycode</span>
      </div>

      <div className="px-4 py-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-inner shadow-black/20" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800/60">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-lg p-3 border border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-medium text-zinc-300">System Online</span>
          </div>
          <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
            <span>v1.2.4</span>
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## File: src/components/ui/status-badge.ui.tsx
```typescript
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitCommit, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionStatus } from "@/types/app.types";

const styles = {
  PENDING: 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_10px_-3px_rgba(245,158,11,0.2)]',
  APPLIED: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]',
  COMMITTED: 'bg-blue-500/5 text-blue-500 border-blue-500/20',
  REVERTED: 'bg-zinc-500/5 text-zinc-400 border-zinc-500/20',
  FAILED: 'bg-red-500/5 text-red-500 border-red-500/20',
};

const icons = {
  PENDING: Loader2, // Animated loader for pending
  APPLIED: CheckCircle2,
  COMMITTED: GitCommit,
  REVERTED: RotateCcw,
  FAILED: XCircle,
};

export const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const Icon = icons[status];
  const isPending = status === 'PENDING';

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-medium border transition-all", 
      styles[status]
    )}>
      <Icon className={cn("w-3.5 h-3.5", isPending && "animate-spin")} />
      <span className="tracking-wide uppercase">{status}</span>
    </div>
  );
};
```

## File: src/routes/dashboard.tsx
```typescript
import { Dashboard } from '@/pages/dashboard.page';
import { FloatingActionBar } from '@/features/transactions/components/action-bar.component';

export default function DashboardRoute() {
  return (
    <>
      <Dashboard />
      <FloatingActionBar />
    </>
  );
}
```

## File: src/store/slices/ui.slice.ts
```typescript
import { StateCreator } from 'zustand';
import { RootState } from '../root.store';

export interface UiSlice {
  isCmdOpen: boolean;
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  isCmdOpen: false,
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
});
```

## File: src/store/root.store.ts
```typescript
import { create } from 'zustand';
import { createUiSlice, UiSlice } from './slices/ui.slice';
import { createTransactionSlice, TransactionSlice } from './slices/transaction.slice';

export type RootState = UiSlice & TransactionSlice;

export const useStore = create<RootState>()((...a) => ({
  ...createUiSlice(...a),
  ...createTransactionSlice(...a),
}));

// Export specialized selectors for cleaner global usage
export const useUiActions = () => useStore((state) => ({
  setCmdOpen: state.setCmdOpen,
  toggleCmd: state.toggleCmd,
}));

export const useTransactionActions = () => useStore((state) => ({
  setExpandedId: state.setExpandedId,
  toggleWatching: state.toggleWatching,
  fetchTransactions: state.fetchTransactions,
}));
```

## File: src/utils/diff.util.ts
```typescript
import { ClassValue } from "clsx";

export interface DiffLine {
  type: 'hunk' | 'add' | 'remove' | 'context';
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface SyntaxToken {
  text: string;
  className?: string;
}

/**
 * Parses a unified diff string into structured lines for rendering.
 */
export function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      // Parse hunk header: @@ -1,4 +1,5 @@
      const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
      if (match) {
        oldLine = parseInt(match[1], 10) - 1;
        newLine = parseInt(match[3], 10) - 1;
      }
      result.push({ type: 'hunk', content: line });
      continue;
    }

    if (line.startsWith('+')) {
      newLine++;
      result.push({ type: 'add', content: line.substring(1), newLine });
    } else if (line.startsWith('-')) {
      oldLine++;
      result.push({ type: 'remove', content: line.substring(1), oldLine });
    } else if (line.startsWith(' ')) {
      oldLine++;
      newLine++;
      result.push({ type: 'context', content: line.substring(1), oldLine, newLine });
    }
  }

  return result;
}

/**
 * Extracts addition/removal stats from a raw diff string
 */
export function getDiffStats(diff: string) {
  const lines = diff.split('\n');
  const adds = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const subs = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
  return { adds, subs };
}

/**
 * Basic syntax highlighter for JS/TS/CSS
 */
const KEYWORDS = [
  'import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 
  'interface', 'type', 'from', 'async', 'await', 'class', 'extends', 'implements'
];

export function tokenizeCode(code: string): SyntaxToken[] {
  // Simple regex based tokenizer
  // 1. Strings
  // 2. Keywords
  // 3. Comments
  // 4. Numbers
  // 5. Normal text
  
  const tokens: SyntaxToken[] = [];
  let remaining = code;

  // Very naive splitting by word boundary, space, or special chars
  // For a production app, use PrismJS or Shiki. This is a lightweight substitute.
  const regex = /(".*?"|'.*?'|\/\/.*$|\/\*[\s\S]*?\*\/|\b\w+\b|[^\w\s])/gm;
  
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(code)) !== null) {
    // Add whitespace/text before match
    if (match.index > lastIndex) {
      tokens.push({ text: code.substring(lastIndex, match.index) });
    }

    const text = match[0];
    let className: string | undefined;

    if (text.startsWith('"') || text.startsWith("'")) {
      className = "text-emerald-300"; // String
    } else if (text.startsWith('//') || text.startsWith('/*')) {
      className = "text-zinc-500 italic"; // Comment
    } else if (KEYWORDS.includes(text)) {
      className = "text-purple-400 font-medium"; // Keyword
    } else if (/^\d+$/.test(text)) {
      className = "text-orange-300"; // Number
    } else if (/^[A-Z]/.test(text)) {
      className = "text-yellow-200"; // PascalCase (likely type/class)
    } else if (['{', '}', '(', ')', '[', ']'].includes(text)) {
      className = "text-zinc-400"; // Brackets
    }

    tokens.push({ text, className });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.substring(lastIndex) });
  }

  return tokens;
}
```

## File: src/components/ui/diff-viewer.ui.tsx
```typescript
import { useMemo, memo } from 'react';
import { parseDiff, tokenizeCode, DiffLine } from "@/utils/diff.util";
import { cn } from "@/utils/cn.util";

interface DiffViewerProps {
  diff: string;
  language: string;
  className?: string;
}

export const DiffViewer = memo(({ diff, language, className }: DiffViewerProps) => {
  const lines = useMemo(() => parseDiff(diff), [diff]);
  
  return (
    <div className={cn("font-mono text-[11px] md:text-xs overflow-x-auto relative", className)}>
      <div className="min-w-full inline-block">
        {lines.map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
      </div>
    </div>
  );
});

const LineRow = memo(({ line }: { line: DiffLine }) => {
  const tokens = useMemo(() => tokenizeCode(line.content), [line.content]);

  // Styles based on line type
  const bgClass = 
    line.type === 'add' ? 'bg-emerald-500/10' :
    line.type === 'remove' ? 'bg-red-500/10' :
    line.type === 'hunk' ? 'bg-zinc-800/50' : 
    'transparent';

  const textClass = 
    line.type === 'hunk' ? 'text-zinc-500' :
    line.type === 'context' ? 'text-zinc-400' :
    'text-zinc-300';

  const gutterClass = 
    line.type === 'add' ? 'bg-emerald-500/20 text-emerald-500' :
    line.type === 'remove' ? 'bg-red-500/20 text-red-500' :
    'text-zinc-700';

  return (
    <div className={cn("flex w-full group/line hover:bg-white/5 transition-colors", bgClass)}>
      {/* Line Numbers */}
      <div className={cn("w-10 md:w-12 flex-shrink-0 select-none text-right pr-2 md:pr-3 py-0.5 border-r border-white/5 font-mono opacity-40 group-hover/line:opacity-100 transition-opacity", gutterClass)}>
        {line.oldLine || ' '}
      </div>
      <div className={cn("w-10 md:w-12 flex-shrink-0 select-none text-right pr-2 md:pr-3 py-0.5 border-r border-white/5 font-mono opacity-40 group-hover/line:opacity-100 transition-opacity", gutterClass)}>
        {line.newLine || ' '}
      </div>
      
      {/* Content */}
      <div className={cn("flex-1 px-4 py-0.5 whitespace-pre", textClass)}>
        {line.type === 'hunk' ? (
          <span className="opacity-70">{line.content}</span>
        ) : (
          <span className="relative">
             {/* Marker */}
             <span className="absolute -left-3 select-none opacity-50">
               {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
             </span>
             
             {/* Syntax Highlighted Code */}
             {tokens.map((token, idx) => (
               <span key={idx} className={token.className}>
                 {token.text}
               </span>
             ))}
          </span>
        )}
      </div>
    </div>
  );
});
```

## File: src/root.tsx
```typescript
import { Links, Meta, Scripts, ScrollRestoration, Outlet } from 'react-router';
import type { LinksFunction } from 'react-router';
import { useEffect } from 'react';
import { cn } from '@/utils/cn.util';
import { useStore } from '@/store/root.store';
import { CommandPalette } from '@/components/layout/command-palette.layout';
import { Navigation } from '@/components/layout/navigation.layout';
import { Header } from '@/components/layout/header.layout';
import { useIsMobile } from '@/hooks/mobile.hook';

import '@/styles/main.style.css';

export const links: LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCmdOpen]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="min-h-screen">
          <CommandPalette />
          <Navigation />
          <div className={cn("flex flex-col min-h-screen transition-all duration-300", isMobile ? "pb-20" : "pl-64")}>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

## File: vite.config.ts
```typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

## File: src/features/transactions/components/action-bar.component.tsx
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit } from 'lucide-react';
import { useStore } from "@/store/root.store";

export const FloatingActionBar = () => {
  const transactions = useStore((state) => state.transactions);
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;
  const showBar = pendingCount > 0 || appliedCount > 0;

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center px-3 md:px-4 ring-1 ring-white/10"
          >
              <div className="hidden md:flex items-center gap-2 border-r border-zinc-700/50 pr-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">{pendingCount} Pending</span>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              
              <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2">
                <GitCommit className="w-4 h-4" />
                Commit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

## File: src/services/api.service.ts
```typescript
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
```

## File: src/store/slices/transaction.slice.ts
```typescript
import { StateCreator } from 'zustand';
import { Transaction, Prompt } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
  prompts: Prompt[]; // Store prompts for lookup
  isLoading: boolean;
  expandedId: string | null;
  isWatching: boolean;
  setExpandedId: (id: string | null) => void;
  toggleWatching: () => void;
  fetchTransactions: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
}

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  prompts: [],
  isLoading: false,
  expandedId: null,
  isWatching: false, // Default to false to show the "Start" state

  setExpandedId: (id) => set({ expandedId: id }),
  
  toggleWatching: () => {
    const isNowWatching = !get().isWatching;
    set({ isWatching: isNowWatching });
    
    if (isNowWatching) {
      api.socket.startEmitting();
    } else {
      api.socket.stopEmitting();
    }
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  approveTransaction: (id) => set((state) => ({
    transactions: state.transactions.map((t) => 
      t.id === id 
        ? { ...t, status: 'APPLIED' as const } 
        : t
    )
  })),

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.transactions.list();
      const prompts = await api.transactions.prompts.list();
      set({ transactions: data, prompts });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    set({ isLoading: false });

    // Setup subscription
    api.socket.subscribe((newTx) => {
      if (get().isWatching) {
        get().addTransaction(newTx);
      }
    });
  },
});
```

## File: src/styles/main.style.css
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@layer utilities {
  /* Shimmer/Shine effect for selected cards */
  .shimmer {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.03),
      transparent
    );
    animation: shimmer 3s infinite;
    pointer-events: none;
    z-index: 1;
  }
  
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }


  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #09090b; /* zinc-950 */
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a; /* zinc-800 */
    border-radius: 5px;
    border: 2px solid #09090b; /* zinc-950 */
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3f3f46; /* zinc-700 */
  }

  /* Hide scrollbar but keep scroll functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  html {
    scroll-behavior: smooth;
    height: 100%;
  }

  body {
    min-height: 100%;
  }

  .prose p { margin-bottom: 1.5em; line-height: 1.75; }
  .prose strong { color: var(--color-white); font-weight: 600; }
  .prose blockquote {
    border-left-color: var(--color-indigo-500);
    background: rgba(99, 102, 241, 0.05);
    padding: 1rem;
    border-radius: 0.5rem;
    font-style: normal;
  }
}

/* Typography & Prose Overrides */
.prose {
  --tw-prose-body: var(--color-zinc-300);
  --tw-prose-headings: var(--color-white);
  --tw-prose-links: var(--color-indigo-400);
  --tw-prose-bold: var(--color-zinc-100);
  --tw-prose-counters: var(--color-zinc-500);
  --tw-prose-bullets: var(--color-zinc-600);
  --tw-prose-hr: var(--color-zinc-800);
  --tw-prose-quotes: var(--color-zinc-200);
  --tw-prose-quote-borders: var(--color-zinc-700);
  --tw-prose-captions: var(--color-zinc-400);
  --tw-prose-code: var(--color-indigo-300);
  --tw-prose-pre-code: var(--color-zinc-200);
  --tw-prose-pre-bg: var(--color-zinc-900);
  --tw-prose-th-borders: var(--color-zinc-700);
  --tw-prose-td-borders: var(--color-zinc-800);
}

/* Custom Scrollbar Thin */
.custom-scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 10px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
```

## File: src/types/app.types.ts
```typescript
export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export interface TransactionFile {
  path: string;
  status: 'modified' | 'created' | 'deleted' | 'renamed';
  language: string;
  diff: string;
}

// New: Prompt entity to support grouping
export interface Prompt {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export type TransactionBlock =
  | { type: 'markdown'; content: string }
  | { type: 'file'; file: TransactionFile };

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  createdAt: string;
  promptId: string;
  author: string;
  blocks: TransactionBlock[]; // New narrative structure
  files: TransactionFile[];   // Keep for compatibility/summaries
  provider: string;
  model: string;
  cost: string;
  tokens: string;
  reasoning: string; // Legacy fallback
}

// New: Grouping Strategies
export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';
```

## File: package.json
```json
{
  "name": "relay",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "preview": "react-router-serve ./build/server/index.js"
  },
  "dependencies": {
    "@react-router/dev": "^7.13.0",
    "@react-router/node": "^7.13.0",
    "@react-router/serve": "^7.13.0",
    "@tailwindcss/typography": "^0.5.19",
    "clsx": "2.1.1",
    "framer-motion": "^12.34.0",
    "isbot": "^5",
    "lucide-react": "^0.563.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.0.0",
    "react-router": "^7.13.0",
    "remark-gfm": "^4.0.0",
    "tailwind-merge": "3.4.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "^22.0.0",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react-swc": "3.8.0",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "6.2.0",
    "vite-plugin-singlefile": "2.3.0"
  }
}
```

## File: src/pages/dashboard.page.tsx
```typescript
import { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, Activity, RefreshCw, Filter, Terminal, Command, Layers, Calendar, User, FileCode, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { TransactionCard } from "@/features/transactions/components/transaction-card.component";
import { groupTransactions } from "@/utils/group.util";
import { GroupByStrategy } from "@/types/app.types";

const DEFAULT_GROUP_BY: GroupByStrategy = 'prompt';
const VALID_GROUP_STRATEGIES: GroupByStrategy[] = ['prompt', 'date', 'author', 'status', 'files', 'none'];

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const transactions = useStore((state) => state.transactions);
  const prompts = useStore((state) => state.prompts);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const isWatching = useStore((state) => state.isWatching);
  const toggleWatching = useStore((state) => state.toggleWatching);
  
  // Get groupBy from URL search params
  const groupByParam = searchParams.get('groupBy');
  const groupBy: GroupByStrategy = VALID_GROUP_STRATEGIES.includes(groupByParam as GroupByStrategy) 
    ? (groupByParam as GroupByStrategy) 
    : DEFAULT_GROUP_BY;
  
  const setGroupBy = (strategy: GroupByStrategy) => {
    setSearchParams(prev => {
      prev.set('groupBy', strategy);
      return prev;
    });
  };

  // Track collapsed state of each group
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Track seen transaction IDs to identify new ones (prevents flicker on regroup)
  const seenTransactionIdsRef = useRef<Set<string>>(new Set());
  const [seenTransactionIds, setSeenTransactionIds] = useState<Set<string>>(new Set());
  
  // Update seen transactions when transactions change (with delay for animation)
  useEffect(() => {
    const newIds = new Set<string>();
    
    transactions.forEach(tx => {
      if (!seenTransactionIdsRef.current.has(tx.id)) {
        newIds.add(tx.id);
      }
    });
    
    if (newIds.size > 0) {
      // Delay marking as seen to allow enter animation to complete
      const timer = setTimeout(() => {
        newIds.forEach(id => seenTransactionIdsRef.current.add(id));
        setSeenTransactionIds(new Set(seenTransactionIdsRef.current));
      }, 500); // Wait for animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const hasTransactions = transactions.length > 0;
  
  // Derived Grouped Data - Memoized to prevent O(N) grouping on every render
  const groupedData = useMemo(() => 
    groupTransactions(transactions, prompts, groupBy),
    [transactions, prompts, groupBy]
  );

  const groupOptions = useMemo(() => [
    { id: 'prompt' as const, icon: Layers, label: 'Prompt' },
    { id: 'date' as const, icon: Calendar, label: 'Date' },
    { id: 'author' as const, icon: User, label: 'Author' },
    { id: 'status' as const, icon: CheckCircle2, label: 'Status' },
    { id: 'files' as const, icon: FileCode, label: 'Files' },
    { id: 'none' as const, icon: Filter, label: 'None' },
  ], []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-32">
      
      {/* Hero Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div 
          className={cn(
            "relative rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl group transition-all duration-500",
            hasTransactions ? "lg:col-span-3 p-6" : "lg:col-span-4 p-12 py-20"
          )}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("relative flex h-3 w-3")}>
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isWatching ? "bg-emerald-500" : "bg-amber-500")}></span>
                  <span className={cn("relative inline-flex rounded-full h-3 w-3", isWatching ? "bg-emerald-500" : "bg-amber-500")}></span>
                </span>
                <h2 className={cn("text-xs font-bold uppercase tracking-widest", isWatching ? "text-emerald-500" : "text-amber-500")}>
                  {isWatching ? 'System Active' : 'System Paused'}
                </h2>
              </div>
              <h1 className={cn("font-bold text-white mb-2 tracking-tight transition-all", hasTransactions ? "text-xl md:text-2xl" : "text-3xl md:text-4xl")}>
                {isWatching ? 'Monitoring Clipboard Stream' : 'Ready to Intercept Patches'}
              </h1>
              <p className={cn("text-zinc-500 transition-all leading-relaxed", hasTransactions ? "text-sm max-w-lg" : "text-base max-w-2xl")}>
                {isWatching 
                  ? 'Relaycode is actively scanning for AI code blocks. Patches will appear below automatically.' 
                  : 'Resume monitoring to detect new AI patches from your clipboard.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={toggleWatching}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-xl",
                  isWatching 
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 ring-1 ring-emerald-500/50"
                )}
              >
                {isWatching ? (
                  <><Pause className="w-4 h-4 fill-current" /> Pause Watcher</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Start Monitoring</>
                )}
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Stats Card */}
        {hasTransactions && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-center gap-4 backdrop-blur-sm"
          >
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Session Stats</span>
                <Activity className="w-4 h-4 text-emerald-500" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-2xl font-bold text-white">{transactions.length}</div>
                   <div className="text-xs text-zinc-500">Events Captured</div>
                </div>
                <div>
                   <div className="text-2xl font-bold text-zinc-300">92%</div>
                   <div className="text-xs text-zinc-500">Auto-Success</div>
                </div>
             </div>
          </motion.div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {hasTransactions && (
          <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -my-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/50 md:border-none px-1 md:px-0 gap-4">
            
            <div className="flex items-center justify-between w-full md:w-auto flex-1">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-zinc-500" />
                <h3 className="text-lg font-semibold text-white">Event Log</h3>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">{transactions.length}</span>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button className="md:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300">
                 <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Grouping Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <span className="text-xs text-zinc-500 hidden md:block mr-2">Group by:</span>
              {groupOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGroupBy(opt.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
                    groupBy === opt.id 
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                      : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                  )}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
            
            {/* Secondary Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 min-h-[300px] mt-8">
          <AnimatePresence mode='popLayout'>
            {hasTransactions ? (
              groupedData.map((group) => {
                const isCollapsed = collapsedGroups.has(group.id);
                return (
                  <div key={group.id} className="space-y-3">
                    {/* Group Header - Clickable */}
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center gap-3 pt-4 first:pt-0 w-full group/header"
                    >
                      <div className="h-px flex-1 bg-zinc-800/50" />
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                        {isCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover/header:text-zinc-300 transition-colors" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-zinc-500 group-hover/header:text-zinc-300 transition-colors" />
                        )}
                        <span className="text-xs font-medium text-zinc-300">{group.label}</span>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{group.count}</span>
                      </div>
                      <div className="h-px flex-1 bg-zinc-800/50" />
                    </button>
                    
                    {/* Group Items - Collapsible */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <div className="space-y-3 pl-0 md:pl-2 border-l-0 md:border-l border-zinc-800/50 ml-3">
                            {group.transactions.map((tx) => (
                              <TransactionCard 
                                key={tx.id} 
                                tx={tx}
                                isNew={!seenTransactionIds.has(tx.id)} 
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-xl">
                   <Command className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No patches detected yet</h3>
                <p className="max-w-sm text-center text-sm mb-6">
                  Copy any AI-generated code block (Claude, GPT, etc.) to your clipboard to see it appear here instantly.
                </p>
                <button 
                  onClick={toggleWatching}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {isWatching ? 'Waiting for clipboard events...' : 'Start Monitoring'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
```

## File: src/features/transactions/components/transaction-card.component.tsx
```typescript
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Copy,
  Terminal,
  Cpu,
  Coins,
  History,
  ExternalLink,
  ListTree
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { Transaction } from "@/types/app.types";
import { StatusBadge } from "@/components/ui/status-badge.ui";
import { DiffViewer } from "@/components/ui/diff-viewer.ui.tsx";
import { useStore } from "@/store/root.store";
import { getDiffStats } from "@/utils/diff.util";

interface TransactionCardProps {
  tx: Transaction;
  isNew?: boolean;
}

export const TransactionCard = memo(({ tx, isNew = false }: TransactionCardProps) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const approveTransaction = useStore((state) => state.approveTransaction);
  const expanded = expandedId === tx.id;
  
  // Track active section in view
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outlineRef = useRef<HTMLDivElement>(null);
  
  const onToggle = useCallback(() => setExpandedId(expanded ? null : tx.id), [expanded, setExpandedId, tx.id]);

  const handleApprove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    approveTransaction(tx.id);
  }, [tx.id, approveTransaction]);

  const scrollToId = useCallback((id: string, index: number) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100; // Account for sticky header + some padding
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  }, []);

  // IntersectionObserver to track which file is in view
  useEffect(() => {
    if (!expanded) return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px', // Trigger when element is near top of viewport
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          setActiveIndex(index);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    blockRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [expanded, tx.blocks]);

  const statusBorderColors = {
    PENDING:    'border-amber-500/40 hover:border-amber-500/60',
    APPLIED:    'border-emerald-500/40 hover:border-emerald-500/60',
    COMMITTED:  'border-blue-500/40 hover:border-blue-500/60',
    REVERTED:   'border-zinc-500/30 hover:border-zinc-500/50',
    FAILED:     'border-red-500/40 hover:border-red-500/60',
  };

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border transition-all duration-300 relative",
        expanded
          ? "bg-zinc-900/80 z-10 my-12 border-indigo-500/30 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-500/20"
          : "bg-zinc-900/40 hover:bg-zinc-900/60 shadow-sm",
        !expanded && statusBorderColors[tx.status]
      )}
    >
      {expanded && <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />}
      {/* STICKY HEADER: Integrated Controls */}
      <div
        onClick={onToggle}
        className={cn(
          "z-20 transition-all duration-300 cursor-pointer select-none",
          expanded
            ? "sticky top-16 bg-zinc-900 rounded-t-2xl backdrop-blur-md border-b border-zinc-800/80 px-6 py-4"
            : "p-4"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-1 rounded-md transition-colors",
            expanded ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600"
          )}>
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded ? "rotate-0" : "-rotate-90")} />
          </div>

          <div className="flex-1 flex items-center gap-4 min-w-0">
            <StatusBadge status={tx.status} />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-sm font-semibold truncate",
                expanded ? "text-white" : "text-zinc-300"
              )}>
                {tx.description}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-mono">
                <History className="w-3 h-3" /> {tx.timestamp}
                <span>•</span>
                <span className="text-zinc-600">ID: {tx.id.split('-').pop()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tx.status === 'PENDING' && (
              <button
                onClick={handleApprove}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95",
                  !expanded && "hidden md:flex"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Apply
              </button>
            )}
            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT CONTENT */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-950/30 relative z-10 overflow-visible"
          >
            {/* Observability Strip */}
            <div className="flex items-center gap-6 px-8 py-3 bg-zinc-950 border-b border-zinc-900/50 overflow-x-auto scrollbar-hide">
               <MetaItem icon={Cpu} label="Engine" value={`${tx.provider} / ${tx.model}`} color="text-indigo-400" />
               <MetaItem icon={Terminal} label="Context" value={`${tx.tokens} tokens`} color="text-emerald-400" />
               <MetaItem icon={Coins} label="Cost" value={tx.cost} color="text-amber-400" />
               <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <ExternalLink className="w-3 h-3" />
                  <span>Report v2.4</span>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 p-4 md:p-10 max-w-[1400px] mx-auto bg-zinc-950">

              {/* QUICK JUMP SIDEBAR (Desktop) */}
              <div className="hidden lg:block w-64 shrink-0">
                <div 
                  ref={outlineRef}
                  className="sticky top-36 space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-scrollbar-thin flex flex-col"
                >
                  <div className="flex items-center gap-2 text-zinc-500 mb-2 shrink-0">
                    <ListTree className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Outline</span>
                    <span className="ml-auto text-[10px] text-zinc-600">
                      {tx.blocks?.filter(b => b.type === 'file').length || 0} files
                    </span>
                  </div>
                  <nav className="space-y-0.5 pb-4">
                    {tx.blocks?.map((block, idx) => {
                      if (block.type !== 'file') return null;
                      const isActive = activeIndex === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => scrollToId(`${tx.id}-file-${idx}`, idx)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-all truncate group flex items-center gap-2",
                            isActive 
                              ? "text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-500" 
                              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-l-2 border-transparent"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                            isActive 
                              ? "bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]"
                              : "bg-zinc-700 group-hover:bg-zinc-500"
                          )} />
                          <span className="truncate">{(block as any).file.path.split('/').pop()}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* MAIN CONTENT STREAM */}
              <div className="flex-1 space-y-12 min-w-0">
                {(tx.blocks || []).length > 0 ? (
                  tx.blocks.map((block, i) => (
                    <div 
                      key={i} 
                      id={block.type === 'file' ? `${tx.id}-file-${i}` : undefined}
                      ref={block.type === 'file' ? (el) => { blockRefs.current[i] = el; } : undefined}
                      data-index={block.type === 'file' ? i : undefined}
                    >
                      {block.type === 'markdown' ? (
                        <div className="prose prose-zinc prose-invert prose-sm max-w-none px-4 mb-8">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {block.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <FileSection file={block.file} />
                      )}
                    </div>
                  ))
                ) : (
                  null
                )}

                {/* Action Footer */}
                {tx.status === 'PENDING' && (
                  <div className="flex items-center justify-center pt-8 border-t border-zinc-800/50">
                    <button
                      onClick={handleApprove}
                      className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-3 shadow-2xl shadow-white/5"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Approve Implementation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const MetaItem = memo(({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-2 shrink-0">
    <div className={cn("p-1.5 rounded bg-zinc-800/50 border border-zinc-700/50", color)}>
      <Icon className="w-3 h-3" />
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter leading-none mb-0.5">{label}</span>
      <span className="text-[11px] font-mono text-zinc-300 leading-none">{value}</span>
    </div>
  </div>
));

const FileSection = memo(({ file }: { file: any }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const stats = useMemo(() => getDiffStats(file.diff), [file.diff]);

  const toggleExpanded = useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);

  return (
    <div className="mb-10 group/file">
      <div 
        className={cn(
          "sticky top-36 z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
      >
        <div 
          className="flex items-center gap-3 min-w-0 cursor-pointer select-none"
          onClick={toggleExpanded}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            file.status === 'modified' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
            file.status === 'created' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
          )} />
          <span className="text-xs font-mono text-zinc-300 truncate">{file.path}</span>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono ml-2 opacity-60">
            <span className="text-emerald-500">+{stats.adds}</span>
            <span className="text-red-500">-{stats.subs}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <button 
            onClick={toggleExpanded}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !isExpanded && "-rotate-90")} />
          </button>
          <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-x border-b border-zinc-800/60 rounded-b-xl bg-zinc-950"
          >
            <DiffViewer diff={file.diff} language={file.language} className="max-h-[600px]" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
});
```
