export default function Button({ children, onClick, className = "", variant = "primary", loading, ...props }) {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/25",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/25",
    success: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-green-500/25"
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg font-semibold transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}