import React from 'react';
import { AlertTriangle, Clock, GitBranch, Info, Check } from 'lucide-react';

export const NotificationCard = ({ notification, onMarkRead }) => {
  const getTypeConfig = () => {
    switch (notification.type) {
      case 'delay':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50',
          text: 'text-rose-600',
          border: 'border-rose-100',
          badge: 'Delay Alert',
          badgeBg: 'bg-rose-100/70 text-rose-800',
        };
      case 'arrival':
        return {
          icon: Clock,
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-100',
          badge: 'Arriving Soon',
          badgeBg: 'bg-blue-100/70 text-blue-800',
        };
      case 'route_change':
        return {
          icon: GitBranch,
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-100',
          badge: 'Route Update',
          badgeBg: 'bg-purple-100/70 text-purple-800',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          border: 'border-slate-200',
          badge: 'Notice',
          badgeBg: 'bg-slate-200/70 text-slate-800',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  // Format date cleanly
  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex items-start gap-4 ${
        notification.isRead
          ? 'bg-white border-slate-200/70 opacity-80'
          : 'bg-white border-blue-200 shadow-soft ring-1 ring-blue-500/10'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badgeBg}`}
            >
              {config.badge}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          {!notification.isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification._id)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-1">
          {notification.title}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {notification.message}
        </p>

        {(notification.busId || notification.routeId) && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            {notification.busId && (
              <span>Bus: {notification.busId.busNumber || 'Assigned Bus'}</span>
            )}
            {notification.routeId && (
              <span>Route: {notification.routeId.routeName || 'Assigned Route'}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
