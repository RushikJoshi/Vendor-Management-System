export default function EnterpriseCard({ title, children, className = "", subtitle = "" }) {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
            {/* Top Accent Line */}
            <div className="h-0.5 bg-[#064e3b] opacity-80"></div>

            <div className="p-5">
                {title && (
                    <div className="mb-4">
                        <h3 className="text-[11px] font-black text-slate-900 tracking-widest uppercase inline-block border-b-2 border-emerald-600 pb-1">
                            {title}
                        </h3>
                        {subtitle && <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-tighter italic opacity-70">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
