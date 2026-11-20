import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Heart, Calendar, MapPin, Users, Plus, Trash2, Camera, Upload, Link as LinkIcon, Sparkles } from 'lucide-react';
import { WeddingSettings } from '../types/wedding';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WeddingSettings;
  onSave: (settings: WeddingSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [groomName, setGroomName] = useState(settings.groomName);
  const [brideName, setBrideName] = useState(settings.brideName);
  const [profilePicture, setProfilePicture] = useState(settings.profilePicture || '');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [weddingDate, setWeddingDate] = useState(settings.weddingDate.substring(0, 16));
  const [nightBeforeDate, setNightBeforeDate] = useState(settings.nightBeforeDate.substring(0, 16));
  const [weddingVenue, setWeddingVenue] = useState(settings.weddingVenue);
  const [weddingMapUrl, setWeddingMapUrl] = useState(settings.weddingMapUrl || 'https://maps.app.goo.gl/GqVMveX52eWPWwGf9');
  const [nightBeforeVenue, setNightBeforeVenue] = useState(settings.nightBeforeVenue);
  const [nightBeforeMapUrl, setNightBeforeMapUrl] = useState(settings.nightBeforeMapUrl || 'https://maps.app.goo.gl/kuf1hXdppVXVykks9');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [familyMembers, setFamilyMembers] = useState<string[]>([...settings.familyMembers]);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGroomName(settings.groomName);
      setBrideName(settings.brideName);
      setProfilePicture(settings.profilePicture || '');
      setWeddingDate(settings.weddingDate.substring(0, 16));
      setNightBeforeDate(settings.nightBeforeDate.substring(0, 16));
      setWeddingVenue(settings.weddingVenue);
      setWeddingMapUrl(settings.weddingMapUrl || 'https://maps.app.goo.gl/GqVMveX52eWPWwGf9');
      setNightBeforeVenue(settings.nightBeforeVenue);
      setNightBeforeMapUrl(settings.nightBeforeMapUrl || 'https://maps.app.goo.gl/kuf1hXdppVXVykks9');
      setCurrencySymbol(settings.currencySymbol || '₹');
      setFamilyMembers([...settings.familyMembers]);
    }
  }, [isOpen, settings.profilePicture]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSuccessMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setProfilePicture(dataUrl);

          // Auto-save immediately to settings and trigger real-time sync across all areas
          onSave({
            ...settings,
            profilePicture: dataUrl,
          });
          setSuccessMsg('✓ Photo uploaded & updated everywhere!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('Could not decode this image. Please select a JPG, PNG, or WEBP photo.');
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      const newUrl = imageUrlInput.trim();
      setProfilePicture(newUrl);
      setImageUrlInput('');
      setShowUrlInput(false);
      onSave({
        ...settings,
        profilePicture: newUrl,
      });
      setSuccessMsg('✓ Photo updated everywhere!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture('');
    onSave({
      ...settings,
      profilePicture: '',
    });
    setSuccessMsg('✓ Photo removed. Default monogram restored.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddMember = () => {
    if (newMemberName.trim() && !familyMembers.includes(newMemberName.trim())) {
      setFamilyMembers([...familyMembers, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (indexToRemove: number) => {
    setFamilyMembers(familyMembers.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) return;

    onSave({
      ...settings,
      groomName: groomName.trim(),
      brideName: brideName.trim(),
      profilePicture: profilePicture.trim(),
      weddingDate: new Date(weddingDate).toISOString(),
      nightBeforeDate: new Date(nightBeforeDate).toISOString(),
      weddingVenue: weddingVenue.trim(),
      weddingMapUrl: weddingMapUrl.trim(),
      nightBeforeVenue: nightBeforeVenue.trim(),
      nightBeforeMapUrl: nightBeforeMapUrl.trim(),
      currencySymbol: currencySymbol.trim() || '₹',
      familyMembers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Wedding Settings & Details</h3>
              <p className="text-xs text-slate-500">Customize couple names, event dates, venues and host family list</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Couple Profile Picture Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50/70 via-amber-50/40 to-rose-50/70 border border-rose-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Avatar Preview */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-300 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-white shadow-inner">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Couple Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-600 to-amber-600 text-white font-playfair font-bold text-xl sm:text-2xl">
                        <span>{groomName[0] || 'J'} & {brideName[0] || 'S'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 border-2 border-white"
                  title="Upload New Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Couple Profile Picture</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Replaces the avatar on the home countdown banner, header & lock screen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {/* File Upload Input with automated iOS/Mac JPEG conversion format accept */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Saving...' : 'Upload from Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showUrlInput ? 'Hide URL' : 'Paste Image URL'}</span>
                  </button>

                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-100/60 text-xs font-semibold transition-colors"
                      title="Reset to default initials monogram"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {successMsg && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
                    <span>✨</span>
                    <span>{successMsg}</span>
                  </div>
                )}

                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Groom's Name *
              </label>
              <input
                type="text"
                required
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bride's Name *
              </label>
              <input
                type="text"
                required
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Event Dates & Timings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              📅 Event Dates & Timings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Wedding Day Date & Muhurtham
                </label>
                <input
                  type="datetime-local"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Night Before Eve Celebration Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={nightBeforeDate}
                  onChange={(e) => setNightBeforeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Venues */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                💍 20 Dec Wedding Ceremony & Lunch Venue
              </label>
              <input
                type="text"
                required
                value={weddingVenue}
                onChange={(e) => setWeddingVenue(e.target.value)}
                placeholder="e.g. Wedding Hall (Main Ceremony)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-medium"
              />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Google Maps Location Link:</span>
                </label>
                <input
                  type="url"
                  value={weddingMapUrl}
                  onChange={(e) => setWeddingMapUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                🌙 19 Dec Pre-Wedding Celebration Venue
              </label>
              <input
                type="text"
                required
                value={nightBeforeVenue}
                onChange={(e) => setNightBeforeVenue(e.target.value)}
                placeholder="e.g. Bride's Home (19 Dec Function)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-medium"
              />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span>Google Maps Location Link:</span>
                </label>
                <input
                  type="url"
                  value={nightBeforeMapUrl}
                  onChange={(e) => setNightBeforeMapUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-mono text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-24 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-center"
            />
          </div>

          {/* Host Family Members List */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-rose-950 uppercase tracking-wider">
                👥 Family Host Member List
              </span>
              <span className="text-[11px] text-rose-700">
                Used to filter & group guest invitations
              </span>
            </div>

            {/* List of current members */}
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-200 text-xs font-medium text-slate-800 shadow-xs"
                >
                  <span>{member}</span>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add new member */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add family member (e.g. Uncle Ramesh, Elder Sister)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
