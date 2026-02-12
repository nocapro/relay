import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  GitCommit, 
  RotateCcw,
  PlusCircle,
  FileEdit,
  Trash2,
  RefreshCw,
  LucideIcon
} from 'lucide-react';

export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export const STATUS_CONFIG: Record<TransactionStatus, { 
  icon: LucideIcon; 
  color: string; 
  border: string; 
  animate?: boolean;
}> = {
  PENDING:   { icon: Loader2,     color: 'text-amber-500',   border: 'border-amber-500/20 bg-amber-500/5', animate: true },
  APPLIED:   { icon: CheckCircle2, color: 'text-emerald-500', border: 'border-emerald-500/20 bg-emerald-500/5' },
  COMMITTED: { icon: GitCommit,    color: 'text-blue-500',    border: 'border-blue-500/20 bg-blue-500/5' },
  REVERTED:  { icon: RotateCcw,    color: 'text-zinc-400',    border: 'border-zinc-500/20 bg-zinc-500/5' },
  FAILED:    { icon: XCircle,      color: 'text-red-500',     border: 'border-red-500/20 bg-red-500/5' },
};

export const FILE_STATUS_CONFIG = {
  created:  { color: 'bg-emerald-500', icon: PlusCircle, label: 'Added' },
  modified: { color: 'bg-amber-500',   icon: FileEdit,   label: 'Modified' },
  deleted:  { color: 'bg-red-500',     icon: Trash2,     label: 'Deleted' },
  renamed:  { color: 'bg-blue-500',    icon: RefreshCw,  label: 'Renamed' },
} as const;

export interface TransactionFile {
  path: string;
  status: 'modified' | 'created' | 'deleted' | 'renamed';
  language: string;
  diff: string;
}

// New: Prompt entity to support grouping
export interface Prompt {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export type TransactionBlock =
  | { type: 'markdown'; content: string }
  | { type: 'file'; file: TransactionFile };

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  createdAt: string;
  promptId: string;
  author: string;
  blocks: TransactionBlock[]; // New narrative structure
  files: TransactionFile[];   // Keep for compatibility/summaries
  provider: string;
  model: string;
  cost: string;
  tokens: string;
  reasoning: string; // Legacy fallback
}

// New: Grouping Strategies
export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';