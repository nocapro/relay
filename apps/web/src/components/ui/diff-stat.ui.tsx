import { memo } from 'react';
import { cn } from "@/utils/cn.util";

interface DiffStatProps {
  adds: number;
  subs: number;
  className?: string;
  showIcon?: boolean;
}

export const DiffStat = memo(({ adds, subs, className }: DiffStatProps) => (
  <div className={cn("flex items-center gap-1.5 font-mono", className)}>
    <span className="text-emerald-500">+{adds}</span>
    <span className="text-red-500">-{subs}</span>
  </div>
));