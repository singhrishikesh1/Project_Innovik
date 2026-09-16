import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertOctagon,
  Map,
  FileText,
  Building2,
  Truck,
  Layers,
  HeartPulse,
  Users,
  Compass,
  ListTodo,
  Satellite,
  Radio,
  History,
  TrendingDown,
  Archive,
  Printer,
  Sliders,
  Database,
  ShieldAlert,
  ClipboardList,
  Crosshair,
  Lock
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

interface NavGroup {
  label: string;
  items: { id: string; label: string; icon: React.FC<{ className?: string }> }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const groups: NavGroup[] = [
    {
      label: 'Operational Command',
      items: [
        { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'gis-map', label: 'Live GIS Map (24 Layers)', icon: Map },
        { id: 'incident-details', label: 'Incident Log & Timeline', icon: ClipboardList }
      ]
    },
    {
      label: 'Prediction & Verification',
      items: [
        { id: 'prediction', label: 'VajraWatch Risk Engine', icon: Activity },
        { id: 'early-warning', label: 'Early Warning Center', icon: AlertOctagon },
        { id: 'sensors', label: 'IoT Sensors & Hydrology', icon: Radio },
        { id: 'satellite', label: 'Satellite Analysis & SAR', icon: Satellite }
      ]
    },
    {
      label: 'Impact & Evacuation',
      items: [
        { id: 'impact-assessment', label: 'PostGIS Impact Assessment', icon: Crosshair },
        { id: 'evacuation', label: 'Dynamic Evacuation Router', icon: Compass }
      ]
    },
    {
      label: 'Response & Logistics',
      items: [
        { id: 'resources', label: 'Emergency Inventory', icon: Layers },
        { id: 'allocations', label: 'Priority Allocation Engine', icon: Building2 },
        { id: 'logistics', label: 'Logistics & Fleet Tracking', icon: Truck },
        { id: 'shelters', label: 'Shelter Management', icon: Building2 },
        { id: 'hospitals', label: 'Medical & Hospital Trauma', icon: HeartPulse },
        { id: 'rescue-teams', label: 'NDRF / SDRF Rescue Teams', icon: Users },
        { id: 'tasks', label: 'Operational Task Board', icon: ListTodo }
      ]
    },
    {
      label: 'Post-Disaster Intelligence',
      items: [
        { id: 'post-disaster', label: 'Post-Disaster Analysis (15 Sections)', icon: TrendingDown },
        { id: 'damage', label: 'Damage Assessment Catalog', icon: ShieldAlert },
        { id: 'resource-perf', label: 'Resource Performance Metrics', icon: Layers },
        { id: 'historical', label: 'Historical Graph Intelligence', icon: History },
        { id: 'reports', label: 'Incident Reports Archive', icon: Archive },
        { id: 'report-viewer', label: 'Disaster Report & PDF Export', icon: Printer }
      ]
    },
    {
      label: 'System & Governance',
      items: [
        { id: 'data-sources', label: 'Data Sources & Fallbacks', icon: Database },
        { id: 'audit-logs', label: 'Immutable Audit Log', icon: FileText },
        { id: 'settings', label: 'Agency Settings & Thresholds', icon: Sliders },
        { id: 'login', label: 'Authentication & Roles', icon: Lock }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-eoc-darker border-r border-eoc-border flex flex-col h-[calc(100vh-85px)] select-none">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="truncate text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status Tag */}
      <div className="p-3 border-t border-eoc-border bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">VajraWatch Telemetry:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ONLINE
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">PostGIS Engine:</span>
          <span className="text-sky-400 font-mono">ACTIVE (30m DEM)</span>
        </div>
      </div>
    </aside>
  );
};
