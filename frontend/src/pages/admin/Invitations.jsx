import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { toast } from "react-hot-toast";
import { Send, Clock, Plus, X, Mail, ShieldCheck } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function Invitations() {
    const [invitations, setInvitations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: "", categoryId: "" });

    const fetchData = async () => {
        try {
            const [invRes, catRes] = await Promise.all([
                api.get("/invitations"),
                api.get("/categories"),
            ]);
            setInvitations(invRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch (err) {
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Sending secure invitation...");
        try {
            await api.post("/invitations/send", formData);
            toast.success("Invitation dispatched successfully", { id: toastId });
            setShowModal(false);
            setFormData({ email: "", categoryId: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send invitation", { id: toastId });
        }
    };

    const headers = ["Recipient Node", "Strategic Category", "Dispatch Date", "Validity", "Authorization"];

    return (
        <div className="space-y-6 fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-corp-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tighter">Onboarding Access</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Manage Secure Invitations for Strategic Infrastructure Partners</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="btn-enterprise-primary flex items-center gap-2 shadow-sm"
                >
                    <Plus size={16} /> Issue Invitation
                </button>
            </header>

            <Table
                headers={headers}
                data={invitations}
                loading={loading}
                renderRow={(inv) => (
                    <>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 border border-gray-200 rounded-[4px] text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <span className="text-gray-900 font-bold text-xs">{inv.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-[11px] font-bold text-corp-secondary uppercase tracking-wider">
                                {inv.category?.name || "N/A"}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold text-xs text-center">
                            {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-semibold text-xs text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Clock size={12} className="text-amber-500" />
                                {new Date(inv.expiresAt).toLocaleDateString('en-IN')}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <StatusBadge status={inv.status} />
                        </td>
                    </>
                )}
            />

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Consign New Invitation"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Recipient Email</label>
                        <input
                            type="email"
                            required
                            className="input-enterprise font-semibold"
                            placeholder="entity@infrastructure-div.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned Operational Segment</label>
                        <select
                            required
                            className="input-enterprise font-semibold"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                            <option value="">Select segment...</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full btn-enterprise-primary py-3 flex items-center justify-center gap-3">
                            <ShieldCheck size={18} /> Dispatch Secure Link
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
