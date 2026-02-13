import { motion } from 'framer-motion';
import { Clock, GitBranch } from 'lucide-react';
import { Prompt, Transaction } from '@/types/app.types';

interface PromptCardProps {
  prompt: Prompt;
  transactions: Transaction[];
}

export const PromptCard = ({ prompt, transactions }: PromptCardProps) => {
  const transactionCount = transactions.filter(t => t.promptId === prompt.id).length;
  
  return (
    <motion.div
      layout
      layoutId={prompt.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {prompt.title}
        </h3>
      </div>
      
      <p className="text-xs text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
        {prompt.content}
      </p>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" title="Associated Transactions">
            <GitBranch className="w-3 h-3" />
            <span>{transactionCount}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Time Logged">
            <Clock className="w-3 h-3" />
            <span>{prompt.timestamp}</span>
          </div>
        </div>
        
        {transactionCount > 0 && (
          <div className="flex -space-x-1.5">
            {[...Array(Math.min(3, transactionCount))].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[6px] text-zinc-400">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};