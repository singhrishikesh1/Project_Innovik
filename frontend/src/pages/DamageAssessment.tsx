import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';
import { DamageRecord } from '../types';

interface DamageAssessmentProps {
  damageRecords: DamageRecord[];
}

export const DamageAssessment: React.FC<DamageAssessmentProps> = ({ damageRecords }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(damageRecords.map(d => d.category)))];

  const filtered = selectedCategory === 'ALL'
    ? damageRecords
    : damageRecords.filter(d => d.category === selectedCategory);

  const totalEstimatedCost = damageRecords.reduce((acc, d) => acc + d.estimatedRepairCostInr, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold uppercase">
              Field Damage Audit
            </span>
            <span className="text-amber-300 text-xs font-mono">Demo / Simulated Scenario Data</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Physical Asset Damage Inspection & Loss Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Asset-level damage classifications validated via ground inspection, drone reconnaissance, and satellite imagery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Total Estimated Loss: </span>
            <span className="font-mono font-bold text-rose-400">
              ₹{(totalEstimatedCost / 10000000).toFixed(2)} Crores
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400">Filter Asset Class:</span>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === c
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Damage Table (PART 18) */}
      <div className="bg-eoc-darker rounded-xl border border-eoc-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">Asset ID & Title</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 font-semibold">Damage Level</th>
                <th className="py-3 px-3 font-semibold text-right">Est. Repair Cost</th>
                <th className="py-3 px-3 font-semibold">Evidence Source</th>
                <th className="py-3 px-4 font-semibold">Inspection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{d.assetName}</div>
                    <div className="font-mono text-[10px] text-slate-500">{d.id}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-300">{d.category}</td>
                  <td className="py-3 px-3 text-slate-400">{d.locationName}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.damageLevel === 'DESTROYED'
                        ? 'bg-red-600 text-white'
                        : d.damageLevel === 'SEVERE'
                        ? 'bg-red-500/20 text-red-300'
                        : d.damageLevel === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {d.damageLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                    ₹{d.estimatedRepairCostInr.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">{d.evidenceSource}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {d.inspectionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
