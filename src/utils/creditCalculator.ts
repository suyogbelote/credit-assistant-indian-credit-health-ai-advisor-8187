import { CreditTier, UserProfile } from '../types';

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatNumberINR(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

export function getCreditTier(score: number): {
  tier: CreditTier;
  label: string;
  color: string;
  bgBadge: string;
  description: string;
  interestRateImpact: string;
} {
  if (score >= 750) {
    return {
      tier: 'EXCELLENT',
      label: 'Excellent (Prime)',
      color: 'text-emerald-400',
      bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Prime borrower profile. Banks offer pre-approved loans and competitive interest rates.',
      interestRateImpact: 'Home loans at 8.35% - 8.65%, instant credit card approvals with high limits.',
    };
  }
  if (score >= 700) {
    return {
      tier: 'GOOD',
      label: 'Good (Standard)',
      color: 'text-teal-400',
      bgBadge: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
      description: 'Acceptable credit health. Qualifies for standard loans with minimal friction.',
      interestRateImpact: 'Home loans around 8.85% - 9.40%, standard personal loan rates 11% - 13%.',
    };
  }
  if (score >= 600) {
    return {
      tier: 'FAIR',
      label: 'Fair (Needs Attention)',
      color: 'text-amber-400',
      bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Moderate credit risk. High utilization or late payments require immediate correction.',
      interestRateImpact: 'Personal loans charged 14% - 19%, unsecured cards often rejected or need FD security.',
    };
  }
  return {
    tier: 'POOR',
    label: 'Poor (High Risk)',
    color: 'text-rose-400',
    bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    description: 'Subprime profile with severe bottlenecks or defaults. High likelihood of loan rejection.',
    interestRateImpact: 'Unsecured loans rejected; must use secured (gold/FD backed) cards to rebuild.',
  };
}

export function calculateFinancialMetrics(profile: Partial<UserProfile>) {
  const grossIncome = profile.monthlyGrossIncome || 0;
  
  // Calculate total monthly obligations (EMIs + card minimums)
  const activeLoans = (profile.loans || []).filter(l => l.status === 'ACTIVE');
  const totalLoanEmi = activeLoans.reduce((sum, loan) => sum + (loan.monthlyEmi || 0), 0);
  
  const totalCardBalance = (profile.creditCards || []).reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const totalCreditLimit = (profile.creditCards || []).reduce((sum, c) => sum + (c.creditLimit || 0), 0);
  const totalCardMinPayment = (profile.creditCards || []).reduce((sum, c) => sum + (c.minPayment || Math.round((c.currentBalance || 0) * 0.05)), 0);

  const totalMonthlyDebtObligations = totalLoanEmi + totalCardMinPayment;
  
  // DTI (Debt-to-Income / FOIR)
  const dtiPercent = grossIncome > 0 ? Math.min(100, Math.round((totalMonthlyDebtObligations / grossIncome) * 100)) : 0;
  
  // Credit Utilization Ratio (CUR)
  const utilizationPercent = totalCreditLimit > 0 ? Math.min(100, Math.round((totalCardBalance / totalCreditLimit) * 100)) : 0;
  
  // Total Outstanding Debt
  const totalLoanBalance = activeLoans.reduce((sum, loan) => sum + (loan.outstandingBalance || 0), 0);
  const totalDebt = totalLoanBalance + totalCardBalance;

  // Monthly disposable cash
  const livingExpenses = profile.monthlyLivingExpenses || 0;
  const netSavings = Math.max(0, grossIncome - totalMonthlyDebtObligations - livingExpenses);

  return {
    grossIncome,
    totalLoanEmi,
    totalCardBalance,
    totalCreditLimit,
    totalCardMinPayment,
    totalMonthlyDebtObligations,
    dtiPercent,
    utilizationPercent,
    totalLoanBalance,
    totalDebt,
    netSavings,
  };
}

export function estimateScoreChangeFromDebtPayoff(
  currentScore: number,
  initialUtilization: number,
  newUtilization: number,
  paidOffLoanCount: number
): number {
  let scoreDelta = 0;
  
  // Utilization improvement impact (accounts for ~30% of credit score)
  const utilDrop = Math.max(0, initialUtilization - newUtilization);
  if (utilDrop > 0) {
    if (initialUtilization > 50 && newUtilization <= 30) {
      // Big leap from dangerous to healthy
      scoreDelta += Math.round(utilDrop * 0.8 + 15);
    } else {
      scoreDelta += Math.round(utilDrop * 0.6);
    }
  }

  // Active loan payoff bonus (improves credit mix and DTI)
  if (paidOffLoanCount > 0) {
    scoreDelta += paidOffLoanCount * 12;
  }

  // Clamp new score between 300 and 900
  const projectedScore = Math.min(900, Math.max(300, currentScore + scoreDelta));
  return projectedScore - currentScore;
}
