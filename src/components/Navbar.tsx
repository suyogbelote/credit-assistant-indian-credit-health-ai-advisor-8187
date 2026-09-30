import React from 'react';
import { CreditBureau, UserProfile } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  CreditCard, 
  UserCheck, 
  BarChart3,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { getCreditTier } from '../utils/creditCalculator';

interface NavbarProps {
  currentTab: 'overview' | 'ai-advisor' | 'journey' | 'payoff' | 'onboard';
  setCurrentTab: (tab: 'overview' | 'ai-advisor' | 'journey' | 'payoff' | 'onboard') => void;
  currentUser: UserProfile;
  usersList: { id: string; fullName: string; currentScore: number; bureau: CreditBureau }[];
  onSelectUser: (userId: string) => void;
  onOpenOnboarding: () => void;
  bureau: CreditBureau;
  onChangeBureau: (bureau: CreditBureau) => void;
  onRunScenario: (scenarioNum: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  usersList,
  onSelectUser,
  onOpenOnboarding,
  bureau,
  onChangeBureau,
  onRunScenario,
}) => {
  const tierInfo = getCreditTier(currentUser.currentScore);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Scenario Bar */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Interactive Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onRunScenario(1)}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Scenario 1: User Onboarding and Initial Assessment"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Onboarding & DTI</span>
            </button>
            <button
              onClick={() => onRunScenario(2)}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Scenario 2: AI-Powered Financial Consultation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. AI Consultation</span>
            </button>
            <button
              onClick={() => onRunScenario(3)}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Scenario 3: Progress Tracking via Data Visualization"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>3. Journey Tracking</span>
            </button>
            <button
              onClick={() => onRunScenario(4)}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Scenario 4: Real-time Credit Health Monitoring & Debt Payoff"
            >
              <CreditCard className="w-3.5 h-3.5 text-rose-400" />
              <span>4. Real-time Payoff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <span className="text-xl font-black text-white">₹</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">Credit Assistant</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  India
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Credit Health & RBI-Aligned Roadmap</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentTab('ai-advisor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'ai-advisor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Advisor & Roadmap</span>
            </button>
            <button
              onClick={() => setCurrentTab('journey')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'journey'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Score Journey</span>
            </button>
            <button
              onClick={() => setCurrentTab('payoff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'payoff'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Payoff & Simulator</span>
            </button>
          </nav>

          {/* Right Controls: Bureau Switcher & User Selector */}
          <div className="flex items-center gap-2.5">
            {/* Bureau Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onChangeBureau('CIBIL')}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  bureau === 'CIBIL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CIBIL
              </button>
              <button
                onClick={() => onChangeBureau('EXPERIAN')}
                className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                  bureau === 'EXPERIAN' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Experian
              </button>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    onOpenOnboarding();
                  } else {
                    onSelectUser(e.target.value);
                  }
                }}
                className="bg-slate-900 border border-slate-700/80 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                {usersList.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                    {u.fullName} ({u.currentScore})
                  </option>
                ))}
                <option value="new" className="bg-slate-900 text-emerald-400 font-semibold">
                  + Register New Borrower
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* Quick Register Button */}
            <button
              onClick={onOpenOnboarding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Assess Score</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-950 border-t border-slate-800/80 gap-1">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium cursor-pointer ${
            currentTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('ai-advisor')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium cursor-pointer ${
            currentTab === 'ai-advisor' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          AI Advisor
        </button>
        <button
          onClick={() => setCurrentTab('journey')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium cursor-pointer ${
            currentTab === 'journey' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          Journey
        </button>
        <button
          onClick={() => setCurrentTab('payoff')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium cursor-pointer ${
            currentTab === 'payoff' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          Payoff
        </button>
      </div>
    </header>
  );
};
