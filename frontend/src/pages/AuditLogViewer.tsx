import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Shield,
  User,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../services/api';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              System Auditability
            </span>
            <span className="text-slate-400 text-xs font-mono">Immutable Compliance Ledger</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Command Actions & State Mutation Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every critical state change, resource allocation, and authority override recorded with operator credentials and timestamps.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-eoc-darker border border-eoc-border px-3 py-1.5 rounded-lg text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action or operator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-slate-200 outline-none w-44"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-eoc-darker rounded-xl border border-eoc-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-3 font-semibold">Operator & Role</th>
                <th className="py-3 px-3 font-semibold">Action</th>
                <th className="py-3 px-3 font-semibold">Target Entity</th>
                <th className="py-3 px-3 font-semibold">Previous State</th>
                <th className="py-3 px-3 font-semibold">New State</th>
                <th className="py-3 px-4 font-semibold">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{l.user}</div>
                    <span className="text-[10px] font-mono text-sky-400">{l.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-200">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{l.entity}</td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{l.oldValue}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-semibold text-[11px]">{l.newValue}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{l.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
