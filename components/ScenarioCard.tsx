
import React from 'react';

interface ScenarioCardProps {
  title: string;
  icon: string;
  description: string;
  onClick: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ title, icon, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-4 text-left transition-all bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md group"
    >
      <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </button>
  );
};

export default ScenarioCard;
