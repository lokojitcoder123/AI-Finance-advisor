
import React, { useState } from 'react';
import { financeService } from '../services/gemini';
import { DebtItem, DebtAnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const DebtOptimizer: React.FC = () => {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [extraPayment, setExtraPayment] = useState(100);
  const [preference, setPreference] = useState<'quick-win' | 'save-money'>('save-money');
  const [result, setResult] = useState<DebtAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New debt form state
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newMin, setNewMin] = useState('');

  const addDebt = () => {
    if (!newName || !newBalance || !newRate || !newMin) return;
    const debt: DebtItem = {
      id: Date.now().toString(),
      name: newName,
      balance: parseFloat(newBalance),
      interestRate: parseFloat(newRate),
      minPayment: parseFloat(newMin),
    };
    setDebts([...debts, debt]);
    setNewName('');
    setNewBalance('');
    setNewRate('');
    setNewMin('');
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleCalculate = async () => {
    if (debts.length === 0 || isLoading) return;
    setIsLoading(true);
    try {
      const data = await financeService.analyzeDebt(debts, extraPayment, preference);
      setResult(data);
    } catch (error) {
      alert("Error calculating debt roadmap.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Debt Roadmap Generator</h2>
        <p className="text-slate-500 text-sm mb-6">Compare payoff strategies and see exactly how much faster you can become debt-free.</p>

        <div className="space-y-6">
          {/* Debt Entry List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Debts</h3>
            {debts.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm italic">
                No debts added yet. Use the form below to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {debts.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-700">{d.name}</div>
                      <div className="text-xs text-slate-500">{formatCurrency(d.balance)} @ {d.interestRate}% • Min {formatCurrency(d.minPayment)}</div>
                    </div>
                    <button onClick={() => removeDebt(d.id)} className="text-rose-500 hover:text-rose-700 p-2">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to Add Debt */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Debt Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Credit Card" className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Balance ($)</label>
              <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="5000" className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">APR (%)</label>
              <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="19.9" className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Payment</label>
              <div className="flex space-x-2">
                <input type="number" value={newMin} onChange={e => setNewMin(e.target.value)} placeholder="150" className="w-full p-2 text-sm border border-slate-200 rounded-lg" />
                <button onClick={addDebt} className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700">+</button>
              </div>
            </div>
          </div>

          {/* Strategy & Extra Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Extra Monthly Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input 
                  type="number" 
                  value={extraPayment} 
                  onChange={e => setExtraPayment(parseFloat(e.target.value))} 
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Every extra dollar reduces interest compounding immediately.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Psychological Preference</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setPreference('quick-win')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${preference === 'quick-win' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Quick Wins (Snowball)
                </button>
                <button 
                  onClick={() => setPreference('save-money')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${preference === 'save-money' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Save Money (Avalanche)
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={isLoading || debts.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating Roadmap...</span>
            ) : (
              <><span>⚡</span><span>Optimize My Payoff Plan</span></>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Visual: Payoff Curve */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Debt Payoff Projection</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={preference === 'save-money' ? result.avalanche.monthlyData : result.snowball.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} fontSize={12} />
                    <YAxis tickFormatter={(v) => `$${v/1000}k`} fontSize={12} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="totalBalance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} name="Total Debt" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payoff Order & Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payoff Sequence</h4>
                <div className="space-y-3">
                  {(preference === 'save-money' ? result.avalanche.payoffOrder : result.snowball.payoffOrder).map((name, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">{i+1}</div>
                      <div className="text-sm font-medium text-slate-700">{name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-xl flex flex-col justify-center">
                <div className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2">Interest Savings</div>
                <div className="text-4xl font-bold mb-2">{formatCurrency(result.interestSavedByAvalanche)}</div>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  By using the {result.interestSavedByAvalanche > 0 ? 'Avalanche' : 'Current'} method, you save this amount in interest over the life of your debt.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Roadmap Details</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Debt-Free Date</div>
                  <div className="text-xl font-bold text-slate-800">
                    {preference === 'save-money' ? result.avalanche.monthsToPayoff : result.snowball.monthsToPayoff} Months
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Interest Cost</div>
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(preference === 'save-money' ? result.avalanche.totalInterest : result.snowball.totalInterest)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Advisor Guidance */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
              <h4 className="font-bold flex items-center mb-3 text-sm">
                <span className="mr-2">🧠</span> Strategy Insights
              </h4>
              <p className="text-xs text-blue-50 leading-relaxed mb-4">
                {result.summary}
              </p>
              <div className="pt-4 border-t border-blue-500/50">
                <h5 className="text-[10px] font-bold uppercase opacity-60 mb-2 tracking-widest">Behavioral Tip</h5>
                <p className="text-xs italic">
                  "{result.behavioralRecommendation}"
                </p>
              </div>
            </div>

            {/* Visual: Interest Saved Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Avalanche vs Snowball Cost</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Avalanche', interest: result.avalanche.totalInterest },
                    { name: 'Snowball', interest: result.snowball.totalInterest }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis hide />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="interest" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2 italic">Lower bars represent more money staying in your pocket.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtOptimizer;
