import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit, ListChecks } from 'lucide-react';
import { useStore } from "@/store/root.store";

export const FloatingActionBar = () => {
  const activeTab = useStore((state) => state.activeTab);
  const transactions = useStore((state) => state.transactions);
  
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;

  // Only show if we have pending items or items ready to commit
  const showBar = activeTab === 'dashboard' && (pendingCount > 0 || appliedCount > 0);

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm md:max-w-md px-4">
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/80 rounded-2xl p-1.5 flex items-center justify-between pl-4 pr-1.5 ring-1 ring-white/10"
          >
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-zinc-700/50 mr-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-amber-500 blur-[4px] opacity-50" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">{pendingCount} Pending</span>
                   <span className="text-[10px] text-zinc-400">{appliedCount} ready to commit</span>
                </div>
              </div>

              {/* Mobile Status Text */}
              <div className="md:hidden flex items-center gap-2 text-xs font-semibold text-zinc-300 mr-auto">
                 <ListChecks className="w-4 h-4 text-amber-500" />
                 <span>{pendingCount} Pending</span>
              </div>
              
              <div className="flex items-center gap-2">
                 {pendingCount > 0 && (
                   <button className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve All
                  </button>
                 )}
                
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                  <GitCommit className="w-3.5 h-3.5" />
                  Commit
                </button>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};