import React from 'react';
import { 
  X, 
  Map, 
  Cpu, 
  CheckCircle2, 
  Radio, 
  Navigation, 
  Warehouse, 
  Truck, 
  Home, 
  HeartPulse, 
  ShieldAlert, 
  CheckSquare, 
  Satellite, 
  Activity, 
  History, 
  FileText, 
  AlertOctagon, 
  TrendingUp, 
  Database, 
  Lock, 
  Settings, 
  FileDown 
} from 'lucide-react';

interface SystemDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const SystemDirectoryModal: React.FC<SystemDirectoryModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  const handleSelect = (pageId: string) => {
    onNavigate(pageId);
    onClose();
  };

  const categories = [
    {
      title: "Core Operations & GIS Mapping",
      items: [
        { id: "command-center", label: "EOC Command Center (Tactical)", icon: Map, desc: "Primary tactical EOC overview with live feeds" },
        { id: "gis-map", label: "Fullscreen GIS Map (24 Layers)", icon: Map, desc: "Interactive Leaflet GIS workbench with layer controls" },
        { id: "incident-details", label: "Incident Master Record", icon: Activity, desc: "Official chronology and meteorological baseline" },
        { id: "early-warning", label: "Early Warning Broadcast Center", icon: Radio, desc: "CAP 1.2 multi-channel dispatch with voice sirens" },
        { id: "evacuation", label: "Evacuation Corridor Planner", icon: Navigation, desc: "Graph router with real-time blockage detection" },
      ]
    },
    {
      title: "Intelligence & Verification Engines",
      items: [
        { id: "prediction", label: "VajraWatch 8-Feature Risk Engine", icon: Cpu, desc: "Deterministic numerical hazard risk calculator" },
        { id: "skeptic-agent", label: "Independent Skeptic Verification Agent", icon: CheckCircle2, desc: "Multi-sensor cross-validation and anomaly detection" },
        { id: "satellite", label: "Satellite SAR & NDWI Analysis", icon: Satellite, desc: "Sentinel-1 & Sentinel-2 before/after flood slider" },
        { id: "sensors", label: "IoT Telemetry Gauges", icon: Activity, desc: "CWC and IMD real-time hydrological sensors" },
        { id: "historical", label: "GraphRAG Historical Intelligence", icon: History, desc: "Analogical matching with Kedarnath, Chamoli, Sikkim" },
      ]
    },
    {
      title: "Logistics, Relief & Healthcare",
      items: [
        { id: "resources", label: "Resource Inventory Management", icon: Warehouse, desc: "Strict mathematical inventory conservation" },
        { id: "allocations", label: "Sphere Standards Allocation Engine", icon: ShieldAlert, desc: "Humanitarian demand benchmarks and priority ranking" },
        { id: "logistics", label: "Logistics Fleet & Convoy Tracking", icon: Truck, desc: "Real-time truck coordinates, ETAs, and road progress" },
        { id: "shelters", label: "Shelter Camp Operations", icon: Home, desc: "Bed occupancy meters and supply day reserves" },
        { id: "hospitals", label: "Hospital Trauma & ICU Beds", icon: HeartPulse, desc: "Trauma beds, ambulances, and blood supply" },
        { id: "rescue-teams", label: "NDRF / SDRF Tactical Teams", icon: ShieldAlert, desc: "Rescue personnel, Zodiac boats, and comm frequencies" },
        { id: "tasks", label: "Tactical Incident Task Board", icon: CheckSquare, desc: "Time-critical task assignment and tracking" },
      ]
    },
    {
      title: "Post-Disaster Forensics & Reports",
      items: [
        { id: "post-disaster", label: "15-Section Forensic Analysis", icon: FileText, desc: "Post-disaster timelines, forensic review, lessons learned" },
        { id: "damage", label: "Infrastructure Damage Catalog", icon: AlertOctagon, desc: "Damage inspection records and reconstruction budgets" },
        { id: "resource-perf", label: "Logistics & Response Performance KPIs", icon: TrendingUp, desc: "Supply flow graphs and 89.4/100 efficiency score" },
        { id: "report-viewer", label: "Official Disaster Incident Report (PDF)", icon: FileDown, desc: "Printable multi-page PDF report with 1-click download" },
      ]
    },
    {
      title: "Governance, Security & Settings",
      items: [
        { id: "data-sources", label: "Data Ingestion Telemetry Health", icon: Database, desc: "Sensor health, update frequencies, fallback guarantees" },
        { id: "audit-logs", label: "Immutable Compliance Audit Trail", icon: Lock, desc: "Tamper-evident logs of all operational actions" },
        { id: "login", label: "RBAC Role Profile Switcher", icon: Lock, desc: "Switch between 8 emergency authority profiles" },
        { id: "settings", label: "Platform Thresholds & Hotlines", icon: Settings, desc: "Risk thresholds and emergency contact hotlines" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#090e1c] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0b1122]">
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>System Directory & Operational Catalog</span>
              <span className="text-xs font-mono font-normal text-slate-400">24 Modular Views</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct access to all specialized predictive, operational, and forensic sub-systems.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2.5">
              <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                {cat.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {cat.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="p-3 rounded-xl bg-[#0e162b] border border-white/5 hover:border-sky-500/40 hover:bg-[#121c36] cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-sky-500/20 text-slate-300 group-hover:text-sky-300 transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                          {item.label}
                          <span className="text-[10px] text-slate-500 group-hover:text-sky-400 font-mono">↗</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0b1122] flex items-center justify-between text-xs text-slate-400">
          <span>Tip: You can return to Tactical Command anytime using the top navigation.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
