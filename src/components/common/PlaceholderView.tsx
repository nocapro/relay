export const PlaceholderView = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-zinc-500 animate-in fade-in zoom-in duration-300">
    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 mb-6 shadow-2xl">
      <Icon className="w-12 h-12 text-zinc-400" />
    </div>
    <h2 className="text-2xl font-bold text-zinc-200 mb-2">{title}</h2>
    <p className="text-sm text-zinc-500 max-w-xs text-center">This module is currently under active development. Check back in the next release.</p>
    <button className="mt-8 px-6 py-2 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium hover:bg-zinc-700 transition-colors">
       Notify me when ready
    </button>
  </div>
);