import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  isOpen: boolean;
  onClose: () => void;
  totalResults?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  isOpen,
  onClose,
  totalResults,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen && !query) return null;

  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-6 transition-all animate-in slide-in-from-top-2">
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Pesquisar sites por nome, domínio ou categoria..."
            aria-label="Pesquisar sites"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
        >
          Fechar
        </button>
      </div>

      {query && totalResults !== undefined && (
        <div className="max-w-6xl mx-auto pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            {totalResults === 0
              ? 'Nenhum site encontrado com este termo'
              : `${totalResults} ${totalResults === 1 ? 'site encontrado' : 'sites encontrados'}`}
          </span>
          <span className="text-[11px] opacity-75">Buscando em nome, domínio e categoria</span>
        </div>
      )}
    </div>
  );
};
