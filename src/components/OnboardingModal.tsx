import React, { useState } from 'react';
import { CreditBureau } from '../types';
import { 
  X, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Calculator,
  Building2,
  CreditCard,
  Wallet
} from 'lucide-react';
import { formatINR } from '../utils/creditCalculator';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('Suyog Belote');
  const [email, setEmail] = useState('suyog.belote@example.in');
  const [city, setCity] = useState('Pune, Maharashtra');
  const [bureau, setBureau] = useState<CreditBureau>('CIBIL');
  const [currentScore, setCurrentScore] = useState<number>(635);
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState<number>(85000);
  const [monthlyLivingExpenses, setMonthlyLivingExpenses] = useState<number>(28000);

  // Credit Cards
  const [cards, setCards] = useState([
    { id: '1', bankName: 'HDFC Bank', cardName: 'Regalia Gold', creditLimit: 120000, currentBalance: 78000, minPayment: 3900 },
  ]);

  // Loans
  const [loans, setLoans] = useState([
    { id: '1', lenderName: 'ICICI Bank', loanType: 'PERSONAL', totalPrincipal: 300000, outstandingBalance: 180000, monthlyEmi: 11200, interestRate: 13.5 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Live Calculations
  const totalLoanEmi = loans.reduce((acc, l) => acc + (Number(l.monthlyEmi) || 0), 0);
  const totalCardMin = cards.reduce((acc, c) => acc + (Number(c.minPayment) || Math.round((Number(c.currentBalance) || 0) * 0.05)), 0);
  const totalMonthlyDebt = totalLoanEmi + totalCardMin;
  const liveDti = monthlyGrossIncome > 0 ? Math.round((totalMonthlyDebt / monthlyGrossIncome) * 100) : 0;

  const totalCardLimit = cards.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);
  const totalCardBalance = cards.reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  const liveUtilization = totalCardLimit > 0 ? Math.round((totalCardBalance / totalCardLimit) * 100) : 0;

  const handleAddCard = () => {
    setCards(prev => [
      ...prev,
      {
        id: String(Date.now()),
        bankName: 'SBI Card',
        cardName: 'SimplyCLICK',
        creditLimit: 50000,
        currentBalance: 15000,
        minPayment: 750,
      },
    ]);
  };

  const handleRemoveCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleAddLoan = () => {
    setLoans(prev => [
      ...prev,
      {
        id: String(Date.now()),
        lenderName: 'Axis Bank',
        loanType: 'PERSONAL',
        totalPrincipal: 200000,
        outstandingBalance: 120000,
        monthlyEmi: 7500,
        interestRate: 14,
      },
    ]);
  };

  const handleRemoveLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          city,
          bureau,
          currentScore: Number(currentScore),
          monthlyGrossIncome: Number(monthlyGrossIncome),
          monthlyLivingExpenses: Number(monthlyLivingExpenses),
          creditCards: cards,
          loans,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to onboard borrower');
      }

      const data = await res.json();
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-white">Scenario 1: User Onboarding & Assessment</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Register borrower profile and automatically compute DTI / FOIR and Credit Utilization
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Live Backend Calculations:</span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">DTI / FOIR: </span>
              <strong className={`font-mono ${liveDti > 45 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {liveDti}%
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Card Utilization: </span>
              <strong className={`font-mono ${liveUtilization > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {liveUtilization}%
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Total Obligations: </span>
              <strong className="font-mono text-white">{formatINR(totalMonthlyDebt)}/mo</strong>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Personal & Credit Bureau</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Borrower Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">City & State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Credit Bureau & Initial Score</label>
                <div className="flex gap-2">
                  <select
                    value={bureau}
                    onChange={(e) => setBureau(e.target.value as CreditBureau)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CIBIL">CIBIL</option>
                    <option value="EXPERIAN">Experian</option>
                  </select>
                  <input
                    type="number"
                    min="300"
                    max="900"
                    value={currentScore}
                    onChange={(e) => setCurrentScore(Number(e.target.value))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Income & Living Costs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Income & Obligations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Monthly Gross Income (₹)</label>
                <input
                  type="number"
                  required
                  value={monthlyGrossIncome}
                  onChange={(e) => setMonthlyGrossIncome(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Monthly Living Expenses / Rent (₹)</label>
                <input
                  type="number"
                  value={monthlyLivingExpenses}
                  onChange={(e) => setMonthlyLivingExpenses(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Credit Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Active Credit Cards</h4>
              <button
                type="button"
                onClick={handleAddCard}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {cards.map((c, idx) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs items-center">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] text-slate-400 block">Bank</label>
                    <input
                      type="text"
                      value={c.bankName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCards(prev => prev.map(item => item.id === c.id ? { ...item, bankName: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] text-slate-400 block">Card Name</label>
                    <input
                      type="text"
                      value={c.cardName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCards(prev => prev.map(item => item.id === c.id ? { ...item, cardName: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Limit (₹)</label>
                    <input
                      type="number"
                      value={c.creditLimit}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCards(prev => prev.map(item => item.id === c.id ? { ...item, creditLimit: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Balance (₹)</label>
                    <input
                      type="number"
                      value={c.currentBalance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCards(prev => prev.map(item => item.id === c.id ? { ...item, currentBalance: val, minPayment: Math.round(val * 0.05) } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-3">
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(c.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Active Loans */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Active Loans & EMIs</h4>
              <button
                type="button"
                onClick={handleAddLoan}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Loan</span>
              </button>
            </div>

            <div className="space-y-3">
              {loans.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs items-center">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Lender</label>
                    <input
                      type="text"
                      value={l.lenderName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLoans(prev => prev.map(item => item.id === l.id ? { ...item, lenderName: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Type</label>
                    <select
                      value={l.loanType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setLoans(prev => prev.map(item => item.id === l.id ? { ...item, loanType: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="HOME">Home</option>
                      <option value="AUTO">Auto</option>
                      <option value="GOLD">Gold</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Outstanding (₹)</label>
                    <input
                      type="number"
                      value={l.outstandingBalance}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLoans(prev => prev.map(item => item.id === l.id ? { ...item, outstandingBalance: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">EMI / Month (₹)</label>
                    <input
                      type="number"
                      value={l.monthlyEmi}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLoans(prev => prev.map(item => item.id === l.id ? { ...item, monthlyEmi: val } : item));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveLoan(l.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering & Calculating DTI...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile & Launch Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
