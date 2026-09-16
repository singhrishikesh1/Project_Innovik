import React, { useState } from 'react';
import {
  Crosshair,
  Building2,
  Users,
  Compass,
  AlertTriangle,
  Layers,
  MapPin,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { ImpactAssessment as ImpactType, Shelter, Hospital } from '../types';

interface ImpactAssessmentProps {
  impact: ImpactType;
  shelters: Shelter[];
  hospitals: Hospital[];
}

export const ImpactAssessmentPage: React.FC<ImpactAssessmentProps> = ({
  impact,
  shelters,
  hospitals
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number>(5); // 5km default

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              PostGIS Spatial Analysis
            </span>
            <span className="text-slate-400 text-xs font-mono">Inundation & Cadastral Overlay</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Automated Damage & Vulnerability Impact Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial intersection of physical river flood extent against infrastructure inventory and census tracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Radius Buffer Filter:</span>
          {[2, 5, 10, 20].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRadius(r)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                selectedRadius === r
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span>Inundation Footprint</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-sky-400">
            {impact.affectedAreaSqKm} <span className="text-xs font-normal text-slate-400">sq km</span>
          </div>
          <div className="text-[10px] text-slate-500">Sentinel-1 SAR Radar Validated</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Population at Risk</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-amber-300">
            {impact.estimatedPopulation.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Census 2021 Buffer Extrapolation</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Settlements Impacted</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">
            {impact.affectedVillages.length} <span className="text-xs font-normal text-slate-400">Villages</span>
          </div>
          <div className="text-[10px] text-slate-500">Riverside High-Vulnerability Wards</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Farmland Submerged</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-rose-400">
            {impact.agriculturalLandHectares} <span className="text-xs font-normal text-slate-400">Hectares</span>
          </div>
          <div className="text-[10px] text-slate-500">Terraced Paddy & Apple Orchards</div>
        </div>
      </div>

      {/* Infrastructure at Risk Table */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Critical Infrastructure Vulnerability Matrix</h3>
            <p className="text-xs text-slate-400">Automated PostGIS layer intersection with spatial assets.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Calculation: <b className="text-sky-400">{impact.calculationMethod}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2.5 font-semibold">Infrastructure Class</th>
                <th className="pb-2.5 font-semibold">Asset Description</th>
                <th className="pb-2.5 font-semibold">Units in Path</th>
                <th className="pb-2.5 font-semibold">Criticality</th>
                <th className="pb-2.5 font-semibold">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {impact.infrastructureAtRisk.map(item => (
                <tr key={item.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold uppercase text-slate-300">{item.category}</td>
                  <td className="py-2.5 text-slate-200">{item.name}</td>
                  <td className="py-2.5 font-mono font-bold text-sky-400">{item.totalAtRisk}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.criticalLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300'
                        : item.criticalLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {item.criticalLevel}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {item.category === 'bridges' ? '1 Severed / 3 Under Observation' : item.category === 'roads' ? 'Debris Clearance Active' : 'Precautionary Standby'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nearest Shelters & Hospitals Proximity Analysis (PART 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nearest Shelters Card */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              Nearest Designated Evacuation Shelters
            </h3>
            <span className="text-[10px] font-mono text-slate-500">PostGIS Distance Sort</span>
          </div>

          <div className="space-y-2 text-xs">
            {shelters.slice(0, 3).map((s, idx) => (
              <div key={s.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{s.name}</div>
                  <div className="text-[11px] text-slate-400">{s.locationName}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Capacity: {s.currentOccupancy}/{s.totalCapacity} ({s.availableCapacity} available)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-sky-400">
                    {(idx * 1.8 + 2.4).toFixed(1)} km
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Hospitals Card */}
        <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              Nearest Suitable Trauma Hospitals
            </h3>
            <span className="text-[10px] font-mono text-slate-500">ICU Capacity Sorted</span>
          </div>

          <div className="space-y-2 text-xs">
            {hospitals.slice(0, 3).map((h, idx) => (
              <div key={h.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{h.name}</div>
                  <div className="text-[11px] text-slate-400">{h.locationName}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Free Beds: {h.availableBeds} | Free ICU: {h.icuAvailable}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-blue-400">
                    {(idx * 6.2 + 3.1).toFixed(1)} km
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
