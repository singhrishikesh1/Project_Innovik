import React from 'react';
import {
  Radio,
  Activity,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const SensorMonitoring: React.FC = () => {
  const sensors = [
    {
      id: 'HYDRO-ALAK-08',
      name: 'CWC Telemetry Gauge Station 08-ALAK',
      location: 'Chamoli Bridge Gauge Point',
      type: 'Hydrological River Stage',
      currentValue: '4.6 m',
      dangerThreshold: '4.2 m',
      warningThreshold: '3.8 m',
      status: 'CRITICAL',
      lastBurst: '12 seconds ago',
      trend: '+0.4m in 60 mins',
      battery: '98% (Solar)',
      signalQuality: '100% (4G Telemetry)'
    },
    {
      id: 'HYDRO-NAND-09',
      name: 'CWC Hydrological Station 09-NAND',
      location: 'Nandaprayag Confluence',
      type: 'Hydrological River Stage',
      currentValue: '3.8 m',
      dangerThreshold: '4.5 m',
      warningThreshold: '3.6 m',
      status: 'WARNING',
      lastBurst: '30 seconds ago',
      trend: '+0.2m in 60 mins',
      battery: '100% (Solar)',
      signalQuality: '96% (VHF Mesh)'
    },
    {
      id: 'AWS-RAIN-PIPAL',
      name: 'IMD Automatic Weather Station AWS-04',
      location: 'Pipalkoti Hill Base',
      type: 'Precipitation Rain Gauge',
      currentValue: '48 mm/hr',
      dangerThreshold: '40 mm/hr',
      warningThreshold: '25 mm/hr',
      status: 'CRITICAL',
      lastBurst: '1 minute ago',
      trend: 'Convective cloudburst peak',
      battery: '94%',
      signalQuality: '98% (IMD SatLink)'
    },
    {
      id: 'SEISMIC-JOSH-01',
      name: 'National Center for Seismology Broadband Array',
      location: 'Joshimath Hard Rock Outpost',
      type: 'Triaxial Seismograph PGA',
      currentValue: '0.04 g',
      dangerThreshold: '0.15 g',
      warningThreshold: '0.08 g',
      status: 'NORMAL',
      lastBurst: 'Live Stream (100 Hz)',
      trend: 'Micro-tremor baseline',
      battery: '100%',
      signalQuality: '100% (Optical Fiber)'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold uppercase">
              IoT Sensor Network
            </span>
            <span className="text-slate-400 text-xs font-mono">Continuous Telemetry Streams</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Real-Time Hydrological & Meteorological Ground Gauges
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Low-latency telemetry ingested directly from Central Water Commission (CWC) and India Meteorological Department (IMD) field sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>4 / 4 Telemetry Nodes Online</span>
          </span>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sensors.map(s => {
          const isCrit = s.status === 'CRITICAL';
          const isWarn = s.status === 'WARNING';
          return (
            <div
              key={s.id}
              className={`bg-eoc-darker p-5 rounded-xl border space-y-3 shadow-lg ${
                isCrit
                  ? 'border-red-600 ring-1 ring-red-500/20'
                  : isWarn
                  ? 'border-amber-600/80'
                  : 'border-eoc-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  {s.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  isCrit
                    ? 'bg-red-500/20 text-red-300'
                    : isWarn
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {s.status}
                </span>
              </div>

              <div>
                <div className="font-bold text-slate-100 text-sm">{s.name}</div>
                <div className="text-[11px] text-slate-400">{s.location} — {s.type}</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Current Reading:</span>
                  <span className={`font-mono font-extrabold text-2xl ${
                    isCrit ? 'text-red-400' : isWarn ? 'text-amber-300' : 'text-emerald-400'
                  }`}>
                    {s.currentValue}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div className="text-slate-400">
                    Warning Mark: <b className="text-amber-400 font-mono">{s.warningThreshold}</b>
                  </div>
                  <div className="text-slate-400">
                    Danger Mark: <b className="text-red-400 font-mono">{s.dangerThreshold}</b>
                  </div>
                  <div className="text-slate-400">
                    Rate of Rise: <b className="text-slate-200">{s.trend}</b>
                  </div>
                  <div className="text-slate-400">
                    Burst Interval: <b className="text-slate-200">{s.lastBurst}</b>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Power: {s.battery}</span>
                <span>Signal: {s.signalQuality}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
