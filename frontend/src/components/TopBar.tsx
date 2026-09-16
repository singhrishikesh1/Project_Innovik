import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, Volume2, Clock, CheckCircle } from 'lucide-react';
import { DisasterSeverity, UserRole } from '../types';
import { setOperatorIdentity, getOperatorIdentity } from '../services/api';

interface TopBarProps {
  disasterName: string;
  location: string;
  severity: DisasterSeverity;
  riskScore: number;
  affectedPopulation: number;
  onRoleChanged: () => void;
}

const severityConfig: Record<DisasterSeverity, { label: string; bg: string; text: string; border: string }> = {
  NORMAL: { label: 'NORMAL', bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-700/60' },
  WATCH: { label: 'WATCH', bg: 'bg-blue-950/80', text: 'text-blue-400', border: 'border-blue-700/60' },
  ELEVATED: { label: 'ELEVATED', bg: 'bg-yellow-950/80', text: 'text-yellow-400', border: 'border-yellow-700/60' },
  HIGH_RISK: { label: 'HIGH RISK', bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/60' },
  CRITICAL: { label: 'CRITICAL', bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-700/60' },
  WARNING: { label: 'PUBLIC WARNING', bg: 'bg-red-950/90', text: 'text-red-400', border: 'border-red-600' },
  DISASTER_CONFIRMED: { label: 'DISASTER CONFIRMED', bg: 'bg-red-950', text: 'text-red-300', border: 'border-red-500' }
};

export const TopBar: React.FC<TopBarProps> = ({
  disasterName,
  location,
  severity,
  riskScore,
  affectedPopulation,
  onRoleChanged
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(getOperatorIdentity().role);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [voicePlaying, setVoicePlaying] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setOperatorIdentity(role, `${role.replace('_', ' ')} Operator`);
    onRoleChanged();
  };

  const playVoiceAlert = (language: 'hi' | 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text =
        language === 'hi'
          ? `चेतावनी: चमोली अलकनंदा बेसिन में जल स्तर खतरे के निशान से ऊपर पहुंच गया है। सभी नागरिक तुरंत सुरक्षित उच्च स्थानों और राहत शिविरों की ओर जाएं।`
          : `Critical Warning: Flood stage alert in Chamoli Alaknanda basin. River level has breached critical danger mark. Immediate evacuation to designated high-ground shelters is advised.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setVoicePlaying(true);
      utterance.onend = () => setVoicePlaying(false);
      utterance.onerror = () => setVoicePlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const sev = severityConfig[severity] || severityConfig.NORMAL;

  return (
    <header className="bg-eoc-darkest border-b border-eoc-border px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-50">
      {/* Brand & Incident */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500/10 border border-sky-500/30 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>VAJRASHIELD</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-800 text-sky-400 rounded border border-slate-700">
                EOC v2.4
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">STATE DISASTER COMMAND & CONTROL</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Active Incident Summary */}
        <div className="hidden md:flex flex-col">
          <div className="font-bold text-slate-200 truncate max-w-sm">{disasterName}</div>
          <div className="text-[11px] text-slate-400 truncate">{location}</div>
        </div>
      </div>

      {/* Center Severity & Risk Gauge */}
      <div className="flex items-center gap-2">
        {/* Severity Banner */}
        <div className={`px-2.5 py-1 rounded-md border font-bold uppercase tracking-wider flex items-center gap-1.5 ${sev.bg} ${sev.text} ${sev.border}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{sev.label}</span>
        </div>

        {/* Numerical Deterministic Risk Score */}
        <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">VajraWatch Index:</span>
          <span className={`font-mono font-extrabold text-sm ${riskScore > 75 ? 'text-red-400' : riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {riskScore.toFixed(1)}/100
          </span>
        </div>

        {/* Affected Population */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">At Risk:</span>
          <span className="font-mono font-bold text-slate-200">{affectedPopulation.toLocaleString()}</span>
        </div>
      </div>

      {/* Right Controls: Role, Voice, Clock */}
      <div className="flex items-center gap-2.5">
        {/* Voice Alert (Hindi / English) */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md">
          <button
            onClick={() => playVoiceAlert('hi')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-amber-300 transition-colors"
            title="Play Local Language Voice Alert (Hindi)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">हिंदी</span>
          </button>
          <div className="h-3 w-px bg-slate-700" />
          <button
            onClick={() => playVoiceAlert('en')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-sky-300 transition-colors"
            title="Play Emergency Audio Alert (English)"
          >
            <span className="font-semibold text-[11px]">ENG</span>
          </button>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
          <span className="text-slate-400 text-[11px] hidden xl:inline">Role:</span>
          <select
            value={currentRole}
            onChange={e => handleRoleChange(e.target.value as UserRole)}
            className="bg-transparent text-sky-400 font-semibold text-xs outline-none cursor-pointer"
          >
            <option value="DISASTER_MANAGER" className="bg-slate-900 text-white">Disaster Manager</option>
            <option value="ADMIN" className="bg-slate-900 text-white">State Admin</option>
            <option value="FIELD_COORDINATOR" className="bg-slate-900 text-white">Field Coordinator</option>
            <option value="RESOURCE_MANAGER" className="bg-slate-900 text-white">Resource Manager</option>
            <option value="MEDICAL_COORDINATOR" className="bg-slate-900 text-white">Medical Coordinator</option>
            <option value="LOGISTICS_COORDINATOR" className="bg-slate-900 text-white">Logistics Coordinator</option>
            <option value="ANALYST" className="bg-slate-900 text-white">Data Analyst</option>
            <option value="VIEWER" className="bg-slate-900 text-white">Viewer</option>
          </select>
        </div>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTime}</span>
        </div>
      </div>
    </header>
  );
};
