import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage directory and initial seeded data
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'users.json');

const INITIAL_USERS = [
  {
    id: 'user_suyog_belote',
    fullName: 'Suyog Belote',
    email: 'suyog.belote@example.in',
    city: 'Pune, Maharashtra',
    monthlyGrossIncome: 85000,
    monthlyLivingExpenses: 26000,
    currentScore: 648,
    bureau: 'CIBIL',
    creditCards: [
      {
        id: 'card_1',
        bankName: 'HDFC Bank',
        cardName: 'Millennia Credit Card',
        creditLimit: 120000,
        currentBalance: 78000,
        aprPercent: 42,
        minPayment: 3900,
      },
      {
        id: 'card_2',
        bankName: 'ICICI Bank',
        cardName: 'Coral Credit Card',
        creditLimit: 80000,
        currentBalance: 36000,
        aprPercent: 40,
        minPayment: 1800,
      },
    ],
    loans: [
      {
        id: 'loan_1',
        loanType: 'PERSONAL',
        lenderName: 'Axis Bank',
        totalPrincipal: 300000,
        outstandingBalance: 160000,
        monthlyEmi: 10500,
        interestRate: 14.5,
        tenureMonthsRemaining: 18,
        status: 'ACTIVE',
      },
      {
        id: 'loan_2',
        loanType: 'AUTO',
        lenderName: 'SBI',
        totalPrincipal: 450000,
        outstandingBalance: 240000,
        monthlyEmi: 9200,
        interestRate: 8.9,
        tenureMonthsRemaining: 28,
        status: 'ACTIVE',
      },
    ],
    recentHardInquiries: 3,
    onTimePaymentRatePercent: 94,
    creditAgeYears: 3.8,
    scoreHistory: [
      { date: '2025-10', monthLabel: 'Oct 2025', score: 662, utilizationPercent: 54, dtiPercent: 43, eventNote: 'Festival purchases on HDFC card' },
      { date: '2025-11', monthLabel: 'Nov 2025', score: 655, utilizationPercent: 58, dtiPercent: 45, eventNote: 'Late EMI payment report' },
      { date: '2025-12', monthLabel: 'Dec 2025', score: 642, utilizationPercent: 64, dtiPercent: 47, eventNote: 'Card balance reached 78k' },
      { date: '2026-01', monthLabel: 'Jan 2026', score: 640, utilizationPercent: 65, dtiPercent: 48, eventNote: 'Hard inquiry for Axis card' },
      { date: '2026-02', monthLabel: 'Feb 2026', score: 648, utilizationPercent: 61, dtiPercent: 46, eventNote: 'Paid down ICICI minimums' },
    ],
  },
  {
    id: 'user_rahul_verma',
    fullName: 'Rahul Verma',
    email: 'rahul.verma@example.in',
    city: 'Pune, Maharashtra',
    monthlyGrossIncome: 110000,
    monthlyLivingExpenses: 32000,
    currentScore: 758,
    bureau: 'CIBIL',
    creditCards: [
      {
        id: 'card_r1',
        bankName: 'SBI Card',
        cardName: 'SimplyCLICK Card',
        creditLimit: 150000,
        currentBalance: 24000,
        aprPercent: 36,
        minPayment: 1200,
      },
      {
        id: 'card_r2',
        bankName: 'Amazon Pay ICICI',
        cardName: 'Lifetime Free Card',
        creditLimit: 180000,
        currentBalance: 16000,
        aprPercent: 38,
        minPayment: 800,
      },
    ],
    loans: [
      {
        id: 'loan_r1',
        loanType: 'HOME',
        lenderName: 'HDFC Home Loans',
        totalPrincipal: 3500000,
        outstandingBalance: 2850000,
        monthlyEmi: 28500,
        interestRate: 8.45,
        tenureMonthsRemaining: 180,
        status: 'ACTIVE',
      },
    ],
    recentHardInquiries: 0,
    onTimePaymentRatePercent: 99,
    creditAgeYears: 5.8,
    scoreHistory: [
      { date: '2025-09', monthLabel: 'Sep 2025', score: 628, utilizationPercent: 58, dtiPercent: 52, eventNote: 'Initial consultation with AI' },
      { date: '2025-10', monthLabel: 'Oct 2025', score: 654, utilizationPercent: 42, dtiPercent: 48, eventNote: 'Paid off Bajaj Finserv consumer loan' },
      { date: '2025-11', monthLabel: 'Nov 2025', score: 680, utilizationPercent: 30, dtiPercent: 42, eventNote: 'Brought card utilization below 30%' },
      { date: '2025-12', monthLabel: 'Dec 2025', score: 710, utilizationPercent: 22, dtiPercent: 38, eventNote: 'Crossed Good CIBIL threshold (700+)' },
      { date: '2026-01', monthLabel: 'Jan 2026', score: 735, utilizationPercent: 18, dtiPercent: 35, eventNote: 'Approved for SBI credit limit boost' },
      { date: '2026-02', monthLabel: 'Feb 2026', score: 758, utilizationPercent: 12, dtiPercent: 33, eventNote: 'Achieved Prime/Excellent score!' },
    ],
  },
];

