import React, { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, Check, ArrowRight } from 'lucide-react';
import { BudgetItem, PaymentMethod, PaymentRecord, WeddingSettings } from '../types/wedding';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItem: BudgetItem | null;
  onRecordPayment: (itemId: string, payment: PaymentRecord) => void;
  settings: WeddingSettings;
}

const PAYMENT_METHODS: PaymentMethod[] = ['UPI / GPay', 'Bank Transfer', 'Cash', 'Cheque', 'Card'];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  budgetItem,
  onRecordPayment,
  settings,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / GPay');
  const [notes, setNotes] = useState('');

  if (!isOpen || !budgetItem) return null;

  const currentBalance = Math.max(0, budgetItem.actualCost - budgetItem.paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidNum = parseFloat(amount);
    if (!paidNum || paidNum <= 0) return;

    const record: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount: paidNum,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    onRecordPayment(budgetItem.id, record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Record Vendor Payment</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{budgetItem.title}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Item Financial Status Pill */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Cost</span>
              <span className="font-bold text-slate-900">
                {settings.currencySymbol}{budgetItem.actualCost.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Already Paid</span>
              <span className="font-bold text-emerald-600">
                {settings.currencySymbol}{budgetItem.paidAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Due</span>
              <span className="font-bold text-rose-600">
                {settings.currencySymbol}{currentBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Amount ({settings.currencySymbol}) *
              </label>
              {currentBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentBalance))}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Pay Full Balance ({settings.currencySymbol}{currentBalance.toLocaleString()})
                </button>
              )}
            </div>
            <input
              type="number"
              required
              min="1"
              max={currentBalance * 2}
              placeholder={`e.g. ${currentBalance > 0 ? currentBalance : 10000}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transaction Ref / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. GPay UPI Ref #123456, Receipt #89"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Previous Payment History if exists */}
          {budgetItem.payments && budgetItem.payments.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Previous Installments:
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto text-xs">
                {budgetItem.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 text-slate-600">
                    <span>{p.date} • {p.paymentMethod}</span>
                    <strong className="text-emerald-700 font-bold">
                      {settings.currencySymbol}{p.amount.toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
