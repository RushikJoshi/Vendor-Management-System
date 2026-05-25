import { useState, useEffect } from "react";
import { MessageSquare, Send, User, ShieldAlert, Loader2, MessageCircle } from "lucide-react";
import procurementApi from "../services/procurementApi";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function CommentSection({ targetModel, targetId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
        if (targetId && targetId !== "undefined") {
            fetchComments();
        } else {
            setLoading(false);
        }
    }, [targetId]);

    const fetchComments = async () => {
        if (!targetId || targetId === "undefined") return;
        try {
            const res = await procurementApi.getComments(targetModel, targetId);
            setComments(res.data.data);
        } catch (err) {
            console.error("Failed to load comments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content.trim() || !targetId || targetId === "undefined") return;
        setSubmitting(true);
        try {
            const res = await procurementApi.addComment({
                targetModel,
                targetId,
                content,
                isInternal: user.role !== "vendor" && isInternal
            });
            setComments([...comments, res.data.data]);
            setContent("");
            setIsInternal(false);
        } catch (err) {
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <MessageCircle size={14} className="text-indigo-500" /> Discussion Ledger
                </h3>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                    {comments.length} Entries
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[400px] bg-slate-50/20">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-slate-300" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                        <MessageSquare size={32} strokeWidth={1} className="mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No conversation logs found</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className={`flex gap-3 ${comment.isInternal ? 'opacity-80' : ''}`}>
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                                comment.userId.role === 'admin' ? 'bg-slate-900 text-white' : 
                                comment.userId.role === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {comment.userId.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-black text-slate-900">{comment.userId.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {comment.isInternal && (
                                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                                            <ShieldAlert size={8} /> Internal
                                        </span>
                                    )}
                                </div>
                                <div className={`p-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                                    comment.isInternal ? 'bg-amber-50/50 text-amber-900 border border-amber-100' : 'bg-white text-slate-700 border border-slate-100'
                                }`}>
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                <div className="relative">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Broadcast a message..."
                        className="w-full rounded-xl border border-slate-200 p-4 pr-12 text-[13px] font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none min-h-[80px] bg-slate-50/30"
                    />
                    <button 
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="absolute bottom-3 right-3 h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all active:scale-95 disabled:opacity-30"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                </div>
                {user.role !== "vendor" && (
                    <div className="mt-2 flex items-center gap-2 px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="h-3 w-3 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">Internal-Only Audit Note</span>
                        </label>
                    </div>
                )}
            </form>
        </div>
    );
}
