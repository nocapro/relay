import { useEffect } from 'react';
import { Settings, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";

// Components
import { CommandPalette } from "@/components/layout/command-palette.layout";
import { Navigation } from "@/components/layout/navigation.layout";
import { Header } from "@/components/layout/header.layout";
import { PlaceholderView } from "@/components/common/placeholder.view";

// Pages
import { Dashboard } from "@/pages/dashboard.page";
import { FloatingActionBar } from "@/features/transactions/components/action-bar.component";

export function App() {
  const activeTab = useStore((state) => state.activeTab);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
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
        </main>
        <FloatingActionBar />
      </div>
    </div>
  );
}