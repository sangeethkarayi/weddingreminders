import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, MapPin } from 'lucide-react';
import { WeddingSettings } from '../types/wedding';

interface CountdownTimerProps {
  settings: WeddingSettings;
  onOpenSettings: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ settings, onOpenSettings }) => {
  const [activeTarget, setActiveTarget] = useState<'wedding' | 'night_before'>('wedding');

  const calculateTimeLeft = (targetIso: string): TimeLeft => {
    const diff = new Date(targetIso).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(activeTarget === 'wedding' ? settings.weddingDate : settings.nightBeforeDate)
  );

  useEffect(() => {
    const target = activeTarget === 'wedding' ? settings.weddingDate : settings.nightBeforeDate;
    setTimeLeft(calculateTimeLeft(target));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTarget, settings.weddingDate, settings.nightBeforeDate]);

  const weddingDateFormatted = new Date(settings.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const nightBeforeFormatted = new Date(settings.nightBeforeDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950 text-white shadow-xl p-6 sm:p-8 border border-rose-700/50">
      {/* Decorative floral/golden glow background elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Wedding Title & Venue info */}
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-700/60 border border-rose-500/30 text-rose-200 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>The Wedding Celebration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold tracking-tight text-white">
            {settings.groomName} <span className="font-cursive text-amber-300 text-4xl sm:text-5xl font-normal">&</span> {settings.brideName}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-rose-200 text-sm pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{activeTarget === 'wedding' ? weddingDateFormatted : nightBeforeFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5 max-w-xs truncate" title={activeTarget === 'wedding' ? settings.weddingVenue : settings.nightBeforeVenue}>
              <MapPin className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="truncate">{activeTarget === 'wedding' ? settings.weddingVenue : settings.nightBeforeVenue}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Switcher + Countdown Boxes */}
        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          {/* Target Event Switcher */}
          <div className="bg-rose-950/60 p-1 rounded-xl border border-rose-700/40 flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveTarget('night_before')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTarget === 'night_before'
                  ? 'bg-amber-400 text-rose-950 font-semibold shadow-sm'
                  : 'text-rose-200 hover:text-white'
              }`}
            >
              🌙 Night Before
            </button>
            <button
              onClick={() => setActiveTarget('wedding')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTarget === 'wedding'
                  ? 'bg-amber-400 text-rose-950 font-semibold shadow-sm'
                  : 'text-rose-200 hover:text-white'
              }`}
            >
              💍 Wedding Day
            </button>
          </div>

          {/* Countdown Numbers */}
          {timeLeft.isPast ? (
            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <p className="text-xl font-bold text-amber-300 font-playfair">It's Wedding Time! 🎉</p>
              <p className="text-xs text-rose-200 mt-0.5">Cherishing every moment of love</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase tracking-wider font-medium mt-0.5">
                  Days
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase tracking-wider font-medium mt-0.5">
                  Hours
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase tracking-wider font-medium mt-0.5">
                  Mins
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 tracking-tight">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-rose-200 uppercase tracking-wider font-medium mt-0.5">
                  Secs
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
