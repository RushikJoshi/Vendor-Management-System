import { useState, useContext, useEffect } from "react";
import {
    Building2, Mail, Phone, MapPin,
    FileText, Zap, ShieldCheck, Clock,
    CheckCircle, XCircle, MessageSquare, ExternalLink,
    AlertTriangle, ThumbsUp, ThumbsDown, X
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { normalizeRole, ROLE_HIERARCHY } from "../../config/roles";

export default function ApplicationDetail({ app, onSuccess }) {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("");
    const [remarks, setRemarks] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [appData, setAppData] = useState(app);
    const [loadingDetail, setLoadingDetail] = useState(true);

    // On mount: always fetch full populated data (list view doesn't have formTemplate)
    useEffect(() => {
        const loadFull = async () => {
            try {
                const res = await api.get(`/applications/${app._id}`);
                if (res.data?.data) setAppData(res.data.data);
            } catch (err) {
                console.error("Failed to load full application data:", err);
            } finally {
                setLoadingDetail(false);
            }
        };
        loadFull();
    }, [app._id]);

    // Refresh application data from server (after actions)
    const refreshApp = async () => {
        try {
            const res = await api.get(`/applications/${app._id}`);
            if (res.data?.data) setAppData(res.data.data);
        } catch { /* keep existing */ }
    };


    // Role-based access — normalized
    const userRole = normalizeRole(user?.role || user?.roleName || "");
    const userLevel = ROLE_HIERARCHY[userRole] ?? -1;

    // canAct: reviewer+ can act on submitted, in_review, OR changes_requested
    const canAct = userLevel >= ROLE_HIERARCHY["reviewer"] &&
        ["submitted", "in_review", "changes_requested"].includes(appData.status);

    const isApprovedOrRejected = appData.status === "approved" || appData.status === "rejected";

    // Handle approve via stage workflow
    const handleApprove = async () => {
        if (!remarks.trim()) return toast.error("Please enter authorization remarks for the audit trail.");
        setProcessing(true);
        try {
            const res = await api.patch(`/applications/${appData._id}/approve-stage`, {
                status: "approved",
                remarks: remarks.trim()
            });
            // Immediately update local state from response
            if (res.data?.data) setAppData(res.data.data);
            toast.success("✅ Application Approved Successfully");
            setRemarks("");
            await refreshApp(); // refresh to get fully populated object
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Approval failed");
        } finally {
            setProcessing(false);
        }
    };

    // Handle reject with modal reason
    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error("Please provide a rejection reason.");
        setProcessing(true);
        try {
            const res = await api.patch(`/applications/${appData._id}/approve-stage`, {
                status: "rejected",
                remarks: rejectReason.trim()
            });
            if (res.data?.data) setAppData(res.data.data);
            toast.success("Application rejected.");
            setShowRejectModal(false);
            setRejectReason("");
            await refreshApp();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Rejection failed");
        } finally {
            setProcessing(false);
        }
    };

    // Handle request changes
    const handleRequestChanges = async () => {
        if (!remarks.trim()) return toast.error("Please enter remarks.");
        setProcessing(true);
        try {
            const res = await api.patch(`/applications/${appData._id}/approve-stage`, {
                status: "changes_requested",
                remarks: remarks.trim()
            });
            if (res.data?.data) setAppData(res.data.data);
            toast.success("Clarification requested from vendor.");
            setRemarks("");
            await refreshApp();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setProcessing(false);
        }
    };

    const formTabs = appData.formTemplate?.sections?.map((sec, idx) => ({
        id: `section-${idx}`,
        label: (sec.sectionTitle || "").split(' ').slice(0, 3).join(' ') + "...",
        icon: FileText
    })) || [];

    const tabs = [
        ...formTabs,
        { id: "documents", label: "Documents", icon: ShieldCheck },
        { id: "risk", label: "Risk Matrix", icon: Zap },
        { id: "timeline", label: "Audit Timeline", icon: Clock },
    ];

    useEffect(() => {
        if (!activeTab && tabs.length > 0) setActiveTab(tabs[0].id);
    }, [tabs.length]);

    const renderSectionFieldsByIndex = (index) => {
        const section = appData.formTemplate?.sections?.[index];
        if (!section) return <p className="text-sm text-gray-400 italic">No section data available.</p>;

        const dataMap = appData.data instanceof Map ? Object.fromEntries(appData.data) : (appData.data || {});

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {section.fields.map(field => {
                    const key = field.fieldId || field.name || field.label?.toLowerCase().replace(/\s+/g, '_');
                    const value = dataMap[key] ?? dataMap[field.name] ?? dataMap[field.label];
                    return (
                        <div key={key} className="border-b border-gray-50 pb-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{field.label}</p>
                            <p className="text-sm font-bold text-gray-900">
                                {field.type === 'checkbox'
                                    ? (value ? 'YES / COMPLIANT' : 'NO / NON-COMPLIANT')
                                    : (value
                                        ? String(value)
                                        : <span className="text-gray-300 italic">Unspecified</span>)
                                }
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper to find a value by common labels or keys
    const searchVal = (...terms) => {
        if (!appData.data) return "N/A";
        const dataMap = appData.data instanceof Map ? Object.fromEntries(appData.data) : appData.data;

        // Try direct keys first
        for (let t of terms) {
            if (dataMap[t]) return dataMap[t];
        }

        // Try searching by matching labels in sections
        if (appData.formTemplate?.sections) {
            for (let section of appData.formTemplate.sections) {
                for (let field of section.fields) {
                    const label = (field.label || "").toLowerCase();
                    for (let t of terms) {
                        if (label.includes(t.toLowerCase())) {
                            const val = dataMap[field.fieldId] || dataMap[field.name];
                            if (val) return val;
                        }
                    }
                }
            }
        }
        return "N/A";
    };

    if (loadingDetail) {
        return <div className="flex items-center justify-center p-20 text-emerald-700 font-bold uppercase tracking-widest animate-pulse">Accessing Secure Dossier...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">

            {/* ── Reject Reason Modal ── */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                                    <XCircle size={20} className="text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Reject Application</h3>
                                    <p className="text-xs text-slate-400 font-medium">Reason will be recorded in audit log</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>

                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                            Rejection Reason *
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-rose-400 focus:ring-4 focus:ring-rose-50 outline-none transition-all placeholder-slate-300 resize-none"
                            placeholder="Enter specific reason for rejection..."
                            rows={4}
                            autoFocus
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing || !rejectReason.trim()}
                                className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                            >
                                <XCircle size={14} />
                                {processing ? "Processing..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left: Basic Details Card */}
            <div className="lg:w-[320px] space-y-6">
                <div className="bg-white border-t-4 border-[#0B5D3B] border-x border-b border-gray-200 rounded-[8px] p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-[6px] flex items-center justify-center text-[#0B5D3B] mb-4 border border-emerald-100">
                            <Building2 size={32} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase">{appData.companyName}</h2>
                        <p className="text-[10px] font-black text-[#0B5D3B] mt-2 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{appData.category?.name || "Tier 1 Vendor"}</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <DetailItem icon={Mail} label="Registry Email" value={appData.email} />
                        <DetailItem icon={Phone} label="Contact Node" value={searchVal('mobileNumber', 'phone', 'mobile', 'contact')} />
                        <DetailItem icon={MapPin} label="Global HQ" value={searchVal('address', 'registeredAddress', 'location', 'hq')} />
                        <div className="pt-4 flex flex-col gap-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dossier Status</p>
                            <StatusBadge status={appData.status} />
                        </div>
                    </div>
                </div>

                {/* Eligibility Widget */}
                <div className="bg-[#0B5D3B] rounded-[8px] p-6 text-white shadow-xl shadow-[#0B5D3B]/10">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Composite Score</p>
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-black leading-none">{appData.eligibilityScore}</span>
                        <div className="mb-1">
                            <p className="text-xs font-black uppercase leading-none text-emerald-300">{appData.riskLevel} RISK</p>
                            <p className="text-[10px] opacity-60">Eligibility Verified</p>
                        </div>
                    </div>
                </div>

                {/* Current Stage */}
                <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Current Workflow Stage</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-black text-gray-800 uppercase tracking-wide">{appData.currentStage || "—"}</span>
                    </div>
                </div>
            </div>

            {/* Right: Tabbed View */}
            <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm flex flex-col h-full min-h-[600px]">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50 rounded-t-[8px]">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? "border-[#0B5D3B] text-[#0B5D3B] bg-white"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-10 flex-1 overflow-y-auto">
                        {appData.formTemplate?.sections?.map((section, idx) => {
                            if (activeTab === `section-${idx}`) {
                                return (
                                    <div key={idx} className="space-y-12">
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <span className="w-8 h-[2px] bg-emerald-200"></span> {section.sectionTitle}
                                                </h4>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-[4px] border border-gray-100">
                                                    Form v{appData.formTemplate?.version || 1}
                                                </span>
                                            </div>
                                            {renderSectionFieldsByIndex(idx)}
                                        </section>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {activeTab === "documents" && (
                            <div className="space-y-10">
                                <section>
                                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                        <span className="w-8 h-[2px] bg-emerald-200"></span> Verified Attachments
                                    </h4>
                                    {(!appData.documents || appData.documents.length === 0) ? (
                                        <p className="text-sm text-gray-400 italic font-medium">No documents uploaded.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {appData.documents?.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-[6px] group hover:border-[#0B5D3B]/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-[4px] flex items-center justify-center text-gray-400 group-hover:text-[#0B5D3B]">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{doc.name}</p>
                                                            <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{doc.fieldName}</p>
                                                        </div>
                                                    </div>
                                                    <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-[#0B5D3B] hover:bg-emerald-50 rounded-full transition-colors">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {activeTab === "risk" && (
                            <div className="space-y-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">Risk Breakdown Matrix</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <RiskBar label="Financial Risk" score={appData.riskMetrics?.financialRisk || 0} />
                                    <RiskBar label="Compliance Risk" score={appData.riskMetrics?.complianceRisk || 0} />
                                    <RiskBar label="Operational Risk" score={appData.riskMetrics?.operationalRisk || 0} />
                                    <RiskBar label="Overall Risk Profiling" score={appData.riskMetrics?.overallRiskScore || 0} />
                                </div>
                            </div>
                        )}

                        {activeTab === "timeline" && (
                            <div className="space-y-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-100 pb-2">Procurement Workflow Timeline</h4>
                                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    {appData.workflowStages?.map((stage, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-10 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${stage.status === 'approved' ? 'bg-emerald-500' :
                                                stage.status === 'pending' ? 'bg-[#0B5D3B]' :
                                                    stage.status === 'rejected' ? 'bg-rose-500' :
                                                        'bg-gray-200'
                                                }`}>
                                                {stage.status === 'approved' && <CheckCircle size={10} className="text-white" />}
                                                {stage.status === 'pending' && <Clock size={10} className="text-white" />}
                                                {stage.status === 'rejected' && <XCircle size={10} className="text-white" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest leading-none">{stage.stageName}</h5>
                                                    <StatusBadge status={stage.status} />
                                                </div>
                                                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase italic">{stage.assignedRole}</p>
                                                {stage.remarks && (
                                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-[4px]">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2 italic">
                                                            <MessageSquare size={10} /> Auditor Remarks
                                                        </p>
                                                        <p className="text-xs font-semibold text-gray-700 italic">"{stage.remarks}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ──────────── DECISION PANEL ──────────── */}
                    {isApprovedOrRejected ? (
                        /* Already decided — show status only */
                        <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Decision:</span>
                            <StatusBadge status={appData.status} />
                        </div>
                    ) : canAct ? (
                        /* Pending — show action panel */
                        <div className="p-8 border-t border-gray-200 bg-gray-50/30">
                            {/* Remarks input */}
                            <div className="mb-5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                    Authorization Remarks <span className="text-rose-400">*</span>
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-[#0B5D3B] focus:ring-4 focus:ring-[#0B5D3B]/5 outline-none transition-all placeholder-gray-300 resize-none"
                                    placeholder="Enter detailed justification for audit trail..."
                                    rows={2}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* Request Changes */}
                                <button
                                    onClick={handleRequestChanges}
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-white border-2 border-amber-400 text-amber-600 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 hover:text-white transition-all flex items-center gap-2 disabled:opacity-40"
                                >
                                    <MessageSquare size={15} /> Request Changes
                                </button>

                                <div className="flex items-center gap-3 ml-auto">
                                    {/* Reject Button */}
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={processing}
                                        className="px-6 py-3 bg-white border-2 border-rose-500 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
                                    >
                                        <ThumbsDown size={15} /> Reject
                                    </button>

                                    {/* Approve Button */}
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing || !remarks.trim()}
                                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-[#0B5D3B] text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:from-emerald-700 hover:to-[#0a4f32] transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-40"
                                    >
                                        <ThumbsUp size={15} />
                                        {processing ? "Processing..." : "Approve Stage"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Submitted but user can't act */
                        <div className="p-5 border-t border-gray-200 bg-amber-50/50 flex items-center gap-3">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                            <p className="text-xs font-bold text-amber-700">
                                This application is pending review for stage <strong>{appData.currentStage}</strong>. You do not have permission to act on this stage.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="flex gap-3">
            <Icon size={16} className="text-gray-400 mt-0.5" />
            <div className="min-w-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-xs font-bold text-gray-900 truncate">{value}</p>
            </div>
        </div>
    );
}

function RiskBar({ label, score = 0 }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-[11px] font-extrabold text-[#0B5D3B] leading-none italic">{score}%</p>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${score >= 70 ? 'bg-[#0B5D3B]' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
}
