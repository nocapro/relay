import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit } from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { useStore } from "@/store/root.store";
import { useIsMobile } from "@/hooks/mobile.hook";

export const FloatingActionBar = () => {
  const transactions = useStore((state) => state.transactions);
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;
  const isApplyingAny = transactions.some(t => t.status === 'APPLYING');
  const showBar = pendingCount > 0 || appliedCount > 0 || isApplyingAny;
  
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

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-full max-w-xs md:max-w-md px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: isVisible ? 0 : 100, 
              opacity: isVisible ? 1 : 0 
            }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/50 rounded-2xl p-2 flex items-center px-3 md:px-4 ring-1 ring-white/10"
          >
            <div className="hidden md:flex items-center gap-2 border-r border-zinc-700/50 pr-4 mr-auto">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};