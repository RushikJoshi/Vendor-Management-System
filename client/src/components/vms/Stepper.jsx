import React from 'react';

const Stepper = ({ currentStage }) => {
  const stages = ['Submitted', 'Technical', 'Risk', 'Approved'];
  const currentIndex = stages.findIndex(s => s.toLowerCase() === (currentStage || '').toLowerCase());
  
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                index <= currentIndex ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-200'
              }`}
            />
            {/* Show label optionally if space permits, but for table we keep it minimal */}
          </div>
          {index < stages.length - 1 && (
            <div 
              className={`h-[2px] w-6 transition-all duration-500 ${
                index < currentIndex ? 'bg-[#10B981]' : 'bg-slate-100'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
