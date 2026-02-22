export interface PageMetadata {
  title: string;
  image: string | null;
  description: string | null;
  favicon: string | null;
}

interface CachedMetadataEntry {
  metadata: PageMetadata;
  expiresAt: number;
}

interface CachedFaviconEntry {
  dataUrl: string;
  expiresAt: number;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const METADATA_CACHE_STORAGE_KEY = 'stash_metadata_cache_v1';
const FAVICON_CACHE_STORAGE_KEY = 'stash_favicon_cache_v1';
const metadataMemoryCache = new Map<string, CachedMetadataEntry>();
const faviconMemoryCache = new Map<string, CachedFaviconEntry>();
const inFlightRequests = new Map<string, Promise<PageMetadata>>();
let hasHydratedCache = false;
let hasHydratedFaviconCache = false;

function normalizeUrl(inputUrl: string): string {
  const parsed = new URL(inputUrl);
  parsed.hash = '';
  if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) {
    parsed.port = '';
  }
  const normalizedPath = parsed.pathname.replace(/\/+$/, '');
  parsed.pathname = normalizedPath || '/';
  return parsed.toString();
}

function hydrateCacheFromStorage() {
  if (hasHydratedCache || typeof window === 'undefined') return;
  hasHydratedCache = true;

  try {
    const raw = window.localStorage.getItem(METADATA_CACHE_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Record<string, CachedMetadataEntry>;
    const now = Date.now();
    let isDirty = false;

    for (const [key, entry] of Object.entries(parsed)) {
      if (!entry || !entry.metadata || typeof entry.expiresAt !== 'number') {
        isDirty = true;
        continue;
      }

      if (entry.expiresAt <= now) {
        isDirty = true;
        continue;
      }

      metadataMemoryCache.set(key, entry);
    }

    if (isDirty) {
      persistCacheToStorage();
    }
  } catch {
    window.localStorage.removeItem(METADATA_CACHE_STORAGE_KEY);
  }
}

function hydrateFaviconCacheFromStorage() {
  if (hasHydratedFaviconCache || typeof window === 'undefined') return;
  hasHydratedFaviconCache = true;

  try {
    const raw = window.localStorage.getItem(FAVICON_CACHE_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Record<string, CachedFaviconEntry>;
    const now = Date.now();
    let isDirty = false;

    for (const [domain, entry] of Object.entries(parsed)) {
      if (!entry || typeof entry.dataUrl !== 'string' || typeof entry.expiresAt !== 'number') {
        isDirty = true;
        continue;
      }

      if (entry.expiresAt <= now) {
        isDirty = true;
        continue;
      }

      faviconMemoryCache.set(domain, entry);
    }

    if (isDirty) {
      persistFaviconCacheToStorage();
    }
  } catch {
    window.localStorage.removeItem(FAVICON_CACHE_STORAGE_KEY);
  }
}

function persistCacheToStorage() {
  if (typeof window === 'undefined') return;

  try {
    const serializable: Record<string, CachedMetadataEntry> = {};
    for (const [key, entry] of metadataMemoryCache.entries()) {
      serializable[key] = entry;
    }
    window.localStorage.setItem(METADATA_CACHE_STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage failures (quota/private mode)
  }
}

function persistFaviconCacheToStorage() {
  if (typeof window === 'undefined') return;

  try {
    const serializable: Record<string, CachedFaviconEntry> = {};
    for (const [domain, entry] of faviconMemoryCache.entries()) {
      serializable[domain] = entry;
    }
    window.localStorage.setItem(FAVICON_CACHE_STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage failures
  }
}

function getCachedMetadata(cacheKey: string): PageMetadata | null {
  const cached = metadataMemoryCache.get(cacheKey);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    metadataMemoryCache.delete(cacheKey);
    persistCacheToStorage();
    return null;
  }

  return cached.metadata;
}

function setCachedMetadata(cacheKey: string, metadata: PageMetadata) {
  metadataMemoryCache.set(cacheKey, {
    metadata,
    expiresAt: Date.now() + ONE_MONTH_MS,
  });
  persistCacheToStorage();
}

function getDomainKey(url: string): string {
  return new URL(url).hostname;
}

function getCachedFaviconDataUrl(url: string): string | null {
  const domain = getDomainKey(url);
  const cached = faviconMemoryCache.get(domain);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    faviconMemoryCache.delete(domain);
    persistFaviconCacheToStorage();
    return null;
  }

  return cached.dataUrl;
}

function setCachedFaviconDataUrl(url: string, dataUrl: string) {
  const domain = getDomainKey(url);
  faviconMemoryCache.set(domain, {
    dataUrl,
    expiresAt: Date.now() + ONE_MONTH_MS,
  });
  persistFaviconCacheToStorage();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert blob to data URL'));
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

function isBlobFetchSafeFaviconUrl(faviconUrl: string): boolean {
  try {
    const parsed = new URL(faviconUrl);

    // Google S2 works great for <img src>, but blocks JS fetch() due to CORS.
    if (parsed.hostname === 'www.google.com' && parsed.pathname.startsWith('/s2/favicons')) {
      return false;
    }

    // Only attempt blob conversion for same-origin or explicitly trusted CORS-enabled hosts.
    if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
      return true;
    }

    return parsed.hostname.endsWith('microlink.io');
  } catch {
    return false;
  }
}

async function resolveFavicon(url: string, faviconUrl: string | null): Promise<string | null> {
  if (!faviconUrl) return null;
  if (faviconUrl.startsWith('data:')) return faviconUrl;

  const cached = getCachedFaviconDataUrl(url);
  if (cached) return cached;

  if (!isBlobFetchSafeFaviconUrl(faviconUrl)) {
    return faviconUrl;
  }

  try {
    const response = await fetch(faviconUrl, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return faviconUrl;
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    setCachedFaviconDataUrl(url, dataUrl);
    return dataUrl;
  } catch {
    return faviconUrl;
  }
}

async function finalizeMetadataWithFavicon(url: string, metadata: PageMetadata): Promise<PageMetadata> {
  const resolvedFavicon = await resolveFavicon(url, metadata.favicon);
  return {
    ...metadata,
    favicon: resolvedFavicon,
  };
}

export async function resolveBookmarkFavicon(url: string, faviconUrl: string | null): Promise<string | null> {
  try {
    hydrateFaviconCacheFromStorage();
    const normalizedUrl = normalizeUrl(url);
    const fallback = faviconUrl || getFaviconUrl(normalizedUrl);
    return await resolveFavicon(normalizedUrl, fallback);
  } catch {
    return faviconUrl;
  }
}

function buildFallbackMetadata(url: string): PageMetadata {
  return {
    title: new URL(url).hostname,
    image: null,
    description: null,
    favicon: getFaviconUrl(url),
  };
}

export async function extractPageMetadata(url: string): Promise<PageMetadata> {
  hydrateCacheFromStorage();
  hydrateFaviconCacheFromStorage();

  try {
    const normalizedUrl = normalizeUrl(url);

    const cached = getCachedMetadata(normalizedUrl);
    if (cached) {
      return await finalizeMetadataWithFavicon(normalizedUrl, cached);
    }

    const existingRequest = inFlightRequests.get(normalizedUrl);
    if (existingRequest) {
      return existingRequest;
    }

    const requestPromise = (async () => {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(normalizedUrl)}`, {
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json();

      const metadata: PageMetadata = data.data
        ? {
            title: data.data.title || new URL(normalizedUrl).hostname,
            image: data.data.image?.url || null,
            description: data.data.description || null,
            favicon: data.data.logo?.url || getFaviconUrl(normalizedUrl),
          }
        : buildFallbackMetadata(normalizedUrl);

      const finalizedMetadata = await finalizeMetadataWithFavicon(normalizedUrl, metadata);
      setCachedMetadata(normalizedUrl, finalizedMetadata);
      return finalizedMetadata;
    })();

    inFlightRequests.set(normalizedUrl, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlightRequests.delete(normalizedUrl);
    }
  } catch (error) {
    console.error('Metadata extraction failed:', error);

    try {
      const normalizedUrl = normalizeUrl(url);
      const fallbackMetadata = buildFallbackMetadata(normalizedUrl);
      return await finalizeMetadataWithFavicon(normalizedUrl, fallbackMetadata);
    } catch {
      return {
        title: 'Bookmark',
        image: null,
        description: null,
        favicon: null,
      };
    }
  }
}

export function getFaviconUrl(url: string): string {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}
