import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, RotateCcw } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionFile, FILE_STATUS_CONFIG, FileApplyStatus } from "@/types/app.types";
import { DiffViewer } from "@/components/ui/diff-viewer.ui.tsx";
import { getDiffStats } from "@/utils/diff.util";
import { DiffStat } from "@/components/ui/diff-stat.ui";

interface FileSectionProps {
  file: TransactionFile;
  isApplying?: boolean;
  forceCollapsed?: boolean;
  transactionId?: string;
  onReapplyFile?: (filePath: string) => void;
}

export const FileSection = memo(({ file, isApplying, forceCollapsed, transactionId, onReapplyFile }: FileSectionProps) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  
  const isExpanded = forceCollapsed !== undefined ? !forceCollapsed : internalExpanded;

  const toggleExpanded = useCallback(() => {
    if (forceCollapsed !== undefined) return;
    setInternalExpanded(prev => !prev);
  }, [forceCollapsed]);
  
  const stats = useMemo(() => getDiffStats(file.diff), [file.diff]);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleReapply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onReapplyFile?.(file.path);
  }, [file.path, onReapplyFile]);

  const applyStatus = file.applyStatus as FileApplyStatus | undefined;
  const isFileApplying = applyStatus === 'APPLYING';
  const isFileFailed = applyStatus === 'FAILED';
  const showReapplyButton = isFileFailed && transactionId && onReapplyFile;

  return (
    <div className="relative mb-10 group/file">
      <div 
        className={cn(
          "sticky top-36 z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300 cursor-pointer select-none overflow-hidden",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
        onClick={toggleExpanded}
      >
        {/* Progress Bar Overlay - now controlled purely by backend status */}
        {(isApplying || isFileApplying) && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500/30">
            <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
          </div>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300", 
            isFileApplying ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" :
            isFileFailed ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" :
            isApplying ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" :
            FILE_STATUS_CONFIG[file.status].color
          )} />
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 min-w-0">
            <span className={cn(
              "text-xs font-mono truncate",
              isFileFailed ? "text-red-400" : "text-zinc-300"
            )}>{file.path}</span>
            <div className="flex items-center gap-2">
              <DiffStat 
                adds={stats.adds} 
                subs={stats.subs} 
                className="hidden sm:flex text-[10px] opacity-60" 
              />
              {isFileFailed && file.errorMessage && (
                <span className="text-[10px] text-red-400/80 truncate max-w-[200px]" title={file.errorMessage}>
                  {file.errorMessage}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4" onClick={stopPropagation}>
          {showReapplyButton && (
            <button 
              onClick={handleReapply}
              className="p-1.5 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-all"
              title="Reapply this file"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
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
              isApplying={isApplying} 
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
});