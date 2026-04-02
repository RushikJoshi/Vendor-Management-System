import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ open, onClose, children, title, size = "max-w-2xl" }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B5D3B]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative my-2 w-full ${size} max-h-[92vh] overflow-hidden rounded-[12px] border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col`}
      >
        <div className="flex justify-between items-center px-8 py-4 border-b border-[#E5E7EB] bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">{title || "System Information"}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
