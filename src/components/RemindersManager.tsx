import React, { useState, useMemo } from 'react';
import { 
  Bell, Star, Plus, CheckCircle2, Clock, AlertTriangle, Phone, 
  MessageCircle, DollarSign, Calendar, Filter, Edit2, Trash2, Tag, 
  ChevronRight, Sparkles, Check
} from 'lucide-react';
import { WeddingReminder, ReminderCategory, ReminderStatus, WeddingSettings } from '../types/wedding';
import confetti from 'canvas-confetti';

interface RemindersManagerProps {
  reminders: WeddingReminder[];
  settings: WeddingSettings;
  onAddReminder: () => void;
  onEditReminder: (reminder: WeddingReminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: ReminderStatus) => void;
}

export const RemindersManager: React.FC<RemindersManagerProps> = ({
  reminders,
  settings,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onToggleStatus,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  // Trigger celebration on completing important reminder
  const handleToggle = (id: string, currentStatus: ReminderStatus) => {
    if (currentStatus !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#ec4899', '#10b981'],
      });
    }
    onToggleStatus(id, currentStatus);
  };

  // Special Milestones (e.g. Chain order, Camera payment, etc.)
  const specialReminders = useMemo(() => {
    return reminders.filter(r => r.isSpecialReminder);
  }, [reminders]);

  // Financial Totals
  const financialSummary = useMemo(() => {
    let totalCost = 0;
    let totalPaid = 0;
    reminders.forEach(r => {
      if (r.cost) totalCost += r.cost;
      if (r.paidAmount) totalPaid += r.paidAmount;
    });
    return {
      totalCost,
      totalPaid,
      balanceDue: Math.max(0, totalCost - totalPaid)
    };
  }, [reminders]);

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      // Category
      if (activeCategoryFilter === 'special' && !r.isSpecialReminder) return false;
      if (activeCategoryFilter !== 'all' && activeCategoryFilter !== 'special' && r.category !== activeCategoryFilter) {
        return false;
      }

      // Status
      if (activeStatusFilter !== 'all' && r.status !== activeStatusFilter) {
        return false;
      }

      // Member
      if (selectedMemberFilter !== 'all' && r.assignedTo !== selectedMemberFilter) {
        return false;
      }

      return true;
    });
  }, [reminders, activeCategoryFilter, activeStatusFilter, selectedMemberFilter]);

  // Days left helper
  const getDaysLeft = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
    if (diffDays === 0) return { label: 'Due Today', isToday: true };
    if (diffDays === 1) return { label: 'Due Tomorrow', isSoon: true };
    return { label: `Due in ${diffDays} days`, isFuture: true };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Crucial Wedding Milestones (Chain order, Camera payment, etc.) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-amber-400/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-400/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/40 border border-amber-300/30 text-amber-100 text-xs font-semibold uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Special Priority Reminders</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-tight">
              Crucial Orders & Payments
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1">
              Never miss vital milestones: Gold chain order, camera crew advance, attire & venue payments
            </p>
          </div>

          <button
            onClick={onAddReminder}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-700" />
            <span>+ Add Reminder</span>
          </button>
        </div>

        {/* Special Spotlight Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {specialReminders.map((reminder) => {
            const daysInfo = getDaysLeft(reminder.dueDate);
            const isCompleted = reminder.status === 'completed';
            const balance = (reminder.cost || 0) - (reminder.paidAmount || 0);

            return (
              <div
                key={reminder.id}
                className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-amber-900/40 border border-amber-400/20 opacity-80'
                    : 'bg-white text-slate-800 shadow-md border border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : daysInfo.isOverdue
                          ? 'bg-rose-100 text-rose-700 font-extrabold'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : daysInfo.label}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        reminder.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {reminder.priority.toUpperCase()}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold leading-snug ${
                      isCompleted ? 'line-through text-amber-200' : 'text-slate-900'
                    }`}
                  >
                    {reminder.title}
                  </h3>

                  {reminder.vendorName && (
                    <p className={`text-xs mt-1 ${isCompleted ? 'text-amber-300' : 'text-slate-500'}`}>
                      Vendor: <strong className="text-amber-800">{reminder.vendorName}</strong>
                    </p>
                  )}

                  {/* Payment Bar if cost exists */}
                  {reminder.cost !== undefined && reminder.cost > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-700">
                        <span>Paid: {settings.currencySymbol}{(reminder.paidAmount || 0).toLocaleString()}</span>
                        <span>Total: {settings.currencySymbol}{reminder.cost.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round(((reminder.paidAmount || 0) / reminder.cost) * 100))}%`,
                          }}
                        />
                      </div>
                      {balance > 0 && !isCompleted && (
                        <p className="text-[11px] text-rose-700 font-bold mt-1 text-right">
                          Due Balance: {settings.currencySymbol}{balance.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={`flex items-center gap-2 text-xs mt-2.5 ${isCompleted ? 'text-amber-300' : 'text-slate-500'}`}>
                    <span>Assigned to: <strong className="text-slate-800">{reminder.assignedTo}</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleToggle(reminder.id, reminder.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-amber-800 text-amber-100 hover:bg-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Mark Pending' : 'Done'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {reminder.vendorPhone && (
                      <a
                        href={`tel:${reminder.vendorPhone}`}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title={`Call ${reminder.vendorName || 'Vendor'}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onEditReminder(reminder)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCompleted ? 'text-amber-200 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Edit Reminder"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete reminder "${reminder.title}"?`)) {
                          onDeleteReminder(reminder.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCompleted ? 'text-amber-200 hover:text-white' : 'text-slate-400 hover:text-rose-600'
                      }`}
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Overview Card */}
      {financialSummary.totalCost > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-semibold">Total Tracked Expenses</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 font-mono mt-0.5">
              {settings.currencySymbol}{financialSummary.totalCost.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-700 uppercase font-semibold">Advance / Paid Amount</span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono mt-0.5">
              {settings.currencySymbol}{financialSummary.totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-xs text-rose-700 uppercase font-semibold">Total Balance Due</span>
            <p className="text-xl sm:text-2xl font-bold text-rose-700 font-mono mt-0.5">
              {settings.currencySymbol}{financialSummary.balanceDue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Full Wedding Reminders & Checklist */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-playfair text-slate-900">
              All Wedding Tasks & Reminders
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage checklists, rituals, attire pickups, and vendor coordination
            </p>
          </div>

          {/* Member Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Assigned To:</span>
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Everyone</option>
              {settings.familyMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Status Filter Tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
            <span className="text-slate-400 text-xs">Category:</span>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tasks ({reminders.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('special')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'special'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Special Milestones ({specialReminders.length})</span>
            </button>
            <button
              onClick={() => setActiveCategoryFilter('jewelry')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'jewelry'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💍 Jewelry & Chain
            </button>
            <button
              onClick={() => setActiveCategoryFilter('photography')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'photography'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📸 Camera & Photography
            </button>
            <button
              onClick={() => setActiveCategoryFilter('catering')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'catering'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🍽️ Catering
            </button>
            <button
              onClick={() => setActiveCategoryFilter('attire')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'attire'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👗 Attire
            </button>
            <button
              onClick={() => setActiveCategoryFilter('ritual')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeCategoryFilter === 'ritual'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🪔 Rituals & Pooja
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-400 text-xs">Status:</span>
            <button
              onClick={() => setActiveStatusFilter('all')}
              className={`px-3 py-1 rounded-lg ${
                activeStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg ${
                activeStatusFilter === 'pending' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending ({reminders.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-lg ${
                activeStatusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              In Progress ({reminders.filter(r => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg ${
                activeStatusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({reminders.filter(r => r.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Reminders List */}
        {filteredReminders.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No reminders match this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => {
              const daysInfo = getDaysLeft(reminder.dueDate);
              const isCompleted = reminder.status === 'completed';

              return (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(reminder.id, reminder.status)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-all flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 hover:border-emerald-600 text-transparent hover:text-emerald-600'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {reminder.title}
                        </span>

                        {reminder.isSpecialReminder && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                            Special
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            daysInfo.isOverdue
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {daysInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Due: {reminder.dueDate}</span>
                        <span>•</span>
                        <span>Assigned: <strong className="text-slate-700">{reminder.assignedTo}</strong></span>
                        {reminder.vendorName && (
                          <>
                            <span>•</span>
                            <span>Vendor: {reminder.vendorName}</span>
                          </>
                        )}
                        {reminder.cost !== undefined && reminder.cost > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              Paid: {settings.currencySymbol}{(reminder.paidAmount || 0).toLocaleString()} / {settings.currencySymbol}{reminder.cost.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {reminder.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{reminder.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {reminder.vendorPhone && (
                      <a
                        href={`tel:${reminder.vendorPhone}`}
                        className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        title={`Call ${reminder.vendorName || 'Vendor'}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onEditReminder(reminder)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete reminder "${reminder.title}"?`)) {
                          onDeleteReminder(reminder.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
