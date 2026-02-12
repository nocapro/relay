import { Transaction, Prompt, GroupByStrategy } from '@/types/app.types';

export interface GroupedData {
  id: string;
  label: string;
  count: number;
  transactions: Transaction[];
}

// Helper to get relative date
const getRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  return 'Older';
};

export function groupTransactions(
  transactions: Transaction[],
  prompts: Prompt[],
  strategy: GroupByStrategy
): GroupedData[] {
  if (strategy === 'none' || !transactions.length) {
    return [{
      id: 'all',
      label: 'All Transactions',
      count: transactions.length,
      transactions
    }];
  }

  const groups = new Map<string, { label: string; transactions: Transaction[] }>();

  // 1. Sort transactions by date first for consistent ordering
  const sorted = [...transactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const strategies: Record<GroupByStrategy, (tx: Transaction) => { key: string; label: string }> = {
    prompt: (tx) => ({ key: tx.promptId, label: prompts.find(p => p.id === tx.promptId)?.title || 'Orphaned' }),
    date:   (tx) => ({ key: getRelativeDate(tx.createdAt), label: getRelativeDate(tx.createdAt) }),
    author: (tx) => ({ key: tx.author || '?', label: tx.author ? `@${tx.author}` : 'Unknown' }),
    status: (tx) => ({ key: tx.status, label: tx.status.charAt(0) + tx.status.slice(1).toLowerCase() }),
    files:  (tx) => ({ key: tx.files[0]?.path || '?', label: tx.files[0]?.path || 'No Files' }),
    none:   () => ({ key: 'all', label: 'All' }),
  };

  sorted.forEach(tx => {
    const { key, label } = strategies[strategy](tx);
    const group = groups.get(key) || { label, transactions: [] };
    group.transactions.push(tx);
    groups.set(key, group);
  });

  // Convert map to array and calculate counts
  return Array.from(groups.entries()).map(([id, data]) => ({
    id,
    label: data.label,
    count: data.transactions.length,
    transactions: data.transactions
  }));
}