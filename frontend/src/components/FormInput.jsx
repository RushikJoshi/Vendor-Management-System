export default function FormInput({ label, type = "text", value, onChange, name, className = "", error, ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="mb-2 font-semibold text-slate-100">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`px-4 py-2.5 bg-slate-800 border-2 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-smooth ${
          error ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-indigo-500"
        }`}
        {...props}
      />
      {error && <span className="text-red-400 text-sm mt-1">{error}</span>}
    </div>
  );
}