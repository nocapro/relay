import { Search, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from "@/store/root.store";

export const CommandPalette = () => {
  const isCmdOpen = useStore((state) => state.isCmdOpen);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  
  if (!isCmdOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500" />
          <input 
            autoFocus
            type="text" 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none text-sm h-6"
          />
          <span className="text-xs text-zinc-600 border border-zinc-800 px-1.5 rounded">ESC</span>
        </div>
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
            <Play className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
            Resume Monitoring
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
            <CheckCircle2 className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
            Approve All Pending
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
             <RefreshCw className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
             Retry Failed Patches
          </button>
        </div>
      </motion.div>
    </div>
  );
};