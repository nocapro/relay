# Directory Structure
```
apps/
  api/
    src/
      routes/
        transactions.ts
      index.ts
      models.ts
      store.ts
  web/
    src/
      features/
        prompts/
          components/
            prompt-card.component.tsx
        transactions/
          components/
            file-section.component.tsx
            transaction-card.component.tsx
      hooks/
        mobile.hook.ts
      utils/
        cn.util.ts
```

# Files

## File: apps/web/src/features/prompts/components/prompt-card.component.tsx
```typescript
import { motion } from 'framer-motion';
import { Clock, GitBranch } from 'lucide-react';
import { Prompt, Transaction } from '@/types/app.types';

interface PromptCardProps {
  prompt: Prompt;
  transactions: Transaction[];
}

export const PromptCard = ({ prompt, transactions }: PromptCardProps) => {
  const transactionCount = transactions.filter(t => t.promptId === prompt.id).length;
  
  return (
    <motion.div
      layout
      layoutId={prompt.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {prompt.title}
        </h3>
      </div>
      
      <p className="text-xs text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
        {prompt.content}
      </p>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" title="Associated Transactions">
            <GitBranch className="w-3 h-3" />
            <span>{transactionCount}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Time Logged">
            <Clock className="w-3 h-3" />
            <span>{prompt.timestamp}</span>
          </div>
        </div>
        
        {transactionCount > 0 && (
          <div className="flex -space-x-1.5">
            {[...Array(Math.min(3, transactionCount))].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[6px] text-zinc-400">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

## File: apps/web/src/hooks/mobile.hook.ts
```typescript
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
```

## File: apps/web/src/utils/cn.util.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## File: apps/web/src/features/transactions/components/file-section.component.tsx
```typescript
import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionFile, FILE_STATUS_CONFIG } from "@/types/app.types";
import { DiffViewer } from "@/components/ui/diff-viewer.ui.tsx";
import { getDiffStats } from "@/utils/diff.util";
import { DiffStat } from "@/components/ui/diff-stat.ui";

export const FileSection = memo(({ file, isApplying }: { file: TransactionFile; isApplying?: boolean }) => {
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
          "sticky top-36 z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300 cursor-pointer select-none overflow-hidden",
          isExpanded ? "rounded-t-xl border-b-zinc-800/30" : "rounded-xl"
        )}
        onClick={toggleExpanded}
      >
        {/* Progress Bar Overlay - now controlled purely by backend status */}
        {isApplying && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500/30">
            <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
          </div>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300", 
            isApplying ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" :
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
              isApplying={isApplying} 
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
```

## File: apps/web/src/features/transactions/components/transaction-card.component.tsx
```typescript
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
  Check
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
  parentId?: string;
}

// Helper to get file info with original block index
interface FileInfo {
  file: TransactionFile;
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
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const fileBlockRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const outlineRef = useRef<HTMLDivElement>(null);
  
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

