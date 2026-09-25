/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Site, Category, SortOption } from './types';
import {
  getAllSites,
  getAllCategories,
  addSite,
  updateSite,
  deleteSite,
  recordSiteAccess,
  clearRecentSites,
  reorderSites,
  addCategory,
  renameCategory,
  deleteCategory,
  getSetting,
  setSetting,
  exportBackup,
  importBackup,
  clearAllData,
  initDatabaseDefaults,
} from './services/db';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { RecentSites } from './components/RecentSites';
import { SiteCard } from './components/SiteCard';
import { AddEditSiteModal } from './components/AddEditSiteModal';
import { SiteViewerModal } from './components/SiteViewerModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { MoveCategoryModal } from './components/MoveCategoryModal';
import { SettingsModal } from './components/SettingsModal';
import { FirstRunModal } from './components/FirstRunModal';
import { ConfirmModal } from './components/ConfirmModal';
import { EmptyState } from './components/EmptyState';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Plus, Star, Globe, ArrowUpDown, CheckCircle } from 'lucide-react';

export default function App() {
  const { theme, setTheme } = useTheme();

  // State
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [viewerSite, setViewerSite] = useState<Site | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [moveCategorySite, setMoveCategorySite] = useState<Site | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [showFirstRun, setShowFirstRun] = useState(false);
  const [sharedUrlInitial, setSharedUrlInitial] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Initial load
  const loadData = useCallback(async () => {
    try {
      await initDatabaseDefaults();
      const [storedSites, storedCats, defaultSort, hasSeenOnboarding] = await Promise.all([
        getAllSites(),
        getAllCategories(),
        getSetting<SortOption>('defaultSort'),
        getSetting<boolean>('hasSeenOnboarding'),
      ]);

      setSites(storedSites);
      setCategories(storedCats);
      if (defaultSort) setSortOption(defaultSort);

      if (!hasSeenOnboarding && storedSites.length === 0) {
        setShowFirstRun(true);
      }
    } catch (err) {
      console.error('Error loading database data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Check for incoming share target parameters in URL
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (sharedUrl && (sharedUrl.startsWith('http') || sharedUrl.includes('.'))) {
      setSharedUrlInitial(sharedUrl);
      setIsAddEditOpen(true);
      // Clean query params so refresh doesn't reopen
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loadData]);

  // Site Counts per category
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.name] = 0;
    }
    for (const site of sites) {
      const cat = site.category || 'Outros';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [sites, categories]);

  const totalFavorites = useMemo(
    () => sites.filter((s) => s.isFavorite).length,
    [sites]
  );

  // Recents list
  const recentSites = useMemo(() => {
    return sites
      .filter((s) => s.lastAccessedAt !== null)
      .sort((a, b) => (b.lastAccessedAt || 0) - (a.lastAccessedAt || 0))
      .slice(0, 10);
  }, [sites]);

  // Favorite sites list (for dedicated favorites section when in 'all')
  const favoriteSites = useMemo(() => {
    return sites.filter((s) => s.isFavorite);
  }, [sites]);

  // Filtered & Sorted sites
  const processedSites = useMemo(() => {
    let list = [...sites];

    // Filter by Category
    if (selectedCategory === 'favorites') {
      list = list.filter((s) => s.isFavorite);
    } else if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q) ||
          s.url.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortOption) {
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' }));
        break;
      case 'most-accessed':
        list.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
        break;
      case 'custom':
        list.sort((a, b) => a.order - b.order);
        break;
      case 'recent':
      default:
        list.sort((a, b) => {
          const timeA = a.lastAccessedAt || a.createdAt;
          const timeB = b.lastAccessedAt || b.createdAt;
          return timeB - timeA;
        });
        break;
    }

    return list;
  }, [sites, selectedCategory, searchQuery, sortOption]);

  // Handlers
  const handleOpenSite = async (site: Site) => {
    try {
      await recordSiteAccess(site.id);
      // update state locally
      setSites((prev) =>
        prev.map((s) =>
          s.id === site.id
            ? { ...s, accessCount: (s.accessCount || 0) + 1, lastAccessedAt: Date.now() }
            : s
        )
      );
    } catch (err) {
      console.error(err);
    }

    // Open viewer modal
    setViewerSite(site);
  };

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const site = sites.find((s) => s.id === id);
    if (!site) return;

    const newFav = !site.isFavorite;
    try {
      await updateSite(id, { isFavorite: newFav });
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isFavorite: newFav } : s))
      );
      showToast(newFav ? `⭐ "${site.name}" favoritado` : `Removido dos favoritos`);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao alterar favorito');
    }
  };

  const handleSaveSite = async (data: {
    name: string;
    url: string;
    category: string;
    isFavorite: boolean;
  }) => {
    if (siteToEdit) {
      const updated = await updateSite(siteToEdit.id, data);
      setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(`Site "${updated.name}" atualizado.`);
    } else {
      const added = await addSite(data);
      setSites((prev) => [added, ...prev]);
      showToast(`Site "${added.name}" adicionado com sucesso!`);
    }
  };

  const handleDeleteSite = async (site: Site) => {
    try {
      await deleteSite(site.id);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
      showToast(`Site "${site.name}" excluído.`);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao excluir site.');
    }
  };

  const handleMoveCategory = async (siteId: string, newCategory: string) => {
    try {
      const updated = await updateSite(siteId, { category: newCategory });
      setSites((prev) => prev.map((s) => (s.id === siteId ? updated : s)));
      showToast(`Site movido para "${newCategory}".`);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao mover site.');
    }
  };

  const handleShare = async (site: Site) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: site.name,
          text: `Acesse ${site.name}:`,
          url: site.url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(site.url);
        showToast('Link copiado para a área de transferência!');
      } catch {
        showToast(site.url);
      }
    }
  };

  const handleClearRecents = async () => {
    await clearRecentSites();
    setSites((prev) => prev.map((s) => ({ ...s, lastAccessedAt: null })));
    showToast('Histórico de recentes limpo.');
  };

  const handleSortChange = async (newSort: SortOption) => {
    setSortOption(newSort);
    await setSetting('defaultSort', newSort);
  };

  const handleReorderMove = async (siteId: string, direction: 'up' | 'down') => {
    const currentIndex = processedSites.findIndex((s) => s.id === siteId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= processedSites.length) return;

    const newList = [...processedSites];
    const [moved] = newList.splice(currentIndex, 1);
    newList.splice(targetIndex, 0, moved);

    const orderedIds = newList.map((s) => s.id);
    await reorderSites(orderedIds);
    setSites((prev) => {
      const map = new Map(orderedIds.map((id, idx) => [id, idx]));
      return [...prev].map((s) => ({
        ...s,
        order: map.has(s.id) ? (map.get(s.id) as number) : s.order,
      }));
    });
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-sites-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup exportado com sucesso!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao exportar backup');
    }
  };

  const handleImportBackup = async (
    jsonContent: string,
    mode: 'merge' | 'replace'
  ) => {
    const result = await importBackup(jsonContent, mode);
    await loadData();
    showToast(`Backup restaurado! ${result.addedCount} sites carregados.`);
    return result;
  };

  const handleClearAllData = async () => {
    await clearAllData();
    await loadData();
    showToast('Todos os dados foram apagados.');
  };

  // Add popular presets (first run helper)
  const handleAddPopularDefaults = async () => {
    const defaults = [
      { name: 'YouTube', url: 'https://youtube.com', category: 'Entretenimento', isFavorite: true },
      { name: 'ChatGPT', url: 'https://chatgpt.com', category: 'Ferramentas', isFavorite: true },
      { name: 'Gmail', url: 'https://gmail.com', category: 'Trabalho', isFavorite: true },
      { name: 'Instagram', url: 'https://instagram.com', category: 'Redes sociais', isFavorite: false },
      { name: 'Google Drive', url: 'https://drive.google.com', category: 'Trabalho', isFavorite: false },
      { name: 'G1 Notícias', url: 'https://g1.globo.com', category: 'Notícias', isFavorite: false },
    ];

    for (const d of defaults) {
      try {
        await addSite(d);
      } catch {
        // ignore duplicate
      }
    }
    await setSetting('hasSeenOnboarding', true);
    setShowFirstRun(false);
    await loadData();
    showToast('Sites populares adicionados!');
  };

  const handleAddCategoryInline = async (name: string): Promise<Category> => {
    const created = await addCategory(name);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const handleRenameCategory = async (id: string, newName: string): Promise<Category> => {
    const renamed = await renameCategory(id, newName);
    setCategories((prev) => prev.map((c) => (c.id === id ? renamed : c)));
    await loadData();
    return renamed;
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    await loadData();
    showToast('Categoria excluída e sites movidos para "Outros".');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Carregando Meus Sites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 px-4 py-2 rounded-2xl text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSearch={() => {
          setIsSearchOpen((prev) => !prev);
          if (isSearchOpen && searchQuery) setSearchQuery('');
        }}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
      />

      {/* Expandable Search Bar */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        totalResults={processedSites.length}
      />

      {/* Mobile Category Chips (hidden on desktop) */}
      <div className="md:hidden pt-2">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onOpenAddCategory={() => setIsCategoryManagerOpen(true)}
          siteCounts={siteCounts}
          totalSites={sites.length}
          totalFavorites={totalFavorites}
          mode="mobile"
        />
      </div>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 flex-1">
        {/* Responsive Desktop Layout: Sidebar + Grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop Left Sidebar: Categorias */}
          <div className="hidden md:block">
            <CategoryNav
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
              onOpenAddCategory={() => setIsCategoryManagerOpen(true)}
              siteCounts={siteCounts}
              totalSites={sites.length}
              totalFavorites={totalFavorites}
              mode="desktop"
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {/* Recent Sites Section (Shown when no search query and on 'all' view) */}
            {!searchQuery && selectedCategory === 'all' && recentSites.length > 0 && (
              <RecentSites
                recentSites={recentSites}
                onOpen={handleOpenSite}
                onClearRecents={handleClearRecents}
              />
            )}

            {/* List Controls: Active Category Title + Sort Selector */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedCategory === 'all' && 'Todos os sites'}
                  {selectedCategory === 'favorites' && '⭐ Favoritos'}
                  {selectedCategory !== 'all' && selectedCategory !== 'favorites' && selectedCategory}
                </h2>
                <span className="text-xs text-slate-400 font-semibold">
                  ({processedSites.length})
                </span>
              </div>

              {/* Sort Selector Button / Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  aria-label="Ordenar sites"
                  className="bg-transparent font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none cursor-pointer"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="name-asc">Nome A-Z</option>
                  <option value="name-desc">Nome Z-A</option>
                  <option value="most-accessed">Mais acessados</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>
            </div>

            {/* Site Cards Grid */}
            {processedSites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {processedSites.map((site, index) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    onOpen={handleOpenSite}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={(s) => {
                      setSiteToEdit(s);
                      setIsAddEditOpen(true);
                    }}
                    onDelete={(s) => setSiteToDelete(s)}
                    onMoveCategory={(s) => setMoveCategorySite(s)}
                    onShare={handleShare}
                    isCustomOrder={sortOption === 'custom'}
                    onMoveUp={(id) => handleReorderMove(id, 'up')}
                    onMoveDown={(id) => handleReorderMove(id, 'down')}
                    canMoveUp={index > 0}
                    canMoveDown={index < processedSites.length - 1}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                onAddFirstSite={() => {
                  setSiteToEdit(null);
                  setIsAddEditOpen(true);
                }}
                onAddPopularDefaults={sites.length === 0 ? handleAddPopularDefaults : undefined}
                isFiltered={sites.length > 0}
                onClearFilters={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB): + Adicionar site */}
      <button
        onClick={() => {
          setSiteToEdit(null);
          setSharedUrlInitial(undefined);
          setIsAddEditOpen(true);
        }}
        aria-label="Adicionar site"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* MODALS */}

      {/* Add / Edit Site Modal */}
      <AddEditSiteModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setSiteToEdit(null);
          setSharedUrlInitial(undefined);
        }}
        onSave={handleSaveSite}
        siteToEdit={siteToEdit}
        categories={categories}
        existingSites={sites}
        onAddNewCategoryInline={handleAddCategoryInline}
        initialSharedUrl={sharedUrlInitial}
      />

      {/* Site In-App Viewer Simulation */}
      <SiteViewerModal
        site={viewerSite}
        onClose={() => setViewerSite(null)}
        onShare={handleShare}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        siteCounts={siteCounts}
        onAddCategory={handleAddCategoryInline}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Move Category Modal */}
      <MoveCategoryModal
        site={moveCategorySite}
        categories={categories}
        onClose={() => setMoveCategorySite(null)}
        onSelectCategory={handleMoveCategory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onClearRecents={handleClearRecents}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllData}
      />

      {/* First Run Onboarding Modal */}
      <FirstRunModal
        isOpen={showFirstRun}
        onStart={async () => {
          await setSetting('hasSeenOnboarding', true);
          setShowFirstRun(false);
          setIsAddEditOpen(true);
        }}
        onAddPopularDefaults={handleAddPopularDefaults}
      />

      {/* Confirm Delete Site Modal */}
      <ConfirmModal
        isOpen={!!siteToDelete}
        onClose={() => setSiteToDelete(null)}
        onConfirm={() => {
          if (siteToDelete) {
            handleDeleteSite(siteToDelete);
            setSiteToDelete(null);
          }
        }}
        title="Excluir este site?"
        message={`Tem certeza que deseja excluir "${siteToDelete?.name}"? Esta ação removerá o site da sua lista.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
      />

      {/* Offline Status Indicator Toast */}
      <OfflineIndicator />
    </div>
  );
}
