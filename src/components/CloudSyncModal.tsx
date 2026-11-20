import React, { useState } from 'react';
import { X, Cloud, RefreshCw, Key, ShieldCheck, Download, Upload, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import { WeddingSettings, FirebaseSyncConfig } from '../types/wedding';
import { exportFullBackup } from '../services/storage';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WeddingSettings;
  onSaveSettings: (settings: WeddingSettings) => void;
  onManualSync: () => Promise<boolean>;
  fullPayload: any;
  onRestoreBackup: (payload: any) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onManualSync,
  fullPayload,
  onRestoreBackup,
}) => {
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(settings.cloudSyncEnabled);
  const [syncRoomCode, setSyncRoomCode] = useState(settings.syncRoomCode || 'WED-FAMILY');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Firebase Config Fields
  const [apiKey, setApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(settings.firebaseConfig?.projectId || '');
  const [appId, setAppId] = useState(settings.firebaseConfig?.appId || '');
  const [jsonConfigInput, setJsonConfigInput] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleParseJsonConfig = () => {
    try {
      const parsed = JSON.parse(jsonConfigInput);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.appId) setAppId(parsed.appId);
      setSyncStatusMsg('Firebase config pasted successfully!');
    } catch (e) {
      alert('Invalid JSON config format. Please paste a valid Firebase configuration object.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const firebaseConfig: FirebaseSyncConfig | undefined = apiKey && projectId
      ? {
          apiKey: apiKey.trim(),
          authDomain: `${projectId.trim()}.firebaseapp.com`,
          projectId: projectId.trim(),
          storageBucket: `${projectId.trim()}.appspot.com`,
          messagingSenderId: '123456789',
          appId: appId.trim() || '1:123456789:web:abcdef',
          syncCode: syncRoomCode.trim(),
        }
      : undefined;

    const updatedSettings: WeddingSettings = {
      ...settings,
      cloudSyncEnabled: cloudSyncEnabled && !!firebaseConfig,
      syncRoomCode: syncRoomCode.trim(),
      firebaseConfig,
    };

    onSaveSettings(updatedSettings);
    onClose();
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const success = await onManualSync();
      if (success) {
        setSyncStatusMsg('Successfully synced to cloud!');
      } else {
        setSyncStatusMsg('Cloud sync skipped: check your Firebase credentials.');
      }
    } catch (err) {
      setSyncStatusMsg('Sync error: please verify internet connection & Firebase rules.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.guests && json.reminders) {
          onRestoreBackup(json);
          alert('Backup restored successfully!');
          onClose();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Cloud Sync & Family Collaboration
              </h3>
              <p className="text-xs text-slate-500">
                Collaborate across family members' phones in real time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
          {/* Family Shared Room Code */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Family Shared Room Code
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-xs text-indigo-700 font-semibold hover:underline"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={syncRoomCode}
                onChange={(e) => setSyncRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. WED-RAHUL-ANJALI"
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white font-mono font-bold text-base text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Share this room code with family members so everyone connects to the same wedding list.
            </p>
          </div>

          {/* Realtime Cloud Sync Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Realtime Cloud Sync</span>
              <span className="text-xs text-slate-500">
                Syncs changes automatically using Firebase Firestore
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cloudSyncEnabled}
                onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Firebase Configuration Credentials */}
          <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Firebase Firestore Settings
              </span>
              <span className="text-[10px] text-slate-400">Optional / Free Tier</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If you have a free Firebase project, paste your credentials here for seamless live sync. You can paste the whole config object:
            </p>

            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder='Paste Firebase JSON config e.g. { "apiKey": "AIza...", "projectId": "my-wedding" }'
                value={jsonConfigInput}
                onChange={(e) => setJsonConfigInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {jsonConfigInput && (
                <button
                  type="button"
                  onClick={handleParseJsonConfig}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-semibold"
                >
                  Apply Pasted Config
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  placeholder="wedding-app-123"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
            </div>

            {settings.cloudSyncEnabled && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleTriggerSync}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now with Cloud'}</span>
              </button>
            )}

            {syncStatusMsg && (
              <p className="text-xs font-semibold text-blue-700 pt-1">
                {syncStatusMsg}
              </p>
            )}
          </div>

          {/* Backup & Offline Portability */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-700 block">Offline Backup & Restore</span>
              <span className="text-[11px] text-slate-500">Export or load your full wedding data anytime</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportFullBackup(fullPayload)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup</span>
              </button>

              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
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
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
            >
              Save Cloud Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
