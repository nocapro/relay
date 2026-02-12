import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionFile } from "@/types/app.types";
import { DiffViewer } from "@/components/ui/diff-viewer.ui.tsx";
import { getDiffStats } from "@/utils/diff.util";

export const MetaItem = memo(({ icon: Icon, label, value, color }: any) => (
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

export const FileSection = memo(({ file }: { file: TransactionFile }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const stats = useMemo(() => getDiffStats(file.diff), [file.diff]);

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="relative mb-10 group/file">
      <div 
        className={cn(
          "sticky top-36 z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300 cursor-pointer select-none",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
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