import { useState, useEffect } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import { toast } from "react-hot-toast";
import {
    Eye, Building2, Mail, Filter,
    ArrowRight, Activity, Zap
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import ApplicationDetail from "./ApplicationDetail";

export default function Applications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        fetchApps();
    }, [filterStatus]);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/applications`);
            setApps(res.data.data);
        } catch (err) {
            toast.error("Connectivity failure: Registry inaccessible");
        } finally {
            setLoading(false);
        }
    };

    const headers = ["Vendor Detail", "Communication Node", "Workflow Status", "Risk & Eligibility", "Actions"];

    const renderRow = (app) => (
        <>
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[6px] bg-gray-50 border border-gray-200 flex items-center justify-center text-corp-dark">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-gray-900 leading-none">{app.companyName || "N/A"}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter italic">{app.category?.name || "General"}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-gray-600 font-semibold text-xs">
                    <Mail size={14} className="text-gray-300" />
                    {app.email}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Activity size={10} className="text-corp-secondary" />
                        <span className="uppercase tracking-widest">{app.currentStage}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase border ${app.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                app.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                            {app.riskLevel} Risk
                        </span>
                        <span className="text-[10px] font-bold text-gray-800 tracking-tighter italic">{app.eligibilityScore}% MATCH</span>
                    </div>
                    <StatusBadge status={app.status} />
                </div>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => setSelectedApp(app)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-[6px] text-gray-500 hover:text-corp-dark hover:border-corp-dark transition-all text-xs font-bold uppercase flex items-center gap-2 shadow-sm"
                >
                    Review <ArrowRight size={14} />
                </button>
            </td>
        </>
    );

    return (
        <div className="space-y-6 fade-in">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-corp-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-corp-text tracking-tighter">Registration Queue</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Infrastructure Procurement Pipeline Analysis</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-gray-200 rounded-[6px] pl-10 pr-8 py-2 text-xs font-bold text-gray-600 focus:border-corp-dark outline-none cursor-pointer appearance-none uppercase tracking-widest min-w-[200px]"
                        >
                            <option value="">All Lifecycle Stages</option>
                            <option value="pending">Review Required</option>
                            <option value="approved">Activated Nodes</option>
                            <option value="rejected">Decommissioned</option>
                        </select>
                    </div>
                </div>
            </header>

            <Table headers={headers} data={apps} renderRow={renderRow} loading={loading} />

            {selectedApp && (
                <Modal open={true} onClose={() => setSelectedApp(null)} size="7xl">
                    <ApplicationDetail app={selectedApp} onSuccess={() => { setSelectedApp(null); fetchApps(); }} />
                </Modal>
            )}
        </div>
    );
}
