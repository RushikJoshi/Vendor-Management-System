import { useEffect, useState } from "react";
import api from "../../services/api";
import Card from "../../components/Card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your vendor overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-medium">Total Vendors</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm font-medium">Pending</div>
          <div className="text-3xl font-bold mt-2">{stats.pending}</div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-medium">Approved</div>
          <div className="text-3xl font-bold mt-2">{stats.approved}</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity</p>
      </Card>
    </div>
  );
}
