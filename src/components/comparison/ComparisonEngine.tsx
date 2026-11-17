import { useState, useMemo } from 'react';
import type { Device, ElectronicComponent } from '../../types';

const BASE = '';

type AnyItem = Device | ElectronicComponent;

interface CompareSpec {
  group: string;
  key: string;
  label: string;
  values: (string | number | boolean | null | undefined)[];
}

function flattenSpecs(specs: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(specs ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v === null || v === undefined) continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenSpecs(v as Record<string, unknown>, key));
    } else if (Array.isArray(v)) {
      out[key] = v.join(', ');
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

function labelFromKey(key: string): string {
  const last = key.split('.').pop() ?? key;
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

function groupFromKey(key: string): string {
  const first = key.split('.')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function buildCompareSpecs(items: AnyItem[]): CompareSpec[] {
  const allKeys = new Set<string>();
  const flatMaps = items.map(item => flattenSpecs(item.specs as Record<string, unknown>));
  flatMaps.forEach(m => Object.keys(m).forEach(k => allKeys.add(k)));

  const specs: CompareSpec[] = [];
  for (const key of allKeys) {
    const values = flatMaps.map(m => m[key] ?? null);
    const hasAny = values.some(v => v !== null && v !== undefined && v !== '');
    if (!hasAny) continue;
    specs.push({
      group: groupFromKey(key),
      key,
      label: labelFromKey(key),
      values,
    });
  }

  // Sort by group then key
  specs.sort((a, b) => a.group.localeCompare(b.group) || a.key.localeCompare(b.key));
  return specs;
}

function isDifferent(values: CompareSpec['values']): boolean {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length < 2) return false;
  return new Set(nonNull.map(String)).size > 1;
}

interface ComparisonEngineProps {
  items: AnyItem[];
  lang?: string;
}

export default function ComparisonEngine({ items, lang = 'en' }: ComparisonEngineProps) {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const isHi = lang === 'hi';

  const specs = useMemo(() => buildCompareSpecs(items), [items]);
  const filteredSpecs = showOnlyDiffs ? specs.filter(s => isDifferent(s.values)) : specs;

  const groups = useMemo(() => {
    const g: Record<string, CompareSpec[]> = {};
    for (const s of filteredSpecs) {
      if (!g[s.group]) g[s.group] = [];
      g[s.group].push(s);
    }
    return g;
  }, [filteredSpecs]);

  if (!items.length) return null;

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-sm text-slate-400">
          {isHi
            ? `${items.length} आइटम की तुलना`
            : `Comparing ${items.length} item${items.length !== 1 ? 's' : ''}`}
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={showOnlyDiffs}
              onChange={e => setShowOnlyDiffs(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-navy-700 border border-tp-border rounded-full peer-checked:bg-tp-blue transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-slate-300">
            {isHi ? 'केवल अंतर दिखाएं' : 'Show only differences'}
          </span>
        </label>
      </div>

      {/* Header row: product names */}
      <div className={`grid gap-px`} style={{ gridTemplateColumns: `220px repeat(${items.length}, 1fr)` }}>
        <div className="bg-navy-700/40 p-3 rounded-tl-lg" />
        {items.map((item) => (
          <div key={item.id} className="bg-navy-700/40 p-3 text-center last:rounded-tr-lg">
            <div className="font-semibold text-sm text-slate-100 line-clamp-2">{item.name}</div>
            {'brandName' in item && (
              <div className="text-xs text-slate-400 mt-0.5">{item.brandName}</div>
            )}
            {'manufacturerName' in item && (
              <div className="text-xs text-slate-400 mt-0.5">{item.manufacturerName}</div>
            )}
          </div>
        ))}
      </div>

      {/* Spec groups */}
      {Object.entries(groups).map(([group, groupSpecs], gi) => (
        <div key={group}>
          {/* Group header */}
          <div
            className="grid gap-px mt-2"
            style={{ gridTemplateColumns: `220px repeat(${items.length}, 1fr)` }}
          >
            <div className="bg-navy-800/80 px-3 py-1.5 col-span-full">
              <span className="text-xs font-semibold text-tp-cyan uppercase tracking-wider">{group}</span>
            </div>
          </div>

          {/* Spec rows */}
          {groupSpecs.map((spec, si) => {
            const diff = isDifferent(spec.values);
            return (
              <div
                key={spec.key}
                className={`grid gap-px ${diff ? 'bg-amber-500/5' : ''}`}
                style={{ gridTemplateColumns: `220px repeat(${items.length}, 1fr)` }}
              >
                <div className={`px-3 py-2 bg-navy-800/40 flex items-center border-b border-tp-border/30 ${si % 2 === 0 ? 'bg-navy-800/40' : 'bg-navy-900/40'}`}>
                  <span className="text-xs text-slate-400 font-medium">{spec.label}</span>
                  {diff && (
                    <span className="ml-2 text-amber-400 text-xs" title="Values differ">●</span>
                  )}
                </div>
                {spec.values.map((v, vi) => (
                  <div
                    key={vi}
                    className={`px-3 py-2 text-center border-b border-tp-border/30 ${si % 2 === 0 ? 'bg-navy-800/20' : 'bg-navy-900/20'}`}
                  >
                    <span className={`text-xs ${v !== null && v !== undefined && v !== '' ? 'text-slate-100' : 'text-slate-600 italic'}`}>
                      {v !== null && v !== undefined && v !== '' ? String(v) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}

      {filteredSpecs.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          {isHi ? 'कोई अंतर नहीं मिला।' : 'No differences found between these items.'}
        </div>
      )}

      {/* Share comparison */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const params = new URLSearchParams({ ids: items.map(i => i.id).join(',') });
            const url = `${BASE}/${lang}/compare/?${params}`;
            navigator.clipboard?.writeText(window.location.origin + url);
            alert(isHi ? 'तुलना लिंक कॉपी किया गया' : 'Comparison link copied to clipboard');
          }}
          className="tp-btn-secondary text-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
          </svg>
          {isHi ? 'लिंक कॉपी करें' : 'Copy comparison link'}
        </button>
      </div>
    </div>
  );
}
