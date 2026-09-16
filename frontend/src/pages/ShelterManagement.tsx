import React, { useState } from 'react';
import {
  Building2,
  Users,
  Droplets,
  Utensils,
  Zap,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { Shelter } from '../types';
import { api } from '../services/api';

interface ShelterManagementProps {
  shelters: Shelter[];
  onSheltersUpdated: () => void;
}

export const ShelterManagement: React.FC<ShelterManagementProps> = ({
  shelters,
  onSheltersUpdated
}) => {
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [newOccupancy, setNewOccupancy] = useState<number>(0);

  const totalCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const currentOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const availableCapacity = totalCapacity - currentOccupancy;

  const handleUpdateOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter) return;
    try {
      await api.updateShelter(editingShelter.id, { currentOccupancy: newOccupancy });
      setEditingShelter(null);
      onSheltersUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error updating shelter');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Emergency Shelter Operations
            </span>
            <span className="text-slate-400 text-xs font-mono">Displaced Citizen Care</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Shelter Capacity & Relief Camp Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live occupancy tracking, critical utility monitoring, and localized relief deficit mitigation across active shelters.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Bar (PART 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Sanctioned Capacity</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-slate-100">
            {totalCapacity.toLocaleString()} <span className="text-xs font-normal text-slate-500">Cots / Beds</span>
          </div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Current Displaced Occupancy</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-amber-300">
            {currentOccupancy.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            Utilization Rate: {Math.round((currentOccupancy / totalCapacity) * 100)}%
          </div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Residual Capacity</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">
            {availableCapacity.toLocaleString()} <span className="text-xs font-normal text-slate-500">Vacant</span>
          </div>
        </div>
      </div>

      {/* Shelters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shelters.map(s => {
          const occPct = Math.round((s.currentOccupancy / s.totalCapacity) * 100);
          const isNearCap = occPct > 80;
          return (
            <div
              key={s.id}
              className={`bg-eoc-darker p-5 rounded-xl border flex flex-col justify-between space-y-3 shadow-lg ${
                isNearCap ? 'border-amber-600/80 ring-1 ring-amber-500/20' : 'border-eoc-border'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{s.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'FULL'
                      ? 'bg-red-500/20 text-red-300'
                      : s.status === 'NEAR_CAPACITY'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-slate-100 text-sm">{s.name}</div>
                  <div className="text-[11px] text-slate-400">{s.locationName}</div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="font-bold text-slate-200">
                      {s.currentOccupancy} / {s.totalCapacity} ({occPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCap ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>

                {/* Facilities Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>Water: <b>{s.waterSupplyDays} Days</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" />
                    <span>Food: <b>{s.foodSupplyDays} Days</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    <span>Medical: <b>{s.medicalFacilityOnsite ? 'Onsite' : 'None'}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Grid: <b>{s.electricityOperational ? 'Operational' : 'Generator'}</b></span>
                  </div>
                </div>

                {/* Shortages if any */}
                {s.shortages.length > 0 && (
                  <div className="bg-red-950/40 border border-red-800/60 p-2 rounded text-[11px] text-red-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>Deficits Reported: {s.shortages.join(', ')}</div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setEditingShelter(s);
                    setNewOccupancy(s.currentOccupancy);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Update Occupancy</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Occupancy Modal */}
      {editingShelter && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-darker border border-sky-600 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-bold text-slate-100 flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Update Shelter Headcount</span>
              <button onClick={() => setEditingShelter(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateOccupancy} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Shelter</label>
                <div className="font-semibold text-slate-200">{editingShelter.name}</div>
                <div className="text-slate-500 text-[10px]">Total Capacity: {editingShelter.totalCapacity}</div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Current Headcount</label>
                <input
                  type="number"
                  min="0"
                  max={editingShelter.totalCapacity}
                  value={newOccupancy}
                  onChange={e => setNewOccupancy(Number(e.target.value))}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShelter(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Headcount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
