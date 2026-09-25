import React from 'react';
import { Search, Settings, Globe } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onToggleSearch,
  isSearchOpen,
  searchQuery,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Meus Sites
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Centralizador Pessoal
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Header PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Search Toggle Button */}
          <button
            onClick={onToggleSearch}
            aria-label="Pesquisar sites"
            className={`relative p-2.5 rounded-xl transition ${
              isSearchOpen || searchQuery
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 ring-2 ring-indigo-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-5 h-5" />
            {searchQuery && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Abrir configurações"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
