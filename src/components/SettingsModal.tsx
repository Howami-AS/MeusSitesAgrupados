import React, { useRef, useState } from 'react';
import { ThemeMode, SortOption } from '../types';
import {
  X,
  Sun,
  Moon,
  Smartphone,
  ArrowUpDown,
  FolderCog,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenCategoryManager: () => void;
  onClearRecents: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string, mode: 'merge' | 'replace') => Promise<{ addedCount: number; skippedCount: number }>;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  sortOption,
  onSortChange,
  onOpenCategoryManager,
  onClearRecents,
  onExportBackup,
  onImportBackup,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content);
      setShowImportDialog(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!selectedFileContent) return;
    try {
      const result = await onImportBackup(selectedFileContent, importMode);
      setImportStatus(
        `Backup importado: ${result.addedCount} adicionados, ${result.skippedCount} ignorados (duplicados).`
      );
      setShowImportDialog(false);
      setSelectedFileContent(null);
    } catch (err: any) {
      setImportStatus(`Erro: ${err?.message || 'Arquivo inválido'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {importStatus && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {importStatus}
              </span>
              <button
                onClick={() => setImportStatus(null)}
                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* SECTION 1: Aparência */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Aparência
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onThemeChange('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition active:scale-95 ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-5 h-5 mb-1 text-amber-500" />
                <span>Claro</span>
              </button>

              <button
                onClick={() => onThemeChange('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition active:scale-95 ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-5 h-5 mb-1 text-indigo-400" />
                <span>Escuro</span>
              </button>

              <button
                onClick={() => onThemeChange('auto')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition active:scale-95 ${
                  theme === 'auto'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
                <span>Automático</span>
              </button>
            </div>
          </section>

          {/* SECTION 2: Sites & Organização */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Sites
            </h3>

            {/* Ordenação padrão */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <ArrowUpDown className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Ordenação dos sites
                  </p>
                  <p className="text-[11px] text-slate-400">Como os sites são listados</p>
                </div>
              </div>
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="recent">Mais recentes</option>
                <option value="name-asc">Nome A-Z</option>
                <option value="name-desc">Nome Z-A</option>
                <option value="most-accessed">Mais acessados</option>
                <option value="custom">Ordem personalizada</option>
              </select>
            </div>

            {/* Gerenciar categorias */}
            <button
              onClick={() => {
                onClose();
                onOpenCategoryManager();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <FolderCog className="w-4 h-4 text-cyan-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Gerenciar categorias
                  </p>
                  <p className="text-[11px] text-slate-400">Criar, renomear e excluir categorias</p>
                </div>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Abrir
              </span>
            </button>

            {/* Limpar recentes */}
            <button
              onClick={onClearRecents}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                <div>
                  <p className="text-xs font-semibold">Limpar histórico de recentes</p>
                  <p className="text-[11px] text-slate-400">Remove a lista de sites acessados ultimamente</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-rose-500">
                Limpar
              </span>
            </button>
          </section>

          {/* SECTION 3: Dados & Backup */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Dados
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Exportar Backup */}
              <button
                onClick={onExportBackup}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Exportar backup</span>
              </button>

              {/* Importar Backup */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Importar backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Limpar todos os dados */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Apagar todos os dados
              </span>
              <span className="text-[11px] underline">Redefinir</span>
            </button>
          </section>

          {/* SECTION 4: Aplicativo & Instalação */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Aplicativo
            </h3>

            <PWAInstallButton variant="settings" />

            {/* Privacidade */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold">Privacidade Total</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-tight">
                  Seus dados e sites cadastrados ficam 100% salvos no seu próprio aparelho (IndexedDB). Nenhum dado é enviado para servidores externos.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: Sobre & Rodapé Obrigatório */}
          <section className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-1 text-slate-500 dark:text-slate-400 text-xs">
            <div className="flex items-center justify-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
              <span>Meus Sites</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px]">Centralizador pessoal de sites.</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 pt-1">
              ©️ Alisson Salvador 2026
            </p>
          </section>
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition active:scale-95 shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* IMPORT BACKUP DIALOG */}
      {showImportDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Opções de Importação
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Como deseja importar os sites do arquivo selecionado?
            </p>

            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-indigo-600"
                />
                <div>
                  <p>Adicionar aos sites existentes</p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    Mantém seus sites atuais e adiciona os novos sem duplicar.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-indigo-600"
                />
                <div>
                  <p className="text-rose-600 dark:text-rose-400">Substituir sites existentes</p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    Substitui todos os sites e categorias pelo conteúdo do backup.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setSelectedFileContent(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL DATA DOUBLE CONFIRMATION DIALOG */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Apagar todos os dados?
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-6 leading-relaxed">
              "Isso excluirá todos os sites cadastrados e não poderá ser desfeito."
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Apagar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
