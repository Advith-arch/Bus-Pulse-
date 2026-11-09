import React from 'react';

export const Badge = ({ status = 'On Time', className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'On Time':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald';
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dot-rose';
      case 'Arriving':
        return 'bg-blue-50 text-blue-700 border-blue-200/80 dot-blue';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dot-slate';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'On Time':
        return 'bg-emerald-500';
      case 'Delayed':
        return 'bg-rose-500 animate-pulse';
      case 'Arriving':
        return 'bg-blue-500 animate-ping';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors ${getStyles()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </span>
  );
};
