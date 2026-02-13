import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TransactionCard } from './transaction-card.component';
import { GroupedData } from '@/utils/group.util';

interface TransactionGroupProps {
  group: GroupedData;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
  seenIds: Set<string>;
}

export const TransactionGroup = ({ group, isCollapsed, onToggle, seenIds }: TransactionGroupProps) => (
  <div className="space-y-6">
    <button
      onClick={() => onToggle(group.id)}
      className="flex items-center gap-3 pt-12 first:pt-0 w-full group/header"
    >
      <div className="h-px flex-1 bg-zinc-800/50" />
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
        {isCollapsed ? <ChevronRight className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
        <span className="text-xs font-medium text-zinc-300">{group.label}</span>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{group.count}</span>
      </div>
      <div className="h-px flex-1 bg-zinc-800/50" />
    </button>
    
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-visible"
        >
          <div className="space-y-6 pl-0 md:pl-2 ml-3 relative">
            {group.transactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                {...tx}
                isNew={!seenIds.has(tx.id)}
                depth={tx.depth}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
