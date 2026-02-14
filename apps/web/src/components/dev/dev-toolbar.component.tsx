import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  X, 
  Minus, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/utils/cn.util';
import { useStore } from '@/store/root.store';
import type { SimulationScenario } from '@/store/slices/dev.slice';

interface ScenarioOption {
  value: SimulationScenario | null;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const scenarios: ScenarioOption[] = [
  { value: null, label: 'Normal Backend', description: 'Default behavior (2-6s)', icon: Zap },
  { value: 'fast-success', label: 'Quick Apply', description: '500ms happy path', icon: Zap },
  { value: 'simulated-failure', label: 'Complete Failure', description: 'All files fail', icon: AlertTriangle },
  { value: 'long-running', label: 'Slow Processing', description: '8-12s operation', icon: Clock },
  { value: 'partial-failure', label: 'Partial Failure', description: 'Some files fail', icon: Layers },
];

export const DevToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const activeScenario = useStore((state) => state.activeScenario);
  const setScenario = useStore((state) => state.setScenario);
  const isConnected = useStore((state) => state.isConnected);
  const resetMockData = useStore((state) => state.resetMockData);

  const handleReset = async () => {
    setIsResetting(true);
    await resetMockData();
    setIsResetting(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
              "bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50",
              "shadow-lg shadow-black/30 hover:bg-zinc-700 transition-colors",
              "ring-1 ring-white/10"
            )}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300">Dev</span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden w-80 ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-zinc-200">Dev Controls</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-zinc-400">Connected (SSE)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-zinc-400">Disconnected</span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Active Scenario
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {scenarios.map((scenario) => {
                    const Icon = scenario.icon;
                    const isActive = activeScenario === scenario.value;
                    return (
                      <button
                        key={scenario.value ?? 'null'}
                        onClick={() => setScenario(scenario.value)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                          isActive
                            ? "bg-amber-500/10 border border-amber-500/30"
                            : "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-amber-400" : "text-zinc-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-xs font-medium",
                            isActive ? "text-amber-400" : "text-zinc-300"
                          )}>
                            {scenario.label}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {scenario.description}
                          </div>
                        </div>
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          isActive
                            ? "border-amber-400 bg-amber-400"
                            : "border-zinc-600"
                        )}>
                          {isActive && (
                            <div className="w-full h-full rounded-full bg-amber-400/50 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleReset}
                disabled={isResetting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium",
                  "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700",
                  "text-zinc-300 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isResetting && "animate-spin")} />
                {isResetting ? 'Resetting...' : 'Reset Mock Data'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
