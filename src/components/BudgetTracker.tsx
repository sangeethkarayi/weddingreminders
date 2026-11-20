import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Plus, Search, Filter, Phone, CheckCircle2, AlertCircle, 
  Clock, TrendingUp, PieChart, FileSpreadsheet, Edit2, Trash2, ArrowUpRight, 
  CreditCard, Check, Sparkles, UserCheck
} from 'lucide-react';
import { BudgetItem, ExpenseCategory, WeddingSettings } from '../types/wedding';
import { EXPENSE_CATEGORIES } from './ExpenseModal';
import { exportBudgetToCSV } from '../services/storage';
import confetti from 'canvas-confetti';

interface BudgetTrackerProps {
  budgetItems: BudgetItem[];
  settings: WeddingSettings;
  onAddExpense: () => void;
  onEditExpense: (item: BudgetItem) => void;
  onDeleteExpense: (id: string) => void;
  onOpenPaymentModal: (item: BudgetItem) => void;
  onUpdateTargetBudget: (amount: number) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgetItems,
  settings,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenPaymentModal,
  onUpdateTargetBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(String(settings.targetBudget || 1500000));

  // Totals
  const { totalEstimated, totalActual, totalPaid, totalBalanceDue } = useMemo(() => {
    let est = 0;
    let act = 0;
    let paid = 0;
    budgetItems.forEach((b) => {
      est += b.estimatedCost || 0;
      act += b.actualCost || 0;
      paid += b.paidAmount || 0;
    });
    return {
      totalEstimated: est,
      totalActual: act,
      totalPaid: paid,
      totalBalanceDue: Math.max(0, act - paid),
    };
  }, [budgetItems]);

