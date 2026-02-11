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
  app.component.tsx
  main.tsx
index.html
package.json
readme.md
tsconfig.json
vite.config.ts
```

# Files

## File: src/components/common/placeholder.view.tsx
````typescript
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
````

## File: src/components/layout/command-palette.layout.tsx
````typescript
import { Search, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from "@/store/root.store";

export const CommandPalette = () => {
  const isCmdOpen = useStore((state) => state.isCmdOpen);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  
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
            autoFocus
            type="text" 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none text-sm h-6"
          />
          <span className="text-xs text-zinc-600 border border-zinc-800 px-1.5 rounded">ESC</span>
        </div>
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
            <Play className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
            Resume Monitoring
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
            <CheckCircle2 className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
            Approve All Pending
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
             <RefreshCw className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
             Retry Failed Patches
          </button>
        </div>
      </motion.div>
    </div>
  );
};
````

## File: src/components/layout/header.layout.tsx
````typescript
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
````

## File: src/components/layout/navigation.layout.tsx
````typescript
import { Activity, Settings, Clock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";
import { AppTab } from '@/types/app.types';

export const Navigation = () => {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const isMobile = useIsMobile();

  const items: { id: AppTab; icon: any; label: string }[] = [
    { id: 'dashboard', icon: Activity, label: 'Stream' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="flex justify-around items-center p-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20",
                activeTab === item.id ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className={cn("p-1.5 rounded-full transition-all", activeTab === item.id ? "bg-indigo-500/10" : "bg-transparent")}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
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
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-zinc-900 text-white shadow-inner shadow-black/20" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              {activeTab === item.id && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              {item.label}
            </button>
          ))}
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
````

## File: src/components/ui/diff-viewer.ui.tsx
````typescript
import { useMemo } from 'react';
import { parseDiff, tokenizeCode, DiffLine } from "@/utils/diff.util";
import { cn } from "@/utils/cn.util";

interface DiffViewerProps {
  diff: string;
  language: string;
  className?: string;
}

export const DiffViewer = ({ diff, language, className }: DiffViewerProps) => {
  const lines = useMemo(() => parseDiff(diff), [diff]);

  return (
    <div className={cn("font-mono text-xs overflow-x-auto", className)}>
      <div className="min-w-full inline-block">
        {lines.map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
      </div>
    </div>
  );
};

const LineRow = ({ line }: { line: DiffLine }) => {
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
    'text-zinc-600';

  return (
    <div className={cn("flex w-full group hover:bg-white/5", bgClass)}>
      {/* Line Numbers */}
      <div className={cn("w-12 flex-shrink-0 select-none text-right pr-3 py-0.5 border-r border-white/5", gutterClass)}>
        {line.oldLine || ' '}
      </div>
      <div className={cn("w-12 flex-shrink-0 select-none text-right pr-3 py-0.5 border-r border-white/5", gutterClass)}>
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
};
````

## File: src/hooks/mobile.hook.ts
````typescript
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
````

## File: src/store/slices/ui.slice.ts
````typescript
import { StateCreator } from 'zustand';
import { AppTab } from '@/types/app.types';
import { RootState } from '../root.store';

export interface UiSlice {
  activeTab: AppTab;
  isCmdOpen: boolean;
  setActiveTab: (tab: AppTab) => void;
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  activeTab: 'dashboard',
  isCmdOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
});
````

## File: src/store/root.store.ts
````typescript
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
  setActiveTab: state.setActiveTab,
  setCmdOpen: state.setCmdOpen,
  toggleCmd: state.toggleCmd,
}));

export const useTransactionActions = () => useStore((state) => ({
  setExpandedId: state.setExpandedId,
  toggleWatching: state.toggleWatching,
  fetchTransactions: state.fetchTransactions,
}));
````

## File: src/utils/cn.util.ts
````typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
````

## File: src/utils/diff.util.ts
````typescript
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
````

## File: src/app.component.tsx
````typescript
import { useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";

// Components
import { CommandPalette } from "@/components/layout/command-palette.layout";
import { Navigation } from "@/components/layout/navigation.layout";
import { Header } from "@/components/layout/header.layout";
import { PlaceholderView } from "@/components/common/placeholder.view";

// Pages
import { Dashboard } from "@/pages/dashboard.page";
import { FloatingActionBar } from "@/features/transactions/components/action-bar.component";

export function App() {
  const activeTab = useStore((state) => state.activeTab);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const isMobile = useIsMobile();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true); // Using store directly inside effect might need callback if strict, but this works
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCmdOpen]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <CommandPalette />
      
      <Navigation />
      
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isMobile ? "pb-20" : "pl-64")}>
        <Header />
        
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'history' && <PlaceholderView title="Transaction History" icon={Clock} />}
                {activeTab === 'settings' && <PlaceholderView title="System Settings" icon={Settings} />}
             </motion.div>
          </AnimatePresence>
        </main>
        <FloatingActionBar />
      </div>
    </div>
  );
}
````

## File: readme.md
````markdown
# Relaycode

**A zero-friction, AI-native patch engine for modern development workflows.**

Relaycode is a stateful Terminal User Interface (TUI) application that bridges the gap between AI-generated code changes and production commits. It transforms chaotic AI patch application into a structured, reviewable, and reversible transaction system.

## Table of Contents

- [Core Philosophy](#core-philosophy)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Workflow & State Machines](#workflow--state-machines)
- [Screen Reference](#screen-reference)
- [Configuration](#configuration)
- [Keyboard Navigation](#keyboard-navigation)
- [Integration Points](#integration-points)

---

## Core Philosophy

### Transaction-Based Code Management

Relaycode treats every code change as a **transaction**—a discrete, trackable unit of work that moves through defined states:

1. **PENDING** - Patch detected, awaiting review
2. **APPLIED** - Changes approved and written to filesystem
3. **COMMITTED** - Changes committed to git history
4. **REVERTED** - Changes undone (creates inverse transaction)
5. **FAILED** - Patch application failed, awaiting repair

### Zero-Friction AI Integration

Unlike traditional AI coding assistants that overwrite files directly, Relaycode:
- **Intercepts** AI-generated patches from clipboard
- **Stages** them in a reviewable state without touching git
- **Validates** changes with post-commands (tests, linters)
- **Preserves** complete audit trails of AI reasoning and decisions

### Stateful TUI Architecture

Built with React + Ink, Relaycode maintains complex UI state:
- **Persistent Context**: Header shows git branch, project ID, and system status
- **Progressive Disclosure**: Expandable sections reveal detail without clutter
- **Context-Aware Actions**: Footer shortcuts change based on current state
- **Non-Blocking Operations**: Background processing with real-time feedback

---

## Key Features

### 1. Intelligent Clipboard Monitoring (`relay watch`)
- **Live Detection**: Automatically detects patch formats in clipboard
- **Smart Parsing**: Supports unified diff, git patches, and AI-generated formats
- **Global Pause/Resume**: System-wide clipboard monitoring control (`P`)
- **Event Stream**: Reverse-chronological transaction history with real-time updates

### 2. Granular Review System
- **Per-File Approval**: Approve/reject individual files within a transaction
- **Visual Diff Rendering**: Syntax-highlighted diffs with hunk navigation (`J`/`K`)
- **AI Reasoning Display**: View step-by-step AI logic (`R` key)
- **Strategy Selection**: Choose patch application strategies (replace, merge, etc.)

### 3. Multi-State Repair Workflows
When patches fail (context mismatches, line offsets):
- **Manual Override**: Edit patch context directly
- **AI Auto-Repair**: Automated context adjustment with progress visualization
- **Bulk Repair**: Handle multiple failed files simultaneously
- **External Handoff**: Generate detailed prompts for external AI agents

### 4. Post-Command Validation
- **Hook Integration**: Automatic test/lint execution after patch application
- **Output Capture**: View script results inline with error navigation
- **Conditional Logic**: Block commits on failed validation or allow override
- **Performance Metrics**: Track execution time for each validation step

### 5. Advanced Copy Mode
Context-aware clipboard extraction:
- **Metadata Extraction**: Copy UUIDs, git messages, AI prompts
- **Diff Aggregation**: Copy specific files or entire transaction diffs
- **Context Sharing**: Export context files for external AI agents
- **Multi-Select**: Bulk copy across multiple transactions

### 6. Transaction History & Forensics
Complete audit trail with drill-down capabilities:
- **Hierarchical Browsing**: 3-level expansion (Transaction → Section → Content)
- **In-Place Diff Preview**: View code changes without leaving the list
- **Advanced Filtering**: Query by file path, status, date, or content (`F`)
- **Bulk Actions**: Revert, delete, or mark multiple transactions
- **Immutable Records**: Original AI prompts and reasoning preserved forever

### 7. Git-Native Workflow
- **Commit Aggregation**: Bundle multiple transactions into single git commits
- **Message Generation**: AI-generated commit messages with manual override
- **Pre-Commit Review**: Final "airlock" screen before `git commit`
- **Revert Safety**: Creates new transactions for rollbacks, preserving history

### 8. Multi-Provider AI Support
- **Provider Agnostic**: OpenRouter, Anthropic, OpenAI, Google AI, etc.
- **Model Selection**: Per-transaction model choice with cost awareness
- **Secure Storage**: Encrypted local API key management
- **Failover Logic**: Automatic retry with exponential backoff

---

## System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Ink (TUI)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Screens    │  │   Stores     │  │   Components     │   │
│  │  (16 types) │  │  (Zustand)   │  │ (Ink + Custom)   │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
┌─────────▼────────────────▼───────────────────▼─────────────┐
│                    Service Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │   Patch      │ │   Git        │ │   AI Providers   │   │
│  │  Processor   │ │  Integration │ │   (Multi-model)  │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### State Management Architecture

**Store Segregation:**
- `dashboard.store.ts` - Watcher state, event stream, selection
- `review.store.ts` - Transaction review states, file approvals, body views
- `transaction.store.ts` - Transaction data, history, metadata
- `init.store.ts` - Bootstrap phase machine, user choices
- `settings.store.ts` - AI provider configuration, API keys

### Transaction Lifecycle

```
┌──────────┐    Detect     ┌──────────┐    Review     ┌──────────┐
│ Clipboard│──────────────▶│  PENDING │──────────────▶│  APPLIED │
└──────────┘               └──────────┘               └────┬─────┘
                                                           │
                              ┌────────────────────────────┘
                              │ Post-Commands
                              ▼
