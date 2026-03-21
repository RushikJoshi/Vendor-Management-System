import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass = "bg-[#0F172A]" }) => {
  return (
    <div className="vms-card p-6 flex items-center justify-between group hover:scale-[1.03] transition-all duration-500">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        </div>
        <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter leading-none">{value}</h3>
            {trend && (
              <div className={`mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${trend.positive ? 'text-[#10B981]' : 'text-rose-500'}`}>
                <span className="bg-current opacity-10 absolute inset-0 rounded-full"></span>
                <span>{trend.positive ? '↑' : '↓'} {trend.value}%</span>
              </div>
            )}
        </div>
        <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${colorClass} opacity-40 rounded-full`} style={{width: '60%'}}></div>
        </div>
      </div>
      
      <div className={`w-14 h-14 rounded-2xl ${colorClass} bg-opacity-[0.08] flex items-center justify-center text-current group-hover:scale-110 transition-transform duration-500 relative overflow-hidden ring-1 ring-current/5`}>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Icon size={24} className={`${colorClass.replace('bg-', 'text-')} opacity-80`} strokeWidth={2} />
      </div>
    </div>
  );
};

export default StatCard;

