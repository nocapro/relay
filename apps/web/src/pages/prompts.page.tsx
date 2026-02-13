import { useEffect } from 'react';
import { useStore } from '@/store/root.store';
import { KanbanBoard } from '@/features/prompts/components/kanban-board.component';
import { Kanban, Plus } from 'lucide-react';

export const PromptsPage = () => {
  const prompts = useStore((state) => state.prompts);
  const transactions = useStore((state) => state.transactions);
  const fetchPrompts = useStore((state) => state.fetchPrompts);
  const updatePromptStatus = useStore((state) => state.updatePromptStatus);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Kanban className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Prompt Management</h1>
            <p className="text-sm text-zinc-500">Manage AI prompt lifecycle and view generated patches</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20">
          <Plus className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </header>

      <KanbanBoard 
        prompts={prompts} 
        transactions={transactions}
        onStatusChange={updatePromptStatus}
      />
    </div>
  );
};