import React from 'react';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  BarChart2,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ResponsePerformanceKPI } from '../types';

interface ResourcePerformanceProps {
  performance: ResponsePerformanceKPI;
}

export const ResourcePerformance: React.FC<ResourcePerformanceProps> = ({ performance }) => {
  const chartData = [
    { name: 'Food Rations', required: 10000, available: 6200, delivered: 7500, consumed: 5800 },
    { name: 'Potable Water (L/10)', required: 2500, available: 1650, delivered: 1720, consumed: 1450 },
    { name: 'Trauma Kits', required: 150, available: 95, delivered: 120, consumed: 90 },
    { name: 'Thermal Blankets', required: 5000, available: 4200, delivered: 3500, consumed: 3200 },
    { name: 'Rescue Boats', required: 12, available: 8, delivered: 8, consumed: 8 }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Operations Analytics
            </span>
            <span className="text-slate-400 text-xs font-mono">Forensic Metric Verification</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Resource Consumption & Response Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantitative analysis measuring operational lead-times, deployment velocity, and supply chain fulfillment.
          </p>
        </div>
      </div>

      {/* Platform Response Performance Indicator (PART 21) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-emerald-800/40 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Platform Response Performance Indicator
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Algorithmic benchmark rating command efficiency (Non-Government Evaluation)
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-extrabold text-emerald-400">
              {performance.platformResponsePerformanceScore}
            </span>
            <span className="text-sm font-mono text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Detection Latency</div>
            <div className="font-mono font-bold text-sky-400 text-base">{performance.detectionTimeMin} Mins</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Warning Lead Time</div>
            <div className="font-mono font-bold text-emerald-400 text-base">4.3 Hours</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Deploy Response</div>
            <div className="font-mono font-bold text-sky-400 text-base">{performance.responseDeploymentTimeMin} Mins</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Evac Completion</div>
            <div className="font-mono font-bold text-amber-300 text-base">{performance.evacuationCompletionPct}%</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Avg Fleet Delay</div>
            <div className="font-mono font-bold text-purple-400 text-base">{performance.avgLogisticsDelayMin} Mins</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[10px]">Shelter Utilization</div>
            <div className="font-mono font-bold text-slate-200 text-base">{performance.shelterCapacityUtilizationPct}%</div>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart: Required vs Available vs Delivered vs Consumed (PART 20) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Supply Fulfillment: Required vs Available vs Delivered vs Consumed
            </h3>
            <p className="text-xs text-slate-400">Inventory lifecycle progression across high-priority relief lines.</p>
          </div>
          <span className="text-xs font-mono text-sky-400">Strict Conservation Metric</span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="required" fill="#ef4444" name="Required (Estimate)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available" fill="#38bdf8" name="Available (Depot)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" fill="#10b981" name="Delivered (Shelters)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="consumed" fill="#a855f7" name="Consumed (Field)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
