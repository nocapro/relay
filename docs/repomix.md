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
        transactions/
          components/
            action-bar.component.tsx
            transaction-card.component.tsx
      services/
        api.service.ts
      store/
        slices/
          transaction.slice.ts
        root.store.ts
      styles/
        main.style.css
      types/
        app.types.ts
      utils/
        cn.util.ts
```

# Files

## File: apps/web/src/features/transactions/components/action-bar.component.tsx
```typescript
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";

export const FloatingActionBar = () => {
  const transactions = useStore((state) => state.transactions);
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;
  const isApplyingAny = transactions.some(t => t.status === 'APPLYING');
  const showBar = pendingCount > 0 || appliedCount > 0 || isApplyingAny;
  
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  // Mobile-only: hide on scroll, show on stop
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide immediately when scrolling (either direction)
      if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
        setIsVisible(false);
      }
      
      lastScrollY.current = currentScrollY;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Show after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isMobile]);

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: isVisible ? 0 : 100, 
              opacity: isVisible ? 1 : 0 
            }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center px-3 md:px-4 ring-1 ring-white/10"
          >
            <div className="hidden md:flex items-center gap-2 border-r border-zinc-700/50 pr-4 mr-auto">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">{pendingCount} Pending</span>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
              <button 
                disabled={isApplyingAny}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2",
                  isApplyingAny && "opacity-50 cursor-not-allowed"
                )}
              >
                <CheckCircle2 className={cn("w-4 h-4", isApplyingAny && "animate-spin")} />
                {isApplyingAny ? 'Applying...' : 'Approve'}
              </button>
              
              <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2">
                <GitCommit className="w-4 h-4" />
                Commit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
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
  Layers
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
      data-expanded={expanded}
      className={cn(
        "transaction-card rounded-2xl border transition-all duration-300 relative isolate",
        STATUS_CONFIG[status].border,
        expanded
          ? "bg-zinc-900/80 z-10 my-12 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-500/20"
          : "bg-zinc-900/40 hover:bg-zinc-900/60 shadow-sm",
        isChainHovered && "chain-highlight ring-1 ring-indigo-500/40",
        status === 'APPLYING' && "ring-2 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
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
        <div className="grid grid-cols-[auto_1fr_auto] items-start md:items-center gap-3 md:gap-4">
          {/* Collapse Icon */}
          <div className={cn(
            "p-1 rounded-md transition-colors mt-1 md:mt-0",
            expanded ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-600"
          )}>
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded ? "rotate-0" : "-rotate-90")} />
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

