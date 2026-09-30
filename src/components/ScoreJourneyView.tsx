import React, { useState } from 'react';
import { UserProfile, ScoreHistoryPoint } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Award, 
  BarChart2, 
  ArrowUpRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { getCreditTier } from '../utils/creditCalculator';

interface ScoreJourneyViewProps {
  user: UserProfile;
}

export const ScoreJourneyView: React.FC<ScoreJourneyViewProps> = ({ user }) => {
  const [activeMetric, setActiveMetric] = useState<'score' | 'utilization' | 'dti'>('score');
  const [hoveredPoint, setHoveredPoint] = useState<ScoreHistoryPoint | null>(null);

  const history = user.scoreHistory || [];
  const firstPoint = history[0] || { score: user.currentScore, utilizationPercent: 0, dtiPercent: 0 };
  const latestPoint = history[history.length - 1] || firstPoint;
  const netScoreGain = latestPoint.score - firstPoint.score;
  const tier = getCreditTier(latestPoint.score);

  // SVG Chart Dimensions
  const width = 800;
  const height = 320;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min/Max for plotting
  let minY = 300;
  let maxY = 900;
  if (activeMetric === 'score') {
    const scores = history.map(h => h.score);
    minY = Math.max(300, Math.min(...scores) - 40);
    maxY = Math.min(900, Math.max(...scores) + 40);
  } else {
    minY = 0;
    maxY = 100;
  }

  const getYValue = (p: ScoreHistoryPoint) => {
    if (activeMetric === 'score') return p.score;
    if (activeMetric === 'utilization') return p.utilizationPercent;
    return p.dtiPercent;
  };

  const getCoordinates = (index: number, val: number) => {
    const x = padding.left + (history.length > 1 ? (index / (history.length - 1)) * chartWidth : chartWidth / 2);
    const y = padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
    return { x, y };
  };

  // Build SVG path
  const points = history.map((h, i) => getCoordinates(i, getYValue(h)));
  const pathD = points.reduce((acc, curr, i) => (i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Scenario 3: Credit Score Journey
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Progress Tracking Over Time
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Visualizing the historical impact of following AI advisor recommendations, debt consolidation, and disciplined credit utilization.
            </p>
          </div>

          {/* Quick Metrics Counter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Initial Score</span>
              <span className="text-xl font-bold font-mono text-slate-300">{firstPoint.score}</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Current Score</span>
              <span className="text-xl font-bold font-mono text-white">{latestPoint.score}</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[11px] text-emerald-400 block font-semibold">Net Progress</span>
              <span className="text-xl font-bold font-mono text-emerald-300 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                +{netScoreGain} pts
              </span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Tracking Period</span>
              <span className="text-xl font-bold font-mono text-slate-200">{history.length} Months</span>
            </div>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMetric('score')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMetric === 'score'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              CIBIL Score Trajectory
            </button>
            <button
              onClick={() => setActiveMetric('utilization')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMetric === 'utilization'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Utilization % Drop
            </button>
            <button
              onClick={() => setActiveMetric('dti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMetric === 'dti'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              FOIR / DTI Reduction
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span>
              <span>Your Trajectory</span>
            </div>
            {activeMetric === 'score' && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400/60 border-t border-dashed border-amber-400"></span>
                <span>Prime Benchmark (750)</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="mt-4 relative bg-slate-950/80 rounded-xl border border-slate-800/90 p-3 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px] h-72">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yVal = Math.round(minY + ratio * (maxY - minY));
              const yPos = padding.top + chartHeight - ratio * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={width - padding.right}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {yVal}{activeMetric !== 'score' ? '%' : ''}
                  </text>
                </g>
              );
            })}

            {/* 750 Prime Target Line if score mode */}
            {activeMetric === 'score' && 750 >= minY && 750 <= maxY && (
              <g>
                {(() => {
                  const targetY = padding.top + chartHeight - ((750 - minY) / (maxY - minY)) * chartHeight;
                  return (
                    <>
                      <line
                        x1={padding.left}
                        y1={targetY}
                        x2={width - padding.right}
                        y2={targetY}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        opacity="0.6"
                      />
                      <text
                        x={width - padding.right}
                        y={targetY - 6}
                        fill="#f59e0b"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="end"
                      >
                        Prime 750+ Target
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Filled Area Gradient */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Main Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Point Circles and X-Axis Labels */}
            {history.map((h, i) => {
              const { x, y } = getCoordinates(i, getYValue(h));
              const isHovered = hoveredPoint === h;

              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(h)}>
                  {/* Vertical guide on hover */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke="#34d399"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Circle marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth={isHovered ? 3 : 2}
                  />

                  {/* Numeric value pill above point */}
                  <text
                    x={x}
                    y={y - 12}
                    fill={isHovered ? '#34d399' : '#f8fafc'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {getYValue(h)}{activeMetric !== 'score' ? '%' : ''}
                  </text>

                  {/* X Axis Month Label */}
                  <text
                    x={x}
                    y={padding.top + chartHeight + 22}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {h.monthLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Float */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-xl max-w-xs text-xs pointer-events-none z-20">
              <div className="flex items-center justify-between font-bold text-white mb-1">
                <span>{hoveredPoint.monthLabel}</span>
                <span className="text-emerald-400 font-mono">{hoveredPoint.score} Score</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 py-1 border-t border-b border-slate-800 my-1">
                <div>Utilization: <span className="font-mono text-white">{hoveredPoint.utilizationPercent}%</span></div>
                <div>FOIR/DTI: <span className="font-mono text-white">{hoveredPoint.dtiPercent}%</span></div>
              </div>
              {hoveredPoint.eventNote && (
                <p className="text-[11px] text-amber-300/90 mt-1">
                  <strong>Milestone:</strong> {hoveredPoint.eventNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Historical Milestones & Audit Trail Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Milestone Audit & Actions Timeline</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Month</th>
                <th className="py-3 px-4 font-semibold">CIBIL Score</th>
                <th className="py-3 px-4 font-semibold">Utilization</th>
                <th className="py-3 px-4 font-semibold">DTI</th>
                <th className="py-3 px-4 font-semibold">Milestone Event / Trigger</th>
                <th className="py-3 px-4 font-semibold text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.map((item, idx) => {
                const prev = idx > 0 ? history[idx - 1] : null;
                const ptDelta = prev ? item.score - prev.score : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-4 font-sans font-medium text-white">{item.monthLabel}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{item.score}</td>
                    <td className="py-3 px-4">{item.utilizationPercent}%</td>
                    <td className="py-3 px-4">{item.dtiPercent}%</td>
                    <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                      {item.eventNote || 'Routine monthly review'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ptDelta !== 0 ? (
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          ptDelta > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                        }`}>
                          {ptDelta > 0 ? `+${ptDelta}` : ptDelta}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
