import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitCommit, 
  RotateCcw 
} from 'lucide-react';
import { cn } from "@/utils/cn.util";
import { TransactionStatus } from "@/types/app.types";

const styles = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20 ring-amber-500/10',
  APPLIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ring-emerald-500/10',
  COMMITTED: 'bg-blue-500/10 text-blue-500 border-blue-500/20 ring-blue-500/10',
  REVERTED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 ring-zinc-500/10',
  FAILED: 'bg-red-500/10 text-red-500 border-red-500/20 ring-red-500/10',
};

const icons = {
  PENDING: Clock,
  APPLIED: CheckCircle2,
  COMMITTED: GitCommit,
  REVERTED: RotateCcw,
  FAILED: XCircle,
};

export const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const Icon = icons[status];

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium border ring-1", styles[status])}>
      <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
      <span>{status}</span>
    </div>
  );
};