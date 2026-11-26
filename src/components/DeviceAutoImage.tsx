import { useState, useEffect } from 'react';

interface Props {
  deviceName: string;
  wikiTitle?: string;
  fallbackIcon: string;
  className?: string;
  priority?: boolean;
}

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

async function fetchWikipediaImage(title: string): Promise<string | null> {
  const encoded = encodeURIComponent(title);
  try {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!r.ok) return null;
    const data = await r.json() as { thumbnail?: { source: string }; originalimage?: { source: string } };
    const raw = data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
    return raw ? raw.split('?')[0] : null;
  } catch { return null; }
}

export default function DeviceAutoImage({ deviceName, wikiTitle, fallbackIcon: _fallbackIcon, className = '', priority = false }: Props) {
  const [state, setState] = useState<'loading' | 'found' | 'missing'>('loading');
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const lookupTitle = wikiTitle ?? deviceName;
    const key = cacheKey(lookupTitle);
    const cached = readCache(key);
    if (cached === '') { setState('missing'); return; }
    if (cached) { setImgUrl(cached); setState('found'); return; }

    fetchWikipediaImage(lookupTitle).then(url => {
      if (url) { writeCache(key, url); setImgUrl(url); setState('found'); }
      else { writeCache(key, ''); setState('missing'); }
    });
  }, [deviceName, wikiTitle]);

  if (state === 'loading') {
    return (
      <div className={`skeleton rounded-lg ${className}`} />
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

  // Clean placeholder — no emoji
  return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800/40 to-navy-900 rounded-lg ${className}`}>
      <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
      <span className="text-xs text-slate-700 font-medium">{deviceName}</span>
    </div>
  );
}
