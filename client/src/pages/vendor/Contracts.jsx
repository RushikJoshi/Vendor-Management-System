import React, { useEffect, useState } from "react";
import { 
    FileSignature, ShieldCheck, Briefcase, TrendingUp, 
    Download, ExternalLink, Calendar, DollarSign, 
    Package, Truck, Clock, CheckCircle2, History
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function VendorContracts() {
    const [contracts, setContracts] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("agreements");

    const fetchData = async () => {
        try {
            const [contractsRes, posRes] = await Promise.all([
                api.get("/contracts"),
                api.get("/pos")
            ]);
            setContracts(contractsRes.data.data);
            setPurchaseOrders(posRes.data.data);
        } catch (err) {
            toast.error("Unable to synchronize operative nodes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest italic">Synchronizing Execution Matrices...</div>;

    return (
        <div className="space-y-6 pb-20 fade-in">
            {/* Header / Stats */}
            <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3 block">Operative Procurement Hub</span>
                        <h1 className="text-4xl font-black tracking-tight">Lifecycle Execution</h1>
                        <p className="mt-2 text-slate-400 text-sm font-medium">Track formal agreements and delivery directives in real-time.</p>
                    </div>
                    <div className="flex gap-4">
                        <StatBox label="Active Agreements" value={contracts.length} color="text-indigo-400" />
                        <StatBox label="Open Purchase Orders" value={purchaseOrders.length} color="text-emerald-400" />
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
                <TabButton 
                    active={activeTab === "agreements"} 
                    onClick={() => setActiveTab("agreements")}
                    icon={FileSignature}
                    label="Formal Agreements"
                />
                <TabButton 
                    active={activeTab === "pos"} 
                    onClick={() => setActiveTab("pos")}
                    icon={Package}
                    label="Purchase Orders"
                />
            </div>

            {/* Content Rendering */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === "agreements" ? (
                    contracts.length > 0 ? (
                        contracts.map((contract) => (
                            <ContractCard key={contract._id} contract={contract} />
                        ))
                    ) : (
                        <EmptyState message="No formal contracts found in active registry." />
                    )
                ) : (
                    purchaseOrders.length > 0 ? (
                        purchaseOrders.map((po) => (
                            <POCard key={po._id} po={po} />
                        ))
                    ) : (
                        <EmptyState message="No operative purchase orders assigned to this node." />
                    )
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[160px]">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                active 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]' 
                : 'text-slate-400 hover:bg-slate-50'
            }`}
        >
            <Icon size={14} /> {label}
        </button>
    );
}

function ContractCard({ contract }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl shadow-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <FileSignature size={28} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-full border border-indigo-100">
                        Registry: {contract.contractNumber}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                        <ShieldCheck size={12} /> {contract.status || "active"}
                    </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{contract.contractTitle}</h3>
                <div className="flex flex-wrap gap-4 text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar size={14} /> Start: {new Date(contract.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <DollarSign size={14} /> Value: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(contract.contractValue)}
                    </span>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                    Download PDF <Download size={14} />
                </button>
            </div>
        </div>
    );
}

function POCard({ po }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-100 transition-all flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl shadow-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                <Package size={28} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Order_Node: {po.poNumber}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                        po.status === 'delivered' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                    }`}>
                        <Clock size={12} /> {po.status || "sent"}
                    </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Operative_Delivery: #{po._id.slice(-8).toUpperCase()}</h3>
                <div className="flex flex-wrap gap-4 text-slate-400">
                     <span className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <History size={14} /> Last Update: {new Date(po.updatedAt).toLocaleTimeString()}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <Truck size={14} /> Priority Delivery
                    </span>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 border-2 border-slate-900">
                    Track Shipping <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
            <History size={48} className="mb-4 opacity-20" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em]">{message}</p>
        </div>
    );
}
