import { useState, useEffect } from 'react';
import { 
  Terminal, 
  GitBranch, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  FileCode,
  Copy,
  RefreshCw,
  Search,
  Command,
  GitCommit,
  RotateCcw,
  Maximize2,
  Zap,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  files: string[];
  reasoning: string;
  provider: string;
  model: string;
  cost: string;
  tokens: string;
}

// --- Mock Data ---
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

// --- Components ---

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const styles = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20 ring-amber-500/10',
    APPLIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ring-emerald-500/10',
    COMMITTED: 'bg-blue-500/10 text-blue-500 border-blue-500/20 ring-blue-500/10',
    REVERTED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 ring-zinc-500/10',
    FAILED: 'bg-red-500/10 text-red-500 border-red-500/20 ring-red-500/10',
  };

  const icons = {
    PENDING: Clock,
    APPLIED: CheckCircle2,
    COMMITTED: GitCommit,
    REVERTED: RotateCcw,
    FAILED: XCircle,
  };

  const Icon = icons[status];

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium border ring-1", styles[status])}>
      <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
      <span>{status}</span>
    </div>
  );
};

const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
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

const Navigation = ({ activeTab, setActiveTab, isMobile }: { activeTab: string, setActiveTab: (t: string) => void, isMobile: boolean }) => {
  const items = [
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

const Header = ({ onOpenCommand, isMobile }: { onOpenCommand: () => void, isMobile: boolean }) => {
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
          onClick={onOpenCommand}
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

const TransactionCard = ({ tx, expanded, onToggle }: { tx: Transaction, expanded: boolean, onToggle: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "group border rounded-xl transition-all duration-300 overflow-hidden relative",
        expanded 
          ? "bg-zinc-900/80 border-indigo-500/30 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-500/20 z-10" 
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
              <span className="font-mono bg-zinc-950/50 px-1 rounded border border-zinc-800/50">{tx.id}</span>
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
            <>
               <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
            </>
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
            className="border-t border-zinc-800/50 bg-zinc-950/30 relative z-10"
          >
            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Reasoning Column */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" />
                    AI Reasoning
                  </h4>
                  <div className="bg-zinc-900/50 rounded-lg p-4 text-sm text-zinc-300 leading-relaxed border border-zinc-800/50 font-mono shadow-inner">
                    {tx.reasoning}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileCode className="w-3 h-3 text-indigo-500" />
                    Changed Files
                  </h4>
                  <div className="space-y-2">
                    {tx.files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/50 group/file hover:border-zinc-700 hover:bg-zinc-900/60 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                            <FileCode className="w-4 h-4 text-zinc-600 group-hover/file:text-zinc-400" />
                            <span className="text-sm text-zinc-400 group-hover/file:text-zinc-200 font-mono transition-colors">{file}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover/file:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta Column */}
              <div className="space-y-4">
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50 space-y-4">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-md">
                        <div className="text-[10px] text-zinc-500 mb-1">Tokens</div>
                        <div className="text-sm font-mono text-zinc-200">{tx.tokens}</div>
                     </div>
                     <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-md">
                        <div className="text-[10px] text-zinc-500 mb-1">Cost</div>
                        <div className="text-sm font-mono text-zinc-200">{tx.cost}</div>
                     </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Provider</span>
                      <span className="text-zinc-300 flex items-center gap-2">
                        {tx.provider === 'Anthropic' && <div className="w-2 h-2 bg-orange-500 rounded-full"/>}
                        {tx.provider === 'OpenAI' && <div className="w-2 h-2 bg-green-500 rounded-full"/>}
                        {tx.provider === 'OpenRouter' && <div className="w-2 h-2 bg-blue-500 rounded-full"/>}
                        {tx.provider}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Model</span>
                      <span className="text-zinc-300 font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{tx.model}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {tx.status === 'PENDING' && (
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 hover:border-emerald-500/30 text-xs font-medium transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve Changes
                        </button>
                    )}
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700">
                      <Copy className="w-3.5 h-3.5" />
                      Copy Transaction ID
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700">
                      <Command className="w-3.5 h-3.5" />
                      View Raw Diff
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Dashboard = () => {
  const [isWatching, setIsWatching] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>('tx-8f92a1');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32">
      
      {/* Hero Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl group">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
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
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                {isWatching ? 'Listening for patches...' : 'Monitoring paused'}
              </h1>
              <p className="text-zinc-500 text-sm md:text-base max-w-md leading-relaxed">
                {isWatching 
                  ? 'Relaycode is actively monitoring your clipboard. Copy any AI-generated code block to instantly create a transaction.' 
                  : 'Resume monitoring to detect new patches. Your pending transactions remain safe.'}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setIsWatching(!isWatching)}
                className={cn(
                  "px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all transform active:scale-95",
                  isWatching 
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/50"
                )}
              >
                {isWatching ? (
                  <><Pause className="w-4 h-4 fill-current" /> Pause</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Resume</>
                )}
              </button>
              
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Last checked 2s ago</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-75" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
        </div>

        {/* Stats Card */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between space-y-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 font-medium">Session Metrics</span>
            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1">
               <Activity className="w-3 h-3" /> 94% Success
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-2xl font-bold text-white mb-1">12</div>
              <div className="text-xs text-zinc-500 font-medium">Patches Applied</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-2xl font-bold text-zinc-400 mb-1">1.4s</div>
              <div className="text-xs text-zinc-500 font-medium">Avg. Latency</div>
            </div>
          </div>
          
          <div className="space-y-2">
             <div className="flex justify-between text-xs text-zinc-500">
                <span>Daily Quota</span>
                <span>75% used</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "75%" }}
                   className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                />
             </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -my-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 flex items-center justify-between border-b border-zinc-800/50 md:border-none px-1 md:px-0">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Event Stream
             </h3>
             <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">LIVE</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg">
               <Filter className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2">
               <button className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                 Clear
               </button>
               <div className="h-4 w-px bg-zinc-800" />
               <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Refresh
               </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 md:pt-0">
          {MOCK_TRANSACTIONS.map((tx) => (
            <TransactionCard 
              key={tx.id} 
              tx={tx} 
              expanded={expandedId === tx.id} 
              onToggle={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

// --- Placeholder Views ---
const PlaceholderView = ({ title, icon: Icon }: { title: string, icon: any }) => (
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

// --- Main App Component ---

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />
      
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isMobile ? "pb-20" : "pl-64")}>
        <Header onOpenCommand={() => setCmdOpen(true)} isMobile={isMobile} />
        
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

          {/* Floating Action Bar (Contextual) */}
          <AnimatePresence>
            {activeTab === 'dashboard' && (
              <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center justify-between px-3 md:px-4 ring-1 ring-white/10"
                >
                    <div className="hidden md:flex items-center gap-2 pr-4 border-r border-zinc-700/50">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-semibold text-zinc-300">1 Pending</span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                       <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                        <span className="hidden md:inline ml-1 text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">A</span>
                      </button>
                      
                      <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2">
                        <GitCommit className="w-4 h-4" />
                        Commit
                        <span className="hidden md:inline ml-1 text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">C</span>
                      </button>
                    </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
