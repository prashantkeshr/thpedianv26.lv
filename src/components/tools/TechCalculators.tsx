import { useState } from 'react';

// ── PPI Calculator ────────────────────────────────────────────────────────────
function PPICalculator() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [diagonal, setDiagonal] = useState('');
  const [result, setResult] = useState<{ ppi: number; res: string; density: string } | null>(null);

  function calculate() {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(diagonal);
    if (!w || !h || !d || d <= 0) return;
    const ppi = Math.sqrt(w * w + h * h) / d;
    const density = ppi < 100 ? 'Low' : ppi < 160 ? 'Standard' : ppi < 250 ? 'HD' : ppi < 400 ? 'Full HD+' : 'Retina / Super HD';
    setResult({ ppi: Math.round(ppi), res: `${w}×${h}`, density });
  }

  return (
    <div className="tp-card p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-1">PPI Calculator</h3>
      <p className="text-sm text-slate-400 mb-4">Pixels Per Inch — display sharpness metric</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Width (px)</label>
          <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g. 2532" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Height (px)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 1170" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Diagonal (inches)</label>
          <input type="number" value={diagonal} onChange={e => setDiagonal(e.target.value)} placeholder="e.g. 6.1" className="tp-input w-full" />
        </div>
      </div>
      <button onClick={calculate} className="tp-btn-primary text-sm mb-4">Calculate</button>
      {result && (
        <div className="rounded-xl bg-navy-800/60 border border-tp-border p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-tp-blue">{result.ppi}</div>
            <div className="text-xs text-slate-400">PPI</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-100">{result.res}</div>
            <div className="text-xs text-slate-400">Resolution</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-tp-cyan">{result.density}</div>
            <div className="text-xs text-slate-400">Density class</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ohm's Law Calculator ──────────────────────────────────────────────────────
function OhmsLawCalculator() {
  const [solve, setSolve] = useState<'V' | 'I' | 'R' | 'P'>('P');
  const [inputs, setInputs] = useState({ V: '', I: '', R: '', P: '' });
  const [result, setResult] = useState<{ label: string; value: string; unit: string } | null>(null);

  function set(k: string, v: string) {
    setInputs(prev => ({ ...prev, [k]: v }));
  }

  function calculate() {
    const v = parseFloat(inputs.V);
    const i = parseFloat(inputs.I);
    const r = parseFloat(inputs.R);
    const p = parseFloat(inputs.P);
    let val = 0;
    try {
      if (solve === 'V') val = isNaN(i) || isNaN(r) ? p / i : i * r;
      else if (solve === 'I') val = isNaN(v) || isNaN(r) ? p / v : v / r;
      else if (solve === 'R') val = isNaN(v) || isNaN(i) ? (v * v) / p : v / i;
      else val = isNaN(v) || isNaN(i) ? (v * v) / r : v * i;
      if (!isFinite(val) || isNaN(val)) throw new Error('Invalid');
      const units: Record<string, string> = { V: 'V (Volts)', I: 'A (Amperes)', R: 'Ω (Ohms)', P: 'W (Watts)' };
      const labels: Record<string, string> = { V: 'Voltage', I: 'Current', R: 'Resistance', P: 'Power' };
      setResult({ label: labels[solve], value: val >= 1000 ? `${(val/1000).toFixed(3)}k` : val >= 0.001 ? val.toPrecision(4) : val.toExponential(3), unit: units[solve] });
    } catch { setResult(null); }
  }

  const fields: { key: 'V' | 'I' | 'R' | 'P'; label: string; placeholder: string }[] = [
    { key: 'V', label: 'Voltage (V)', placeholder: 'e.g. 5' },
    { key: 'I', label: 'Current (A)', placeholder: 'e.g. 0.5' },
    { key: 'R', label: 'Resistance (Ω)', placeholder: 'e.g. 10' },
    { key: 'P', label: 'Power (W)', placeholder: 'e.g. 2.5' },
  ];

  return (
    <div className="tp-card p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-1">Ohm's Law & Power</h3>
      <p className="text-sm text-slate-400 mb-4">V = I × R, P = V × I. Fill three known values.</p>
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Solve for</label>
        <div className="flex gap-2">
          {(['V', 'I', 'R', 'P'] as const).map(k => (
            <button
              key={k}
              onClick={() => setSolve(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border transition-colors ${solve === k ? 'bg-tp-blue border-tp-blue text-white' : 'border-tp-border text-slate-400 hover:border-slate-500'}`}
            >{k}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {fields.filter(f => f.key !== solve).map(f => (
          <div key={f.key}>
            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
            <input type="number" value={inputs[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="tp-input w-full" />
          </div>
        ))}
      </div>
      <button onClick={calculate} className="tp-btn-primary text-sm mb-4">Calculate</button>
      {result && (
        <div className="rounded-xl bg-navy-800/60 border border-tp-border p-4 text-center">
          <div className="text-2xl font-bold text-tp-blue font-mono">{result.value}</div>
          <div className="text-sm text-slate-300">{result.label}</div>
          <div className="text-xs text-slate-500">{result.unit}</div>
        </div>
      )}
    </div>
  );
}

// ── Aspect Ratio Calculator ───────────────────────────────────────────────────
function AspectRatioCalculator() {
  const [inputW, setInputW] = useState('');
  const [inputH, setInputH] = useState('');
  const [result, setResult] = useState<{ ratio: string; common: string; decimal: string } | null>(null);

  function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

  const commonRatios: { ratio: [number, number]; name: string }[] = [
    { ratio: [4, 3], name: '4:3 — Classic VGA/XGA' },
    { ratio: [16, 9], name: '16:9 — Widescreen HD' },
    { ratio: [16, 10], name: '16:10 — MacBook/ultrabook' },
    { ratio: [21, 9], name: '21:9 — Ultrawide' },
    { ratio: [3, 2], name: '3:2 — Surface/iPad Pro' },
    { ratio: [19.5, 9], name: '19.5:9 — Modern smartphone' },
    { ratio: [20, 9], name: '20:9 — Tall Android' },
  ];

  function calculate() {
    const w = parseInt(inputW);
    const h = parseInt(inputH);
    if (!w || !h) return;
    const g = gcd(w, h);
    const rw = w / g;
    const rh = h / g;
    const decimal = (w / h).toFixed(4);
    const fDec = w / h;
    let closest = '';
    let minDiff = Infinity;
    for (const cr of commonRatios) {
      const d = Math.abs(cr.ratio[0] / cr.ratio[1] - fDec);
      if (d < minDiff) { minDiff = d; closest = cr.name; }
    }
    setResult({ ratio: `${rw}:${rh}`, common: minDiff < 0.05 ? closest : `Closest: ${closest}`, decimal });
  }

  return (
    <div className="tp-card p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-1">Aspect Ratio Calculator</h3>
      <p className="text-sm text-slate-400 mb-4">Find the simplified ratio for any resolution.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Width (px)</label>
          <input type="number" value={inputW} onChange={e => setInputW(e.target.value)} placeholder="e.g. 2560" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Height (px)</label>
          <input type="number" value={inputH} onChange={e => setInputH(e.target.value)} placeholder="e.g. 1600" className="tp-input w-full" />
        </div>
      </div>
      <button onClick={calculate} className="tp-btn-primary text-sm mb-4">Calculate</button>
      {result && (
        <div className="rounded-xl bg-navy-800/60 border border-tp-border p-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-tp-blue font-mono">{result.ratio}</div>
            <div className="text-xs text-slate-400">Simplified ratio</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-100">{result.decimal}</div>
            <div className="text-xs text-slate-400">Decimal (W/H)</div>
          </div>
          <div className="col-span-2 text-center">
            <div className="text-sm text-tp-cyan">{result.common}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Data Unit Converter ───────────────────────────────────────────────────────
const DATA_UNITS = ['Bits', 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
type DataUnit = typeof DATA_UNITS[number];
const TO_BITS: Record<DataUnit, number> = {
  Bits: 1, Bytes: 8, KB: 8 * 1024, MB: 8 * 1024 ** 2, GB: 8 * 1024 ** 3, TB: 8 * 1024 ** 4, PB: 8 * 1024 ** 5,
};

function DataConverter() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState<DataUnit>('GB');
  const [results, setResults] = useState<{ unit: string; val: string }[]>([]);

  function convert() {
    const n = parseFloat(value);
    if (isNaN(n)) return;
    const bits = n * TO_BITS[from];
    setResults(DATA_UNITS.map(u => {
      const v = bits / TO_BITS[u];
      const display = v >= 1e15 ? v.toExponential(3) : v < 0.0001 && v > 0 ? v.toExponential(3) : parseFloat(v.toPrecision(6)).toString();
      return { unit: u, val: display };
    }));
  }

  return (
    <div className="tp-card p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-1">Data Storage Converter</h3>
      <p className="text-sm text-slate-400 mb-4">Convert between bits, bytes, KB, MB, GB, TB, PB.</p>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Amount</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 1" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Unit</label>
          <select value={from} onChange={e => setFrom(e.target.value as DataUnit)} className="tp-input">
            {DATA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="tp-btn-primary text-sm mb-4">Convert</button>
      {results.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-tp-border">
          {results.map((r, i) => (
            <div key={r.unit} className={`flex justify-between px-4 py-2 text-sm ${i % 2 === 0 ? 'bg-navy-800/30' : 'bg-navy-800/10'} ${r.unit === from ? 'border-l-2 border-tp-blue' : ''}`}>
              <span className="text-slate-400 w-10">{r.unit}</span>
              <span className="text-slate-200 font-mono">{r.val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Power Consumption Estimator ───────────────────────────────────────────────
function PowerEstimator() {
  const [watts, setWatts] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('0.12');
  const [result, setResult] = useState<{ daily: string; monthly: string; yearly: string; cost: string } | null>(null);

  function calculate() {
    const w = parseFloat(watts);
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if (!w || !h || !r) return;
    const dailyKWh = (w * h) / 1000;
    const monthlyCost = dailyKWh * 30 * r;
    setResult({
      daily: dailyKWh.toFixed(3),
      monthly: (dailyKWh * 30).toFixed(2),
      yearly: (dailyKWh * 365).toFixed(1),
      cost: monthlyCost.toFixed(2),
    });
  }

  return (
    <div className="tp-card p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-1">Power Consumption Estimator</h3>
      <p className="text-sm text-slate-400 mb-4">Calculate electricity usage and cost.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Device power (W)</label>
          <input type="number" value={watts} onChange={e => setWatts(e.target.value)} placeholder="e.g. 65" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Usage per day (hrs)</label>
          <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 8" className="tp-input w-full" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Electricity rate ($/kWh)</label>
          <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 0.12" className="tp-input w-full" />
        </div>
      </div>
      <button onClick={calculate} className="tp-btn-primary text-sm mb-4">Calculate</button>
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Daily', val: result.daily, unit: 'kWh' },
            { label: 'Monthly', val: result.monthly, unit: 'kWh' },
            { label: 'Yearly', val: result.yearly, unit: 'kWh' },
            { label: 'Monthly cost', val: `$${result.cost}`, unit: 'USD est.' },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-navy-800/60 border border-tp-border p-3 text-center">
              <div className="text-lg font-bold text-tp-blue font-mono">{item.val}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
              <div className="text-xs text-slate-600">{item.unit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'ppi', label: 'PPI Calculator', icon: '📺', component: PPICalculator },
  { id: 'ohm', label: "Ohm's Law", icon: '⚡', component: OhmsLawCalculator },
  { id: 'ratio', label: 'Aspect Ratio', icon: '📐', component: AspectRatioCalculator },
  { id: 'data', label: 'Data Units', icon: '💾', component: DataConverter },
  { id: 'power', label: 'Power Cost', icon: '🔋', component: PowerEstimator },
];

export default function TechCalculators() {
  const [active, setActive] = useState('ppi');
  const ActiveTool = TOOLS.find(t => t.id === active)!.component;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${active === t.id ? 'bg-tp-blue border-tp-blue text-white' : 'border-tp-border text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tool */}
      <ActiveTool />
    </div>
  );
}
