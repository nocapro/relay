import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit, Copy, RotateCcw, X, ArrowLeft, Settings2 } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";
import { generateGranularReport, ReportOptions } from "@/utils/copy.util";

export const FloatingActionBar = () => {
  const transactions = useStore((state) => state.transactions);
  const selectedIds = useStore((state) => state.selectedIds);
  const clearSelection = useStore((state) => state.clearSelection);
  const executeBulkAction = useStore((state) => state.executeBulkAction);

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;
  const isApplyingAny = transactions.some(t => t.status === 'APPLYING');
  
  // Selection Mode vs Pending Mode
  const isSelectionMode = selectedIds.length > 0;
  const showBar = isSelectionMode || pendingCount > 0 || appliedCount > 0 || isApplyingAny;

  // Report Config State
  const [showReportConfig, setShowReportConfig] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    description: true,
    metadata: true,
    files: true,
    diffs: false,
    reasoning: false
  });
  
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

  const handleCopyReport = () => {
    const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id));
    const report = generateGranularReport(selectedTransactions, reportOptions);
    navigator.clipboard.writeText(report);
    
    // Reset UI state
    setShowReportConfig(false);
    clearSelection();
  };

  const toggleOption = (key: keyof ReportOptions) => {
    setReportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-sm md:w-fit md:max-w-[90vw] px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: isVisible ? 0 : 100, 
              opacity: isVisible ? 1 : 0 
            }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center gap-3 px-3 md:px-4 ring-1 ring-white/10 overflow-hidden"
          >
            {isSelectionMode ? (
              showReportConfig ? (
                // REPORT CONFIGURATION MODE
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 w-full md:w-auto"
                >
                  <button 
                    onClick={() => setShowReportConfig(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-2 max-w-[200px] md:max-w-none">
                    {(['description', 'metadata', 'files', 'diffs', 'reasoning'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleOption(key)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-medium rounded-lg border transition-all whitespace-nowrap uppercase tracking-wider",
                          reportOptions[key]
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleCopyReport}
                    className="ml-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </motion.div>
              ) : (
                // SELECTION MODE UI
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 w-full md:w-auto"
                >
                  <div className="flex items-center gap-3 border-r border-zinc-700/50 pr-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
                      {selectedIds.length}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-zinc-300">Selected</span>
                  </div>

                  <div className="flex items-center gap-2">
                     <button 
                      onClick={() => executeBulkAction('REVERTED')}
                      className="p-2 md:px-3 md:py-2 bg-zinc-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 text-zinc-300 text-xs font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
                      title="Revert Selected"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden md:inline">Revert</span>
                    </button>

                    <button 
                      onClick={() => setShowReportConfig(true)}
                      className="p-2 md:px-3 md:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
                      title="Generate Report"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span className="hidden md:inline">Report</span>
                    </button>

                    <button 
                      onClick={() => executeBulkAction('COMMITTED')}
                      className="p-2 md:px-3 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <GitCommit className="w-4 h-4" />
                      <span className="hidden md:inline">Commit</span>
                    </button>

                    <div className="w-px h-6 bg-zinc-800 mx-1" />

                    <button 
                      onClick={clearSelection}
                      className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            ) : (
              // DEFAULT PENDING MODE UI
              <>
                <div className="hidden md:flex items-center gap-2 border-r border-zinc-700/50 pr-4">
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
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};