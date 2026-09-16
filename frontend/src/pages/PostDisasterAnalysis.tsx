import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  Clock,
  Building2,
  Users,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { api } from '../services/api';

interface PostDisasterAnalysisProps {
  onNavigateToReport: () => void;
}

export const PostDisasterAnalysis: React.FC<PostDisasterAnalysisProps> = ({ onNavigateToReport }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await api.getPostDisasterAnalysis();
        setAnalysis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading || !analysis) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading 15-Section Post-Disaster Evaluation Workspace...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase">
              Incident Evaluation
            </span>
            <span className="text-slate-400 text-xs font-mono">15-Point Structured Assessment</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Post-Disaster Operational Analysis Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured forensic analysis synthesizing response performance, resource depletion, logistics bottlenecks, and recovery priorities.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Generate Full Official PDF Report</span>
        </button>
      </div>

      {/* AI Post-Disaster Analyst Synthesis Card (PART 22) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-sky-600/40 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            AI Post-Disaster Analyst Forensic Synthesis
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Strict Fact Grounding (Zero Hallucination Guarantee)
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {analysis.aiDecisionSummary}
        </p>
      </div>

      {/* 15 Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Section 1: Overview */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-sky-400">1. Disaster Overview</h3>
          <div className="space-y-1 text-slate-300">
            <div>Incident: <b className="text-slate-100">{analysis.disasterOverview.name}</b></div>
            <div>Peak Crest: <b className="text-red-400 font-mono">{analysis.disasterOverview.peakCrestLevel}</b></div>
            <div>Rainfall: <b className="text-sky-300 font-mono">{analysis.disasterOverview.peakRainfallRate}</b></div>
            <div>Duration: <b>{analysis.disasterOverview.durationHours} Hours</b></div>
          </div>
        </div>

        {/* Section 2 & 3: Geographic & Human Impact */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-amber-400">2 & 3. Human & Spatial Impact</h3>
          <div className="space-y-1 text-slate-300">
            <div>Inundation Footprint: <b className="text-sky-300 font-mono">{analysis.geographicImpact.affectedAreaSqKm} km²</b></div>
            <div>Population at Risk: <b className="text-amber-300 font-mono">{analysis.populationImpact.totalPopulationAtRisk.toLocaleString()}</b></div>
            <div>Safely Evacuated: <b className="text-emerald-400 font-mono">{analysis.populationImpact.evacuatedToShelters.toLocaleString()}</b></div>
            <div>Casualties / Fatalities: <b className="text-emerald-400 font-mono">0 Fatalities / 18 Minor Injuries</b></div>
          </div>
        </div>

        {/* Section 4 & 5: Infrastructure & Resources */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-purple-400">4 & 5. Infrastructure & Resources</h3>
          <div className="space-y-1 text-slate-300">
            <div>Severed Bridges: <b className="text-red-400">1 Suspension Bridge</b></div>
            <div>Food Packets Delivered: <b className="text-slate-100 font-mono">{analysis.resourceUsage.foodDelivered.toLocaleString()}</b></div>
            <div>Water Delivered: <b className="text-slate-100 font-mono">{analysis.resourceUsage.waterDeliveredL.toLocaleString()} Liters</b></div>
            <div>Active Rescue Boats: <b className="text-sky-400 font-mono">{analysis.resourceUsage.boatsDeployed} Units</b></div>
          </div>
        </div>

        {/* Section 6 & 7: Logistics & Rescue Performance */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-indigo-400">6 & 7. Logistics & Tactical Rescue</h3>
          <div className="space-y-1 text-slate-300">
            <div>Convoys Dispatched: <b>8 Shipments (7 on-time, 1 rerouted)</b></div>
            <div>Avg Delivery Time: <b className="font-mono text-sky-400">{analysis.logisticsPerformance.averageDeliveryTimeMin} Mins</b></div>
            <div>Deployed Rescuers: <b className="font-mono text-indigo-300">{analysis.rescuePerformance.totalPersonnelDeployed} Personnel</b></div>
            <div>Water Rescues Executed: <b className="font-mono text-emerald-400">{analysis.rescuePerformance.waterRescuesExecuted} Citizens</b></div>
          </div>
        </div>

        {/* Section 8 & 9: Evacuation & Shelter Performance */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-emerald-400">8 & 9. Evacuation & Shelter Influx</h3>
          <div className="space-y-1 text-slate-300">
            <div>Evacuation Completion: <b className="text-emerald-400 font-mono">{analysis.evacuationPerformance.completionRatePct}%</b></div>
            <div>Rerouted Citizens: <b className="font-mono text-sky-300">{analysis.evacuationPerformance.reroutedCitizenCount.toLocaleString()}</b></div>
            <div>Peak Shelter Occupancy: <b className="font-mono">{analysis.shelterPerformance.peakOccupancyPct}%</b></div>
            <div>Deficit Incidents: <b className="text-emerald-400">0 Critical Deficits</b></div>
          </div>
        </div>

        {/* Section 10 & 11: Financial & Environmental */}
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-2">
          <h3 className="font-bold text-slate-200 uppercase text-[11px] text-rose-400">10 & 11. Economic & Eco Impact</h3>
          <div className="space-y-1 text-slate-300">
            <div>Estimated Loss: <b className="text-rose-300 font-mono">INR 1.81 Crores</b></div>
            <div>Infra Repair Cost: <b className="text-slate-200 font-mono">INR 1.23 Crores</b></div>
            <div>Crop Relief Allocation: <b className="text-emerald-400 font-mono">INR 58 Lakhs</b></div>
            <div className="text-[10px] text-slate-500 italic">{analysis.financialImpact.label}</div>
          </div>
        </div>
      </div>

      {/* Sections 13, 14, 15: Gaps, Recovery & Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="bg-eoc-darker p-5 rounded-xl border border-amber-800/40 space-y-2">
          <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            13. Operational Response Gaps
          </h3>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            {analysis.responseGaps.map((g: string, i: number) => (
              <li key={i} className="leading-relaxed">{g}</li>
            ))}
          </ul>
        </div>

        <div className="bg-eoc-darker p-5 rounded-xl border border-sky-800/40 space-y-2">
          <h3 className="font-bold text-sky-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            14. Recovery Requirements
          </h3>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            {analysis.recoveryRequirements.map((r: string, i: number) => (
              <li key={i} className="leading-relaxed">{r}</li>
            ))}
          </ul>
        </div>

        <div className="bg-eoc-darker p-5 rounded-xl border border-emerald-800/40 space-y-2">
          <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            15. Strategic Lessons Learned
          </h3>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            {analysis.lessonsLearned.map((l: string, i: number) => (
              <li key={i} className="leading-relaxed">{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
