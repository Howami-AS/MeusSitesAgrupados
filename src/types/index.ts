export interface Site {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  isFavorite: boolean;
  order: number;
  accessCount: number;
  lastAccessedAt: number | null;
  createdAt: number;
  faviconUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'recent'
  | 'most-accessed'
  | 'custom';

export interface AppSettings {
  theme: ThemeMode;
  defaultSort: SortOption;
  hasSeenOnboarding: boolean;
  openMode: 'viewer' | 'external';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  sites: Site[];
  categories: Category[];
  settings?: Partial<AppSettings>;
}
