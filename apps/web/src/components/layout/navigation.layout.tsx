import { Activity, Settings, Kanban, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { cn } from "@/utils/cn.util";
import { useIsMobile } from "@/hooks/mobile.hook";
import { useStore } from "@/store/root.store";

const navItems = [
  { path: '/', icon: Activity, label: 'Stream' },
  { path: '/prompts', icon: Kanban, label: 'Prompts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSidebarCollapsed = useStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="flex justify-around items-center py-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center p-2 rounded-xl transition-all w-16 h-12",
                  isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <div className={cn("p-1.5 rounded-full transition-all", isActive ? "bg-indigo-500/10" : "bg-transparent")}>
                  <item.icon className="w-5 h-5" />
                </div>
                
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-r border-zinc-800/60 bg-zinc-950 flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-6 flex items-center gap-3",
        isSidebarCollapsed ? "justify-center p-4" : ""
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        {!isSidebarCollapsed && (
          <span className="font-bold text-lg tracking-tight text-white">Relaycode</span>
        )}
      </div>

      <div className={cn("px-4 py-2", isSidebarCollapsed && "px-2")}>
        {!isSidebarCollapsed && (
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        )}
        <nav className={cn("space-y-1", isSidebarCollapsed && "flex flex-col items-center")}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-inner shadow-black/20" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50",
                  isSidebarCollapsed ? "justify-center w-full px-2" : ""
                )}
              >
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4 transition-colors shrink-0", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                {!isSidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn(
        "mt-auto p-4 border-t border-zinc-800/60",
        isSidebarCollapsed && "p-2"
      )}>
        {!isSidebarCollapsed && (
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
        )}
      </div>
      
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-10 bg-zinc-900 border border-zinc-800 rounded-r-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all z-30",
        )}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
