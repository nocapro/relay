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

  sorted.forEach(tx => {
    let key = 'unknown';
    let label = 'Unknown';

    switch (strategy) {
      case 'prompt': {
        key = tx.promptId;
        const prompt = prompts.find(p => p.id === tx.promptId);
        label = prompt?.title || 'Orphaned Transactions';
        break;
      }
      case 'date': {
        key = getRelativeDate(tx.createdAt);
        label = key;
        break;
      }
      case 'author': {
        key = tx.author || 'unknown';
        label = tx.author ? `@${tx.author}` : 'Unknown Author';
        break;
      }
      case 'status': {
        key = tx.status;
        label = tx.status.charAt(0) + tx.status.slice(1).toLowerCase();
        break;
      }
      case 'files': {
        // Group by the first file path or "No Files"
        const firstFile = tx.files[0];
        key = firstFile?.path || 'no-files';
        label = firstFile?.path || 'No Files Attached';
        break;
      }
    }

    if (!groups.has(key)) {
      groups.set(key, { label, transactions: [] });
    }
    groups.get(key)!.transactions.push(tx);
  });

  // Convert map to array and calculate counts
  return Array.from(groups.entries()).map(([id, data]) => ({
    id,
    label: data.label,
    count: data.transactions.length,
    transactions: data.transactions
  }));
}