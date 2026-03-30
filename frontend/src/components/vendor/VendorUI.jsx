import { Link } from "react-router-dom";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const pageShellClass = "space-y-4 pb-10";
export const surfaceClass = "overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm";
export const mutedSurfaceClass = "rounded-xl border border-slate-200/60 bg-slate-50/60 p-4 shadow-sm";
export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-50";
export const textareaClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-50";
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50";
export const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500";
export const tableHeadClass = "px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500";
export const tableCellClass = "px-5 py-4 align-top text-[14px] text-slate-700";

export function PageShell({ children, className = "" }) {
  return <div className={cn(pageShellClass, className)}>{children}</div>;
}

export function PageHero({
  badge,
  title,
  description,
  stats = [],
  primaryAction,
  secondaryAction,
  aside,
}) {
  return (
    <section className={surfaceClass}>
      <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r xl:p-6">
          {badge ? (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-700">
                {badge}
              </span>
            </div>
          ) : null}

          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-medium leading-relaxed tracking-wide text-slate-500">
              {description}
            </p>
          </div>

          {stats.length ? (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <FeatureTile key={item.label} icon={item.icon} label={item.label} value={item.value} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 bg-slate-50/50 p-5 xl:p-6">
          {aside}
          {(secondaryAction || primaryAction) && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {secondaryAction}
              {primaryAction}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function FeatureTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-inner">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-1 truncate text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function InfoPanel({ icon: Icon, title, value, note, toneClass = "bg-slate-50 text-slate-600" }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-inner", toneClass)}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
          <p className="mt-1 break-words text-lg font-semibold text-slate-900">{value}</p>
          {note ? <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <section className={cn(surfaceClass, className)}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 xl:p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-[12px] text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SearchField({ placeholder = "Search...", className = "", onChange }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      className={cn(inputClass, className)}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-slate-200 bg-slate-50 text-slate-300">
        <Icon size={34} />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{title}</h3>
      <p className="mt-3 max-w-md text-[14px] leading-7 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]", tones[tone] || tones.slate)}>
      {children}
    </span>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint ? <p className="mt-2 text-[12px] leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SummaryTile({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-[16px] font-semibold text-slate-900">{value}</p>
      {note ? <p className="mt-2 text-[13px] leading-6 text-slate-500">{note}</p> : null}
    </div>
  );
}

export function LinkButton({ to, children, variant = "primary", className = "" }) {
  return (
    <Link
      to={to}
      className={cn(variant === "primary" ? primaryButtonClass : secondaryButtonClass, className)}
    >
      {children}
    </Link>
  );
}
