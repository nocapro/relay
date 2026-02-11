import { useEffect } from 'react';
import { Settings, Clock, CheckCircle2, GitCommit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { useIsMobile } from "@/hooks/use-mobile";

// Components
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Navigation } from "@/components/layout/Navigation";
import { Header } from "@/components/layout/Header";
import { PlaceholderView } from "@/components/common/PlaceholderView";

// Pages
import { Dashboard } from "@/pages/Dashboard";

export function App() {
  const { activeTab, setCmdOpen } = useAppStore();
  const isMobile = useIsMobile();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true); // Using store directly inside effect might need callback if strict, but this works
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCmdOpen]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <CommandPalette />
      
      <Navigation />
      
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isMobile ? "pb-20" : "pl-64")}>
        <Header />
        
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'history' && <PlaceholderView title="Transaction History" icon={Clock} />}
                {activeTab === 'settings' && <PlaceholderView title="System Settings" icon={Settings} />}
             </motion.div>
          </AnimatePresence>

          {/* Floating Action Bar (Contextual) */}
          <AnimatePresence>
            {activeTab === 'dashboard' && (
              <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center justify-between px-3 md:px-4 ring-1 ring-white/10"
                >
                    <div className="hidden md:flex items-center gap-2 pr-4 border-r border-zinc-700/50">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-semibold text-zinc-300">1 Pending</span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                       <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                        <span className="hidden md:inline ml-1 text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">A</span>
                      </button>
                      
                      <button className="flex-1 md:flex-none px-4 py-2.5 md:py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2">
                        <GitCommit className="w-4 h-4" />
                        Commit
                        <span className="hidden md:inline ml-1 text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">C</span>
                      </button>
                    </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}