import { useState, useEffect } from 'react';

interface Props {
  deviceName: string;
  fallbackIcon: string;
  className?: string;
  priority?: boolean;
}

const TTL = 7 * 24 * 60 * 60 * 1000;
const CACHE_VER = 'v2_';

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

async function fetchWikipediaImage(deviceName: string): Promise<string | null> {
  const encoded = encodeURIComponent(deviceName);
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!r.ok) return null;
    const data = await r.json() as { thumbnail?: { source: string }; originalimage?: { source: string } };
    const raw = data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
    return raw ? sanitizeWikimediaUrl(raw) : null;
  } catch { return null; }
}

export default function DeviceAutoImage({ deviceName, fallbackIcon, className = '', priority = false }: Props) {
  const [state, setState] = useState<'loading' | 'found' | 'missing'>('loading');
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const key = cacheKey(deviceName);
    const cached = readCache(key);
    if (cached === '') { setState('missing'); return; }
    if (cached) { setImgUrl(cached); setState('found'); return; }

    fetchWikipediaImage(deviceName).then(url => {
      if (url) { writeCache(key, url); setImgUrl(url); setState('found'); }
      else { writeCache(key, ''); setState('missing'); }
    });
  }, [deviceName]);

  if (state === 'loading') {
    return (
      <div className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`} />
    );
  }

  if (state === 'found' && imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={deviceName}
        className={`object-contain ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setState('missing')}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="text-6xl opacity-20">{fallbackIcon}</span>
    </div>
  );
}
