import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  ChevronRight,
  ShieldAlert,
  Save,
  X
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import Card from '../../components/Card';
import { AuthContext } from '../../context/AuthContext';

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

  const roles = ['admin', 'hr', 'manager', 'vendor'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/v1/users', newUser);
      if (res.data.success) {
        toast.success('User created successfully');
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'vendor' });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleRoleChangeRequest = (user, newRole) => {
    if (user._id === currentUser?.id || user._id === currentUser?._id) {
      toast.error("You cannot change your own role for safety reasons.");
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
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    
    try {
      if (pendingChange.type === 'role') {
        const res = await api.patch(`/v1/users/${pendingChange.userId}/role`, { role: pendingChange.value });
        if (res.data.success) {
          toast.success('Role updated successfully');
          setUsers(prev => prev.map(u => u._id === pendingChange.userId ? { ...u, role: pendingChange.value } : u));
        }
      }
    } catch (err) {
      toast.error('Operation failed');
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
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User <span className="text-indigo-600">Access</span></h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">Manage system roles and permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <UserPlus size={20} />
          Create User
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', count: users.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Vendors', count: users.filter(u => u.role === 'vendor').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active', count: users.filter(u => u.status === 'active').length, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white shadow-sm`}>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.count}</h3>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 text-gray-400 hover:text-indigo-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current Role</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Joined Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-500 font-medium italic">No users found matching your search.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight uppercase tracking-tight">{user.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChangeRequest(user, e.target.value)}
                      className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-0 cursor-pointer hover:text-indigo-600"
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => handleStatusToggle(user)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                      }`}
                    >
                      {user.status || 'active'}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-indigo-100">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-rose-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">System <span className="text-indigo-600">Onboarding</span></h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Create new authenticated access</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="Enter user's name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Work Email</label>
                  <input 
                    type="email" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="name@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned Role</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Temporary Password</label>
                  <input 
                    type="password" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="Minimum 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Create Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Security Warning</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Are you sure you want to change <span className="text-slate-900 font-black">{selectedUser?.name}</span>'s role to <span className="text-orange-600 font-black uppercase tracking-wider">{pendingChange?.value}</span>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200"
              >
                Go Back
              </button>
              <button 
                onClick={confirmChange}
                className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-100"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
