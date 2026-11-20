import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Phone, Tag, User, AlertCircle, Trash2 } from 'lucide-react';
import { BudgetItem, ExpenseCategory, WeddingSettings } from '../types/wedding';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BudgetItem) => void;
  onDelete?: (id: string) => void;
  itemToEdit?: BudgetItem | null;
  settings: WeddingSettings;
}

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'jewelry', label: 'Gold Jewelry & Rings', icon: '💍' },
  { id: 'catering', label: 'Catering & Feasts', icon: '🍽️' },
  { id: 'venue', label: 'Venues, Hall & Pandal', icon: '🏛️' },
  { id: 'photography', label: 'Camera & Cinematography', icon: '📸' },
  { id: 'attire', label: 'Attire, Sarees & Suits', icon: '👗' },
  { id: 'decoration', label: 'Stage Decor & Mandap', icon: '💐' },
  { id: 'makeup', label: 'Bridal Makeup & Mehendi', icon: '💄' },
  { id: 'ritual', label: 'Rituals, Garlands & Pooja', icon: '🪔' },
  { id: 'music', label: 'Music, Nadaswaram & DJ', icon: '🎵' },
  { id: 'transport', label: 'Travel & Accommodation', icon: '🚗' },
  { id: 'invitation', label: 'Cards & Return Gifts', icon: '💌' },
  { id: 'other', label: 'Miscellaneous / Buffer', icon: '📋' },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  itemToEdit,
  settings,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('catering');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Ramachandran (Father)');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const familyPayers = [
    'Ramachandran (Father)',
    'Jishnu (Groom)',
    'Swathi (Bride)',
    'Shared / Family Pool',
    ...settings.familyMembers.filter(m => !['Ramachandran (Father)', 'Jishnu (Groom)', 'Swathi (Bride)'].includes(m))
  ];

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setEstimatedCost(String(itemToEdit.estimatedCost || ''));
      setActualCost(String(itemToEdit.actualCost || ''));
      setPaidAmount(String(itemToEdit.paidAmount || '0'));
      setPaidBy(itemToEdit.paidBy || 'Ramachandran (Father)');
      setVendorName(itemToEdit.vendorName || '');
      setVendorPhone(itemToEdit.vendorPhone || '');
      setDueDate(itemToEdit.dueDate || '');
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('catering');
      setEstimatedCost('');
      setActualCost('');
      setPaidAmount('0');
      setPaidBy('Ramachandran (Father)');
      setVendorName('');
      setVendorPhone('');
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setDueDate(defaultDue.toISOString().split('T')[0]);
      setNotes('');
    }
  }, [itemToEdit, isOpen, settings.familyMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const est = parseFloat(estimatedCost) || 0;
    const act = parseFloat(actualCost) || est;
    const paid = parseFloat(paidAmount) || 0;

    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (paid >= act && act > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partial';
    }

    const item: BudgetItem = {
      id: itemToEdit ? itemToEdit.id : `bgt-${Date.now()}`,
      title: title.trim(),
      category,
      estimatedCost: est,
      actualCost: act,
      paidAmount: paid,
      paidBy,
      vendorName: vendorName.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      dueDate: dueDate || undefined,
      paymentStatus,
      payments: itemToEdit?.payments || (paid > 0 ? [{
        id: `p-${Date.now()}`,
        amount: paid,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI / GPay',
        notes: 'Initial advance'
      }] : []),
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {itemToEdit ? 'Edit Budget Expense' : 'Add New Budget Expense'}
              </h3>
              <p className="text-xs text-slate-500">Track quotes, payments and due balances across vendors</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expense Title / Service *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wedding Feast Sadya (1,400 Heads) / Gold Chain"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paid By (Host)
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium"
              >
                {familyPayers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost Figures (Estimated, Actual, Paid) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              💰 Cost & Payment Breakdown ({settings.currencySymbol})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Actual / Quote Cost *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 95000"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Paid (Advance)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-emerald-600 text-sm"
                />
              </div>
            </div>

            {/* Calculated Remaining Balance */}
            {actualCost && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Remaining Balance Due:</span>
                <strong className="text-rose-600 text-sm font-bold">
                  {settings.currencySymbol}
                  {Math.max(0, (parseFloat(actualCost) || 0) - (parseFloat(paidAmount) || 0)).toLocaleString()}
                </strong>
              </div>
            )}
          </div>

          {/* Vendor Details & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Caterers"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vendor Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Balance Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Terms & Deliverables
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 50% advance paid, remaining 50% due upon delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {itemToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(itemToEdit.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs sm:text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Expense</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-colors"
              >
                {itemToEdit ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
