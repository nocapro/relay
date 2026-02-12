import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit } from 'lucide-react';
import { useStore } from "@/store/root.store";

export const FloatingActionBar = () => {
  const transactions = useStore((state) => state.transactions);
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;
  const showBar = pendingCount > 0 || appliedCount > 0;

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center px-3 md:px-4 ring-1 ring-white/10"
          >
              <div className="hidden md:flex items-center gap-2 border-r border-zinc-700/50 pr-4">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">{pendingCount} Pending</span>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approve
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