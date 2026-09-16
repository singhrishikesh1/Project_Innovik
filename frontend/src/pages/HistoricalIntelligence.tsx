import React from 'react';
import {
  History,
  GitFork,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const HistoricalIntelligence: React.FC = () => {
  const historicalEvents = [
    {
      name: '2013 Kedarnath Himalayan Deluge & Cloudburst',
      year: '2013',
      region: 'Mandakini & Alaknanda Valleys, Uttarakhand',
      trigger: 'Chorabari glacial moraine breach + 325mm/24h continuous monsoon downpour',
      similarity: 0.88,
      popAffected: '58,000 pilgrims & residents',
      damage: 'Over 140 bridges destroyed, road connectivity completely severed on NH-58',
      keyLesson: 'Downstream river settlements must be evacuated within first 45 minutes of upstream cloudburst detection; ridge evacuation tracks must be pre-cleared.',
      outcome: 'Multi-agency Operation Surya Hope mobilized 10,000+ troops for air evacuations.'
    },
    {
      name: '2021 Chamoli Rishi Ganga Rock-Ice Avalanche & Flash Flood',
      year: '2021',
      region: 'Ronti Peak & Dhauliganga Valley, Chamoli',
      trigger: 'Detachment of 27 million cubic meters of glacier & hanging rock wedge',
      similarity: 0.74,
      popAffected: '4,500 valley residents & workers',
      damage: 'Tapovan Vishnugad hydro tunnels inundated, 5 bridges demolished, hydro gauges destroyed',
      keyLesson: 'Automatic acoustic & seismic micro-tremor thresholding required upstream to trigger sirens before debris wavefront arrives downstream.',
      outcome: 'Zero manual warning delivered due to reliance on physical downstream gauges.'
    },
    {
      name: '2023 South Lhonak Glacial Lake Outburst Flood (GLOF)',
      year: '2023',
      region: 'Chungthang & Teesta River Basin, Sikkim',
      trigger: 'Moraine wall collapse of high-altitude South Lhonak glacial lake',
      similarity: 0.81,
      popAffected: '22,000 residents across Teesta corridor',
      damage: '1,200 MW Teesta III Chungthang dam washaway, 14 bridges lost, NH-10 severed',
      keyLesson: 'Dynamic evacuation routing must pre-calculate redundant mountain ridge bypasses when arterial valley highways are washed out.',
      outcome: 'Immediate dynamic rerouting of army relief convoys preserved logistics lifelines.'
    },
    {
      name: '2024 Wayanad Extreme Rainfall Landslides',
      year: '2024',
      region: 'Meppadi & Chooralmala, Kerala',
      trigger: '572mm rainfall accumulation over 48h triggering catastrophic slope failure',
      similarity: 0.79,
      popAffected: '8,000 residents across plantation settlements',
      damage: 'Chooralmala bridge collapsed, isolated hamlets cut off from heavy rescue equipment',
      keyLesson: 'Soil pore-water saturation index above 80% with slope >30° mandates preventative night-time evacuation before landslide trigger.',
      outcome: 'Bailey bridge launched within 71 hours to restore heavy relief machinery access.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-eoc-darkest text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-eoc-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase">
              Historical Graph Intelligence
            </span>
            <span className="text-slate-400 text-xs font-mono">GraphRAG Pattern Reasoning</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
            Historical Disaster Knowledge Base & Graph Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Knowledge graph cross-referencing multi-hazard triggers, terrain vulnerabilities, and response outcomes across historical events.
          </p>
        </div>
      </div>

      {/* Graph Relationship Card (PART 28) */}
      <div className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <GitFork className="w-4 h-4" />
          <span>Knowledge Graph Schema & Causal Chain</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-slate-900/80 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-800 text-red-300 font-bold">Disaster</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">Location</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold">Trigger</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">Environmental Conditions</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-bold">Population Impact</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold">Outcome & Lessons</span>
        </div>
      </div>

      {/* Historical Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {historicalEvents.map(h => (
          <div key={h.name} className="bg-eoc-darker p-5 rounded-xl border border-eoc-border space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold">
                  Similarity Match: {(h.similarity * 100).toFixed(0)}%
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">{h.year}</span>
              </div>

              <div className="font-bold text-slate-100 text-sm">{h.name}</div>
              <div className="text-[11px] text-slate-400">{h.region}</div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Geomorphic Trigger:</span>
                  <span className="text-slate-200">{h.trigger}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Observed Damage:</span>
                  <span className="text-slate-300">{h.damage}</span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Key Operational Lesson:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{h.keyLesson}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
              Outcome: {h.outcome}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
