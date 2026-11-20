import React, { useState, useEffect } from 'react';
import { X, User, Phone, Users, Moon, Sun, Check, FolderTree } from 'lucide-react';
import { Guest, RSVPStatus, WeddingSettings } from '../types/wedding';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  guestToEdit?: Guest | null;
  settings: WeddingSettings;
  defaultInvitedBy?: string;
  defaultCategory?: string;
}

const COMMON_CATEGORIES = ['Friends', 'Coworkers', 'Relatives', 'Neighbors', 'VIPs / Family Friends'];

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guestToEdit,
  settings,
  defaultInvitedBy,
  defaultCategory,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Relative');
  const [side, setSide] = useState<'groom' | 'bride' | 'mutual'>('groom');
  
  // Main Relative / Head (e.g. Father, Mother, Jishnu, Swathi)
  const [invitedBy, setInvitedBy] = useState('');
  const [customInviter, setCustomInviter] = useState('');
  const [isCustomInviter, setIsCustomInviter] = useState(false);

  // Sub-Category inside the Head (e.g. Friends, Coworkers, Relatives)
  const [category, setCategory] = useState('Friends');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [invitationSent, setInvitationSent] = useState(true);

  // 19 Dec Event (Bride's Home Function)
  const [rsvpNightBefore, setRsvpNightBefore] = useState<RSVPStatus>('confirmed');
  const [countNightBefore, setCountNightBefore] = useState<number>(2);

  // 20 Dec Event (Wedding Day Ceremony)
  const [rsvpWeddingDay, setRsvpWeddingDay] = useState<RSVPStatus>('confirmed');
  const [countWeddingDay, setCountWeddingDay] = useState<number>(2);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (guestToEdit) {
      setName(guestToEdit.name);
      setPhone(guestToEdit.phone || '');
      setRelationship(guestToEdit.relationship || 'Relative');
      setSide(guestToEdit.side || 'groom');
      
      if (settings.familyMembers.includes(guestToEdit.invitedBy)) {
        setInvitedBy(guestToEdit.invitedBy);
        setIsCustomInviter(false);
      } else {
        setInvitedBy('Other');
        setCustomInviter(guestToEdit.invitedBy);
        setIsCustomInviter(true);
      }

      if (COMMON_CATEGORIES.includes(guestToEdit.category)) {
        setCategory(guestToEdit.category);
        setIsCustomCategory(false);
      } else {
        setCategory('Other');
        setCustomCategory(guestToEdit.category || 'General');
        setIsCustomCategory(true);
      }

      setInvitationSent(guestToEdit.invitationSent);
      setRsvpNightBefore(guestToEdit.rsvpNightBefore);
      setCountNightBefore(guestToEdit.countNightBefore ?? 1);
      setRsvpWeddingDay(guestToEdit.rsvpWeddingDay);
      setCountWeddingDay(guestToEdit.countWeddingDay ?? 1);
      setNotes(guestToEdit.notes || '');
    } else {
      // New Guest
      setName('');
      setPhone('');
      setRelationship('Relative');
      setSide('groom');
      
      const initialInvited = defaultInvitedBy && settings.familyMembers.includes(defaultInvitedBy)
        ? defaultInvitedBy
        : settings.familyMembers[0] || 'Father';
      setInvitedBy(initialInvited);
      setIsCustomInviter(false);
      setCustomInviter('');

      const initCat = defaultCategory || 'Friends';
      setCategory(initCat);
      setIsCustomCategory(false);
      setCustomCategory('');

      setInvitationSent(false);
      setRsvpNightBefore('confirmed');
      setCountNightBefore(2);
      setRsvpWeddingDay('confirmed');
      setCountWeddingDay(2);
      setNotes('');
    }
  }, [guestToEdit, isOpen, defaultInvitedBy, defaultCategory, settings.familyMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalInvitedBy = isCustomInviter ? (customInviter.trim() || 'Family') : invitedBy;
    const finalCategory = isCustomCategory ? (customCategory.trim() || 'General') : category;

    const newGuest: Guest = {
      id: guestToEdit ? guestToEdit.id : `gst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      side,
      invitedBy: finalInvitedBy,
      category: finalCategory,
      invitationSent,
      rsvpNightBefore,
      countNightBefore: rsvpNightBefore === 'declined' ? 0 : Number(countNightBefore) || 1,
      rsvpWeddingDay,
      countWeddingDay: rsvpWeddingDay === 'declined' ? 0 : Number(countWeddingDay) || 1,
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSave(newGuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {guestToEdit ? 'Edit Guest Details' : 'Add Guest to Category'}
              </h3>
              <p className="text-xs text-slate-500">Group by Head Relative and Circle with 19 & 20 Dec confirmations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Relative Head & Sub-Category */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
            <span className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-amber-700" />
              <span>Head Relative & Category Assignment</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Main Relative Head */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Main Relative / Head *
                </label>
                <select
                  value={isCustomInviter ? 'Other' : invitedBy}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsCustomInviter(true);
                    } else {
                      setIsCustomInviter(false);
                      setInvitedBy(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {settings.familyMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                  <option value="Other">+ Custom Head</option>
                </select>

                {isCustomInviter && (
                  <input
                    type="text"
                    placeholder="Enter head name (e.g. Uncle)"
                    value={customInviter}
                    onChange={(e) => setCustomInviter(e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs bg-white"
                  />
                )}
              </div>

              {/* Sub-Category inside Head */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Category inside {invitedBy || 'Head'} *
                </label>
                <select
                  value={isCustomCategory ? 'Other' : category}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsCustomCategory(true);
                    } else {
                      setIsCustomCategory(false);
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {COMMON_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">+ Custom Category</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    placeholder="e.g. Badminton Club, Tech Friends"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs bg-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Guest Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guest / Family Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar & Family"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Side & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Side
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm bg-white"
              >
                <option value="groom">Groom's Side (Jishnu)</option>
                <option value="bride">Bride's Side (Swathi)</option>
                <option value="mutual">Mutual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Relationship Tag
              </label>
              <input
                type="text"
                placeholder="e.g. School Friend, Cousin, Colleague"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Event 1: 19 Dec Pre-Wedding at Bride's Home */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-950">
                  19 Dec: Function at Bride's Home
                </span>
              </div>
              <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded-md">
                Eve Celebration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 uppercase tracking-wide mb-1">
                  19 Dec Attendance
                </label>
                <div className="flex rounded-lg p-1 bg-white border border-indigo-200 gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRsvpNightBefore('confirmed')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpNightBefore === 'confirmed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpNightBefore('pending')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpNightBefore === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpNightBefore('declined')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpNightBefore === 'declined'
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Declined
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 uppercase tracking-wide mb-1">
                  Attending Heads on 19 Dec
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={rsvpNightBefore === 'declined' || countNightBefore <= 1}
                    onClick={() => setCountNightBefore(Math.max(1, countNightBefore - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    disabled={rsvpNightBefore === 'declined'}
                    value={rsvpNightBefore === 'declined' ? 0 : countNightBefore}
                    onChange={(e) => setCountNightBefore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center py-2 rounded-xl border border-indigo-200 bg-white font-bold text-indigo-900 text-base"
                  />
                  <button
                    type="button"
                    disabled={rsvpNightBefore === 'declined'}
                    onClick={() => setCountNightBefore(countNightBefore + 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Event 2: 20 Dec Wedding Day at Wedding Hall */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-rose-950">
                  20 Dec: Wedding Day (Ceremony & Feast)
                </span>
              </div>
              <span className="text-[11px] text-rose-700 font-semibold bg-rose-100/70 px-2 py-0.5 rounded-md">
                Main Ceremony
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-rose-900 uppercase tracking-wide mb-1">
                  20 Dec Attendance
                </label>
                <div className="flex rounded-lg p-1 bg-white border border-rose-200 gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRsvpWeddingDay('confirmed')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpWeddingDay === 'confirmed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpWeddingDay('pending')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpWeddingDay === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpWeddingDay('declined')}
                    className={`flex-1 py-1.5 rounded-md transition-all ${
                      rsvpWeddingDay === 'declined'
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Declined
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-900 uppercase tracking-wide mb-1">
                  Attending Heads on 20 Dec
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={rsvpWeddingDay === 'declined' || countWeddingDay <= 1}
                    onClick={() => setCountWeddingDay(Math.max(1, countWeddingDay - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-50 disabled:opacity-40"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    disabled={rsvpWeddingDay === 'declined'}
                    value={rsvpWeddingDay === 'declined' ? 0 : countWeddingDay}
                    onChange={(e) => setCountWeddingDay(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center py-2 rounded-xl border border-rose-200 bg-white font-bold text-rose-900 text-base"
                  />
                  <button
                    type="button"
                    disabled={rsvpWeddingDay === 'declined'}
                    onClick={() => setCountWeddingDay(countWeddingDay + 1)}
                    className="w-10 h-10 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Invitation Sent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Traveling from Mumbai, needs room allocation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-colors"
            >
              {guestToEdit ? 'Save Changes' : 'Add Guest to Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
