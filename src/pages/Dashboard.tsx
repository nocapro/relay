import { useEffect } from 'react';
import { Play, Pause, Activity, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/utils/cn";
import { useTransactionStore } from "@/store/useTransactionStore";
import { TransactionCard } from "@/features/transactions/components/TransactionCard";

export const Dashboard = () => {
  const { transactions, fetchTransactions, isWatching, toggleWatching } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32">
      
      {/* Hero Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl group">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
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
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                {isWatching ? 'Listening for patches...' : 'Monitoring paused'}
              </h1>
              <p className="text-zinc-500 text-sm md:text-base max-w-md leading-relaxed">
                {isWatching 
                  ? 'Relaycode is actively monitoring your clipboard. Copy any AI-generated code block to instantly create a transaction.' 
                  : 'Resume monitoring to detect new patches. Your pending transactions remain safe.'}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button 
                onClick={toggleWatching}
                className={cn(
                  "px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all transform active:scale-95",
                  isWatching 
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/50"
                )}
              >
                {isWatching ? (
                  <><Pause className="w-4 h-4 fill-current" /> Pause</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Resume</>
                )}
              </button>
              
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Last checked 2s ago</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-75" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
        </div>

        {/* Stats Card */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between space-y-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500 font-medium">Session Metrics</span>
            <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1">
               <Activity className="w-3 h-3" /> 94% Success
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-2xl font-bold text-white mb-1">12</div>
              <div className="text-xs text-zinc-500 font-medium">Patches Applied</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-2xl font-bold text-zinc-400 mb-1">1.4s</div>
              <div className="text-xs text-zinc-500 font-medium">Avg. Latency</div>
            </div>
          </div>
          
          <div className="space-y-2">
             <div className="flex justify-between text-xs text-zinc-500">
                <span>Daily Quota</span>
                <span>75% used</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "75%" }}
                   className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                />
             </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -my-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0 flex items-center justify-between border-b border-zinc-800/50 md:border-none px-1 md:px-0">
          <div className="flex items-center gap-3">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Event Stream
             </h3>
             <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">LIVE</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg">
               <Filter className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2">
               <button className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                 Clear
               </button>
               <div className="h-4 w-px bg-zinc-800" />
               <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Refresh
               </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 md:pt-0">
          {transactions.map((tx) => (
            <TransactionCard 
              key={tx.id} 
              tx={tx} 
            />
          ))}
        </div>
      </div>

    </div>
  );
};