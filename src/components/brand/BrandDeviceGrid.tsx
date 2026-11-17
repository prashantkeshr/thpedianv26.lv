import { useState } from 'react';
import DeviceCard from '../cards/DeviceCard';
import type { Device } from '../../types';

interface Props {
  devices: Device[];
  lang?: string;
}

export default function BrandDeviceGrid({ devices, lang = 'en' }: Props) {
  const categories = Array.from(new Set(devices.map(d => d.category))).sort();
  const [active, setActive] = useState<string>('all');

  const filtered = active === 'all' ? devices : devices.filter(d => d.category === active);

  const categoryLabel = (cat: string) =>
    cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const labels = lang === 'hi'
    ? { all: 'सभी', devices: 'डिवाइस', noDevices: 'इस श्रेणी में कोई डिवाइस नहीं।' }
    : { all: 'All', devices: 'Devices', noDevices: 'No devices in this category.' };

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActive('all')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              active === 'all'
                ? 'bg-tp-blue text-white border-tp-blue'
                : 'bg-navy-800 text-slate-400 border-tp-border hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {labels.all}
            <span className="ml-1.5 text-xs opacity-70">({devices.length})</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                active === cat
                  ? 'bg-tp-blue text-white border-tp-blue'
                  : 'bg-navy-800 text-slate-400 border-tp-border hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {categoryLabel(cat)}
              <span className="ml-1.5 text-xs opacity-70">
                ({devices.filter(d => d.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm">{labels.noDevices}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(d => (
            <DeviceCard key={d.id} device={d} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
