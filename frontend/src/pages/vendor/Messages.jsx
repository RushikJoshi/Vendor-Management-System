import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { MessageSquare, Mail, Reply } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vendors/messages")
      .then((res) => setMsgs(res.data.data))
      .catch(() => toast.error("Failed to fetch your messages"))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = (id) => {
    toast.success("Reply window opening...");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="text-pink-400" size={32} />
          Your Inbox
        </h1>
        <p className="text-slate-400 mt-1">View and respond to inquiries from administrators.</p>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <Table
          headers={["Sender", "Subject", "Date", "Actions"]}
          data={msgs}
          loading={loading}
          renderRow={(m) => (
            <>
              <td className="px-6 py-4">
                <span className="font-semibold text-slate-200">Administrator</span>
              </td>
              <td className="px-6 py-4 text-slate-300">
                {m.subject}
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">
                {new Date(m.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleReply(m._id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-pink-600/10 text-pink-400 hover:bg-pink-600/20 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <Reply size={14} />
                  Reply
                </button>
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
}