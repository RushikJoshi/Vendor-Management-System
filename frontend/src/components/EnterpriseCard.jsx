export default function EnterpriseCard({ title, children, className = "", subtitle = "" }) {
    return (
        <div className={`bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
            {/* Top Accent Line */}
            <div className="h-1 bg-[#0B5D3B]"></div>

            <div className="p-6">
                {title && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-[#1F2937] tracking-wider uppercase inline-block border-b-2 border-[#117A4F] pb-1">
                            {title}
                        </h3>
                        {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium italic">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
