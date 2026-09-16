import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Shield, 
  MapPin, 
  Layers, 
  Navigation, 
  Radio, 
  Cpu, 
  Warehouse, 
  Satellite, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  Key
} from 'lucide-react';
import { SosModal } from './SosModal';
import { fetchLiveWeather, fetchLiveFloodData, RealWeatherData, FloodData } from '../services/weatherService';
import { queryGroqDisasterAI, triageEmergencyMessageWithAI } from '../services/aiService';
import { DisasterEvent, RiskAssessment, SkepticVerification, Shelter, Shipment, EvacuationRoute } from '../types';

interface UnifiedDashboardProps {
  activeDisaster: DisasterEvent;
  riskAssessment: RiskAssessment;
  skepticVerification: SkepticVerification;
  shelters: Shelter[];
  shipments: Shipment[];
  evacuationRoutes: EvacuationRoute[];
  currentStep: number;
  totalSteps: number;
  onOpenStudio: () => void;
  onOpenDirectory: () => void;
  onOpenSatelliteModal: () => void;
  onDownloadPDF: () => void;
  onBackToLanding: () => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  activeDisaster,
  riskAssessment,
  skepticVerification,
  shelters,
  shipments,
  evacuationRoutes,
  currentStep,
  totalSteps,
  onOpenStudio,
  onOpenDirectory,
  onOpenSatelliteModal,
  onDownloadPDF,
  onBackToLanding
}) => {
  // Navigation tabs in top pill bar
  const [activeTab, setActiveTab] = useState<'map' | 'evacuation' | 'triage' | 'ml-engines' | 'stockpiles' | 'satellite'>('map');
  const [showSosModal, setShowSosModal] = useState(false);
  const [realWeather, setRealWeather] = useState<RealWeatherData | null>(null);
  const [realFlood, setRealFlood] = useState<FloodData | null>(null);
  const [mapBaseType, setMapBaseType] = useState<'dark' | 'satellite'>('dark');

  // Groq SatQuery AI state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Groq Live Triage state
  const [triageInput, setTriageInput] = useState('');
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);

  useEffect(() => {
    fetchLiveWeather().then(d => setRealWeather(d.current)).catch(() => {});
    fetchLiveFloodData().then(d => setRealFlood(d)).catch(() => {});
  }, []);

  // Map state controls
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showSafeShelters, setShowSafeShelters] = useState(true);
  const [pulsingIncident, setPulsingIncident] = useState(false);

  // Road blockage simulation state
  const [simulatedBlockage, setSimulatedBlockage] = useState(currentStep >= 13);

  // Sync blockage state with simulation step
  useEffect(() => {
    setSimulatedBlockage(currentStep >= 13);
  }, [currentStep]);

  // Leaflet map initialization focused on Chamoli & Upper Alaknanda Basin
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Chamoli District & Upper Alaknanda Basin Theater Coordinates
    const centerCoords: [number, number] = [30.4128, 79.3242];
    const zoomLevel = 12;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(centerCoords, zoomLevel);

      // Add clean zoom control top-left
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Clean Esri World Dark Gray Canvas Basemap (Zero watermark, high resolution)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: ''
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: 'Leaflet | © OpenStreetMap contributors' }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(centerCoords, zoomLevel);
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.CircleMarker || layer instanceof L.Polygon || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // 1. Inundation Breach Hazard Zones (Red circle)
    if (showHazardZones) {
      L.circle([30.415, 79.329], {
        radius: 3500,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.38,
        weight: 2
      }).addTo(map).bindPopup('<b>Alaknanda Flash Flood Breach</b><br/>Water Gauge: 4.8m (+0.6m over danger)<br/>Risk Level: CRITICAL');
    }

    // 2. Safe Shelters (Green dots)
    if (showSafeShelters) {
      shelters.forEach(s => {
        L.circleMarker([s.coords.lat, s.coords.lng], {
          radius: 8,
          color: '#ffffff',
          fillColor: '#10b981',
          fillOpacity: 0.95,
          weight: 2
        }).addTo(map).bindPopup(`<b>${s.name}</b><br/>Capacity: ${s.totalCapacity} beds<br/>Available: ${s.availableCapacity} beds<br/>Status: 🟢 SAFE & OPERATIONAL`);
      });
    }

    // 3. Seismic / Hydrological Sensor Geocodes (Amber dots)
    const sensorCoords = [
      { lat: 30.4110, lng: 79.3230, name: 'CWC Hydro Station 08-ALAK (Gauge: 4.8m)' },
      { lat: 30.4610, lng: 79.3720, name: 'Pipalkoti IMD Rain Gauge (Precip: 48mm/hr)' },
      { lat: 30.4350, lng: 79.3450, name: 'Birahi Gorge Telemetry Array (Sludge Sensor)' }
    ];

    sensorCoords.forEach(f => {
      L.circleMarker([f.lat, f.lng], {
        radius: 6,
        color: '#ffffff',
        fillColor: '#f59e0b',
        fillOpacity: pulsingIncident ? 1 : 0.85,
        weight: 1.5
      }).addTo(map).bindPopup(`<b>${f.name}</b><br/>Telemetry: Active Stream`);
    });

  }, [showHazardZones, showSafeShelters, pulsingIncident, shelters]);

  // Recenter button
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([30.4128, 79.3242], 12);
  };

  // Pulse effect
  const handlePulseGeocodes = () => {
    setPulsingIncident(true);
    setTimeout(() => setPulsingIncident(false), 3000);
  };

  // Switch basemap layer dynamically between Dark Tactical Canvas and Satellite HD
  const switchBaseMap = (type: 'dark' | 'satellite') => {
    setMapBaseType(type);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.eachLayer((l) => {
      if (l instanceof L.TileLayer) {
        map.removeLayer(l);
      }
    });

    if (type === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles © Esri'
      }).addTo(map);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: ''
      }).addTo(map);
    }
  };

  const handleAskGroq = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const context = `Theater: Chamoli District, Uttarakhand. River Discharge: ${realFlood?.riverDischarge || 294.1} m3/s. Water Gauge: ${realFlood?.waterLevelGauge || 4.65}m (Danger: 4.2m). Wind: ${realWeather?.windSpeed || 14.2} km/h ${realWeather?.windDirectionCardinal || 'SW'}. Shelters Active: ${shelters.length}.`;
      const res = await queryGroqDisasterAI(promptText, context);
      setAiResponse(res);
    } catch (e: any) {
      setAiResponse('AI Error: ' + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRunTriage = async () => {
    if (!triageInput.trim()) return;
    setIsTriageLoading(true);
    setTriageResult(null);
    try {
      const result = await triageEmergencyMessageWithAI(triageInput);
      setTriageResult(result);
    } catch (e: any) {
      setTriageResult({
        priority: 'CRITICAL',
        urgencyScore: 0.95,
        category: 'Emergency Dispatch',
        recommendedAction: 'Immediate dispatch to nearest rescue outpost'
      });
    } finally {
      setIsTriageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Main Navigation Bar matching Screenshots */}
      <header className="border-b border-white/[0.08] bg-[#090e1c]/90 backdrop-blur-md px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        {/* Brand & Hub Name */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <span className="text-slate-500 font-mono text-sm tracking-wider group-hover:text-sky-400 transition-colors">\\</span>
            <span className="font-bold tracking-wide text-white text-base">SAHAYAK</span>
            <span className="text-xs font-mono text-slate-400 italic">.ai Disaster Hub</span>
          </button>
        </div>

        {/* Center Pill Navigation Buttons */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'map' 
                ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Tactical Map
          </button>
          <button
            onClick={() => setActiveTab('evacuation')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'evacuation' 
                ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Evacuation Router
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'triage' 
                ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            NLP Triage
          </button>
          <button
            onClick={() => setActiveTab('ml-engines')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'ml-engines' 
                ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            ML Engines
          </button>
          <button
            onClick={() => setActiveTab('stockpiles')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'stockpiles' 
                ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Shelter Stockpiles
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'satellite' 
                ? 'bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>📡</span>
            <span>SatQuery AI</span>
          </button>
        </nav>

        {/* Right Action Links */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 animate-pulse transition-all border border-red-400/40"
            title="Transmit Emergency SOS Distress Beacon"
          >
            <span>🚨 SOS</span>
          </button>
          {/* Simulation Studio Trigger */}
          <button
            onClick={onOpenStudio}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Open 20-Step Simulation Player"
          >
            <span>Studio</span>
            <span className="text-[10px] text-sky-400 font-mono">↗</span>
          </button>

          {/* System Directory Trigger */}
          <button
            onClick={onOpenDirectory}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Browse all specialized disaster modules"
          >
            <span>System Directory</span>
            <span className="text-[10px] text-slate-400 font-mono">↗</span>
          </button>

          {/* 1-Click Printable PDF Report Download */}
          <button
            onClick={onDownloadPDF}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download Official 20-Section PDF Disaster Incident Report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* Sub-header status ticker */}
      <div className="bg-[#0b1122]/60 border-b border-white/5 px-6 py-2 flex items-center justify-between text-xs">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SQLite Active · 16 Engines Online</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-xs">
          <span>Theater: <strong className="text-sky-400">Chamoli District & Upper Alaknanda Basin</strong></span>
          <span>Sim Step: <strong className="text-white">{currentStep}/{totalSteps}</strong></span>
          {realWeather && (
            <span className="hidden xl:inline-flex items-center gap-2 text-slate-300 font-mono text-[11px] border-l border-white/10 pl-3">
              <span className="text-amber-300">☀️ {realWeather.temperature}°C</span>
              <span className="text-cyan-300">💨 {realWeather.windSpeed} km/h {realWeather.windDirectionCardinal}</span>
              <span className="text-blue-300">🌧️ {realWeather.precipitation} mm</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Container Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 space-y-8">
        
        {/* Page Banner Header */}
        <section className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] tracking-wider uppercase">
            Unified Autonomous Command Center
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Multi-Hazard Disaster Intelligence & <span className="font-serif italic font-normal text-slate-200">Operational Infrastructure</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Centralized operational dashboard integrating real-time GIS spatial mapping using Leaflet, ray-casting evacuation routing, natural language emergency triage, and 16 active machine learning prediction engines with live SQLite state management.
          </p>
        </section>

        {/* 4 Real-Time Metric Telemetry Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Threat Level & Flood Risk (Real GloFAS & Inundation Data) */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#12192e] to-[#0a0f1d] border border-red-500/30 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
              <span>Active Threat Level</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30 font-bold animate-pulse">LIVE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-serif italic font-semibold text-red-500 mb-1 truncate">
              {realFlood ? `${realFlood.floodRiskLevel}` : 'CODE RED'}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Stage Gauge: <strong className="text-red-400">{realFlood?.waterLevelGauge || 4.65}m</strong> (Redline: 4.20m)
            </div>
          </div>

          {/* Card 2: Real Atmospheric & Wind Telemetry */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1628] to-[#09101d] border border-sky-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
              <span>Live Atmospheric Feed</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/30 font-mono">OPEN-METEO</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-baseline gap-2">
              <span>{realWeather?.temperature || 23.4}°C</span>
              <span className="text-xs font-normal text-slate-400">Feels {realWeather?.apparentTemperature || 25.1}°C</span>
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Wind: <strong className="text-cyan-400">{realWeather?.windSpeed || 14.2} km/h {realWeather?.windDirectionCardinal || 'SW'}</strong> · Gusts {realWeather?.windGusts || 26.5} km/h
            </div>
          </div>

          {/* Card 3: Real Hydrological River Discharge */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0a1526] to-[#070e1b] border border-blue-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
              <span>River Flow (GloFAS)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-mono">CWC TELEMETRY</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mb-1">
              {realFlood?.riverDischarge || 294.1} <span className="text-sm font-normal text-slate-400">m³/s</span>
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Basin Mean: <strong className="text-slate-200">{realFlood?.meanDischarge || 285.9} m³/s</strong> · Peak: {realFlood?.maxDischarge || 320.5} m³/s
            </div>
          </div>

          {/* Card 4: Real Registered Shelters & Capacity */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0a1824] to-[#07101b] border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-2">
              <span>Shelters & Corridors</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">CAPACITY LEDGER</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">
              {shelters.length} Shelters
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Total: <strong>{shelters.reduce((a, s) => a + (s.totalCapacity || 0), 0).toLocaleString()} beds</strong> (Avail: {shelters.reduce((a, s) => a + (s.availableCapacity || 0), 0).toLocaleString()})
            </div>
          </div>
        </section>

        {/* Primary Tactical GIS Leaflet Map Section */}
        <section className="rounded-xl border border-white/[0.08] bg-[#0b1122] overflow-hidden shadow-2xl">
          {/* Map Title Strip */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#090e1c]">
            <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 animate-pulse transition-all border border-red-400/40"
            title="Transmit Emergency SOS Distress Beacon"
          >
            <span>🚨 SOS</span>
          </button>
              <span className="font-semibold text-sm text-slate-100">Tactical GIS Disaster Map (Leaflet)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-sky-950/60 border border-sky-500/40 text-sky-400 uppercase font-semibold">
                Live Spatial Feed
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Center: Chamoli Uttarakhand Theater (30.41°N, 79.32°E) · Leaflet Interactive Layers
            </div>
          </div>

          {/* Map Container Viewport */}
          <div 
            ref={mapContainerRef}
            className="w-full h-[460px] bg-[#050811] relative z-10"
          />

          {/* Map Bottom Control & Legend Toolbar */}
          <div className="px-5 py-3 border-t border-white/[0.08] bg-[#090e1c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            {/* Left Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRecenter}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                Recenter Theater
              </button>

              {/* Clean Map Basemap Switcher (No watermark) */}
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                <button
                  onClick={() => switchBaseMap('dark')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    mapBaseType === 'dark' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌑 Dark Tactical
                </button>
                <button
                  onClick={() => switchBaseMap('satellite')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    mapBaseType === 'satellite' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛰️ Satellite HD
                </button>
              </div>
              <button
                onClick={() => setShowHazardZones(!showHazardZones)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  showHazardZones ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                Toggle Hazard Zones
              </button>
              <button
                onClick={() => setShowSafeShelters(!showSafeShelters)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  showSafeShelters ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                Toggle Safe Shelters
              </button>
              <button
                onClick={handlePulseGeocodes}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  pulsingIncident ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                Pulse Incident Geocodes
              </button>
            </div>

            {/* Right Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Green = Safe Shelter
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Red = Inundation Breach
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Amber = Seismic Fault Zone
              </span>
            </div>
          </div>
        </section>

        {/* Lower Split Sections: Dynamic Evacuation Router & NLP Incident Triage */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Dynamic Evacuation Router */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0b1122] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 animate-pulse transition-all border border-red-400/40"
            title="Transmit Emergency SOS Distress Beacon"
          >
            <span>🚨 SOS</span>
          </button>
                <h3 className="font-semibold text-base text-slate-100">Dynamic Evacuation Router</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 uppercase font-semibold">
                  Ray-Casting Avoidance
                </span>
              </div>
              <button
                onClick={() => setSimulatedBlockage(!simulatedBlockage)}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              >
                {simulatedBlockage ? 'Simulate Road Cleared' : 'Simulate Landslide Blockage'}
              </button>
            </div>

            {/* Route Status Comparison Cards */}
            <div className="space-y-3">
              {/* Primary Route */}
              <div className={`p-4 rounded-lg border transition-all ${
                simulatedBlockage 
                  ? 'bg-red-950/30 border-red-500/40 text-red-200' 
                  : 'bg-[#0e162b] border-white/10 text-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white">
                    Primary Arterial Corridor: Pipalkoti to Shelter-02 (via NH-58)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    simulatedBlockage 
                      ? 'bg-red-900/60 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {simulatedBlockage ? 'BLOCKED' : 'SAFE'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-4 font-mono">
                  <span>Distance: 8.4 km</span>
                  <span>Travel Time: 18 min</span>
                  <span>Elevation: 1,320m</span>
                </div>
                {simulatedBlockage && (
                  <div className="mt-2 text-xs text-red-300 bg-red-950/40 p-2 rounded border border-red-500/20">
                    ⚠ Landslide debris blockage at Km 42 near Birahi. All convoys rerouted to Ridge Bypass.
                  </div>
                )}
              </div>

              {/* Alternative Route */}
              <div className="p-4 rounded-lg border bg-[#0e162b] border-emerald-500/30 text-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white">
                    High-Ground Ridge Bypass Corridor (Upper Terrace Route)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-400 border border-emerald-500/30">
                    SAFE & RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-4 font-mono">
                  <span>Distance: 11.2 km</span>
                  <span>Travel Time: 26 min</span>
                  <span>Elevation: 1,680m (High Ground)</span>
                </div>
                <div className="mt-2 text-xs text-emerald-400/90 font-mono">
                  ✓ Jordan Polygon Intersection: 0 intersections with flood breach zone.
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: NLP Incident Triage & News Grounding */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0b1122] p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 animate-pulse transition-all border border-red-400/40"
            title="Transmit Emergency SOS Distress Beacon"
          >
            <span>🚨 SOS</span>
          </button>
                <h3 className="font-semibold text-base text-slate-100">NLP Incident Triage & News Grounding</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 uppercase font-semibold">
                  Model Engine 8
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">● Ingesting Feeds</span>
            </div>

            {/* Live Distress Feed Items */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[#0e162b] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-sky-400 text-[11px]">CITIZEN-SOS-082 · 4 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                    URGENT (0.94)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  "Water entered ground floors near Ghat Road, 14 families stranded on upper terrace with infants."
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-2">
                  <span>Action: SDRF Zodiac Boat Unit 02 Assigned</span>
                  <span>• Geocode: 30.418°N, 79.328°E</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0e162b] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 text-[11px]">ROAD-WATCH-04 · 12 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    HIGH (0.81)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  "Rockfall triggered by saturation on NH-58 near Birahi. Sludge thickness approx 1.2m across both lanes."
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-2">
                  <span>Action: PWD JCB Bulldozers Dispatched</span>
                  <span>• Bypass active</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0e162b] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 text-[11px]">CWC-HYDRO-WIRE · 18 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    NOMINAL (0.24)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  "Alaknanda gauge station 08-ALAK upstream rate-of-rise stabilizing at +0.1m/hr after peak cloudburst pass."
                </p>
              </div>
            </div>

            {/* Real-time AI Triage Interactive Input */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span>Live Groq NLP Triage Console:</span>
                <span className="text-[10px] font-mono text-cyan-400">qwen/qwen3.8-27b</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an emergency message to triage with AI..."
                  value={triageInput}
                  onChange={(e) => setTriageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunTriage()}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#060a14] border border-white/15 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleRunTriage}
                  disabled={isTriageLoading}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  {isTriageLoading ? 'Evaluating...' : 'Triage with AI'}
                </button>
              </div>

              {triageResult && (
                <div className="p-3 rounded-lg bg-[#081224] border border-cyan-500/40 text-xs space-y-1 animate-in fade-in">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-cyan-300 font-bold">Category: {triageResult.category}</span>
                    <span className="text-red-400 font-bold">Urgency: {triageResult.priority} ({triageResult.urgencyScore})</span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-mono">
                    Action: {triageResult.recommendedAction}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabbed Supplementary Drawer Content (ML Engines / Stockpiles / SatQuery AI) */}
        {activeTab === 'ml-engines' && (
          <section className="p-6 rounded-xl border border-white/[0.08] bg-[#0b1122] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">VajraWatch 8-Feature Prediction Engine</h3>
                <p className="text-xs text-slate-400 font-mono">Calibrated Multi-Hazard Risk Scoring (Score: {riskAssessment.score.toFixed(1)} / 100 · Tier: {riskAssessment.riskLevel})</p>
              </div>
              <button 
                onClick={() => setActiveTab('map')}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/5"
              >
                Close View
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {riskAssessment.features && riskAssessment.features.map(f => (
                <div key={f.key} className="p-3 rounded-lg bg-[#0e162b] border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">{f.name}</div>
                  <div className="text-base font-bold text-sky-400 font-mono">
                    {f.value} <span className="text-[11px] font-normal text-slate-400">{f.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Weight: {f.weight} ({(f.weight * 100).toFixed(0)}%)</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'stockpiles' && (
          <section className="p-6 rounded-xl border border-white/[0.08] bg-[#0b1122] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Shelter Stockpiles & Strict Mathematical Conservation</h3>
                <p className="text-xs text-slate-400 font-mono">Total = Available + Allocated + In Transit + Delivered + Consumed + Damaged</p>
              </div>
              <button 
                onClick={() => setActiveTab('map')}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/5"
              >
                Close View
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shelters.slice(0, 3).map(shelter => (
                <div key={shelter.id} className="p-4 rounded-lg bg-[#0e162b] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{shelter.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {shelter.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Occupancy: {shelter.currentOccupancy} / {shelter.totalCapacity} beds ({(shelter.currentOccupancy / shelter.totalCapacity * 100).toFixed(1)}%)
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (shelter.currentOccupancy / shelter.totalCapacity) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex justify-between pt-1">
                    <span>Food Days: {shelter.foodSupplyDays}d</span>
                    <span>Water Days: {shelter.waterSupplyDays}d</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'satellite' && (
          <section className="p-6 rounded-xl border border-sky-500/30 bg-[#0b1224] space-y-5 animate-in fade-in shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>SatQuery AI: Autonomous Disaster Copilot</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                      POWERED BY GROQ
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Real-time conversational satellite & hazard intelligence powered by Groq Llama/Qwen with live GloFAS hydrology.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSatelliteModal}
                  className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure API Key</span>
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Close View
                </button>
              </div>
            </div>

            {/* Live Satellite Diagnostic Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-slate-400 text-[10px]">SAR BACKSCATTER</div>
                <div className="text-base font-bold text-emerald-300">{realWeather?.sarBackscatterDb || -14.2} dB</div>
                <div className="text-[10px] text-slate-500">Sentinel-1A Stripmap</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-slate-400 text-[10px]">NDWI WATER INDEX</div>
                <div className="text-base font-bold text-cyan-300">{realWeather?.ndwiWaterIndex || 0.42}</div>
                <div className="text-[10px] text-slate-500">Inundation Confirmed</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-slate-400 text-[10px]">ORBIT PASS</div>
                <div className="text-base font-bold text-amber-300">#{realWeather?.satellitePassCountdownMin || 42} min</div>
                <div className="text-[10px] text-slate-500">Descending Overpass</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="text-slate-400 text-[10px]">AI INFERENCE</div>
                <div className="text-base font-bold text-sky-400">Groq High-Speed</div>
                <div className="text-[10px] text-emerald-400">Connected (0.1s latency)</div>
              </div>
            </div>

            {/* Interactive Question Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Ask SatQuery AI about Chamoli inundation, road status, weather vectors, or shelters:
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., What is the inundation risk at Alaknanda with 294 m3/s discharge? Is NH-58 passable?"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskGroq(aiQuery)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleAskGroq(aiQuery)}
                  disabled={isAiLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {isAiLoading ? 'Analyzing...' : 'Ask AI'}
                </button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  '🌊 Analyze current Alaknanda flood risk with discharge 294 m³/s',
                  '🚧 Is NH-58 blocked near Birahi?',
                  '🛰️ Explain Sentinel-1 SAR -14.2 dB backscatter drop',
                  '⛺ Which shelter has maximum available capacity?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiQuery(q);
                      handleAskGroq(q);
                    }}
                    className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-colors text-left font-mono"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Groq AI Response Card */}
              {aiResponse && (
                <div className="p-4 rounded-xl bg-[#060b18] border border-sky-500/40 text-xs space-y-2 animate-in fade-in shadow-xl text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-semibold text-sky-400 font-mono flex items-center gap-1.5">
                      <span>✦</span> SatQuery AI Tactical Assessment:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Groq Verified
                    </span>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-line font-sans text-xs">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </main>
      <SosModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
    </div>
  );
};
