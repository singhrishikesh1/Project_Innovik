import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin
} from 'lucide-react';
import { EmergencyTask } from '../types';
import { api } from '../services/api';

interface TaskManagementProps {
  tasks: EmergencyTask[];
  onTasksUpdated: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ tasks, onTasksUpdated }) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newTeam, setNewTeam] = useState<string>('NDRF Unit Alpha');
  const [newLocation, setNewLocation] = useState<string>('Chamoli Low-Lying Sector');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createTask({
        title: newTitle,
        priority: newPriority,
        assignedTeam: newTeam,
        locationName: newLocation,
        deadlineMinutes: 45
      });
      setNewTitle('');
      setShowCreateModal(false);
      onTasksUpdated();
    } catch (e: any) {
      alert(e?.message || 'Error creating task');
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
              Field Operations
            </span>
            <span className="text-slate-400 text-xs font-mono">Response SLA & Execution Board</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Emergency Tactical Task Command Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational mission assignment, deadline tracking, and real-time execution monitoring for deployed responder units.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tactical Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(t => {
          const isCritical = t.priority === 'CRITICAL';
          return (
            <div
              key={t.id}
              className={`bg-eoc-darker p-4 rounded-xl border flex flex-col justify-between space-y-3 shadow-lg ${
                isCritical ? 'border-red-600/70 ring-1 ring-red-500/20' : 'border-eoc-border'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isCritical
                      ? 'bg-red-500/20 text-red-300'
                      : t.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {t.priority} PRIORITY
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                </div>

                <div className="font-bold text-slate-100 text-xs leading-snug">{t.title}</div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      Assigned:
                    </span>
                    <span className="font-semibold text-slate-200">{t.assignedTeam}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      Target:
                    </span>
                    <span className="text-slate-300">{t.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400" />
                      SLA Target:
                    </span>
                    <span className="font-mono text-rose-300">{t.deadlineMinutes} Minutes</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status: <b className="text-sky-400 font-mono">{t.status}</b></span>
                <span className="text-emerald-400 font-mono text-[10px]">Active Operations</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-darker border border-sky-600 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="text-sm font-bold text-slate-100 flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Issue New Response Task</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Task Title / Objective</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Deploy 2 inflatable boats to Helang ghat"
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Team</label>
                  <select
                    value={newTeam}
                    onChange={e => setNewTeam(e.target.value)}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
                  >
                    <option value="NDRF Unit Alpha">NDRF Unit Alpha</option>
                    <option value="NDRF Unit Bravo">NDRF Unit Bravo</option>
                    <option value="SDRF Uttarakhand">SDRF Uttarakhand</option>
                    <option value="Indian Army 14 Garhwal">Indian Army 14 Garhwal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {isSubmitting ? 'Creating...' : 'Assign Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
