import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Search, Edit, Trash2, Lock, Unlock, 
  CheckCircle2, XCircle, Settings2, AlertCircle, Save, X, 
  ChevronRight, Layers, DollarSign, Briefcase, Activity, Globe, Terminal, User, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const modules = [
        "Dashboard", "Vendors", "Forms", "Applications", "Categories", 
        "Invitations", "SLM", "Contracts", "RFQs", "Quotations", 
        "Departments", "Purchase Orders", "Users", "Roles", "Audit Logs", "Analytics"
    ];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minLimit: 0,
        maxLimit: 0,
        accessibleModules: [],
        permissions: []
    });

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await api.get('/v1/roles');
            if (res.data.success) {
                setRoles(res.data.data);
            }
        } catch (err) {
            toast.error('Authorization sync failure');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await api.get('/v1/roles/permissions');
            if (res.data.success) {
                setPermissions(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch permissions');
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleOpenModal = (role = null) => {
        if (role) {
            setSelectedRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                minLimit: role.minLimit || 0,
                maxLimit: role.maxLimit || 0,
                accessibleModules: role.accessibleModules || [],
                permissions: role.permissions ? role.permissions.map(p => p._id || p) : []
            });
        } else {
            setSelectedRole(null);
            setFormData({
                name: '',
                description: '',
                minLimit: 0,
                maxLimit: 0,
                accessibleModules: [],
                permissions: []
            });
        }
        setIsModalOpen(true);
    };

    const handleModuleToggle = (module) => {
        setFormData(prev => {
            const current = [...prev.accessibleModules];
            if (current.includes(module)) {
                return { ...prev, accessibleModules: current.filter(m => m !== module) };
            } else {
                return { ...prev, accessibleModules: [...current, module] };
            }
        });
    };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const current = [...prev.permissions];
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Synthesizing Level Logic...");
        try {
            let res;
            if (selectedRole) {
                res = await api.put(`/v1/roles/${selectedRole._id}`, formData);
            } else {
                res = await api.post('/v1/roles', formData);
            }

            if (res.data.success) {
                toast.success(selectedRole ? 'Level modified successfully' : 'Level activated successfully', { id: toastId });
                setIsModalOpen(false);
                fetchRoles();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Logic commit failed', { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this level? This will impact dependent entities.')) return;
        try {
            const res = await api.delete(`/v1/roles/${id}`);
            if (res.data.success) {
                toast.success('Level decommissioned');
                fetchRoles();
            }
        } catch (err) {
            toast.error('Decommission protocol failed');
        }
    };

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 fade-in pb-20">
            {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Governance Cluster</span>
                        <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logic & RBAC Control</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">Authorization</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Deep-level access control terminal. Defining operational boundaries, approval range thresholds, and modular visibility.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                  <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Plus size={18} /> New Access Level
                  </button>
                </div>
            </header>

            {/* ── ROLE DIRECTORY ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
                    <div className="relative w-full md:w-[450px]">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find Operations Level (HR, Exec, Procure...)"
                            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                          Registry Logic Nodes: {filteredRoles.length} levels
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Alias</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Valuation Boundaries</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Component Access</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="4"></td></tr>)
                            ) : filteredRoles.map((role, idx) => (
                                <motion.tr 
                                    key={role._id} 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden uppercase">
                                                <span className="text-xl font-black">{role.name.charAt(0)}</span>
                                                <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{role.name}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none max-w-xs line-clamp-1 italic">{role.description || 'Global operational access'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-slate-900"></div>
                                                MAX: {role.maxLimit ? `$${role.maxLimit.toLocaleString()}` : 'UNRESTRICTED'}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300 font-bold text-[9px] uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-slate-100"></div>
                                                MIN: {role.minLimit ? `$${role.minLimit.toLocaleString()}` : '$0'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2 max-w-xs">
                                            {role.accessibleModules?.slice(0, 3).map(m => (
                                                <span key={m} className="px-3 py-1 bg-white border border-slate-100 rounded-[10px] text-[8px] font-black text-slate-400 uppercase tracking-widest shadow-sm group-hover:border-slate-300 group-hover:text-slate-900 transition-all">{m}</span>
                                            ))}
                                            {role.accessibleModules?.length > 3 && (
                                                <span className="px-3 py-1 bg-slate-900 text-white rounded-[10px] text-[8px] font-black uppercase tracking-widest shadow-xl">+{role.accessibleModules.length - 3}</span>
                                            )}
                                            {(!role.accessibleModules || role.accessibleModules.length === 0) && (
                                                <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest italic flex items-center gap-2">Full Registry Access <ShieldCheck size={10} /></span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenModal(role)}
                                                className="p-3 bg-white text-slate-300 hover:text-slate-900 hover:border-slate-900 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95"
                                            >
                                                <Edit size={18} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(role._id)}
                                                className="p-3 bg-white text-slate-300 hover:text-rose-600 hover:border-rose-100 border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredRoles.length === 0 && (
                    <div className="py-40 flex flex-col items-center justify-center text-slate-400 grayscale opacity-40">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                            <Shield size={48} strokeWidth={1} />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-xs">No authorization levels defined</p>
                    </div>
                )}
            </div>

            {/* ── MODIFICATION MODAL ─────────────────────────────────────────── */ }
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Lock size={200} />
                            </div>

                            <div className="p-12 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Level <span className="text-slate-400">Synthesis</span></h2>
                                    <div className="flex items-center gap-2">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{selectedRole ? 'Modify Existing Logic' : 'Initialize New Access Node'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 space-y-16 no-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Alias (Exec / Sales / HR)</label>
                                            <input 
                                                type="text"
                                                placeholder="Enter Logic Node Alias..."
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-lg font-black text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 uppercase tracking-tighter"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Operational Brief</label>
                                            <textarea 
                                                rows="3"
                                                placeholder="Define operational boundaries..."
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300 italic"
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 space-y-10 flex flex-col justify-center">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-slate-50">
                                                <DollarSign size={24} strokeWidth={3} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic">Maximum Valuation Cap</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-900 focus:ring-0 outline-none placeholder-slate-200"
                                                    placeholder="0 = Full Range"
                                                    value={formData.maxLimit}
                                                    onChange={(e) => setFormData({...formData, maxLimit: parseInt(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-200 ml-20"></div>
                                        <div className="flex items-center gap-6 opacity-40">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-50">
                                                <ArrowDownRight size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block italic">Minimum Level Trigger</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-400 focus:ring-0 outline-none"
                                                    value={formData.minLimit}
                                                    onChange={(e) => setFormData({...formData, minLimit: parseInt(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                            <Layers className="text-slate-400" size={24} />
                                            Component <span className="text-slate-400">Visibility</span>
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Node Modular Access</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                        {modules.map(module => (
                                            <button
                                                key={module}
                                                type="button"
                                                onClick={() => handleModuleToggle(module)}
                                                className={`p-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] text-center transition-all duration-500 border-2 ${
                                                    formData.accessibleModules.includes(module)
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xl'
                                                    : 'bg-white text-slate-300 border-slate-100 hover:border-slate-900 hover:text-slate-900'
                                                }`}
                                            >
                                                {module}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 border-t border-slate-50 bg-slate-50/50 flex gap-6">
                                <button 
                                    onClick={handleSubmit}
                                    type="button"
                                    className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <ShieldCheck size={18} /> {selectedRole ? 'Commit Logic Updates' : 'Activate Access Node'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .shadow-premium {
                    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.08);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default RoleManagement;
