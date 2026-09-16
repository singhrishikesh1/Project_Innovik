import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Filter,
  Radio
} from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types';
import { api, getOperatorIdentity } from '../services/api';

interface LogisticsTrackingProps {
  shipments: Shipment[];
  onShipmentsUpdated: () => void;
}

export const LogisticsTracking: React.FC<LogisticsTrackingProps> = ({
  shipments,
  onShipmentsUpdated
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredShipments = selectedStatus === 'ALL'
    ? shipments
    : shipments.filter(s => s.status === selectedStatus);

  const handleStatusChange = async (id: string, status: ShipmentStatus) => {
    setIsUpdating(id);
    try {
      await api.updateShipment(id, { status });
      onShipmentsUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error updating shipment status');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono text-xs font-bold uppercase">
              Fleet Operations Desk
            </span>
            <span className="text-amber-300 text-xs font-mono">Simulation / Demo GPS Tracking</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Logistics Command Center & Relief Convoy Fleet Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end telemetry monitoring supply movement from regional warehouses to frontline emergency shelters.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-eoc-darker border border-eoc-border px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              {['ALL', 'PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED'].map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Convoys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShipments.map(s => {
          const isDelayed = s.status === 'DELAYED';
          const isDelivered = s.status === 'DELIVERED';
          return (
            <div
              key={s.id}
              className={`bg-eoc-darker p-4 rounded-xl border flex flex-col justify-between space-y-3 shadow-lg transition-all ${
                isDelayed
                  ? 'border-red-600/80 ring-1 ring-red-500/30'
                  : isDelivered
                  ? 'border-emerald-700/60'
                  : 'border-eoc-border'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    {s.vehicleId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isDelayed
                      ? 'bg-red-500/20 text-red-300'
                      : isDelivered
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="font-bold text-slate-100 text-xs">{s.resourceName}</div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Origin:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{s.originName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Destination:</span>
                    <span className="text-sky-300 truncate max-w-[150px] font-semibold">{s.destinationName}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Driver / Team:</span>
                    <span className="text-slate-300">{s.driverName} ({s.assignedTeam})</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1 font-mono">
                    <span className="text-slate-400">Transit Progress</span>
                    <span className="text-sky-400 font-bold">{s.routeProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDelayed ? 'bg-red-500' : isDelivered ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${s.routeProgressPct}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-amber-300 font-mono">
                  GPS: {s.currentCoords.lat.toFixed(4)}, {s.currentCoords.lng.toFixed(4)} (Simulated Stream)
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-[10px]">
                <span className="text-slate-500">Update Status:</span>
                <div className="flex items-center gap-1">
                  {s.status !== 'IN_TRANSIT' && !isDelivered && (
                    <button
                      onClick={() => handleStatusChange(s.id, 'IN_TRANSIT')}
                      disabled={isUpdating === s.id}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium"
                    >
                      In Transit
                    </button>
                  )}
                  {s.status !== 'DELAYED' && !isDelivered && (
                    <button
                      onClick={() => handleStatusChange(s.id, 'DELAYED')}
                      disabled={isUpdating === s.id}
                      className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800 font-medium"
                    >
                      Delayed
                    </button>
                  )}
                  {!isDelivered && (
                    <button
                      onClick={() => handleStatusChange(s.id, 'DELIVERED')}
                      disabled={isUpdating === s.id}
                      className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 font-bold"
                    >
                      Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
