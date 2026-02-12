import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from "@/utils/cn.util";

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export const Metric = memo(({ icon: Icon, label, value, color, className }: MetricProps) => (
  <div className={cn("flex items-center gap-2 shrink-0", className)}>
    <div className={cn("p-1.5 rounded bg-zinc-800/50 border border-zinc-700/50", color)}>
      <Icon className="w-3 h-3" />
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter leading-none mb-0.5">{label}</span>
      <span className="text-[11px] font-mono text-zinc-300 leading-none">{value}</span>
    </div>
  </div>
));