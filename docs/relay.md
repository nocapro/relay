Here is **Part 4 of 4**.

This final part adds the "glue" that makes the application feel like a cohesive, production-ready tool. We implement the interactive "Approve" logic, add custom scrollbars for the diff viewers (crucial for dense code views), and make the floating action bar context-aware.

### Changes in Part 4
1.  **Global Styles**: Added custom, dark-mode optimized scrollbars in `src/styles/main.style.css` to prevent default browser scrollbars from breaking the immersion in the diff viewer.
2.  **Store Logic**: Added `approveTransaction` to `transaction.slice.ts` to make the UI interactive.
3.  **Component Logic**: Wired up the `TransactionCard` buttons to the new store action.
4.  **Reactive UI**: Updated `FloatingActionBar` to display the actual count of pending transactions dynamically.
5.  **Visual Polish**: Refined `StatusBadge` to better match the new high-contrast "zinc" aesthetic.

```css // src/styles/main.style.css
@import "tailwindcss";

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #09090b; /* zinc-950 */
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a; /* zinc-800 */
    border-radius: 5px;
    border: 2px solid #09090b; /* zinc-950 */
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3f3f46; /* zinc-700 */
  }

  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Animations */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.1; }
}

.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

```typescript // src/store/slices/transaction.slice.ts standard-diff
--- src/store/slices/transaction.slice.ts
+++ src/store/slices/transaction.slice.ts
@@ -11,4 +11,5 @@
   fetchTransactions: () => Promise<void>;
   addTransaction: (tx: Transaction) => void;
+  approveTransaction: (id: string) => void;
 }
 
@@ -35,4 +36,13 @@
     transactions: [tx, ...state.transactions] 
   })),
+
+  approveTransaction: (id) => set((state) => ({
+    transactions: state.transactions.map((t) => 
+      t.id === id 
+        ? { ...t, status: 'APPLIED' as const } 
+        : t
+    )
+  })),
 
   fetchTransactions: async () => {
```

```typescript // src/features/transactions/components/transaction-card.component.tsx standard-diff
--- src/features/transactions/components/transaction-card.component.tsx
+++ src/features/transactions/components/transaction-card.component.tsx
@@ -23,6 +23,7 @@
   const expandedId = useStore((state) => state.expandedId);
   const setExpandedId = useStore((state) => state.setExpandedId);
+  const approveTransaction = useStore((state) => state.approveTransaction);
   const expanded = expandedId === tx.id;
   
   const [activeTab, setActiveTab] = useState<'reasoning' | 'diff'>('diff');
@@ -31,4 +32,9 @@
   const onToggle = () => setExpandedId(expanded ? null : tx.id);
   const selectedFile = tx.files[selectedFileIndex];
+
+  const handleApprove = (e: React.MouseEvent) => {
+    e.stopPropagation();
+    approveTransaction(tx.id);
+  };
 
   return (
@@ -87,4 +93,5 @@
         <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {tx.status === 'PENDING' && (
-            <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
+            <button onClick={handleApprove} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95">
               <CheckCircle2 className="w-3.5 h-3.5" />
               Approve
```

```typescript // src/features/transactions/components/action-bar.component.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, GitCommit, ListChecks } from 'lucide-react';
import { useStore } from "@/store/root.store";

export const FloatingActionBar = () => {
  const activeTab = useStore((state) => state.activeTab);
  const transactions = useStore((state) => state.transactions);
  
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const appliedCount = transactions.filter(t => t.status === 'APPLIED').length;

  // Only show if we have pending items or items ready to commit
  const showBar = activeTab === 'dashboard' && (pendingCount > 0 || appliedCount > 0);

  return (
    <AnimatePresence>
      {showBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm md:max-w-md px-4">
          <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-2xl shadow-black/80 rounded-2xl p-1.5 flex items-center justify-between pl-4 pr-1.5 ring-1 ring-white/10"
          >
              <div className="hidden md:flex items-center gap-3 pr-4 border-r border-zinc-700/50 mr-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-amber-500 blur-[4px] opacity-50" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">{pendingCount} Pending</span>
                   <span className="text-[10px] text-zinc-400">{appliedCount} ready to commit</span>
                </div>
              </div>

              {/* Mobile Status Text */}
              <div className="md:hidden flex items-center gap-2 text-xs font-semibold text-zinc-300 mr-auto">
                 <ListChecks className="w-4 h-4 text-amber-500" />
                 <span>{pendingCount} Pending</span>
              </div>
              
              <div className="flex items-center gap-2">
                 {pendingCount > 0 && (
                   <button className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve All
                  </button>
                 )}
                
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center gap-2 active:scale-95 transform duration-100">
                  <GitCommit className="w-3.5 h-3.5" />
                  Commit
                </button>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

```typescript // src/components/ui/status-badge.ui.tsx
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitCommit, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionStatus } from "@/types/app.types";

const styles = {
  PENDING: 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_10px_-3px_rgba(245,158,11,0.2)]',
  APPLIED: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]',
  COMMITTED: 'bg-blue-500/5 text-blue-500 border-blue-500/20',
  REVERTED: 'bg-zinc-500/5 text-zinc-400 border-zinc-500/20',
  FAILED: 'bg-red-500/5 text-red-500 border-red-500/20',
};

const icons = {
  PENDING: Loader2, // Animated loader for pending
  APPLIED: CheckCircle2,
  COMMITTED: GitCommit,
  REVERTED: RotateCcw,
  FAILED: XCircle,
};

export const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const Icon = icons[status];
  const isPending = status === 'PENDING';

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-medium border transition-all", 
      styles[status]
    )}>
      <Icon className={cn("w-3.5 h-3.5", isPending && "animate-spin")} />
      <span className="tracking-wide uppercase">{status}</span>
    </div>
  );
};
```

```yaml
projectId: react-vite-tailwind
uuid: 7700e930-b3b3-4f9e-a6c3-112233445599
changeSummary:
  - edit: src/styles/main.style.css
  - edit: src/store/slices/transaction.slice.ts
  - edit: src/features/transactions/components/transaction-card.component.tsx
  - replace: src/features/transactions/components/action-bar.component.tsx
  - replace: src/components/ui/status-badge.ui.tsx
promptSummary: Part 4 of 4. Finalized the UX with interactive approval flows, custom scrollbars for the diff viewer, a reactive floating action bar that tracks pending counts, and polished status badges.
gitCommitMsg: >-
  feat: complete dashboard ux with interactive controls and styling
  
  - Add custom scrollbars for diff viewer
  - Implement approveTransaction action in store
  - Wire up TransactionCard buttons to store actions
  - Make FloatingActionBar reactive to pending count
  - Update StatusBadge for better visual hierarchy
```