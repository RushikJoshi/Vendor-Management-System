import React, { useState, useContext, useRef, useEffect } from 'react';
import { Bell, Check, Trash, Info, CheckCircle, AlertTriangle, FileText, ChevronRight, ReceiptIndianRupee, MessageSquare, CreditCard } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);


    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        
        // Navigation logic
        if (notification.type === 'vendor') navigate('/admin/vendors');
        if (notification.type === 'rfq') navigate('/admin/rfqs');
        if (notification.type === 'quotation') navigate(notification.relatedEntityId ? `/admin/rfqs/${notification.relatedEntityId}/compare` : '/admin/rfqs');
        if (notification.type === 'application') navigate('/admin/applications');
        if (notification.type === 'contract') navigate('/admin/contracts');
        if (notification.type === 'comment' || notification.type === 'procurement') {
            navigate(notification.relatedEntityId ? `/admin/procurement/po/${notification.relatedEntityId}` : '/admin/procurement');
        }
        if (notification.type === 'payment') {
            navigate(notification.relatedEntityId ? `/admin/procurement/payment/${notification.relatedEntityId}` : '/admin/procurement');
        }
        
        setIsOpen(false);
    };


    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'vendor': return <Info className="text-blue-500" size={16} />;
            case 'rfq': return <FileText className="text-indigo-500" size={16} />;
            case 'quotation': return <ReceiptIndianRupee className="text-violet-500" size={16} />;
            case 'application': return <CheckCircle className="text-green-500" size={16} />;
            case 'contract': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'comment': return <MessageSquare className="text-sky-500" size={16} />;
            case 'payment': return <CreditCard className="text-emerald-500" size={16} />;
            case 'procurement': return <FileText className="text-indigo-600" size={16} />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button 
                onClick={toggleDropdown}
                className="relative rounded-2xl p-2.5 text-gray-400 transition-all hover:bg-gray-50 hover:text-indigo-600"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <>
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center font-black rounded-full border-2 border-white ring-4 ring-rose-500/10">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 rounded-full animate-ping opacity-25"></span>
                    </>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] z-50 animate-in fade-in slide-in-from-top-4 duration-300 sm:w-96">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">{unreadCount} New</span>}
                        </h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[70vh] overflow-y-auto scrollbar-hide py-2">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Bell className="mx-auto text-gray-100 mb-4" size={48} />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative px-5 py-4 transition-all hover:bg-indigo-50/50 cursor-pointer ${!notification.isRead ? 'bg-indigo-50/20 shadow-sm' : ''}`}
                                >

                                    <div className="flex gap-4">
                                        {/* Icon Container */}
                                        <div className={`mt-1 h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${!notification.isRead ? 'bg-indigo-100 shadow-lg shadow-indigo-100/50 scale-105' : 'bg-gray-50'}`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-[11px] font-black uppercase tracking-tight truncate ${!notification.isRead ? 'text-indigo-600' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>

                                        {/* Indicator for unread */}
                                        {!notification.isRead && (
                                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2.5"></div>
                                        )}
                                    </div>
                                    
                                    {/* Hover effect highlight */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-center">
                        <button className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-all group">
                            View All Notifications
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
