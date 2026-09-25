import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Aplicativo já instalado no dispositivo
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          onClick={install}
          aria-label="Instalar aplicativo"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar app</span>
        </button>
      );
    }

    if (variant === 'banner') {
      return (
        <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Instale na sua tela inicial</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Acesse todos os seus sites com um toque</p>
            </div>
          </div>
          <button
            onClick={install}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shrink-0 active:scale-95"
          >
            Instalar
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
      >
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Instalar aplicativo na tela inicial
        </span>
        <span className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-semibold">
          Instalar
        </span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'header' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            aria-label="Instalar no iOS"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              Como instalar no iPhone / iPad
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Ver guia</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  📲 Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    No Safari, toque no botão <strong>Compartilhar</strong>{' '}
                    <Share2 className="w-4 h-4 inline text-blue-500 mx-0.5 align-text-bottom" /> na barra
                    inferior.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Role para baixo e toque em{' '}
                    <strong className="text-slate-900 dark:text-white">Adicionar à Tela de Início</strong>{' '}
                    <PlusSquare className="w-4 h-4 inline text-indigo-500 mx-0.5 align-text-bottom" />.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Toque em <strong className="text-slate-900 dark:text-white">Adicionar</strong> no canto
                    superior direito.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition active:scale-98 shadow-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for settings when not installable via event (e.g. desktop browser that already installed or doesn't support)
  if (variant === 'settings') {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Dica de instalação:</p>
        Abra o menu do navegador (três pontinhos ou botão de compartilhar) e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
      </div>
    );
  }

  return null;
};