## File: apps/web/src/styles/main.style.css
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@layer utilities {
  /* Shimmer/Shine effect for selected cards */
  .shimmer {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.03),
      transparent
    );
    animation: shimmer 3s infinite;
    pointer-events: none;
    z-index: 1;
  }
  
  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }


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

  /* Hide scrollbar but keep scroll functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Hierarchical Vertical Connectors - The "Backbone" */
  .thread-connector-v {
    position: absolute;
    left: 50%;
    width: 2px;
    background: linear-gradient(to bottom, var(--color-zinc-800), var(--color-zinc-700));
    transform: translateX(-50%);
    z-index: -1;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Default gap: matches parent space-y-6 (1.5rem / 24px) */
    top: -24px;
    height: 24px;
  }

  /* Stretching Logic: Adapts to expanded card margins (my-12 = 48px mt/mb) */
  
  /* 1. If the CURRENT card is expanded, it adds 48px top margin */
  .transaction-card[data-expanded="true"] > .thread-connector-v {
    top: -48px;
    height: 48px;
  }

  /* 2. If the PREVIOUS sibling is expanded, it adds 48px bottom margin. 
        Normal gap (24px) + Prev expansion (48px) = 72px total gap. */
  .transaction-card[data-expanded="true"] + .transaction-card > .thread-connector-v {
    top: -72px;
    height: 72px;
  }

  /* 3. Both are expanded: Prev mb-12 (48px) + Current mt-12 (48px) = 96px total gap. */
  .transaction-card[data-expanded="true"] + .transaction-card[data-expanded="true"] > .thread-connector-v {
    top: -96px;
    height: 96px;
  }

  .chain-highlight .thread-connector-v {
    background: var(--color-indigo-500);
    box-shadow: 0 0 15px var(--color-indigo-500);
    width: 3px;
    opacity: 1;
  }

  html {
    scroll-behavior: smooth;
    height: 100%;
  }

  body {
    min-height: 100%;
  }

  .prose p { margin-bottom: 1.5em; line-height: 1.75; }
  .prose strong { color: var(--color-white); font-weight: 600; }

  /* Writing State Animations */
  @keyframes writing-glow {
    0%, 100% { border-color: var(--color-zinc-800); box-shadow: 0 0 0 rgba(99, 102, 241, 0); }
    50% { border-color: var(--color-indigo-400); box-shadow: 0 0 30px rgba(99, 102, 241, 0.15); }
  }

  .writing-mode {
    animation: writing-glow 1.5s ease-in-out infinite;
    position: relative;
    z-index: 1;
  }

  .line-scan {
    position: relative;
    overflow: hidden;
  }

  .line-scan::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(99, 102, 241, 0.08) 45%, 
      rgba(99, 102, 241, 0.15) 50%, 
      rgba(99, 102, 241, 0.08) 55%, 
      transparent 100%
    );
    animation: scan 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes scan {
    0% { transform: translateX(-100%); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  .prose blockquote {
    border-left-color: var(--color-indigo-500);
    background: rgba(99, 102, 241, 0.05);
    padding: 1rem;
    border-radius: 0.5rem;
    font-style: normal;
  }
}

/* Typography & Prose Overrides */
.prose {
  --tw-prose-body: var(--color-zinc-300);
  --tw-prose-headings: var(--color-white);
  --tw-prose-links: var(--color-indigo-400);
  --tw-prose-bold: var(--color-zinc-100);
  --tw-prose-counters: var(--color-zinc-500);
  --tw-prose-bullets: var(--color-zinc-600);
  --tw-prose-hr: var(--color-zinc-800);
  --tw-prose-quotes: var(--color-zinc-200);
  --tw-prose-quote-borders: var(--color-zinc-700);
  --tw-prose-captions: var(--color-zinc-400);
  --tw-prose-code: var(--color-indigo-300);
  --tw-prose-pre-code: var(--color-zinc-200);
  --tw-prose-pre-bg: var(--color-zinc-900);
  --tw-prose-th-borders: var(--color-zinc-700);
  --tw-prose-td-borders: var(--color-zinc-800);
}

/* Custom Scrollbar Thin */
.custom-scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 10px;
}
.custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
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

## File: apps/web/src/store/root.store.ts
```typescript
import { create } from 'zustand';
import { createUiSlice, UiSlice } from './slices/ui.slice';
import { createTransactionSlice, TransactionSlice } from './slices/transaction.slice';
import { createPromptSlice, PromptSlice } from './slices/prompt.slice';

export type RootState = UiSlice & TransactionSlice & PromptSlice;

export const useStore = create<RootState>()((...a) => ({
  ...createUiSlice(...a),
  ...createTransactionSlice(...a),
  ...createPromptSlice(...a),
}));

// Export specialized selectors for cleaner global usage
export const useUiActions = () => useStore((state) => ({
  setCmdOpen: state.setCmdOpen,
  toggleCmd: state.toggleCmd,
}));

export const useTransactionActions = () => useStore((state) => ({
  setExpandedId: state.setExpandedId,
  setHoveredChain: state.setHoveredChain,
  init: state.init,
  fetchTransactions: state.fetchTransactions,
}));
```

