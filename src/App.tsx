import React, { useState, useEffect, useCallback } from 'react';
import { 
  getLocalSettings, saveLocalSettings,
  getLocalGuests, saveLocalGuests,
  getLocalReminders, saveLocalReminders,
  getLocalEvents, saveLocalEvents,
  initCloudSync, syncToCloud, exportGuestsToCSV
} from './services/storage';
import { Guest, WeddingReminder, WeddingEvent, WeddingSettings, RSVPStatus, ReminderStatus } from './types/wedding';
import { Header } from './components/Header';
import { CountdownTimer } from './components/CountdownTimer';
import { HeadcountSummary } from './components/HeadcountSummary';
import { GuestList } from './components/GuestList';
import { GuestModal } from './components/GuestModal';
import { RemindersManager } from './components/RemindersManager';
import { ReminderModal } from './components/ReminderModal';
import { TimelineEvents } from './components/TimelineEvents';
import { SettingsModal } from './components/SettingsModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import confetti from 'canvas-confetti';

export function App() {
  const [settings, setSettings] = useState<WeddingSettings>(getLocalSettings);
  const [guests, setGuests] = useState<Guest[]>(getLocalGuests);
  const [reminders, setReminders] = useState<WeddingReminder[]>(getLocalReminders);
  const [events, setEvents] = useState<WeddingEvent[]>(getLocalEvents);

  const [activeTab, setActiveTab] = useState<'guests' | 'reminders' | 'timeline'>('guests');
  const [selectedInviterFilter, setSelectedInviterFilter] = useState<string | undefined>(undefined);

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [modalDefaultInvitedBy, setModalDefaultInvitedBy] = useState<string | undefined>(undefined);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState<WeddingReminder | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

  // Save to LocalStorage on change & sync to cloud
  const pushState = useCallback((
    newGuests: Guest[],
    newReminders: WeddingReminder[],
    newEvents: WeddingEvent[],
    newSettings: WeddingSettings
  ) => {
    saveLocalGuests(newGuests);
    saveLocalReminders(newReminders);
    saveLocalEvents(newEvents);
    saveLocalSettings(newSettings);

    if (newSettings.cloudSyncEnabled) {
      syncToCloud({
        guests: newGuests,
        reminders: newReminders,
        events: newEvents,
        settings: newSettings,
      });
    }
  }, []);

  // Initialize Cloud Sync Listener
  useEffect(() => {
    initCloudSync(settings, (remotePayload) => {
      if (remotePayload) {
        if (remotePayload.guests) {
          setGuests(remotePayload.guests);
          saveLocalGuests(remotePayload.guests);
        }
        if (remotePayload.reminders) {
          setReminders(remotePayload.reminders);
          saveLocalReminders(remotePayload.reminders);
        }
        if (remotePayload.events) {
          setEvents(remotePayload.events);
          saveLocalEvents(remotePayload.events);
        }
        if (remotePayload.settings) {
          setSettings(remotePayload.settings);
          saveLocalSettings(remotePayload.settings);
        }
      }
    });
  }, [settings.cloudSyncEnabled, settings.syncRoomCode, settings.firebaseConfig]);

  // Guest Handlers
  const handleSaveGuest = (guest: Guest) => {
    let updated: Guest[];
    const exists = guests.some(g => g.id === guest.id);
    if (exists) {
      updated = guests.map(g => (g.id === guest.id ? guest : g));
    } else {
      updated = [guest, ...guests];
      // Celebrate new guest entry
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    setGuests(updated);
    pushState(updated, reminders, events, settings);
  };

  const handleDeleteGuest = (id: string) => {
    const updated = guests.filter(g => g.id !== id);
    setGuests(updated);
    pushState(updated, reminders, events, settings);
  };

  const handleUpdateRsvp = (id: string, eventType: 'night_before' | 'wedding_day', rsvp: RSVPStatus, count?: number) => {
    const updated = guests.map(g => {
      if (g.id !== id) return g;
      if (eventType === 'night_before') {
        return {
          ...g,
          rsvpNightBefore: rsvp,
          countNightBefore: count !== undefined ? count : (rsvp === 'declined' ? 0 : g.countNightBefore || 1),
          updatedAt: new Date().toISOString(),
        };
      } else {
        return {
          ...g,
          rsvpWeddingDay: rsvp,
          countWeddingDay: count !== undefined ? count : (rsvp === 'declined' ? 0 : g.countWeddingDay || 1),
          updatedAt: new Date().toISOString(),
        };
      }
    });

    if (rsvp === 'confirmed') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    setGuests(updated);
    pushState(updated, reminders, events, settings);
  };

  // Reminder Handlers
  const handleSaveReminder = (reminder: WeddingReminder) => {
    let updated: WeddingReminder[];
    const exists = reminders.some(r => r.id === reminder.id);
    if (exists) {
      updated = reminders.map(r => (r.id === reminder.id ? reminder : r));
    } else {
      updated = [reminder, ...reminders];
    }
    setReminders(updated);
    pushState(guests, updated, events, settings);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    pushState(guests, updated, events, settings);
  };

  const handleToggleReminderStatus = (id: string, currentStatus: ReminderStatus) => {
    const newStatus: ReminderStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const updated = reminders.map(r => {
      if (r.id === id) {
        return { ...r, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    setReminders(updated);
    pushState(guests, updated, events, settings);
  };

  // Event Handlers
  const handleSaveEvent = (evt: WeddingEvent) => {
    let updated: WeddingEvent[];
    const exists = events.some(e => e.id === evt.id);
    if (exists) {
      updated = events.map(e => (e.id === evt.id ? evt : e));
    } else {
      updated = [...events, evt];
    }
    setEvents(updated);
    pushState(guests, reminders, updated, settings);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    pushState(guests, reminders, updated, settings);
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: WeddingSettings) => {
    setSettings(newSettings);
    pushState(guests, reminders, events, newSettings);
  };

  // Cloud Manual Sync
  const handleManualSync = async () => {
    return await syncToCloud({
      guests,
      reminders,
      events,
      settings,
    });
  };

  // Restore Full Backup
  const handleRestoreBackup = (payload: any) => {
    if (payload.guests) setGuests(payload.guests);
    if (payload.reminders) setReminders(payload.reminders);
    if (payload.events) setEvents(payload.events);
    if (payload.settings) setSettings(payload.settings);
    pushState(
      payload.guests || guests,
      payload.reminders || reminders,
      payload.events || events,
      payload.settings || settings
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onExportCSV={() => exportGuestsToCSV(guests, settings)}
        guestCount={guests.length}
        reminderCount={reminders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Wedding Countdown Banner */}
        <CountdownTimer
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Tab 1: Guests & Headcounts */}
        {activeTab === 'guests' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* Visual Headcount Summary Cards (Night Before vs Wedding Day + Host Breakdown) */}
            <HeadcountSummary
              guests={guests}
              settings={settings}
              onSelectInviterFilter={(inviter) => {
                setSelectedInviterFilter(inviter);
              }}
            />

            {/* Comprehensive Guest List */}
            <GuestList
              guests={guests}
              settings={settings}
              onAddGuest={(defaultInviter, defaultCategory) => {
                setGuestToEdit(null);
                setModalDefaultInvitedBy(defaultInviter || selectedInviterFilter);
                setModalDefaultCategory(defaultCategory);
                setIsGuestModalOpen(true);
              }}
              onEditGuest={(guest) => {
                setGuestToEdit(guest);
                setIsGuestModalOpen(true);
              }}
              onDeleteGuest={handleDeleteGuest}
              onUpdateRsvp={handleUpdateRsvp}
              activeInviterFilter={selectedInviterFilter}
              onClearInviterFilter={() => setSelectedInviterFilter(undefined)}
            />
          </div>
        )}

        {/* Tab 2: Special Reminders & Payments */}
        {activeTab === 'reminders' && (
          <div className="animate-in fade-in duration-200">
            <RemindersManager
              reminders={reminders}
              settings={settings}
              onAddReminder={() => {
                setReminderToEdit(null);
                setIsReminderModalOpen(true);
              }}
              onEditReminder={(reminder) => {
                setReminderToEdit(reminder);
                setIsReminderModalOpen(true);
              }}
              onDeleteReminder={handleDeleteReminder}
              onToggleStatus={handleToggleReminderStatus}
            />
          </div>
        )}

        {/* Tab 3: Timeline & Ceremonies */}
        {activeTab === 'timeline' && (
          <div className="animate-in fade-in duration-200">
            <TimelineEvents
              events={events}
              settings={settings}
              onAddEvent={handleSaveEvent}
              onEditEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white/60 text-center text-xs text-slate-500">
        <p className="font-playfair font-semibold text-slate-700">
          {settings.groomName} & {settings.brideName}'s Wedding Day Reminders & Guest Planner
        </p>
        <p className="mt-1 text-slate-400">
          Offline-ready & Cloud Sync enabled for family collaboration • Designed with ❤️
        </p>
      </footer>

      {/* Modals */}
      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false);
          setGuestToEdit(null);
          setModalDefaultInvitedBy(undefined);
          setModalDefaultCategory(undefined);
        }}
        onSave={handleSaveGuest}
        guestToEdit={guestToEdit}
        settings={settings}
        defaultInvitedBy={modalDefaultInvitedBy || selectedInviterFilter}
        defaultCategory={modalDefaultCategory}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderToEdit(null);
        }}
        onSave={handleSaveReminder}
        reminderToEdit={reminderToEdit}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onManualSync={handleManualSync}
        fullPayload={{ settings, guests, reminders, events }}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  );
}

export default App;
