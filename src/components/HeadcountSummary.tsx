import React from 'react';
import { Users, Moon, Sun, CheckCircle2, Clock, XCircle, FileSpreadsheet, UserCheck, ChevronRight } from 'lucide-react';
import { Guest, WeddingSettings } from '../types/wedding';
import { exportGuestsToCSV } from '../services/storage';

interface HeadcountSummaryProps {
  guests: Guest[];
  settings: WeddingSettings;
  onSelectInviterFilter?: (inviter: string) => void;
  onSelectRsvpFilter?: (filter: 'confirmed_night' | 'confirmed_wedding' | 'pending') => void;
}

export const HeadcountSummary: React.FC<HeadcountSummaryProps> = ({
  guests,
  settings,
  onSelectInviterFilter,
  onSelectRsvpFilter
}) => {
  // Night Before Calculations
  const confirmedGuestsNightBefore = guests.filter(g => g.rsvpNightBefore === 'confirmed');
  const totalHeadcountNightBefore = confirmedGuestsNightBefore.reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
  const pendingCountNightBefore = guests.filter(g => g.rsvpNightBefore === 'pending').reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
  const declinedCountNightBefore = guests.filter(g => g.rsvpNightBefore === 'declined').length;

  // Wedding Day Calculations
  const confirmedGuestsWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'confirmed');
  const totalHeadcountWeddingDay = confirmedGuestsWeddingDay.reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
  const pendingCountWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'pending').reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
  const declinedCountWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'declined').length;

  // Total Invitations
  const totalInvitations = guests.length;
  const invitationsSentCount = guests.filter(g => g.invitationSent).length;

  // Breakdown by Family Member / Inviter
  const inviterStats = settings.familyMembers.map(member => {
    const memberGuests = guests.filter(g => g.invitedBy === member);
    const confirmedNight = memberGuests
      .filter(g => g.rsvpNightBefore === 'confirmed')
      .reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
    const confirmedWedding = memberGuests
      .filter(g => g.rsvpWeddingDay === 'confirmed')
      .reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
    const totalInvited = memberGuests.length;

    return {
      name: member,
      totalInvited,
      confirmedNight,
      confirmedWedding,
    };
  }).filter(stat => stat.totalInvited > 0);

  // Also include any custom inviters not in default settings.familyMembers
  const otherInviters = Array.from(new Set(
    guests
      .map(g => g.invitedBy)
      .filter(inv => inv && !settings.familyMembers.includes(inv))
  ));

  otherInviters.forEach(member => {
    const memberGuests = guests.filter(g => g.invitedBy === member);
    const confirmedNight = memberGuests
      .filter(g => g.rsvpNightBefore === 'confirmed')
      .reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
    const confirmedWedding = memberGuests
      .filter(g => g.rsvpWeddingDay === 'confirmed')
      .reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
    
    inviterStats.push({
      name: member,
      totalInvited: memberGuests.length,
      confirmedNight,
      confirmedWedding,
    });
  });

  return (
    <div className="space-y-6">
      {/* Top 2 Headcount Highlight Cards: Wedding Day vs Night Before */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Main Wedding Day Confirmed People */}
        <div 
          onClick={() => onSelectRsvpFilter && onSelectRsvpFilter('confirmed_wedding')}
          className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50/40 rounded-2xl p-5 sm:p-6 border border-rose-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <Sun className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Wedding Day</h3>
                <p className="text-xs text-slate-500 font-medium">Muhurtham Ceremony & Grand Lunch</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
              Main Event
            </span>
          </div>

          <div className="pt-4 flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-rose-900">Total Confirmed People</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-rose-600 font-playfair tracking-tight">
                  {totalHeadcountWeddingDay}
                </span>
                <span className="text-sm font-medium text-slate-500">attending heads</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {confirmedGuestsWeddingDay.length} cards confirmed
              </span>
            </div>
          </div>

          {/* Sub Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 text-xs text-center">
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed</span>
              <span className="text-sm font-bold text-emerald-600">{totalHeadcountWeddingDay}</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Awaiting / Est.</span>
              <span className="text-sm font-bold text-amber-600">~{pendingCountWeddingDay}</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Declined</span>
              <span className="text-sm font-bold text-slate-500">{declinedCountWeddingDay}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Night Before Wedding Confirmed People */}
        <div 
          onClick={() => onSelectRsvpFilter && onSelectRsvpFilter('confirmed_night')}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50/40 rounded-2xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Moon className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Night Before Wedding</h3>
                <p className="text-xs text-slate-500 font-medium">Sangeet, Ring Ceremony & Dinner</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">
              Eve Celebration
            </span>
          </div>

          <div className="pt-4 flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-900">Total Confirmed People</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 font-playfair tracking-tight">
                  {totalHeadcountNightBefore}
                </span>
                <span className="text-sm font-medium text-slate-500">attending heads</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {confirmedGuestsNightBefore.length} cards confirmed
              </span>
            </div>
          </div>

          {/* Sub Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 text-xs text-center">
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed</span>
              <span className="text-sm font-bold text-indigo-600">{totalHeadcountNightBefore}</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Awaiting / Est.</span>
              <span className="text-sm font-bold text-amber-600">~{pendingCountNightBefore}</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Declined</span>
              <span className="text-sm font-bold text-slate-500">{declinedCountNightBefore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Family Member / Host List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Guest Counts by Family Member List</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of how many guests are invited & confirmed per family host
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
              Total Cards: <strong className="text-slate-900">{totalInvitations}</strong> ({invitationsSentCount} sent)
            </span>
            <button
              onClick={() => exportGuestsToCSV(guests, settings)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
              title="Download Caterer & Venue Attendance Sheet in CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* List of Member Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {inviterStats.map((stat) => (
            <div
              key={stat.name}
              onClick={() => onSelectInviterFilter && onSelectInviterFilter(stat.name)}
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-rose-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                  {stat.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {stat.totalInvited} cards
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1 text-slate-600">
                  <Moon className="w-3 h-3 text-indigo-500" />
                  <span>Night Before:</span>
                  <span className="font-bold text-indigo-700">{stat.confirmedNight} heads</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Sun className="w-3 h-3 text-rose-500" />
                  <span>Wedding Day:</span>
                  <span className="font-bold text-rose-700">{stat.confirmedWedding} heads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
