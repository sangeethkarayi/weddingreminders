import React from 'react';
import { Sparkles, Cloud, Settings, FileSpreadsheet, Users, Bell, Calendar, DollarSign, Lock, RefreshCw, AlertTriangle } from 'lucide-react';
import { WeddingSettings } from '../types/wedding';

interface HeaderProps {
  settings: WeddingSettings;
  activeTab: 'guests' | 'reminders' | 'timeline' | 'budget';
  setActiveTab: (tab: 'guests' | 'reminders' | 'timeline' | 'budget') => void;
  onOpenSettings: () => void;
  onOpenCloudSync: () => void;
  onExportCSV: () => void;
  onLock?: () => void;
  guestCount: number;
  reminderCount: number;
  budgetCount?: number;
  syncState?: 'synced' | 'syncing' | 'error' | 'idle';
  lastSyncedTime?: string;
  syncErrorMessage?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenCloudSync,
  onExportCSV,
  onLock,
  guestCount,
  reminderCount,
  budgetCount,
  syncState = 'synced',
  lastSyncedTime,
  syncErrorMessage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Wedding Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 flex-shrink-0">
              <span className="text-xl">💍</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-playfair text-slate-900 tracking-tight">
                  {settings.groomName} & {settings.brideName}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                  Wedding Planner
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1">
                <span>Room:</span>
                <span className="font-mono font-semibold text-rose-800">{settings.syncRoomCode || 'WED-LOCAL'}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('guests')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'guests'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Guest Lists & RSVPs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px]">
                {guestCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'budget'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Budget Tracker</span>
              {budgetCount !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {budgetCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'reminders'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Special Reminders</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {reminderCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Live Auto-Sync Status Button */}
            <button
              onClick={onOpenCloudSync}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                syncState === 'syncing'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : syncState === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : settings.cloudSyncEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={
                syncState === 'syncing'
                  ? 'Auto-syncing changes to cloud...'
                  : syncState === 'error'
                  ? `Sync Alert: ${syncErrorMessage || 'Check Firebase Firestore setup'}`
                  : 'Real-Time Auto Sync Active'
              }
            >
              {syncState === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              ) : syncState === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Cloud className={`w-3.5 h-3.5 ${settings.cloudSyncEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
              )}
              <span className="hidden sm:inline">
                {syncState === 'syncing'
                  ? 'Auto-Syncing...'
                  : syncState === 'error'
                  ? 'Sync Alert'
                  : settings.cloudSyncEnabled
                  ? (lastSyncedTime ? `Auto-Synced (${lastSyncedTime})` : 'Auto-Synced')
                  : 'Sync Room'}
              </span>
            </button>

            {/* Quick Export CSV Button */}
            <button
              onClick={onExportCSV}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Export Guest List CSV for Caterers"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              title="Wedding Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Lock Portal Button */}
            {onLock && (
              <button
                onClick={onLock}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                title="Lock Portal (Passcode Required)"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone-friendly) */}
      <div className="md:hidden border-t border-rose-100 bg-white px-2 py-2 flex items-center justify-around text-xs font-semibold">
        <button
          onClick={() => setActiveTab('guests')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'guests' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guests ({guestCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'budget' ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'reminders' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Reminders</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
            activeTab === 'timeline' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timeline</span>
        </button>
      </div>
    </header>
  );
};
