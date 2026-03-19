import { X } from "lucide-react";

export default function Modal({ open, onClose, children, title, size = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B5D3B]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full ${size} bg-white border border-gray-200 rounded-[12px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300`}>
        <div className="flex justify-between items-center px-8 py-4 border-b border-[#E5E7EB] bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">{title || "System Information"}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}