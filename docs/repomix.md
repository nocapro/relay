# Directory Structure
```
src/
  features/
    transactions/
      components/
        action-bar.component.tsx
        transaction-card.component.tsx
  styles/
    main.style.css
package.json
tsconfig.json
vite.config.ts
```

# Files

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

## File: src/features/transactions/components/action-bar.component.tsx
```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit, ListChecks } from 'lucide-react';
import { useStore } from "@/store/root.store";

export const FloatingActionBar = () => {
  const activeTab = useStore((state) => state.activeTab);
  const transactions = useStore((state) => state.transactions);
  
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;

  // Only show if we have pending items or items ready to commit
  const showBar = activeTab === 'dashboard' && (pendingCount > 0 || appliedCount > 0);

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm md:max-w-md px-4">
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/80 rounded-2xl p-1.5 flex items-center justify-between pl-4 pr-1.5 ring-1 ring-white/10"
          >
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-zinc-700/50 mr-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-amber-500 blur-[4px] opacity-50" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">{pendingCount} Pending</span>
                   <span className="text-[10px] text-zinc-400">{appliedCount} ready to commit</span>
                </div>
              </div>

              {/* Mobile Status Text */}
              <div className="md:hidden flex items-center gap-2 text-xs font-semibold text-zinc-300 mr-auto">
                 <ListChecks className="w-4 h-4 text-amber-500" />
                 <span>{pendingCount} Pending</span>
              </div>
              
              <div className="flex items-center gap-2">
                 {pendingCount > 0 && (
                   <button className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve All
                  </button>
                 )}
                
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                  <GitCommit className="w-3.5 h-3.5" />
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

## File: src/styles/main.style.css
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@layer utilities {
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
    overflow-x: hidden;
    overflow-y: auto;
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

## File: src/features/transactions/components/transaction-card.component.tsx
```typescript
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

export const TransactionCard = ({ tx, isNew = false }: TransactionCardProps) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const approveTransaction = useStore((state) => state.approveTransaction);
  const expanded = expandedId === tx.id;
  
  const onToggle = () => setExpandedId(expanded ? null : tx.id);

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approveTransaction(tx.id);
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "group border rounded-2xl transition-all duration-500 relative overflow-hidden",
        expanded
          ? "bg-zinc-950 border-zinc-700/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-10 my-12"
          : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-zinc-700 shadow-sm"
      )}
    >
      {/* STICKY HEADER: Integrated Controls */}
      <div
        onClick={onToggle}
        className={cn(
          "z-40 transition-all duration-300 cursor-pointer select-none",
          expanded
            ? "sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4"
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
            className="overflow-hidden"
          >
            {/* Observability Strip */}
            <div className="flex items-center gap-6 px-8 py-4 bg-zinc-900/30 border-b border-zinc-800/50 overflow-x-auto scrollbar-hide">
               <MetaItem icon={Cpu} label="Engine" value={`${tx.provider} / ${tx.model}`} color="text-indigo-400" />
               <MetaItem icon={Terminal} label="Context" value={`${tx.tokens} tokens`} color="text-emerald-400" />
               <MetaItem icon={Coins} label="Cost" value={tx.cost} color="text-amber-400" />
               <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <ExternalLink className="w-3 h-3" />
                  <span>Report v2.4</span>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 p-4 md:p-10 max-w-[1400px] mx-auto relative">

              {/* QUICK JUMP SIDEBAR (Desktop) */}
              <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div className="flex items-center gap-2 text-zinc-500 mb-4">
                    <ListTree className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Outline</span>
                  </div>
                  <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar-thin pr-2">
                    {tx.blocks?.filter(b => b.type === 'file').map((block, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToId(`${tx.id}-file-${idx}`)}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all truncate group"
                      >
                        <span className="opacity-0 group-hover:opacity-100 mr-1 text-indigo-500">#</span>
                        {(block as any).file.path.split('/').pop()}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* MAIN CONTENT STREAM */}
              <div className="flex-1 space-y-12 min-w-0">
                {(tx.blocks || []).length > 0 ? (
                  tx.blocks.map((block, i) => (
                    <div key={i} id={block.type === 'file' ? `${tx.id}-file-${i}` : undefined}>
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
};

const MetaItem = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-2 shrink-0">
    <div className={cn("p-1.5 rounded bg-zinc-800/50 border border-zinc-700/50", color)}>
      <Icon className="w-3 h-3" />
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter leading-none mb-0.5">{label}</span>
      <span className="text-[11px] font-mono text-zinc-300 leading-none">{value}</span>
    </div>
  </div>
);

const FileSection = ({ file }: { file: any }) => {
  const stats = getDiffStats(file.diff);
  return (
    <div className="space-y-3 mb-10">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            file.status === 'modified' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
            file.status === 'created' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
          )} />
          <span className="text-xs font-mono text-zinc-300">{file.path}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-emerald-500/80">+{stats.adds}</span>
          <span className="text-red-500/80">-{stats.subs}</span>
        </div>
      </div>
      <div className="group/file border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl transition-all hover:border-zinc-700/50">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
          </div>
          <button className="p-1 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover/file:opacity-100">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <DiffViewer diff={file.diff} language={file.language} className="max-h-[500px]" />
      </div>
    </div>
  );
};
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
