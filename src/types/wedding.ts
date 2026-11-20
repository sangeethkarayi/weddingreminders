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
  relationship: string; // e.g. "Family", "Relative", "Friend", "Colleague", "Neighbor"
  side: 'groom' | 'bride' | 'mutual';
  invitedBy: string; // e.g. "Groom", "Bride", "Groom's Father", "Groom's Mother", etc.
  invitationSent: boolean;
  
  // Night Before Event (Eve / Sangeet / Reception)
  rsvpNightBefore: RSVPStatus;
  countNightBefore: number; // Headcount attending night before
  
  // Main Wedding Day (Muhurtham / Ceremony)
  rsvpWeddingDay: RSVPStatus;
  countWeddingDay: number; // Headcount attending wedding day
  
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
  isSpecialReminder?: boolean; // Highlighted special reminder like 'Order for chain', 'Camera payment'
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
  syncCode?: string; // Unique shared room code for the family
}

export interface WeddingSettings {
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DDTHH:mm
  nightBeforeDate: string; // YYYY-MM-DDTHH:mm
  weddingVenue: string;
  nightBeforeVenue: string;
  currencySymbol: string;
  familyMembers: string[];
  firebaseConfig?: FirebaseSyncConfig;
  cloudSyncEnabled: boolean;
  syncRoomCode: string;
}
