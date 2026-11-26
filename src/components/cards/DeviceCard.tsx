import { useState, useEffect } from 'react';
import type { Device } from '../../types';

const BASE = '';

interface DeviceCardProps {
  device: Device;
  lang?: string;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  discontinued: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  announced: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  rumored: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const TTL = 7 * 24 * 60 * 60 * 1000;
const CACHE_VER = 'v3_';

function readCache(key: string): string | null {
  try {
    const raw = localStorage.getItem('tp_img_' + CACHE_VER + key);
    if (!raw) return null;
    const { url, ts } = JSON.parse(raw) as { url: string; ts: number };
    if (Date.now() - ts > TTL) { localStorage.removeItem('tp_img_' + CACHE_VER + key); return null; }
    return url;
  } catch { return null; }
}

function writeCache(key: string, url: string) {
  try { localStorage.setItem('tp_img_' + CACHE_VER + key, JSON.stringify({ url, ts: Date.now() })); } catch {}
}

function cacheKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function fetchWikiImage(title: string): Promise<string | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const d = await r.json() as { thumbnail?: { source: string }; originalimage?: { source: string } };
    const raw = d?.thumbnail?.source ?? d?.originalimage?.source ?? null;
    return raw ? raw.split('?')[0] : null;
  } catch { return null; }
}

function PlaceholderIcon({ category }: { category: string }) {
  if (category === 'smartphone' || category === 'earbuds') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="6" y="2" width="12" height="20" rx="2.5"/>
        <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (category === 'laptop') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="13" rx="2"/>
        <path d="M2 20h20M9 20v-3h6v3"/>
      </svg>
    );
  }
  if (category === 'desktop' || category === 'mini-pc' || category === 'all-in-one' || category === 'workstation') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    );
  }
  if (category === 'gpu') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="8" cy="12" r="2"/>
        <circle cx="16" cy="12" r="2"/>
        <path d="M6 6V4M10 6V4M14 6V4M18 6V4"/>
      </svg>
    );
  }
  if (category === 'tablet') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (category === 'smartwatch') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="7" y="6" width="10" height="12" rx="2"/>
        <path d="M9 6V4h6v2M9 18v2h6v-2"/>
        <path d="M12 10v2l1.5 1"/>
      </svg>
    );
  }
  if (category === 'headphones') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 18v-6a9 9 0 0118 0v6"/>
        <rect x="2" y="15" width="4" height="6" rx="1"/>
        <rect x="18" y="15" width="4" height="6" rx="1"/>
      </svg>
    );
  }
  if (category === 'gaming-console') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M6 11h4M8 9v4"/>
        <circle cx="15.5" cy="11.5" r=".75" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="10" r=".75" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="13" r=".75" fill="currentColor" stroke="none"/>
        <circle cx="19.5" cy="11.5" r=".75" fill="currentColor" stroke="none"/>
        <path d="M5 8c-.8.4-1 1-1 2v2.5c0 2.5 1.5 4.5 4 4.5h8c2.5 0 4-2 4-4.5V10c0-1-.2-1.6-1-2L17 7H7L5 8z"/>
      </svg>
    );
  }
  if (category === 'storage') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="17" cy="12" r="1.5"/>
        <path d="M4 10h8M4 14h8"/>
      </svg>
    );
  }
  if (category === 'tv' || category === 'monitor' || category === 'smart-display') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    );
  }
  if (category === 'xr-headset') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 10a4 4 0 014-4h12a4 4 0 014 4v4a4 4 0 01-4 4h-1.5l-1 2h-5l-1-2H6a4 4 0 01-4-4v-4z"/>
        <circle cx="9" cy="12" r="2"/>
        <circle cx="15" cy="12" r="2"/>
      </svg>
    );
  }
  // Default: chip/device
  return (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
      <path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5"/>
    </svg>
  );
}

export default function DeviceCard({ device, lang = 'en', compact = false }: DeviceCardProps) {
  const staticImg = device.images?.[0];
  const [autoImg, setAutoImg] = useState<string | null>(null);
  const [imgState, setImgState] = useState<'loading' | 'found' | 'missing'>(staticImg ? 'found' : 'loading');

  useEffect(() => {
    if (staticImg) return;
    const lookupTitle = device.wikiTitle ?? device.name;
    const key = cacheKey(lookupTitle);
    const cached = readCache(key);
    if (cached === '') { setImgState('missing'); return; }
    if (cached) { setAutoImg(cached); setImgState('found'); return; }

    fetchWikiImage(lookupTitle).then(url => {
      if (url) { writeCache(key, url); setAutoImg(url); setImgState('found'); }
      else { writeCache(key, ''); setImgState('missing'); }
    });
  }, [device.name, device.wikiTitle, staticImg]);

  const href = `${BASE}/${lang}/devices/${device.slug}/`;
  const statusLabel = device.status.charAt(0).toUpperCase() + device.status.slice(1);
  const statusClass = statusColors[device.status] ?? statusColors.available;
  const year = device.releasedAt ? new Date(device.releasedAt).getFullYear() : null;

  const specs: string[] = [];
  const s = device.specs as Record<string, Record<string, string>>;
  if (s?.processor?.name) specs.push(s.processor.name);
  if (s?.memory?.ram) specs.push(s.memory.ram + (s.memory.ram.endsWith('RAM') ? '' : ' RAM'));
  if (s?.display?.size) specs.push(s.display.size);

  const displayImg = staticImg?.url ?? autoImg;

  return (
    <a
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm transition-all duration-200 hover:border-slate-500/60 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 ${compact ? '' : 'h-full'}`}
    >
      {/* Image area */}
      <div className="relative bg-navy-800 overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {imgState === 'loading' && (
          <div className="w-full h-full skeleton" />
        )}
        {imgState === 'found' && displayImg && (
          <img
            src={displayImg}
            alt={device.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgState('missing')}
          />
        )}
        {imgState === 'missing' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800/60 to-navy-900">
            <div className="text-slate-600">
              <PlaceholderIcon category={device.category} />
            </div>
            <span className="text-xs text-slate-600 font-medium">{device.brandName}</span>
          </div>
        )}

        {/* Status pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-2 p-4">
        <div>
          <p className="text-[11px] font-medium text-blue-400/80 uppercase tracking-wide mb-0.5">{device.brandName}</p>
          <h3 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
            {device.name}
          </h3>
        </div>

        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {specs.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 font-medium">
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/60">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40 font-medium capitalize">
            {device.category.replace(/-/g, ' ')}
          </span>
          <div className="flex items-center gap-1.5">
            {device.expertScore != null && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                device.expertScore >= 90 ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                device.expertScore >= 80 ? 'text-blue-400 border-blue-500/40 bg-blue-500/10' :
                'text-amber-400 border-amber-500/40 bg-amber-500/10'
              }`} title="Expert Score">
                {device.expertScore}
              </span>
            )}
            {year && <span className="text-[11px] text-slate-500 font-medium">{year}</span>}
          </div>
        </div>
      </div>
    </a>
  );
}
