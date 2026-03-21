import React from 'react';

const MatchProgress = ({ percentage }) => {
  const getProgressColor = (p) => {
    if (p >= 80) return 'bg-[#10B981]';
    if (p >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="w-24">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black tracking-widest text-slate-400">MATCH %</span>
        <span className="text-[10px] font-black text-slate-700">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
        <div 
          className={`h-full ${getProgressColor(percentage)} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MatchProgress;