  const scrollToBlock = useCallback((blockIndex: number, fileIndex: number) => {
    const el = fileBlockRefs.current.get(blockIndex);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveFileIndex(fileIndex);
    }
  }, []);

  // IntersectionObserver to track which file is in view
  useEffect(() => {
    if (!expanded) return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fileIndex = parseInt(entry.target.getAttribute('data-file-index') || '0', 10);
          setActiveFileIndex(fileIndex);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    fileBlockRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [expanded, fileInfos.length]);

  const stats = useMemo(() => calculateTotalStats(fileInfos.map(i => i.file)), [fileInfos]);

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
                      {fileInfos.map((info) => {
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
                    return (
                      <div 
                        key={blockIdx}
                        ref={(el) => {
                          if (el) fileBlockRefs.current.set(blockIdx, el);
                        }}
                        data-file-index={fileIndex}
                      >
                        <FileSection file={block.file} isApplying={status === 'APPLYING'} />
                      </div>
                    );
                  })
                ) : (fileInfos.length > 0 ? (
                  // Fallback: render files only (no markdown blocks)
                  fileInfos.map((info) => (
                    <div 
                      key={info.blockIndex}
                      ref={(el) => {
                        if (el) fileBlockRefs.current.set(info.blockIndex, el);
                      }}
                      data-file-index={info.fileIndex}
                    >
                      <FileSection file={info.file} isApplying={status === 'APPLYING'} />
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
```

## File: apps/api/src/index.ts
```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { transactionsRoutes } from './routes/transactions';
import { promptsRoutes } from './routes/prompts';
import { eventsRoutes } from './routes/events';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || 'localhost';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Relaycode API Documentation',
        version: '1.0.0'
      }
    }
  }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .group('/api', (app) => 
    app
      .get('/version', () => ({ version: '1.2.4', environment: 'stable' }))
      .use(transactionsRoutes)
      .use(promptsRoutes)
      .use(eventsRoutes)
  )
  .listen({ port, hostname: host });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
export * from './models';
```

## File: apps/api/src/routes/transactions.ts
```typescript
import { Elysia, t } from 'elysia';
import { db } from '../store';
import { Transaction, TransactionStatus, BulkActionRequest, BulkActionResponse } from '../models';

export const transactionsRoutes = new Elysia({ prefix: '/transactions' })
  .get('/', ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    return db.getTransactions(limit, page, query.search, query.status);
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
      status: t.Optional(t.String())
    }),
    response: t.Array(Transaction)
  })
  .patch('/:id/status', async ({ params: { id }, body: { status, scenario } }) => {
    // If transitioning to APPLYING, start the background simulation instead of immediate update
    if (status === 'APPLYING') {
      // Trigger the async simulation with optional scenario (runs in background, returns immediately)
      db.startSimulation(id, scenario);
      
      // Return the transaction in its current state (now APPLYING)
      const tx = db.getTransactions(1, 1).find((t: any) => t.id === id);
      if (!tx) throw new Error('Transaction not found');
      return tx;
    }
    
    // For other status changes, update immediately
    const updated = db.updateTransactionStatus(id, status);
    if (!updated) throw new Error('Transaction not found');
    
    return updated;
  }, {
    body: t.Object({ 
      status: TransactionStatus,
      scenario: t.Optional(t.Union([
        t.Literal('fast-success'),
        t.Literal('simulated-failure'),
        t.Literal('long-running')
      ]))
    }),
    response: Transaction
  })
  .post('/bulk', ({ body: { ids, action } }) => {
    const updatedIds = db.updateTransactionStatusBulk(ids, action);
    return { success: true, updatedIds };
  }, {
    body: BulkActionRequest,
    response: BulkActionResponse
  });
```

## File: apps/api/src/models.ts
```typescript
import { t, type Static } from 'elysia';

export const TransactionStatus = t.Union([
  t.Literal('PENDING'),
  t.Literal('APPLYING'),
  t.Literal('APPLIED'),
  t.Literal('COMMITTED'),
  t.Literal('REVERTED'),
  t.Literal('FAILED')
]);
export type TransactionStatus = Static<typeof TransactionStatus>;

export const PromptStatus = t.Union([
  t.Literal('DRAFT'),
  t.Literal('ACTIVE'),
  t.Literal('COMPLETED'),
  t.Literal('ARCHIVED')
]);
export type PromptStatus = Static<typeof PromptStatus>;

export const FileStatus = t.Union([
  t.Literal('modified'),
  t.Literal('created'),
  t.Literal('deleted'),
  t.Literal('renamed')
]);
export type FileStatus = Static<typeof FileStatus>;

export const TransactionFile = t.Object({
  path: t.String(),
  status: FileStatus,
  language: t.String(),
  diff: t.String()
});
export type TransactionFile = Static<typeof TransactionFile>;

export const TransactionBlock = t.Union([
  t.Object({
    type: t.Literal('markdown'),
    content: t.String()
  }),
  t.Object({
    type: t.Literal('file'),
    file: TransactionFile
  })
]);
export type TransactionBlock = Static<typeof TransactionBlock>;

export const Transaction = t.Object({
  id: t.String(),
  status: TransactionStatus,
  description: t.String(),
  timestamp: t.String(),
  createdAt: t.String(),
  promptId: t.String(),
  parentId: t.Optional(t.String()),
  isChainRoot: t.Optional(t.Boolean()),
  author: t.String(),
  blocks: t.Array(TransactionBlock),
  files: t.Array(TransactionFile),
  provider: t.String(),
  model: t.String(),
  cost: t.String(),
  tokens: t.String(),
  reasoning: t.String()
});
export type Transaction = Static<typeof Transaction>;

export const BulkActionRequest = t.Object({
  ids: t.Array(t.String()),
  action: TransactionStatus
});
export type BulkActionRequest = Static<typeof BulkActionRequest>;

export const BulkActionResponse = t.Object({
  success: t.Boolean(),
  updatedIds: t.Array(t.String())
});
export type BulkActionResponse = Static<typeof BulkActionResponse>;

