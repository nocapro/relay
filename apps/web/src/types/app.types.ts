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
import type { components } from './api';

export type TransactionStatus = components["schemas"]["TransactionStatus"];
export type TransactionFile = components["schemas"]["TransactionFile"];
export type PromptStatus = components["schemas"]["PromptStatus"];
export type Prompt = components["schemas"]["Prompt"];
export type TransactionBlock = components["schemas"]["TransactionBlock"];
export type Transaction = components["schemas"]["Transaction"];

export const STATUS_CONFIG: Record<TransactionStatus, { 
  icon: LucideIcon; 
  color: string; 
  border: string; 
  animate?: boolean;
}> = {
  PENDING:   { icon: Loader2,      color: 'text-amber-500',   border: 'border-amber-500/20 bg-amber-500/5', animate: true },
  APPLYING:  { icon: RefreshCw,    color: 'text-indigo-400',  border: 'border-indigo-500/20 bg-indigo-500/10', animate: true },
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

export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';
