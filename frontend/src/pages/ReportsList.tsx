import React from 'react';
import {
  Archive,
  FileText,
  Printer,
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ReportsListProps {
  onOpenReport: () => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({ onOpenReport }) => {
  const reports = [
    {
      id: 'REP-2026-UK-001',
      title: 'Official Post-Disaster Incident & Operational Response Report',
      disaster: 'Chamoli Cloudburst & Alaknanda Flash Flood Emergency',
      date: '16 September 2026',
      status: 'VERIFIED FINAL',
      version: '2.0-OFFICIAL',
      sections: 20
    },
    {
      id: 'REP-HIST-2021-04',
      title: 'Post-Event Forensic Assessment: Tapovan Rishi Ganga GLOF',
      disaster: '2021 Rishi Ganga Flash Flood & Tapovan Breach',
      date: '12 February 2021',
      status: 'ARCHIVED',
      version: '1.4-HISTORICAL',
      sections: 18
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Incident Documentation
            </span>
            <span className="text-slate-400 text-xs font-mono">Official PDF Archives</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Official Disaster Incident Reports Archive
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed and automated 20-section post-disaster audit documents.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {reports.map(r => (
          <div
            key={r.id}
            className="bg-eoc-darker p-5 rounded-xl border border-eoc-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  {r.status}
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">{r.id}</span>
              </div>
              <div className="font-bold text-slate-100 text-sm">{r.title}</div>
              <div className="text-xs text-slate-400">{r.disaster}</div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {r.date}
                </span>
                <span>Version: {r.version}</span>
                <span>{r.sections} Document Sections</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenReport}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>View & Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
