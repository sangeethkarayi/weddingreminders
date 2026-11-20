import { Guest, WeddingReminder, WeddingEvent, WeddingSettings, BudgetItem } from '../types/wedding';
import { initialGuests, initialReminders, initialEvents, initialSettings, initialBudgetItems } from '../data/initialData';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, Firestore } from 'firebase/firestore';

const STORAGE_KEYS = {
  GUESTS: 'wedding_guests_v5',
  REMINDERS: 'wedding_reminders_v5',
  EVENTS: 'wedding_events_v5',
  SETTINGS: 'wedding_settings_v5',
  BUDGET: 'wedding_budget_v5',
};

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let unsubscribeFirestore: (() => void) | null = null;

// Local Storage Helpers
export const getLocalSettings = (): WeddingSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return initialSettings;
    const parsed = JSON.parse(data);
    if (!parsed.familyMembers?.includes('Ramachandran (Father)')) {
      return initialSettings;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
    return initialSettings;
  }
};

export const saveLocalSettings = (settings: WeddingSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
};

export const getLocalGuests = (): Guest[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GUESTS);
    if (!data) return initialGuests;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.some((g: any) => g.invitedBy?.includes('Ramachandran'))) {
      return initialGuests;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading guests from localStorage', e);
    return initialGuests;
  }
};

export const saveLocalGuests = (guests: Guest[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  } catch (e) {
    console.error('Error saving guests to localStorage', e);
  }
};

export const getLocalReminders = (): WeddingReminder[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) return initialReminders;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.some((r: any) => r.assignedTo?.includes('Ramachandran'))) {
      return initialReminders;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading reminders from localStorage', e);
    return initialReminders;
  }
};

export const saveLocalReminders = (reminders: WeddingReminder[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Error saving reminders to localStorage', e);
  }
};

export const getLocalEvents = (): WeddingEvent[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : initialEvents;
  } catch (e) {
    console.error('Error reading events from localStorage', e);
    return initialEvents;
  }
};

export const saveLocalEvents = (events: WeddingEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to localStorage', e);
  }
};

export const getLocalBudget = (): BudgetItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!data) return initialBudgetItems;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialBudgetItems;
  } catch (e) {
    console.error('Error reading budget from localStorage', e);
    return initialBudgetItems;
  }
};

export const saveLocalBudget = (items: BudgetItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving budget to localStorage', e);
  }
};

// Cloud Sync via Firebase Firestore
export interface WeddingCloudPayload {
  settings: WeddingSettings;
  guests: Guest[];
  reminders: WeddingReminder[];
  events: WeddingEvent[];
  budget?: BudgetItem[];
  lastSyncedAt: string;
}

export const initCloudSync = (
  settings: WeddingSettings,
  onRemoteUpdate: (payload: WeddingCloudPayload) => void
): boolean => {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }

  if (!settings.cloudSyncEnabled || !settings.firebaseConfig || !settings.firebaseConfig.apiKey) {
    return false;
  }

  try {
    const config = settings.firebaseConfig;
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    firestoreDb = getFirestore(firebaseApp);

    const roomCode = settings.syncRoomCode || 'WED-DEFAULT';
    const docRef = doc(firestoreDb, 'wedding_rooms', roomCode);

    unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as WeddingCloudPayload;
        if (data) {
          onRemoteUpdate(data);
        }
      }
    }, (error) => {
      console.warn('Firestore subscription error (check credentials or security rules):', error);
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Sync:', error);
    return false;
  }
};

export const syncToCloud = async (
  payload: {
    settings: WeddingSettings;
    guests: Guest[];
    reminders: WeddingReminder[];
    events: WeddingEvent[];
  }
): Promise<boolean> => {
  if (!payload.settings.cloudSyncEnabled || !firestoreDb) {
    return false;
  }

  try {
    const roomCode = payload.settings.syncRoomCode || 'WED-DEFAULT';
    const docRef = doc(firestoreDb, 'wedding_rooms', roomCode);
    const data: WeddingCloudPayload = {
      ...payload,
      lastSyncedAt: new Date().toISOString()
    };
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed pushing update to Firebase:', error);
    return false;
  }
};

// Export to CSV for Caterers / Venue Coordinators
export const exportGuestsToCSV = (guests: Guest[], settings: WeddingSettings) => {
  const headers = [
    'Guest Name',
    'Phone',
    'Side',
    'Main Relative / Head',
    'Sub-Category (Circle)',
    'Relationship',
    'Invitation Sent',
    '19 Dec (Bride Home) RSVP',
    '19 Dec Headcount',
    '20 Dec (Wedding Day) RSVP',
    '20 Dec Headcount',
    'Notes'
  ];

  const rows = guests.map(g => [
    `"${g.name.replace(/"/g, '""')}"`,
    `"${g.phone || ''}"`,
    `"${g.side}"`,
    `"${g.invitedBy.replace(/"/g, '""')}"`,
    `"${(g.category || 'General').replace(/"/g, '""')}"`,
    `"${g.relationship}"`,
    g.invitationSent ? 'Yes' : 'No',
    `"${g.rsvpNightBefore}"`,
    g.rsvpNightBefore === 'confirmed' ? g.countNightBefore : 0,
    `"${g.rsvpWeddingDay}"`,
    g.rsvpWeddingDay === 'confirmed' ? g.countWeddingDay : 0,
    `"${(g.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${settings.groomName}_${settings.brideName}_Wedding_Guest_List.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Budget to CSV
export const exportBudgetToCSV = (items: BudgetItem[], settings: WeddingSettings) => {
  const headers = [
    'Expense Item',
    'Category',
    'Estimated Cost',
    'Actual Cost',
    'Paid Amount (Advance)',
    'Balance Due',
    'Payment Status',
    'Due Date',
    'Paid By',
    'Vendor Name',
    'Vendor Phone',
    'Notes'
  ];

  const rows = items.map(item => [
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.estimatedCost || 0,
    item.actualCost || 0,
    item.paidAmount || 0,
    Math.max(0, (item.actualCost || 0) - (item.paidAmount || 0)),
    `"${item.paymentStatus}"`,
    `"${item.dueDate || ''}"`,
    `"${item.paidBy || ''}"`,
    `"${(item.vendorName || '').replace(/"/g, '""')}"`,
    `"${item.vendorPhone || ''}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${settings.groomName}_${settings.brideName}_Wedding_Budget_Tracker.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Full JSON Backup
export const exportFullBackup = (payload: {
  settings: WeddingSettings;
  guests: Guest[];
  reminders: WeddingReminder[];
  events: WeddingEvent[];
  budget?: BudgetItem[];
}) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `WeddingDay_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
