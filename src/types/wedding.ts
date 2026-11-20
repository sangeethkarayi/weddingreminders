export type RSVPStatus = 'confirmed' | 'declined' | 'pending';
export type ReminderPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ReminderStatus = 'pending' | 'in_progress' | 'completed';
export type ReminderCategory = 
  | 'jewelry' 
  | 'photography' 
  | 'attire' 
  | 'catering' 
  | 'decoration' 
  | 'venue' 
  | 'ritual' 
  | 'transport' 
  | 'makeup'
  | 'music'
  | 'payment'
  | 'other';

export interface Guest {
  id: string;
  name: string;
  phone: string;
  relationship: string; // e.g. "Relative", "Close Friend", "Colleague", "Neighbor"
  side: 'groom' | 'bride' | 'mutual';
  invitedBy: string; // Main Relative / Head (e.g. "Father", "Mother", "Jishnu (Groom)", "Swathi (Bride)", "Brother")
  category: string; // Sub-Category inside the Head (e.g. "Friends", "Coworkers", "Relatives", "Neighbors", "VIPs")
  invitationSent: boolean;
  
  // 19 Dec Event (Bride's Home Function)
  rsvpNightBefore: RSVPStatus;
  countNightBefore: number; // Headcount attending 19 Dec
  
  // 20 Dec Event (Main Wedding Day Ceremony)
  rsvpWeddingDay: RSVPStatus;
  countWeddingDay: number; // Headcount attending 20 Dec
  
  notes?: string;
  updatedAt: string;
}

export interface WeddingReminder {
  id: string;
  title: string;
  category: ReminderCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: ReminderPriority;
  status: ReminderStatus;
  assignedTo: string; // Family member responsible
  cost?: number; // Total expense / quotation
  paidAmount?: number; // Advance paid
  vendorName?: string;
  vendorPhone?: string;
  notes?: string;
  isSpecialReminder?: boolean;
  updatedAt: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  eventType: 'night_before' | 'wedding_day' | 'other';
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  locationAddress?: string;
  mapUrl?: string;
  dressCode?: string;
  notes?: string;
}

export interface FirebaseSyncConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  syncCode?: string;
}

export interface WeddingSettings {
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DDTHH:mm
  nightBeforeDate: string; // YYYY-MM-DDTHH:mm
  weddingVenue: string;
  weddingMapUrl: string; // e.g. https://maps.app.goo.gl/GqVMveX52eWPWwGf9
  nightBeforeVenue: string;
  nightBeforeMapUrl: string; // e.g. https://maps.app.goo.gl/kuf1hXdppVXVykks9
  currencySymbol: string;
  familyMembers: string[];
  firebaseConfig?: FirebaseSyncConfig;
  cloudSyncEnabled: boolean;
  syncRoomCode: string;
}
