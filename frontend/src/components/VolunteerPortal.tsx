import React, { useState } from 'react';
import { Users, Radio, CheckSquare, ArrowLeft, Shield, MapPin, CheckCircle, Clock } from 'lucide-react';
import { EmergencyTask, Shelter } from '../types';

interface VolunteerPortalProps {
  shelters: Shelter[];
  tasks: EmergencyTask[];
  onBack: () => void;
  onOpenDashboard: () => void;
}

export const VolunteerPortal: React.FC<VolunteerPortalProps> = ({
  shelters,
  tasks,
  onBack,
  onOpenDashboard
}) => {
  const [registered, setRegistered] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [skillSet, setSkillSet] = useState('First Aid / Medical Care');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#090e1c] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-base">VajraWatch</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
              Volunteer & Civil Defense Network
            </span>
          </div>
        </div>

        <button
          onClick={onOpenDashboard}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
        >
          Open Operational Dashboard →
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Volunteer Check-In Banner */}
        <div className="p-5 rounded-xl bg-[#0b1122] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Community Volunteer & Civil Defense Operations
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Coordinate field activities with NDRF and SDRF tactical units. Report check-ins, claim relief tasks, and ensure humanitarian standards are upheld in emergency relief shelters.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Tactical VHF Net: <strong>148.650 MHz</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Volunteer Registration */}
          <div className="p-5 rounded-xl bg-[#0b1122] border border-white/10 space-y-4">
            <h2 className="font-semibold text-sm text-white">Volunteer Shift Check-in</h2>

            {registered ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-white">Checked in as Active Volunteer</div>
                <div className="text-[11px] text-slate-300 font-mono">{volunteerName} · {skillSet}</div>
                <div className="text-[10px] text-emerald-400 font-mono">Assigned Sector: Pipalkoti Central Depot</div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Anjali Sharma"
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Primary Skill / Capability</label>
                  <select
                    value={skillSet}
                    onChange={(e) => setSkillSet(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>First Aid / Medical Care</option>
                    <option>Heavy Vehicle / Convoy Driving</option>
                    <option>Shelter Food & Water Distribution</option>
                    <option>Search & Rescue Support (Swift Water)</option>
                    <option>Bilingual Comms / Translation</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Register & Check In
                </button>
              </form>
            )}

            {/* Tactical Comms Frequencies */}
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <span className="font-semibold text-slate-300">Field Communication Frequencies</span>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>SDRF Tactical Net:</span>
                  <span className="text-sky-400">148.650 MHz</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics Convoy Net:</span>
                  <span className="text-sky-400">152.125 MHz</span>
                </div>
                <div className="flex justify-between">
                  <span>Shelter Coordination:</span>
                  <span className="text-sky-400">155.800 MHz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns: Active Field Tasks Requiring Responders */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-400" />
                Active Volunteer Task Assignments
              </h2>
              <span className="text-xs text-slate-400 font-mono">Real-time Coordination</span>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map(task => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTask === task.id
                      ? 'bg-sky-950/40 border-sky-500/50'
                      : 'bg-[#0b1122] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{task.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          task.priority === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">Required: {task.requiredResources}</p>
                    </div>

                    <button
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-colors ${
                        selectedTask === task.id
                          ? 'bg-sky-600 text-white'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200'
                      }`}
                    >
                      {selectedTask === task.id ? 'Claimed ✓' : 'Claim Task'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 mt-2 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {task.locationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Deadline: {task.deadlineMinutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