function loadUsers(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
    return INITIAL_USERS;
  } catch (err) {
    console.error('Error loading users:', err);
    return INITIAL_USERS;
  }
}

function saveUsers(users: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

let users = loadUsers();

// API Routes
app.get('/api/users', (_req: Request, res: Response) => {
  const summaries = users.map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    currentScore: u.currentScore,
    bureau: u.bureau,
    monthlyGrossIncome: u.monthlyGrossIncome,
  }));
  res.json(summaries);
});

app.get('/api/user/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Scenario 1: User Onboarding and Initial Assessment
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      city,
      monthlyGrossIncome,
      monthlyLivingExpenses,
      currentScore,
      bureau = 'CIBIL',
      creditCards = [],
      loans = [],
    } = req.body;

    if (!fullName || !monthlyGrossIncome) {
      return res.status(400).json({ error: 'Full name and monthly gross income are required' });
    }

    const income = Number(monthlyGrossIncome);
    const score = Number(currentScore) || 650;
    
    // Calculate total monthly debt commitments
    const totalLoanEmi = (loans || []).reduce((acc: number, l: any) => acc + (Number(l.monthlyEmi) || 0), 0);
    const totalCardLimit = (creditCards || []).reduce((acc: number, c: any) => acc + (Number(c.creditLimit) || 0), 0);
    const totalCardBalance = (creditCards || []).reduce((acc: number, c: any) => acc + (Number(c.currentBalance) || 0), 0);
    const totalCardMin = (creditCards || []).reduce((acc: number, c: any) => acc + (Number(c.minPayment) || Math.round((Number(c.currentBalance) || 0) * 0.05)), 0);

    const dtiPercent = income > 0 ? Math.round(((totalLoanEmi + totalCardMin) / income) * 100) : 0;
    const utilizationPercent = totalCardLimit > 0 ? Math.round((totalCardBalance / totalCardLimit) * 100) : 0;

    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const newUser = {
      id: `user_${Date.now()}`,
      fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.in`,
      city: city || 'Mumbai, Maharashtra',
      monthlyGrossIncome: income,
      monthlyLivingExpenses: Number(monthlyLivingExpenses) || Math.round(income * 0.35),
      currentScore: score,
      bureau,
      creditCards: creditCards.map((c: any, idx: number) => ({
        id: c.id || `card_${idx + 1}`,
        bankName: c.bankName || 'HDFC Bank',
        cardName: c.cardName || 'Platinum Card',
        creditLimit: Number(c.creditLimit) || 50000,
        currentBalance: Number(c.currentBalance) || 0,
        aprPercent: Number(c.aprPercent) || 40,
        minPayment: Number(c.minPayment) || Math.round((Number(c.currentBalance) || 0) * 0.05),
      })),
      loans: loans.map((l: any, idx: number) => ({
        id: l.id || `loan_${idx + 1}`,
        loanType: l.loanType || 'PERSONAL',
        lenderName: l.lenderName || 'Axis Bank',
        totalPrincipal: Number(l.totalPrincipal) || 100000,
        outstandingBalance: Number(l.outstandingBalance) || Number(l.totalPrincipal) || 100000,
        monthlyEmi: Number(l.monthlyEmi) || 5000,
        interestRate: Number(l.interestRate) || 13.5,
        tenureMonthsRemaining: Number(l.tenureMonthsRemaining) || 24,
        status: 'ACTIVE',
      })),
      recentHardInquiries: 1,
      onTimePaymentRatePercent: 95,
      creditAgeYears: 2.5,
      scoreHistory: [
        {
          date: curMonth,
          monthLabel,
          score,
          utilizationPercent,
          dtiPercent,
          eventNote: 'Initial Onboarding & Assessment',
        },
      ],
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      message: 'Onboarding complete',
      user: newUser,
      calculatedMetrics: {
        dtiPercent,
        utilizationPercent,
        totalMonthlyDebtObligations: totalLoanEmi + totalCardMin,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete registration' });
  }
});

// Update profile details
app.put('/api/user/:id', (req: Request, res: Response) => {
  const userIdx = users.findIndex(u => u.id === req.params.id);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIdx] = { ...users[userIdx], ...req.body };
  saveUsers(users);
  res.json(users[userIdx]);
});

// Scenario 4: Real-time Credit Health Monitoring & Debt Payoff
app.post('/api/user/:id/payoff', (req: Request, res: Response) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { type, itemId, payoffAmount, markAsClosed } = req.body;
    const amount = Number(payoffAmount) || 0;

    let previousScore = user.currentScore;
    let oldUtilization = 0;
    let newUtilization = 0;
    let eventDescription = '';

    // Calculate old utilization
    const totalLimitBefore = user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0);
    const totalBalanceBefore = user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0);
    oldUtilization = totalLimitBefore > 0 ? Math.round((totalBalanceBefore / totalLimitBefore) * 100) : 0;

    let paidOffLoans = 0;

    if (type === 'CREDIT_CARD') {
      const card = user.creditCards.find((c: any) => c.id === itemId);
      if (!card) return res.status(404).json({ error: 'Credit card not found' });

      const paid = Math.min(card.currentBalance, amount);
      card.currentBalance = Math.max(0, card.currentBalance - paid);
      card.minPayment = Math.round(card.currentBalance * 0.05);

      eventDescription = `Paid ₹${paid.toLocaleString('en-IN')} towards ${card.bankName} ${card.cardName}`;
    } else if (type === 'LOAN') {
      const loan = user.loans.find((l: any) => l.id === itemId);
      if (!loan) return res.status(404).json({ error: 'Loan not found' });

      const paid = Math.min(loan.outstandingBalance, amount);
      loan.outstandingBalance = Math.max(0, loan.outstandingBalance - paid);

      if (loan.outstandingBalance <= 0 || markAsClosed) {
        loan.outstandingBalance = 0;
        loan.status = 'CLOSED';
        loan.monthlyEmi = 0;
        paidOffLoans += 1;
        eventDescription = `Fully paid off and closed ${loan.lenderName} ${loan.loanType} loan!`;
      } else {
        eventDescription = `Prepaid ₹${paid.toLocaleString('en-IN')} towards ${loan.lenderName} loan`;
      }
    }

    // Recalculate metrics
    const totalLimitAfter = user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0);
    const totalBalanceAfter = user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0);
    newUtilization = totalLimitAfter > 0 ? Math.round((totalBalanceAfter / totalLimitAfter) * 100) : 0;

    const totalEmiAfter = user.loans.filter((l: any) => l.status === 'ACTIVE').reduce((s: number, l: any) => s + l.monthlyEmi, 0);
    const totalMinCardAfter = user.creditCards.reduce((s: number, c: any) => s + c.minPayment, 0);
    const newDti = user.monthlyGrossIncome > 0 ? Math.round(((totalEmiAfter + totalMinCardAfter) / user.monthlyGrossIncome) * 100) : 0;

    // Score improvement delta calculation
    let delta = 0;
    const utilReduction = Math.max(0, oldUtilization - newUtilization);
    if (utilReduction > 0) {
      if (oldUtilization > 50 && newUtilization <= 30) {
        delta += Math.round(utilReduction * 0.85 + 12);
      } else {
        delta += Math.round(utilReduction * 0.65);
      }
    }
    if (paidOffLoans > 0) {
      delta += paidOffLoans * 18; // loan closure boost (reduced FOIR / debt weight)
    }
    if (amount > 0 && delta === 0) {
      delta = 5; // small positive reward for balance reduction
    }

    user.currentScore = Math.min(900, Math.max(300, user.currentScore + delta));

    // Record point in score history
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    user.scoreHistory.push({
      date: dateStr,
      monthLabel,
      score: user.currentScore,
      utilizationPercent: newUtilization,
      dtiPercent: newDti,
      eventNote: eventDescription,
    });

    saveUsers(users);

    res.json({
      message: 'Payment processed and credit health recalculated',
      previousScore,
      newScore: user.currentScore,
      scoreDelta: user.currentScore - previousScore,
      oldUtilization,
      newUtilization,
      newDti,
      updatedUser: user,
    });
  } catch (err: any) {
    console.error('Payoff error:', err);
    res.status(500).json({ error: err.message || 'Failed to process payoff' });
  }
});

// Scenario 2: AI-Powered Financial Consultation (Gemini 3.8 Flash)
app.post('/api/ai/consultation', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate current financial figures
    const totalLoanEmi = user.loans.filter((l: any) => l.status === 'ACTIVE').reduce((s: number, l: any) => s + l.monthlyEmi, 0);
    const totalCardLimit = user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0);
    const totalCardBalance = user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0);
    const utilization = totalCardLimit > 0 ? Math.round((totalCardBalance / totalCardLimit) * 100) : 0;
    const dti = user.monthlyGrossIncome > 0 ? Math.round(((totalLoanEmi + (totalCardBalance * 0.05)) / user.monthlyGrossIncome) * 100) : 0;

    const userSummary = `
User: ${user.fullName}
City: ${user.city}
Credit Bureau: ${user.bureau} (Scale 300 - 900)
Current Score: ${user.currentScore} (Fair/Poor/Good)
Monthly Gross Income: ₹${user.monthlyGrossIncome.toLocaleString('en-IN')}
Monthly Living Expenses: ₹${user.monthlyLivingExpenses.toLocaleString('en-IN')}
Total Credit Card Limit: ₹${totalCardLimit.toLocaleString('en-IN')}
Total Credit Card Balance: ₹${totalCardBalance.toLocaleString('en-IN')}
Credit Card Utilization Ratio: ${utilization}% (RBI/CIBIL benchmark is ideal < 30%)
Total Monthly EMIs: ₹${totalLoanEmi.toLocaleString('en-IN')}
Debt-to-Income / FOIR Ratio: ${dti}% (Indian banks prefer < 40-50%)
Recent Hard Inquiries (last 6 months): ${user.recentHardInquiries}
On-Time Payment Track Record: ${user.onTimePaymentRatePercent}%
Credit Age: ${user.creditAgeYears} years
Cards Details: ${JSON.stringify(user.creditCards)}
Active Loans Details: ${JSON.stringify(user.loans.filter((l: any) => l.status === 'ACTIVE'))}
`;

    const systemPrompt = `You are a Senior Credit Advisor specializing in the Indian banking and lending ecosystem (RBI guidelines, CIBIL, Experian, Equifax, CRIF High Mark, HDFC, SBI, ICICI, Axis).
Your job is to provide a comprehensive, authoritative, yet motivating credit health consultation and a tailored 5-step actionable roadmap to elevate the user's score to "Excellent" (750 - 800+).

Adhere strictly to Indian financial realities:
1. Credit utilization ratio benchmark: Keep total AND per-card utilization below 30%.
2. Debt-to-Income / FOIR (Fixed Obligation to Income Ratio): Indian lenders enforce a 40-50% cap for retail/home loans.
3. Repayment track record & DPD (Days Past Due): Even a single 30+ DPD severely damages CIBIL.
4. Credit Mix: A balance of secured loans (home/car/gold) and unsecured (personal/credit card) strengthens scoring.
5. Inquiries: "Hard inquiries" stay for 24-36 months; applying to multiple banks consecutively triggers rejection flags.
6. Crucial Indian nuance: Never accept "Settled" status for delinquent loans (which stays on CIBIL for 7 years as a black mark); always insist on "Closed" with a formal No Dues Certificate (NDC). Suggest secured cards (like SBI Unnati, IDFC FIRST WOW backed by fixed deposits) if rebuilding.

Provide your response strictly in JSON format conforming to the provided schema.`;

    const userPrompt = `Analyze the user's credit profile and generate an in-depth Indian credit consultation and a 5-step roadmap:
${userSummary}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'High-level 2-3 sentence diagnosis of the borrower profile in Indian banking terms.',
            },
            creditScoreAssessment: {
              type: Type.STRING,
              description: 'Detailed analysis of current score tier, interest rate penalty, and loan approval likelihood.',
            },
            dtiAnalysis: {
              type: Type.STRING,
              description: 'Analysis of Debt-to-Income (FOIR) against RBI lending comfort guidelines.',
            },
            utilizationAnalysis: {
              type: Type.STRING,
              description: 'Analysis of revolving card balances and utilization percentage vs the 30% golden rule.',
            },
            keyBottlenecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'UTILIZATION, DTI, PAYMENT_HISTORY, CREDIT_MIX, or INQUIRIES' },
                  severity: { type: Type.STRING, description: 'HIGH, MEDIUM, or LOW' },
                  impactDescription: { type: Type.STRING },
                  recommendationSnippet: { type: Type.STRING },
                  potentialPointsGain: { type: Type.NUMBER },
                },
                required: ['id', 'title', 'category', 'severity', 'impactDescription', 'recommendationSnippet', 'potentialPointsGain'],
              },
            },
            fiveStepRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  timelineWeeks: { type: Type.STRING },
                  actionRequired: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  estimatedPointsGain: { type: Type.NUMBER },
                  isCompleted: { type: Type.BOOLEAN },
                  tag: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'timelineWeeks', 'actionRequired', 'whyItMatters', 'estimatedPointsGain', 'isCompleted', 'tag'],
              },
            },
            indianBankingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 actionable Indian banking pro-tips (e.g. NOC certificates, CIBIL dispute filing, secured card tactics).',
            },
            projectedScoreAfterPlan: {
              type: Type.NUMBER,
              description: 'Realistic projected score after executing the 5 steps (e.g. 760 - 785).',
            },
            timeToExcellentScoreMonths: {
              type: Type.NUMBER,
              description: 'Estimated months required to reach 750+ (e.g. 4 to 6 months).',
            },
          },
          required: [
            'executiveSummary',
            'creditScoreAssessment',
            'dtiAnalysis',
            'utilizationAnalysis',
            'keyBottlenecks',
            'fiveStepRoadmap',
            'indianBankingTips',
            'projectedScoreAfterPlan',
            'timeToExcellentScoreMonths',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    parsedData.generatedAt = new Date().toISOString();

    user.lastAiConsultation = parsedData;
    saveUsers(users);

    res.json(parsedData);
  } catch (err: any) {
    console.error('AI Consultation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI consultation' });
  }
});

