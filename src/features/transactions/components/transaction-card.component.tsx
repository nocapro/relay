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

interface TransactionCardProps {
  tx: Transaction;
  isNew?: boolean;
}

export const TransactionCard = ({ tx, isNew = false }: TransactionCardProps) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const approveTransaction = useStore((state) => state.approveTransaction);
  const expanded = expandedId === tx.id;
  
  const [activeTab, setActiveTab] = useState<'reasoning' | 'diff'>('diff');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const onToggle = () => setExpandedId(expanded ? null : tx.id);
  const selectedFile = tx.files[selectedFileIndex];
  const hasFiles = tx.files.length > 0;

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approveTransaction(tx.id);
  };

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      layout
      layoutId={tx.id}
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
                         {activeTab === 'diff' ? (selectedFile?.path || 'No files') : 'AI Reasoning Strategy'}
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
                      hasFiles && selectedFile ? (
                        <DiffViewer 
                           diff={selectedFile.diff} 
                           language={selectedFile.language} 
                           className="p-0"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                          No files available
                        </div>
                      )
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