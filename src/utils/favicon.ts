/**
 * URL normalization, validation, and Favicon resolution utilities
 */

export function normalizeUrl(input: string): { url: string; error?: string } {
  let trimmed = input.trim();
  if (!trimmed) {
    return { url: '', error: 'Por favor, insira o endereço do site.' };
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Basic check for dot in hostname unless localhost
    if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      return { url: '', error: 'Endereço inválido. Exemplo: youtube.com ou https://site.com' };
    }
    return { url: parsed.toString() };
  } catch {
    return { url: '', error: 'Endereço de site inválido.' };
  }
}

export function extractDomain(urlStr: string): string {
  try {
    let clean = urlStr.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return urlStr;
  }
}

export function getFaviconUrl(domain: string): string {
  if (!domain) return '';
  // Google S2 high-res favicon service
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

// Generate consistent background color for domain fallback
const BADGE_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-fuchsia-600',
  'bg-sky-600',
];

export function getFallbackColor(nameOrDomain: string): string {
  let hash = 0;
  for (let i = 0; i < nameOrDomain.length; i++) {
    hash = nameOrDomain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_COLORS.length;
  return BADGE_COLORS[index];
}