┌──────────┐    Commit    ┌──────────┐    Revert    ┌──────────┐
│   Git    │◀─────────────│ COMMITTED│◀─────────────│ REVERTED │
└──────────┘               └──────────┘               └──────────┘
```

---

## Workflow & State Machines

### 1. Standard Application Flow

```mermaid
[Splash Screen] → [Initialization] → [Dashboard] → [Review] → [Commit]
```

**Phase 1: Bootstrap** (`relay init`)
- **Analyze**: Detect project structure, git status, existing config
- **Configure**: Create `relay.config.json`, initialize `.relay/` state directory
- **Interactive Choice**: Git repository initialization prompts
- **Finalize**: Generate system prompts, display next actions

**Phase 2: Monitoring** (`relay watch`)
- **Active Listening**: Clipboard watcher monitors for patch formats
- **Transaction Creation**: New transactions appear in PENDING state
- **Real-time Updates**: Event stream with animated entry indicators
- **Global Controls**: Pause/Resume affects all screens

**Phase 3: Review** (Auto-triggered on detection)
The Review Screen implements a **13-state finite state machine**:

| State | Description | Key Actions |
|-------|-------------|-------------|
| **Success** | All files applied, scripts passed | Approve All (`A`), Commit (`C`) |
| **Partial Failure** | Some files failed to apply | Try Repair (`T`), Bulk Repair (`Shift+T`) |
| **Script Issues** | Tests/lint failed | View Output (`Enter`), Navigate Errors (`J`/`K`) |
| **Diff View** | Examining code changes | Hunk Nav (`J`/`K`), Expand (`X`) |
| **Reasoning View** | Reading AI logic | Scroll (`↑↓`), Copy (`C`) |
| **Copy Mode** | Extracting data | Multi-select (`Space`), Aggregate Copy |
| **Bulk Repair Modal** | Multi-file fix strategy | Handoff, Auto-repair, Change Strategy |
| **Handoff Confirm** | External AI delegation | Confirm (`Enter`), Copy Prompt |

**Phase 4: Commit** (`relay git commit` or `C` from Dashboard)
- **Summary View**: Lists all included transactions
- **Message Preview**: Shows generated commit message
- **Final Gate**: Explicit confirmation before git operations
- **Atomic Commit**: All or nothing transaction bundling

### 2. AI Processing Flow (Auto-Repair)

When patch application fails:

```
[Review Screen] → [AI Processing Screen] → [Context Analysis] → [API Request]
                                                         ↓
