import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Filter, Moon, Sun, Check, X, Clock, 
  MessageCircle, Edit2, Trash2, Phone, FolderTree, ChevronDown, ChevronRight,
  UserCheck, MapPin
} from 'lucide-react';
import { Guest, RSVPStatus, WeddingSettings } from '../types/wedding';

interface GuestListProps {
  guests: Guest[];
  settings: WeddingSettings;
  onAddGuest: (defaultInviter?: string, defaultCategory?: string) => void;
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
  const [selectedHead, setSelectedHead] = useState<string>(activeInviterFilter || 'all');
  const [selectedEventFilter, setSelectedEventFilter] = useState<'all' | '19_dec_confirmed' | '20_dec_confirmed' | 'pending' | 'declined'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});

  // Sync prop changes
  React.useEffect(() => {
    if (activeInviterFilter) {
      setSelectedHead(activeInviterFilter);
    }
  }, [activeInviterFilter]);

  // All unique heads (Main Relatives)
  const allHeads = useMemo(() => {
    const set = new Set<string>();
    settings.familyMembers.forEach(m => set.add(m));
    guests.forEach(g => {
      if (g.invitedBy) set.add(g.invitedBy);
    });
    return Array.from(set);
  }, [settings.familyMembers, guests]);

  const toggleCategoryCollapse = (categoryKey: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // Filtered Guests based on Search, Event Filter, and Head
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        guest.name.toLowerCase().includes(search) ||
        (guest.phone && guest.phone.includes(search)) ||
        (guest.category && guest.category.toLowerCase().includes(search)) ||
        (guest.relationship && guest.relationship.toLowerCase().includes(search)) ||
        (guest.notes && guest.notes.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      // Head / Main Relative Filter
      if (selectedHead !== 'all' && guest.invitedBy !== selectedHead) {
        return false;
      }

      // Event Status Filter
      if (selectedEventFilter === '19_dec_confirmed' && guest.rsvpNightBefore !== 'confirmed') {
        return false;
      }
      if (selectedEventFilter === '20_dec_confirmed' && guest.rsvpWeddingDay !== 'confirmed') {
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
  }, [guests, searchQuery, selectedHead, selectedEventFilter]);

  // Group filtered guests by Head Relative, and then by Category
  const groupedStructure = useMemo(() => {
    const headsToDisplay = selectedHead === 'all' 
      ? allHeads.filter(h => filteredGuests.some(g => g.invitedBy === h))
      : [selectedHead];

    return headsToDisplay.map(headName => {
      const headGuests = filteredGuests.filter(g => g.invitedBy === headName);
      
      // Group by sub-categories (e.g. Friends, Coworkers, Relatives, Neighbors)
      const categoriesMap = new Map<string, Guest[]>();
      headGuests.forEach(guest => {
        const cat = guest.category || 'General';
        if (!categoriesMap.has(cat)) {
          categoriesMap.set(cat, []);
        }
        categoriesMap.get(cat)!.push(guest);
      });

      // Calculate totals for this head
      const totalCards = headGuests.length;
      const total19Heads = headGuests
        .filter(g => g.rsvpNightBefore === 'confirmed')
        .reduce((sum, g) => sum + (g.countNightBefore || 1), 0);
      const total20Heads = headGuests
        .filter(g => g.rsvpWeddingDay === 'confirmed')
        .reduce((sum, g) => sum + (g.countWeddingDay || 1), 0);

      const categories = Array.from(categoriesMap.entries()).map(([catName, list]) => {
        const cat19Heads = list
          .filter(g => g.rsvpNightBefore === 'confirmed')
          .reduce((sum, g) => sum + (g.countNightBefore || 1), 0);
        const cat20Heads = list
          .filter(g => g.rsvpWeddingDay === 'confirmed')
          .reduce((sum, g) => sum + (g.countWeddingDay || 1), 0);

        return {
          catName,
          list,
          cat19Heads,
          cat20Heads,
          totalInCat: list.length,
        };
      });

      return {
        headName,
        totalCards,
        total19Heads,
        total20Heads,
        categories,
      };
    }).filter(h => h.categories.length > 0);
  }, [allHeads, filteredGuests, selectedHead]);

  // WhatsApp Invite with Venue Maps links
  const sendWhatsAppInvite = (guest: Guest) => {
    const weddingMap = settings.weddingMapUrl || 'https://maps.app.goo.gl/GqVMveX52eWPWwGf9';
    const brideHomeMap = settings.nightBeforeMapUrl || 'https://maps.app.goo.gl/kuf1hXdppVXVykks9';

    const text = encodeURIComponent(
      `Namaste ${guest.name}! 🙏\n\n` +
      `We warmly invite you and your family to the Wedding Celebrations of ${settings.groomName} & ${settings.brideName}!\n\n` +
      `🌙 *19 Dec 2026 - Pre-Wedding Celebration (Bride's Home)*:\n` +
      `📍 Venue: Bride's Home\n` +
      `🗺️ Location: ${brideHomeMap}\n\n` +
      `💍 *20 Dec 2026 - Sacred Wedding Ceremony & Grand Feast*:\n` +
      `📍 Venue: Wedding Hall\n` +
      `🗺️ Location: ${weddingMap}\n\n` +
      `Kindly let us know your confirmation for 19 Dec & 20 Dec. We look forward to celebrating with you!`
    );
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      {/* Top Header & Add Guest Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-playfair text-slate-800">
              Hierarchical Guest & Confirmation List
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              {filteredGuests.length} Guests
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grouped by <strong>Main Relative (Head)</strong> ➔ <strong>Category (Friends, Coworkers, etc.)</strong> with separate 19 & 20 Dec confirmations
          </p>
        </div>

        <button
          onClick={() => onAddGuest(selectedHead !== 'all' ? selectedHead : undefined)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Guest</span>
        </button>
      </div>

      {/* Main Relatives as Head Filter Selector */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Select Main Relative Head:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => {
                setSelectedHead('all');
                if (onClearInviterFilter) onClearInviterFilter();
              }}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap font-semibold ${
                selectedHead === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All Heads ({guests.length})
            </button>
            {allHeads.map((head) => {
              const headCount = guests.filter(g => g.invitedBy === head).length;
              return (
                <button
                  key={head}
                  onClick={() => setSelectedHead(head)}
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                    selectedHead === head
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 opacity-80" />
                  <span>{head}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedHead === head ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {headCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Quick RSVP Status Filter Pills */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, category (e.g. Friends), relationship..."
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

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setSelectedEventFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedEventFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedEventFilter('20_dec_confirmed')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                selectedEventFilter === '20_dec_confirmed'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>20 Dec Confirmed</span>
            </button>
            <button
              onClick={() => setSelectedEventFilter('19_dec_confirmed')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                selectedEventFilter === '19_dec_confirmed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>19 Dec Confirmed</span>
            </button>
            <button
              onClick={() => setSelectedEventFilter('pending')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                selectedEventFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Awaiting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Tree View: Head ➔ Categories ➔ People */}
      {groupedStructure.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No guests found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, or click below to add a guest under this category.
          </p>
          <button
            onClick={() => onAddGuest(selectedHead !== 'all' ? selectedHead : undefined)}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            + Add Guest
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedStructure.map((headGroup) => (
            <div
              key={headGroup.headName}
              className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden"
            >
              {/* Head Relative Header Banner */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {headGroup.headName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-playfair">
                      {headGroup.headName}'s Invitation List
                    </h3>
                    <p className="text-xs text-slate-300">
                      Total: {headGroup.totalCards} cards • {headGroup.categories.length} categories
                    </p>
                  </div>
                </div>

                {/* Head Confirmation Badges */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="px-3 py-1 rounded-xl bg-indigo-900/80 border border-indigo-400/40 text-indigo-100 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-300" />
                    <span>19 Dec:</span>
                    <strong className="text-white font-bold">{headGroup.total19Heads} heads</strong>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-rose-900/80 border border-rose-400/40 text-rose-100 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span>20 Dec:</span>
                    <strong className="text-white font-bold">{headGroup.total20Heads} heads</strong>
                  </div>
                </div>
              </div>

              {/* Nested Categories (Friends, Coworkers, Relatives, etc.) */}
              <div className="p-4 sm:p-6 space-y-6 bg-slate-50/30">
                {headGroup.categories.map((catGroup) => {
                  const categoryKey = `${headGroup.headName}-${catGroup.catName}`;
                  const isCollapsed = !!collapsedCategories[categoryKey];

                  return (
                    <div
                      key={catGroup.catName}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                    >
                      {/* Category Header Bar */}
                      <div className="px-4 py-3 bg-gradient-to-r from-amber-50/70 via-rose-50/30 to-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div 
                          onClick={() => toggleCategoryCollapse(categoryKey)}
                          className="flex items-center gap-2 cursor-pointer select-none"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {catGroup.catName}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {catGroup.totalInCat} {catGroup.totalInCat === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        </div>

                        {/* Category Stats and "+ Add Person" Button */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-indigo-100">
                              🌙 19 Dec: {catGroup.cat19Heads}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-rose-100">
                              💍 20 Dec: {catGroup.cat20Heads}
                            </span>
                          </div>

                          <button
                            onClick={() => onAddGuest(headGroup.headName, catGroup.catName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                            title={`Add person directly to ${headGroup.headName}'s ${catGroup.catName}`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Person</span>
                          </button>
                        </div>
                      </div>

                      {/* People Cards inside this Category */}
                      {!isCollapsed && (
                        <div className="divide-y divide-slate-100">
                          {catGroup.list.map((guest) => (
                            <div
                              key={guest.id}
                              className="p-3.5 sm:p-4 hover:bg-rose-50/20 transition-colors space-y-2.5"
                            >
                              {/* Person Info & WhatsApp */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-start sm:items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                    {guest.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-sm font-bold text-slate-900">
                                        {guest.name}
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                        {guest.relationship}
                                      </span>
                                      {guest.side === 'groom' && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                          Groom's Side
                                        </span>
                                      )}
                                      {guest.side === 'bride' && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-pink-50 text-pink-700 text-[10px] font-semibold">
                                          Bride's Side
                                        </span>
                                      )}
                                    </div>
                                    {guest.phone && (
                                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {guest.phone}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center">
                                  <button
                                    onClick={() => sendWhatsAppInvite(guest)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                                    title="Send WhatsApp Invitation with Map Links"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>

                                  <button
                                    onClick={() => onEditGuest(guest)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Edit Guest"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${guest.name}?`)) {
                                        onDeleteGuest(guest.id);
                                      }
                                    }}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Guest"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Separate 19 Dec and 20 Dec RSVP & Headcount Steppers */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                                {/* 19 Dec Event (Bride's Home) */}
                                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/60 border border-indigo-100/80">
                                  <div className="flex items-center gap-1.5">
                                    <Moon className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                    <div>
                                      <span className="font-bold text-indigo-950 block text-[11px]">
                                        19 Dec (Bride's Home)
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {guest.rsvpNightBefore === 'confirmed' ? (
                                          <strong className="text-emerald-700 font-bold">{guest.countNightBefore} heads confirmed</strong>
                                        ) : guest.rsvpNightBefore === 'declined' ? (
                                          <span className="text-slate-500">Declined</span>
                                        ) : (
                                          <span className="text-amber-700">Awaiting (~{guest.countNightBefore})</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'confirmed', guest.countNightBefore || 1)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        guest.rsvpNightBefore === 'confirmed'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                                      }`}
                                    >
                                      ✓ Yes
                                    </button>
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'pending', guest.countNightBefore || 1)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        guest.rsvpNightBefore === 'pending'
                                          ? 'bg-amber-500 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                                      }`}
                                    >
                                      ?
                                    </button>
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'night_before', 'declined', 0)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        guest.rsvpNightBefore === 'declined'
                                          ? 'bg-slate-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      ✗ No
                                    </button>
                                  </div>
                                </div>

                                {/* 20 Dec Event (Wedding Day) */}
                                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60 border border-rose-100/80">
                                  <div className="flex items-center gap-1.5">
                                    <Sun className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                    <div>
                                      <span className="font-bold text-rose-950 block text-[11px]">
                                        20 Dec (Wedding Day)
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {guest.rsvpWeddingDay === 'confirmed' ? (
                                          <strong className="text-emerald-700 font-bold">{guest.countWeddingDay} heads confirmed</strong>
                                        ) : guest.rsvpWeddingDay === 'declined' ? (
                                          <span className="text-slate-500">Declined</span>
                                        ) : (
                                          <span className="text-amber-700">Awaiting (~{guest.countWeddingDay})</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'confirmed', guest.countWeddingDay || 1)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        guest.rsvpWeddingDay === 'confirmed'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                                      }`}
                                    >
                                      ✓ Yes
                                    </button>
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'pending', guest.countWeddingDay || 1)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        guest.rsvpWeddingDay === 'pending'
                                          ? 'bg-amber-500 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
                                      }`}
                                    >
                                      ?
                                    </button>
                                    <button
                                      onClick={() => onUpdateRsvp(guest.id, 'wedding_day', 'declined', 0)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
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

                              {/* Notes */}
                              {guest.notes && (
                                <p className="text-[11px] text-slate-500 italic bg-amber-50/40 p-1.5 rounded-lg border border-amber-200/40">
                                  Note: {guest.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
