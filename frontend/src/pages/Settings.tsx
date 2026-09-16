import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Radio,
  Phone,
  CheckCircle2,
  Shield,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(75);
  const [warningThreshold, setWarningThreshold] = useState<number>(60);
  const [sirenAudible, setSirenAudible] = useState<boolean>(true);
  const [agencyName, setAgencyName] = useState<string>('Uttarakhand State Disaster Management Authority (USDMA)');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100 max-w-4xl">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              System Settings
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Operational Settings & Agency Configurations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure risk thresholds, emergency agency identification, and dissemination triggers.
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Thresholds Card */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            VajraWatch Prediction Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                Critical Hazard Siren Trigger Score (0-100)
              </label>
              <input
                type="number"
                min="50"
                max="95"
                value={criticalThreshold}
                onChange={e => setCriticalThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 75/100</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Elevated Watch Threshold Score (0-100)
              </label>
              <input
                type="number"
                min="30"
                max="70"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 60/100</span>
            </div>
          </div>
        </div>

        {/* Agency Config */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            Designated Government Agency Entity
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Primary Agency Authority Title</label>
              <input
                type="text"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="sirenToggle"
                checked={sirenAudible}
                onChange={e => setSirenAudible(e.target.checked)}
                className="rounded bg-slate-700 border-slate-600 text-sky-500 cursor-pointer"
              />
              <label htmlFor="sirenToggle" className="text-xs text-slate-300 cursor-pointer">
                Enable audible browser siren sound when Critical Alert escalates
              </label>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Hotlines */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            State Emergency Contact Hotlines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">State Emergency Ops (SEOC)</div>
              <div className="font-mono font-bold text-sky-400 text-sm">1070 / 0135-2710334</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">District Disaster Control (Chamoli)</div>
              <div className="font-mono font-bold text-amber-300 text-sm">1077 / 01372-251437</div>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">NDRF 8th Battalion HQ</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">0120-2766014</div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Agency Configurations</span>
        </button>
      </form>
    </div>
  );
};
