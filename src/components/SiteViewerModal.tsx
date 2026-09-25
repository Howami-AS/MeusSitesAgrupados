import React, { useState, useEffect, useRef } from 'react';
import { Site } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ExternalLink,
  Share2,
  X,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { getFaviconUrl } from '../utils/favicon';

interface SiteViewerModalProps {
  site: Site | null;
  onClose: () => void;
  onShare: (site: Site) => void;
}

export const SiteViewerModal: React.FC<SiteViewerModalProps> = ({
  site,
  onClose,
  onShare,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFrameBlockedHint, setHasFrameBlockedHint] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!site) return;
    setIsLoading(true);
    setHasFrameBlockedHint(false);
    setIframeKey((prev) => prev + 1);

    // Major sites that strictly send X-Frame-Options: SAMEORIGIN/DENY
    const knownStrictSites = [
      'google.com',
      'youtube.com',
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'x.com',
      'chatgpt.com',
      'openai.com',
      'linkedin.com',
      'github.com',
      'netflix.com',
      'amazon.com',
      'gmail.com',
      'drive.google.com',
    ];

    const isKnownStrict = knownStrictSites.some(
      (dom) => site.domain === dom || site.domain.endsWith(`.${dom}`)
    );

    if (isKnownStrict) {
      setHasFrameBlockedHint(true);
    }

    // Set a timer: if iframe takes long or is blocked silently by browser X-Frame-Options
    const timer = setTimeout(() => {
      setIsLoading(false);
      // If it's a known strict site or user might be seeing a blank screen, show banner
      if (isKnownStrict) {
        setHasFrameBlockedHint(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [site]);

  if (!site) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    // Open in native system browser
    window.open(site.url, '_blank', 'noopener,noreferrer');
  };

  const favicon = site.faviconUrl || getFaviconUrl(site.domain);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-100 select-none animate-in fade-in">
      {/* Top Browser Toolbar */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-md backdrop-blur-md">
        {/* Navigation Controls: Back, Forward, Reload, Home */}
        <div className="flex items-center gap-1">
          {/* Back button (returns to app) */}
          <button
            onClick={onClose}
            title="Voltar para Meus Sites"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Forward button */}
          <button
            onClick={() => {
              try {
                iframeRef.current?.contentWindow?.history.forward();
              } catch {
                // cross-origin restriction
              }
            }}
            title="Avançar"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 active:scale-95 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Reload button */}
          <button
            onClick={handleReload}
            title="Recarregar"
            className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition ${
              isLoading ? 'animate-spin text-indigo-400' : ''
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Home button */}
          <button
            onClick={onClose}
            title="Início (Meus Sites)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Address / Domain indicator */}
        <div className="flex-1 max-w-sm sm:max-w-md mx-1 sm:mx-2 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 truncate">
          <img src={favicon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
          <span className="text-xs font-medium text-slate-200 truncate">{site.name}</span>
          <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
            ({site.domain})
          </span>
        </div>

        {/* Action Controls: Open in Browser, Share, Close */}
        <div className="flex items-center gap-1">
          {/* Open in external browser */}
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abrir no navegador</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(site)}
            title="Compartilhar link"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Fechar visualizador"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Frame Notice / Security Policy Banner if strict or blocked */}
      {hasFrameBlockedHint && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Este site pode bloquear a exibição interna por políticas de segurança (X-Frame-Options).
            </span>
          </div>
          <button
            onClick={handleOpenExternal}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shrink-0"
          >
            Abrir no navegador ↗
          </button>
        </div>
      )}

      {/* Viewport Content */}
      <div className="relative flex-1 bg-white">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-300">Carregando {site.name}...</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={site.url}
          title={site.name}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          className="w-full h-full border-none"
        />

        {/* Fallback Overlay always accessible if user sees a blank or denied frame */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-20 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center justify-between gap-3 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Página em branco? Alguns sites exigem abertura externa.
              </p>
            </div>
            <button
              onClick={handleOpenExternal}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition active:scale-95 shrink-0"
            >
              Abrir no navegador ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
