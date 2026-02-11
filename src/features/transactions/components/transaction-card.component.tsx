import { 
  CheckCircle2, 
  RefreshCw, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Zap, 
  Maximize2, 
  Copy, 
  Command 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { Transaction } from "@/types/app.types";
import { StatusBadge } from "@/components/ui/status-badge.ui";
import { useStore } from "@/store/root.store";

export const TransactionCard = ({ tx }: { tx: Transaction }) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const expanded = expandedId === tx.id;

  const onToggle = () => setExpandedId(expanded ? null : tx.id);

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