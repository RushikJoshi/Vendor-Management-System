import React from 'react';

const Stepper = ({ currentStage, status }) => {
  const stages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'TECHNICAL', label: 'Technical' },
    { key: 'FINANCE', label: 'Finance' },
    { key: 'COMPLIANCE', label: 'Compliance' },
    { key: 'FINAL_APPROVAL', label: 'Final' },
    { key: 'COMPLETED', label: 'Approved' },
  ];

  // Normalize the current stage value
  const normalizedStage = (currentStage || '').toUpperCase().replace(/\s+/g, '_');
  const normalizedStatus = (status || '').toLowerCase();

  // Determine which stage index we are at
  let currentIndex = stages.findIndex(s => s.key === normalizedStage);

  // Fallback mapping for various status/stage values
  if (currentIndex === -1) {
    if (normalizedStage === 'COMPLETED' || normalizedStatus === 'approved') currentIndex = 5;
    else if (normalizedStage === 'REJECTED' || normalizedStatus === 'rejected') currentIndex = -2; // special: rejected
    else if (normalizedStatus === 'submitted' || normalizedStatus === 'pending' || normalizedStage === 'SUBMITTED') currentIndex = 0;
    else if (normalizedStatus === 'draft') currentIndex = -1;
    else if (normalizedStatus === 'in_review') currentIndex = 1;
    else currentIndex = 0; // default to submitted
  }

  const isRejected = normalizedStatus === 'rejected' || normalizedStage === 'REJECTED';
  const isApproved = normalizedStatus === 'approved' || normalizedStage === 'COMPLETED';

  return (
    <div className="flex items-center gap-0.5">
      {stages.map((stage, index) => {
        const isDone = !isRejected && index <= currentIndex;
        const isCurrent = !isRejected && index === currentIndex;

        let dotColor = 'bg-slate-200';
        let lineColor = 'bg-slate-100';

        if (isRejected) {
          // Show red up to wherever it was rejected
          dotColor = index === 0 ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'bg-slate-200';
          lineColor = 'bg-slate-100';
        } else if (isApproved) {
          dotColor = 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
          lineColor = 'bg-emerald-400';
        } else if (isDone) {
          dotColor = isCurrent
            ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] ring-2 ring-blue-200'
            : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
          lineColor = 'bg-emerald-400';
        }

        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center" title={stage.label}>
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${dotColor}`}
              />
            </div>
            {index < stages.length - 1 && (
              <div
                className={`h-[2px] w-4 transition-all duration-500 ${
                  !isRejected && index < currentIndex ? lineColor : 'bg-slate-100'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
