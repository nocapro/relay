import { useMemo } from 'react';
import { CircleDashed, Loader2, CheckCircle2, Archive } from 'lucide-react';
import { Prompt, Transaction, PromptStatus } from '@/types/app.types';
import { KanbanColumn } from './kanban-column.component';

interface KanbanBoardProps {
  prompts: Prompt[];
  transactions: Transaction[];
  onStatusChange: (id: string, status: PromptStatus) => void;
}

export const KanbanBoard = ({ prompts, transactions, onStatusChange }: KanbanBoardProps) => {
  const columns = useMemo(() => [
    { id: 'DRAFT', title: 'Draft', icon: CircleDashed, color: 'text-zinc-400' },
    { id: 'ACTIVE', title: 'In Progress', icon: Loader2, color: 'text-indigo-400' },
    { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-400' },
    { id: 'ARCHIVED', title: 'Archived', icon: Archive, color: 'text-orange-400' },
  ], []);

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-12rem)] snap-x">
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          title={col.title}
          icon={col.icon}
          color={col.color}
          prompts={prompts.filter(p => p.status === col.id)}
          transactions={transactions}
          onDrop={(id) => onStatusChange(id, col.id as PromptStatus)}
        />
      ))}
    </div>
  );
};