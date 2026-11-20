import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PasscodeLockProps {
  onUnlock: () => void;
  correctPasscode?: string;
  groomName?: string;
  brideName?: string;
}

export const PasscodeLock: React.FC<PasscodeLockProps> = ({
  onUnlock,
  correctPasscode = '21772494',
  groomName = 'Jishnu',
  brideName = 'Swathi',
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (passcode.trim() === correctPasscode.trim()) {
      setErrorMsg('');
      if (rememberMe) {
        localStorage.setItem('wedding_auth_token_v1', 'unlocked_21772494');
      } else {
        sessionStorage.setItem('wedding_auth_token_v1', 'unlocked_21772494');
      }
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981'],
      });
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect passcode. Please check with the family.');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (passcode.length < 12) {
      const nextPasscode = passcode + val;
      setPasscode(nextPasscode);
      if (nextPasscode.length === correctPasscode.length) {
        if (nextPasscode === correctPasscode) {
          if (rememberMe) {
            localStorage.setItem('wedding_auth_token_v1', 'unlocked_21772494');
          } else {
            sessionStorage.setItem('wedding_auth_token_v1', 'unlocked_21772494');
          }
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#e11d48', '#f59e0b', '#10b981'],
          });
          onUnlock();
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setPasscode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPasscode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-100/50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Wedding Ring & Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-600/30 mb-1">
            <span className="text-3xl">💍</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-playfair text-slate-900 tracking-tight">
            {groomName} & {brideName}
          </h1>
          <p className="text-xs text-rose-700 font-semibold tracking-wide uppercase">
            Wedding Day Planner & Family Portal
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            This portal contains confidential guest lists, budget details & reminders.
          </p>
        </div>

        {/* Lock Card & Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`space-y-2 ${isShaking ? 'animate-shake' : ''}`}>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              Enter Family Passcode
            </label>

            <div className="relative flex items-center">
              <input
                type={showPasscode ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => {
                  setErrorMsg('');
                  setPasscode(e.target.value);
                }}
                className="w-full text-center text-2xl font-mono tracking-widest py-3 px-12 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/15 transition-all text-slate-900 placeholder:text-slate-300 font-bold"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                title={showPasscode ? 'Hide passcode' : 'Show passcode'}
              >
                {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 text-center animate-in fade-in">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Quick On-Screen Keypad for Touch / Mobile */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num.toString())}
                className="py-3 rounded-xl bg-slate-100 hover:bg-rose-50 active:scale-95 text-slate-800 hover:text-rose-700 font-semibold text-lg font-mono transition-all border border-slate-200/60 shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-medium text-xs uppercase tracking-wider transition-all border border-slate-200/60"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 rounded-xl bg-slate-100 hover:bg-rose-50 active:scale-95 text-slate-800 hover:text-rose-700 font-semibold text-lg font-mono transition-all border border-slate-200/60 shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-medium text-sm transition-all border border-slate-200/60"
              title="Delete last digit"
            >
              ⌫
            </button>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500"
              />
              <span>Remember on this device</span>
            </label>
            <span className="text-[11px] text-slate-400">Encrypted session</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Wedding Portal</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>20 Dec 2026</span>
            <span>•</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Kerala, India</span>
          </p>
        </div>
      </div>
    </div>
  );
};
