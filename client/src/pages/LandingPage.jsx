import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  Bell,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Radio,
  Zap,
  Users
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { useSocketContext } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const LandingPage = () => {
  const { buses, isSimulating } = useSocketContext();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-100/60 via-blue-50/20 to-transparent pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-8 shadow-soft">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          <span>Next-Gen College Transit Intelligence</span>
          <span className="text-blue-300">•</span>
          <span className="text-blue-800 font-bold">Version 2.0 Live</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Your College Bus.{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tracked in Real Time.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          No more guessing where your campus bus is. Track buses live on the map, monitor estimated arrival times (ETA), and receive instant delay alerts.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/register'}>
            <Button size="lg" className="w-full sm:w-auto shadow-soft-blue group">
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to="/tracking">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Radio className="w-4 h-4 text-blue-600" />
              <span>Track Your Bus Live</span>
            </Button>
          </Link>
        </div>

        {/* Demo Quick Fill Helper Card */}
        <div className="mt-12 max-w-xl mx-auto bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-soft text-left text-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Demo Credentials Ready for Testing
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
              Instant Access
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">Student Account</span>
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">student@buspulse.edu</p>
              <p className="font-mono text-[11px] text-slate-500">Pass: Student@123</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-800 block">Admin Account</span>
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">admin@buspulse.edu</p>
              <p className="font-mono text-[11px] text-slate-500">Pass: Admin@123</p>
            </div>
          </div>
        </div>

        {/* Live Status Teaser Bar */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-2xl font-black text-blue-600">{buses.length || 5}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Active College Buses</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-2xl font-black text-indigo-600">4</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Designated Routes</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-2xl font-black text-emerald-600">2.5s</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">GPS Telemetry Rate</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
            <div className="text-2xl font-black text-slate-900">100%</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Full-Stack Live</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
              Engineered For Modern Campus Commuters
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything students and transport managers need
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 hover:shadow-soft-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-soft-blue">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Live Interactive Map
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Watch college transit buses move smoothly along route coordinates in real-time powered by Leaflet and WebSockets without page refreshes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 hover:shadow-soft-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-soft">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Intelligent Stop ETA
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Haversine route distance and vehicle velocity algorithms calculate accurate estimated arrival times for every designated stop along the route.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 hover:shadow-soft-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-6 shadow-soft">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Instant Delay Alerts
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                When traffic bottlenecks occur or routes adjust, admins push real-time delay notifications directly to student dashboards via Socket.IO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            Simple 3-Step Experience
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How BusPulse works for students
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-soft relative">
            <span className="text-4xl font-black text-blue-100 absolute top-5 right-6 select-none">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-2">
              Sign In & Select Route
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create an account with your Student ID and select your home-to-campus bus route for personalized dashboard notifications.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-soft relative">
            <span className="text-4xl font-black text-blue-100 absolute top-5 right-6 select-none">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-2">
              Open Live GPS Tracking
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              View your bus marker gliding along the route map in real time. Inspect driver details, current speed, and upcoming stops.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-soft relative">
            <span className="text-4xl font-black text-blue-100 absolute top-5 right-6 select-none">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-2">
              Board With Zero Wait Time
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive "Arriving Soon" alerts 5 minutes before pickup so you reach the bus stop comfortably without wasting precious morning study time.
            </p>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-soft-blue flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to experience stress-free campus transit?
            </h3>
            <p className="text-sm text-blue-100 max-w-xl">
              Join students already saving hours of transit wait times every semester.
            </p>
          </div>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 border-white shadow-lg shrink-0">
              Register Student Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
