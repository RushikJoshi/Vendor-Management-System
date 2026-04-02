import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Copy, Mail, ShieldCheck, Printer, ArrowRight, Clock3 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const createFallbackId = () => `VR-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

export default function RegistrationSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { appId, email } = location.state || {};
    const [copied, setCopied] = useState(false);
    const [displayId] = useState(() =>
        appId ? `VR-${appId.toString().slice(-9).toUpperCase()}` : createFallbackId()
    );

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(displayId);
            setCopied(true);
            toast.success("Reference copied");
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error("Could not copy reference");
        }
    };

    return (
        <div className="relative h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,#dcfce7_0%,#f8fafc_42%,#eef2ff_100%)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(15,118,110,0.08),transparent)]" />
                <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
                <div className="absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="relative flex h-full flex-col"
            >
                <section className="relative overflow-hidden border-b border-white/15 bg-[linear-gradient(135deg,#052e2b_0%,#0f766e_52%,#164e63_100%)] text-white">
                    <div className="mx-auto w-full max-w-[1480px] px-8 py-6 sm:px-10 lg:px-16 lg:py-7">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-100">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                Registration Submitted
                            </span>
                            <span className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 sm:inline-flex">
                                Success Screen
                            </span>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/10">
                                    <CheckCircle2 size={28} strokeWidth={2.2} className="text-emerald-300" />
                                </div>
                                <h1 className="max-w-3xl text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.5rem] lg:leading-[0.94]">
                                    Application Received Successfully
                                </h1>
                                <p className="mt-2 max-w-2xl text-[13px] font-medium leading-6 text-emerald-50/80 sm:text-[15px]">
                                    Your vendor registration has been submitted. Our team will verify your details, review the uploaded documents, and move the application through the approval workflow.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">Application Reference</p>
                                <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                                    <div>
                                        <p className="text-xl font-black tracking-[0.18em] text-white">{displayId}</p>
                                        <p className="mt-1 text-[11px] font-medium text-white/65">Save this reference for tracking and support.</p>
                                    </div>
                                    <button
                                        onClick={copyId}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all hover:bg-white/20"
                                        aria-label="Copy application reference"
                                    >
                                        <Copy size={18} className={copied ? "text-emerald-300" : ""} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative flex-1">
                    <div className="mx-auto flex h-full w-full max-w-[1480px] items-center px-8 py-4 sm:px-10 lg:px-16 lg:py-4">
                    <div className="grid w-full gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <InfoCard
                                    icon={Mail}
                                    title="Confirmation Email"
                                    accent="text-blue-700"
                                    value={email || "Sent to the submitted email address"}
                                    note="A confirmation note and future updates will be shared here."
                                />
                                <InfoCard
                                    icon={Clock3}
                                    title="Review Timeline"
                                    accent="text-emerald-700"
                                    value="3-5 business days"
                                    note="Review time can vary depending on documents and compliance checks."
                                />
                            </div>

                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">What Happens Next</p>
                                <div className="mt-3 space-y-2.5">
                                    <StepRow
                                        number="01"
                                        title="Compliance Review"
                                        description="Your registration details and statutory information will be validated."
                                    />
                                    <StepRow
                                        number="02"
                                        title="Document Verification"
                                        description="Uploaded files will be reviewed by the internal admin team."
                                    />
                                    <StepRow
                                        number="03"
                                        title="Approval Update"
                                        description="Once reviewed, the application status will move to the next workflow stage."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)] p-4 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Submission Confirmed</p>
                                        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-900">
                                            Your details are now in the onboarding queue.
                                        </h2>
                                        <p className="mt-2 text-[13px] font-medium leading-6 text-slate-600">
                                            You can keep this page as a receipt, note down the reference ID, and return to the portal whenever needed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </section>

                <section className="border-t border-slate-200 bg-white/60 backdrop-blur-sm">
                    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-8 py-3 sm:px-10 md:flex-row md:justify-between lg:px-16">
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                        >
                            Return To Portal
                            <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-[12px] font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-[0.98]"
                        >
                            Print Receipt
                            <Printer size={16} />
                        </button>
                    </div>
                </section>
            </motion.div>
        </div>
    );
}

function InfoCard({ icon: Icon, title, value, note, accent }) {
    return (
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2.5 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 ${accent}`}>
                    <Icon size={16} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
            </div>
            <p className="text-[14px] font-black tracking-tight text-slate-900">{value}</p>
            <p className="mt-1.5 text-[12px] font-medium leading-5 text-slate-500">{note}</p>
        </div>
    );
}

function StepRow({ number, title, description }) {
    return (
        <div className="flex gap-3 rounded-2xl border border-white bg-white px-3.5 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-[10px] font-black tracking-[0.16em] text-white">
                {number}
            </div>
            <div>
                <p className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-900">{title}</p>
                <p className="mt-0.5 text-[12px] font-medium leading-5 text-slate-600">{description}</p>
            </div>
        </div>
    );
}
