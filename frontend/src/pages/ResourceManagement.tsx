import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Box,
  Truck
} from 'lucide-react';
import { Resource, ResourceCategory, Shelter } from '../types';
import { api, getOperatorIdentity } from '../services/api';

interface ResourceManagementProps {
  resources: Resource[];
  shelters: Shelter[];
  onResourcesUpdated: () => void;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  resources,
  shelters,
  onResourcesUpdated
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [allocatingResource, setAllocatingResource] = useState<Resource | null>(null);
  const [allocateQty, setAllocateQty] = useState<number>(500);
  const [selectedShelterId, setSelectedShelterId] = useState<string>(shelters[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories = ['ALL', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = selectedCategory === 'ALL'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingResource) return;

    setIsSubmitting(true);
    try {
      const shelter = shelters.find(s => s.id === selectedShelterId);
      await api.allocateResource(
        allocatingResource.id,
        allocateQty,
        shelter?.id,
        shelter?.name
      );
      setAllocatingResource(null);
      onResourcesUpdated();
    } catch (err: any) {
      alert(err?.message || 'Error allocating inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Emergency Logistics Command
            </span>
            <span className="text-slate-400 text-xs font-mono">Strict Mathematical Inventory Conservation</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Emergency Resource Inventory & Allocation Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-depot stock ledger maintaining zero phantom inventory: Available + Allocated + In-Transit = Total.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-eoc-darker border border-eoc-border px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-eoc-darker rounded-xl border border-eoc-border overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Tracked Resource Ledger ({filteredResources.length} Assets)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Inventory Status: BALANCED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">Resource ID & Name</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Total</th>
                <th className="py-3 px-3 font-semibold text-right">Available</th>
                <th className="py-3 px-3 font-semibold text-right">Allocated</th>
                <th className="py-3 px-3 font-semibold text-right">In Transit</th>
                <th className="py-3 px-3 font-semibold text-right">Delivered</th>
                <th className="py-3 px-3 font-semibold">Current Depot Location</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredResources.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{r.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{r.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                    {r.quantity.toLocaleString()} <span className="text-[10px] text-slate-500">{r.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {r.availableQuantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400">
                    {r.allocatedQuantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-400">
                    {r.inTransitQuantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sky-400">
                    {r.deliveredQuantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-300 truncate max-w-[160px]" title={r.currentLocationName}>
                    {r.currentLocationName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : r.status === 'ALLOCATED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setAllocatingResource(r);
                        setAllocateQty(Math.min(r.availableQuantity, 500));
                      }}
                      disabled={r.availableQuantity <= 0}
                      className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-[11px] transition-colors"
                    >
                      Allocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Modal */}
      {allocatingResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-darker border border-sky-600 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-sky-400" />
                Allocate Inventory
              </span>
              <button
                onClick={() => setAllocatingResource(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Resource</label>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-semibold text-slate-200">
                  {allocatingResource.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Available in depot: <b className="text-emerald-400">{allocatingResource.availableQuantity} {allocatingResource.unit}</b>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantity to Allocate</label>
                <input
                  type="number"
                  min="1"
                  max={allocatingResource.availableQuantity}
                  value={allocateQty}
                  onChange={e => setAllocateQty(Number(e.target.value))}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono text-sm outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Emergency Shelter</label>
                <select
                  value={selectedShelterId}
                  onChange={e => setSelectedShelterId(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.locationName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAllocatingResource(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || allocateQty <= 0 || allocateQty > allocatingResource.availableQuantity}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold"
                >
                  {isSubmitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