[Patch Generation] ← [Response Processing] ← [AI Interaction]
        ↓
[Validation] → [Success: Return to Review] / [Failure: Error Display]
```

**Visual Feedback:**
- Real-time step indicators with spinners (`(●)`)
- Sub-step hierarchies for file-level operations
- Timing information (elapsed: 5.1s)
- Error context with retry logic

### 3. Failure Recovery Hierarchy

1. **Single File Repair** (`T` on failed file)
   - Change strategy (context vs. line-based)
   - Manual context edit
   - AI-guided repair

2. **Bulk Repair** (`Shift+T` with multiple failures)
   - Copy bulk re-apply prompt (for single-shot AI)
   - Bulk strategy change
   - Auto-repair with AI (parallel processing)

3. **External Handoff**
   - Generate comprehensive prompt with context
   - Copy to clipboard for external agent (Claude, GPT-4, etc.)
   - Mark transaction as "Handoff" (terminal state)

---

## Screen Reference

### Dashboard Screen (`relay watch`)
The operational HUD with **5 distinct states**:
- **Active & Listening**: Default operational state
- **Paused**: Clipboard monitoring suspended
- **Confirmation Overlay**: Modal for destructive actions (Approve All)
- **In-Progress**: Animated spinners during batch operations
- **Expanded Item**: Drill-down into transaction details

**Key Footer Actions**: `(A)pprove All`, `(C)ommit`, `(P)ause`, `(L)og`, `(Q)uit`

### Review Screen (13 States)
Complex multi-state interface with dynamic footers:

**Primary Views:**
- **Navigator**: File list with status indicators (`[✓]`, `[✗]`, `[!]`)
- **Diff View**: Syntax-highlighted changes with hunk navigation (`J`/`K`)
- **Reasoning View**: AI thought process with scroll support
- **Script Output**: Test/lint results with error navigation

**Modal Overlays:**
- **Copy Mode**: Checkbox selection for data extraction
- **Bulk Repair**: Strategy selection for multiple failures
- **Handoff Confirm**: Final check before external delegation

### Transaction History Screen (`relay log`)
Hierarchical database explorer:

**3-Level Drill Down:**
1. **Transaction List** - `▸` collapsed, `▾` expanded
2. **Section Preview** - Prompt, Reasoning, Files list
3. **Content Preview** - In-place diff/reasoning text

**Advanced Features:**
- **Filtering**: Real-time search with syntax (`logger.ts status:committed`)
- **Multi-Select**: Spacebar selection for bulk operations
- **Copy Mode**: Multi-transaction data aggregation
- **Bulk Actions**: Revert, delete, or modify multiple transactions

### AI Processing Screen
Real-time monitoring for automated operations:

**Visual Indicators:**
- `( )` Pending → `(●)` Active → `[✓]` Completed → `[!]` Failed
- Hierarchical sub-steps with indentation
- Elapsed time counters
- Progress-aware footer (Cancel, Skip Script)

### Git Commit Screen
Final "airlock" before repository modification:

- **Contextual Summary**: Lists bundled transactions
- **Message Preview**: Final commit message display
- **Safety Gate**: Binary choice (Confirm/Cancel)
- **Simplicity**: No deep inspection, only final confirmation

### Settings Screen
AI provider configuration with **3-step setup**:
1. **Provider Selection**: Searchable dropdown (OpenRouter, Anthropic, etc.)
2. **API Key Input**: Masked secure input with validation
3. **Model Selection**: Provider-filtered model list

**Features**: Real-time validation, secure local storage, multi-profile support

### Supporting Screens
- **Copy Mode**: Context-aware data extraction overlay (available in Review, History, Details)
- **Debug Log**: System event monitoring with level filtering (ERROR, WARN, INFO, DEBUG)
- **Notification**: Non-blocking alerts with auto-dismissal (Success, Error, Warning, Info)
- **Initialization**: 5-phase bootstrap (Analyze → Configure → Interactive → Finalize)
- **Splash Screen**: Animated startup with update checking and community links

---

## Configuration

### File Structure
```
project-root/
├── relay.config.json          # Main configuration
├── .relay/                    # State directory (gitignored by default)
│   ├── transactions/          # Transaction YAML files
│   ├── prompts/
│   │   └── system-prompt.md   # AI system instructions
│   └── state.json             # Application state
└── .gitignore                 # Relaycode patterns added automatically
```

### Configuration Options (`relay.config.json`)
```json
{
  "projectId": "my-project",
  "aiProvider": {
    "name": "openrouter",
    "apiKey": "sk-or-v1-...",
    "defaultModel": "anthropic/claude-3.5-sonnet"
  },
  "postCommands": [
    "npm run test",
    "npm run lint"
  ],
  "git": {
    "autoCommit": false,
    "commitMessageTemplate": "conventional"
  },
  "ui": {
    "theme": "default",
    "confirmDestructive": true
  }
}
```

### Environment Variables
- `RELAYCODE_API_KEY` - Override provider API key
- `RELAYCODE_CONFIG_PATH` - Custom config location
- `RELAYCODE_DEBUG` - Enable debug logging

---

## Keyboard Navigation

### Universal Shortcuts
| Key | Action |
|-----|--------|
| `?` | Global help overlay |
| `Q` / `Ctrl+C` | Quit/Cancel |
| `Esc` | Back/Close modal |
| `↑` `↓` | Navigate items |
| `→` / `Enter` | Expand/Select |
| `←` | Collapse/Back |

### Context-Aware Shortcuts
Shortcuts change based on current screen state:

**Dashboard:**
- `A` - Approve All (with confirmation)
- `C` - Commit All
- `P` - Pause/Resume
- `L` - View Log

**Review Screen:**
- `Space` - Toggle file approval
- `D` - View Diff
- `R` - View Reasoning
- `T` - Try Repair (failed files)
- `Shift+T` - Bulk Repair
- `C` - Copy Mode
- `J`/`K` - Next/Previous hunk or error

**History Screen:**
- `F` - Filter mode
- `Space` - Select for bulk
- `B` - Bulk Actions
- `O` - Open YAML

**Copy Mode (Global):**
- `U` - UUID
- `M` - Git Message
- `P` - Prompt
- `R` - Reasoning
- `F` - Diff for selected file
- `A` - All Diffs

---

## Integration Points

### AI Provider Integration
- **OpenRouter**: Unified API for multiple models
- **Anthropic**: Claude 3.5 Sonnet with extended thinking
- **OpenAI**: GPT-4, GPT-4o with tool use
- **Local Models**: Ollama, LM Studio support

**Features:**
- Streaming responses for real-time processing
- Cost tracking per transaction
- Model fallback chains
- Rate limit handling with exponential backoff

### Git Integration
- **Native Git**: Direct `git` CLI execution
- **State Synchronization**: Transaction status synced with git state
- **Reversible Operations**: All changes tracked as revertible transactions
- **Branch Awareness**: Dashboard shows current branch in header

### Editor Integration
- **YAML Editing**: `O` key opens transaction YAML in `$EDITOR`
- **Diff Viewing**: Integration with external diff tools (configurable)
- **File Preview**: Open specific files from review screen

### Clipboard System
- **Multi-format**: Supports HTML, RTF, plain text
- **Paste Detection**: Monitors system clipboard continuously
- **Format Validation**: Validates patch structure before processing
- **Copy Aggregation**: Multi-item clipboard formatting

---

## Development

### Prerequisites
- Node.js 18+
- Git 2.30+
- Terminal with Unicode and 256-color support

### Installation
```bash
npm install -g relaycode
# or
yarn global add relaycode
# or
bun install -g relaycode
```

### Quick Start
```bash
# Initialize project
cd my-project
relay init

