import React from 'react';
import {
  HeartPulse,
  Activity,
  Ambulance,
  Droplet,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Hospital } from '../types';

interface HospitalManagementProps {
  hospitals: Hospital[];
}

export const HospitalManagement: React.FC<HospitalManagementProps> = ({ hospitals }) => {
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalBeds, 0);
  const availableBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalIcu = hospitals.reduce((acc, h) => acc + h.icuTotal, 0);
  const availableIcu = hospitals.reduce((acc, h) => acc + h.icuAvailable, 0);
  const totalAmbulances = hospitals.reduce((acc, h) => acc + h.ambulancesAvailable, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold uppercase">
              Emergency Medical Coordination
            </span>
            <span className="text-slate-400 text-xs font-mono">Casualty Triaging & Trauma Surge</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Hospital Trauma Capacity & Patient Staging Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational triage dashboard tracking trauma bed availability, ICU surge headroom, and ambulance logistics.
          </p>
        </div>

        <div className="text-xs text-amber-300 font-mono bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg">
          *Operational resource triaging only. Does not provide medical diagnoses.
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Available Inpatient Beds</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">
            {availableBeds} <span className="text-xs font-normal text-slate-500">/ {totalBeds}</span>
          </div>
          <div className="text-[10px] text-slate-500">District Bed Headroom: {Math.round((availableBeds / totalBeds) * 100)}%</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Available ICU / Ventilators</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-sky-400">
            {availableIcu} <span className="text-xs font-normal text-slate-500">/ {totalIcu}</span>
          </div>
          <div className="text-[10px] text-slate-500">Critical Care Headroom: {Math.round((availableIcu / totalIcu) * 100)}%</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Ambulance className="w-3.5 h-3.5 text-amber-400" />
            <span>ALS Ambulances Ready</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-amber-300">
            {totalAmbulances} <span className="text-xs font-normal text-slate-500">Fleet Units</span>
          </div>
          <div className="text-[10px] text-slate-500">108 Emergency Network Active</div>
        </div>

        <div className="bg-eoc-darker p-4 rounded-xl border border-eoc-border space-y-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-red-400" />
            <span>Blood Units Reserve</span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-red-400">
            621 <span className="text-xs font-normal text-slate-500">Units</span>
          </div>
          <div className="text-[10px] text-slate-500">District Blood Banks Synchronized</div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hospitals.map(h => (
          <div key={h.id} className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400">{h.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                {h.status}
              </span>
            </div>

            <div>
              <div className="font-bold text-slate-100 text-sm">{h.name}</div>
              <div className="text-[11px] text-slate-400">{h.locationName}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Trauma Beds</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {h.availableBeds} Available <span className="text-slate-500 text-[10px]">({h.totalBeds} Total)</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ICU / Critical Care</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {h.icuAvailable} Free <span className="text-slate-500 text-[10px]">({h.icuTotal} Total)</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Active Medical Teams</span>
                <span className="font-mono text-slate-200">{h.medicalTeamsOnDuty} Teams on Duty</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ambulance Readiness</span>
                <span className="font-mono text-slate-200">{h.ambulancesAvailable} ALS Units</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Incoming Casualties: <b className="text-amber-300">{h.incomingCasualties} En Route</b></span>
              <span className="text-red-400 font-mono">Blood Reserve: {h.bloodUnitsAvailable} Units</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
