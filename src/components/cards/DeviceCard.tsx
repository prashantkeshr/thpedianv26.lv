import type { Device } from '../../types';

const BASE = '';

interface DeviceCardProps {
  device: Device;
  lang?: string;
  compact?: boolean;
}

const statusColors = {
  available: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/30',
  discontinued: 'bg-slate-800/60 text-slate-400 border-slate-600/30',
  announced: 'bg-amber-900/40 text-amber-400 border-amber-700/30',
  rumored: 'bg-violet-900/40 text-violet-400 border-violet-700/30',
  cancelled: 'bg-red-900/40 text-red-400 border-red-600/30',
};

const categoryIcons: Record<string, string> = {
  smartphone: '📱', tablet: '📟', laptop: '💻', desktop: '🖥️',
  gpu: '🎮', monitor: '🖥️', smartwatch: '⌚', headphones: '🎧',
  router: '📡', storage: '💾', camera: '📷', tv: '📺',
};

export default function DeviceCard({ device, lang = 'en', compact = false }: DeviceCardProps) {
  const img = device.images?.[0];
  const href = `${BASE}/${lang}/devices/${device.slug}/`;
  const icon = categoryIcons[device.category] ?? '📦';
  const statusLabel = device.status.charAt(0).toUpperCase() + device.status.slice(1);
  const statusClass = statusColors[device.status] ?? statusColors.available;

  // Extract a few quick specs for the card
  const quickSpecs: string[] = [];
  if (device.category === 'smartphone') {
    const s = device.specs as Record<string, Record<string, string>>;
    if (s?.processor?.name) quickSpecs.push(s.processor.name);
    if (s?.memory?.ram) quickSpecs.push(s.memory.ram + ' RAM');
    if (s?.display?.size) quickSpecs.push(s.display.size);
  } else if (device.category === 'laptop') {
    const s = device.specs as Record<string, Record<string, string>>;
    if (s?.processor?.name) quickSpecs.push(s.processor.name);
    if (s?.memory?.ram) quickSpecs.push(s.memory.ram);
    if (s?.display?.size) quickSpecs.push(s.display.size);
  }

  return (
    <a
      href={href}
      className={`tp-card flex flex-col group overflow-hidden ${compact ? '' : 'h-full'}`}
    >
      {/* Image area */}
      <div className="relative bg-navy-800/60 aspect-[4/3] overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={img.alt}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">{icon}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">{device.brandName}</p>
            <h3 className="text-sm font-semibold text-slate-100 leading-tight group-hover:text-tp-cyan transition-colors line-clamp-2">
              {device.name}
            </h3>
          </div>
          <span className="text-lg flex-shrink-0">{icon}</span>
        </div>

        {quickSpecs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {quickSpecs.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 bg-navy-800 border border-tp-border rounded text-slate-400">
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="tp-badge-blue">{device.category}</span>
          {device.releasedAt && (
            <span className="text-xs text-slate-500">
              {new Date(device.releasedAt).getFullYear()}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
