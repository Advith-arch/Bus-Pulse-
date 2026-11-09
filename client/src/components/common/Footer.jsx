import React from 'react';
import { Bus, Heart, Phone, Mail, MapPin, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-soft-blue">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">BusPulse</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time college bus monitoring, route analytics, and precision arrival forecasts for students, faculty, and campus fleet managers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Transit Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Live Interactive GPS Map</li>
              <li>Estimated Time of Arrival (ETA)</li>
              <li>Campus Route Timetables</li>
              <li>Instant Delay Push Alerts</li>
            </ul>
          </div>

          {/* Safety & Helpdesk */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Campus Transport Desk
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 80 2345 6789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>transport@buspulse.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Campus Transport Control Office</span>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Security & Reliability
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Encrypted Transit Grid</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Authorized access with JWT tokens and continuous 2.5s WebSocket telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} BusPulse Transit Systems. Built for Campus Mobility.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for university commuters.
          </p>
        </div>
      </div>
    </footer>
  );
};
