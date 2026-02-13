import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionFile, FILE_STATUS_CONFIG } from "@/types/app.types";
import { DiffViewer } from "@/components/ui/diff-viewer.ui.tsx";
import { getDiffStats } from "@/utils/diff.util";
import { DiffStat } from "@/components/ui/diff-stat.ui";

export const FileSection = memo(({ file, isApplying }: { file: TransactionFile; isApplying?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localStatus, setLocalStatus] = useState<'idle' | 'applying' | 'completed'>('idle');
  const [elapsed, setElapsed] = useState(0);
  
  const stats = useMemo(() => getDiffStats(file.diff), [file.diff]);
  const workDuration = useMemo(() => 600 + Math.random() * 1400, []); // Randomized simulated work time per file

  useEffect(() => {
    if (!isApplying) {
      setLocalStatus('idle');
      setElapsed(0);
      return;
    }

    setLocalStatus('applying');
    const startTime = performance.now();
    
    const timer = setInterval(() => {
      const now = performance.now();
      const diff = now - startTime;
      
      setElapsed(Math.min(diff, workDuration));

      if (diff >= workDuration) {
        setLocalStatus('completed');
        clearInterval(timer);
      }
    }, 30); // Higher frequency for smoother 0.1s updates

    return () => clearInterval(timer);
  }, [isApplying, workDuration]); // Removed localStatus from dependencies to prevent reset loop

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="relative mb-10 group/file">
      <div 
        className={cn(
          "sticky top-36 z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300 cursor-pointer select-none overflow-hidden",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
        onClick={toggleExpanded}
      >
        {/* Progress Bar Overlay */}
        {localStatus === 'applying' && (
          <div 
            className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-75 ease-linear" 
            style={{ width: `${(elapsed / workDuration) * 100}%` }} 
          />
        )}

        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300", 
            localStatus === 'applying' ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" :
            localStatus === 'completed' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
            FILE_STATUS_CONFIG[file.status].color
          )} />
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 min-w-0">
            <span className="text-xs font-mono text-zinc-300 truncate">{file.path}</span>
            <div className="flex items-center gap-2">
              <DiffStat 
                adds={stats.adds} 
                subs={stats.subs} 
                className="hidden sm:flex text-[10px] opacity-60" 
              />
              {(localStatus !== 'idle' || elapsed > 0) && (
                <span className={cn(
                  "text-[10px] font-mono transition-colors",
                  localStatus === 'completed' ? "text-emerald-500/80" : "text-indigo-400"
                )}>
                  ({(elapsed / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4" onClick={stopPropagation}>
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
            className="relative z-0 overflow-hidden border-x border-b border-zinc-800/60 rounded-b-xl bg-zinc-950"
          >
            <DiffViewer 
              diff={file.diff} 
              language={file.language} 
              className="min-h-0" 
              isApplying={localStatus === 'applying'} 
            />
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