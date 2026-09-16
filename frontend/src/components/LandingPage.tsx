import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  AlertTriangle, 
  ChevronDown, 
  ArrowRight, 
  Wind, 
  Droplets, 
  Sun, 
  Compass, 
  Satellite, 
  Radio, 
  Waves,
  ArrowDown,
  Key
} from 'lucide-react';
import { LiveWeatherSection } from './LiveWeatherSection';
import { FloodIntelligenceSection } from './FloodIntelligenceSection';
import { SosModal } from './SosModal';
import { fetchLiveWeather, RealWeatherData } from '../services/weatherService';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenCitizens: () => void;
  onOpenVolunteers: () => void;
  onOpenDirectory: () => void;
  onOpenEvacuation?: () => void;
  onOpenSatelliteModal?: () => void;
  activeDisasterName?: string;
  threatLevel?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenCitizens,
  onOpenVolunteers,
  onOpenDirectory,
  onOpenEvacuation = onOpenDashboard,
  onOpenSatelliteModal = () => {},
  activeDisasterName = "Chamoli Cloudburst & Alaknanda Surge",
  threatLevel = "CODE RED"
}) => {
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [heroWeather, setHeroWeather] = useState<RealWeatherData | null>(null);

  useEffect(() => {
    fetchLiveWeather().then((data) => {
      setHeroWeather(data.current);
    }).catch((err) => {
      console.warn('Hero weather ingest error:', err);
    });
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#03060c] bg-starfield bg-grid-mesh text-slate-100 flex flex-col justify-between relative overflow-y-auto scroll-smooth select-none">
      
      {/* Top Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-sky-600/10 via-blue-900/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between sticky top-0 bg-[#03060c]/85 backdrop-blur-md border-b border-white/[0.05]">
        
        {/* Brand Logo - SAHAYAK */}
        <div 
          onClick={onOpenDashboard}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shadow-lg group-hover:border-sky-400/50 transition-colors">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wider text-white">SAHAYAK</span>
        </div>

        {/* Center Pill Nav */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl">
          <button
            onClick={onOpenDashboard}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={onOpenCitizens}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Citizens
          </button>
          <button
            onClick={onOpenVolunteers}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Volunteers
          </button>
          <button
            onClick={() => scrollToSection('weather-section')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-300 hover:text-sky-200 hover:bg-sky-500/10 transition-all flex items-center gap-1"
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Live Weather</span>
          </button>
          <button
            onClick={() => scrollToSection('flood-section')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 transition-all flex items-center gap-1"
          >
            <Waves className="w-3 h-3 text-blue-400" />
            <span>Flood Detection</span>
          </button>
          <button
            onClick={onOpenDirectory}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Admin
          </button>
        </nav>

        {/* Right CTA Button & SOS Button */}
        <div className="flex items-center gap-2.5">
          {/* HIGH-PRIORITY SOS EMERGENCY BUTTON */}
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all border border-red-400/50"
            title="Send Emergency Distress Signal directly to Rescue Command"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>🚨 SOS</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="px-4 py-2 rounded-lg bg-white text-slate-950 font-semibold text-xs tracking-wide hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Open Dashboard
          </button>
        </div>
      </header>

      {/* HERO VIEWPORT SECTION */}
      <main className="relative z-10 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12 max-w-4xl mx-auto my-auto">
        
        {/* Giant Chrome Metallic Title */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-chrome-metallic mb-6 uppercase">
          SAHAYAK
        </h1>

        {/* AI-Powered Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-medium tracking-wide text-slate-300">
            AI-Powered Disaster Intelligence
          </span>
        </div>

        {/* Main Value Proposition Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white mb-6 leading-tight">
          Protecting lives with <br />
          <span className="font-serif italic font-normal text-slate-100">real-time</span> intelligence.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          SAHAYAK unifies disaster prediction, evacuation routing, shelter management, and volunteer coordination into one intelligent platform for citizens, responders, and administrators.
        </p>

        {/* Dual Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-10">
          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 group active:scale-95"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onOpenCitizens}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/[0.05] border border-white/15 text-white font-medium text-sm hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
          >
            Citizen Portal
          </button>
        </div>

        {/* REAL WEATHER & WIND TELEMETRY CARD ON FRONT DASHBOARD */}
        {heroWeather && (
          <div className="w-full max-w-2xl p-4 rounded-2xl bg-[#0b1220]/80 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10 text-xs text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-white">Live Meteorological Telemetry</span>
                <span className="text-[11px] font-mono text-slate-400">· {heroWeather.locationName}</span>
              </div>
              <button
                onClick={onOpenSatelliteModal}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Satellite className="w-3 h-3" />
                <span>Satellite Feed Ingest</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              
              {/* Temp */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> TEMP
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  {heroWeather.temperature}°C
                </div>
                <div className="text-[10px] text-slate-400">Feels {heroWeather.apparentTemperature}°C</div>
              </div>

              {/* Wind */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" /> WIND
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-1">
                  <span>{heroWeather.windSpeed}</span>
                  <span className="text-[11px] font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Compass 
                    className="w-2.5 h-2.5 text-sky-400 inline" 
                    style={{ transform: `rotate(${heroWeather.windDirection}deg)` }} 
                  />
                  <span>{heroWeather.windDirectionCardinal} ({heroWeather.windDirection}°)</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> HUMIDITY
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  {heroWeather.humidity}%
                </div>
                <div className="text-[10px] text-slate-400">Rain: {heroWeather.precipitation} mm</div>
              </div>

              {/* Sentinel Satellite Status */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Satellite className="w-3 h-3 text-emerald-400" /> SAR ORBIT
                </div>
                <div className="text-sm font-bold text-emerald-300 mt-1 truncate">
                  Sentinel-1A
                </div>
                <div className="text-[10px] text-slate-400">Pass in {heroWeather.satellitePassCountdownMin} min</div>
              </div>

            </div>

            {/* Scroll Down Hint */}
            <div 
              onClick={() => scrollToSection('weather-section')}
              className="pt-3 mt-2 text-center text-[11px] font-mono text-slate-400 hover:text-sky-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Scroll down for Live Doppler Radar & AI Flood Detection</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>
        )}

      </main>

      {/* PAGE 1: SCROLL-DOWN LIVE SATELLITE WEATHER & DOPPLER RADAR SECTION */}
      <LiveWeatherSection onOpenSatelliteModal={onOpenSatelliteModal} />

      {/* PAGE 2: SCROLL-DOWN AI & HYDROLOGICAL FLOOD DETECTION SECTION */}
      <FloodIntelligenceSection 
        onOpenEvacuation={onOpenEvacuation}
        onOpenDashboard={onOpenDashboard}
      />

      {/* Interactive Alert Slide-up Modal */}
      {showAlertDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0b101c] border border-red-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Active Early Warning Alert
              </div>
              <button 
                onClick={() => setShowAlertDrawer(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Hazard Event:</span>
                <span className="text-xs font-semibold text-slate-200">{activeDisasterName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Threat Level:</span>
                <span className="text-xs font-bold font-serif italic text-red-400 px-2 py-0.5 bg-red-950/60 border border-red-500/30 rounded">
                  {threatLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded border border-white/5">
                River Alaknanda water level surge (+0.7m in 20 min). NH-58 lowland sector at high inundation risk. Evacuees are advised to utilize the High-Ground Ridge Bypass corridor towards designated sports stadium shelters.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setShowAlertDrawer(false);
                    onOpenDashboard();
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  View Operational Map
                </button>
                <button
                  onClick={() => {
                    setShowAlertDrawer(false);
                    onOpenCitizens();
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Citizen Evacuation Aid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive SOS Emergency Modal */}
      <SosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        onSosBroadcast={(record) => {
          console.log('SOS Distress broadcasted to EOC:', record);
        }}
      />

      {/* Clean Bottom Footer - 16 ML models active & 500+ shelters monitored REMOVED as requested */}
      <footer className="relative z-20 w-full border-t border-white/[0.07] bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          
          {/* Left Clean Brand Info */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SAHAYAK Unified Disaster Intelligence System</span>
          </div>

          {/* Center Alert Trigger */}
          <button
            onClick={() => setShowAlertDrawer(true)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5 text-red-400 group-hover:translate-y-0.5 transition-transform" />
            <span className="border-b border-transparent group-hover:border-slate-400 font-medium">
              Real-time disaster alerts
            </span>
          </button>

          {/* Right Navigation Anchors */}
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <button 
              onClick={() => scrollToSection('weather-section')} 
              className="hover:text-sky-300 transition-colors"
            >
              Weather Radar ↑
            </button>
            <button 
              onClick={() => scrollToSection('flood-section')} 
              className="hover:text-blue-300 transition-colors"
            >
              Flood Engine ↑
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="hover:text-white transition-colors"
            >
              Top ↑
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
};
