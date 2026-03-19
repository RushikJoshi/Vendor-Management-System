import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Zap,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const RFQList = () => {
    const navigate = useNavigate();
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRFQs = async () => {
            try {
                const res = await api.get('/rfqs');
                setRfqs(res.data.data);
            } catch (err) {
                toast.error('Failed to load RFQs');
            } finally {
                setLoading(false);
            }
        };
        fetchRFQs();
    }, []);

    const StatusBadge = ({ status }) => {
        const styles = {
            draft: "bg-gray-100 text-gray-600 border-gray-200",
            published: "bg-emerald-50 text-emerald-600 border-emerald-100",
            closed: "bg-rose-50 text-rose-600 border-rose-100",
            cancelled: "bg-gray-200 text-gray-400 border-gray-300"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Procurement <span className="text-indigo-600">Requests</span></h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Manage and track your Requests for Quotations</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/rfq/create')}
                    className="saas-btn-primary group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Create New RFQ
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active RFQs</p>
                        <h3 className="text-2xl font-black text-gray-900">{rfqs.filter(r => r.status === 'published').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drafts</p>
                        <h3 className="text-2xl font-black text-gray-900">{rfqs.filter(r => r.status === 'draft').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quotes</p>
                        <h3 className="text-2xl font-black text-gray-900">42</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input placeholder="Search RFQs..." className="w-full bg-white border-none rounded-xl py-2 pl-10 pr-4 shadow-sm text-sm" />
                    </div>
                    <div className="flex gap-2">
                         <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">RFQ Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rfqs.map((rfq) => (
                                <tr key={rfq._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-gray-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{rfq.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: RFQ-{rfq._id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{rfq.departmentId?.name || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{rfq.items?.length || 0} Items</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar size={14} />
                                            <span className="text-xs font-bold">{new Date(rfq.quoteDeadline).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={rfq.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {rfqs.length === 0 && !loading && (
                    <div className="p-20 text-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">No procurement requests found</h3>
                        <p className="text-xs text-gray-300 mt-2">Create your first RFQ to start inviting vendors.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RFQList;
