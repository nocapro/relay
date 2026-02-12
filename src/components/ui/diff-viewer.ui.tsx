import { useMemo, memo } from 'react';
import { parseDiff, tokenizeCode, DiffLine } from "@/utils/diff.util";
import { cn } from "@/utils/cn.util";

interface DiffViewerProps {
  diff: string;
  language: string;
  className?: string;
}

export const DiffViewer = memo(({ diff, className }: DiffViewerProps) => {
  const lines = useMemo(() => parseDiff(diff), [diff]);
  
  return (
    <div className={cn("font-mono text-[11px] md:text-xs overflow-x-auto relative", className)}>
      <div className="min-w-full inline-block">
        {lines.map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
      </div>
    </div>
  );
});

const LineRow = memo(({ line }: { line: DiffLine }) => {
  const tokens = useMemo(() => tokenizeCode(line.content), [line.content]);

  // Styles based on line type
  const bgClass = 
    line.type === 'add' ? 'bg-emerald-500/10' :
    line.type === 'remove' ? 'bg-red-500/10' :
    line.type === 'hunk' ? 'bg-zinc-800/50' : 
    'transparent';

  const textClass = 
    line.type === 'hunk' ? 'text-zinc-500' :
    line.type === 'context' ? 'text-zinc-400' :
    'text-zinc-300';

  const gutterClass = 
    line.type === 'add' ? 'bg-emerald-500/20 text-emerald-500' :
    line.type === 'remove' ? 'bg-red-500/20 text-red-500' :
    'text-zinc-700';

  return (
    <div className={cn("flex w-full group/line hover:bg-white/5 transition-colors", bgClass)}>
      {/* Line Numbers */}
      <div className={cn("w-6 md:w-8 flex-shrink-0 select-none text-right pr-1 py-0.5 border-r border-white/5 font-mono opacity-40 group-hover/line:opacity-100 transition-opacity", gutterClass)}>
        {line.oldLine || ' '}
      </div>
      <div className={cn("w-6 md:w-8 flex-shrink-0 select-none text-right pr-1 py-0.5 border-r border-white/5 font-mono opacity-40 group-hover/line:opacity-100 transition-opacity", gutterClass)}>
        {line.newLine || ' '}
      </div>
      
      {/* Content */}
      <div className={cn("flex-1 px-4 py-0.5 whitespace-pre", textClass)}>
        {line.type === 'hunk' ? (
          <span className="opacity-70">{line.content}</span>
        ) : (
          <span className="relative">
             {/* Marker */}
             <span className="absolute -left-2 select-none opacity-50">
               {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
             </span>
             
             {/* Syntax Highlighted Code */}
             {tokens.map((token, idx) => (
               <span key={idx} className={token.className}>
                 {token.text}
               </span>
             ))}
          </span>
        )}
      </div>
    </div>
  );
});