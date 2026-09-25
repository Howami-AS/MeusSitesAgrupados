import React from 'react';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface FirstRunModalProps {
  isOpen: boolean;
  onStart: () => void;
  onAddPopularDefaults: () => void;
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({
  isOpen,
  onStart,
  onAddPopularDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center animate-in zoom-in-95">
        {/* App Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-6">
          <Globe className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Meus Sites
        </h1>

        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
          Todos os seus sites em um único aplicativo.
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          Organize seus sites e reduza a quantidade de atalhos na tela inicial do seu smartphone.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onStart}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <span>Começar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onAddPopularDefaults}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Adicionar sites populares sugeridos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
