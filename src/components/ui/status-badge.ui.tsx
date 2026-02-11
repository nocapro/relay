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