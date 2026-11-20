import React, { useState, useEffect, useCallback } from 'react';
import { 
  getLocalSettings, saveLocalSettings,
  getLocalGuests, saveLocalGuests,
  getLocalReminders, saveLocalReminders,
  getLocalEvents, saveLocalEvents,
  getLocalBudget, saveLocalBudget, getLocalLastEditTime,
  initCloudSync, syncToCloud, exportGuestsToCSV
} from './services/storage';
import { 
  Guest, WeddingReminder, WeddingEvent, WeddingSettings, 
  RSVPStatus, ReminderStatus, BudgetItem, PaymentRecord 
} from './types/wedding';
import { Header } from './components/Header';
import { CountdownTimer } from './components/CountdownTimer';
import { HeadcountSummary } from './components/HeadcountSummary';
import { GuestList } from './components/GuestList';
import { GuestModal } from './components/GuestModal';
import { RemindersManager } from './components/RemindersManager';
import { ReminderModal } from './components/ReminderModal';
import { TimelineEvents } from './components/TimelineEvents';
import { BudgetTracker } from './components/BudgetTracker';
import { ExpenseModal } from './components/ExpenseModal';
import { PaymentModal } from './components/PaymentModal';
import { SettingsModal } from './components/SettingsModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { PasscodeLock } from './components/PasscodeLock';
import confetti from 'canvas-confetti';

