import { Activity, Settings, Clock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";
import { AppTab } from '@/types/app.types';

export const Navigation = () => {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const isMobile = useIsMobile();

  const items: { id: AppTab; icon: any; label: string }[] = [
    { id: 'dashboard', icon: Activity, label: 'Stream' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="flex justify-around items-center p-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20",
                activeTab === item.id ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className={cn("p-1.5 rounded-full transition-all", activeTab === item.id ? "bg-indigo-500/10" : "bg-transparent")}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-zinc-800/60 bg-zinc-950 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">Relaycode</span>
      </div>

      <div className="px-4 py-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-zinc-900 text-white shadow-inner shadow-black/20" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              {activeTab === item.id && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800/60">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-lg p-3 border border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-medium text-zinc-300">System Online</span>
          </div>
          <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
            <span>v1.2.4</span>
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};