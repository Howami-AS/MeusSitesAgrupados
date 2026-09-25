import React, { useState, useEffect } from 'react';
import { Site, Category } from '../types';
import { X, Star, Plus, Globe, Check, AlertCircle } from 'lucide-react';
import { normalizeUrl, extractDomain } from '../utils/favicon';
import { canonicalizeUrl } from '../services/db';

interface AddEditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    url: string;
    category: string;
    isFavorite: boolean;
  }) => Promise<void>;
  siteToEdit?: Site | null;
  categories: Category[];
  existingSites: Site[];
  onAddNewCategoryInline: (name: string) => Promise<Category>;
  initialSharedUrl?: string;
}

export const AddEditSiteModal: React.FC<AddEditSiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  siteToEdit,
  categories,
  existingSites,
  onAddNewCategoryInline,
  initialSharedUrl,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick inline new category state
  const [isCreatingNewCat, setIsCreatingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (siteToEdit) {
      setName(siteToEdit.name);
      setUrl(siteToEdit.url);
      setCategory(siteToEdit.category || 'Outros');
      setIsFavorite(siteToEdit.isFavorite);
    } else {
      setName('');
      setUrl(initialSharedUrl || '');
      setCategory(categories[0]?.name || 'Outros');
      setIsFavorite(false);
      if (initialSharedUrl) {
        const domain = extractDomain(initialSharedUrl);
        setName(domain.split('.')[0]?.toUpperCase() || '');
      }
    }
    setError(null);
    setIsCreatingNewCat(false);
    setNewCatName('');
  }, [siteToEdit, isOpen, initialSharedUrl, categories]);

  if (!isOpen) return null;

  // Auto-fill name based on domain when typing URL if name is currently blank
  const handleUrlBlur = () => {
    if (!url.trim()) return;
    const norm = normalizeUrl(url);
    if (!norm.error && norm.url) {
      setUrl(norm.url); // Format with https://
      if (!name.trim()) {
        const dom = extractDomain(norm.url);
        // capitalize nicely
        const guess = dom.split('.')[0];
        if (guess) {
          setName(guess.charAt(0).toUpperCase() + guess.slice(1));
        }
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const created = await onAddNewCategoryInline(newCatName.trim());
      setCategory(created.name);
      setIsCreatingNewCat(false);
      setNewCatName('');
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar categoria.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const norm = normalizeUrl(url);
    if (norm.error || !norm.url) {
      setError(norm.error || 'Por favor, informe uma URL válida.');
      return;
    }

    const canon = canonicalizeUrl(norm.url);
    // Duplicate URL check
    const isDuplicate = existingSites.some((s) => {
      if (siteToEdit && s.id === siteToEdit.id) return false;
      return canonicalizeUrl(s.url) === canon;
    });

    if (isDuplicate) {
      setError('Este site já está cadastrado.');
      return;
    }

    const finalName = name.trim() || extractDomain(norm.url);
    const finalCategory = category || 'Outros';

    setIsSaving(true);
    try {
      await onSave({
        name: finalName,
        url: norm.url,
        category: finalCategory,
        isFavorite,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar site.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {siteToEdit ? 'Editar site' : 'Adicionar site'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* URL Field */}
          <div>
            <label
              htmlFor="site-url"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              URL do site <span className="text-rose-500">*</span>
            </label>
            <input
              id="site-url"
              type="text"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onBlur={handleUrlBlur}
              placeholder="ex: youtube.com ou https://site.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Se digitar sem https://, completamos automaticamente.
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="site-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Nome do site
            </label>
            <input
              id="site-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: YouTube"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Category Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="site-category"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Categoria
              </label>
              {!isCreatingNewCat && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewCat(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  Nova
                </button>
              )}
            </div>

            {isCreatingNewCat ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Criar nova categoria:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nome da categoria..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewCat(false);
                      setNewCatName('');
                    }}
                    className="px-2 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <select
                id="site-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Favorite Switch */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2.5 font-medium text-sm">
                <Star
                  className={`w-5 h-5 transition ${
                    isFavorite
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                Marcar como Favorito
              </span>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  isFavorite ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isFavorite ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar site'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