const PASSCODE = '21772494';
const AUTH_KEY = 'wedding_auth_token_v1';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const local = localStorage.getItem(AUTH_KEY);
      const session = sessionStorage.getItem(AUTH_KEY);
      return local === `unlocked_${PASSCODE}` || session === `unlocked_${PASSCODE}`;
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const [settings, setSettings] = useState<WeddingSettings>(getLocalSettings);
  const [guests, setGuests] = useState<Guest[]>(getLocalGuests);
  const [reminders, setReminders] = useState<WeddingReminder[]>(getLocalReminders);
  const [events, setEvents] = useState<WeddingEvent[]>(getLocalEvents);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(getLocalBudget);

  const [activeTab, setActiveTab] = useState<'guests' | 'reminders' | 'timeline' | 'budget'>('guests');
  const [selectedInviterFilter, setSelectedInviterFilter] = useState<string | undefined>(undefined);

  // Guest Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [modalDefaultInvitedBy, setModalDefaultInvitedBy] = useState<string | undefined>(undefined);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);

  // Reminder Modals
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState<WeddingReminder | null>(null);

  // Budget Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<BudgetItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [itemForPayment, setItemForPayment] = useState<BudgetItem | null>(null);

  // Settings & Cloud Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

  // Live Auto-Sync Status
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'error' | 'idle'>('synced');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  // Unique client tab identifier to prevent echo loops
  const tabId = React.useRef(Math.random().toString(36).substring(2, 9)).current;

  // Instant Multi-Tab / Multi-Window Auto-Sync via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('wedding_live_channel');
      channel.onmessage = (event) => {
        const { type, data, senderId } = event.data || {};
        if (senderId === tabId) return; // Prevent echo to sender tab

        if (type === 'STATE_UPDATE' && data) {
          if (data.guests) {
            setGuests((prev) => (JSON.stringify(prev) === JSON.stringify(data.guests) ? prev : data.guests));
          }
          if (data.reminders) {
            setReminders((prev) => (JSON.stringify(prev) === JSON.stringify(data.reminders) ? prev : data.reminders));
          }
          if (data.events) {
            setEvents((prev) => (JSON.stringify(prev) === JSON.stringify(data.events) ? prev : data.events));
          }
          if (data.settings) {
            setSettings((prev) => (JSON.stringify(prev) === JSON.stringify(data.settings) ? prev : data.settings));
          }
          if (data.budget) {
            setBudgetItems((prev) => (JSON.stringify(prev) === JSON.stringify(data.budget) ? prev : data.budget));
          }
          setSyncState('synced');
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      };
    } catch (e) {
      // Ignore if unsupported
    }
    return () => {
      if (channel) channel.close();
    };
  }, [tabId]);

  // Save to LocalStorage on change & sync to cloud
  const pushState = useCallback((
    newGuests: Guest[],
    newReminders: WeddingReminder[],
    newEvents: WeddingEvent[],
    newSettings: WeddingSettings,
    newBudget: BudgetItem[]
  ) => {
    saveLocalGuests(newGuests);
    saveLocalReminders(newReminders);
    saveLocalEvents(newEvents);
    saveLocalSettings(newSettings);
    saveLocalBudget(newBudget);

    // Instant local broadcast to any other tabs/windows
    try {
      const channel = new BroadcastChannel('wedding_live_channel');
      channel.postMessage({
        type: 'STATE_UPDATE',
        senderId: tabId,
        data: {
          guests: newGuests,
          reminders: newReminders,
          events: newEvents,
          settings: newSettings,
          budget: newBudget,
        }
      });
      channel.close();
    } catch (e) {}

    // Auto-sync immediately to Cloud Firestore
    if (newSettings.cloudSyncEnabled) {
      setSyncState('syncing');
      syncToCloud({
        guests: newGuests,
        reminders: newReminders,
        events: newEvents,
        settings: newSettings,
        budget: newBudget,
      }).then((res) => {
        if (res.success) {
          setSyncState('synced');
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setSyncErrorMessage(null);
        } else {
          setSyncState('error');
          setSyncErrorMessage(res.error || 'Firestore not provisioned');
        }
      });
    }
  }, [tabId]);

  // Initialize Cloud Sync Listener
  useEffect(() => {
    initCloudSync(
      settings,
      (remotePayload) => {
        if (remotePayload) {
          const remoteTime = remotePayload.lastSyncedAt ? new Date(remotePayload.lastSyncedAt).getTime() : 0;
          const localTime = getLocalLastEditTime();

          // If local edits were made after the remote snapshot was saved, push local changes to cloud instead of overwriting!
          if (localTime > 0 && remoteTime > 0 && localTime > remoteTime + 3000) {
            console.log('Local data is newer than remote snapshot. Pushing local to cloud...');
            syncToCloud({
              guests: getLocalGuests(),
              reminders: getLocalReminders(),
              events: getLocalEvents(),
              settings: getLocalSettings(),
              budget: getLocalBudget(),
            }).then((res) => {
              if (res.success) {
                setSyncState('synced');
                setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                setSyncErrorMessage(null);
              }
            });
            return;
          }

          if (Array.isArray(remotePayload.guests) && remotePayload.guests.length > 0) {
            setGuests((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(remotePayload.guests)) return prev;
              saveLocalGuests(remotePayload.guests);
              return remotePayload.guests;
            });
          }
          if (Array.isArray(remotePayload.reminders)) {
            setReminders((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(remotePayload.reminders)) return prev;
              saveLocalReminders(remotePayload.reminders);
              return remotePayload.reminders;
            });
          }
          if (Array.isArray(remotePayload.events)) {
            setEvents((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(remotePayload.events)) return prev;
              saveLocalEvents(remotePayload.events);
              return remotePayload.events;
            });
          }
          if (remotePayload.settings) {
            setSettings((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(remotePayload.settings)) return prev;
              saveLocalSettings(remotePayload.settings);
              return remotePayload.settings;
            });
          }
          if (Array.isArray(remotePayload.budget)) {
            const remoteBudget = remotePayload.budget;
            setBudgetItems((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(remoteBudget)) return prev;
              saveLocalBudget(remoteBudget);
              return remoteBudget;
            });
          }
          setSyncState('synced');
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setSyncErrorMessage(null);
        }
      },
      () => {
        // Initial upload if Firestore room document doesn't exist yet
        setSyncState('syncing');
        syncToCloud({
          guests: getLocalGuests(),
          reminders: getLocalReminders(),
          events: getLocalEvents(),
          settings: getLocalSettings(),
          budget: getLocalBudget(),
        }).then((res) => {
          if (res.success) {
            setSyncState('synced');
            setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setSyncErrorMessage(null);
          } else {
            setSyncState('error');
            setSyncErrorMessage(res.error || 'Firestore not provisioned');
          }
        });
      },
      (error) => {
        setSyncState('error');
        setSyncErrorMessage(typeof error === 'string' ? error : (error?.message || 'Firestore connection or security rules issue'));
      }
    );
  }, [settings.cloudSyncEnabled, settings.syncRoomCode, settings.firebaseConfig?.apiKey]);

  // Guest Handlers
  const handleSaveGuest = (guest: Guest) => {
    let updated: Guest[];
    const exists = guests.some(g => g.id === guest.id);
    if (exists) {
      updated = guests.map(g => (g.id === guest.id ? guest : g));
    } else {
      updated = [guest, ...guests];
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    setGuests(updated);
    pushState(updated, reminders, events, settings, budgetItems);
  };

  const handleDeleteGuest = (id: string) => {
    const updated = guests.filter(g => g.id !== id);
    setGuests(updated);
    pushState(updated, reminders, events, settings, budgetItems);
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
    pushState(updated, reminders, events, settings, budgetItems);
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
    pushState(guests, updated, events, settings, budgetItems);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    pushState(guests, updated, events, settings, budgetItems);
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
    pushState(guests, updated, events, settings, budgetItems);
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
    pushState(guests, reminders, updated, settings, budgetItems);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    pushState(guests, reminders, updated, settings, budgetItems);
  };

  // Budget Handlers
  const handleSaveExpense = (item: BudgetItem) => {
    let updated: BudgetItem[];
    const exists = budgetItems.some(b => b.id === item.id);
    if (exists) {
      updated = budgetItems.map(b => (b.id === item.id ? item : b));
    } else {
      updated = [item, ...budgetItems];
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    setBudgetItems(updated);
    pushState(guests, reminders, events, settings, updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = budgetItems.filter(b => b.id !== id);
    setBudgetItems(updated);
    pushState(guests, reminders, events, settings, updated);
  };

  const handleRecordPayment = (itemId: string, payment: PaymentRecord) => {
    const updated = budgetItems.map(item => {
      if (item.id !== itemId) return item;

      const newPaid = item.paidAmount + payment.amount;
      const newPayments = [...(item.payments || []), payment];
      const newStatus: 'paid' | 'partial' | 'unpaid' = newPaid >= item.actualCost ? 'paid' : 'partial';

      if (newStatus === 'paid') {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#059669']
        });
      }

      return {
        ...item,
        paidAmount: newPaid,
        paymentStatus: newStatus,
        payments: newPayments,
        updatedAt: new Date().toISOString(),
      };
    });

    setBudgetItems(updated);
    pushState(guests, reminders, events, settings, updated);
  };

  const handleUpdateTargetBudget = (target: number) => {
    const newSettings = { ...settings, targetBudget: target };
    setSettings(newSettings);
    pushState(guests, reminders, events, newSettings, budgetItems);
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: WeddingSettings) => {
    setSettings(newSettings);
    pushState(guests, reminders, events, newSettings, budgetItems);
  };

  // Cloud Manual Sync
  const handleManualSync = async (): Promise<boolean> => {
    setSyncState('syncing');
    const res = await syncToCloud({
      guests,
      reminders,
      events,
      settings,
      budget: budgetItems,
    });
    if (res.success) {
      setSyncState('synced');
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSyncErrorMessage(null);
      return true;
    } else {
      setSyncState('error');
      setSyncErrorMessage(res.error || 'Firestore not provisioned');
      return false;
    }
  };

  // Restore Full Backup
  const handleRestoreBackup = (payload: any) => {
    if (payload.guests) setGuests(payload.guests);
    if (payload.reminders) setReminders(payload.reminders);
    if (payload.events) setEvents(payload.events);
    if (payload.settings) setSettings(payload.settings);
    if (payload.budget) setBudgetItems(payload.budget);
    pushState(
      payload.guests || guests,
      payload.reminders || reminders,
      payload.events || events,
      payload.settings || settings,
      payload.budget || budgetItems
    );
  };

  if (!isAuthenticated) {
    return (
      <PasscodeLock
        onUnlock={handleUnlock}
        correctPasscode={PASSCODE}
        groomName={settings.groomName}
        brideName={settings.brideName}
        profilePicture={settings.profilePicture}
      />
    );
  }

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
        onLock={handleLock}
        guestCount={guests.length}
        reminderCount={reminders.length}
        budgetCount={budgetItems.length}
        syncState={syncState}
        lastSyncedTime={lastSyncedTime}
        syncErrorMessage={syncErrorMessage}
      />

      {/* Cloud Sync Setup Alert Banner (If Firestore not yet created in Firebase) */}
      {syncState === 'error' && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white px-4 py-2.5 text-xs shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-base flex-shrink-0">☁️</span>
              <div className="leading-snug">
                <div>
                  <strong>Real-Time Cloud Sync:</strong> All changes are auto-saving locally & across open tabs. To sync across other family phones live, enable Firestore in Firebase Console.
                </div>
                {syncErrorMessage && (
                  <div className="font-mono text-[10px] text-rose-100/90 mt-0.5">
                    Diagnostic: {syncErrorMessage}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCloudSyncOpen(true)}
              className="px-3 py-1 rounded-lg bg-white text-rose-900 font-bold text-xs shadow-xs hover:bg-rose-50 transition-all flex-shrink-0"
            >
              View Quick 1-Min Steps
            </button>
          </div>
        </div>
      )}

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

            {/* Comprehensive Hierarchical Guest List */}
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

        {/* Tab 2: Budget Tracker */}
        {activeTab === 'budget' && (
          <div className="animate-in fade-in duration-200">
            <BudgetTracker
              budgetItems={budgetItems}
              settings={settings}
              onAddExpense={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              onEditExpense={(item) => {
                setExpenseToEdit(item);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onOpenPaymentModal={(item) => {
                setItemForPayment(item);
                setIsPaymentModalOpen(true);
              }}
              onUpdateTargetBudget={handleUpdateTargetBudget}
            />
          </div>
        )}

        {/* Tab 3: Special Reminders & Payments */}
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

        {/* Tab 4: Timeline & Ceremonies */}
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
          {settings.groomName} & {settings.brideName}'s Wedding Day Reminders, Budget & Guest Planner
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
        onDelete={handleDeleteGuest}
        guestToEdit={guestToEdit}
        settings={settings}
        defaultInvitedBy={modalDefaultInvitedBy || selectedInviterFilter}
        defaultCategory={modalDefaultCategory}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        itemToEdit={expenseToEdit}
        settings={settings}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setItemForPayment(null);
        }}
        budgetItem={itemForPayment}
        onRecordPayment={handleRecordPayment}
        settings={settings}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderToEdit(null);
        }}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
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
        fullPayload={{ settings, guests, reminders, events, budget: budgetItems }}
        onRestoreBackup={handleRestoreBackup}
        syncErrorMessage={syncErrorMessage}
        syncState={syncState}
      />
    </div>
  );
}

export default App;
