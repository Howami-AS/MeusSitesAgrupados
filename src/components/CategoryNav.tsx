import React from 'react';
import { Category } from '../types';
import { Star, Globe, Plus, Settings2, Folder } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string; // 'all' | 'favorites' | categoryName
  onSelectCategory: (cat: string) => void;
  onOpenCategoryManager: () => void;
  onOpenAddCategory: () => void;
  siteCounts: Record<string, number>;
  totalSites: number;
  totalFavorites: number;
  mode?: 'mobile' | 'desktop';
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenCategoryManager,
  onOpenAddCategory,
  siteCounts,
  totalSites,
  totalFavorites,
  mode = 'mobile',
}) => {
  if (mode === 'desktop') {
    return (
      <aside className="w-64 shrink-0 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Categorias
            </span>
            <button
              onClick={onOpenCategoryManager}
              title="Gerenciar categorias"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {/* All sites */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Globe className="w-4 h-4 shrink-0 opacity-80" />
                <span className="truncate">Todos os sites</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {totalSites}
              </span>
            </button>

            {/* Favorites */}
            <button
              onClick={() => onSelectCategory('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === 'favorites'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Star
                  className={`w-4 h-4 shrink-0 ${
                    selectedCategory === 'favorites' ? 'fill-white' : 'fill-amber-400 text-amber-500'
                  }`}
                />
                <span className="truncate">Favoritos</span>
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === 'favorites'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {totalFavorites}
              </span>
            </button>

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            {/* Category items */}
            {categories.map((cat) => {
              const count = siteCounts[cat.name] || 0;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenAddCategory}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova categoria
          </button>
        </div>
      </aside>
    );
  }

  // Mobile horizontal chip bar
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-4 sm:px-6 flex items-center gap-2">
      {/* All */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
          selectedCategory === 'all'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
        }`}
      >
        <Globe className="w-3.5 h-3.5 opacity-80" />
        <span>Todos ({totalSites})</span>
      </button>

      {/* Favorites */}
      <button
        onClick={() => onSelectCategory('favorites')}
        className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
          selectedCategory === 'favorites'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
        }`}
      >
        <Star
          className={`w-3.5 h-3.5 ${
            selectedCategory === 'favorites' ? 'fill-white' : 'fill-amber-400 text-amber-500'
          }`}
        />
        <span>Favoritos ({totalFavorites})</span>
      </button>

      {/* Category Pills */}
      {categories.map((cat) => {
        const count = siteCounts[cat.name] || 0;
        const isSelected = selectedCategory === cat.name;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* Quick Add / Manage Button */}
      <button
        onClick={onOpenCategoryManager}
        title="Gerenciar categorias"
        className="shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
