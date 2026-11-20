import React, { useState } from 'react';
import { X, Settings, Heart, Calendar, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import { WeddingSettings } from '../types/wedding';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WeddingSettings;
  onSave: (settings: WeddingSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [groomName, setGroomName] = useState(settings.groomName);
  const [brideName, setBrideName] = useState(settings.brideName);
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate.substring(0, 16));
  const [nightBeforeDate, setNightBeforeDate] = useState(settings.nightBeforeDate.substring(0, 16));
  const [weddingVenue, setWeddingVenue] = useState(settings.weddingVenue);
  const [nightBeforeVenue, setNightBeforeVenue] = useState(settings.nightBeforeVenue);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [familyMembers, setFamilyMembers] = useState<string[]>([...settings.familyMembers]);
  const [newMemberName, setNewMemberName] = useState('');

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMemberName.trim() && !familyMembers.includes(newMemberName.trim())) {
      setFamilyMembers([...familyMembers, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (indexToRemove: number) => {
    setFamilyMembers(familyMembers.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) return;

    onSave({
      ...settings,
      groomName: groomName.trim(),
      brideName: brideName.trim(),
      weddingDate: new Date(weddingDate).toISOString(),
      nightBeforeDate: new Date(nightBeforeDate).toISOString(),
      weddingVenue: weddingVenue.trim(),
      nightBeforeVenue: nightBeforeVenue.trim(),
      currencySymbol: currencySymbol.trim() || '₹',
      familyMembers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Wedding Settings & Details</h3>
              <p className="text-xs text-slate-500">Customize couple names, event dates, venues and host family list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Groom's Name *
              </label>
              <input
                type="text"
                required
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bride's Name *
              </label>
              <input
                type="text"
                required
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Event Dates & Timings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              📅 Event Dates & Timings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Wedding Day Date & Muhurtham
                </label>
                <input
                  type="datetime-local"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Night Before Eve Celebration Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={nightBeforeDate}
                  onChange={(e) => setNightBeforeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Venues */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Main Wedding Ceremony & Lunch Venue
              </label>
              <input
                type="text"
                required
                value={weddingVenue}
                onChange={(e) => setWeddingVenue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Night Before Celebration Venue
              </label>
              <input
                type="text"
                required
                value={nightBeforeVenue}
                onChange={(e) => setNightBeforeVenue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-24 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center"
            />
          </div>

          {/* Host Family Members List */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-rose-950 uppercase tracking-wider">
                👥 Family Host Member List
              </span>
              <span className="text-[11px] text-rose-700">
                Used to filter & group guest invitations
              </span>
            </div>

            {/* List of current members */}
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-200 text-xs font-medium text-slate-800 shadow-xs"
                >
                  <span>{member}</span>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add new member */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add family member (e.g. Uncle Ramesh, Elder Sister)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
