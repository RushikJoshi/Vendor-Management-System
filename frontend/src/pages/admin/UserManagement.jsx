import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, Shield, 
  Mail, CheckCircle, XCircle, Edit, Trash2, ChevronRight,
  ShieldAlert, Save, X, Activity, Globe, Terminal, User, ArrowUpRight, Lock
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingChange, setPendingChange] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor'
  });

  const [roles, setRoles] = useState(['admin', 'hr', 'manager', 'vendor']);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const fetchRoles = async () => {
    try {
      const res = await api.get('/v1/roles');
      if (res.data.success && res.data.data.length > 0) {
        setRoles(res.data.data.map(r => r.name));
      }
    } catch (err) {
      console.log('Using default roles due to error or no custom roles found');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Registry sync failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const resetForm = () => {
    setNewUser({ name: '', email: '', password: '', role: 'vendor' });
    setIsEditing(false);
    setSelectedUserId(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Processing Identity Protocol...");
    try {
      let res;
      if (isEditing) {
        const updateData = { ...newUser };
        if (!updateData.password) delete updateData.password;
        res = await api.put(`/v1/users/${selectedUserId}`, updateData);
      } else {
        res = await api.post('/v1/users', newUser);
      }

      if (res.data.success) {
        toast.success(isEditing ? 'Identity updated successfully' : 'Identity committed to registry', { id: toastId });
        setIsModalOpen(false);
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Protocol rejection', { id: toastId });
    }
  };

  const handleEditClick = (user) => {
    setNewUser({
      name: user.name,
      email: user.email,
      password: '', 
      role: user.role
    });
    setSelectedUserId(user._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser?.id || id === currentUser?._id) {
      toast.error("Self-termination protocol restricted.");
      return;
    }
    if (!window.confirm('Are you sure you want to remove this entity from the global registry?')) return;
    
    try {
      const res = await api.delete(`/v1/users/${id}`);
      if (res.data.success) {
        toast.success('Entity removed successfully');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const handleRoleChangeRequest = (user, newRole) => {
    if (user._id === currentUser?.id || user._id === currentUser?._id) {
      toast.error("Auth restriction: Cannot modify own administrative role.");
      return;
    }
    if (user.role === newRole) return;
    setPendingChange({ userId: user._id, type: 'role', value: newRole });
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/v1/users/${user._id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Entity ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      toast.error('Status modification bridge failed');
    }
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    
    try {
      if (pendingChange.type === 'role') {
        const res = await api.patch(`/v1/users/${pendingChange.userId}/role`, { role: pendingChange.value });
        if (res.data.success) {
          toast.success('Authorization updated successfully');
          setUsers(prev => prev.map(u => u._id === pendingChange.userId ? { ...u, role: pendingChange.value } : u));
        }
      }
    } catch (err) {
      toast.error('Logic failure');
    } finally {
      setIsConfirmOpen(false);
      setPendingChange(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 fade-in pb-20">
      {/* ── BREADCRUMB & HEADER ─────────────────────────────────────────── */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-slate-200 pb-12 text-[#FDFDFD]">
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Security Cluster</span>
                <div className="h-1 w-6 bg-slate-200 rounded-full"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Identity Access</span>
            </div>
            <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-[-0.05em] uppercase leading-none mb-4">User Access</h1>
                <p className="text-sm font-medium text-slate-500 max-w-xl italic border-l-4 border-slate-900/10 pl-6">Governance terminal for modifying system permissions, role-based access controls, and entity status.</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <UserPlus size={18} /> Create Identity
          </button>
        </div>
      </header>

      {/* ── PERFORMANCE MONITOR ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <MetricMini label="Global Registry" value={users.length} trend="Total" isPositive={true} />
           <MetricMini label="Admin Nodes" value={users.filter(u => u.role === 'admin').length} trend="Core" isPositive={true} />
           <MetricMini label="Operational Nodes" value={users.filter(u => u.role === 'vendor').length} trend="Edge" isPositive={true} />
           <MetricMini label="Active Uplinks" value={users.filter(u => u.status === 'active').length} trend="Live" isPositive={true} />
      </div>

      {/* ── IDENTITY DIRECTORY ──────────────────────────────────────────── */ }
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-10 bg-slate-50/50">
          <div className="relative w-full md:w-[450px]">
             <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
              type="text"
              placeholder="Search Entities By Alias or Email..."
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">
               <Filter size={16} /> Advanced Filter
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
              Access Log Index: {filteredUsers.length} Nodes
            </span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Dossier</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Role</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Control Status</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Sync</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse h-24 bg-slate-50/10"><td colSpan="5"></td></tr>)
              ) : filteredUsers.map((user, idx) => (
                <motion.tr 
                    key={user._id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group hover:bg-[#FDFDFD] transition-all border-l-4 border-transparent hover:border-slate-900 cursor-pointer"
                >
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:shadow-xl transition-all shadow-inner relative overflow-hidden">
                                <span className="text-xl font-black">{user.name.charAt(0)}</span>
                                <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{user.name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{user.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="relative group/select">
                            <select 
                                value={user.role}
                                onChange={(e) => handleRoleChangeRequest(user, e.target.value)}
                                className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-0 cursor-pointer hover:border-slate-900 transition-all appearance-none shadow-sm pr-10"
                            >
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronRight size={12} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <button 
                            onClick={() => handleStatusToggle(user)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                user.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                            }`}
                        >
                            {user.status || 'active'}
                        </button>
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                            {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => handleEditClick(user)}
                                className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-rose-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE USER MODAL ─────────────────────────────────────────── */ }
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <User size={150} />
              </div>

              <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Identity <span className="text-slate-400">Onboarding</span></h2>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{isEditing ? 'Modify Existing Node' : 'Initialize New Access Protocol'}</span>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-12 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic ml-4">Entity Alias</label>
                    <input 
                      type="text" required
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                      placeholder="Principal Identity Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic ml-4">Communication Uplink</label>
                    <input 
                      type="email" required
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                      placeholder="node@enterprise.network"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic ml-4">Strategic Role</label>
                    <select 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner appearance-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic ml-4">Security Key {isEditing && '(Optional)'}</label>
                    <input 
                      type="password" required={!isEditing}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-12 focus:ring-slate-50 focus:border-slate-900 outline-none transition-all shadow-inner placeholder-slate-300"
                      placeholder={isEditing ? "Bypass password modification" : "Minimum security entropy reached"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="submit"
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    <ShieldCheck size={18} /> {isEditing ? 'Commit Identity Modification' : 'Initialize Identity Protocol'}
                  </button>
                </div>
              </form>
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
          select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1.2rem; }
      `}</style>
    </div>
  );
};

const MetricMini = ({ label, value, trend, isPositive }) => (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-premium group hover:border-slate-900 transition-all duration-500">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-hover:text-slate-900 transition-colors uppercase">{label}</p>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {trend}
            </div>
        </div>
    </div>
);

export default UserManagement;
