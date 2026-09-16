import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Clock,
  ArrowRight,
  Shield,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { EvacuationRoute, Shelter } from '../types';
import { api } from '../services/api';

interface EvacuationPlannerProps {
  routes: EvacuationRoute[];
  shelters: Shelter[];
  onRoutesUpdated: () => void;
}

export const EvacuationPlanner: React.FC<EvacuationPlannerProps> = ({
  routes,
  shelters,
  onRoutesUpdated
}) => {
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const primaryRoute = routes[0];
  const isBlocked = primaryRoute?.status === 'BLOCKED';

  const handleToggleBlockage = async () => {
    if (!primaryRoute) return;
    setIsToggling(true);
    try {
      const nextStatus = isBlocked ? 'SAFE' : 'BLOCKED';
      const reason = isBlocked ? undefined : 'Landslide & flash flood debris overflow on NH-58 at Km 42 near Birahi choke point.';
      await api.updateRoadStatus(primaryRoute.id, nextStatus, reason);
      onRoutesUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error toggling road status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase">
              Dynamic Graph Routing Engine
            </span>
            <span className="text-slate-400 text-xs font-mono">Real-Time Obstacle Avoidance</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Dynamic Evacuation Corridor & Safe Routing Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous Dijkstra graph path optimization recalculating safe high-ground corridors around active landslides and flooded zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBlockage}
            disabled={isToggling}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
              isBlocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isBlocked ? 'Clear Landslide on NH-58' : 'Simulate Landslide Blockage on NH-58'}</span>
          </button>
        </div>
      </div>

      {/* Rerouting Alert Banner when Blocked */}
      {isBlocked && (
        <div className="bg-red-950/80 border border-red-600 p-4 rounded-xl flex items-start gap-3 text-xs shadow-xl animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-red-200 text-sm">
              CRITICAL OBSTACLE: NH-58 ARTERIAL CORRIDOR SEVERED AT KM 42
            </div>
            <div className="text-slate-300">
              Debris flow detected near Birahi. Primary route to Shelter-02 blocked. <b>Dynamic Evacuation Router has automatically recalculated traffic flow to High-Ground Ridge Bypass Road (+8 minutes travel time).</b>
            </div>
          </div>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {routes.map(r => {
          const isRouteBlocked = r.status === 'BLOCKED';
          return (
            <div
              key={r.id}
              className={`bg-eoc-darker p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-xl ${
                isRouteBlocked
                  ? 'border-red-600 ring-2 ring-red-500/20'
                  : r.isAlternativeRoute
                  ? 'border-sky-500/80 ring-2 ring-sky-500/20'
                  : 'border-eoc-border'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isRouteBlocked
                      ? 'bg-red-500/20 text-red-400'
                      : r.isAlternativeRoute
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isRouteBlocked ? '⛔ BLOCKED' : r.isAlternativeRoute ? '🔄 DYNAMIC ALTERNATIVE' : '✅ SAFE PATH'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{r.id}</span>
                </div>

                <div className="font-bold text-slate-100 text-sm leading-snug">{r.name}</div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Origin:</span>
                    <span className="font-semibold text-slate-200">{r.originName}</span>
                  </div>

                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-sky-300">{r.destinationShelterName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Transit Distance</div>
                    <div className="font-mono font-bold text-slate-200">{r.distanceKm} km</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Est. Travel Time</div>
                    <div className="font-mono font-bold text-slate-200">
                      {isRouteBlocked ? 'BLOCKED' : `${r.estimatedTravelTimeMin} mins`}
                    </div>
                  </div>
                </div>

                {r.blockageReason && (
                  <div className="bg-red-950/60 p-2.5 rounded border border-red-800/80 text-[11px] text-red-300">
                    <b>Hazard Reason:</b> {r.blockageReason}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                Road Segment: {r.roadSegmentId}
              </div>
            </div>
          );
        })}
      </div>

      {/* Evacuation Protocol Guidance */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3 text-xs">
        <h3 className="font-bold text-slate-200 uppercase tracking-wide">
          Standard Operating Evacuation Protocols (NDMA SOP 04)
        </h3>
        <p className="text-slate-400 leading-relaxed">
          In the event of active flash flood surge, pedestrian and light vehicle traffic must be diverted off low-lying valley floors within 30 minutes of official siren broadcast. Citizens residing in Joshimath Foothills, Helang, and Birahi lowlands are instructed to march exclusively towards designated ridge shelters via marked high-ground evacuation tracks.
        </p>
      </div>
    </div>
  );
};