## File: apps/web/src/types/app.types.ts
```typescript
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  GitCommit, 
  RotateCcw,
  PlusCircle,
  FileEdit,
  Trash2,
  RefreshCw,
  LucideIcon
} from 'lucide-react';
import type { 
  TransactionStatus, 
  TransactionFile, 
  PromptStatus, 
  Prompt, 
  TransactionBlock, 
  Transaction 
} from '@relaycode/api';

export type { 
  TransactionStatus, 
  TransactionFile, 
  PromptStatus, 
  Prompt, 
  TransactionBlock, 
  Transaction 
};

export const STATUS_CONFIG: Record<TransactionStatus, { 
  icon: LucideIcon; 
  color: string; 
  border: string; 
  animate?: boolean;
}> = {
  PENDING:   { icon: Loader2,      color: 'text-amber-500',   border: 'border-amber-500/20 bg-amber-500/5', animate: true },
  APPLYING:  { icon: RefreshCw,    color: 'text-indigo-400',  border: 'border-indigo-500/20 bg-indigo-500/10', animate: true },
  APPLIED:   { icon: CheckCircle2, color: 'text-emerald-500', border: 'border-emerald-500/20 bg-emerald-500/5' },
  COMMITTED: { icon: GitCommit,    color: 'text-blue-500',    border: 'border-blue-500/20 bg-blue-500/5' },
  REVERTED:  { icon: RotateCcw,    color: 'text-zinc-400',    border: 'border-zinc-500/20 bg-zinc-500/5' },
  FAILED:    { icon: XCircle,      color: 'text-red-500',     border: 'border-red-500/20 bg-red-500/5' },
};

export const FILE_STATUS_CONFIG = {
  created:  { color: 'bg-emerald-500', icon: PlusCircle, label: 'Added' },
  modified: { color: 'bg-amber-500',   icon: FileEdit,   label: 'Modified' },
  deleted:  { color: 'bg-red-500',     icon: Trash2,     label: 'Deleted' },
  renamed:  { color: 'bg-blue-500',    icon: RefreshCw,  label: 'Renamed' },
} as const;

// New: Grouping Strategies
export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';
```

## File: apps/api/src/routes/transactions.ts
```typescript
import { Elysia, t } from 'elysia';
import { db } from '../store';
import { Transaction, TransactionStatus } from '../models';

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

## File: apps/web/src/services/api.service.ts
```typescript
import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@relaycode/api';
import type { SimulationEvent } from '@relaycode/api';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(getBaseUrl());

