
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { ScenarioResult } from '../types';

interface ChartPanelProps {
  data: ScenarioResult;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">{data.title}</h2>
        <p className="text-slate-500 mt-1">{data.summary}</p>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.projections}>
            <defs>
              <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years From Now', position: 'insideBottom', offset: -5 }} 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Area 
              type="monotone" 
              dataKey="aggressive" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorAggressive)" 
              name="Aggressive Path"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="moderate" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorModerate)" 
              name="Expected Path"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="conservative" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorConservative)" 
              name="Conservative Path"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-800 flex items-center mb-1">
          <span className="mr-2">💡</span> Advisor Recommendation
        </h4>
        <p className="text-sm text-blue-700 leading-relaxed">
          {data.recommendation}
        </p>
      </div>
    </div>
  );
};

export default ChartPanel;
