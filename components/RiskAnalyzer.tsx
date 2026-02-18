
import React, { useState } from 'react';
import { financeService } from '../services/gemini';
import { RiskAnalysisResult } from '../types';

const RiskAnalyzer: React.FC = () => {
  const [portfolio, setPortfolio] = useState('');
  const [result, setResult] = useState<RiskAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const analysis = await financeService.analyzeRisk(portfolio);
      setResult(analysis);
    } catch (error) {
      alert("Failed to analyze portfolio. Please try describing your assets differently.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getRiskBg = (level: string) => {
    switch(level) {
      case 'Low': return 'bg-emerald-100 text-emerald-700';
      case 'Moderate': return 'bg-amber-100 text-amber-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Very High': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Portfolio Risk Analyzer</h2>
        <p className="text-slate-500 text-sm mb-6">
          Describe your current investments below. Mention tickers, percentages, or broad categories (e.g. "40% VOO, 30% Bitcoin, 30% Cash").
        </p>
        
        <form onSubmit={handleAnalyze} className="space-y-4">
          <textarea
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            placeholder="e.g. 50% Tech stocks, 20% Real Estate, 30% Government Bonds..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !portfolio.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Allocation...
              </>
            ) : "Generate Risk Report Card"}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center text-white relative">
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRiskBg(result.riskLevel)}`}>
                {result.riskLevel} Risk
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Overall Portfolio Score</h3>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
              {result.score}<span className="text-2xl text-slate-500">/100</span>
            </div>
            <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
              {result.analysis}
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center mb-3">
                  <span className="mr-2">⚠️</span> Concentration Risks
                </h4>
                <ul className="space-y-2">
                  {result.concentrationRisks.map((risk, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      <span className="text-rose-500 mr-2 font-bold">•</span> {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center mb-3">
                  <span className="mr-2">🏆</span> Benchmark Comparisons
                </h4>
                <div className="space-y-3">
                  {result.comparisons.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="font-semibold text-xs text-slate-700 uppercase mb-1">{c.model}</div>
                      <p className="text-xs text-slate-500 mb-1">{c.description}</p>
                      <div className="text-[10px] font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded">
                        {c.suitability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl">
                <h4 className="font-bold mb-3 flex items-center">
                  <span className="text-xl mr-2">🚀</span> Priority Recommendation
                </h4>
                <p className="text-blue-50 leading-relaxed text-sm">
                  {result.topAdvice}
                </p>
                <div className="mt-4 pt-4 border-t border-blue-500 flex justify-between items-center">
                  <span className="text-xs opacity-75">Diversification Score</span>
                  <div className="w-24 h-2 bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400" 
                      style={{ width: `${result.diversificationScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl text-center">
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter mb-2">Confidence Level</p>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-3 h-1.5 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-500 italic">Analysis based on Modern Portfolio Theory & Historical Sector Volatility</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
