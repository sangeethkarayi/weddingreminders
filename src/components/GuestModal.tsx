import React, { useState, useEffect } from 'react';
import { X, User, Phone, Users, Moon, Sun, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { Guest, RSVPStatus, WeddingSettings } from '../types/wedding';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  guestToEdit?: Guest | null;
  settings: WeddingSettings;
  defaultInvitedBy?: string;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guestToEdit,
  settings,
  defaultInvitedBy
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Relative');
  const [side, setSide] = useState<'groom' | 'bride' | 'mutual'>('groom');
  const [invitedBy, setInvitedBy] = useState('');
  const [customInviter, setCustomInviter] = useState('');
  const [isCustomInviter, setIsCustomInviter] = useState(false);
  const [invitationSent, setInvitationSent] = useState(true);

  // Night Before
  const [rsvpNightBefore, setRsvpNightBefore] = useState<RSVPStatus>('confirmed');
  const [countNightBefore, setCountNightBefore] = useState<number>(2);

  // Wedding Day
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
        : settings.familyMembers[0] || 'Rahul (Groom)';
      setInvitedBy(initialInvited);
      setIsCustomInviter(false);
      setCustomInviter('');
      setInvitationSent(false);
      setRsvpNightBefore('confirmed');
      setCountNightBefore(2);
      setRsvpWeddingDay('confirmed');
      setCountWeddingDay(2);
      setNotes('');
    }
  }, [guestToEdit, isOpen, defaultInvitedBy, settings.familyMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalInvitedBy = isCustomInviter ? (customInviter.trim() || 'Family') : invitedBy;

    const newGuest: Guest = {
      id: guestToEdit ? guestToEdit.id : `gst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      side,
      invitedBy: finalInvitedBy,
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
                {guestToEdit ? 'Edit Guest & Attendance' : 'Add New Guest / Family'}
              </h3>
              <p className="text-xs text-slate-500">Track invitations and headcount for both events</p>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
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

          {/* Invited By (Family Member) & Side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Invited By (Host Member List) *
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
              >
                {settings.familyMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
                <option value="Other">+ Custom Member / Host</option>
              </select>

              {isCustomInviter && (
                <input
                  type="text"
                  placeholder="Enter custom host name (e.g. Uncle Vijay)"
                  value={customInviter}
                  onChange={(e) => setCustomInviter(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-amber-50/30"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Side
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
              >
                <option value="groom">Groom's Side</option>
                <option value="bride">Bride's Side</option>
                <option value="mutual">Mutual</option>
              </select>
            </div>
          </div>

          {/* Relationship & Invitation Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Relatives, Friend, Colleague"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="relative flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invitationSent}
                  onChange={(e) => setInvitationSent(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-700">Invitation Card / Link Sent</span>
              </label>
            </div>
          </div>

          {/* Event 1: Night Before Attendance & Headcount */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-950">Night Before Event (Sangeet / Eve)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 uppercase tracking-wide mb-1">
                  RSVP Status
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
                  Number of People (Headcount)
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

          {/* Event 2: Wedding Day Attendance & Headcount */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-rose-950">Wedding Day (Muhurtham & Lunch)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-rose-900 uppercase tracking-wide mb-1">
                  RSVP Status
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
                  Number of People (Headcount)
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Notes / Needs
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Traveling from Mumbai, needs room arrangement, vegetarian feast..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              {guestToEdit ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
