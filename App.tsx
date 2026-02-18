
import React, { useState, useRef, useEffect } from 'react';
import { Message, ScenarioResult, AppMode } from './types';
import { financeService } from './services/gemini';
import ScenarioCard from './components/ScenarioCard';
import ChartPanel from './components/ChartPanel';
import RiskAnalyzer from './components/RiskAnalyzer';
import KnowledgeHub from './components/KnowledgeHub';
import DebtOptimizer from './components/DebtOptimizer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('simulator');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<ScenarioResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const prompt = customPrompt || input;
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await financeService.analyzeScenario(prompt);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've simulated that scenario for you. Based on the data, here is the projected trajectory over the next few years.`,
        data: result,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentScenario(result);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that scenario. Please try rephrasing or using one of the templates.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const templates = [
    { title: "Coffee Habit", icon: "☕", text: "What if I stop buying a $5 coffee daily and invest it in the S&P 500 for 15 years?", desc: "Daily savings to long-term wealth." },
    { title: "Car Purchase", icon: "🚗", text: "If I buy a $35,000 car at 7.5% interest over 5 years, what's my total cost including depreciation?", desc: "Total cost of ownership." },
    { title: "House Downpayment", icon: "🏠", text: "How much faster will I reach a $100k downpayment if I increase my monthly savings from $500 to $1,200?", desc: "Savings rate impact." },
    { title: "Retirement Goal", icon: "🌅", text: "What happens if I delay retirement by 5 years but increase my savings rate by 10% starting now?", desc: "Work-life retirement balance." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              FinanceWise
            </h1>
          </div>
          <nav className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button 
              onClick={() => setMode('simulator')}
              className={`whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${mode === 'simulator' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Simulator
            </button>
            <button 
              onClick={() => setMode('debt-optimizer')}
              className={`whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${mode === 'debt-optimizer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Debt Optimizer
            </button>
            <button 
              onClick={() => setMode('risk-analyzer')}
              className={`whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${mode === 'risk-analyzer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Risk Analyzer
            </button>
            <button 
              onClick={() => setMode('knowledge-hub')}
              className={`whitespace-nowrap px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${mode === 'knowledge-hub' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Knowledge Hub
            </button>
          </nav>
          <div className="hidden md:block text-sm text-slate-400 font-medium">
            AI Advisory Suite
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {mode === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px] max-h-[600px] lg:max-h-none overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto chat-scroll space-y-4">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4">🤖</div>
                      <h2 className="text-lg font-semibold text-slate-800">Financial Simulator</h2>
                      <p className="text-slate-500 text-sm mt-2 max-w-xs">
                        Ask any financial hypothetical. I'll run the numbers and visualize the outcomes for you.
                      </p>
                    </div>
                  )}

                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 ${
                        m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                      }`}>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        <div className={`text-[10px] mt-2 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g. Save $200 more a month?"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((t, idx) => (
                  <ScenarioCard 
                    key={idx}
                    title={t.title}
                    icon={t.icon}
                    description={t.desc}
                    onClick={() => handleSubmit(undefined, t.text)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              {currentScenario ? (
                <ChartPanel data={currentScenario} />
              ) : (
                <div className="h-full min-h-[400px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-600">No active simulation</h3>
                  <p className="max-w-xs mt-2">
                    Once you ask a question or select a template, the visual projection will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {mode === 'debt-optimizer' && (
          <div className="max-w-5xl mx-auto">
            <DebtOptimizer />
          </div>
        )}
        {mode === 'risk-analyzer' && (
          <div className="max-w-4xl mx-auto">
            <RiskAnalyzer />
          </div>
        )}
        {mode === 'knowledge-hub' && (
          <div className="max-w-5xl mx-auto">
            <KnowledgeHub />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
          <p>© 2024 FinanceWise. Educational purposes only. Not financial advice.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
