import React from 'react';
import { CreditBureau } from '../types';
import { getCreditTier } from '../utils/creditCalculator';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  bureau: CreditBureau;
  previousScore?: number;
  onRunAiConsultation?: () => void;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  bureau,
  previousScore,
  onRunAiConsultation,
}) => {
  const tier = getCreditTier(score);
  const delta = previousScore !== undefined ? score - previousScore : 0;

  // Scale: 300 to 900 (range of 600)
  // Angle: -180 deg (left) to 0 deg (right), semicircle
  const minScore = 300;
  const maxScore = 900;
  const normalized = Math.min(maxScore, Math.max(minScore, score));
  const percent = (normalized - minScore) / (maxScore - minScore);
  
  // Angle for needle: from -140 deg to +140 deg (280 degree arc)
  const needleAngle = -140 + percent * 280;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      {/* Background ambient glow */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
        score >= 750 ? 'bg-emerald-500' : score >= 700 ? 'bg-teal-500' : score >= 600 ? 'bg-amber-500' : 'bg-rose-500'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Official Credit Score
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight">{bureau} Score</h2>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tier.bgBadge}`}>
              {tier.label}
            </span>
          </div>
        </div>

        {delta !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
            delta > 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <TrendingUp className={`w-3.5 h-3.5 ${delta < 0 ? 'rotate-180 text-rose-400' : ''}`} />
            <span>{delta > 0 ? `+${delta}` : delta} pts</span>
          </div>
        )}
      </div>

      {/* Gauge Visualization */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <svg viewBox="0 0 240 140" className="w-64 max-w-full drop-shadow-md">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />    {/* Poor: 300 - 599 */}
              <stop offset="45%" stopColor="#fbbf24" />   {/* Fair: 600 - 699 */}
              <stop offset="66%" stopColor="#2dd4bf" />   {/* Good: 700 - 749 */}
              <stop offset="100%" stopColor="#10b981" />  {/* Excellent: 750 - 900 */}
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 30 120 A 90 90 0 1 1 210 120"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Value colored track Arc */}
          <path
            d="M 30 120 A 90 90 0 1 1 210 120"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="0"
            opacity="0.9"
          />

          {/* Tick marks and labels */}
          <text x="24" y="136" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">300</text>
          <text x="68" y="44" fill="#fbbf24" fontSize="9" fontWeight="500" textAnchor="middle">600</text>
          <text x="135" y="24" fill="#2dd4bf" fontSize="9" fontWeight="500" textAnchor="middle">700</text>
          <text x="180" y="48" fill="#10b981" fontSize="9" fontWeight="500" textAnchor="middle">750</text>
          <text x="216" y="136" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">900</text>

          {/* Center Needle Pivot */}
          <g transform="translate(120, 120)">
            <g transform={`rotate(${needleAngle})`} className="transition-transform duration-1000 ease-out">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-74"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#needleGlow)"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-78"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
            <circle cx="0" cy="0" r="8" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="3.5" fill="#10b981" />
          </g>
        </svg>

        {/* Big Numerical Score Readout */}
        <div className="text-center -mt-3">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold text-white tracking-tight font-mono">{score}</span>
            <span className="text-sm text-slate-500 font-medium">/ 900</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{tier.description}</p>
        </div>
      </div>

      {/* Target Roadmap Banner */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {score >= 750 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-300">
            {score >= 750
              ? 'Eligible for prime home loans (8.35% p.a.)'
              : `Gap to 750+ Prime Tier: ${750 - score} points`}
          </span>
        </div>

        {score < 750 && onRunAiConsultation && (
          <button
            onClick={onRunAiConsultation}
            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline flex items-center gap-1"
          >
            <span>See Fix Plan</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};
