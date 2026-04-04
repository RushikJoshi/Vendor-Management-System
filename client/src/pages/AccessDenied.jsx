import React, { useContext, useEffect } from 'react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { normalizeRole } from '../config/roles';
import { getAdminLinksForUser } from '../config/SidebarConfig';

export default function AccessDenied() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;

        const userRole = normalizeRole(user?.role || user?.roleName || "");
        const adminLinks = getAdminLinksForUser(user, user?.allowedModules || []);
        const target = userRole === "vendor" ? "/vendor/dashboard" : adminLinks[0]?.to || "/admin/dashboard";

        const timer = window.setTimeout(() => {
            navigate(target, { replace: true });
        }, 1200);

        return () => window.clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <ShieldX size={48} className="text-rose-600" />
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                    Access <span className="text-rose-600 italic">Denied</span>
                </h1>
                
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    You do not have the necessary permissions to access this restricted protocol. Please contact your administrator if you believe this is an error.
                </p>

                {user && (
                    <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Redirecting to your workspace...
                    </p>
                )}

                <div className="space-y-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <Home size={16} /> Return Home
                    </button>
                </div>

                <div className="mt-10 pt-10 border-t border-dashed border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                        Security Protocol Error 403
                    </p>
                </div>
            </div>
        </div>
    );
}