// SSE Connection for real-time simulation updates
export const connectToSimulationStream = (
  onEvent: (event: SimulationEvent) => void,
  onConnectionChange?: (isConnected: boolean) => void,
  onError?: (error: Event, isNetworkError: boolean) => void
): (() => void) => {
  const baseUrl = getBaseUrl();
  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;
  let intentionalClose = false;

  const connect = () => {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`${baseUrl}/api/events`);
    
    eventSource.onopen = () => {
      reconnectAttempts = 0;
      onConnectionChange?.(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SimulationEvent = JSON.parse(event.data);
        onEvent(data);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (error) => {
      // Check if eventSource is closed (network error) or just no data (server timeout)
      const isNetworkError = eventSource?.readyState === EventSource.CLOSED;
      
      if (!intentionalClose) {
        onConnectionChange?.(false);
      }
      
      if (onError) onError(error, isNetworkError);
      
      // Attempt to reconnect with exponential backoff (only for network errors)
      if (isNetworkError && !intentionalClose && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
          connect();
        }, delay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    };
  };

  connect();

  // Return cleanup function
  return () => {
    intentionalClose = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
};

export { api };
```

## File: apps/web/src/store/slices/transaction.slice.ts
```typescript
import { StateCreator } from 'zustand';
import { Transaction } from '@/types/app.types';
import { api, connectToSimulationStream } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  page: number;
  expandedId: string | null;
  hoveredChainId: string | null;
  isConnected: boolean;
  setExpandedId: (id: string | null) => void;
  setHoveredChain: (id: string | null) => void;
  init: () => (() => void);
  fetchTransactions: (params?: { search?: string; status?: string }) => Promise<void>;
  searchTransactions: (query: string) => Promise<Transaction[]>;
  fetchNextPage: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  applyTransactionChanges: (id: string, scenario?: 'fast-success' | 'simulated-failure' | 'long-running') => Promise<void>;
  subscribeToUpdates: () => (() => void);
}

let unsubscribeFromStream: (() => void) | null = null;

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  isLoading: false,
  isFetchingNextPage: false,
  hasMore: true,
  page: 1,
  expandedId: null,
  hoveredChainId: null,
  isConnected: false,

  setExpandedId: (id) => set({ expandedId: id }),
  setHoveredChain: (id) => set({ hoveredChainId: id }),
  
  init: () => {
    // Initialize SSE connection on app load (idempotent)
    if (!unsubscribeFromStream) {
      const unsubscribe = get().subscribeToUpdates();
      unsubscribeFromStream = unsubscribe;
      
      // Also fetch initial data immediately
      get().fetchTransactions();
    }
    // Return cleanup function for root unmount
    return () => {
      if (unsubscribeFromStream) {
        unsubscribeFromStream();
        unsubscribeFromStream = null;
      }
    };
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  applyTransactionChanges: async (id, scenario) => {
    try {
      // Trigger backend simulation - rely exclusively on SSE to update local state
      // This prevents race conditions between PATCH response and SSE events
      const { error } = await api.api.transactions[id].status.patch({
        status: 'APPLYING',
        scenario
      });

      if (error) throw error;
      // State updates (APPLYING -> APPLIED/FAILED) will arrive via SSE stream
    } catch (err) {
      console.error('Failed to apply transaction', err);
    }
  },

  subscribeToUpdates: () => {
    // Connect to SSE and update transactions when backend pushes updates
    const unsubscribe = connectToSimulationStream(
      (event) => {
        // Merge incoming event data into existing transaction list
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === event.transactionId 
              ? { ...t, status: event.status }
              : t
          )
        }));
      },
      (isConnected) => {
        // Track connection state for UI feedback
        set({ isConnected });
      },
      (_error, isNetworkError) => {
        if (isNetworkError) {
          console.error('Network connection lost, attempting to reconnect...');
        } else {
          console.warn('SSE server timeout or error');
        }
      }
    );

    return unsubscribe;
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, page: 1, hasMore: true });
    try {
      const $query: Record<string, string> = {
        page: '1',
        limit: '15'
      };
      
      if (params?.search) $query.search = params.search;
      if (params?.status) $query.status = params.status;

      const { data, error } = await api.api.transactions.get({ $query });
      
      if (error) throw error;

      if (data) {
        set({ transactions: data, hasMore: data.length === 15 });
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    set({ isLoading: false });
  },

  searchTransactions: async (query: string) => {
    try {
      const { data, error } = await api.api.transactions.get({
        $query: { search: query, limit: '5' }
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to search transactions', error);
      return [];
    }
  },

  fetchNextPage: async () => {
    const { page, hasMore, isFetchingNextPage, transactions } = get();
    if (!hasMore || isFetchingNextPage) return;

    set({ isFetchingNextPage: true });
    try {
      const nextPage = page + 1;
      const { data, error } = await api.api.transactions.get({
        $query: { page: nextPage.toString(), limit: '15' }
      });
      
      if (error) throw error;

      if (data && data.length > 0) {
        set({ 
          transactions: [...transactions, ...data], 
          page: nextPage,
          hasMore: data.length === 15
        });
      } else {
        set({ hasMore: false });
      }
    } catch (error) {
      console.error('Failed to fetch next page', error);
    }
    set({ isFetchingNextPage: false });
  },
});
```
