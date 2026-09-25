import React, { useState } from 'react';
import { Site } from '../types';
import {
  Star,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  FolderInput,
  ArrowUp,
  ArrowDown,
  Globe,
} from 'lucide-react';
import { getFaviconUrl, getFallbackColor } from '../utils/favicon';

interface SiteCardProps {
  site: Site;
  onOpen: (site: Site) => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  onMoveCategory: (site: Site) => void;
  onShare: (site: Site) => void;
  isCustomOrder?: boolean;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onOpen,
  onToggleFavorite,
  onEdit,
  onDelete,
  onMoveCategory,
  onShare,
  isCustomOrder = false,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const faviconUrl = site.faviconUrl || getFaviconUrl(site.domain);
  const fallbackColor = getFallbackColor(site.name || site.domain);
  const initial = (site.name || site.domain).charAt(0).toUpperCase();

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking menu trigger or interactive element, ignore
    if ((e.target as HTMLElement).closest('.interactive-action')) {
      return;
    }
    onOpen(site);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] cursor-pointer select-none"
    >
      {/* Top row: Favicon + Actions */}
      <div className="flex items-start justify-between gap-3">
        {/* Favicon or Fallback Avatar */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-200">
          {!imageError ? (
            <img
              src={faviconUrl}
              alt={site.name}
              onError={() => setImageError(true)}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          ) : (
            <div
              className={`w-full h-full rounded-lg ${fallbackColor} text-white font-bold flex items-center justify-center text-lg`}
            >
              {initial || <Globe className="w-5 h-5" />}
            </div>
          )}
        </div>

        {/* Favorite & Menu Buttons */}
        <div className="flex items-center gap-1 interactive-action">
          {/* Custom order up/down arrows if enabled */}
          {isCustomOrder && (
            <div className="flex items-center mr-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                disabled={!canMoveUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.(site.id);
                }}
                className={`p-1 rounded ${
                  canMoveUp
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Mover para cima"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={!canMoveDown}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.(site.id);
                }}
                className={`p-1 rounded ${
                  canMoveDown
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Mover para baixo"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Star Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(site.id, e);
            }}
            aria-label={site.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition active:scale-90"
          >
            <Star
              className={`w-4 h-4 transition ${
                site.isFavorite
                  ? 'fill-amber-400 text-amber-500 scale-110'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>

          {/* ⋮ Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              aria-label="Opções do site"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700 dark:text-slate-200"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpen(site);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium transition text-left"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-500" />
                    Abrir site
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(site);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium transition text-left"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleFavorite(site.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium transition text-left"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        site.isFavorite
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-amber-500'
                      }`}
                    />
                    {site.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onMoveCategory(site);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium transition text-left"
                  >
                    <FolderInput className="w-4 h-4 text-cyan-500" />
                    Mover categoria
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onShare(site);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium transition text-left"
                  >
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    Compartilhar
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(site);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info: Name & Domain */}
      <div className="mt-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 leading-snug">
          {site.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {site.domain}
        </p>
      </div>

      {/* Category Tag & Access stats */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="truncate max-w-[120px] font-medium bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
          {site.category}
        </span>
        {site.accessCount > 0 && (
          <span className="text-[10px] opacity-75">
            {site.accessCount} {site.accessCount === 1 ? 'acesso' : 'acessos'}
          </span>
        )}
      </div>
    </div>
  );
};
