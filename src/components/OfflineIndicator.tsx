import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 flex items-center gap-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 text-xs font-medium shadow-xl border border-slate-700/50 backdrop-blur-md transition-all animate-bounce-subtle"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="font-semibold text-amber-300">Modo Offline ativo</p>
        <p className="text-[11px] text-slate-300">Você pode gerenciar e pesquisar seus sites normalmente.</p>
      </div>
    </div>
  );
};
