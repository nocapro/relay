import { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // Track active section in view
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outlineRef = useRef<HTMLDivElement>(null);
  
  const onToggle = () => setExpandedId(expanded ? null : tx.id);

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approveTransaction(tx.id);
  };

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
        "rounded-2xl border transition-all duration-300 overflow-hidden relative",
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
            className="border-t border-zinc-800/50 bg-zinc-950/30 relative z-10"
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
              <div className="hidden lg:block w-64 shrink-0 self-start">
                <div 
                  ref={outlineRef}
                  className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] flex flex-col"
                >
                  <div className="flex items-center gap-2 text-zinc-500 mb-2 shrink-0">
                    <ListTree className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Outline</span>
                    <span className="ml-auto text-[10px] text-zinc-600">
                      {tx.blocks?.filter(b => b.type === 'file').length || 0} files
                    </span>
                  </div>
                  <nav className="space-y-0.5 overflow-y-auto custom-scrollbar-thin pr-2 -mr-2 pb-4">
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
  const [isExpanded, setIsExpanded] = useState(true);
  const stats = getDiffStats(file.diff);

  return (
    <div className="mb-10 group/file">
      <div 
        className={cn(
          "sticky top-[68px] z-30 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
      >
        <div 
          className="flex items-center gap-3 min-w-0 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
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
            onClick={() => setIsExpanded(!isExpanded)}
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
};