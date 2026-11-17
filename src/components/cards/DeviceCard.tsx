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

const categoryIcons: Record<string, string> = {
  smartphone: '📱', tablet: '📟', laptop: '💻', desktop: '🖥️',
  gpu: '🎮', monitor: '🖥️', smartwatch: '⌚', headphones: '🎧',
  router: '📡', storage: '💾', camera: '📷', tv: '📺',
  'gaming-console': '🎮', 'handheld-gaming': '🕹️',
};

const TTL = 7 * 24 * 60 * 60 * 1000;
const CACHE_VER = 'v2_'; // bump to bust old cached URLs

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

function sanitizeWikimediaUrl(url: string): string {
  return url.split('?')[0].replace('thumb.wikimedia.org', 'upload.wikimedia.org');
}

async function fetchWikiImage(name: string): Promise<string | null> {
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const d = await r.json() as { thumbnail?: { source: string }; originalimage?: { source: string } };
    const raw = d?.thumbnail?.source ?? d?.originalimage?.source ?? null;
    return raw ? sanitizeWikimediaUrl(raw) : null;
  } catch { return null; }
}

export default function DeviceCard({ device, lang = 'en', compact = false }: DeviceCardProps) {
  const staticImg = device.images?.[0];
  const [autoImg, setAutoImg] = useState<string | null>(null);
  const [imgState, setImgState] = useState<'loading' | 'found' | 'missing'>(staticImg ? 'found' : 'loading');

  useEffect(() => {
    if (staticImg) return;
    const key = cacheKey(device.name);
    const cached = readCache(key);
    if (cached === '') { setImgState('missing'); return; }
    if (cached) { setAutoImg(cached); setImgState('found'); return; }

    fetchWikiImage(device.name).then(url => {
      if (url) { writeCache(key, url); setAutoImg(url); setImgState('found'); }
      else { writeCache(key, ''); setImgState('missing'); }
    });
  }, [device.name, staticImg]);

  const href = `${BASE}/${lang}/devices/${device.slug}/`;
  const icon = categoryIcons[device.category] ?? '📦';
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
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm transition-all duration-200 hover:border-slate-500/70 hover:shadow-lg hover:shadow-blue-950/40 hover:-translate-y-0.5 ${compact ? '' : 'h-full'}`}
    >
      {/* Image area */}
      <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {imgState === 'loading' && (
          <div className="w-full h-full animate-pulse bg-slate-800/80" />
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
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-15">{icon}</span>
          </div>
        )}

        {/* Status pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Category icon bottom-left */}
        <div className="absolute bottom-2 left-2.5 text-sm opacity-60">{icon}</div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-2 p-4">
        {/* Brand + name */}
        <div>
          <p className="text-[11px] font-medium text-blue-400/80 uppercase tracking-wide mb-0.5">{device.brandName}</p>
          <h3 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
            {device.name}
          </h3>
        </div>

        {/* Key specs */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {specs.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 font-medium">
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
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

      {/* Hover glow edge */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-300" />
    </a>
  );
}
