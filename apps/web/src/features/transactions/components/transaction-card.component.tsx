import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  Terminal,
  Cpu,
  Coins,
  History,
  ExternalLink,
  ListTree,
  FileCode,
  Layers,
  Check,
  EyeOff,
  Eye,
  ChevronsDownUp,
  ChevronsUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { TransactionStatus, TransactionBlock, TransactionFile, STATUS_CONFIG, FILE_STATUS_CONFIG } from "@/types/app.types";
import { StatusBadge } from "@/components/ui/status-badge.ui";
import { useStore } from "@/store/root.store";
import { calculateTotalStats } from "@/utils/diff.util";
import { DiffStat } from "@/components/ui/diff-stat.ui";
import { FileSection } from "./file-section.component";
import { Metric } from "@/components/ui/metric.ui";
import { useScrollSpy } from "@/hooks/scroll-spy.hook";

interface TransactionCardProps {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  provider: string;
  model: string;
  tokens: string;
  cost: string;
  blocks?: TransactionBlock[];
  files?: TransactionFile[];
  isNew?: boolean;
  depth?: number;
  parentId?: string | null;
}

// Helper to get file info with original block index
interface FileInfo {
  file: TransactionFile | null | undefined;
  blockIndex: number;
  fileIndex: number;
}

export const TransactionCard = memo(({
  id,
  status,
  description,
  timestamp,
  provider,
  model,
  tokens,
  cost,
  blocks,
  files: filesProp,
  isNew = false,
  depth = 0,
  parentId
}: TransactionCardProps) => {
  const expandedId = useStore((state) => state.expandedId);
  const setExpandedId = useStore((state) => state.setExpandedId);
  const hoveredChainId = useStore((state) => state.hoveredChainId);
  const setHoveredChain = useStore((state) => state.setHoveredChain);
  const applyTransactionChanges = useStore((state) => state.applyTransactionChanges);
  
  const selectedIds = useStore((state) => state.selectedIds);
  const toggleSelection = useStore((state) => state.toggleSelection);
  const isSelected = selectedIds.includes(id);

  const expanded = expandedId === id;

  const [totalTime, setTotalTime] = useState<number>(0);
  const [hideReasoning, setHideReasoning] = useState(false);
  const [allCodeblocksCollapsed, setAllCodeblocksCollapsed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'APPLYING') {
      const startTime = Date.now();
      timer = setInterval(() => {
        setTotalTime(Date.now() - startTime);
      }, 50);
    } else if (status === 'PENDING') {
      setTotalTime(0);
    }
    return () => clearInterval(timer);
  }, [status]);
  
  // Build file info list with correct block indices for navigation
  const fileInfos: FileInfo[] = useMemo(() => {
    if (blocks && blocks.length > 0) {
      const infos: FileInfo[] = [];
      let fileCount = 0;
      blocks.forEach((block, blockIdx) => {
        if (block.type === 'file') {
          infos.push({
            file: block.file,
            blockIndex: blockIdx,
            fileIndex: fileCount++
          });
        }
      });
      return infos;
    }
    // Fallback to files prop
    return (filesProp || []).map((file, idx) => ({
      file,
      blockIndex: idx,
      fileIndex: idx
    }));
  }, [blocks, filesProp]);

  const hasFiles = fileInfos.length > 0;
  
  // Track active section in view
  const fileBlockRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const outlineRef = useRef<HTMLDivElement>(null);
  const { activeFileIndex, scrollToBlock } = useScrollSpy(fileBlockRefs, expanded, fileInfos.length);
  
  const onToggle = useCallback(() => setExpandedId(expanded ? null : id), [expanded, setExpandedId, id]);

  const handleApprove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    applyTransactionChanges(id);
  }, [id, applyTransactionChanges]);

  const handleSelect = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    toggleSelection(id);
  }, [id, toggleSelection]);

  // Long Press Logic for Mobile
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      handleSelect();
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  }, [handleSelect]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const stats = useMemo(() => calculateTotalStats(fileInfos.map(i => i.file).filter((f): f is NonNullable<typeof f> => f != null)), [fileInfos]);

  const isChainHovered = useMemo(() => {
    if (!hoveredChainId) return false;
    // Highlight if this is the hovered item or a direct relative in the same thread
    return hoveredChainId === id || hoveredChainId === parentId || (parentId && parentId === hoveredChainId);
  }, [hoveredChainId, id, parentId]);

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHoveredChain(parentId || id)}
      onMouseLeave={() => setHoveredChain(null)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      data-expanded={expanded}
      className={cn(
        "transaction-card rounded-2xl border transition-all duration-300 relative isolate group select-none md:select-auto touch-manipulation",
        STATUS_CONFIG[status].border,
        expanded
          ? "bg-zinc-900/80 z-10 my-12 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-500/20"
          : "bg-zinc-900/40 hover:bg-zinc-900/60 shadow-sm",
        isChainHovered && "chain-highlight ring-1 ring-indigo-500/40",
        status === 'APPLYING' && "ring-2 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]",
        isSelected && "ring-2 ring-indigo-500 bg-indigo-500/5"
      )}
    >
      {/* Centered Thread Connector */}
      {parentId && depth > 0 && (
        <div className="thread-connector-v" />
      )}
      {expanded && <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />}
      
      {/* STICKY HEADER: Integrated Controls */}
      <div
        onClick={onToggle}
        className={cn(
          "z-20 transition-all duration-300 cursor-pointer select-none",
          expanded
            ? "sticky top-16 bg-zinc-900 rounded-t-2xl backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-6 py-4"
            : "p-3 md:p-4"
        )}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-start md:items-center gap-2 md:gap-4">
          {/* Selection Checkbox & Collapse Icon */}
          <div className="flex items-center">
             {/* Desktop Checkbox: Width animates from 0 to 5 on hover/select */}
             <button
                onClick={handleSelect}
                className={cn(
                  "hidden md:flex items-center justify-center h-5 rounded-md border transition-all duration-300 ease-out mt-1 md:mt-0 overflow-hidden",
                  isSelected 
                    ? "w-5 mr-3 bg-indigo-500 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] opacity-100" 
                    : "w-0 mr-0 border-0 p-0 text-transparent opacity-0 group-hover:w-5 group-hover:mr-3 group-hover:opacity-100 group-hover:border group-hover:border-zinc-700"
                )}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            <div className={cn(
              "p-1 rounded-md transition-colors mt-1 md:mt-0",
              expanded ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600"
            )}>
              <ChevronDown className={cn("w-4 h-4 transition-transform", expanded ? "rotate-0" : "-rotate-90")} />
            </div>
          </div>

          {/* Core Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={status} />
              {parentId && (
                <div className="md:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                  <Layers className="w-2.5 h-2.5" /> Follow-up
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-sm font-semibold truncate",
                  expanded ? "text-white" : "text-zinc-300"
                )}>
                  {description.length > 60 ? `${description.substring(0, 60)}...` : description}
                </h3>
                {parentId && (
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                    <Layers className="w-2.5 h-2.5" /> Follow-up
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-1">
                  <History className="w-3 h-3" /> {timestamp}
                </div>
                <span className="text-zinc-800">•</span>
                <span className="text-zinc-600">ID: {id.split('-').pop()}</span>
                
                {hasFiles && (
                  <>
                    <span className="hidden sm:inline text-zinc-800">•</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <FileCode className="w-3 h-3" />
                        {stats.files}
                      </span>
                      <DiffStat adds={stats.adds} subs={stats.subs} className="flex" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {status === 'APPLYING' && (
              <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-mono text-indigo-400 animate-pulse">
                {(totalTime / 1000).toFixed(1)}s
              </div>
            )}
            {status === 'PENDING' && (
              <button
                onClick={handleApprove}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Apply</span>
              </button>
            )}
            <button
              onClick={() => setHideReasoning(!hideReasoning)}
              className={cn(
                "p-2 transition-colors",
                hideReasoning ? "text-amber-500" : "text-zinc-600 hover:text-white"
              )}
              title={hideReasoning ? "Show reasoning" : "Hide reasoning"}
            >
              {hideReasoning ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setAllCodeblocksCollapsed(!allCodeblocksCollapsed)}
              className={cn(
                "p-2 transition-colors",
                allCodeblocksCollapsed ? "text-indigo-400" : "text-zinc-600 hover:text-white"
              )}
              title={allCodeblocksCollapsed ? "Expand all codeblocks" : "Collapse all codeblocks"}
            >
              {allCodeblocksCollapsed ? <ChevronsUpDown className="w-4 h-4" /> : <ChevronsDownUp className="w-4 h-4" />}
            </button>
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
            className="px-px pb-px overflow-visible"
          >
            {/* Observability Strip */}
            <div className="flex items-center gap-6 px-8 py-3 bg-zinc-950 border-b border-zinc-900/50 overflow-x-auto scrollbar-hide">
               <Metric icon={Cpu} label="Engine" value={`${provider} / ${model}`} color="text-indigo-400" />
               <Metric icon={Terminal} label="Context" value={`${tokens} tokens`} color="text-emerald-400" />
               <Metric icon={Coins} label="Cost" value={cost} color="text-amber-400" />
               <div className="ml-auto hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <ExternalLink className="w-3 h-3" />
                  <span>Report v2.4</span>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 p-4 md:p-10 max-w-[1400px] mx-auto bg-zinc-950 rounded-b-xl">

              {/* QUICK JUMP SIDEBAR (Desktop) */}
              {hasFiles && (
                <div className="hidden lg:block w-64 shrink-0">
                  <div 
                    ref={outlineRef}
                    className="sticky top-36 space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-scrollbar-thin flex flex-col"
                  >
                    <div className="flex items-center gap-2 text-zinc-500 mb-2 shrink-0">
                      <ListTree className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Outline</span>
                      <span className="ml-auto text-[10px] text-zinc-600">
                        {fileInfos.length} files
                      </span>
                    </div>
                    <nav className="space-y-0.5 pb-4">
                      {fileInfos.filter((info): info is FileInfo & { file: NonNullable<typeof info.file> } => info.file != null).map((info) => {
                        const isActive = activeFileIndex === info.fileIndex;
                        return (
                          <button
                            key={info.blockIndex}
                            onClick={() => scrollToBlock(info.blockIndex, info.fileIndex)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-all truncate group flex items-center gap-2",
                              isActive 
                                ? cn("bg-zinc-800/80 border-l-2", 
                                     FILE_STATUS_CONFIG[info.file.status].color.replace('bg-', 'border-'), 
                                     FILE_STATUS_CONFIG[info.file.status].color.replace('bg-', 'text-'))
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-l-2 border-transparent"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                              isActive 
                                ? cn(FILE_STATUS_CONFIG[info.file.status].color, "shadow-[0_0_8px_currentColor]")
                                : "bg-zinc-700 group-hover:bg-zinc-500"
                            )} />
                            <span className="truncate">{info.file.path}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              )}

              {/* MAIN CONTENT STREAM */}
              <div className="flex-1 space-y-12 min-w-0">
                  {blocks && blocks.length > 0 ? (
                    // Render blocks with interleaved markdown and files
                    blocks.map((block, blockIdx) => {
                      if (block.type === 'markdown') {
                        if (hideReasoning) return null;
                        return (
                          <div key={blockIdx} className="prose prose-zinc prose-invert prose-sm max-w-none px-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {block.content}
                            </ReactMarkdown>
                          </div>
                        );
                      }
                      // Find the file index for this block
                      const fileInfo = fileInfos.find(f => f.blockIndex === blockIdx);
                      const fileIndex = fileInfo?.fileIndex ?? 0;
                      if (!block.file) return null;
                      return (
                        <div 
                          key={blockIdx}
                          ref={(el) => {
                            if (el) fileBlockRefs.current.set(blockIdx, el);
                          }}
                          data-file-index={fileIndex}
                        >
                          <FileSection file={block.file} isApplying={status === 'APPLYING'} forceCollapsed={allCodeblocksCollapsed} />
                        </div>
                      );
                    })
                  ) : (fileInfos.length > 0 ? (
                    // Fallback: render files only (no markdown blocks)
                    fileInfos.filter((info): info is FileInfo & { file: NonNullable<typeof info.file> } => info.file != null).map((info) => (
                      <div 
                        key={info.blockIndex}
                        ref={(el) => {
                          if (el) fileBlockRefs.current.set(info.blockIndex, el);
                        }}
                        data-file-index={info.fileIndex}
                      >
                        <FileSection file={info.file} isApplying={status === 'APPLYING'} forceCollapsed={allCodeblocksCollapsed} />
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 text-center py-8">
                      No files to display
                    </div>
                  ))}


              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

