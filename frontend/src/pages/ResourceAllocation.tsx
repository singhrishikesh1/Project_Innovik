import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  HeartPulse,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ResourceDemandEstimate, AllocationRecommendation } from '../types';

interface ResourceAllocationProps {
  demandEstimates: ResourceDemandEstimate[];
  allocations: AllocationRecommendation[];
  onDispatchConvoy: (allocation: AllocationRecommendation) => void;
}

export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({
  demandEstimates,
  allocations,
  onDispatchConvoy
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              AI-Assisted Allocation Engine
            </span>
            <span className="text-amber-300 text-xs font-mono">Planning Estimate (Human-in-the-Loop)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Priority Resource Demand Prediction & Optimization Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sphere standard automated humanitarian calculations prioritizing human life, trauma triaging, and isolated communities.
          </p>
        </div>
      </div>

      {/* Demand Estimation Table (PART 8) */}
      <div className="bg-eoc-darker rounded-xl border border-eoc-border overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Humanitarian Relief Demand Estimator
            </span>
            <div className="text-[11px] text-slate-400">
              Computed for 14,200 vulnerable population across Alaknanda corridor.
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
            AI-Assisted Planning Estimate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">Relief Category</th>
                <th className="py-3 px-3 font-semibold text-right">Required</th>
                <th className="py-3 px-3 font-semibold text-right">Available</th>
                <th className="py-3 px-3 font-semibold text-right">Allocated</th>
                <th className="py-3 px-3 font-semibold text-right">Delivered</th>
                <th className="py-3 px-3 font-semibold text-right">Shortage</th>
                <th className="py-3 px-4 font-semibold">Sphere Standard Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {demandEstimates.map(d => (
                <tr key={d.category} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">{d.category}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sky-400">
                    {d.required.toLocaleString()} <span className="text-[10px] text-slate-500">{d.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {d.available.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                    {d.allocated.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-purple-400">
                    {d.delivered.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span className={d.shortage > 0 ? 'text-red-400' : 'text-slate-400'}>
                      {d.shortage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-md">{d.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Allocation Recommendations (PART 9) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Optimized Priority Allocation Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by: 1. Human Life → 2. Critical Medical → 3. High-Risk Inundation → 4. Isolated Communities.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Operator Review & Confirmation Required</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allocations.map(alloc => (
            <div
              key={alloc.id}
              className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-3 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                    Priority Score: {alloc.priorityScore}/100
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{alloc.id}</span>
                </div>

                <div className="font-bold text-slate-100 text-xs">{alloc.targetArea}</div>
                <div className="text-[11px] text-slate-400">
                  Target Displaced Population: <b className="text-slate-200">{alloc.targetPopulation.toLocaleString()}</b>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-[11px] space-y-1">
                  <div className="text-slate-400">Recommended Allocation:</div>
                  <div className="font-mono font-bold text-sky-400 text-sm">
                    {alloc.recommendedQuantity.toLocaleString()} {alloc.category}
                  </div>
                  <div className="text-[10px] text-slate-500">Source: {alloc.sourceWarehouseId}</div>
                </div>

                <div className="text-[11px] text-slate-300 pt-1">
                  <span className="font-semibold text-slate-400 block mb-0.5">Allocation Rationale:</span>
                  <span className="leading-snug">{alloc.priorityRationale}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => onDispatchConvoy(alloc)}
                  className="w-full py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch Relief Convoy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
