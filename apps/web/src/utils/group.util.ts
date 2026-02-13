import { Transaction, Prompt, GroupByStrategy } from '@/types/app.types';

export interface GroupedTransaction extends Transaction {
  depth: number;
}

export interface GroupedData {
  id: string;
  label: string;
  count: number;
  transactions: GroupedTransaction[];
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
      transactions: transactions.map(tx => ({ ...tx, depth: 0 }))
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
    files:  (tx) => {
      const firstFile = tx.files?.[0] || tx.blocks?.find(b => b.type === 'file')?.file;
      return { key: firstFile?.path || '?', label: firstFile?.path || 'No Files' };
    },
    none:   () => ({ key: 'all', label: 'All' }),
  };

  sorted.forEach(tx => {
    const { key, label } = strategies[strategy](tx);
    const group = groups.get(key) || { label, transactions: [] };
    group.transactions.push(tx);
    groups.set(key, group);
  });

  // Convert map to array and calculate counts
  return Array.from(groups.entries()).map(([id, data]) => {
    // Threading Logic: Sort by chain and calculate depths
    const threaded: GroupedTransaction[] = [];
    const pool = [...data.transactions];
    
    const addToChain = (parentId: string | undefined, depth: number) => {
      // Find children for this parent in the current pool
      const children = pool.filter(tx => tx.parentId === parentId);
      
      children.forEach(child => {
        const idx = pool.findIndex(t => t.id === child.id);
        if (idx > -1) {
          pool.splice(idx, 1);
          threaded.push({ ...child, depth });
          // Recursively add descendants
          addToChain(child.id, depth + 1);
        }
      });
    };

    // 1. Identify "roots" for this group. A root has no parent, 
    // or its parent is not present in this specific filtered group.
    const rootCandidates = pool.filter(tx => 
      !tx.parentId || !pool.some(p => p.id === tx.parentId)
    );

    rootCandidates.forEach(root => {
      const idx = pool.findIndex(t => t.id === root.id);
      if (idx > -1) {
        pool.splice(idx, 1);
        threaded.push({ ...root, depth: 0 });
        addToChain(root.id, 1);
      }
    });

    // 2. Safety: Handle any remaining orphans that might have missed the tree logic
    while (pool.length > 0) {
      const tx = pool.shift()!;
      threaded.push({ ...tx, depth: 0 });
    }

    return {
      id,
      label: data.label,
      count: data.transactions.length,
      transactions: threaded
    };
  });
}