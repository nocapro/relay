import { cn } from "@/utils/cn.util";
import { TransactionStatus, STATUS_CONFIG } from "@/types/app.types";

export const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-medium border transition-all", 
      cfg.color, cfg.border
    )}>
      <cfg.icon className={cn("w-3.5 h-3.5", cfg.animate && "animate-spin")} />
      <span className="tracking-wide uppercase">{status}</span>
    </div>
  );
};