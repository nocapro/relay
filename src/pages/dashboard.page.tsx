import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Activity, RefreshCw, Filter, Terminal, Command, Layers, Calendar, User, FileCode, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { TransactionCard } from "@/features/transactions/components/transaction-card.component";
import { groupTransactions } from "@/utils/group.util";
import { GroupByStrategy } from "@/types/app.types";

const DEFAULT_GROUP_BY: GroupByStrategy = 'prompt';
const VALID_GROUP_STRATEGIES: GroupByStrategy[] = ['prompt', 'date', 'author', 'status', 'files', 'none'];

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const transactions = useStore((state) => state.transactions);
  const prompts = useStore((state) => state.prompts);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const isWatching = useStore((state) => state.isWatching);
  const toggleWatching = useStore((state) => state.toggleWatching);
  
  // Get groupBy from URL search params
  const groupByParam = searchParams.get('groupBy');
  const groupBy: GroupByStrategy = VALID_GROUP_STRATEGIES.includes(groupByParam as GroupByStrategy) 
    ? (groupByParam as GroupByStrategy) 
    : DEFAULT_GROUP_BY;
  
  const setGroupBy = (strategy: GroupByStrategy) => {
    setSearchParams(prev => {
      prev.set('groupBy', strategy);
      return prev;
    });
  };

  // Track collapsed state of each group
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Track seen transaction IDs to identify new ones (prevents flicker on regroup)
  const seenTransactionIdsRef = useRef<Set<string>>(new Set());
  const [seenTransactionIds, setSeenTransactionIds] = useState<Set<string>>(new Set());
  
  // Update seen transactions when transactions change (with delay for animation)
  useEffect(() => {
    const newIds = new Set<string>();
    
    transactions.forEach(tx => {
      if (!seenTransactionIdsRef.current.has(tx.id)) {
        newIds.add(tx.id);
      }
    });
    
    if (newIds.size > 0) {
      // Delay marking as seen to allow enter animation to complete
      const timer = setTimeout(() => {
        newIds.forEach(id => seenTransactionIdsRef.current.add(id));
        setSeenTransactionIds(new Set(seenTransactionIdsRef.current));
      }, 500); // Wait for animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [transactions]);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const hasTransactions = transactions.length > 0;
  
  // Derived Grouped Data
  const groupedData = groupTransactions(transactions, prompts, groupBy);

  const groupOptions: { id: GroupByStrategy; icon: React.ElementType; label: string }[] = [
    { id: 'prompt', icon: Layers, label: 'Prompt' },
    { id: 'date', icon: Calendar, label: 'Date' },
    { id: 'author', icon: User, label: 'Author' },
    { id: 'status', icon: CheckCircle2, label: 'Status' },
    { id: 'files', icon: FileCode, label: 'Files' },
    { id: 'none', icon: Filter, label: 'None' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-32">
      
      {/* Hero Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div 
          className={cn(
            "relative rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl group transition-all duration-500",
            hasTransactions ? "lg:col-span-3 p-6" : "lg:col-span-4 p-12 py-20"
          )}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("relative flex h-3 w-3")}>
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isWatching ? "bg-emerald-500" : "bg-amber-500")}></span>
                  <span className={cn("relative inline-flex rounded-full h-3 w-3", isWatching ? "bg-emerald-500" : "bg-amber-500")}></span>
                </span>
                <h2 className={cn("text-xs font-bold uppercase tracking-widest", isWatching ? "text-emerald-500" : "text-amber-500")}>
                  {isWatching ? 'System Active' : 'System Paused'}
                </h2>
              </div>
              <h1 className={cn("font-bold text-white mb-2 tracking-tight transition-all", hasTransactions ? "text-xl md:text-2xl" : "text-3xl md:text-4xl")}>
                {isWatching ? 'Monitoring Clipboard Stream' : 'Ready to Intercept Patches'}
              </h1>
              <p className={cn("text-zinc-500 transition-all leading-relaxed", hasTransactions ? "text-sm max-w-lg" : "text-base max-w-2xl")}>
                {isWatching 
                  ? 'Relaycode is actively scanning for AI code blocks. Patches will appear below automatically.' 
                  : 'Resume monitoring to detect new AI patches from your clipboard.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={toggleWatching}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-xl",
                  isWatching 
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 ring-1 ring-emerald-500/50"
                )}
              >
                {isWatching ? (
                  <><Pause className="w-4 h-4 fill-current" /> Pause Watcher</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Start Monitoring</>
                )}
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Stats Card */}
        {hasTransactions && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-center gap-4 backdrop-blur-sm"
          >
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Session Stats</span>
                <Activity className="w-4 h-4 text-emerald-500" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-2xl font-bold text-white">{transactions.length}</div>
                   <div className="text-xs text-zinc-500">Events Captured</div>
                </div>
                <div>
                   <div className="text-2xl font-bold text-zinc-300">92%</div>
                   <div className="text-xs text-zinc-500">Auto-Success</div>
                </div>
             </div>
          </motion.div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {hasTransactions && (
          <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -my-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/50 md:border-none px-1 md:px-0 gap-4">
            
            <div className="flex items-center justify-between w-full md:w-auto flex-1">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-zinc-500" />
                <h3 className="text-lg font-semibold text-white">Event Log</h3>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">{transactions.length}</span>
              </div>
              
              {/* Mobile Filter Toggle */}
              <button className="md:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300">
                 <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Grouping Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <span className="text-xs text-zinc-500 hidden md:block mr-2">Group by:</span>
              {groupOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGroupBy(opt.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
                    groupBy === opt.id 
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                      : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                  )}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
            
            {/* Secondary Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 min-h-[300px] mt-8">
          <AnimatePresence mode='popLayout'>
            {hasTransactions ? (
              groupedData.map((group) => {
                const isCollapsed = collapsedGroups.has(group.id);
                return (
                  <div key={group.id} className="space-y-3">
                    {/* Group Header - Clickable */}
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center gap-3 pt-4 first:pt-0 w-full group/header"
                    >
                      <div className="h-px flex-1 bg-zinc-800/50" />
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                        {isCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover/header:text-zinc-300 transition-colors" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-zinc-500 group-hover/header:text-zinc-300 transition-colors" />
                        )}
                        <span className="text-xs font-medium text-zinc-300">{group.label}</span>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{group.count}</span>
                      </div>
                      <div className="h-px flex-1 bg-zinc-800/50" />
                    </button>
                    
                    {/* Group Items - Collapsible */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <div className="space-y-3 pl-0 md:pl-2 border-l-0 md:border-l border-zinc-800/50 ml-3">
                            {group.transactions.map((tx) => (
                              <TransactionCard 
                                key={tx.id} 
                                tx={tx}
                                isNew={!seenTransactionIds.has(tx.id)} 
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-xl">
                   <Command className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No patches detected yet</h3>
                <p className="max-w-sm text-center text-sm mb-6">
                  Copy any AI-generated code block (Claude, GPT, etc.) to your clipboard to see it appear here instantly.
                </p>
                <button 
                  onClick={toggleWatching}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {isWatching ? 'Waiting for clipboard events...' : 'Start Monitoring'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};