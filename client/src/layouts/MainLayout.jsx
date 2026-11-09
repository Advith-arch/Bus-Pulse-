import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.jsx';
import { Footer } from '../components/common/Footer.jsx';
import { useSocketContext } from '../context/SocketContext.jsx';
import { Bell, X } from 'lucide-react';

export const MainLayout = () => {
  const { latestAlert, dismissAlert } = useSocketContext();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      <Navbar />

      {/* Real-Time Socket Toast Banner (if any live alert arrives) */}
      {latestAlert && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                  Live Alert
                </span>
                <button
                  onClick={dismissAlert}
                  className="text-slate-400 hover:text-white p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="text-xs font-bold mt-0.5">{latestAlert.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                {latestAlert.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
