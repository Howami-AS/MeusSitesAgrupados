import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Edit2, Trash2, Check, Folder, AlertTriangle } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  siteCounts: Record<string, number>;
  onAddCategory: (name: string) => Promise<Category>;
  onRenameCategory: (id: string, newName: string) => Promise<Category>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  siteCounts,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setError(null);
    try {
      await onAddCategory(newCatName.trim());
      setNewCatName('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao adicionar categoria.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setError(null);
    try {
      await onRenameCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao renomear categoria.');
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setError(null);
    try {
      await onDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir categoria.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Gerenciar Categorias
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Add new category form */}
        <form onSubmit={handleAdd} className="p-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Criar nova categoria
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nome da nova categoria..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Categorias existentes ({categories.length})
          </p>

          {categories.map((cat) => {
            const count = siteCounts[cat.name] || 0;
            const isEditing = editingId === cat.id;
            const isDefaultOutros = cat.name === 'Outros';

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Salvar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({count} {count === 1 ? 'site' : 'sites'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition"
                        title="Renomear"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!isDefaultOutros && (
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition"
                          title="Excluir categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Category Confirmation Dialog */}
        {categoryToDelete && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border-t border-rose-200 dark:border-rose-900 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Excluir categoria <strong>"{categoryToDelete.name}"</strong>?
                {siteCounts[categoryToDelete.name] > 0 && (
                  <span className="block mt-0.5">
                    Seus {siteCounts[categoryToDelete.name]} sites serão movidos automaticamente para{' '}
                    <strong>"Outros"</strong>.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Excluir e Mover
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
