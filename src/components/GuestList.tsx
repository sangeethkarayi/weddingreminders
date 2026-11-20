import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Filter, Moon, Sun, Check, X, Clock, 
  MessageCircle, Edit2, Trash2, Phone, CheckCircle2, AlertCircle, ChevronDown
} from 'lucide-react';
import { Guest, RSVPStatus, WeddingSettings } from '../types/wedding';

interface GuestListProps {
  guests: Guest[];
  settings: WeddingSettings;
  onAddGuest: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
  onUpdateRsvp: (id: string, event: 'night_before' | 'wedding_day', rsvp: RSVPStatus, count?: number) => void;
  activeInviterFilter?: string;
  onClearInviterFilter?: () => void;
}

export const GuestList: React.FC<GuestListProps> = ({
  guests,
  settings,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
  onUpdateRsvp,
  activeInviterFilter,
  onClearInviterFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInviter, setSelectedInviter] = useState<string>(activeInviterFilter || 'all');
  const [selectedEventFilter, setSelectedEventFilter] = useState<'all' | 'wedding_confirmed' | 'night_confirmed' | 'pending' | 'declined'>('all');
  const [selectedSide, setSelectedSide] = useState<'all' | 'groom' | 'bride' | 'mutual'>('all');

  // Keep internal filter in sync if prop changes
  React.useEffect(() => {
    if (activeInviterFilter) {
      setSelectedInviter(activeInviterFilter);
    }
  }, [activeInviterFilter]);

  // All unique inviters
  const allInviters = useMemo(() => {
    const list = new Set<string>();
    settings.familyMembers.forEach(m => list.add(m));
    guests.forEach(g => {
      if (g.invitedBy) list.add(g.invitedBy);
    });
    return Array.from(list);
  }, [settings.familyMembers, guests]);

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search
      const matchesSearch = 
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone.includes(searchQuery) ||
        (guest.notes && guest.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        guest.relationship.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Inviter Filter
      if (selectedInviter !== 'all' && guest.invitedBy !== selectedInviter) {
        return false;
      }

      // Side Filter
      if (selectedSide !== 'all' && guest.side !== selectedSide) {
        return false;
      }

      // Event Status Filter
      if (selectedEventFilter === 'wedding_confirmed' && guest.rsvpWeddingDay !== 'confirmed') {
        return false;
      }
      if (selectedEventFilter === 'night_confirmed' && guest.rsvpNightBefore !== 'confirmed') {
        return false;
      }
      if (selectedEventFilter === 'pending' && (guest.rsvpWeddingDay !== 'pending' && guest.rsvpNightBefore !== 'pending')) {
        return false;
      }
      if (selectedEventFilter === 'declined' && (guest.rsvpWeddingDay !== 'declined' && guest.rsvpNightBefore !== 'declined')) {
        return false;
      }

      return true;
    });
  }, [guests, searchQuery, selectedInviter, selectedSide, selectedEventFilter]);

  // WhatsApp Invite Generator
  const sendWhatsAppInvite = (guest: Guest) => {
    const text = encodeURIComponent(
      `Namaste ${guest.name}! 🙏\n\n` +
      `We warmly invite you and your family to the Wedding Celebrations of ${settings.groomName} & ${settings.brideName}!\n\n` +
      `💍 Wedding Ceremony: ${new Date(settings.weddingDate).toLocaleDateString()} at ${settings.weddingVenue}\n` +
      `🌙 Night Before Eve Celebration: ${new Date(settings.nightBeforeDate).toLocaleDateString()} at ${settings.nightBeforeVenue}\n\n` +
      `Please let us know your travel plans & attendance so we can welcome you with warmth. Looking forward to celebrating together!`
    );
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-playfair text-slate-800">
              Wedding Guest & Invitation List
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              {filteredGuests.length} of {guests.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track confirmed attendance by family member host for Wedding Day & Night Before
          </p>
        </div>

        <button
          onClick={onAddGuest}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Guest</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, relationship, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Inviting Family Member Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Host:</span>
            <select
              value={selectedInviter}
              onChange={(e) => setSelectedInviter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">All Family Member Lists</option>
              {allInviters.map((inv) => (
                <option key={inv} value={inv}>
                  {inv} ({guests.filter(g => g.invitedBy === inv).length})
                </option>
              ))}
            </select>
          </div>

          {/* Side Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Side:</span>
            <select
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">All Sides</option>
              <option value="groom">Groom's Side</option>
              <option value="bride">Bride's Side</option>
              <option value="mutual">Mutual</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills for RSVP Status */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs font-medium scrollbar-none">
          <span className="text-slate-400 text-xs">Filter by:</span>
          <button
            onClick={() => setSelectedEventFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedEventFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Guests ({guests.length})
          </button>
          <button
            onClick={() => setSelectedEventFilter('wedding_confirmed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              selectedEventFilter === 'wedding_confirmed'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Wedding Confirmed</span>
          </button>
          <button
            onClick={() => setSelectedEventFilter('night_confirmed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              selectedEventFilter === 'night_confirmed'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night Before Confirmed</span>
          </button>
          <button
            onClick={() => setSelectedEventFilter('pending')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              selectedEventFilter === 'pending'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting RSVP</span>
          </button>
        </div>
      </div>

      {/* Guest Cards / List */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No guests found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filters, or add a new guest to this family host list.
          </p>
          <button
            onClick={onAddGuest}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            + Add Guest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-200 hover:shadow-md transition-all space-y-3"
            >
              {/* Row 1: Name, Badges, and Action Icons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-800 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {guest.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {guest.name}
                      </h4>
                      {guest.side === 'groom' && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                          Groom's Side
                        </span>
                      )}
                      {guest.side === 'bride' && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[11px] font-semibold">
                          Bride's Side
                        </span>
                      )}
                      {guest.side === 'mutual' && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold">
                          Mutual
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">
                        Host: <strong className="text-rose-900">{guest.invitedBy}</strong>
                      </span>
                      <span>•</span>
                      <span>{guest.relationship}</span>
                      {guest.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {guest.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => sendWhatsAppInvite(guest)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                    title="Send WhatsApp Invitation message"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onEditGuest(guest)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Guest Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${guest.name} from invitation list?`)) {
                        onDeleteGuest(guest.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Guest"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Attendance Tracking for Both Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                {/* Night Before RSVP Card */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <div>
                      <span className="font-bold text-indigo-950 block">Night Before Event</span>
                      <span className="text-[11px] text-slate-500">
                        {guest.rsvpNightBefore === 'confirmed' ? (
                          <strong className="text-emerald-700">{guest.countNightBefore} people attending</strong>
                        ) : guest.rsvpNightBefore === 'declined' ? (
                          <span className="text-slate-500">Declined</span>
                        ) : (
                          <span className="text-amber-700">Awaiting RSVP (~{guest.countNightBefore} est.)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'confirmed', guest.countNightBefore || 1)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpNightBefore === 'confirmed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'pending', guest.countNightBefore || 1)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpNightBefore === 'pending'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      ?
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'declined', 0)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpNightBefore === 'declined'
                          ? 'bg-slate-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ✗ No
                    </button>
                  </div>
                </div>

                {/* Wedding Day RSVP Card */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100/80">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-rose-600" />
                    <div>
                      <span className="font-bold text-rose-950 block">Wedding Day (Main)</span>
                      <span className="text-[11px] text-slate-500">
                        {guest.rsvpWeddingDay === 'confirmed' ? (
                          <strong className="text-emerald-700">{guest.countWeddingDay} people attending</strong>
                        ) : guest.rsvpWeddingDay === 'declined' ? (
                          <span className="text-slate-500">Declined</span>
                        ) : (
                          <span className="text-amber-700">Awaiting RSVP (~{guest.countWeddingDay} est.)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'confirmed', guest.countWeddingDay || 1)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpWeddingDay === 'confirmed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                      }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'pending', guest.countWeddingDay || 1)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpWeddingDay === 'pending'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      ?
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'declined', 0)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        guest.rsvpWeddingDay === 'declined'
                          ? 'bg-slate-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ✗ No
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes display if present */}
              {guest.notes && (
                <div className="text-xs text-slate-500 bg-amber-50/50 rounded-lg p-2 border border-amber-200/50 flex items-center gap-2">
                  <span className="font-semibold text-amber-800">Note:</span>
                  <span>{guest.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
