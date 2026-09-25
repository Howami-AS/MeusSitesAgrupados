import React from 'react';
import { Site } from '../types';
import { Clock, Trash2, Globe } from 'lucide-react';
import { getFaviconUrl, getFallbackColor } from '../utils/favicon';

interface RecentSitesProps {
  recentSites: Site[];
  onOpen: (site: Site) => void;
  onClearRecents: () => void;
}

export const RecentSites: React.FC<RecentSitesProps> = ({
  recentSites,
  onOpen,
  onClearRecents,
}) => {
  if (recentSites.length === 0) return null;

  return (
    <section className="mb-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recentes
          </h2>
          <span className="text-xs text-slate-400 font-medium">({recentSites.length})</span>
        </div>

        <button
          onClick={onClearRecents}
          title="Limpar sites recentes"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {recentSites.map((site) => {
          const faviconUrl = site.faviconUrl || getFaviconUrl(site.domain);
          const fallbackColor = getFallbackColor(site.name || site.domain);
          const initial = (site.name || site.domain).charAt(0).toUpperCase();

          return (
            <button
              key={`recent-${site.id}`}
              onClick={() => onOpen(site)}
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs hover:shadow-xs transition active:scale-95 group text-left max-w-[170px]"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0">
                <img
                  src={faviconUrl}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.className = `w-7 h-7 rounded-lg ${fallbackColor} text-white font-bold flex items-center justify-center text-xs`;
                      parent.innerText = initial;
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {site.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-none">
                  {site.domain}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