  const targetBudget = settings.targetBudget || 1500000;
  const budgetUtilization = Math.round((totalActual / targetBudget) * 100);
  const paymentProgress = totalActual > 0 ? Math.round((totalPaid / totalActual) * 100) : 0;

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<ExpenseCategory, { total: number; paid: number; count: number }>();
    budgetItems.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, { total: 0, paid: 0, count: 0 });
      }
      const cur = map.get(item.category)!;
      cur.total += item.actualCost || 0;
      cur.paid += item.paidAmount || 0;
      cur.count += 1;
    });

    return Array.from(map.entries())
      .map(([cat, stats]) => {
        const catInfo = EXPENSE_CATEGORIES.find((c) => c.id === cat);
        return {
          cat,
          label: catInfo ? catInfo.label : cat,
          icon: catInfo ? catInfo.icon : '📋',
          percentOfTotal: totalActual > 0 ? Math.round((stats.total / totalActual) * 100) : 0,
          ...stats,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [budgetItems, totalActual]);

  // Unique Payers
  const allPayers = useMemo(() => {
    const set = new Set<string>();
    budgetItems.forEach((b) => {
      if (b.paidBy) set.add(b.paidBy);
    });
    return Array.from(set);
  }, [budgetItems]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return budgetItems.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        (item.vendorName && item.vendorName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.paymentStatus !== selectedStatus) {
        return false;
      }

      // Payer
      if (selectedPayer !== 'all' && item.paidBy !== selectedPayer) {
        return false;
      }

      return true;
    });
  }, [budgetItems, searchQuery, selectedCategory, selectedStatus, selectedPayer]);

  const handleSaveTarget = () => {
    const val = parseFloat(newTargetInput);
    if (val && val > 0) {
      onUpdateTargetBudget(val);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner: Financial Overview & Target Progress */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-700/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Wedding Financial Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-tight">
              Budget & Vendor Payments
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Track vendor contracts, installment advances, and balances due for Jishnu & Swathi's Wedding
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => exportBudgetToCSV(budgetItems, settings)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
              title="Download Full Budget Spreadsheet in CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onAddExpense}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          {/* Target Planned Budget */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Planned Target</span>
              <button
                onClick={() => setIsEditingTarget(!isEditingTarget)}
                className="text-[10px] text-amber-300 hover:underline font-semibold"
              >
                {isEditingTarget ? 'Close' : 'Edit'}
              </button>
            </div>

            {isEditingTarget ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg text-xs bg-slate-900 border border-emerald-400 text-white font-bold"
                />
                <button
                  onClick={handleSaveTarget}
                  className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
                  {settings.currencySymbol}{targetBudget.toLocaleString()}
                </span>
              </div>
            )}
            <span className="text-[11px] text-emerald-200/70 mt-1 block">
              {budgetUtilization}% committed
            </span>
          </div>

          {/* Committed Actual Cost */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-emerald-200 uppercase tracking-wider text-[10px] font-semibold block mb-1">
              Contracted Cost
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                {settings.currencySymbol}{totalActual.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-200/70 mt-1 block">
              {budgetItems.length} vendor items
            </span>
          </div>

          {/* Paid So Far */}
          <div className="p-4 rounded-2xl bg-emerald-800/40 backdrop-blur-md border border-emerald-400/30">
            <span className="text-emerald-300 uppercase tracking-wider text-[10px] font-bold block mb-1">
              Advance Paid
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-200">
                {settings.currencySymbol}{totalPaid.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-300 mt-1 block font-semibold">
              ✓ {paymentProgress}% paid
            </span>
          </div>

          {/* Balance Due */}
          <div className="p-4 rounded-2xl bg-rose-900/40 backdrop-blur-md border border-rose-400/30">
            <span className="text-rose-200 uppercase tracking-wider text-[10px] font-bold block mb-1">
              Total Balance Due
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-300">
                {settings.currencySymbol}{totalBalanceDue.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-rose-200/80 mt-1 block">
              {budgetItems.filter(b => b.paymentStatus !== 'paid').length} payments pending
            </span>
          </div>
        </div>

        {/* Overall Payment Progress Bar */}
        <div className="relative z-10 pt-6 mt-4 border-t border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
            <span>Payment Fulfillment Progress:</span>
            <span>{paymentProgress}% Paid ({settings.currencySymbol}{totalPaid.toLocaleString()} of {settings.currencySymbol}{totalActual.toLocaleString()})</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800/80 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, paymentProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown Chips / Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Expenditure by Wedding Category</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any category to filter items below
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {categoryStats.length} Categories
          </span>
        </div>

        {/* Visual Category Distribution Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          {categoryStats.map((cat, idx) => (
            <div
              key={cat.cat}
              style={{ width: `${cat.percentOfTotal}%` }}
              className={`h-full transition-all cursor-pointer ${
                idx % 4 === 0
                  ? 'bg-emerald-500'
                  : idx % 4 === 1
                  ? 'bg-amber-500'
                  : idx % 4 === 2
                  ? 'bg-rose-500'
                  : 'bg-indigo-500'
              }`}
              title={`${cat.label}: ${settings.currencySymbol}${cat.total.toLocaleString()} (${cat.percentOfTotal}%)`}
              onClick={() => setSelectedCategory(selectedCategory === cat.cat ? 'all' : cat.cat)}
            />
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
          {categoryStats.map((cat) => (
            <button
              key={cat.cat}
              onClick={() => setSelectedCategory(selectedCategory === cat.cat ? 'all' : cat.cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                selectedCategory === cat.cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.cat ? 'bg-emerald-700 text-white' : 'bg-white border text-slate-600'
              }`}>
                {settings.currencySymbol}{(cat.total / 1000).toFixed(0)}k
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Budget Items List & Filter Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-playfair text-slate-900">
                All Wedding Expenses & Vendor Invoices
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {filteredItems.length} of {budgetItems.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage installments, payment methods, due dates, and vendor receipts
            </p>
          </div>

          <button
            onClick={onAddExpense}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense Item</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search expense, vendor, receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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

            {/* Paid By Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Paid By:</span>
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Payers</option>
                {allPayers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="unpaid">🔴 Unpaid</option>
                <option value="partial">🟡 Partial Balance</option>
                <option value="paid">🟢 Fully Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expense Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No expenses found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or add a new expense item to track.
            </p>
            <button
              onClick={onAddExpense}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              + Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredItems.map((item) => {
              const balance = Math.max(0, item.actualCost - item.paidAmount);
              const isPaid = item.paymentStatus === 'paid' || balance === 0;
              const catInfo = EXPENSE_CATEGORIES.find((c) => c.id === item.category);

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 space-y-3 ${
                    isPaid
                      ? 'bg-slate-50/60 border-slate-200/90 opacity-85'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  {/* Row 1: Title, Category Icon, Paid By & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                        {catInfo?.icon || '💰'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.paidAmount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPaid ? '✓ Fully Paid' : item.paidAmount > 0 ? 'Partial Balance' : 'Unpaid'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{catInfo?.label || item.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Paid by: <strong>{item.paidBy}</strong>
                          </span>
                          {item.vendorName && (
                            <>
                              <span>•</span>
                              <span>Vendor: <strong className="text-slate-800">{item.vendorName}</strong></span>
                            </>
                          )}
                          {item.dueDate && !isPaid && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {item.dueDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Record Payment & Edit Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isPaid && (
                        <button
                          onClick={() => onOpenPaymentModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>+ Pay</span>
                        </button>
                      )}

                      {item.vendorPhone && (
                        <a
                          href={`tel:${item.vendorPhone}`}
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title={`Call ${item.vendorName || 'Vendor'}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => onEditExpense(item)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${item.title}"?`)) {
                            onDeleteExpense(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Financial Progress Bar & Figures */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Actual Cost</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {settings.currencySymbol}{item.actualCost.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Advance Paid</span>
                          <span className="font-bold text-emerald-600 text-sm">
                            {settings.currencySymbol}{item.paidAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Balance</span>
                        <span
                          className={`font-bold text-sm ${
                            balance > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-700'
                          }`}
                        >
                          {balance > 0
                            ? `${settings.currencySymbol}${balance.toLocaleString()}`
                            : '✓ Fully Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPaid ? 'bg-emerald-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            item.actualCost > 0 ? Math.round((item.paidAmount / item.actualCost) * 100) : 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Notes / Installments History */}
                  {item.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/40">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
