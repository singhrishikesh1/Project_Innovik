import React from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Activity
} from 'lucide-react';
import { DisasterEvent, IncidentTimelineEvent } from '../types';

interface IncidentDetailsProps {
  disaster: DisasterEvent;
  timeline: IncidentTimelineEvent[];
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({ disaster, timeline }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Incident Master Record
            </span>
            <span className="text-slate-400 text-xs font-mono">{disaster.id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            {disaster.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{disaster.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-700 text-red-300 font-mono text-xs font-bold">
            {disaster.severityClassification}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Detection Timestamp</div>
          <div className="font-mono text-slate-200">{new Date(disaster.detectedTime).toUTCString()}</div>
        </div>
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Current Response Phase</div>
          <div className="font-mono font-bold text-sky-400">{disaster.responseStatus}</div>
        </div>
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Hazard Category</div>
          <div className="font-semibold text-slate-200">{disaster.type}</div>
        </div>
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Historical Analog</div>
          <div className="text-slate-300 truncate" title={disaster.historicalContext}>{disaster.historicalContext}</div>
        </div>
      </div>

      {/* Chronological Event Log (PART 15) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Incident Chronological Event Log</h3>
            <p className="text-xs text-slate-400">Time-stamped audit sequence of environmental alerts and command decisions.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{timeline.length} Recorded Milestones</span>
        </div>

        <div className="space-y-4 relative pl-6 border-l-2 border-slate-800 ml-2">
          {timeline.map((evt, idx) => {
            const isCrit = evt.severity === 'CRITICAL';
            const isWarn = evt.severity === 'WARNING';
            const isSuccess = evt.severity === 'SUCCESS';
            return (
              <div key={evt.id || idx} className="relative space-y-1 text-xs">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-eoc-darker ${
                  isCrit ? 'bg-red-500 ring-2 ring-red-500/20' : isWarn ? 'bg-amber-400' : isSuccess ? 'bg-emerald-400' : 'bg-sky-400'
                }`} />

                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                    <span>{evt.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      isCrit ? 'bg-red-500/20 text-red-300' : isWarn ? 'bg-amber-500/20 text-amber-300' : isSuccess ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{evt.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">Actor: {evt.actor}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
