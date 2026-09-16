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
  MapPin,
  ExternalLink,
  Navigation,
  Share2,
  Route as RouteIcon
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

  // Helper to open Google Maps single location
  const openGoogleMapsLocation = (lat: number, lng: number, label?: string) => {
    const query = label ? `${encodeURIComponent(label)}&query=${lat},${lng}` : `${lat},${lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper to open Google Maps turn-by-turn directions with intermediate waypoints
  const openGoogleMapsDirections = (route: EvacuationRoute) => {
    const origin = `${route.originCoords.lat},${route.originCoords.lng}`;
    const dest = `${route.destinationCoords.lat},${route.destinationCoords.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    
    // Add high-ground avoid-flood intermediate waypoints if available
    if (route.waypoints && route.waypoints.length > 2) {
      const intermediate = route.waypoints.slice(1, -1);
      const waypointsStr = intermediate.map(w => `${w.lat},${w.lng}`).join('|');
      url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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
            className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
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

      {/* Google Maps Quick Guidance Helper Strip */}
      <div className="bg-sky-950/40 border border-sky-500/30 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-sky-200">
          <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Interactive Google Maps Navigation:</strong> Click on any Origin point, Destination shelter, or Waypoint below to instantly open its location and route in Google Maps.
          </span>
        </div>
        <span className="text-[10px] font-mono text-sky-400 bg-sky-900/50 px-2 py-0.5 rounded border border-sky-500/30 shrink-0">
          1-Touch GPS
        </span>
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
              className={`bg-eoc-darker p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                isRouteBlocked
                  ? 'border-red-600 ring-2 ring-red-500/20'
                  : r.isAlternativeRoute
                  ? 'border-sky-500/80 ring-2 ring-sky-500/20'
                  : 'border-emerald-500/40'
              }`}
            >
              <div className="space-y-3">
                {/* Route Header Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isRouteBlocked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : r.isAlternativeRoute
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isRouteBlocked ? '⛔ BLOCKED' : r.isAlternativeRoute ? '🔄 DYNAMIC ALTERNATIVE' : '✅ SAFE PATH'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{r.id}</span>
                </div>

                <div className="font-bold text-slate-100 text-sm leading-snug">{r.name}</div>

                {/* Clickable Origin & Destination Points Box */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                  {/* Origin Point (Clickable -> Opens Google Maps) */}
                  <button
                    type="button"
                    onClick={() => openGoogleMapsLocation(r.originCoords.lat, r.originCoords.lng, r.originName)}
                    className="w-full text-left flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition-all group"
                    title="Click to view Origin location in Google Maps"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-400 text-[11px]">Origin:</span>
                      <span className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                        {r.originName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 shrink-0">
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </button>

                  <div className="flex items-center justify-center text-slate-500 py-0.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                  {/* Destination Shelter Point (Clickable -> Opens Google Maps) */}
                  <button
                    type="button"
                    onClick={() => openGoogleMapsLocation(r.destinationCoords.lat, r.destinationCoords.lng, r.destinationShelterName)}
                    className="w-full text-left flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 transition-all group"
                    title="Click to view Shelter location in Google Maps"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-slate-400 text-[11px]">Destination:</span>
                      <span className="font-semibold text-sky-300 group-hover:text-sky-200 transition-colors truncate">
                        {r.destinationShelterName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 flex items-center gap-1 shrink-0">
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </button>
                </div>

                {/* Distance & Time Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Transit Distance</div>
                    <div className="font-mono font-bold text-slate-200">{r.distanceKm} km</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Est. Travel Time</div>
                    <div className="font-mono font-bold text-slate-200">
                      {isRouteBlocked ? 'BLOCKED' : `${r.estimatedTravelTimeMin} mins`}
                    </div>
                  </div>
                </div>

                {/* Clickable Waypoints Chips (Clicking any waypoint opens Google Maps) */}
                {r.waypoints && r.waypoints.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Safe GPS Waypoint Checkpoints:</span>
                      <span className="text-[9px] text-slate-500">Touch to locate</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.waypoints.map((wp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openGoogleMapsLocation(wp.lat, wp.lng, `Waypoint ${idx + 1}`)}
                          className="px-2 py-1 rounded bg-[#091122] hover:bg-sky-950 border border-white/10 hover:border-sky-500/40 text-[10px] font-mono text-slate-300 hover:text-sky-300 flex items-center gap-1 transition-colors"
                          title={`Open Waypoint ${idx + 1} (${wp.lat}, ${wp.lng}) in Google Maps`}
                        >
                          <MapPin className="w-2.5 h-2.5 text-sky-400" />
                          <span>P{idx + 1}: {wp.lat.toFixed(3)}, {wp.lng.toFixed(3)}</span>
                          <ExternalLink className="w-2 h-2 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {r.blockageReason && (
                  <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-800/80 text-[11px] text-red-300">
                    <b>Hazard Reason:</b> {r.blockageReason}
                  </div>
                )}
              </div>

              {/* Bottom Actions: 1-Touch Open in Google Maps Safe Routing Button */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => openGoogleMapsDirections(r)}
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${
                    isRouteBlocked
                      ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40'
                  }`}
                  title="Open this safe evacuation path with turn-by-turn navigation in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isRouteBlocked ? 'View Blocked Route on Google Maps ↗' : 'Navigate Safe Route on Google Maps ↗'}</span>
                </button>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Road Segment: {r.roadSegmentId}</span>
                  <span className="text-emerald-400">GPS Live Sync</span>
                </div>
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