# Start monitoring
relay watch

# Process a patch from clipboard
# (Paste patch, UI appears automatically)

# View history
relay log

# Commit approved changes
relay git commit
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

Built by Arman and contributors · [https://relay.noca.pro ](https://relay.noca.pro )

---

**Relaycode**: Transforming AI-generated chaos into structured, reviewable, and reversible development workflows.
````

## File: tsconfig.json
````json
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
````

## File: src/components/ui/status-badge.ui.tsx
````typescript
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
````

## File: src/features/transactions/components/action-bar.component.tsx
````typescript
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
````

## File: src/features/transactions/components/transaction-card.component.tsx
````typescript
import { useState } from 'react';
import { 
  CheckCircle2, 
  RefreshCw, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Zap, 
  Copy, 
  Code2,
  BrainCircuit,
  FileDiff,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { Transaction } from "@/types/app.types";
import { StatusBadge } from "@/components/ui/status-badge.ui";
import { DiffViewer } from "@/components/ui/diff-viewer.ui";
import { useStore } from "@/store/root.store";

export const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const approveTransaction = useStore((state) => state.approveTransaction);
  const expanded = expandedId === tx.id;
  
  const [activeTab, setActiveTab] = useState<'reasoning' | 'diff'>('diff');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const onToggle = () => setExpandedId(expanded ? null : tx.id);
  const selectedFile = tx.files[selectedFileIndex];

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approveTransaction(tx.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "group border rounded-xl transition-all duration-300 overflow-hidden relative",
        expanded 
          ? "bg-zinc-950 border-indigo-500/30 shadow-2xl shadow-black/50 ring-1 ring-indigo-500/20 z-10" 
          : "bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-zinc-700"
      )}
    >
      {/* Background Highlight for Active State */}
      {expanded && <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />}

      {/* Card Header */}
      <div 
        onClick={onToggle}
        className="p-4 cursor-pointer flex items-start md:items-center gap-4 relative z-10"
      >
        <button 
          className={cn(
            "hidden md:flex p-1 rounded-md transition-colors mt-1 md:mt-0",
            expanded ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0 space-y-2 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="flex items-center gap-3 justify-between md:justify-start">
             <StatusBadge status={tx.status} />
             <span className="text-xs text-zinc-500 md:hidden">{tx.timestamp}</span>
          </div>
         
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-zinc-200 leading-snug">{tx.description}</h3>
            <div className="flex items-center gap-3 mt-1.5 md:mt-1 text-xs text-zinc-500">
              <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">{tx.id}</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{tx.timestamp}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {tx.files.length} files
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {tx.status === 'PENDING' && (
            <button onClick={handleApprove} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </button>
          )}
          {tx.status === 'FAILED' && (
             <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
              <RefreshCw className="w-3.5 h-3.5" />
              Repair
            </button>
          )}
          <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800/50 relative z-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[400px]">
              
              {/* Left Sidebar: File Explorer & Meta */}
              <div className="bg-zinc-900/30 border-r border-zinc-800/50 p-3 flex flex-col gap-4">
                
                {/* Mode Switcher */}
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button 
                    onClick={() => setActiveTab('diff')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                      activeTab === 'diff' 
                        ? "bg-zinc-800 text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <FileDiff className="w-3.5 h-3.5" />
                    Diffs
                  </button>
                  <button 
                    onClick={() => setActiveTab('reasoning')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                      activeTab === 'reasoning' 
                        ? "bg-zinc-800 text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Logic
                  </button>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">Files ({tx.files.length})</div>
                  <div className="space-y-0.5">
                    {tx.files.map((file, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedFileIndex(i); setActiveTab('diff'); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-left transition-colors border border-transparent",
                          selectedFileIndex === i && activeTab === 'diff'
                            ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" 
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        )}
                      >
                        <FileCode className={cn(
                          "w-3.5 h-3.5 flex-shrink-0",
                          selectedFileIndex === i && activeTab === 'diff' ? "text-indigo-400" : "text-zinc-600"
                        )} />
                        <span className="truncate font-mono">{file.path.split('/').pop()}</span>
                        {file.status === 'modified' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500/50" />}
                        {file.status === 'created' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500/50" />}
                        {file.status === 'deleted' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500/50" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Meta Info */}
                <div className="pt-3 border-t border-zinc-800/50 space-y-2">
                   <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">Usage</div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-900 border border-zinc-800 rounded p-2">
                        <div className="text-[10px] text-zinc-500">Tokens</div>
                        <div className="text-xs font-mono text-zinc-300">{tx.tokens}</div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded p-2">
                        <div className="text-[10px] text-zinc-500">Cost</div>
                        <div className="text-xs font-mono text-zinc-300">{tx.cost}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 px-1 pt-1">
                      <Terminal className="w-3 h-3" />
                      {tx.model}
                   </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="bg-zinc-950 flex flex-col overflow-hidden min-h-[400px]">
                
                {/* Content Header */}
                <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/20">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400">
                        {activeTab === 'diff' ? selectedFile.path : 'AI Reasoning Strategy'}
                      </span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300">
                        <Code2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                   {activeTab === 'diff' ? (
                     <DiffViewer 
                        diff={selectedFile.diff} 
                        language={selectedFile.language} 
                        className="p-0"
                     />
                   ) : (
                     <div className="p-6">
                        <div className="prose prose-invert prose-sm max-w-none">
                           <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                 <Zap className="w-5 h-5 text-amber-500" />
                              </div>
                              <div className="space-y-4">
                                 <p className="text-zinc-300 leading-relaxed text-sm">{tx.reasoning}</p>
                                 <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                                    <h5 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Change Strategy</h5>
                                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                       <li>Analyze dependencies and imports</li>
                                       <li>Apply changes using unified diff format</li>
                                       <li>Verify syntax integrity post-patch</li>
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
````

## File: src/pages/dashboard.page.tsx
````typescript
import { useEffect } from 'react';
import { Play, Pause, Activity, RefreshCw, Filter, Terminal, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { TransactionCard } from "@/features/transactions/components/transaction-card.component";

export const Dashboard = () => {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const isWatching = useStore((state) => state.isWatching);
  const toggleWatching = useStore((state) => state.toggleWatching);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-32">
      
      {/* Hero Status Bar - Compact if active, large if empty */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          layout
          className={cn(
            "relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl group transition-all duration-500",
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
        </motion.div>

        {/* Stats Card - Only visible when we have data to show context */}
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
      <div className="space-y-4">
        {hasTransactions && (
          <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -my-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 flex items-center justify-between border-b border-zinc-800/50 md:border-none px-1 md:px-0">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-zinc-500" />
              <h3 className="text-lg font-semibold text-white">Event Log</h3>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">{transactions.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <div className="h-4 w-px bg-zinc-800" />
              <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2 md:pt-0 min-h-[300px]">
          <AnimatePresence mode='popLayout'>
            {hasTransactions ? (
              transactions.map((tx) => (
                <TransactionCard 
                  key={tx.id} 
                  tx={tx} 
                />
              ))
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
````

## File: src/services/api.service.ts
````typescript
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
````

## File: src/store/slices/transaction.slice.ts
````typescript
import { StateCreator } from 'zustand';
import { Transaction } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
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
      set({ transactions: data });
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
````

## File: src/styles/main.style.css
````css
@import "tailwindcss";

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

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Animations */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.1; }
}

.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
````

## File: src/types/app.types.ts
````typescript
export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export interface TransactionFile {
  path: string;
  status: 'modified' | 'created' | 'deleted' | 'renamed';
  language: string;
  diff: string;
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  files: TransactionFile[];
  reasoning: string;
  provider: string;
  model: string;
  cost: string;
  tokens: string;
}

export type AppTab = 'dashboard' | 'history' | 'settings';
````

## File: src/main.tsx
````typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.style.css";
import { App } from "./app.component";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
````

## File: index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Relay | AI Patch Stream</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: vite.config.ts
````typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
````

## File: package.json
````json
{
  "name": "relay",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "framer-motion": "^12.34.0",
    "lucide-react": "^0.563.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
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
````