// Interactive AI Credit Chat Advisor
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { userId, message, history = [] } = req.body;
    const user = users.find(u => u.id === userId);

    const userContext = user
      ? `User Context: Name: ${user.fullName}, Bureau: ${user.bureau}, Current Score: ${user.currentScore}, Monthly Gross Income: ₹${user.monthlyGrossIncome}, Living Expenses: ₹${user.monthlyLivingExpenses}, Total Credit Limit: ₹${user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0)}, Total Card Balance: ₹${user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0)}, Loans: ${user.loans.length} active.`
      : 'Generic User seeking Indian credit advice.';

    const systemInstruction = `You are "Credit Assistant AI", an expert credit counselor for Indian borrowers. You provide precise, practical, and compliant advice on CIBIL, Experian, RBI guidelines, personal loans, credit card balances, home loan eligibility, and debt resolution.
Always format currency in Indian Rupees (₹). Explain things clearly with steps. Never recommend dubious credit repair agencies (RBI does not recognize unauthorized repair agents). Emphasize direct bank engagement, dispute filing on official CIBIL/Experian web portals, NOCs, and responsible credit utilization under 30%.
Keep responses concise, friendly, and structured with bullet points where appropriate.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: `${userContext}\n\nQuestion: ${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      role: 'assistant',
      content: response.text || 'I apologize, but I could not formulate an advice right now. Please try again.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat service encountered an error' });
  }
});

