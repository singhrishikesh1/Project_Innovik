import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Layers,
  Sliders,
  TrendingDown,
  Clock,
  Eye,
  Activity,
  CheckCircle2,
  Key,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { SatelliteKeyModal } from '../components/SatelliteKeyModal';

export const SatelliteAnalysis: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [activeBand, setActiveBand] = useState<'SAR_BACKSCATTER' | 'NDWI_SPECTRAL' | 'TRUE_COLOR'>('SAR_BACKSCATTER');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [satelliteConfig, setSatelliteConfig] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSatelliteData = async () => {
    setLoading(true);
    try {
      const [cfg, live] = await Promise.all([
        api.getSatelliteConfig().catch(() => null),
        api.getSatelliteLive().catch(() => null)
      ]);
      if (cfg) setSatelliteConfig(cfg);
      if (live) setLiveData(live);
    } catch (e) {
      console.warn('Could not load live satellite stream:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatelliteData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 bg-[#070b14] text-slate-100 font-sans">
      {/* Top Banner & Live API Key Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5" />
              Copernicus & NASA Earth Observation Suite
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1 ${
              satelliteConfig?.isLiveKeyConfigured
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950 text-amber-300 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${satelliteConfig?.isLiveKeyConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              {satelliteConfig?.isLiveKeyConfigured ? 'REAL SATELLITE API CONNECTED' : 'OPEN SATELLITE FALLBACK ACTIVE'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1.5">
            Satellite Inundation & SAR Backscatter Change Detection
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bi-temporal satellite comparison isolating specular radar reflection shifts and spectral NDWI surface water expansion over Chamoli & Upper Alaknanda Basin.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-sky-600/20 active:scale-95"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure Satellite API Key</span>
          </button>

          <button
            onClick={fetchSatelliteData}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Refresh satellite telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Satellite Ingestion Telemetry Bar */}
      <div className="p-4 rounded-xl bg-[#0b1122] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 text-[10px] uppercase block">Platform & Sensor</span>
          <span className="font-bold text-white text-sm">
            {liveData?.sentinel1SAR?.satellite || 'Sentinel-1A'} / {liveData?.sentinel2Optical?.satellite || 'Sentinel-2B'}
          </span>
          <span className="text-[11px] text-sky-400 block">C-Band SAR (10m res)</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase block">Acquisition Timestamp</span>
          <span className="font-bold text-white text-sm">
            {liveData?.sentinel1SAR?.acquisitionTime ? new Date(liveData.sentinel1SAR.acquisitionTime).toLocaleTimeString() + ' UTC' : '06:40:12 UTC'}
          </span>
          <span className="text-[11px] text-slate-400 block">{liveData?.sentinel1SAR?.orbit || 'Descending Pass #136'}</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase block">Cloud Penetration</span>
          <span className="font-bold text-emerald-400 text-sm">
            100% Penetration
          </span>
          <span className="text-[11px] text-slate-400 block">VV+VH dual-pol radar</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase block">Water Inundation Extent</span>
          <span className="font-bold text-red-400 text-sm">
            +{liveData?.sentinel1SAR?.inundatedAreaSqKm || 14.2} sq km
          </span>
          <span className="text-[11px] text-slate-400 block">Anomaly: -4.6 dB</span>
        </div>
      </div>

      {/* Spectral Band Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-[#0b1122] border border-white/10 p-1 rounded-xl text-xs">
          {[
            { id: 'SAR_BACKSCATTER', label: 'Sentinel-1 SAR (Radar)' },
            { id: 'NDWI_SPECTRAL', label: 'Sentinel-2 NDWI (Water Index)' },
            { id: 'TRUE_COLOR', label: 'Optical RGB (Surface)' }
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBand(b.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeBand === b.id ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          Bounding Box: 79.20°E, 30.30°N to 79.60°E, 30.60°N
        </div>
      </div>

      {/* Satellite Before / After Interactive Slider */}
      <div className="bg-[#0b1122] p-5 rounded-xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              Pre-Event Baseline vs Post-Surge Inundation
            </span>
            <span className="text-slate-400">Drag the slider horizontally to compare terrain evolution</span>
          </div>
          <div className="font-mono text-slate-400 text-[11px]">
            Split: <b className="text-sky-400">{sliderPosition}% Post-Event</b>
          </div>
        </div>

        {/* Visual Slider Viewport */}
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-700 bg-slate-950 select-none">
          {/* Post-Event Layer (Background) */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950"
            style={{
              backgroundImage: `radial-gradient(ellipse at 40% 60%, rgba(2, 132, 199, 0.45) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)`
            }}
          >
            {/* Visual Post-Event Simulation Graphics */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
              <div className="flex justify-end">
                <span className="px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/80 text-red-300 font-mono text-xs font-bold shadow-lg">
                  POST-SURGE (15-SEP 06:40 UTC)
                </span>
              </div>
              <div className="space-y-2 max-w-sm bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs">
                <div className="font-bold text-sky-300">Surface Water Inundation: +14.2 sq km</div>
                <div className="text-slate-300 text-[11px]">
                  • SAR Amplitude Shift: <b className="text-red-400 font-mono">-4.6 dB</b> (Specular water attenuation)<br />
                  • NDWI Anomaly: <b className="text-cyan-400 font-mono">+0.38</b> across Alaknanda floodplain<br />
                  • Bridge Crossing Choke: <b>Severed at Ward 2</b>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Event Layer (Clipped Foreground) */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              backgroundImage: `radial-gradient(ellipse at 30% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 60%)`
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
              <div className="flex justify-start">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-mono text-xs font-bold shadow-lg">
                  PRE-EVENT (10-SEP 10:20 UTC)
                </span>
              </div>
              <div className="space-y-1 max-w-xs bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs">
                <div className="font-bold text-emerald-300">Baseline River Channel Normal</div>
                <div className="text-slate-300 text-[11px]">
                  • Dry Season Flow Stage: 2.1m<br />
                  • Soil Moisture Saturation: 38%<br />
                  • Normal Vegetation Cover Index
                </div>
              </div>
            </div>
          </div>

          {/* Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] cursor-ew-resize flex items-center justify-center"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-sky-500 border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-bold text-white">
              ⟷
            </div>
          </div>

          {/* Range Input on Top */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={e => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
          <span>ESA Copernicus Sentinel-1A C-band SAR + Sentinel-2 MSI L2A BOA Reflectance</span>
          <span className="text-sky-400">Target Coordinates: 30.4128°N, 79.3242°E</span>
        </div>
      </div>

      {/* Satellite Spectral Indices Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#0b1122] p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-slate-300">SAR Coherence Attenuation</span>
            <span className="font-mono text-red-400 font-bold">-4.6 dB</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Specular reflection attenuation confirms that valley floors previously occupied by terraced soil have been replaced by smooth standing floodwaters.
          </p>
        </div>

        <div className="bg-[#0b1122] p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-slate-300">NDWI Positive Delta</span>
            <span className="font-mono text-sky-400 font-bold">+0.38</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Normalized Difference Water Index computed from (Green - NIR) / (Green + NIR) indicates 14.2 sq km of newly flooded terrain along the riverbed.
          </p>
        </div>

        <div className="bg-[#0b1122] p-4 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-slate-300">Proglacial Lake Expansion</span>
            <span className="font-mono text-amber-300 font-bold">+28.5% Area</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Upstream glacial waterbody boundary perimeter monitored by VajraWatch cryosphere algorithms confirms accelerated glacial melt runoff into the catchment.
          </p>
        </div>
      </div>

      {/* Satellite Key Modal */}
      <SatelliteKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onConfigSaved={fetchSatelliteData}
      />
    </div>
  );
};
export default SatelliteAnalysis;
