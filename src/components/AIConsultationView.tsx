import React, { useState } from 'react';
import { AIConsultation, UserProfile, ChatMessage } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Lightbulb, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { formatINR } from '../utils/creditCalculator';

interface AIConsultationViewProps {
  user: UserProfile;
  consultation: AIConsultation | null;
  isLoading: boolean;
  onTriggerConsultation: () => void;
  onUpdateConsultationStep?: (stepNumber: number, isCompleted: boolean) => void;
}

export const AIConsultationView: React.FC<AIConsultationViewProps> = ({
  user,
  consultation,
  isLoading,
  onTriggerConsultation,
  onUpdateConsultationStep,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `Namaste ${user.fullName.split(' ')[0]}! I am your AI Credit Advisor trained on RBI lending guidelines, CIBIL & Experian score mechanics. How can I assist you with your cards, EMIs, or loan approvals today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const suggestedQuestions = [
    'How does credit card settlement differ from closure in India?',
    'Will closing my oldest credit card hurt my CIBIL score?',
    'How to boost my credit limit without a hard CIBIL pull?',
    'How does a secured Fixed Deposit credit card work?',
  ];

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputQuestion.trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: text,
          history: chatMessages.slice(-6),
        }),
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I could not formulate an advice right now. Please verify server connectivity and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Gemini 3.8 Flash Credit Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Indian Credit Roadmap
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Tailored strategy conforming to RBI prudential lending guidelines, CIBIL/Experian algorithms, and debt avalanche scheduling in Indian Rupees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onTriggerConsultation}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing CIBIL & FOIR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{consultation ? 'Regenerate Consultation' : 'Generate AI Consultation'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {consultation && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-xs text-slate-400">Current Score</span>
              <p className="text-xl font-bold font-mono text-white mt-0.5">{user.currentScore}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-xs text-slate-400">Projected Score</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{consultation.projectedScoreAfterPlan}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-xs text-slate-400">Total Potential Gain</span>
              <p className="text-xl font-bold font-mono text-teal-300 mt-0.5">
                +{consultation.projectedScoreAfterPlan - user.currentScore} pts
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/40">
              <span className="text-xs text-slate-400">Target Timeline</span>
              <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">{consultation.timeToExcellentScoreMonths} Months</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Roadmap & Analysis Area */}
      {consultation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: 5-Step Roadmap & Executive Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Summary Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Executive Credit Assessment</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {consultation.executiveSummary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">DTI & FOIR Diagnosis</span>
                  <p className="text-xs text-slate-300 mt-1">{consultation.dtiAnalysis}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Revolving Balance Dynamics</span>
                  <p className="text-xs text-slate-300 mt-1">{consultation.utilizationAnalysis}</p>
                </div>
              </div>
            </div>

            {/* 5-Step Actionable Indian Roadmap */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>5-Step Actionable Roadmap to 750+</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Execute these sequenced actions to climb into prime Indian lending tiers
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                {consultation.fiveStepRoadmap.map((step, idx) => (
                  <div
                    key={step.stepNumber || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      step.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/60 opacity-80'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onUpdateConsultationStep && onUpdateConsultationStep(step.stepNumber, !step.isCompleted)}
                          className={`mt-1 w-5 h-5 rounded flex items-center justify-center border transition cursor-pointer ${
                            step.isCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'border-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {step.isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              Step {step.stepNumber}:
                            </span>
                            <h4 className={`text-sm font-bold ${step.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {step.timelineWeeks}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              {step.tag}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            <strong className="text-slate-200">Action:</strong> {step.actionRequired}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1.5">
                            <strong className="text-slate-300">Why it matters:</strong> {step.whyItMatters}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          +{step.estimatedPointsGain} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indian Banking Pro-Tips */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Indian Banking & RBI Pro-Tips</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consultation.indianBankingTips.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-[10px] border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Gemini Credit Advisor Chat */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col h-[700px] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Credit Advisor Chat</h4>
                    <p className="text-[10px] text-emerald-400">Grounded in Indian Banking Law</p>
                  </div>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[9px] block mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Gemini is generating financial response...</span>
                  </div>
                )}
              </div>

              {/* Suggested Questions Carousel */}
              <div className="py-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Quick Queries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[10px] text-slate-300 bg-slate-950 hover:bg-slate-800 hover:text-white px-2 py-1 rounded border border-slate-800 transition text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about CIBIL, EMI, or credit card debt..."
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuestion.trim() || isChatLoading}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Generate Your AI Consultation</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Our Gemini-driven engine will analyze your {user.bureau} score ({user.currentScore}), ₹{user.monthlyGrossIncome.toLocaleString('en-IN')} income, and active debt portfolio to construct a custom 5-step roadmap tailored to Indian banking norms.
          </p>
          <button
            onClick={onTriggerConsultation}
            disabled={isLoading}
            className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Gemini AI Consultation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Start Consultation Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
