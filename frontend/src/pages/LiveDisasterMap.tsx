import React, { useState } from 'react';
import { CommandMap } from '../components/CommandMap';
import {
  DisasterEvent,
  Shelter,
  Hospital,
  RescueTeam,
  Shipment,
  EvacuationRoute
} from '../types';
import { api, getOperatorIdentity } from '../services/api';
import { MapPin, Navigation, AlertTriangle, CheckCircle2, Shield, HeartPulse, Building2, Truck } from 'lucide-react';

interface LiveDisasterMapProps {
  disaster: DisasterEvent;
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams: RescueTeam[];
  shipments: Shipment[];
  evacuationRoutes: EvacuationRoute[];
  disasterPolygon: any[];
  onDataUpdated: () => void;
}

export const LiveDisasterMap: React.FC<LiveDisasterMapProps> = ({
  disaster,
  shelters,
  hospitals,
  rescueTeams,
  shipments,
  evacuationRoutes,
  disasterPolygon,
  onDataUpdated
}) => {
  const [selectedFeature, setSelectedFeature] = useState<{ type: string; data: any } | null>(null);
  const [isUpdatingRoad, setIsUpdatingRoad] = useState<boolean>(false);

  const primaryRoute = evacuationRoutes[0];
  const isPrimaryBlocked = primaryRoute?.status === 'BLOCKED';

  const handleToggleRoad = async () => {
    if (!primaryRoute) return;
    setIsUpdatingRoad(true);
    try {
      const nextStatus = isPrimaryBlocked ? 'SAFE' : 'BLOCKED';
      const reason = isPrimaryBlocked ? undefined : 'Landslide debris overflow at Km 42 near Birahi';
      await api.updateRoadStatus(primaryRoute.id, nextStatus, reason);
      onDataUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error updating road');
    } finally {
      setIsUpdatingRoad(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-85px)] bg-eoc-darkest text-slate-100 overflow-hidden relative">
      {/* Top Map Control Strip */}
      <div className="bg-eoc-darker border-b border-eoc-border px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="font-bold text-slate-100">Live Tactical GIS Command Map</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="text-slate-400 text-[11px]">
            Active Region: <b className="text-slate-200">Chamoli & Alaknanda River Basin (Lat 30.4128, Lng 79.3242)</b>
          </div>
        </div>

        {/* Road Blocker Control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">NH-58 Arterial:</span>
          <button
            onClick={handleToggleRoad}
            disabled={isUpdatingRoad}
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 shadow transition-all ${
              isPrimaryBlocked
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isPrimaryBlocked ? 'Simulate Clearing NH-58' : 'Simulate Landslide on NH-58'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Body */}
      <div className="flex-1 relative flex">
        <div className="flex-1 h-full">
          <CommandMap
            center={{ lat: disaster.coordinates.lat, lng: disaster.coordinates.lng }}
            zoom={11}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            shipments={shipments}
            evacuationRoutes={evacuationRoutes}
            disasterPolygon={disasterPolygon}
            onSelectFeature={(type, data) => setSelectedFeature({ type, data })}
          />
        </div>

        {/* Feature Inspector Panel (Right Drawer if item selected) */}
        {selectedFeature && (
          <div className="w-80 bg-eoc-darker/95 backdrop-blur-md border-l border-eoc-border h-full p-4 overflow-y-auto space-y-4 shadow-2xl z-20 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Feature Inspector
              </span>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-slate-400 hover:text-white text-base leading-none"
              >
                ✕
              </button>
            </div>

            {selectedFeature.type === 'shelter' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Building2 className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-100">{selectedFeature.data.name}</span>
                </div>
                <div className="text-slate-400">{selectedFeature.data.locationName}</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupancy:</span>
                    <span className="font-bold text-slate-200">
                      {selectedFeature.data.currentOccupancy} / {selectedFeature.data.totalCapacity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-sky-400">{selectedFeature.data.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Supply:</span>
                    <span className="text-slate-200">{selectedFeature.data.waterSupplyDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Food Supply:</span>
                    <span className="text-slate-200">{selectedFeature.data.foodSupplyDays} Days</span>
                  </div>
                </div>
              </div>
            )}

            {selectedFeature.type === 'hospital' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-blue-400">
                  <HeartPulse className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-100">{selectedFeature.data.name}</span>
                </div>
                <div className="text-slate-400">{selectedFeature.data.locationName}</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Beds:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedFeature.data.availableBeds} / {selectedFeature.data.totalBeds}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ICU Beds Free:</span>
                    <span className="font-bold text-sky-400">
                      {selectedFeature.data.icuAvailable} / {selectedFeature.data.icuTotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ambulances:</span>
                    <span className="text-slate-200">{selectedFeature.data.ambulancesAvailable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Units:</span>
                    <span className="text-slate-200">{selectedFeature.data.bloodUnitsAvailable}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedFeature.type === 'shipment' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-purple-400">
                  <Truck className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-100">{selectedFeature.data.vehicleId}</span>
                </div>
                <div className="text-slate-400">Driver: {selectedFeature.data.driverName}</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-purple-400">{selectedFeature.data.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cargo:</span>
                    <span className="text-slate-200">
                      {selectedFeature.data.quantity} {selectedFeature.data.unit} ({selectedFeature.data.resourceCategory})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="text-slate-200 truncate max-w-[140px]">{selectedFeature.data.destinationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Progress:</span>
                    <span className="font-mono font-bold text-sky-400">{selectedFeature.data.routeProgressPct}%</span>
                  </div>
                </div>
              </div>
            )}

            {selectedFeature.type === 'rescueTeam' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Shield className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-100">{selectedFeature.data.name}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Organization:</span>
                    <span className="font-bold text-indigo-300">{selectedFeature.data.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialty:</span>
                    <span className="text-slate-200">{selectedFeature.data.teamType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-mono text-slate-200">{selectedFeature.data.personnelCount} Rescuers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Boats:</span>
                    <span className="font-mono text-slate-200">{selectedFeature.data.boatsAvailable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Radio Net:</span>
                    <span className="font-mono text-sky-400">{selectedFeature.data.contactRadio}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
