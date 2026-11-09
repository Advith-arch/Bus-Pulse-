import React from 'react';
import { Route as RouteIcon, MapPin, Clock, Bus, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export const RouteCard = ({ route, onSelect, isSelected = false }) => {
  const stopsCount = route.stops?.length || 0;
  const assignedBusesCount = route.assignedBuses?.length || 0;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-soft-blue ring-2 ring-blue-500/20'
          : 'border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {route.routeNumber}
            </span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              {route.routeName}
            </h3>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
          {route.estimatedDuration} min
        </span>
      </div>

      {/* Origin -> Destination timeline */}
      <div className="my-4 py-3 px-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-400 font-medium">Start:</span>
          <span className="font-semibold text-slate-800 truncate">{route.startPoint}</span>
        </div>
        <div className="w-0.5 h-3 bg-slate-200 ml-1" />
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
          <span className="text-slate-400 font-medium">Destination:</span>
          <span className="font-semibold text-slate-800 truncate">{route.destination}</span>
        </div>
      </div>

      {/* Meta Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {stopsCount} Bus Stops
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-blue-600">
          <Bus className="w-3.5 h-3.5" />
          {assignedBusesCount} Active {assignedBusesCount === 1 ? 'Bus' : 'Buses'}
        </span>
      </div>

      {/* Action */}
      <Button
        variant={isSelected ? 'primary' : 'outline'}
        size="sm"
        className="w-full text-xs"
        onClick={() => onSelect(route)}
      >
        <span>{isSelected ? 'Viewing Route Map' : 'View Route & Stops'}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
