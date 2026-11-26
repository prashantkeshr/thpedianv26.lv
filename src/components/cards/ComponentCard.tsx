import type { ElectronicComponent } from '../../types';

const BASE = '';

interface ComponentCardProps {
  component: ElectronicComponent;
  lang?: string;
}

function ComponentPlaceholderIcon({ category }: { category: string }) {
  if (category === 'cpu' || category === 'microcontroller' || category === 'ic' || category === 'logic-gate') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2"/>
        <path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5"/>
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
  if (category === 'capacitor' || category === 'resistor' || category === 'transistor' || category === 'mosfet') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 12h4M18 12h4M6 7v10M10 9v6M14 7v10M18 7v10"/>
      </svg>
    );
  }
  if (category === 'memory' || category === 'storage') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="17" cy="12" r="1.5"/>
        <path d="M4 10h8M4 14h8"/>
      </svg>
    );
  }
  if (category === 'sensor') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M5.64 5.64a9 9 0 000 12.72M18.36 18.36a9 9 0 000-12.72"/>
        <path d="M8.46 8.46a5 5 0 000 7.08M15.54 15.54a5 5 0 000-7.08"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    );
  }
  if (category === 'opamp' || category === 'regulator') {
    return (
      <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 6l8 6-8 6V6zM16 12h4"/>
        <path d="M12 7h4M12 17h4"/>
      </svg>
    );
  }
  // Default: circuit board
  return (
    <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <rect x="8" y="8" width="8" height="8" rx="1"/>
      <path d="M5 8H2M5 12H2M5 16H2M19 8h3M19 12h3M19 16h3"/>
    </svg>
  );
}

export default function ComponentCard({ component, lang = 'en' }: ComponentCardProps) {
  const href = `${BASE}/${lang}/components/${component.slug}/`;
  const img = component.images?.[0];

  return (
    <a href={href} className="tp-card flex flex-col group overflow-hidden h-full">
      {/* Image / placeholder */}
      <div className="relative bg-navy-800 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {img ? (
          <img
            src={img.url}
            alt={img.alt}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
            <ComponentPlaceholderIcon category={component.category} />
            <span className="text-xs text-slate-700 font-medium">{component.manufacturerName}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs text-slate-400 font-medium">{component.manufacturerName}</p>
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
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
          <span className="tp-badge-blue capitalize">{component.category.replace(/-/g, ' ')}</span>
          {component.packageType && (
            <span className="text-xs text-slate-500 font-mono">{component.packageType}</span>
          )}
        </div>
      </div>
    </a>
  );
}
