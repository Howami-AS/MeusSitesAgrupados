import React from 'react';
import { Plus, Globe, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onAddFirstSite: () => void;
  onAddPopularDefaults?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddFirstSite,
  onAddPopularDefaults,
  isFiltered = false,
  onClearFilters,
}) => {
  if (isFiltered) {
    return (
      <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          Nenhum site encontrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Não há sites correspondentes aos filtros ou pesquisa atuais.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Limpar filtros e pesquisa
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm border border-indigo-100 dark:border-indigo-900/50 text-3xl">
        🌐
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Nenhum site cadastrado
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        Adicione seus sites favoritos e tenha tudo em um único aplicativo.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={onAddFirstSite}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <Plus className="w-5 h-5" />
          <span>+ Adicionar primeiro site</span>
        </button>

        {onAddPopularDefaults && (
          <button
            onClick={onAddPopularDefaults}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Adicionar sites populares sugeridos</span>
          </button>
        )}
      </div>
    </div>
  );
};
