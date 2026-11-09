import React from 'react';
import { Bus, MapPin, Clock, Gauge, Phone, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';

export const BusCard = ({ bus, onTrack, isSelected = false }) => {
  const routeName = bus.routeId?.routeName || 'Unassigned Route';
  const nextStop = bus.eta?.nextStop || 'Approaching Stop';
  const nextEta = bus.eta?.nextStopEtaMinutes || 5;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-soft-blue ring-2 ring-blue-500/20'
          : 'border-slate-200/80 shadow-soft hover:shadow-soft-lg hover:border-slate-300'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              {bus.busNumber}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {bus.registrationNumber}
            </span>
          </div>
        </div>
        <Badge status={bus.status} />
      </div>

      {/* Route Badge */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-700 max-w-full truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{routeName}</span>
        </div>
      </div>

      {/* Next Stop & ETA Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3 rounded-xl border border-blue-100/80 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide block">
            Next Stop
          </span>
          <span className="text-sm font-bold text-slate-800 truncate block max-w-[150px]">
            {nextStop}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 block">Estimated</span>
          <div className="text-lg font-extrabold text-blue-700 flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{nextEta} min</span>
          </div>
        </div>
      </div>

      {/* Driver & Telemetry */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100">
        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400">Driver</span>
          <span className="font-medium text-slate-700 truncate block">{bus.driverName}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400">Speed</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            {bus.speed} km/h
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <a
          href={`tel:${bus.driverPhone}`}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>Call Driver</span>
        </a>

        {onTrack && (
          <Button
            size="sm"
            variant={isSelected ? 'primary' : 'outline'}
            onClick={() => onTrack(bus)}
            className="text-xs"
          >
            <span>{isSelected ? 'Viewing on Map' : 'Track on Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
