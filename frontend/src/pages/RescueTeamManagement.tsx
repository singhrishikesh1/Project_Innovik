import React from 'react';
import {
  Shield,
  Users,
  Radio,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { RescueTeam } from '../types';

interface RescueTeamManagementProps {
  rescueTeams: RescueTeam[];
}

export const RescueTeamManagement: React.FC<RescueTeamManagementProps> = ({ rescueTeams }) => {
  const totalPersonnel = rescueTeams.reduce((acc, t) => acc + t.personnelCount, 0);
  const totalBoats = rescueTeams.reduce((acc, t) => acc + t.boatsAvailable, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold uppercase">
              First-Responder Ops
            </span>
            <span className="text-slate-400 text-xs font-mono">NDRF & SDRF Tactical Deployments</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Tactical Rescue Team & Multi-Agency Operations Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time staging, equipment readiness, and communication nets for specialized swift-water and mountain search units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Deployed Rescuers: </span>
            <span className="font-mono font-bold text-sky-400">{totalPersonnel} Personnel</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Rescue Boats: </span>
            <span className="font-mono font-bold text-emerald-400">{totalBoats} Zodiac Units</span>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rescueTeams.map(team => {
          const isActive = team.status === 'ACTIVE_RESCUE';
          return (
            <div
              key={team.id}
              className={`bg-eoc-darker p-5 rounded-xl border flex flex-col justify-between space-y-3 shadow-lg ${
                isActive ? 'border-indigo-600 ring-1 ring-indigo-500/30' : 'border-eoc-border'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{team.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : team.status === 'DEPLOYED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {team.status}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>{team.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{team.organization} — {team.teamType}</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Forward Base:</span>
                    <span className="text-slate-200">{team.currentLocationName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-mono text-slate-200">{team.personnelCount} Specialized Rescuers</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Assigned Boats:</span>
                    <span className="font-mono font-bold text-sky-400">{team.boatsAvailable} Inflatable Units</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Radio Channel:</span>
                    <span className="font-mono text-amber-300 font-bold">{team.contactRadio}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Assigned Equipment</div>
                  <div className="flex flex-wrap gap-1">
                    {team.specialEquipment.map(eq => (
                      <span key={eq} className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                GPS: {team.coords.lat.toFixed(4)}, {team.coords.lng.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
