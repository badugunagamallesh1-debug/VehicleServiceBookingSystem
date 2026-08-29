/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wrench, User, LogOut, Terminal, Bell, 
  BookOpen, HelpCircle, Layers, CheckCircle, Info, Menu, X
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import CustomerDashboard from './components/CustomerDashboard';
import MechanicDashboard from './components/MechanicDashboard';
import AdminDashboard from './components/AdminDashboard';
import DeveloperPortal from './components/DeveloperPortal';

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: 'CUSTOMER' | 'MECHANIC' | 'ADMIN'; phone?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showDevPortal, setShowDevPortal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Keep track of active workspace tab
  const [activeTab, setActiveTab] = useState<'home' | 'portal' | 'dashboard'>('home');

  useEffect(() => {
    // Poll notifications if user logged in
    if (user) {
      const fetchAlerts = async () => {
        try {
          const res = await fetch('/api/notifications', {
            headers: { 'x-user-id': user.id }
          });
          const data = await res.json();
          setNotifications(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setActiveTab('dashboard');
    setShowDevPortal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setActiveTab('home');
    setShowDevPortal(false);
  };

  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans" id="master-root">
      
      {/* 1. DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-950 text-white border-r border-blue-900 shadow-xl shrink-0">
        {/* Brand Area */}
        <div className="p-6 flex items-center space-x-3 border-b border-blue-900">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight block">VEHIXPRO</span>
            <span className="text-[10px] text-blue-300 font-mono block -mt-1 font-semibold">Service Hub</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="bg-blue-900/60 p-2 rounded text-[10px] font-bold text-blue-300 uppercase tracking-widest px-3 mb-1">
            Main Menu
          </div>
          
          <button
            onClick={() => { setActiveTab('home'); setShowDevPortal(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'home' && !showDevPortal 
                ? 'bg-blue-700 text-white shadow' 
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-sm">⊞</span> Overview
          </button>

          {user && (
            <button
              onClick={() => { setActiveTab('dashboard'); setShowDevPortal(false); }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'dashboard' && !showDevPortal 
                  ? 'bg-blue-700 text-white shadow' 
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              <span className="opacity-70 text-sm">🚘</span> My Workspace Terminal
            </button>
          )}

          <div className="pt-4 bg-transparent p-2 rounded text-[10px] font-bold text-blue-300 uppercase tracking-widest px-3 mb-1">
            System Specs
          </div>

          <button
            onClick={() => { setShowDevPortal(!showDevPortal); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              showDevPortal 
                ? 'bg-blue-700 text-white shadow' 
                : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
            }`}
          >
            <span className="opacity-70 text-sm">⚙</span> Spring Boot Specs
          </button>

          {/* SIMULTANEOUS WORKSPACE SWAPPER */}
          {user && (
            <div className="mt-5 pt-4 border-t border-blue-900 space-y-2">
              <div className="text-[10px] font-black text-blue-300 uppercase tracking-widest px-3 mb-1">
                Workspace Swapper
              </div>
              <div className="grid grid-cols-1 gap-1 px-1">
                <button
                  onClick={() => {
                    setUser({ id: 'usr-1', email: 'customer@service.com', name: 'John Doe', role: 'CUSTOMER', phone: '+1 (555) 019-2834' });
                    setToken('mock-jwt-token-usr-1');
                    setActiveTab('dashboard');
                    setShowDevPortal(false);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    user.role === 'CUSTOMER' 
                      ? 'bg-blue-700 text-white shadow' 
                      : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm">👤</span> Customer Hub
                </button>
                <button
                  onClick={() => {
                    setUser({ id: 'usr-2', email: 'mechanic@service.com', name: 'Alex Miller', role: 'MECHANIC', phone: '+1 (555) 042-9988' });
                    setToken('mock-jwt-token-usr-2');
                    setActiveTab('dashboard');
                    setShowDevPortal(false);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    user.role === 'MECHANIC' 
                      ? 'bg-blue-700 text-white shadow' 
                      : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm">🛠️</span> Mechanic Hub
                </button>
                <button
                  onClick={() => {
                    setUser({ id: 'usr-3', email: 'admin@service.com', name: 'System Admin', role: 'ADMIN', phone: '+1 (555) 010-1111' });
                    setToken('mock-jwt-token-usr-3');
                    setActiveTab('dashboard');
                    setShowDevPortal(false);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    user.role === 'ADMIN' 
                      ? 'bg-blue-700 text-white shadow' 
                      : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm">⚙️</span> Admin Panel
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Profile / Quick Log */}
        {user ? (
          <div className="p-4 border-t border-blue-900 flex items-center justify-between gap-3 bg-blue-950/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8.5 h-8.5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-black text-xs shrink-0">
                {user.name.substring(0,2).toUpperCase()}
              </div>
              <div className="text-xs truncate">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[9px] text-blue-300 font-mono tracking-tight uppercase">{user.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-blue-300 hover:text-rose-400 hover:bg-blue-900/40 rounded transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-blue-900">
            <button
              onClick={() => { setActiveTab('dashboard'); }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer text-center"
            >
              Sign In
            </button>
          </div>
        )}
      </aside>

      {/* 2. MOBILE TOP NAVBAR HEADER */}
      <header className="md:hidden bg-blue-950 text-white border-b border-blue-900 sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => { setActiveTab('home'); setShowDevPortal(false); }}>
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow">
              <Wrench className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight block">VEHIXPRO</span>
              <span className="text-[9px] text-blue-300 font-mono block -mt-1 font-semibold">Service Hub</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDevPortal(!showDevPortal)}
              className="p-1.5 bg-blue-900 border border-blue-800 rounded-lg text-blue-200 cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 text-blue-100 cursor-pointer"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-blue-900 border-b border-blue-850 py-4 px-4 space-y-3 shadow-lg text-white">
          <button
            onClick={() => { setActiveTab('home'); setShowDevPortal(false); setShowMobileMenu(false); }}
            className="w-full text-left px-3 py-2 text-xs font-bold text-blue-100 hover:bg-blue-850 rounded-lg block"
          >
            Overview
          </button>
          {user && (
            <button
              onClick={() => { setActiveTab('dashboard'); setShowDevPortal(false); setShowMobileMenu(false); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-blue-100 hover:bg-blue-850 rounded-lg block"
            >
              My Workspace Terminal
            </button>
          )}
          {user ? (
            <div className="pt-3 border-t border-blue-800 flex items-center justify-between px-3">
              <div>
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[9px] text-blue-300 font-mono uppercase">{user.role}</p>
              </div>
              <button
                onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                className="text-rose-400 text-xs font-bold flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
              className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg text-center block"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* 3. RIGHT MAIN PANEL (HEADER + MAIN VIEWS) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Header inside Right Panel */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
              {showDevPortal ? 'SYSTEM BLUEPRINTS' : activeTab === 'home' ? 'SERVICE DISPATCH' : `WORKSPACE • ${user ? user.role : 'GUEST'}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            {unreadAlerts > 0 && (
              <div className="relative flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700">{unreadAlerts} Unread Alerts</span>
              </div>
            )}
            
            {!user && activeTab !== 'dashboard' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                + New Booking
              </button>
            )}
          </div>
        </header>

        {/* scrollable viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8 space-y-8">
          {/* Toggle-driven display of the blueprint portal */}
          {showDevPortal ? (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Viewing Code Blueprints</span>
                <button 
                  onClick={() => setShowDevPortal(false)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  ← Back to Live App
                </button>
              </div>
              <DeveloperPortal />
            </div>
          ) : (
            <div className="animate-[fadeIn_0.3s_ease]">
              {/* milestoned view selectors */}
              {activeTab === 'home' && (
                <LandingPage onGetStarted={() => setActiveTab('dashboard')} />
              )}

              {activeTab === 'dashboard' && (
                user ? (
                  /* Authenticated Workspaces based on role */
                  user.role === 'CUSTOMER' ? (
                    <CustomerDashboard currentUser={user} />
                  ) : user.role === 'MECHANIC' ? (
                    <MechanicDashboard currentUser={user} />
                  ) : (
                    <AdminDashboard />
                  )
                ) : (
                  /* Auth Screen */
                  <AuthPage onLoginSuccess={handleLoginSuccess} />
                )
              )}
            </div>
          )}
        </main>

        {/* 4. FOOTER */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600/10 p-1.5 rounded-lg text-blue-400 border border-blue-500/10">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-bold text-white tracking-tight">VEHIXPRO Inc.</span>
              </div>
              <div className="flex space-x-4 text-[10px]">
                <a href="#about" className="hover:text-white transition-colors" onClick={() => { setActiveTab('home'); setShowDevPortal(false); }}>About Platform</a>
                <a href="#helpline" className="hover:text-white transition-colors">Emergency Towing</a>
                <a href="#developer" className="hover:text-white transition-colors" onClick={() => setShowDevPortal(true)}>Spring Boot specs</a>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">
              © 2026 VEHIXPRO. High-Density location guided diagnostic engine.
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}
