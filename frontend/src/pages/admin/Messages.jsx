import { useEffect, useState } from "react";
import api from "../../services/api";
import Table from "../../components/Table";
import { MessageSquare, Mail, Reply, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/messages")
      .then((res) => setMessages(res.data.data))
      .catch(() => toast.error("Failed to fetch messages"))
      .finally(() => setLoading(false));
  }, []);

  const handleReply = (id) => {
    toast.success("Opening reply dialog... (coming soon)");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="text-indigo-400" size={32} />
          Messages
        </h1>
        <p className="text-slate-400 mt-1">Communicate with your partner vendors.</p>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <Table
          headers={["Sender", "Subject", "Received", "Actions"]}
          data={messages}
          loading={loading}
          renderRow={(m) => (
            <>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Mail size={16} />
                  </div>
                  <span className="font-semibold text-slate-200">{m.from}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-300 max-w-md truncate">
                {m.subject}
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">
                {new Date(m.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleReply(m._id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
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