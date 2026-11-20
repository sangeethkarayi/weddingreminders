import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Plus, Edit2, Trash2, ExternalLink, Moon, Sun } from 'lucide-react';
import { WeddingEvent, WeddingSettings } from '../types/wedding';

interface TimelineEventsProps {
  events: WeddingEvent[];
  settings: WeddingSettings;
  onAddEvent: (event: WeddingEvent) => void;
  onEditEvent: (event: WeddingEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const TimelineEvents: React.FC<TimelineEventsProps> = ({
  events,
  settings,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<'night_before' | 'wedding_day' | 'other'>('wedding_day');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingEvent(null);
    setName('');
    setEventType('wedding_day');
    setDate(settings.weddingDate.split('T')[0]);
    setStartTime('10:00');
    setEndTime('13:00');
    setVenue(settings.weddingVenue);
    setDressCode('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: WeddingEvent) => {
    setEditingEvent(evt);
    setName(evt.name);
    setEventType(evt.eventType);
    setDate(evt.date);
    setStartTime(evt.startTime);
    setEndTime(evt.endTime || '');
    setVenue(evt.venue);
    setDressCode(evt.dressCode || '');
    setNotes(evt.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const payload: WeddingEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      name: name.trim(),
      eventType,
      date,
      startTime,
      endTime: endTime || undefined,
      venue: venue.trim(),
      dressCode: dressCode.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingEvent) {
      onEditEvent(payload);
    } else {
      onAddEvent(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-playfair text-slate-800">
              Wedding Schedule & Program Timeline
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Order of ceremonies, muhurtham timing, meals and venue coordination
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ceremony / Event</span>
        </button>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {events.map((evt, idx) => (
          <div
            key={evt.id}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-rose-200 hover:shadow-sm transition-all bg-gradient-to-br from-white to-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-white ${
                  evt.eventType === 'night_before'
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-700'
                    : 'bg-gradient-to-br from-rose-500 to-rose-700'
                }`}
              >
                {evt.eventType === 'night_before' ? (
                  <Moon className="w-6 h-6 text-indigo-200" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-200" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{evt.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      evt.eventType === 'night_before'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {evt.eventType === 'night_before' ? 'Night Before Eve' : 'Wedding Day'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                  </span>
                  <span>•</span>
                  <span>{new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {evt.venue}
                  </span>
                </div>

                {evt.dressCode && (
                  <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-2 py-1 mt-2 inline-block border border-amber-200/50">
                    👗 Dress Code: <strong>{evt.dressCode}</strong>
                  </p>
                )}

                {evt.notes && (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    {evt.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => openEditModal(evt)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Edit Event"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete event "${evt.name}"?`)) {
                    onDeleteEvent(evt.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingEvent ? 'Edit Ceremony / Event' : 'Add Ceremony / Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhurtham & Sacred Vows"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Section
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="wedding_day">Wedding Day</option>
                    <option value="night_before">Night Before</option>
                    <option value="other">Pre-Wedding / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Palace Mandap Hall"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dress Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Silk / Ethnic Festive"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Auspicious muhurtham timing is 9:45 AM..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700"
                >
                  Save Ceremony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
