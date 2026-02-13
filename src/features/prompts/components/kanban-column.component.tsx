import { Prompt, Transaction } from '@/types/app.types';
import { PromptCard } from './prompt-card.component';
import { cn } from '@/utils/cn.util';
import { LucideIcon } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  prompts: Prompt[];
  transactions: Transaction[];
  onDrop: (promptId: string, status: string) => void;
}

export const KanbanColumn = ({ title, icon: Icon, color, prompts, transactions }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full min-w-[300px] w-full md:w-[350px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md bg-zinc-900 border border-zinc-800", color)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
          <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
            {prompts.length}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 p-3 space-y-3 overflow-y-auto custom-scrollbar-thin">
        {prompts.map((prompt) => (
          <PromptCard 
            key={prompt.id} 
            prompt={prompt} 
            transactions={transactions} 
          />
        ))}
        
        {prompts.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800/50 rounded-xl">
            <span className="text-xs">No items</span>
          </div>
        )}
      </div>
    </div>
  );
};