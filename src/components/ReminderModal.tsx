import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, DollarSign, User, Phone, Tag, Star, AlertCircle, Trash2 } from 'lucide-react';
import { WeddingReminder, ReminderCategory, ReminderPriority, ReminderStatus, WeddingSettings } from '../types/wedding';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: WeddingReminder) => void;
  onDelete?: (id: string) => void;
  reminderToEdit?: WeddingReminder | null;
  settings: WeddingSettings;
}

const CATEGORIES: { id: ReminderCategory; label: string; icon: string }[] = [
  { id: 'jewelry', label: 'Jewelry & Gold Chain', icon: '💍' },
  { id: 'photography', label: 'Camera & Photography', icon: '📸' },
  { id: 'attire', label: 'Attire, Saree & Suits', icon: '👗' },
  { id: 'catering', label: 'Catering & Food', icon: '🍽️' },
  { id: 'decoration', label: 'Stage Decoration & Flowers', icon: '💐' },
  { id: 'venue', label: 'Venue & Hall', icon: '🏛️' },
  { id: 'ritual', label: 'Rituals & Pooja Items', icon: '🪔' },
  { id: 'makeup', label: 'Makeup & Mehendi', icon: '💄' },
  { id: 'transport', label: 'Cars & Transport', icon: '🚗' },
  { id: 'music', label: 'DJ, Nadaswaram & Music', icon: '🎵' },
  { id: 'payment', label: 'Vendor Balance Payment', icon: '💰' },
  { id: 'other', label: 'General Reminder', icon: '📋' },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  reminderToEdit,
  settings,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('jewelry');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('high');
  const [status, setStatus] = useState<ReminderStatus>('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [cost, setCost] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSpecialReminder, setIsSpecialReminder] = useState(false);

  useEffect(() => {
    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setCategory(reminderToEdit.category);
      setDueDate(reminderToEdit.dueDate);
      setDueTime(reminderToEdit.dueTime || '');
      setPriority(reminderToEdit.priority);
      setStatus(reminderToEdit.status);
      setAssignedTo(reminderToEdit.assignedTo);
      setCost(reminderToEdit.cost ? String(reminderToEdit.cost) : '');
      setPaidAmount(reminderToEdit.paidAmount ? String(reminderToEdit.paidAmount) : '');
      setVendorName(reminderToEdit.vendorName || '');
      setVendorPhone(reminderToEdit.vendorPhone || '');
      setNotes(reminderToEdit.notes || '');
      setIsSpecialReminder(!!reminderToEdit.isSpecialReminder);
    } else {
      // New reminder defaults
      setTitle('');
      setCategory('jewelry');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDueDate(defaultDate.toISOString().split('T')[0]);
      setDueTime('12:00');
      setPriority('high');
      setStatus('pending');
      setAssignedTo(settings.familyMembers[0] || 'Groom');
      setCost('');
      setPaidAmount('');
      setVendorName('');
      setVendorPhone('');
      setNotes('');
      setIsSpecialReminder(false);
    }
  }, [reminderToEdit, isOpen, settings.familyMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const newReminder: WeddingReminder = {
      id: reminderToEdit ? reminderToEdit.id : `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      category,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status,
      assignedTo,
      cost: cost ? parseFloat(cost) : undefined,
      paidAmount: paidAmount ? parseFloat(paidAmount) : undefined,
      vendorName: vendorName.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      isSpecialReminder,
      updatedAt: new Date().toISOString(),
    };

    onSave(newReminder);
    onClose();
  };

  // Quick Preset Helper
  const applyPreset = (preset: 'chain' | 'camera' | 'attire' | 'caterer') => {
    if (preset === 'chain') {
      setTitle('Order Wedding Gold Chain / Mangalsutra');
      setCategory('jewelry');
      setPriority('urgent');
      setIsSpecialReminder(true);
      setNotes('Verify 916 BIS hallmark and collect weight receipt');
    } else if (preset === 'camera') {
      setTitle('Camera & Photography Crew Advance / Balance Payment');
      setCategory('photography');
      setPriority('high');
      setIsSpecialReminder(true);
      setNotes('Confirm drone camera coverage, album delivery schedule and deliverables');
    } else if (preset === 'attire') {
      setTitle('Wedding Saree / Groom Suit Alteration & Final Pickup');
      setCategory('attire');
      setPriority('high');
      setIsSpecialReminder(true);
    } else if (preset === 'caterer') {
      setTitle('Finalize Catering Headcount & Pay Advance');
      setCategory('catering');
      setPriority('urgent');
      setIsSpecialReminder(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 via-white to-rose-50 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {reminderToEdit ? 'Edit Wedding Reminder' : 'Add Special Reminder & Payment'}
              </h3>
              <p className="text-xs text-slate-500">Keep critical tasks, orders and vendor payments on schedule</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets for Common High-Priority Reminders */}
          {!reminderToEdit && (
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60">
              <span className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2">
                ✨ Quick Wedding Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('chain')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100/70"
                >
                  💍 Order Chain / Jewelry
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('camera')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100/70"
                >
                  📸 Camera Payment
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('attire')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100/70"
                >
                  👗 Attire Pickup
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('caterer')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100/70"
                >
                  🍽️ Catering Advance
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reminder / Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Order wedding gold chain / mangalsutra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-medium"
            />
          </div>

          {/* Category & Special Reminder Star */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 cursor-pointer hover:bg-amber-100/40 transition-colors">
                <input
                  type="checkbox"
                  checked={isSpecialReminder}
                  onChange={(e) => setIsSpecialReminder(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Mark as Special / Crucial Milestone
                </span>
              </label>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time (Optional)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Priority & Assigned Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
              >
                <option value="urgent">🔴 Urgent / Immediate</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🔵 Medium Priority</option>
                <option value="low">⚪ Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Family Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-white"
              >
                {settings.familyMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'pending'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'in_progress'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Payment & Financial Tracking Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <span className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
              💰 Expense & Payment Tracking (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  Total Cost / Quotation ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  Advance / Amount Paid ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
                />
              </div>
            </div>

            {cost && (
              <div className="pt-1 flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>
                  Remaining Balance:{' '}
                  <strong className="text-emerald-950 font-bold">
                    {settings.currencySymbol}
                    {Math.max(0, (parseFloat(cost) || 0) - (parseFloat(paidAmount) || 0)).toLocaleString()}
                  </strong>
                </span>
                {parseFloat(paidAmount || '0') >= parseFloat(cost) && (
                  <span className="text-emerald-600 font-bold">✓ Fully Paid</span>
                )}
              </div>
            )}
          </div>

          {/* Vendor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vendor Name / Shop
              </label>
              <input
                type="text"
                placeholder="e.g. Studio Memories / Kalyan Jewellers"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vendor Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Instructions & Details
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Balance to be paid on delivery; collect warranty slip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {reminderToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(reminderToEdit.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Reminder</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-colors"
              >
                {reminderToEdit ? 'Save Changes' : 'Create Reminder'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
