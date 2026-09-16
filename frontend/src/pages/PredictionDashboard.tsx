import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Clock,
  Droplets,
  Wind,
  Layers,
  Satellite,
  Radio,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { RiskAssessment, SkepticVerification, DisasterEvent } from '../types';
import { api } from '../services/api';

interface PredictionDashboardProps {
  disaster: DisasterEvent;
  riskAssessment: RiskAssessment;
  skepticVerification: SkepticVerification;
  onRefresh: () => void;
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  disaster,
  riskAssessment,
  skepticVerification,
  onRefresh
}) => {
  const [customRainfall, setCustomRainfall] = useState<number>(185);
  const [customRiverStage, setCustomRiverStage] = useState<number>(4.6);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [liveRisk, setLiveRisk] = useState<RiskAssessment>(riskAssessment);

  const timelineSteps = [
    { label: 'NORMAL', range: '0 - 20', active: liveRisk.riskLevel === 'NORMAL', color: 'bg-emerald-500' },
    { label: 'WATCH', range: '21 - 40', active: liveRisk.riskLevel === 'WATCH', color: 'bg-blue-500' },
    { label: 'ELEVATED', range: '41 - 60', active: liveRisk.riskLevel === 'ELEVATED', color: 'bg-yellow-500' },
    { label: 'HIGH RISK', range: '61 - 80', active: liveRisk.riskLevel === 'HIGH_RISK', color: 'bg-amber-500' },
    { label: 'CRITICAL', range: '81 - 95', active: liveRisk.riskLevel === 'CRITICAL', color: 'bg-orange-500' },
    { label: 'WARNING', range: 'PUBLIC ALERT', active: liveRisk.score >= 75, color: 'bg-red-600' },
    { label: 'DISASTER CONFIRMED', range: '96 - 100', active: liveRisk.riskLevel === 'DISASTER_CONFIRMED', color: 'bg-red-700' }
  ];

  const handleSimulateCustom = async () => {
    setIsSimulating(true);
    try {
      const res = await api.calculateRisk({
        precipitation_mm_hr: customRainfall > 100 ? 55 : 20,
        precipitation_48h_accum_mm: customRainfall,
        river_gauge_height_m: customRiverStage,
        river_danger_level_m: 4.2,
        slope_angle_deg: 34.0,
        soil_saturation_pct: 88.0,
        ndwi_anomaly_delta: 0.38,
        sar_backscatter_delta_db: -4.6,
        lake_area_expansion_pct: 28.5,
        seismic_pga_g: 0.04,
        temperature_anomaly_c: 3.5
      });
      setLiveRisk(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              VajraWatch Prediction Module
            </span>
            <span className="text-slate-400 text-xs font-mono">Observe → Score → Verify → Warn</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Deterministic 8-Feature Multi-Hazard Risk Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Model-driven physical parameter scoring with independent Skeptic Verification Agent audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Target Lead Time:</span>
            <span className="font-mono font-bold text-sky-300">~{liveRisk.targetLeadTimeHours} Hours</span>
            <span className="text-[10px] text-amber-300 font-mono">(Planning Target)</span>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Severity Timeline (PART 3) */}
      <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Hazard Severity Progression Timeline</span>
          <span className="text-sky-400 font-mono text-[11px]">Current Phase: {liveRisk.riskLevel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {timelineSteps.map((step, idx) => (
            <div
              key={step.label}
              className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                step.active
                  ? 'bg-slate-800/90 border-sky-400 ring-2 ring-sky-500/20 shadow-lg'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                <span className={`w-2 h-2 rounded-full ${step.color} ${step.active ? 'animate-ping' : ''}`} />
              </div>
              <div className="mt-2">
                <div className={`font-bold text-xs ${step.active ? 'text-white' : 'text-slate-400'}`}>
                  {step.label}
                </div>
                <div className="text-[10px] font-mono text-slate-500">{step.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Score & Skeptic Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VajraWatch Risk Score</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
              Confidence {(liveRisk.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className={`font-mono text-5xl font-extrabold tracking-tight ${
              liveRisk.score > 75 ? 'text-red-400' : liveRisk.score > 50 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {liveRisk.score.toFixed(1)}
            </span>
            <span className="text-xl text-slate-500 font-mono">/ 100</span>
          </div>

          {/* Contributing Factors */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Key Risk Drivers</span>
            {liveRisk.contributingFactors.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 italic bg-slate-900/60 p-2 rounded border border-slate-800/80">
            *Deterministic model evaluation. AI agents interpret and verify; score is calculated by calibrated physics algorithms.
          </div>
        </div>

        {/* Skeptic Verification Agent Card (PART 1 & 3) */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-emerald-800/40 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Skeptic Verification Agent
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {skepticVerification.isVerified ? 'VERIFIED (PASS)' : 'HOLD'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cross-Sensor Consistency:</span>
              <span className="font-mono font-bold text-emerald-300">{skepticVerification.crossSensorConsistency}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">False Alarm Probability:</span>
              <span className="font-mono font-bold text-emerald-300">
                {(skepticVerification.falseAlarmProbability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Recommendation:</span>
              <span className="font-mono font-bold text-sky-400">{skepticVerification.recommendation}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200">Skeptic Agent Challenge Notes:</div>
            <div className="leading-relaxed text-slate-400">{skepticVerification.challengeNotes}</div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Audit Timestamp: {new Date(skepticVerification.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Interactive Telemetry Simulator */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Telemetry Sensitivity Test</span>
            <span className="text-[10px] font-mono text-slate-400">Operator Sandbox</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rainfall (48h Accumulation):</span>
                <span className="font-mono font-bold text-sky-300">{customRainfall} mm</span>
              </div>
              <input
                type="range"
                min="20"
                max="350"
                step="5"
                value={customRainfall}
                onChange={e => setCustomRainfall(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>River Gauge (Danger: 4.2m):</span>
                <span className="font-mono font-bold text-sky-300">{customRiverStage} m</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="6.5"
                step="0.1"
                value={customRiverStage}
                onChange={e => setCustomRiverStage(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSimulateCustom}
              disabled={isSimulating}
              className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-colors"
            >
              {isSimulating ? 'Computing Weights...' : 'Recalculate Deterministic Score'}
            </button>
          </div>

          <div className="text-[10px] text-slate-500">
            Enables operators to stress-test hypothetical cloudburst scenarios without altering live production streams.
          </div>
        </div>
      </div>

      {/* 8-Feature Detailed Grid (PART 1 & 3) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">The 8 Deterministic Hazard Features</h3>
            <p className="text-xs text-slate-400">Mathematically weighted inputs driving the VajraWatch Risk Index.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Weights Total: 100%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {liveRisk.features.map(f => (
            <div key={f.key} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Weight {(f.weight * 100).toFixed(0)}%</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    f.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : f.status === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="font-bold text-slate-100 text-xs mt-1">{f.name}</div>
                <div className="font-mono font-extrabold text-lg text-sky-400 mt-1">
                  {f.value} <span className="text-xs font-normal text-slate-400">{f.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{f.description}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[9px] text-slate-500 truncate">
                Source: {f.dataSource}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
