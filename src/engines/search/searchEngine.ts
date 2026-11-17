import { create, insert, search } from '@orama/orama';
import type { SearchResult } from '../../types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = {
  id: 'string',
  type: 'string',
  title: 'string',
  subtitle: 'string',
  description: 'string',
  tags: 'string',
  url: 'string',
  imageUrl: 'string',
  category: 'string',
} as const;

type OramaDoc = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string;
  url: string;
  imageUrl: string;
  category: string;
};

// ─── Singleton DB ─────────────────────────────────────────────────────────────

let db: Awaited<ReturnType<typeof create<typeof schema>>> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

const BASE = '';

async function init(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    db = await create({ schema });

    // Load all datasets in parallel
    const [devicesRes, componentsRes, brandsRes] = await Promise.allSettled([
      fetch(`${BASE}/data/devices.json`),
      fetch(`${BASE}/data/components.json`),
      fetch(`${BASE}/data/brands.json`),
    ]);

    const docs: OramaDoc[] = [];

    if (devicesRes.status === 'fulfilled' && devicesRes.value.ok) {
      const devices = await devicesRes.value.json();
      for (const d of devices) {
        docs.push({
          id: d.id,
          type: 'device',
          title: d.name,
          subtitle: d.brandName ?? '',
          description: d.description ?? '',
          tags: (d.tags ?? []).join(' '),
          url: `${BASE}/en/devices/${d.slug}/`,
          imageUrl: d.images?.[0]?.url ?? '',
          category: d.category ?? '',
        });
      }
    }

    if (componentsRes.status === 'fulfilled' && componentsRes.value.ok) {
      const components = await componentsRes.value.json();
      for (const c of components) {
        docs.push({
          id: c.id,
          type: c.category === 'cpu' ? 'component' : c.category === 'gpu' ? 'component' : 'component',
          title: c.name,
          subtitle: c.manufacturerName ?? '',
          description: c.description ?? '',
          tags: (c.commonNames ?? []).join(' ') + ' ' + (c.partNumber ?? ''),
          url: `${BASE}/en/components/${c.slug}/`,
          imageUrl: c.images?.[0]?.url ?? '',
          category: c.category ?? '',
        });
      }
    }

    if (brandsRes.status === 'fulfilled' && brandsRes.value.ok) {
      const brands = await brandsRes.value.json();
      for (const b of brands) {
        docs.push({
          id: b.id,
          type: 'brand',
          title: b.name,
          subtitle: b.headquarters ?? '',
          description: b.description ?? '',
          tags: (b.aliases ?? []).join(' '),
          url: `${BASE}/en/brands/${b.slug}/`,
          imageUrl: b.logoUrl ?? '',
          category: 'brand',
        });
      }
    }

    for (const doc of docs) {
      await insert(db!, doc);
    }

    initialized = true;
  })();

  return initPromise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SearchOptions {
  limit?: number;
  types?: string[];
}

export async function searchAll(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  await init();
  if (!db) return [];

  const { limit = 10 } = options;

  const result = await search(db, {
    term: query,
    properties: ['title', 'subtitle', 'description', 'tags'],
    limit,
    boost: { title: 2, subtitle: 1.5, tags: 1.2, description: 1 },
  });

  return result.hits.map(hit => {
    const doc = hit.document as OramaDoc;
    return {
      id: doc.id,
      type: doc.type as SearchResult['type'],
      title: doc.title,
      subtitle: doc.subtitle || undefined,
      description: doc.description || undefined,
      url: doc.url,
      imageUrl: doc.imageUrl || undefined,
      category: doc.category || undefined,
      score: hit.score,
    };
  });
}

export async function getSuggestions(query: string, limit = 5): Promise<string[]> {
  const results = await searchAll(query, { limit });
  return results.map(r => r.title);
}
