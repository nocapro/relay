import { Search, Play, CheckCircle2, FileText, Code2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from "@/store/root.store";
import { useState, useEffect } from 'react';

export const CommandPalette = () => {
  const isCmdOpen = useStore((state) => state.isCmdOpen);
  const setCmdOpen = useStore((state) => state.setCmdOpen);
  const searchTransactions = useStore((state) => state.searchTransactions);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const txs = await searchTransactions(query);
      const matches: any[] = [];

      txs.forEach(tx => {
        if (tx.description.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ type: 'tx', id: tx.id, title: tx.description, subtitle: 'Transaction' });
        }

        tx.blocks?.forEach((block: any) => {
          if (block.type === 'markdown' && block.content.toLowerCase().includes(query.toLowerCase())) {
            // Avoid duplicates if we already matched the transaction
            if (!matches.some(m => m.id === tx.id)) {
               matches.push({ type: 'doc', id: tx.id, title: 'Reasoning match...', subtitle: tx.description });
            }
          }
          if (block.type === 'file' && block.file.path.toLowerCase().includes(query.toLowerCase())) {
            matches.push({ type: 'file', id: tx.id, title: block.file.path, subtitle: tx.description });
          }
        });
      });
      
      setResults(matches.slice(0, 5));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, searchTransactions]);

  if (!isCmdOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-zinc-500" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none text-sm h-6"
          />
          <span className="text-xs text-zinc-600 border border-zinc-800 px-1.5 rounded">ESC</span>
        </div>
        <div className="p-2 space-y-1 max-h-96 overflow-y-auto custom-scrollbar-thin">
          {results.length > 0 ? (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Search Results</div>
              {results.map((res, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                  {res.type === 'file' ? <Code2 className="w-4 h-4 text-zinc-500" /> : <FileText className="w-4 h-4 text-zinc-500" />}
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="truncate w-full">{res.title}</span>
                    <span className="text-[10px] text-zinc-600 truncate w-full">{res.subtitle}</span>
                  </div>
                </button>
              ))}
            </>
          ) : query ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No matches found for "{query}"</div>
          ) : (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</div>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                <Play className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
                Resume Monitoring
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors group">
                <CheckCircle2 className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
                Approve All Pending
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};