
import React, { useState } from 'react';
import { financeService } from '../services/gemini';
import { ArticleAnalysisResult, TermExplanation } from '../types';

const KnowledgeHub: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<ArticleAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermExplanation | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await financeService.analyzeArticle(text);
      setAnalysis(result);
      setSelectedTerm(null);
    } catch (error) {
      alert("Failed to analyze text.");
    } finally {
      setIsLoading(false);
    }
  };

  const samples = [
    { label: "Market Volatility", text: "The Federal Reserve's quantitative easing program has significantly impacted market liquidity, potentially leading to asset price inflation and reduced yields on fixed-income securities." },
    { label: "Short Selling", text: "Retail investors recently targeted heavily shorted stocks, causing a massive short squeeze that forced institutional hedge funds to cover their positions at record high prices." }
  ];

  // Simple regex-based term replacement for UI rendering
  const renderAnnotatedText = () => {
    if (!analysis) return text;

    // Fix: Use React.ReactNode instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error
    let elements: (string | React.ReactNode)[] = [text];
    
    // Sort terms by length descending to avoid partial matches on nested terms
    const sortedExplanations = [...analysis.explanations].sort((a, b) => b.term.length - a.term.length);

    sortedExplanations.forEach((exp) => {
      // Fix: Use React.ReactNode instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error
      const newElements: (string | React.ReactNode)[] = [];
      elements.forEach((el) => {
        if (typeof el !== 'string') {
          newElements.push(el);
          return;
        }

        const parts = el.split(new RegExp(`(${exp.term})`, 'gi'));
        parts.forEach((part, i) => {
          if (part.toLowerCase() === exp.term.toLowerCase()) {
            newElements.push(
              <button
                key={`${exp.term}-${i}`}
                onClick={() => setSelectedTerm(exp)}
                className={`px-1 rounded font-medium transition-colors border-b-2 border-blue-400 hover:bg-blue-100 ${selectedTerm?.term === exp.term ? 'bg-blue-200' : 'bg-blue-50'}`}
              >
                {part}
              </button>
            );
          } else if (part) {
            newElements.push(part);
          }
        });
      });
      elements = newElements;
    });

    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Knowledge Hub</h2>
        <p className="text-slate-500 mb-6">Paste a financial news snippet or term to see an "Explain Like I'm 5" breakdown.</p>
        
        <div className="space-y-4">
          <div className="flex gap-2 mb-2">
            {samples.map((s, i) => (
              <button
                key={i}
                onClick={() => setText(s.text)}
                className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sample: {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste financial news here..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !text.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
          >
            {isLoading ? "Identifying Complex Terms..." : "Analyze & ELI5"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[200px]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Article Viewer</h3>
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {analysis ? renderAnnotatedText() : (
              <div className="text-slate-300 italic py-10 text-center">
                Analyze some text to see interactive highlights
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {selectedTerm ? (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Jargon Explained</span>
                <button onClick={() => setSelectedTerm(null)} className="text-white/60 hover:text-white">✕</button>
              </div>
              <h4 className="text-3xl font-bold mb-4">{selectedTerm.term}</h4>
              
              <div className="space-y-6">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">ELI5 Definition</h5>
                  <p className="text-lg leading-relaxed text-blue-50">
                    {selectedTerm.definition}
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <h5 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 flex items-center">
                    <span className="mr-2">💡</span> Real-world Analogy
                  </h5>
                  <p className="text-sm italic leading-relaxed text-indigo-50">
                    "{selectedTerm.analogy}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-2xl text-center text-slate-400">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-600">Select a term to learn</h4>
              <p className="text-sm mt-1">Highlighted terms in the text are available for simplified explanations.</p>
            </div>
          )}

          {analysis && !selectedTerm && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Detected Terms</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.explanations.map((exp, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTerm(exp)}
                    className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                  >
                    {exp.term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;
