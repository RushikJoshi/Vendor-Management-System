export default function Card({ children, className = "", title }) {
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-smooth ${className}`}>
      {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
      {children}
    </div>
  );
}