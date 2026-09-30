import React, { useState } from 'react';
import { UserProfile, CreditCardItem, LoanItem } from '../types';
import { calculateFinancialMetrics, formatINR, formatNumberINR } from '../utils/creditCalculator';
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  PieChart as PieIcon,
  RefreshCw,
  Plus
} from 'lucide-react';

interface DebtPayoffViewProps {
  user: UserProfile;
  onPayoffSuccess: (result: any) => void;
}

export const DebtPayoffView: React.FC<DebtPayoffViewProps> = ({ user, onPayoffSuccess }) => {
  const metrics = calculateFinancialMetrics(user);

  // Selected item for payoff
  const [selectedType, setSelectedType] = useState<'CREDIT_CARD' | 'LOAN'>('CREDIT_CARD');
  const [selectedCardId, setSelectedCardId] = useState<string>(user.creditCards[0]?.id || '');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(user.loans.find(l => l.status === 'ACTIVE')?.id || '');
  const [payoffAmount, setPayoffAmount] = useState<number>(50000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDeltaResult, setRecentDeltaResult] = useState<any>(null);

  // "What-if" simulator state
  const [simCardPayment, setSimCardPayment] = useState<number>(30000);
  const [simNewLoan, setSimNewLoan] = useState<number>(0);
  const [simMissedEmi, setSimMissedEmi] = useState<number>(0);
  const [simLimitBoost, setSimLimitBoost] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  const selectedCard = user.creditCards.find(c => c.id === selectedCardId) || user.creditCards[0];
  const selectedLoan = user.loans.find(l => l.id === selectedLoanId) || user.loans[0];

  const handlePayoffSubmit = async () => {
    setIsProcessing(true);
    setRecentDeltaResult(null);

    const itemId = selectedType === 'CREDIT_CARD' ? selectedCardId : selectedLoanId;

    try {
      const res = await fetch(`/api/user/${user.id}/payoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          itemId,
          payoffAmount: Number(payoffAmount),
          markAsClosed: selectedType === 'LOAN' && Number(payoffAmount) >= (selectedLoan?.outstandingBalance || 0),
        }),
      });

      if (!res.ok) throw new Error('Payoff failed');
      const data = await res.json();
      setRecentDeltaResult(data);
      onPayoffSuccess(data);
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const runSimulation = async () => {
    try {
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cardPaymentAmount: simCardPayment,
          newLoanAmount: simNewLoan,
          missedEmiCount: simMissedEmi,
          requestLimitIncrease: simLimitBoost,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Simulator error', err);
    }
  };

  // Donut chart calculation for debt distribution
  const donutItems = [
    ...user.creditCards.map(c => ({
      label: `${c.bankName} (${c.cardName})`,
      amount: c.currentBalance,
      color: '#f43f5e',
      type: 'Card Balance',
    })),
    ...user.loans.filter(l => l.status === 'ACTIVE').map(l => ({
      label: `${l.lenderName} (${l.loanType})`,
      amount: l.outstandingBalance,
      color: l.loanType === 'HOME' ? '#3b82f6' : l.loanType === 'AUTO' ? '#14b8a6' : '#eab308',
      type: 'Loan Principal',
    })),
  ].filter(item => item.amount > 0);

  const totalDonutDebt = donutItems.reduce((acc, curr) => acc + curr.amount, 0);

  // SVG Pie/Donut calculations
  let accumulatedAngle = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-8">
      {/* Scenario 4 Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Scenario 4: Real-time Credit Monitoring
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Instant Debt Payoff & Recalculation Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Pay off or reduce card balances and active loans. Our system instantly recalculates credit utilization, adjusts your DTI / FOIR, projects the score improvement delta, and records the milestone in your official timeline.
            </p>
          </div>

          {recentDeltaResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block text-white">Score Improvement Calculated!</span>
                <span className="text-lg font-extrabold font-mono text-emerald-400">
                  {recentDeltaResult.previousScore} &rarr; {recentDeltaResult.newScore} (+{recentDeltaResult.scoreDelta} pts)
                </span>
                <span className="text-[11px] text-emerald-200/80 block">
                  Card Utilization dropped to {recentDeltaResult.newUtilization}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Debt Payoff Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>Execute Debt Payoff / Prepayment</span>
            </h3>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setSelectedType('CREDIT_CARD')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedType === 'CREDIT_CARD'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit Card Balance</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('LOAN')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedType === 'LOAN'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Active Loan Principal</span>
              </button>
            </div>

            {/* Item Selector */}
            {selectedType === 'CREDIT_CARD' ? (
              <div className="space-y-3 mb-5">
                <label className="text-xs font-semibold text-slate-300">Choose Credit Card to Pay:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {user.creditCards.map(c => {
                    const isSelected = c.id === selectedCardId;
                    const cardUtil = c.creditLimit > 0 ? Math.round((c.currentBalance / c.creditLimit) * 100) : 0;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCardId(c.id);
                          setPayoffAmount(Math.min(c.currentBalance, 50000));
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{c.bankName}</span>
                          <span className={`font-mono text-[11px] font-bold ${cardUtil > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {cardUtil}% util
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{c.cardName}</p>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Balance:</span>
                          <span className="text-sm font-bold font-mono text-white">{formatINR(c.currentBalance)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 text-right">Limit: {formatINR(c.creditLimit)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <label className="text-xs font-semibold text-slate-300">Choose Loan to Prepay / Close:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {user.loans.filter(l => l.status === 'ACTIVE').map(l => {
                    const isSelected = l.id === selectedLoanId;
                    return (
                      <div
                        key={l.id}
                        onClick={() => {
                          setSelectedLoanId(l.id);
                          setPayoffAmount(Math.min(l.outstandingBalance, 50000));
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{l.lenderName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {l.loanType}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Outstanding:</span>
                          <span className="text-sm font-bold font-mono text-white">{formatINR(l.outstandingBalance)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>EMI: {formatINR(l.monthlyEmi)}/mo</span>
                          <span>ROI: {l.interestRate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payoff Amount Input */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Payment Amount (INR):</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const maxVal = selectedType === 'CREDIT_CARD' ? selectedCard?.currentBalance : selectedLoan?.outstandingBalance;
                      setPayoffAmount(maxVal || 0);
                    }}
                    className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Pay Full Outstanding
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  value={payoffAmount}
                  onChange={(e) => setPayoffAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-8 pr-4 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="50000"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10000, 25000, 50000, 75000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPayoffAmount(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                      payoffAmount === val
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handlePayoffSubmit}
              disabled={isProcessing || payoffAmount <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Recalculating Credit Health...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Execute Payoff & Recalculate Score</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive What-If Simulator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>"What-If" Credit Score Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulate actions before committing them to your bank account to project their exact CIBIL score influence.
            </p>

            <div className="space-y-4 text-xs">
              {/* Slider 1: Pay card balance */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Pay off Credit Card balance:</span>
                  <span className="font-mono text-emerald-400 font-bold">₹{simCardPayment.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={simCardPayment}
                  onChange={(e) => setSimCardPayment(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: New Loan inquiry */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Take a new Personal Loan:</span>
                  <span className="font-mono text-amber-400 font-bold">₹{simNewLoan.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="50000"
                  value={simNewLoan}
                  onChange={(e) => setSimNewLoan(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Checkboxes for limit boost and missed EMI */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={simLimitBoost}
                    onChange={(e) => setSimLimitBoost(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Request ₹50,000 Credit Limit Boost</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={simMissedEmi > 0}
                    onChange={(e) => setSimMissedEmi(e.target.checked ? 1 : 0)}
                    className="accent-rose-500 rounded"
                  />
                  <span>Simulate 1 Missed EMI (30+ DPD)</span>
                </label>
              </div>

              <button
                onClick={runSimulation}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Score Impact</span>
              </button>

              {simResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Projected CIBIL Score:</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {simResult.projectedScore}{' '}
                      <span className={`text-xs font-mono ${simResult.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({simResult.delta >= 0 ? `+${simResult.delta}` : simResult.delta} pts)
                      </span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    New Utilization: <strong className="text-slate-200">{simResult.newUtilization}%</strong>
                  </div>
                  {simResult.notes?.map((n: string, i: number) => (
                    <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{n}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Debt Breakdown & Utilization Donut Chart */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-400" />
                <span>Debt & Utilization Breakdown</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Total: {formatINR(totalDonutDebt)}</span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg viewBox="0 0 200 200" className="w-52 h-52">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="24"
                />
                {donutItems.map((item, idx) => {
                  const share = totalDonutDebt > 0 ? item.amount / totalDonutDebt : 0;
                  const strokeDasharray = `${share * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedAngle;
                  accumulatedAngle += share * circumference;

                  return (
                    <circle
                      key={idx}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="24"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700 ease-out"
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Utilization</span>
                <span className={`text-2xl font-extrabold font-mono ${
                  metrics.utilizationPercent > 50 ? 'text-rose-400' : metrics.utilizationPercent > 30 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {metrics.utilizationPercent}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Cap: 30%</span>
              </div>
            </div>

            {/* Legend & Portfolio Items */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800 text-xs">
              {donutItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">{item.label}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Indian RBI Rule Reminder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>RBI Lending Ratio Benchmark</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Under RBI Fair Lending standards, keeping your <strong>Fixed Obligation to Income Ratio (FOIR) under 40%</strong> and your <strong>Credit Card Utilization under 30%</strong> provides top-tier eligibility for pre-approved credit lines and home loan rate discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
