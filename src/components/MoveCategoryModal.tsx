import React from 'react';
import { Site, Category } from '../types';
import { X, FolderInput, Check } from 'lucide-react';

interface MoveCategoryModalProps {
  site: Site | null;
  categories: Category[];
  onClose: () => void;
  onSelectCategory: (siteId: string, newCategory: string) => Promise<void>;
}

export const MoveCategoryModal: React.FC<MoveCategoryModalProps> = ({
  site,
  categories,
  onClose,
  onSelectCategory,
}) => {
  if (!site) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderInput className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Mover para categoria
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 px-2">
            Selecione a categoria para <strong className="text-slate-900 dark:text-white">{site.name}</strong>:
          </p>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {categories.map((cat) => {
              const isCurrent = site.category === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={async () => {
                    await onSelectCategory(site.id, cat.name);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isCurrent && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
