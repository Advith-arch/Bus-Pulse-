import React, { useState } from 'react';
import { Bell, CheckCheck, Filter, AlertTriangle, Clock, GitBranch } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext.jsx';
import { NotificationCard } from '../components/cards/NotificationCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markNotificationRead } = useSocketContext();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'delay' | 'arrival' | 'route_change'

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) markNotificationRead(n._id);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Transit Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time broadcasted arrival advisories, delay notifications, and schedule notices
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            icon={CheckCheck}
            className="text-xs shrink-0"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filterType === 'ALL'
              ? 'bg-blue-600 text-white shadow-soft-blue'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('delay')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filterType === 'delay'
              ? 'bg-rose-600 text-white shadow-soft'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Delays ({notifications.filter((n) => n.type === 'delay').length})</span>
        </button>
        <button
          onClick={() => setFilterType('arrival')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filterType === 'arrival'
              ? 'bg-blue-600 text-white shadow-soft-blue'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Arriving Soon ({notifications.filter((n) => n.type === 'arrival').length})</span>
        </button>
        <button
          onClick={() => setFilterType('route_change')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            filterType === 'route_change'
              ? 'bg-purple-600 text-white shadow-soft'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Route Changes ({notifications.filter((n) => n.type === 'route_change').length})</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <NotificationCard
            key={notification._id}
            notification={notification}
            onMarkRead={markNotificationRead}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No Notifications in this filter"
            description="You are fully up to date with university transit operations."
          />
        )}
      </div>
    </div>
  );
};
