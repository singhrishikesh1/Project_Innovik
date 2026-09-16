import React, { useState } from 'react';
import {
  AlertOctagon,
  Bell,
  Volume2,
  Mail,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  FileCheck
} from 'lucide-react';
import { DisasterEvent, RiskAssessment, SkepticVerification } from '../types';
import { api, getOperatorIdentity } from '../services/api';

interface EarlyWarningCenterProps {
  disaster: DisasterEvent;
  risk: RiskAssessment;
  skeptic: SkepticVerification;
  onAlertUpdated: () => void;
}

export const EarlyWarningCenter: React.FC<EarlyWarningCenterProps> = ({
  disaster,
  risk,
  skeptic,
  onAlertUpdated
}) => {
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([
    '06:45:00 UTC - Automated Push notification packet queued for 14,200 devices (Simulated)',
    '06:45:15 UTC - District Civil Siren Relay activated in Chamoli and Pipalkoti sectors',
    '06:45:30 UTC - VHF Emergency Radio broadcast launched on 154.250 MHz'
  ]);

  const currentRole = getOperatorIdentity().role;
  const canApprove = currentRole === 'ADMIN' || currentRole === 'DISASTER_MANAGER';

  const handleApprove = async () => {
    setIsBroadcasting(true);
    try {
      await api.approveAlert();
      setIsApproved(true);
      setBroadcastLog(prev => [
        `${new Date().toLocaleTimeString()} UTC - Official Warning broadcast approved by ${getOperatorIdentity().user}`,
        ...prev
      ]);
      setShowConfirmModal(false);
      onAlertUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error approving alert');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const playLocalVoiceAlert = (lang: 'hi' | 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text =
        lang === 'hi'
          ? `अलकनंदा नदी बेसिन में गंभीर बाढ़ चेतावनी। सभी निवासी तुरंत नदी तट से दूर सुरक्षित आश्रय स्थलों पर पहुंचें।`
          : `Emergency Alert: Alaknanda river basin flood warning. All riverside residents must immediately evacuate to designated higher-ground shelters.`;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase">
              Early Warning Operations Hub
            </span>
            <span className="text-slate-400 text-xs font-mono">Multi-Channel Dissemination</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Emergency Public Warning & Authority Escalation Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational warning generation with multi-channel simulation and district magistrate authorization protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
            isApproved ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-amber-950/80 border-amber-600 text-amber-300'
          }`}>
            <FileCheck className="w-4 h-4" />
            <span>Status: {isApproved ? 'AUTHORIZED BY DM' : 'PENDING APPROVAL'}</span>
          </div>
        </div>
      </div>

      {/* Main Alert Specification Card */}
      <div className="bg-eoc-darker rounded-xl border border-red-800/60 p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider">
                CRITICAL WARNING BULLETIN #UK-082
              </div>
              <h2 className="text-base font-bold text-slate-100">{disaster.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
              Score: <b className="text-red-400">{risk.score}/100</b>
            </span>
            <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300">
              Confidence: <b className="text-sky-400">{(risk.confidence * 100).toFixed(0)}%</b>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Affected Corridor</div>
            <div className="font-semibold text-slate-200">{disaster.affectedRegion}</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Population at Risk</div>
            <div className="font-mono font-bold text-amber-300 text-sm">{disaster.affectedPopulation.toLocaleString()} Residents</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Evacuation Mandate</div>
            <div className="font-bold text-red-400 flex items-center gap-1">
              <span>MANDATORY HIGH-GROUND</span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Estimated Lead Time</div>
            <div className="font-mono font-bold text-sky-400 text-sm">~{risk.targetLeadTimeHours} Hours (Target)</div>
          </div>
        </div>

        {/* Evidence & Verification Summary */}
        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>Supporting Sensor Evidence & Cross-Validation</span>
            <span className="text-[10px] text-emerald-400 font-mono">Skeptic Verified</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            {risk.contributingFactors.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Skeptic Agent finding: <span className="text-emerald-400">{skeptic.challengeNotes}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playLocalVoiceAlert('hi')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Play Hindi Siren Alert</span>
            </button>
            <button
              onClick={() => playLocalVoiceAlert('en')}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Play English Audio Alert</span>
            </button>
          </div>

          <div>
            {!isApproved ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!canApprove}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize & Broadcast Emergency Alert</span>
              </button>
            ) : (
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorized by District Magistrate Chamoli</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Channel Distribution Matrix (PART 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Civil Sirens & Public Address',
            icon: Radio,
            status: 'TRANSMITTING',
            color: 'text-red-400',
            border: 'border-red-800/40',
            desc: 'Acoustic sirens active across 4 low-lying wards (Chamoli, Birahi, Helang, Pipalkoti).'
          },
          {
            title: 'Cellular Push Notification',
            icon: Smartphone,
            status: 'SIMULATED DISPATCH',
            color: 'text-amber-400',
            border: 'border-amber-800/40',
            desc: 'Geo-targeted CAP (Common Alerting Protocol) simulated across 14,200 handsets.'
          },
          {
            title: 'Bulk SMS Gateway',
            icon: MessageSquare,
            status: 'SIMULATED QUEUE',
            color: 'text-amber-400',
            border: 'border-amber-800/40',
            desc: 'Emergency SMS burst queued via BSNL / Jio state disaster priority pipeline.'
          },
          {
            title: 'Agency Emergency Email',
            icon: Mail,
            status: 'SIMULATED RELAY',
            color: 'text-sky-400',
            border: 'border-sky-800/40',
            desc: 'Inter-agency flash bulletins transmitted to NDRF, SDRF, Army, and CMO HQ.'
          }
        ].map(ch => {
          const Icon = ch.icon;
          return (
            <div key={ch.title} className={`bg-eoc-darker p-4 rounded-xl border ${ch.border} space-y-2 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <Icon className={`w-4 h-4 ${ch.color}`} />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {ch.status}
                  </span>
                </div>
                <div className="font-bold text-slate-200 text-xs mt-2">{ch.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{ch.desc}</div>
              </div>
              <div className="text-[10px] text-amber-300 font-mono pt-2 border-t border-slate-800/60">
                *Demo / Simulated Gateway
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Telemetry Log */}
      <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Alert Dissemination Audit Log</span>
          <span className="text-[10px] font-mono text-slate-500">Live Socket Feed</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1 max-h-36 overflow-y-auto">
          {broadcastLog.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sky-500">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-darker border border-red-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div className="text-sm font-bold text-slate-100">CONFIRM EMERGENCY BROADCAST</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to issue a <b>CRITICAL PUBLIC WARNING</b> to <b>14,200 residents</b> in the Chamoli Alaknanda basin. This will activate physical sirens, SMS broadcasts, and evacuation directives.
            </p>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
              Authorized Operator: <b className="text-slate-200">{getOperatorIdentity().user}</b> ({getOperatorIdentity().role})
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isBroadcasting}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                {isBroadcasting ? 'Broadcasting...' : 'Confirm Authorization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
