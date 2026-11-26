import { useState, useEffect, useRef, useCallback } from 'react';
import type { SearchResult } from '../../types';

const BASE = '';

interface SearchBarProps {
  lang?: string;
  variant?: 'hero' | 'compact' | 'inline';
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (result: SearchResult) => void;
}

export default function SearchBar({
  lang = 'en',
  variant = 'inline',
  placeholder,
  autoFocus = false,
  onSelect,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHi = lang === 'hi';
  const ph = placeholder ?? (isHi ? 'डिवाइस, घटक या तकनीक खोजें...' : 'Search devices, components, technologies...');

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      // Dynamic import of search engine to keep initial bundle small
      const { searchAll } = await import('../../engines/search/searchEngine');
      const r = await searchAll(q, { limit: 8 });
      setResults(r);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Keyboard navigation
  const handleKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    else if (e.key === 'Enter' && selected >= 0) { e.preventDefault(); handleSelect(results[selected]); }
    else if (e.key === 'Escape') { setFocused(false); setSelected(-1); inputRef.current?.blur(); }
  };

  const handleSelect = (r: SearchResult) => {
    if (onSelect) { onSelect(r); return; }
    window.location.href = r.url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.href = `${BASE}/${lang}/search/?q=${encodeURIComponent(query.trim())}`;
  };

  const showDropdown = focused && (results.length > 0 || loading) && query.length >= 2;

  const typeColors: Record<string, string> = {
    device: 'text-blue-400', component: 'text-violet-400', brand: 'text-emerald-400',
    technology: 'text-amber-400', article: 'text-sky-400', troubleshooting: 'text-rose-400',
  };

  if (variant === 'hero') {
    return (
      <div class="relative w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} role="search">
          <div class="relative flex items-center">
            <div class="absolute left-4 text-slate-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(-1); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={handleKey}
              placeholder={ph}
              className="w-full pl-12 pr-24 py-4 text-base bg-navy-800 border-2 border-tp-border rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-tp-blue transition-colors shadow-card-hover"
              aria-label={isHi ? 'खोज' : 'Search'}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="absolute right-2 tp-btn-primary py-2 px-4 text-sm"
            >
              {isHi ? 'खोजें' : 'Search'}
            </button>
          </div>
        </form>

        {showDropdown && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-navy-800 border border-tp-border rounded-xl shadow-card-hover overflow-hidden z-50 animate-slide-up"
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-tp-blue border-t-transparent rounded-full animate-spin" />
                {isHi ? 'खोज रहे हैं...' : 'Searching...'}
              </div>
            ) : (
              <>
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-navy-700 transition-colors border-b border-tp-border/50 last:border-0 ${selected === i ? 'bg-navy-700' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${typeColors[r.type] ?? 'text-slate-400'}`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-100 truncate">{r.title}</div>
                      {r.description && <div className="text-xs text-slate-400 truncate mt-0.5">{r.description}</div>}
                    </div>
                    <span className="tp-badge-blue text-xs flex-shrink-0">{r.type}</span>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-tp-border">
                  <button
                    onClick={handleSubmit}
                    className="text-xs text-tp-blue hover:text-tp-blue-bright transition-colors"
                  >
                    {isHi ? `"${query}" के लिए सभी परिणाम देखें →` : `See all results for "${query}" →`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // compact / inline variant
  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKey}
          placeholder={ph}
          className="tp-input pl-9 w-full"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-tp-border rounded-xl shadow-card-hover overflow-hidden z-50 animate-slide-up">
          {loading ? (
            <div className="px-3 py-2 text-xs text-slate-400">{isHi ? 'खोज रहे हैं...' : 'Searching...'}</div>
          ) : results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-navy-700 transition-colors border-b border-tp-border/50 last:border-0 ${selected === i ? 'bg-navy-700' : ''}`}
            >
              <span className="text-base">{typeIcon[r.type] ?? '🔍'}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-100 truncate">{r.title}</div>
              </div>
              <span className="tp-badge-blue text-xs">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
