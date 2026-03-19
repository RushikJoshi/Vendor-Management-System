import React, { useState, useEffect } from "react";
import api from "../services/api";
import StatCard from "../components/StatCard";
import MonthlyVendorChart from "../components/MonthlyVendorChart";
import { Users, CheckCircle, IndianRupee, Star, LayoutDashboard } from "lucide-react";
import { toast } from "react-hot-toast";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get("/dashboard/vendor-stats");
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Vendors"
                    value={stats.totalVendors}
                    icon={<Users size={24} />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                />
                <StatCard
                    title="Active Vendors"
                    value={stats.activeVendors}
                    icon={<CheckCircle size={24} />}
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                />
                <StatCard
                    title="Pending Payments"
                    value={`₹${stats.totalPendingPayments.toLocaleString("en-IN")}`}
                    icon={<IndianRupee size={24} />}
                    bgColor="bg-orange-50"
                    textColor="text-orange-600"
                />
                <StatCard
                    title="Average Rating"
                    value={`${stats.averageRating} / 5`}
                    icon={<Star size={24} />}
                    bgColor="bg-yellow-50"
                    textColor="text-yellow-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <MonthlyVendorChart data={stats.monthlyVendorStats} />
                </div>

                {/* Quick Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Purchase Orders</span>
                                <span className="font-semibold">{stats.totalOrders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Active Rate</span>
                                <span className="font-semibold">
                                    {stats.totalVendors > 0
                                        ? Math.round((stats.activeVendors / stats.totalVendors) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="mt-6 w-full py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
