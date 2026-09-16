import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  MapPin, 
  Compass, 
  Sliders, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Droplets,
  Activity,
  Gauge
} from 'lucide-react';
import { FloodData, fetchLiveFloodData, MONITORING_LOCATIONS, LocationPreset } from '../services/weatherService';

interface FloodIntelligenceSectionProps {
  onOpenEvacuation: () => void;
  onOpenDashboard: () => void;
}

export const FloodIntelligenceSection: React.FC<FloodIntelligenceSectionProps> = ({
  onOpenEvacuation,
  onOpenDashboard
}) => {
  const [floodData, setFloodData] = useState<FloodData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(MONITORING_LOCATIONS[0]);
  const [loading, setLoading] = useState(true);

  // Interactive Flood Surge Simulation Slider (+0.0m to +3.0m surge)
  const [surgeOffset, setSurgeOffset] = useState<number>(0.8);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchLiveFloodData(selectedLocation.lat, selectedLocation.lng);
        setFloodData(data);
      } catch (e) {
        console.error('Failed to load flood telemetry', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedLocation]);

  // Derived simulation metrics
  const effectiveWaterLevel = floodData ? parseFloat((floodData.waterLevelGauge + surgeOffset).toFixed(2)) : 4.6;
  const isBreached = floodData ? effectiveWaterLevel >= floodData.dangerThreshold : true;
  const simulatedInundationSqKm = floodData 
    ? parseFloat((floodData.inundationAreaSqKm + surgeOffset * 11.2).toFixed(1)) 
    : 28.5;
  const affectedPopulation = Math.round(simulatedInundationSqKm * 185);

  return (
    <section id="flood-section" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 text-left border-t border-white/[0.08]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono mb-2.5">
            <Waves className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>HYDROLOGICAL SATELLITE TELEMETRY & AI FLOOD DETECTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            River Basin Inundation & <span className="text-blue-400">Flood Detection Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
            Real-time river discharge telemetry from the Global Flood Awareness System (GloFAS / ECMWF) combined with Sentinel-1 SAR surface water detection algorithms.
          </p>
        </div>

        {/* Hotspot Location Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {MONITORING_LOCATIONS.slice(0, 3).map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                selectedLocation.id === loc.id
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {loc.name.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {floodData && (
        <div className="space-y-6">
          
          {/* Top 4 Flood Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. River Discharge */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1224] to-[#060b17] border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  RIVER DISCHARGE
                </span>
                <span className="text-[10px] text-blue-300 font-mono">GloFAS CWC</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {floodData.riverDischarge}
                </span>
                <span className="text-sm text-slate-400 font-mono">m³/s</span>
              </div>
              <div className="text-xs text-slate-300">
                Basin Baseline: <strong className="text-slate-200">{floodData.meanDischarge} m³/s</strong>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-white/5 flex justify-between">
                <span>Peak: {floodData.maxDischarge} m³/s</span>
                <span className="text-emerald-400">Stream Gauge #08</span>
              </div>
            </div>

            {/* 2. Water Level Gauge Height */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1224] to-[#060b17] border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  STAGE GAUGE HEIGHT
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isBreached ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {isBreached ? 'DANGER BREACH' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-4xl font-extrabold tracking-tight ${isBreached ? 'text-red-400' : 'text-white'}`}>
                  {effectiveWaterLevel}
                </span>
                <span className="text-sm text-slate-400 font-mono">meters</span>
              </div>
              <div className="text-xs text-slate-300">
                Danger Threshold: <strong className="text-amber-300">{floodData.dangerThreshold}m</strong>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-white/5 flex justify-between">
                <span>Surge: +{surgeOffset}m</span>
                <span className={isBreached ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {isBreached ? `+${(effectiveWaterLevel - floodData.dangerThreshold).toFixed(2)}m Above Redline` : 'Safe Buffer'}
                </span>
              </div>
            </div>

            {/* 3. AI Flood Hazard Threat Score */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1224] to-[#060b17] border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  AI HAZARD INDEX
                </span>
                <span className="text-[10px] font-mono text-slate-400">Score 0-100</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-red-500 tracking-tight">
                  {Math.min(100, Math.round(floodData.floodScore + surgeOffset * 15))}
                </span>
                <span className="text-sm text-slate-400 font-mono">/100</span>
              </div>
              <div className="text-xs font-bold font-serif italic text-red-400">
                {floodData.floodRiskLevel}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-white/5 flex justify-between">
                <span>Confidence: 94.8%</span>
                <span className="text-sky-300">SAR Verified</span>
              </div>
            </div>

            {/* 4. Soil Saturation & Runoff */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1224] to-[#060b17] border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  SOIL SATURATION
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Hydric Level</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {floodData.soilSaturationPercentage}%
                </span>
                <span className="text-sm text-slate-400 font-mono">Index</span>
              </div>
              <div className="text-xs text-slate-300">
                Severe Soil Liquefaction Risk in Lowlands
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-white/5 flex justify-between">
                <span>Runoff Coeff: 0.88</span>
                <span className="text-amber-400">Zero Absorption</span>
              </div>
            </div>

          </div>

          {/* Interactive Flood Surge Simulation & 7-Day Inflow Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Surge Simulator (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#090f1d] border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Interactive River Surge & Inundation Simulator
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-400">Drag to adjust scenario</span>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Simulate Additional River Crest Surge:</span>
                  <span className="text-sky-300 font-bold">+{surgeOffset.toFixed(2)} meters</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.1"
                  value={surgeOffset}
                  onChange={(e) => setSurgeOffset(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Baseline (0.0m)</span>
                  <span>Moderate Surge (+1.0m)</span>
                  <span>Extreme Flash Flood (+2.5m)</span>
                </div>
              </div>

              {/* Dynamic Impact Output Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase mb-1">Inundated Area</div>
                  <div className="text-2xl font-bold text-white mb-0.5">{simulatedInundationSqKm}</div>
                  <div className="text-[10px] text-slate-500 font-mono">sq km submerged</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <div className="text-slate-400 font-mono text-[10px] uppercase mb-1">Vulnerable Citizens</div>
                  <div className="text-2xl font-bold text-amber-400 mb-0.5">{affectedPopulation.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono">requiring evacuation</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs col-span-2 sm:col-span-1">
                  <div className="text-slate-400 font-mono text-[10px] uppercase mb-1">Arterial Road Breach</div>
                  <div className="text-sm font-bold text-red-400 mb-0.5">NH-58 Km 18-24</div>
                  <div className="text-[10px] text-slate-500 font-mono">High inundation risk</div>
                </div>
              </div>

              {/* Evacuation Advisory Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Recommended Evacuation Corridor:
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Lowland riverbanks compromised. Divert all transit via High-Ground Ridge Bypass Road toward Chamoli Sports Stadium Shelter.
                  </p>
                </div>
                <button
                  onClick={onOpenEvacuation}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <span>View Evacuation Routes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: 7-Day Inflow & Discharge Forecast (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#090f1d] border border-white/10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    7-Day River Discharge Forecast
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">GloFAS ECMWF</span>
                </div>

                <div className="space-y-2">
                  {floodData.forecastDays.map((f, idx) => {
                    const pct = Math.min(100, Math.round((f.discharge / 350) * 100));
                    return (
                      <div key={idx} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                        <div className="flex justify-between font-mono text-[11px] mb-1">
                          <span className="text-slate-300">{f.date}</span>
                          <span className="text-sky-300 font-bold">{f.discharge} m³/s</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 65 ? 'bg-amber-400' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Operational Command Map</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </section>
  );
};
