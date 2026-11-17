import type { Device } from '../../types';

interface Props {
  device: Device;
  lang?: string;
}

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 90 ? '#22c55e' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="45" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="inherit">
        {score}
      </text>
      <text x="48" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="inherit">
        /100
      </text>
    </svg>
  );
}

function scoreLabel(score: number, isHi: boolean) {
  if (score >= 93) return isHi ? 'असाधारण' : 'Exceptional';
  if (score >= 88) return isHi ? 'उत्कृष्ट' : 'Excellent';
  if (score >= 80) return isHi ? 'बहुत अच्छा' : 'Very Good';
  if (score >= 70) return isHi ? 'अच्छा' : 'Good';
  return isHi ? 'औसत' : 'Average';
}

export default function ExpertScoreCard({ device, lang = 'en' }: Props) {
  if (!device.expertScore && !device.proscons?.length) return null;
  const isHi = lang === 'hi';
  const pros = device.proscons?.filter(p => p.type === 'pro') ?? [];
  const cons = device.proscons?.filter(p => p.type === 'con') ?? [];

  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700/40 bg-slate-800/40">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
          {isHi ? 'विशेषज्ञ मूल्यांकन' : 'Expert Verdict'}
        </h2>
      </div>

      <div className="p-5">
        {/* Score row */}
        {device.expertScore != null && (
          <div className="flex items-center gap-5 mb-5">
            <ScoreRing score={device.expertScore} />
            <div>
              <div className="text-xl font-bold text-slate-100">
                {scoreLabel(device.expertScore, isHi)}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                {isHi ? 'टेकपीडिया विशेषज्ञ स्कोर' : 'Techpedia Expert Score'}
              </div>
            </div>
          </div>
        )}

        {/* Pros / Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pros.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">+</span>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    {isHi ? 'खूबियाँ' : 'Pros'}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">−</span>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                    {isHi ? 'कमियाँ' : 'Cons'}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
