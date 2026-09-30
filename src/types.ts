export type CreditBureau = 'CIBIL' | 'EXPERIAN';

export type CreditTier = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface CreditCardItem {
  id: string;
  bankName: string;
  cardName: string;
  creditLimit: number;
  currentBalance: number;
  aprPercent?: number;
  minPayment: number;
}

export interface LoanItem {
  id: string;
  loanType: 'PERSONAL' | 'HOME' | 'AUTO' | 'GOLD' | 'EDUCATION' | 'CONSUMER';
  lenderName: string;
  totalPrincipal: number;
  outstandingBalance: number;
  monthlyEmi: number;
  interestRate: number;
  tenureMonthsRemaining: number;
  status: 'ACTIVE' | 'CLOSED' | 'SETTLED';
}

export interface ScoreHistoryPoint {
  date: string; // YYYY-MM
  monthLabel: string;
  score: number;
  utilizationPercent: number;
  dtiPercent: number;
  eventNote?: string;
}

export interface FinancialBottleneck {
  id: string;
  title: string;
  category: 'UTILIZATION' | 'DTI' | 'PAYMENT_HISTORY' | 'CREDIT_MIX' | 'INQUIRIES';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  impactDescription: string;
  recommendationSnippet: string;
  potentialPointsGain: number;
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  timelineWeeks: string;
  actionRequired: string;
  whyItMatters: string;
  estimatedPointsGain: number;
  isCompleted: boolean;
  tag: string;
}

export interface AIConsultation {
  generatedAt: string;
  executiveSummary: string;
  creditScoreAssessment: string;
  dtiAnalysis: string;
  utilizationAnalysis: string;
  keyBottlenecks: FinancialBottleneck[];
  fiveStepRoadmap: RoadmapStep[];
  indianBankingTips: string[];
  projectedScoreAfterPlan: number;
  timeToExcellentScoreMonths: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  city: string;
  monthlyGrossIncome: number;
  monthlyLivingExpenses: number;
  currentScore: number;
  bureau: CreditBureau;
  creditCards: CreditCardItem[];
  loans: LoanItem[];
  recentHardInquiries: number;
  onTimePaymentRatePercent: number; // e.g., 96%
  creditAgeYears: number; // e.g., 4.2 years
  scoreHistory: ScoreHistoryPoint[];
  lastAiConsultation?: AIConsultation;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
