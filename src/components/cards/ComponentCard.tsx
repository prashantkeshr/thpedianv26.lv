import type { ElectronicComponent } from '../../types';

const BASE = '';

const categoryIcons: Record<string, string> = {
  cpu: '⚙️', gpu: '🎮', microcontroller: '🔧', ic: '📐',
  resistor: '〰️', capacitor: '⚡', transistor: '🔌', mosfet: '🔌',
  sensor: '📡', relay: '🔁', connector: '🔗', regulator: '🔋',
  opamp: '📈', 'logic-gate': '🧮', memory: '💾', module: '📦',
};

interface ComponentCardProps {
  component: ElectronicComponent;
  lang?: string;
}

export default function ComponentCard({ component, lang = 'en' }: ComponentCardProps) {
  const href = `${BASE}/${lang}/components/${component.slug}/`;
  const icon = categoryIcons[component.category] ?? '🔌';
  const img = component.images?.[0];

  return (
    <a href={href} className="tp-card flex flex-col group overflow-hidden h-full">
      {/* Image / icon */}
      <div className="relative bg-navy-800/60 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={img.alt}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="text-6xl opacity-20">{icon}</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs text-slate-400 font-medium">{component.manufacturerName}</p>
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-tp-cyan transition-colors line-clamp-2">
            {component.name}
          </h3>
          {component.partNumber && (
            <p className="text-xs font-mono text-slate-500 mt-0.5">{component.partNumber}</p>
          )}
        </div>

        {component.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{component.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="tp-badge-cyan">{component.category}</span>
          {component.packageType && (
            <span className="text-xs text-slate-500 font-mono">{component.packageType}</span>
          )}
        </div>
      </div>
    </a>
  );
}