export const Prompt = t.Object({
  id: t.String(),
  title: t.String(),
  content: t.String(),
  timestamp: t.String(),
  status: PromptStatus
});
export type Prompt = Static<typeof Prompt>;

// SSE Event Types for Real-Time Simulation Updates
export const SimulationEvent = t.Object({
  transactionId: t.String(),
  status: TransactionStatus,
  timestamp: t.String(),
  progress: t.Optional(t.Number())
});
export type SimulationEvent = Static<typeof SimulationEvent>;

// Simulation Scenarios for testing different backend behaviors
// - fast-success: Quick completion (0.5-1s) for rapid testing
// - simulated-failure: Triggers FAILED status to test error handling
// - long-running: Extended duration (8-12s) to test loading states
export const SimulationScenario = t.Union([
  t.Literal('fast-success'),
  t.Literal('simulated-failure'),
  t.Literal('long-running')
]);
export type SimulationScenario = Static<typeof SimulationScenario>;
```

## File: apps/api/src/store.ts
```typescript
import mockData from './data/mock-data.json';
import type { Transaction, TransactionStatus } from './models';

type Subscriber = (transaction: Transaction) => void;

// Simple in-memory store wrapper around the JSON data
class Store {
  // Use a deep clone to allow mutations without polluting import
  private transactions: Transaction[] = JSON.parse(JSON.stringify(mockData.transactions));
  private prompts = JSON.parse(JSON.stringify(mockData.prompts));
  
  // State machine tracking
  private subscribers: Set<Subscriber> = new Set();
  private activeSimulations: Set<string> = new Set();

  getTransactions(limit = 15, page = 1, search?: string, status?: string) {
    let result = [...this.transactions];

    // Defensive check against stringified "undefined" from query params
    const activeStatus = (status && status !== 'undefined' && status !== 'null') ? status : null;
    const activeSearch = (search && search !== 'undefined' && search !== 'null') ? search.trim() : null;

    if (activeStatus) {
      result = result.filter((t: any) => t.status === activeStatus);
    }

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      result = result.filter((t: any) => 
        t.description.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        (t.blocks && t.blocks.some((b: any) => 
          (b.type === 'markdown' && b.content.toLowerCase().includes(q)) ||
          (b.type === 'file' && b.file.path.toLowerCase().includes(q))
        ))
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    return result.slice(start, end);
  }

  getPrompts() {
    return this.prompts;
  }

  updateTransactionStatus(id: string, status: TransactionStatus): Transaction | null {
    const tx = this.transactions.find((t: any) => t.id === id);
    if (tx) {
      tx.status = status;
      this.notify(tx);
      return tx;
    }
    return null;
  }

  updateTransactionStatusBulk(ids: string[], status: TransactionStatus): string[] {
    const updatedIds: string[] = [];
    this.transactions.forEach((tx: any) => {
      if (ids.includes(tx.id)) {
        tx.status = status;
        this.notify(tx);
        updatedIds.push(tx.id);
      }
    });
    return updatedIds;
  }

  // Subscription system for SSE/streaming updates
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(transaction: Transaction): void {
    this.subscribers.forEach(cb => {
      try {
        cb(transaction);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  // Simulation engine: triggers async state transition based on scenario
  async startSimulation(id: string, scenario?: 'fast-success' | 'simulated-failure' | 'long-running'): Promise<void> {
    // Prevent duplicate simulations for the same transaction
    if (this.activeSimulations.has(id)) {
      return;
    }

    const tx = this.transactions.find((t: any) => t.id === id);
    if (!tx || tx.status !== 'PENDING') {
      return;
    }

    this.activeSimulations.add(id);
    
    // Immediately transition to APPLYING
    tx.status = 'APPLYING';
    this.notify(tx);

    // Determine duration based on scenario
    let duration = 2000 + Math.random() * 4000; // Default 2-6 seconds
    if (scenario === 'fast-success') {
      duration = 500 + Math.random() * 500; // 0.5-1 seconds
    } else if (scenario === 'long-running') {
      duration = 8000 + Math.random() * 4000; // 8-12 seconds
    }

    await new Promise(resolve => setTimeout(resolve, duration));

    // Determine final status based on scenario
    if (scenario === 'simulated-failure') {
      tx.status = 'FAILED';
    } else {
      tx.status = 'APPLIED';
    }
    
    this.notify(tx);
    this.activeSimulations.delete(id);
  }
}

export const db = new Store();
```
