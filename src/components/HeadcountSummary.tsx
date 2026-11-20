import React from 'react';
import { Users, Moon, Sun, MapPin, ExternalLink, FileSpreadsheet, UserCheck, FolderTree } from 'lucide-react';
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
  // 19 Dec (Bride's Home) Calculations
  const confirmedGuestsNightBefore = guests.filter(g => g.rsvpNightBefore === 'confirmed');
  const totalHeadcountNightBefore = confirmedGuestsNightBefore.reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
  const pendingCountNightBefore = guests.filter(g => g.rsvpNightBefore === 'pending').reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
  const declinedCountNightBefore = guests.filter(g => g.rsvpNightBefore === 'declined').length;

  // 20 Dec (Wedding Day) Calculations
  const confirmedGuestsWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'confirmed');
  const totalHeadcountWeddingDay = confirmedGuestsWeddingDay.reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
  const pendingCountWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'pending').reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
  const declinedCountWeddingDay = guests.filter(g => g.rsvpWeddingDay === 'declined').length;

  // Total Invitations
  const totalInvitations = guests.length;
  const invitationsSentCount = guests.filter(g => g.invitationSent).length;

  // Breakdown by Main Relative / Head (Father, Mother, Jishnu, Swathi, etc.)
  const allHeads = Array.from(new Set([
    ...settings.familyMembers,
    ...guests.map(g => g.invitedBy).filter(Boolean)
  ]));

  const headStats = allHeads.map(headName => {
    const headGuests = guests.filter(g => g.invitedBy === headName);
    const confirmed19 = headGuests
      .filter(g => g.rsvpNightBefore === 'confirmed')
      .reduce((acc, g) => acc + (g.countNightBefore || 1), 0);
    const confirmed20 = headGuests
      .filter(g => g.rsvpWeddingDay === 'confirmed')
      .reduce((acc, g) => acc + (g.countWeddingDay || 1), 0);
    
    // Group sub-categories inside this head (Friends, Coworkers, etc.)
    const categoriesMap: { [cat: string]: { count19: number; count20: number; cards: number } } = {};
    headGuests.forEach(g => {
      const cat = g.category || 'General';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count19: 0, count20: 0, cards: 0 };
      }
      categoriesMap[cat].cards += 1;
      if (g.rsvpNightBefore === 'confirmed') categoriesMap[cat].count19 += (g.countNightBefore || 1);
      if (g.rsvpWeddingDay === 'confirmed') categoriesMap[cat].count20 += (g.countWeddingDay || 1);
    });

    return {
      name: headName,
      totalInvited: headGuests.length,
      confirmed19,
      confirmed20,
      categories: Object.entries(categoriesMap).map(([catName, stats]) => ({
        catName,
        ...stats
      }))
    };
  }).filter(stat => stat.totalInvited > 0);

  return (
    <div className="space-y-6">
      {/* Top 2 Headcount Cards: 20 Dec Wedding vs 19 Dec Bride's Home */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: 20 Dec Wedding Day Confirmed People */}
        <div 
          onClick={() => onSelectRsvpFilter && onSelectRsvpFilter('confirmed_wedding')}
          className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50/40 rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <Sun className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">20 Dec 2026: Wedding Day</h3>
                <a
                  href={settings.weddingMapUrl || 'https://maps.app.goo.gl/GqVMveX52eWPWwGf9'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-rose-700 hover:text-rose-900 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Wedding Hall (Open Map)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
              Main Ceremony
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
              <span className="text-sm font-bold text-emerald-600">{totalHeadcountWeddingDay} heads</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Awaiting / Est.</span>
              <span className="text-sm font-bold text-amber-600">~{pendingCountWeddingDay} heads</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Declined</span>
              <span className="text-sm font-bold text-slate-500">{declinedCountWeddingDay}</span>
            </div>
          </div>
        </div>

        {/* Card 2: 19 Dec Function at Bride's Home */}
        <div 
          onClick={() => onSelectRsvpFilter && onSelectRsvpFilter('confirmed_night')}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50/40 rounded-3xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Moon className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">19 Dec 2026: Function at Bride's Home</h3>
                <a
                  href={settings.nightBeforeMapUrl || 'https://maps.app.goo.gl/kuf1hXdppVXVykks9'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-indigo-700 hover:text-indigo-900 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span>Bride's Home (Open Map)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
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
              <span className="text-sm font-bold text-indigo-600">{totalHeadcountNightBefore} heads</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Awaiting / Est.</span>
              <span className="text-sm font-bold text-amber-600">~{pendingCountNightBefore} heads</span>
            </div>
            <div className="bg-white/80 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Declined</span>
              <span className="text-sm font-bold text-slate-500">{declinedCountNightBefore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Relatives as Head & Sub-Category Headcount Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-rose-600" />
              <span>Head Relatives & Categories Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirmed attendance tallied by Main Relative Head (e.g. Father, Mother, Jishnu, Swathi) and circles (Friends, Coworkers, Relatives)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportGuestsToCSV(guests, settings)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
              title="Download Caterer & Venue Attendance Sheet in CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Head Relative Cards with Nested Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headStats.map((head) => (
            <div
              key={head.name}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-rose-200 hover:shadow-xs transition-all space-y-3"
            >
              <div 
                onClick={() => onSelectInviterFilter && onSelectInviterFilter(head.name)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {head.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-rose-700 block">
                      {head.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {head.totalInvited} cards invited
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-emerald-700 font-bold block">
                    {head.confirmed20} heads (20 Dec)
                  </span>
                  <span className="text-indigo-700 font-semibold block text-[11px]">
                    {head.confirmed19} heads (19 Dec)
                  </span>
                </div>
              </div>

              {/* Nested Sub-categories inside this Head (Friends, Coworkers, etc.) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Categories under {head.name}:
                </span>
                <div className="space-y-1">
                  {head.categories.map((cat) => (
                    <div
                      key={cat.catName}
                      className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700"
                    >
                      <span className="font-medium text-slate-800">
                        {cat.catName} ({cat.cards})
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-indigo-600 font-semibold" title="19 Dec at Bride's Home">
                          🌙 {cat.count19}
                        </span>
                        <span className="text-rose-600 font-bold" title="20 Dec Wedding Day">
                          💍 {cat.count20}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
