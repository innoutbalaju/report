import React, { useState, useEffect } from 'react';
import { useHotelStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportsArchive from './components/ReportsArchive';
import SettingsModule from './components/SettingsModule';
import ReportForm from './components/ReportForm';

import { 
  Building2, 
  Utensils, 
  Clipboard, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    isAuthenticated, 
    username, 
    logout, 
    activeView, 
    setActiveView, 
    theme, 
    toggleTheme,
    settings,
    rooms,
    setRooms
  } = useHotelStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync the rooms list to only the allowed rooms
  useEffect(() => {
    const allowedNumbers = [
      '201', '202', '401', '402', '403', '404', '405', '406', '407', '408', '409',
      '501', '502', '503', '504', '505', '506', '507', '508', '509'
    ];
    // Check if current rooms mismatch the allowed rooms list
    const currentRoomNumbers = (rooms || []).map(r => r.number).sort();
    const targetRoomNumbers = [...allowedNumbers].sort();
    const isMismatch = currentRoomNumbers.length !== targetRoomNumbers.length || 
      !currentRoomNumbers.every((num, idx) => num === targetRoomNumbers[idx]);

    if (isMismatch) {
      const targetRooms = [
        { id: 'r201', number: '201', type: 'Super Deluxe', baseRate: 4500, status: 'Vacant' },
        { id: 'r202', number: '202', type: 'Super Deluxe', baseRate: 4500, status: 'Vacant' },
        { id: 'r401', number: '401', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r402', number: '402', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r403', number: '403', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r404', number: '404', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r405', number: '405', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r406', number: '406', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r407', number: '407', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r408', number: '408', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r409', number: '409', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
        { id: 'r501', number: '501', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r502', number: '502', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r503', number: '503', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r504', number: '504', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r505', number: '505', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r506', number: '506', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r507', number: '507', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r508', number: '508', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
        { id: 'r509', number: '509', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' }
      ];
      setRooms(targetRooms as any);
    }
  }, [rooms, setRooms]);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Sidebar navigation options
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Manager Daily Report', icon: Clipboard },
    { id: 'reports_archive', label: 'Reports Archive', icon: FileSpreadsheet },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ] as const;

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'report':
        return <ReportForm />;
      case 'reports_archive':
        return <ReportsArchive />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-bg text-luxury-light/80 flex font-sans antialiased">
      
      {/* 1. SIDEBAR NAVIGATION - DESKTOP (Hidden in Print) */}
      <aside className="hidden lg:flex flex-col w-64 bg-luxury-bg border-r border-luxury-border/60 shrink-0 sticky top-0 h-screen z-20 print:hidden">
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6 border-b border-luxury-border/40 gap-3">
          <div className="w-9 h-9 rounded-xl bg-luxury-accent text-luxury-bg flex items-center justify-center font-extrabold text-sm shadow-[0_4px_12px_rgba(142,182,155,0.25)]">
            IN
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-luxury-light">{settings.logoText}</h2>
            <span className="text-[10px] text-luxury-accent/70 font-semibold tracking-wider uppercase">Hotel Control BS/AD</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all duration-250 active:scale-[0.98] ${
                  isActive 
                    ? 'bg-luxury-hover text-luxury-accent border-l-4 border-luxury-accent pl-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]' 
                    : 'text-luxury-light/50 hover:text-luxury-light hover:bg-luxury-hover/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-luxury-accent' : 'text-luxury-light/40'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Logged-in info */}
        <div className="p-4 border-t border-luxury-border/40 space-y-3 bg-luxury-card/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-luxury-hover text-luxury-accent font-bold text-xs flex items-center justify-center border border-luxury-border/40">
              {username ? username[0].toUpperCase() : 'M'}
            </div>
            <div className="truncate flex-1">
              <h4 className="text-xs font-semibold text-luxury-light truncate">{username || 'Manager'}</h4>
              <p className="text-[9px] text-luxury-accent/60 uppercase font-bold tracking-wider">Operational Mode</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 border border-luxury-border/40 hover:bg-luxury-hover rounded-lg text-luxury-light/50 hover:text-luxury-light transition-all flex-1 flex justify-center"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-luxury-accent" />}
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 border border-red-900/30 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg transition-all flex-1 flex justify-center gap-1.5 items-center text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEWS CANVAS AND TOP NAVBAR (Navbar hidden in print) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar - Mobile & Tab headers (Hidden in print) - GLASSMORPHISM */}
        <header className="h-20 border-b border-luxury-border/40 bg-luxury-bg/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-luxury-light/70 hover:bg-luxury-hover rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Standard banner on tablet/mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="w-7 h-7 rounded-lg bg-luxury-accent text-luxury-bg flex items-center justify-center font-bold text-xs shadow">IN</span>
              <h2 className="font-bold text-xs tracking-tight text-luxury-light uppercase">{settings.logoText}</h2>
            </div>

            <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-luxury-accent uppercase tracking-widest">
              <Building className="w-4 h-4 text-luxury-accent" />
              <span>Hotel IN N OUT Operations Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick theme control on desktop navbar */}
            <button
              onClick={toggleTheme}
              className="p-2 text-luxury-light/60 hover:bg-luxury-hover rounded-xl transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-luxury-accent" />}
            </button>
            
            <div className="h-4 w-px bg-luxury-border/50 hidden sm:block"></div>
            
            <span className="text-xs text-luxury-light/60 hidden sm:block font-medium">
              Active User: <strong className="text-luxury-accent">{username}</strong>
            </span>
          </div>
        </header>

        {/* 3. SCROLLABLE SCREEN VIEWS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 4. MOBILE SIDE PANEL SLIDE-OUT MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden print:hidden"
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-luxury-bg border-r border-luxury-border/60 z-50 p-6 flex flex-col justify-between lg:hidden print:hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-luxury-border/40 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-luxury-accent text-luxury-bg flex items-center justify-center font-bold text-sm shadow">IN</span>
                    <h2 className="font-bold text-sm tracking-tight text-luxury-light">{settings.logoText}</h2>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 border border-luxury-border/40 rounded-xl hover:bg-luxury-hover"
                  >
                    <X className="w-4 h-4 text-luxury-light" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                          isActive 
                            ? 'bg-luxury-hover text-luxury-accent border-l-4 border-luxury-accent pl-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]' 
                            : 'text-luxury-light/50 hover:text-luxury-light hover:bg-luxury-hover/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Logout */}
              <div className="border-t border-luxury-border/40 pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-luxury-hover text-luxury-accent flex items-center justify-center font-bold text-xs">
                    {username ? username[0].toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-luxury-light">{username || 'Manager'}</h4>
                    <span className="text-[10px] text-luxury-accent/60">Hotel IN N OUT Admin</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/30 border border-red-900/30 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Console
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