// "What-If" Credit Score Simulator
app.post('/api/ai/simulate', (req: Request, res: Response) => {
  try {
    const { userId, cardPaymentAmount = 0, newLoanAmount = 0, missedEmiCount = 0, requestLimitIncrease = false } = req.body;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let projectedScore = user.currentScore;
    const notes: string[] = [];

    // Credit Card Utilization impact
    const totalLimit = user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0) + (requestLimitIncrease ? 50000 : 0);
    const totalBalance = Math.max(0, user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0) - Number(cardPaymentAmount));
    const newUtil = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
    const oldLimit = user.creditCards.reduce((s: number, c: any) => s + c.creditLimit, 0);
    const oldBalance = user.creditCards.reduce((s: number, c: any) => s + c.currentBalance, 0);
    const oldUtil = oldLimit > 0 ? Math.round((oldBalance / oldLimit) * 100) : 0;

    if (newUtil < oldUtil) {
      const utilGain = Math.round((oldUtil - newUtil) * 0.7);
      projectedScore += utilGain;
      notes.push(`Dropping utilization from ${oldUtil}% to ${newUtil}% can add ~${utilGain} points.`);
    }

    if (requestLimitIncrease) {
      projectedScore += 8;
      notes.push('Higher credit limit expands your buffer, lowering overall utilization ratio.');
    }

    if (Number(newLoanAmount) > 0) {
      projectedScore -= 15;
      notes.push(`Taking a new loan of ₹${Number(newLoanAmount).toLocaleString('en-IN')} adds a hard inquiry (-5 pts) and raises FOIR (-10 pts).`);
    }

    if (Number(missedEmiCount) > 0) {
      const penalty = Number(missedEmiCount) * 45;
      projectedScore -= penalty;
      notes.push(`Warning: ${missedEmiCount} missed EMI(s) reports a 30+ DPD to CIBIL, slashing ~${penalty} points!`);
    }

    projectedScore = Math.min(900, Math.max(300, projectedScore));
    const delta = projectedScore - user.currentScore;

    res.json({
      currentScore: user.currentScore,
      projectedScore,
      delta,
      newUtilization: newUtil,
      notes,
    });
  } catch (err: any) {
    console.error('Simulator error:', err);
    res.status(500).json({ error: err.message || 'Simulation failed' });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Credit Assistant server running on port ${PORT}`);
  });
}

startServer();
