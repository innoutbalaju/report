import React, { useState } from 'react';
import { useHotelStore } from '../store';
import { Settings, Save, RefreshCw, Sliders, Shield, CreditCard, Building } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsModule() {
  const { settings, updateSettings, rooms, updateRoom } = useHotelStore();
  
  // Local state
  const [hotelName, setHotelName] = useState(settings.hotelName);
  const [logoText, setLogoText] = useState(settings.logoText);
  const [roomTypes, setRoomTypes] = useState(settings.roomTypes.join(', '));
  const [paymentMethods, setPaymentMethods] = useState(settings.paymentMethods.join(', '));
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const typesArr = roomTypes.split(',').map(s => s.trim()).filter(Boolean);
    const payArr = paymentMethods.split(',').map(s => s.trim()).filter(Boolean);

    updateSettings({
      hotelName: hotelName.trim(),
      logoText: logoText.trim(),
      roomTypes: typesArr,
      paymentMethods: payArr
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSetRatesToDefaults = () => {
    if (confirm('Are you sure you want to restore room rates to standard configurations? (Standard: Rs. 2500, Deluxe: Rs. 3500)')) {
      rooms.forEach((room) => {
        if (room.type.includes('Deluxe') || room.type.includes('Suite')) {
          updateRoom(room.id, { baseRate: 3500 });
        } else {
          updateRoom(room.id, { baseRate: 2500 });
        }
      });
      alert('Rates set successfully.');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            System Configurations
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage global operational rules, payment methods, taxonomy, and hotel branding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-5 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            General Profiles
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Hotel Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
                    <Building className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Logo / Badge Brand Text
                </label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Room Categories (Comma Separated)
              </label>
              <textarea
                value={roomTypes}
                onChange={(e) => setRoomTypes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-zinc-100"
                placeholder="Standard, Deluxe, Executive Suite"
              />
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                Defines the room category options available when adding or editing hotel inventory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Enabled Payment Methods (Comma Separated)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
                  <CreditCard className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={paymentMethods}
                  onChange={(e) => setPaymentMethods(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-zinc-100 font-mono"
                  placeholder="Cash, Card, QR, PQR"
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                Defines the columns and options in Manager's Daily Report and POS bills. Leave as Cash, Card, QR, PQR for default matching.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50 pt-4 mt-6">
              {success ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Settings saved successfully!
                </span>
              ) : (
                <span></span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save System Settings
              </button>
            </div>
          </form>
        </div>

        {/* Quick Operations panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Administrative Actions
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Quick commands to clean data profiles or restore standard operational presets.
            </p>

            <button
              onClick={handleSetRatesToDefaults}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold border border-amber-200 hover:border-amber-400 dark:border-amber-900/40 dark:hover:border-amber-500/30 bg-amber-50/10 dark:bg-amber-950/5 text-amber-700 dark:text-amber-400 rounded-xl transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalibrate Rates to Standard
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-50 mb-3">
              Developer Notes & Firebase
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed space-y-2">
              <span>
                This application is designed with decoupled hooks. Persistent client data is routed via Zustand Middleware straight into LocalStorage.
              </span>
              <br /><br />
              <span>
                To migrate to full-scale Firebase integration, you can import and initialize Firebase Firestore inside <code>/src/store.ts</code> in the save/retrieve actions without changing any UI rendering hooks.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
