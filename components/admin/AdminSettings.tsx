import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  ShieldAlert, 
  Globe, 
  CheckCircle2 
} from 'lucide-react';
import { User, PlatformSettings } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';

interface AdminSettingsProps {
  currentUser: User;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<PlatformSettings>(storage.getPlatformSettings());
  const [isSaving, setIsSaving] = useState(false);
  const { success, info } = useToast();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      storage.savePlatformSettings(settings);

      storage.addAuditLog({
        actorId: currentUser.id,
        actorUsername: currentUser.username,
        action: 'PLATFORM_SETTINGS_UPDATED',
        entity: 'PlatformSettings',
        entityId: 'global-settings',
        newState: settings,
        notes: 'Admin updated global platform configuration & public metrics',
      });

      success('Settings Saved', 'Platform parameters and public display metrics updated.');
    }, 450);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean initial state?')) {
      storage.resetAllData();
      info('Data Reset', 'Platform data re-initialized.');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-amber-400" />
            Platform & Governance Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global public metrics, institutional communication channels, and environment parameters.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleResetData}
          leftIcon={<RotateCcw className="w-4 h-4 text-rose-400" />}
          className="bg-rose-950/30 border-rose-800 text-rose-300 hover:bg-rose-900 text-xs"
        >
          Reset Demo Data
        </Button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Public Identity & Contacts */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Public Brand & Investor Contact Channels</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name"
              value={settings.platformName}
              onChange={e => setSettings({ ...settings, platformName: e.target.value })}
              required
            />

            <Input
              label="Support Desk Email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telegram VIP Broadcast Channel"
              value={settings.telegramChannel}
              onChange={e => setSettings({ ...settings, telegramChannel: e.target.value })}
              required
            />

            <Input
              label="Institutional Address"
              value={settings.companyAddress}
              onChange={e => setSettings({ ...settings, companyAddress: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Public Landing Metrics Customizer */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Landing Page Showcase Metrics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Active Investors Display"
              value={settings.statsActiveInvestors}
              onChange={e => setSettings({ ...settings, statsActiveInvestors: e.target.value })}
              required
            />

            <Input
              label="Total Deposits Display"
              value={settings.statsTotalDeposited}
              onChange={e => setSettings({ ...settings, statsTotalDeposited: e.target.value })}
              required
            />

            <Input
              label="Total Paid Out Display"
              value={settings.statsTotalWithdrawn}
              onChange={e => setSettings({ ...settings, statsTotalWithdrawn: e.target.value })}
              required
            />

            <Input
              label="Countries Display"
              value={settings.statsCountriesSupported}
              onChange={e => setSettings({ ...settings, statsCountriesSupported: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Operational Guardrails */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Operational Modes</h3>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isMaintenanceMode}
                onChange={e => setSettings({ ...settings, isMaintenanceMode: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <span>Platform Maintenance Mode (Suspend New User Deposits)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20"
          >
            Save All Platform Settings
          </Button>
        </div>

      </form>

    </div>
  );
};
