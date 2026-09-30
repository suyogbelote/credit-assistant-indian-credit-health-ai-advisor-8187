import React from 'react';
import { UserProfile } from '../types';
import { calculateFinancialMetrics, formatINR } from '../utils/creditCalculator';
import { 
  Percent, 
  Wallet, 
  Clock, 
  CalendarClock, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface CreditPillarsProps {
  user: UserProfile;
  onOpenPayoff: (type?: 'CREDIT_CARD' | 'LOAN') => void;
  onOpenAiConsult: () => void;
}

export const CreditPillars: React.FC<CreditPillarsProps> = ({
  user,
  onOpenPayoff,
  onOpenAiConsult,
}) => {
  const metrics = calculateFinancialMetrics(user);

  // Utilization assessment
  const isHighUtil = metrics.utilizationPercent > 30;
  const isCriticalUtil = metrics.utilizationPercent > 50;

  // DTI assessment
  const isHighDti = metrics.dtiPercent > 40;
  const isCriticalDti = metrics.dtiPercent > 50;

  return (
    <div className="space-y-6">
      {/* 5 Indian Credit Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Credit Utilization */}
        <div className={`p-4 rounded-xl border transition-all ${
          isCriticalUtil 
            ? 'bg-rose-950/20 border-rose-800/60' 
            : isHighUtil 
            ? 'bg-amber-950/20 border-amber-800/60' 
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Card Utilization</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">30% Weight</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${
              isCriticalUtil ? 'text-rose-400' : isHighUtil ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {metrics.utilizationPercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target &lt; 30%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCriticalUtil ? 'bg-rose-500' : isHighUtil ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.utilizationPercent)}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Limit: {formatINR(metrics.totalCreditLimit)}</span>
            {isHighUtil && (
              <button
                onClick={() => onOpenPayoff('CREDIT_CARD')}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Pay Down
              </button>
            )}
          </div>
        </div>

        {/* 2. DTI / FOIR Ratio */}
        <div className={`p-4 rounded-xl border transition-all ${
          isCriticalDti 
            ? 'bg-rose-950/20 border-rose-800/60' 
            : isHighDti 
            ? 'bg-amber-950/20 border-amber-800/60' 
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">DTI / FOIR Ratio</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">RBI Standard</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${
              isCriticalDti ? 'text-rose-400' : isHighDti ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {metrics.dtiPercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Cap &lt; 40-50%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCriticalDti ? 'bg-rose-500' : isHighDti ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.dtiPercent)}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>EMI: {formatINR(metrics.totalMonthlyDebtObligations)}/mo</span>
            {isHighDti && (
              <button
                onClick={() => onOpenPayoff('LOAN')}
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Prepay EMI
              </button>
            )}
          </div>
        </div>

        {/* 3. On-Time Payment Record */}
        <div className="p-4 rounded-xl border bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Payment History</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">35% Weight</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${
              user.onTimePaymentRatePercent >= 98 ? 'text-emerald-400' : user.onTimePaymentRatePercent >= 90 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {user.onTimePaymentRatePercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">0 DPD Target</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${user.onTimePaymentRatePercent}%` }}
            />
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400">
            {user.onTimePaymentRatePercent < 95 ? '1 late EMI in last 6 mos' : 'Clean DPD repayment streak'}
          </p>
        </div>

        {/* 4. Credit Age & Mix */}
        <div className="p-4 rounded-xl border bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Credit Age & Mix</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">15% Weight</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {user.creditAgeYears} yrs
            </span>
            <span className="text-xs text-slate-400">Mature</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full"
              style={{ width: `${Math.min(100, (user.creditAgeYears / 6) * 100)}%` }}
            />
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400">
            {user.loans.length} loans · {user.creditCards.length} cards
          </p>
        </div>

        {/* 5. Recent Inquiries */}
        <div className={`p-4 rounded-xl border transition-all ${
          user.recentHardInquiries > 2
            ? 'bg-amber-950/20 border-amber-800/60'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Hard Inquiries</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Last 6 Mos</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono ${
              user.recentHardInquiries > 2 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {user.recentHardInquiries}
            </span>
            <span className="text-xs text-slate-400 font-mono">&le; 1 Safe</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                user.recentHardInquiries > 2 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (user.recentHardInquiries / 4) * 100)}%` }}
            />
          </div>
          <p className="mt-2.5 text-[11px] text-slate-400">
            {user.recentHardInquiries > 2 ? 'Inquiry clustering detected' : 'Inquiries within safe limits'}
          </p>
        </div>
      </div>

      {/* Identified Bottlenecks Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Active Credit Bottlenecks</h3>
            <span className="text-xs text-slate-400">
              Factors holding down your score from reaching 750+ Prime
            </span>
          </div>

          <button
            onClick={onOpenAiConsult}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Gemini Roadmap</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Bottleneck 1: Card Utilization */}
          {metrics.utilizationPercent > 30 ? (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-900/40 relative">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <h4 className="text-xs font-bold text-white">Revolving Card Utilization at {metrics.utilizationPercent}%</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    CIBIL penalizes utilization &gt; 30%. Your card balances total {formatINR(metrics.totalCardBalance)} against {formatINR(metrics.totalCreditLimit)} total limit.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +35 to +50 pts
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">Action: Prepay before billing cycle date</span>
                <button
                  onClick={() => onOpenPayoff('CREDIT_CARD')}
                  className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Pay Card &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">Healthy Utilization ({metrics.utilizationPercent}%)</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your revolving card balance is well within the 30% golden rule benchmark.
              </p>
            </div>
          )}

          {/* Bottleneck 2: FOIR / DTI */}
          {metrics.dtiPercent > 40 ? (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-900/40 relative">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-bold text-white">High DTI / FOIR Ratio ({metrics.dtiPercent}%)</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Total monthly debt commitments ({formatINR(metrics.totalMonthlyDebtObligations)}) consume over 40% of your ₹{metrics.grossIncome.toLocaleString('en-IN')} gross salary.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +18 to +25 pts
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">Action: Prepay high-interest personal loan</span>
                <button
                  onClick={() => onOpenPayoff('LOAN')}
                  className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Prepay Loan &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white">FOIR / DTI within RBI Comfort ({metrics.dtiPercent}%)</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your debt-to-income ratio qualifies comfortably for prime banking rates.
              </p>
            </div>
          )}

          {/* Bottleneck 3: Unsecured vs Secured Ratio */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h4 className="text-xs font-bold text-white">Credit Mix Balance</h4>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Active unsecured debt (cards & personal loans) weighted vs secured debt. A 50:50 ratio stabilizes your CIBIL rating.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-400 whitespace-nowrap bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                +12 pts
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">Tip: Prioritize unsecured loan closure</span>
              <button
                onClick={onOpenAiConsult}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Advice &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
