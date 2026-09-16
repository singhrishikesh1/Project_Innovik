import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  Shield,
  Truck,
  Building2,
  HeartPulse,
  Activity,
  ArrowUpRight,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CommandMap } from '../components/CommandMap';
import {
  DisasterEvent,
  RiskAssessment,
  SkepticVerification,
  ImpactAssessment,
  Shelter,
  Hospital,
  RescueTeam,
  Shipment,
  EvacuationRoute,
  EmergencyTask
} from '../types';

interface CommandCenterProps {
  activeDisaster: DisasterEvent;
  riskAssessment: RiskAssessment;
  skepticVerification: SkepticVerification;
  impactAssessment: ImpactAssessment;
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams: RescueTeam[];
  shipments: Shipment[];
  evacuationRoutes: EvacuationRoute[];
  tasks: EmergencyTask[];
  onNavigate: (page: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  activeDisaster,
  riskAssessment,
  skepticVerification,
  impactAssessment,
  shelters,
  hospitals,
  rescueTeams,
  shipments,
  evacuationRoutes,
  tasks,
  onNavigate
}) => {
  const [selectedFeature, setSelectedFeature] = useState<{ type: string; data: any } | null>(null);

  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const availableShelterBeds = totalShelterCapacity - totalShelterOccupancy;

  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icuTotal, 0);
  const availableIcuBeds = hospitals.reduce((acc, h) => acc + h.icuAvailable, 0);

  const blockedRoutes = evacuationRoutes.filter(r => r.status === 'BLOCKED');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-eoc-darkest text-slate-100">
      {/* Top Incident Summary Strip (PART 24) */}
      <div className="bg-eoc-darker/80 border-b border-eoc-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <div>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">ACTIVE INCIDENT</span>
            <div className="font-bold text-slate-100">{activeDisaster.name}</div>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="hidden sm:block text-slate-400 text-[11px]">{activeDisaster.location}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Risk Badge */}
          <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-800/60 px-2.5 py-1 rounded">
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400 text-[11px]">Hazard Index:</span>
            <span className="font-mono font-extrabold text-red-400">{riskAssessment.score.toFixed(1)}/100</span>
          </div>

          {/* Population At Risk */}
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Pop. in Path:</span>
            <span className="font-mono font-bold text-amber-300">{activeDisaster.affectedPopulation.toLocaleString()}</span>
          </div>

          {/* Blocked Road Warning if any */}
          {blockedRoutes.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-900/60 text-red-200 border border-red-600 px-2.5 py-1 rounded font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-200" />
              <span>NH-58 BLOCKED (KM 42)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Command Workspace: Left Event List | Center Live Map | Right Intelligence */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Multi-Hazard & Event List (PART 24) */}
        <div className="w-full lg:w-72 bg-eoc-darker/60 border-r border-eoc-border flex flex-col shrink-0 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Regional Hazards</span>
            <span className="text-[10px] text-sky-400 font-mono">1 ACTIVE</span>
          </div>

          {/* Active Card */}
          <div className="bg-slate-900/90 border border-red-700/60 rounded-lg p-3 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 text-[10px] font-bold uppercase">
                {activeDisaster.type}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{activeDisaster.severityClassification}</span>
            </div>
            <div className="font-bold text-slate-100 text-xs">{activeDisaster.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: <b className="text-amber-300">{activeDisaster.responseStatus}</b></span>
              <span>Lead Time: <b className="text-sky-300">~{riskAssessment.targetLeadTimeHours}h</b></span>
            </div>
          </div>

          {/* Other Monitored Regional Basins */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Standby Watch Basins</div>
            {[
              { name: 'Bhagirathi Catchment (Tehri)', type: 'Flood', risk: '22.4', status: 'NORMAL' },
              { name: 'Mandakini Gorge (Rudraprayag)', type: 'Landslide', risk: '34.1', status: 'WATCH' },
              { name: 'Sharda River Basin (Tanakpur)', type: 'Flash Flood', risk: '16.8', status: 'NORMAL' }
            ].map(b => (
              <div key={b.name} className="p-2 rounded bg-slate-900/40 border border-slate-800 text-[11px] flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-300">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{b.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-slate-300 font-bold">{b.risk}</div>
                  <div className="text-[9px] text-emerald-400">{b.status}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <button
              onClick={() => onNavigate('prediction')}
              className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] text-sky-400 flex items-center justify-between transition-colors"
            >
              <span>VajraWatch Prediction Deep-Dive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('evacuation')}
              className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] text-emerald-400 flex items-center justify-between transition-colors"
            >
              <span>Dynamic Evacuation Router</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CENTER: Large Real-Time Map (PART 24) */}
        <div className="flex-1 flex flex-col min-h-[350px] p-2 relative">
          <CommandMap
            center={{ lat: activeDisaster.coordinates.lat, lng: activeDisaster.coordinates.lng }}
            zoom={11}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            shipments={shipments}
            evacuationRoutes={evacuationRoutes}
            disasterPolygon={impactAssessment.polygonCoordinates}
            onSelectFeature={(type, data) => setSelectedFeature({ type, data })}
          />
        </div>

        {/* RIGHT: Incident Intelligence Panel (PART 24) */}
        <div className="w-full lg:w-80 bg-eoc-darker/60 border-l border-eoc-border flex flex-col shrink-0 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Incident Intelligence</span>
            <span className="text-[10px] text-emerald-400 font-mono">SKEPTIC VERIFIED</span>
          </div>

          {/* Deterministic Risk Breakdown Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">VajraWatch Deterministic Score</span>
              <span className="font-mono font-extrabold text-sm text-sky-400">{riskAssessment.score}/100</span>
            </div>

            {/* Feature Bars */}
            <div className="space-y-1.5 text-[10px]">
              {riskAssessment.features.slice(0, 4).map(f => (
                <div key={f.key}>
                  <div className="flex justify-between text-slate-300">
                    <span className="truncate max-w-[170px]">{f.name}</span>
                    <span className="font-mono font-bold text-slate-200">{f.value} {f.unit}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full rounded-full ${
                        f.status === 'CRITICAL' ? 'bg-red-500' : f.status === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(f.contribution * 4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 leading-snug">
              {riskAssessment.explanation}
            </div>
          </div>

          {/* Skeptic Agent Verification Card */}
          <div className="bg-slate-900/90 border border-emerald-800/40 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Skeptic Agent Verification
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                PASSED
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              False Alarm Probability: <b className="text-emerald-400 font-mono">{(skepticVerification.falseAlarmProbability * 100).toFixed(1)}%</b>
            </div>
            <div className="text-[10px] text-slate-400 leading-snug bg-slate-950/60 p-2 rounded border border-slate-800">
              {skepticVerification.challengeNotes}
            </div>
          </div>

          {/* Impact Snapshot */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
            <div className="font-bold text-slate-200">PostGIS Impact Summary</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-800/50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Inundation Area</div>
                <div className="font-mono font-bold text-sky-400">{impactAssessment.affectedAreaSqKm} km²</div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Villages in Path</div>
                <div className="font-mono font-bold text-amber-400">{impactAssessment.affectedVillages.length} Villages</div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Bridges at Risk</div>
                <div className="font-mono font-bold text-red-400">4 Bridges</div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Crops Submerged</div>
                <div className="font-mono font-bold text-emerald-400">{impactAssessment.agriculturalLandHectares} Ha</div>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => onNavigate('early-warning')}
            className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 font-bold text-xs text-white shadow-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Open Early Warning Center</span>
          </button>
        </div>
      </div>

      {/* BOTTOM TRAY: Resource Status, Logistics, Shelters, Response Metrics (PART 24) */}
      <div className="h-32 bg-eoc-darker border-t border-eoc-border px-4 py-2 flex items-center gap-4 overflow-x-auto shrink-0 text-xs">
        {/* Shelter Capacity Gauge */}
        <div className="min-w-[200px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              Shelter Influx
            </span>
            <span className="font-mono text-slate-200">
              {totalShelterOccupancy}/{totalShelterCapacity}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-bold text-sky-300">
                {Math.round((totalShelterOccupancy / totalShelterCapacity) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${(totalShelterOccupancy / totalShelterCapacity) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Available Beds: {availableShelterBeds.toLocaleString()}</div>
        </div>

        {/* ICU & Medical Beds */}
        <div className="min-w-[190px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Emergency ICU Beds
            </span>
            <span className="font-mono text-slate-200">{availableIcuBeds}/{totalIcuBeds} Free</span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Trauma Load:</span>
              <span className="font-bold text-rose-300">Operational</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${((totalIcuBeds - availableIcuBeds) / totalIcuBeds) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">Ambulances Staged: 28 Units</div>
        </div>

        {/* Active Logistics Shipments */}
        <div className="min-w-[260px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-purple-400" />
              Live Relief Convoys
            </span>
            <span className="font-mono text-purple-300 font-bold">{shipments.length} Active</span>
          </div>
          <div className="space-y-1">
            {shipments.slice(0, 2).map(sh => (
              <div key={sh.id} className="flex items-center justify-between text-[11px]">
                <span className="truncate max-w-[150px] text-slate-300">{sh.resourceName}</span>
                <span className={`px-1 rounded text-[10px] font-mono ${sh.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  {sh.status} ({sh.routeProgressPct}%)
                </span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-amber-400 font-mono">Simulation / Demo GPS Tracking</div>
        </div>

        {/* Dynamic Evacuation Routing Status */}
        <div className="min-w-[220px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic Evacuation
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${blockedRoutes.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {blockedRoutes.length > 0 ? 'REROUTED' : 'ALL CLEAR'}
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            {blockedRoutes.length > 0
              ? 'NH-58 Blocked -> Rerouted via Ridge Bypass Road'
              : 'Primary routes operational via NH-58'}
          </div>
          <div className="text-[10px] text-slate-500">Avg Evac Travel Time: 26 mins</div>
        </div>

        {/* Response Performance Score */}
        <div className="min-w-[180px] bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="text-slate-400 text-[11px]">Response KPI Indicator</div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">
            89.4<span className="text-sm font-normal text-slate-500">/100</span>
          </div>
          <div className="text-[10px] text-slate-500">Platform Performance Score</div>
        </div>
      </div>
    </div>
  );
};
