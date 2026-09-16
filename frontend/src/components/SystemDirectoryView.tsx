import React from 'react';
import { ArrowLeft, Satellite, Zap, Shield, FileText, ExternalLink } from 'lucide-react';

interface SystemDirectoryViewProps {
  onNavigate: (pageId: string) => void;
  onBackToDashboard: () => void;
  onDownloadPDF: () => void;
}

export const SystemDirectoryView: React.FC<SystemDirectoryViewProps> = ({
  onNavigate,
  onBackToDashboard,
  onDownloadPDF
}) => {
  const sections = [
    {
      category: "SATELLITE EARTH OBSERVATION & REMOTE SENSING",
      icon: "📡",
      countLabel: "5 Systems",
      cards: [
        {
          tag: "STUDIO · GROUNDING",
          title: "SatQuery AI Studio",
          desc: "Full-screen satellite analysis canvas with interactive leaflet polygons and spectral charts.",
          pageId: "satellite"
        },
        {
          tag: "COMMAND · SATELLITES",
          title: "SatQuery Tasking Console",
          desc: "Satellite sensor tasking matrix, constellation pass timetable, and orbital telemetry.",
          pageId: "satellite"
        },
        {
          tag: "CONSTELLATION · OPS",
          title: "Copernicus Sensor Console",
          desc: "Sentinel-1A/B radar backscatter calibration and Sentinel-2 optical multispectral feeds.",
          pageId: "satellite"
        },
        {
          tag: "METEOROLOGY · RADAR",
          title: "Doppler Weather Radar Intel",
          desc: "IMD Automatic Weather Station telemetry, precipitation rates, and cloudburst tracking.",
          pageId: "sensors"
        },
        {
          tag: "SPATIAL · FULLSCREEN",
          title: "Tactical GIS Spatial Map",
          desc: "Full-window multi-layer geospatial situational map with fault lines, DEM, and safe zones.",
          pageId: "gis-map"
        }
      ]
    },
    {
      category: "AUTONOMOUS MULTI-HAZARD ML ENGINES",
      icon: "⚡",
      countLabel: "6 Models",
      cards: [
        {
          tag: "ENGINE · FLOODNET",
          title: "Flood Forecasting Engine",
          desc: "Catchment runoff simulation, reservoir gate discharge, and breach lead-time calculation.",
          pageId: "prediction"
        },
        {
          tag: "ENGINE · SKEPTIC AGENT",
          title: "Skeptic Verification Agent",
          desc: "Independent multi-sensor cross-validation suppressing false alarms before alert sound.",
          pageId: "prediction"
        },
        {
          tag: "ENGINE · HISTORICAL",
          title: "GraphRAG Analogy Engine",
          desc: "Comparative hazard matching against Kedarnath 2013, Chamoli 2021, Sikkim, and Wayanad.",
          pageId: "historical"
        },
        {
          tag: "AI OPS · REGISTRY",
          title: "16 Model Registry & Tuning",
          desc: "Latency benchmarks, ROC-AUC curves, hyperparameter tuning, and model serialization sandbox.",
          pageId: "prediction"
        },
        {
          tag: "MLOPS · DRIFT",
          title: "ML Performance Monitor",
          desc: "Continuous accuracy surveillance, concept drift detection, and automated retraining triggers.",
          pageId: "resource-perf"
        },
        {
          tag: "ANALYTICS · MULTI-HAZARD",
          title: "Disaster Operations Analytics",
          desc: "Cross-hazard compound indices, historical severity comparisons, and executive dashboards.",
          pageId: "impact-assessment"
        }
      ]
    },
    {
      category: "TACTICAL COMMAND & EXECUTIVE HEADQUARTERS",
      icon: "🛡",
      countLabel: "7 Systems",
      cards: [
        {
          tag: "EXECUTIVE · COMMAND",
          title: "Admin Command Headquarters",
          desc: "Primary EOC tactical matrix, crisis status, and inter-agency dispatch coordination.",
          pageId: "command-center"
        },
        {
          tag: "NLP · INTELLIGENCE",
          title: "NLP News Stream & Geocoder",
          desc: "Citizen emergency signal classification, entity extraction, and live distress geolocation.",
          pageId: "incident-details"
        },
        {
          tag: "DISPATCH · CAP 1.2",
          title: "Early Warning Broadcast Center",
          desc: "Multi-channel broadcast dispatch across sirens, cell SMS, and Hindi/English voice sirens.",
          pageId: "early-warning"
        },
        {
          tag: "ROUTING · RAY-CASTING",
          title: "Evacuation Corridor Router",
          desc: "Dynamic graph routing with automated NH-58 debris blockage detection and Ridge Bypass.",
          pageId: "evacuation"
        },
        {
          tag: "LOGISTICS · CONSERVATION",
          title: "Resource Inventory & Fleet",
          desc: "Mathematical inventory invariant ledger: Total = Avail + Alloc + Transit + Deliv + Consumed.",
          pageId: "resources"
        },
        {
          tag: "SHELTER & HEALTHCARE",
          title: "Shelters & Hospital Beds",
          desc: "Occupancy meters, Sphere standards ration days, trauma ICU beds, and ambulance staging.",
          pageId: "shelters"
        },
        {
          tag: "REPORTING · 1-CLICK PDF",
          title: "Official Disaster Incident Report",
          desc: "Publication-grade 20-section printable PDF incident report with 1-click download.",
          pageId: "report-viewer"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="border-b border-white/10 bg-[#090e1c] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">VajraWatch</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
              System Directory & Architecture Catalog
            </span>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="text-xs px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
        >
          Return to Dashboard →
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-10">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            {/* Category Header Strip matching Screenshot 4 */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                <span>{section.icon}</span>
                <span>{section.category}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                {section.countLabel}
              </span>
            </div>

            {/* Cards Grid matching Screenshot 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.cards.map((card, cIdx) => (
                <div
                  key={cIdx}
                  onClick={() => onNavigate(card.pageId)}
                  className="p-5 rounded-xl bg-[#0b1122] border border-white/10 hover:border-sky-500/40 hover:bg-[#0e162b] cursor-pointer transition-all space-y-2 group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono font-bold text-sky-400 tracking-wider uppercase">
                      {card.tag}
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                      <span>{card.title}</span>
                      <span className="text-xs text-slate-500 group-hover:text-sky-400 font-mono">↗</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] font-mono text-slate-500 group-hover:text-sky-400 flex items-center gap-1 transition-colors">
                    <span>Launch Module</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};
