
export interface DataPoint {
  year: number;
  conservative: number;
  moderate: number;
  aggressive: number;
}

export interface ScenarioResult {
  title: string;
  summary: string;
  recommendation: string;
  projections: DataPoint[];
}

export interface RiskAnalysisResult {
  score: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  analysis: string;
  diversificationScore: number;
  concentrationRisks: string[];
  comparisons: {
    model: string;
    description: string;
    suitability: string;
  }[];
  topAdvice: string;
}

export interface TermExplanation {
  term: string;
  definition: string;
  analogy: string;
}

export interface ArticleAnalysisResult {
  annotatedText: string;
  explanations: TermExplanation[];
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

export interface DebtPlan {
  totalInterest: number;
  monthsToPayoff: number;
  payoffOrder: string[];
  monthlyData: { month: number; totalBalance: number; interestPaid: number }[];
}

export interface DebtAnalysisResult {
  summary: string;
  snowball: DebtPlan;
  avalanche: DebtPlan;
  behavioralRecommendation: string;
  interestSavedByAvalanche: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: ScenarioResult;
  timestamp: Date;
}

export enum ScenarioType {
  SAVINGS = 'SAVINGS',
  LOAN = 'LOAN',
  RETIREMENT = 'RETIREMENT',
  HABIT = 'HABIT'
}

export type AppMode = 'simulator' | 'risk-analyzer' | 'knowledge-hub' | 'debt-optimizer';
