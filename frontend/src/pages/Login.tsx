import React, { useState } from 'react';
import {
  Lock,
  Shield,
  UserCheck,
  CheckCircle2,
  Key,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';
import { setOperatorIdentity, getOperatorIdentity } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const current = getOperatorIdentity();
  const [selectedRole, setSelectedRole] = useState<UserRole>(current.role);
  const [operatorName, setOperatorName] = useState<string>(current.user);

  const rolesList: { role: UserRole; title: string; desc: string; permissions: string }[] = [
    {
      role: 'DISASTER_MANAGER',
      title: 'District Disaster Management Officer (DDMO)',
      desc: 'Overall incident commander. Can approve public warnings, authorize evacuations, and close incidents.',
      permissions: 'Full Operational Authority'
    },
    {
      role: 'ADMIN',
      title: 'State System Administrator',
      desc: 'Unrestricted state operations, user management, and platform override permissions.',
      permissions: 'Root Security Access'
    },
    {
      role: 'FIELD_COORDINATOR',
      title: 'Field Response Coordinator',
      desc: 'On-ground operational commander. Can update road blockage statuses and assign rescue missions.',
      permissions: 'Field Tactics & Routing'
    },
    {
      role: 'RESOURCE_MANAGER',
      title: 'Emergency Resource & Depot Manager',
      desc: 'Maintains depot balances and allocates food, water, medical kits, and generators.',
      permissions: 'Inventory & Allocations'
    },
    {
      role: 'LOGISTICS_COORDINATOR',
      title: 'Fleet & Logistics Dispatcher',
      desc: 'Manages convoy movements, vehicle dispatches, and shipment delivery confirmations.',
      permissions: 'Logistics Fleet Dispatch'
    },
    {
      role: 'MEDICAL_COORDINATOR',
      title: 'Chief Medical Officer (CMO) Liaison',
      desc: 'Oversees trauma center triage, ICU headroom, ambulance readiness, and blood bank stocks.',
      permissions: 'Medical & Hospital Coordination'
    },
    {
      role: 'ANALYST',
      title: 'VajraWatch Scientific Data Analyst',
      desc: 'Analyzes meteorological radar, satellite SAR passes, and hydrological gauge readings.',
      permissions: 'Intelligence & Telemetry Read/Write'
    },
    {
      role: 'VIEWER',
      title: 'Public / Observer Read-Only Profile',
      desc: 'Read-only access for inter-agency observers, media monitors, and humanitarian auditors.',
      permissions: 'Read-Only Observation'
    }
  ];

  const handleApplyRole = (role: UserRole, title: string) => {
    setSelectedRole(role);
    setOperatorName(title);
    setOperatorIdentity(role, title);
    onLoginSuccess();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-eoc-darkest text-slate-100 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Role-Based Operational Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Select Active Command Credentials
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Test and evaluate permissions across all 8 emergency command hierarchy roles during hackathon demonstration.
          </p>
        </div>

        {/* Roles Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesList.map(r => {
            const isSelected = selectedRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => handleApplyRole(r.role, r.title)}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/30 shadow-xl'
                    : 'bg-eoc-darker/80 border-eoc-border hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      {r.role}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Profile
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-100 text-sm">{r.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Scope: {r.permissions}</span>
                  <button
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Switch to Role'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
