import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Site, Category, AppSettings, BackupData } from '../types';
import { extractDomain, normalizeUrl } from '../utils/favicon';

interface MeusSitesDB extends DBSchema {
  sites: {
    key: string;
    value: Site;
    indexes: {
      'by-category': string;
      'by-favorite': number;
      'by-order': number;
      'by-url': string;
      'by-last-accessed': number;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'meus_sites_db';
const DB_VERSION = 1;

export const INITIAL_CATEGORIES = [
  'Trabalho',
  'Estudos',
  'Entretenimento',
  'Redes sociais',
  'Notícias',
  'Compras',
  'Ferramentas',
  'Outros',
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  defaultSort: 'recent',
  hasSeenOnboarding: false,
  openMode: 'viewer',
};

let dbPromise: Promise<IDBPDatabase<MeusSitesDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MeusSitesDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MeusSitesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sites Store
        if (!db.objectStoreNames.contains('sites')) {
          const siteStore = db.createObjectStore('sites', { keyPath: 'id' });
          siteStore.createIndex('by-category', 'category');
          siteStore.createIndex('by-favorite', 'isFavorite');
          siteStore.createIndex('by-order', 'order');
          siteStore.createIndex('by-url', 'url');
          siteStore.createIndex('by-last-accessed', 'lastAccessedAt');
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Seed default categories if none exist
export async function initDatabaseDefaults(): Promise<void> {
  const db = await getDB();
  const catCount = await db.count('categories');
  if (catCount === 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const name of INITIAL_CATEGORIES) {
      await tx.store.add({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        isDefault: true,
      });
    }
    await tx.done;
  }
}

// Canonicalize URL to detect duplicates regardless of trailing slash or protocol case
export function canonicalizeUrl(urlStr: string): string {
  try {
    let clean = urlStr.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    const u = new URL(clean);
    let pathname = u.pathname.replace(/\/+$/, '');
    if (!pathname) pathname = '';
    return `${u.protocol}//${u.host.toLowerCase()}${pathname}${u.search}`;
  } catch {
    return urlStr.trim().toLowerCase();
  }
}

// SITES OPERATIONS
export async function getAllSites(): Promise<Site[]> {
  const db = await getDB();
  return db.getAll('sites');
}

export async function addSite(data: {
  name: string;
  url: string;
  category: string;
  isFavorite?: boolean;
}): Promise<Site> {
  const db = await getDB();
  const normalized = normalizeUrl(data.url);
  if (normalized.error || !normalized.url) {
    throw new Error(normalized.error || 'URL inválida.');
  }

  const targetCanon = canonicalizeUrl(normalized.url);
  const existingSites = await db.getAll('sites');
  
  // Check duplicates
  const isDuplicate = existingSites.some(
    s => canonicalizeUrl(s.url) === targetCanon
  );
  if (isDuplicate) {
    throw new Error('Este site já está cadastrado.');
  }

  const domain = extractDomain(normalized.url);
  const now = Date.now();
  const newSite: Site = {
    id: `site_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim() || domain,
    url: normalized.url,
    domain,
    category: data.category || 'Outros',
    isFavorite: !!data.isFavorite,
    order: existingSites.length,
    accessCount: 0,
    lastAccessedAt: null,
    createdAt: now,
  };

  await db.put('sites', newSite);
  return newSite;
}

export async function updateSite(
  id: string,
  updates: Partial<Omit<Site, 'id' | 'createdAt'>>
): Promise<Site> {
  const db = await getDB();
  const existing = await db.get('sites', id);
  if (!existing) {
    throw new Error('Site não encontrado.');
  }

  if (updates.url && updates.url !== existing.url) {
    const normalized = normalizeUrl(updates.url);
    if (normalized.error || !normalized.url) {
      throw new Error(normalized.error || 'URL inválida.');
    }
    const targetCanon = canonicalizeUrl(normalized.url);
    const all = await db.getAll('sites');
    const duplicate = all.some(
      s => s.id !== id && canonicalizeUrl(s.url) === targetCanon
    );
    if (duplicate) {
      throw new Error('Este site já está cadastrado.');
    }
    updates.url = normalized.url;
    updates.domain = extractDomain(normalized.url);
  }

  const updated: Site = {
    ...existing,
    ...updates,
  };

  await db.put('sites', updated);
  return updated;
}

export async function deleteSite(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sites', id);
}

export async function recordSiteAccess(id: string): Promise<void> {
  const db = await getDB();
  const site = await db.get('sites', id);
  if (!site) return;

  site.accessCount = (site.accessCount || 0) + 1;
  site.lastAccessedAt = Date.now();
  await db.put('sites', site);
}

export async function clearRecentSites(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sites', 'readwrite');
  const all = await tx.store.getAll();
  for (const site of all) {
    site.lastAccessedAt = null;
    await tx.store.put(site);
  }
  await tx.done;
}

export async function reorderSites(orderedIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sites', 'readwrite');
  for (let i = 0; i < orderedIds.length; i++) {
    const site = await tx.store.get(orderedIds[i]);
    if (site) {
      site.order = i;
      await tx.store.put(site);
    }
  }
  await tx.done;
}

// CATEGORIES OPERATIONS
export async function getAllCategories(): Promise<Category[]> {
  await initDatabaseDefaults();
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCategory(name: string): Promise<Category> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('O nome da categoria não pode ser vazio.');
  }

  const db = await getDB();
  const categories = await db.getAll('categories');
  const exists = categories.some(
    c => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    throw new Error('Já existe uma categoria com este nome.');
  }

  const newCat: Category = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
  };

  await db.put('categories', newCat);
  return newCat;
}

export async function renameCategory(id: string, newName: string): Promise<Category> {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error('O nome da categoria não pode ser vazio.');
  }

  const db = await getDB();
  const cat = await db.get('categories', id);
  if (!cat) {
    throw new Error('Categoria não encontrada.');
  }

  const oldName = cat.name;
  cat.name = trimmed;
  await db.put('categories', cat);

  // Update all sites that had this category name
  const tx = db.transaction('sites', 'readwrite');
  const sites = await tx.store.getAll();
  for (const site of sites) {
    if (site.category === oldName) {
      site.category = trimmed;
      await tx.store.put(site);
    }
  }
  await tx.done;

  return cat;
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  const cat = await db.get('categories', id);
  if (!cat) return;

  if (cat.name === 'Outros') {
    throw new Error('A categoria "Outros" é padrão e não pode ser excluída.');
  }

  // Delete category from store
  await db.delete('categories', id);

  // Move all sites belonging to this category automatically to "Outros"
  const tx = db.transaction('sites', 'readwrite');
  const sites = await tx.store.getAll();
  for (const site of sites) {
    if (site.category === cat.name) {
      site.category = 'Outros';
      await tx.store.put(site);
    }
  }
  await tx.done;
}

// SETTINGS OPERATIONS
export async function getSetting<T>(key: keyof AppSettings): Promise<T> {
  const db = await getDB();
  const record = await db.get('settings', key);
  if (record !== undefined && record !== null) {
    return record.value as T;
  }
  return DEFAULT_SETTINGS[key] as T;
}

export async function setSetting<T>(key: keyof AppSettings, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// BACKUP & RESTORE
export async function exportBackup(): Promise<string> {
  const db = await getDB();
  const sites = await db.getAll('sites');
  const categories = await db.getAll('categories');

  const backupData: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    sites: sites.map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      domain: s.domain,
      category: s.category,
      isFavorite: s.isFavorite,
      order: s.order,
      accessCount: s.accessCount,
      lastAccessedAt: s.lastAccessedAt,
      createdAt: s.createdAt,
      faviconUrl: s.faviconUrl,
    })),
    categories,
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importBackup(
  jsonString: string,
  mode: 'merge' | 'replace'
): Promise<{ addedCount: number; skippedCount: number }> {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Arquivo JSON de backup inválido.');
  }

  if (!parsed || !Array.isArray(parsed.sites)) {
    throw new Error('Formato de backup inválido: lista de sites não encontrada.');
  }

  const db = await getDB();

  if (mode === 'replace') {
    // Clear existing sites
    await db.clear('sites');
    if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      await db.clear('categories');
      const catTx = db.transaction('categories', 'readwrite');
      for (const cat of parsed.categories) {
        if (cat && cat.name) {
          await catTx.store.put({
            id: cat.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: cat.name,
            isDefault: !!cat.isDefault,
          });
        }
      }
      await catTx.done;
    }
  }

  const existingSites = await db.getAll('sites');
  const existingUrls = new Set(existingSites.map(s => canonicalizeUrl(s.url)));

  let addedCount = 0;
  let skippedCount = 0;

  const siteTx = db.transaction('sites', 'readwrite');
  for (const s of parsed.sites) {
    if (!s || !s.url) {
      skippedCount++;
      continue;
    }

    const norm = normalizeUrl(s.url);
    if (norm.error || !norm.url) {
      skippedCount++;
      continue;
    }

    const canon = canonicalizeUrl(norm.url);
    if (existingUrls.has(canon)) {
      skippedCount++;
      continue;
    }

    existingUrls.add(canon);
    const domain = s.domain || extractDomain(norm.url);
    const newSite: Site = {
      id: s.id || `site_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: s.name || domain,
      url: norm.url,
      domain,
      category: s.category || 'Outros',
      isFavorite: !!s.isFavorite,
      order: typeof s.order === 'number' ? s.order : existingSites.length + addedCount,
      accessCount: typeof s.accessCount === 'number' ? s.accessCount : 0,
      lastAccessedAt: s.lastAccessedAt || null,
      createdAt: s.createdAt || Date.now(),
      faviconUrl: s.faviconUrl,
    };

    await siteTx.store.put(newSite);
    addedCount++;
  }
  await siteTx.done;

  return { addedCount, skippedCount };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('sites');
  await db.clear('categories');
  await db.clear('settings');
  await initDatabaseDefaults();
}
