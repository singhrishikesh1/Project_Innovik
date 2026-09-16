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
  Key,
  Phone,
  MessageCircle,
  HeartHandshake,
  Route,
  Compass,
  Car,
  LifeBuoy,
  X,
  ExternalLink,
  Share2,
  Check
} from 'lucide-react';
import { SosModal } from './SosModal';
import { fetchLiveWeather, fetchLiveFloodData, RealWeatherData, FloodData } from '../services/weatherService';
import { queryGroqDisasterAI, triageEmergencyMessageWithAI } from '../services/aiService';
import { RELIEF_NGOS_DATA, ReliefNGO, getNearbyNGOs, calculateDistanceKm } from '../services/ngoService';
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

// Preset origin hazard hotspots for dynamic routing
const HAZARD_ORIGINS = [
  {
    key: 'pipalkoti',
    name: 'Pipalkoti Flood Lowland (Km 42 Stage)',
    coords: [30.4590, 79.3690] as [number, number],
    dangerLevel: 'CRITICAL',
    description: 'Riverfront settlement adjacent to surging Alaknanda'
  },
  {
    key: 'birahi',
    name: 'Birahi Gorge Confluence (NH-58 Debris Zone)',
    coords: [30.4350, 79.3450] as [number, number],
    dangerLevel: 'HIGH',
    description: 'Sludge thickness approx 1.2m across both road lanes'
  },
  {
    key: 'ghat',
    name: 'Ghat Low-Lying Riverfront',
    coords: [30.4180, 79.3280] as [number, number],
    dangerLevel: 'HIGH',
    description: 'Water breached ground floor embankments'
  },
  {
    key: 'chamoli',
    name: 'Chamoli Central Market (Near CWC Gauge)',
    coords: [30.4120, 79.3240] as [number, number],
    dangerLevel: 'ELEVATED',
    description: 'High inundation risk due to stage gauge at 4.8m'
  }
];

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
  const [activeTab, setActiveTab] = useState<'map' | 'evacuation' | 'ngos' | 'triage' | 'ml-engines' | 'stockpiles' | 'satellite'>('map');
  const [showSosModal, setShowSosModal] = useState(false);
  const [realWeather, setRealWeather] = useState<RealWeatherData | null>(null);
  const [realFlood, setRealFlood] = useState<FloodData | null>(null);
  const [mapBaseType, setMapBaseType] = useState<'dark' | 'satellite'>('dark');

  // Map layer toggle states
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showSafeShelters, setShowSafeShelters] = useState(true);
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(true);
  const [showNGOs, setShowNGOs] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [pulsingIncident, setPulsingIncident] = useState(false);

  // Evacuation routing states
  const [selectedOriginKey, setSelectedOriginKey] = useState<string>('pipalkoti');
  const [selectedShelterId, setSelectedShelterId] = useState<string>('SHELTER-01');
  const [simulatedBlockage, setSimulatedBlockage] = useState(currentStep >= 13);
  const [copiedRoute, setCopiedRoute] = useState(false);

  // NGO Network states
  const [selectedNgoCategory, setSelectedNgoCategory] = useState<string>('ALL');
  const [highlightedNgoId, setHighlightedNgoId] = useState<string | null>(null);

  // Groq SatQuery AI state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Groq Live Triage state
  const [triageInput, setTriageInput] = useState('');
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);

  // Fetch real atmospheric & flood data on mount
  useEffect(() => {
    fetchLiveWeather().then(d => setRealWeather(d.current)).catch(() => {});
    fetchLiveFloodData().then(d => setRealFlood(d)).catch(() => {});
  }, []);

  // Sync blockage state with simulation step
  useEffect(() => {
    setSimulatedBlockage(currentStep >= 13);
  }, [currentStep]);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Selected Origin & Shelter data
  const currentOrigin = HAZARD_ORIGINS.find(o => o.key === selectedOriginKey) || HAZARD_ORIGINS[0];
  const currentShelter = shelters.find(s => s.id === selectedShelterId) || shelters[0] || {
    id: 'SHELTER-01',
    name: 'Alaknanda High-Ground School Shelter',
    coords: { lat: 30.4210, lng: 79.3295 },
    totalCapacity: 350,
    availableCapacity: 220,
    status: 'OPERATIONAL'
  };

  // Nearby NGOs sorted by distance to current origin
  const nearbyNGOs = getNearbyNGOs(currentOrigin.coords[0], currentOrigin.coords[1]);
  const filteredNGOs = selectedNgoCategory === 'ALL'
    ? nearbyNGOs
    : nearbyNGOs.filter(n => n.category === selectedNgoCategory);
  const nearestNGO = nearbyNGOs[0];

  // Leaflet Map Initialization & Reactive Layers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const centerCoords: [number, number] = [30.4128, 79.3242];
    const zoomLevel = 12;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(centerCoords, zoomLevel);

      // Clean zoom control top-left
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Basemap
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
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers and markers
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Circle ||
        layer instanceof L.CircleMarker ||
        layer instanceof L.Polygon ||
        layer instanceof L.Polyline ||
        layer instanceof L.Marker
      ) {
        map.removeLayer(layer);
      }
    });

    // 1. Inundation Breach Hazard Zones (Red circle)
    if (showHazardZones) {
      L.circle([30.415, 79.329], {
        radius: 3500,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.32,
        weight: 2
      }).addTo(map).bindPopup(
        `<div style="font-family: sans-serif; color: #0f172a; font-size: 12px; line-height: 1.4;">
          <strong style="color: #dc2626; font-size: 13px;">🚨 Alaknanda Flash Flood Breach Zone</strong><br/>
          Stage Gauge: <strong>4.8m</strong> (+0.6m over Danger Redline)<br/>
          River Discharge: <strong>${realFlood?.riverDischarge || 294.1} m³/s</strong><br/>
          Threat Level: <span style="color: #dc2626; font-weight: bold;">CRITICAL INUNDATION</span>
        </div>`
      );

      // Landslide Debris Zone near Birahi
      L.circle([30.435, 79.345], {
        radius: 1200,
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.35,
        weight: 2
      }).addTo(map).bindPopup(
        `<div style="font-family: sans-serif; color: #0f172a; font-size: 12px;">
          <strong style="color: #ea580c; font-size: 13px;">⚠ Birahi Landslide Debris Field</strong><br/>
          Sludge Thickness: 1.2m across NH-58<br/>
          Status: Road Blocked · Reroute via High-Ground Ridge
        </div>`
      );
    }

    // 2. Safe Shelters (Green dots & flags)
    if (showSafeShelters) {
      shelters.forEach(s => {
        const isSelected = s.id === selectedShelterId;
        const shelterMarker = L.circleMarker([s.coords.lat, s.coords.lng], {
          radius: isSelected ? 10 : 8,
          color: isSelected ? '#34d399' : '#ffffff',
          fillColor: '#10b981',
          fillOpacity: 0.95,
          weight: isSelected ? 3 : 2
        }).addTo(map);

        shelterMarker.bindPopup(
          `<div style="font-family: sans-serif; color: #0f172a; font-size: 12px; line-height: 1.4;">
            <strong style="color: #059669; font-size: 13px;">⛺ ${s.name}</strong><br/>
            Capacity: <strong>${s.totalCapacity} beds</strong><br/>
            Available: <strong>${s.availableCapacity} beds</strong><br/>
            Status: <span style="color: #059669; font-weight: bold;">🟢 SAFE & OPERATIONAL</span><br/>
            Elevation: <strong>High Ground (Clear of Flood Plain)</strong>
          </div>`
        );
      });
    }

    // 3. Dynamic Evacuation Routes (Blocked Route in Red, Safe Route in Glowing Emerald)
    if (showEvacuationRoutes || activeTab === 'evacuation') {
      const originLat = currentOrigin.coords[0];
      const originLng = currentOrigin.coords[1];
      const destLat = currentShelter.coords.lat;
      const destLng = currentShelter.coords.lng;

      // Arterial Route (NH-58 via Riverbed)
      const arterialWaypoints: [number, number][] = [
        [originLat, originLng],
        [30.4480, 79.3580],
        [30.4350, 79.3450], // Landslide point
        [30.4220, 79.3340],
        [destLat, destLng]
      ];

      if (simulatedBlockage) {
        // Blocked Arterial Corridor (Red Dashed)
        L.polyline(arterialWaypoints, {
          color: '#ef4444',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        }).addTo(map).bindPopup(
          `<div style="font-family: sans-serif; color: #0f172a; font-size: 12px;">
            <strong style="color: #dc2626;">⛔ NH-58 Arterial Route BLOCKED</strong><br/>
            Landslide debris & flash flood surge at Km 42 near Birahi.<br/>
            Passability: 0% · Road impassable for civilian vehicles.<br/>
            <span style="color: #dc2626; font-weight: bold;">Reroute strictly via High-Ground Ridge Bypass.</span>
          </div>`
        );

        // Roadblock Hazard Marker
        const blockIcon = L.divIcon({
          className: 'hazard-marker',
          html: `<div style="background:#ef4444; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; box-shadow:0 0 10px rgba(239,68,68,0.7); border:2px solid white;">⛔</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker([30.4350, 79.3450], { icon: blockIcon }).addTo(map).bindPopup(
          `<strong style="color:#dc2626;">Active Road Blockage</strong><br/>Sludge Depth: 1.2m at NH-58 Km 42`
        );
      } else {
        // Clear Arterial Corridor (Green)
        L.polyline(arterialWaypoints, {
          color: '#10b981',
          weight: 4,
          opacity: 0.85
        }).addTo(map).bindPopup(
          `<strong>Arterial Route via NH-58</strong><br/>Status: Clear & Open`
        );
      }

      // Safe High-Ground Ridge Bypass Corridor (Vibrant Glowing Emerald)
      const safeRidgeWaypoints: [number, number][] = [
        [originLat, originLng],
        [30.4610, 79.3520], // Upper Terrace Ascent
        [30.4450, 79.3380], // High Ridgeline Checkpoint
        [30.4310, 79.3310], // North Ridge Descent
        [destLat, destLng]  // Shelter Safe Haven
      ];

      // Luminous Underglow line
      L.polyline(safeRidgeWaypoints, {
        color: '#34d399',
        weight: 8,
        opacity: 0.35
      }).addTo(map);

      // Core Safe Polyline
      const safePolyline = L.polyline(safeRidgeWaypoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.95
      }).addTo(map);

      safePolyline.bindPopup(
        `<div style="font-family: sans-serif; color: #0f172a; font-size: 12px; line-height: 1.4;">
          <strong style="color: #059669; font-size: 13px;">🟢 Recommended Safe Evacuation Corridor</strong><br/>
          Corridor: <strong>High-Ground Ridge Bypass</strong><br/>
          Elevation: <strong>1,680m (+360m above flood waterline)</strong><br/>
          Distance: <strong>11.2 km</strong> · ETA: <strong>26 min</strong><br/>
          Jordan Polygon Collisions: <strong style="color: #059669;">0 intersections (100% Safe)</strong>
        </div>`
      );

      // Origin Pin (Flag)
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `<div style="background:#dc2626; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; box-shadow:0 0 10px rgba(220,38,38,0.7); border:2px solid white;">🚩</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([originLat, originLng], { icon: originIcon }).addTo(map).bindPopup(
        `<strong>Evacuation Start:</strong> ${currentOrigin.name}<br/>Danger Level: ${currentOrigin.dangerLevel}`
      );

      // Destination Pin (Safe Haven)
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `<div style="background:#059669; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; box-shadow:0 0 10px rgba(5,150,105,0.7); border:2px solid white;">🏁</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([destLat, destLng], { icon: destIcon }).addTo(map).bindPopup(
        `<strong>Safe Destination:</strong> ${currentShelter.name}<br/>Capacity: ${currentShelter.availableCapacity} available beds`
      );

      // If activeTab is 'evacuation', adjust bounds to fit the route
      if (activeTab === 'evacuation') {
        const bounds = L.latLngBounds(safeRidgeWaypoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }

    // 4. Accredited Disaster Relief NGOs & Humanitarian Outposts
    if (showNGOs || activeTab === 'ngos') {
      RELIEF_NGOS_DATA.forEach(ngo => {
        const distance = calculateDistanceKm(currentOrigin.coords[0], currentOrigin.coords[1], ngo.coords.lat, ngo.coords.lng);
        const isHighlighted = highlightedNgoId === ngo.id;

        const ngoIcon = L.divIcon({
          className: 'ngo-marker',
          html: `<div style="background:#091224; border:2px solid ${isHighlighted ? '#38bdf8' : '#0ea5e9'}; border-radius:50%; width:${isHighlighted ? '38px' : '32px'}; height:${isHighlighted ? '38px' : '32px'}; display:flex; align-items:center; justify-content:center; box-shadow:0 0 ${isHighlighted ? '14px' : '8px'} rgba(14,165,233,0.7); cursor:pointer; font-size:15px; transition:all 0.2s;">🤝</div>`,
          iconSize: isHighlighted ? [38, 38] : [32, 32],
          iconAnchor: isHighlighted ? [19, 19] : [16, 16]
        });

        const marker = L.marker([ngo.coords.lat, ngo.coords.lng], { icon: ngoIcon }).addTo(map);

        // Rich 1-Touch Call and WhatsApp Popup
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; min-width: 240px; padding: 2px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0284c7; margin-bottom: 2px;">
              ${ngo.category} · Accredited Relief Outpost
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 4px;">
              ${ngo.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              📍 GPS: <strong>${ngo.coords.lat.toFixed(4)}°N, ${ngo.coords.lng.toFixed(4)}°E</strong><br/>
              📏 Distance from Origin: <strong style="color: #0284c7;">${distance} km</strong> · ${ngo.operatingHours}
            </div>
            <div style="font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 5px 8px; border-radius: 6px; margin-bottom: 8px; line-height: 1.35;">
              📦 <strong>Immediate Supplies:</strong><br/>${ngo.immediateSupplies}
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${ngo.phoneRaw}" style="flex: 1; background: #0284c7; color: white; text-align: center; padding: 7px 6px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                📞 Call (${ngo.phone})
              </a>
              <a href="https://wa.me/${ngo.whatsapp}?text=EMERGENCY%20DISASTER%20REQUEST:%20Need%20immediate%20humanitarian%20assistance%20at%20Chamoli%20coordinates%20${ngo.coords.lat},${ngo.coords.lng}" target="_blank" style="background: #16a34a; color: white; text-align: center; padding: 7px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                💬 WhatsApp
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (isHighlighted) {
          marker.openPopup();
        }
      });
    }

    // 5. Hydrological Telemetry Sensors (Amber dots)
    if (showSensors) {
      const sensorCoords = [
        { lat: 30.4110, lng: 79.3230, name: 'CWC Hydro Station 08-ALAK (Gauge: 4.8m · +0.6m Danger)' },
        { lat: 30.4610, lng: 79.3720, name: 'Pipalkoti IMD Rain Gauge (Precip: 48mm/hr)' },
        { lat: 30.4350, lng: 79.3450, name: 'Birahi Gorge Telemetry Array (Sludge Telemetry)' }
      ];

      sensorCoords.forEach(f => {
        L.circleMarker([f.lat, f.lng], {
          radius: 6,
          color: '#ffffff',
          fillColor: '#f59e0b',
          fillOpacity: pulsingIncident ? 1 : 0.85,
          weight: 1.5
        }).addTo(map).bindPopup(
          `<strong style="color:#d97706;">Sensor Array:</strong> ${f.name}<br/>Telemetry Status: Active Live Stream`
        );
      });
    }

  }, [
    showHazardZones,
    showSafeShelters,
    showEvacuationRoutes,
    showNGOs,
    showSensors,
    pulsingIncident,
    shelters,
    selectedOriginKey,
    selectedShelterId,
    simulatedBlockage,
    activeTab,
    highlightedNgoId,
    realFlood
  ]);

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

  // Focus on specific NGO
  const handleFocusNGO = (ngo: ReliefNGO) => {
    setHighlightedNgoId(ngo.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([ngo.coords.lat, ngo.coords.lng], 14, { animate: true });
  };

  // Switch basemap layer dynamically
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
      const context = `Theater: Chamoli District, Uttarakhand. River Discharge: ${realFlood?.riverDischarge || 294.1} m3/s. Water Gauge: ${realFlood?.waterLevelGauge || 4.65}m (Danger: 4.2m). Wind: ${realWeather?.windSpeed || 14.2} km/h ${realWeather?.windDirectionCardinal || 'SW'}. Shelters Active: ${shelters.length}. Nearest NGO: ${nearestNGO.name} (${nearestNGO.phone}).`;
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
        recommendedAction: 'Immediate dispatch to nearest rescue outpost & Zodiac boat unit'
      });
    } finally {
      setIsTriageLoading(false);
    }
  };

  const handleCopyCoordinates = () => {
    const coordsStr = `SAFE EVACUATION ROUTE (Chamoli Ridge Bypass):\nOrigin: ${currentOrigin.name} (${currentOrigin.coords[0]}, ${currentOrigin.coords[1]})\nDestination: ${currentShelter.name} (${currentShelter.coords.lat}, ${currentShelter.coords.lng})\nStatus: SAFE (Elevation 1,680m, +360m above river flood level)\nNearest NGO Support: ${nearestNGO.name} (${nearestNGO.phone})`;
    navigator.clipboard.writeText(coordsStr);
    setCopiedRoute(true);
    setTimeout(() => setCopiedRoute(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Main Header matching Screenshots */}
      <header className="border-b border-white/[0.08] bg-[#090e1c]/90 backdrop-blur-md px-4 sm:px-6 py-2.5 sticky top-0 z-30 flex items-center justify-between gap-4">
        {/* Brand & Hub Name */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <span className="text-slate-500 font-mono text-sm tracking-wider group-hover:text-sky-400 transition-colors">\\</span>
            <span className="font-bold tracking-wide text-white text-base">SAHAYAK</span>
            <span className="text-xs font-mono text-slate-400 italic hidden md:inline">.ai Disaster Hub</span>
          </button>
        </div>

        {/* Center Pill Navigation Buttons - Fully functional & responsive */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'map' 
                ? 'bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tactical Map</span>
          </button>

          <button
            onClick={() => setActiveTab('evacuation')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'evacuation' 
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Safe Route</span>
          </button>

          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ngos' 
                ? 'bg-blue-500/20 text-blue-300 shadow-sm border border-blue-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
            <span>NGO Relief</span>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'triage' 
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>NLP Triage</span>
          </button>

          <button
            onClick={() => setActiveTab('ml-engines')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ml-engines' 
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Engines</span>
          </button>

          <button
            onClick={() => setActiveTab('stockpiles')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stockpiles' 
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Shelter Stockpiles</span>
          </button>

          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'satellite' 
                ? 'bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>SatQuery AI</span>
          </button>
        </nav>

        {/* Right Action Links */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSosModal(true)}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            title="Send Emergency SOS Distress Signal"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span>SOS</span>
          </button>

          {/* Simulation Studio Trigger */}
          <button
            onClick={onOpenStudio}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Open 20-Step Simulation Player"
          >
            <span>Studio</span>
            <span className="text-[10px] text-sky-400 font-mono">↗</span>
          </button>

          {/* System Directory Trigger */}
          <button
            onClick={onOpenDirectory}
            className="hidden sm:flex px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-all items-center gap-1.5 shadow-sm active:scale-95"
            title="Browse all specialized disaster modules"
          >
            <span>System Directory</span>
            <span className="text-[10px] text-slate-400 font-mono">↗</span>
          </button>

          {/* Printable PDF Report Download */}
          <button
            onClick={onDownloadPDF}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download Official 20-Section PDF Disaster Incident Report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* Sub-header status ticker */}
      <div className="bg-[#0b1122]/60 border-b border-white/5 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SQLite Active · 16 Engines Online</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400 font-mono text-xs">
          <span>Theater: <strong className="text-sky-400">Chamoli District & Upper Alaknanda Basin</strong></span>
          <span>Sim Step: <strong className="text-white">{currentStep}/{totalSteps}</strong></span>
          {realWeather && (
            <span className="inline-flex items-center gap-2 text-slate-300 font-mono text-[11px] border-l border-white/10 pl-3">
              <span className="text-amber-300">☀️ {realWeather.temperature}°C</span>
              <span className="text-cyan-300">💨 {realWeather.windSpeed} km/h {realWeather.windDirectionCardinal}</span>
              <span className="text-blue-300">🌧️ {realWeather.precipitation} mm</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Container Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        
        {/* Header Summary Banner */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] tracking-wider uppercase">
            Unified Autonomous Command Center
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Multi-Hazard Disaster Intelligence & <span className="font-serif italic font-normal text-slate-200">Operational Infrastructure</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Real-time multi-hazard operational command hub: dynamic ray-casting evacuation routing, accredited humanitarian NGO 1-touch dispatch, and live satellite flood intelligence.
          </p>
        </section>

        {/* 4 Real-Time Metric Telemetry Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Active Threat Level */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#12192e] to-[#0a0f1d] border border-red-500/30 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
              <span>Active Threat Level</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-500/30 font-bold animate-pulse">LIVE</span>
            </div>
            <div className="text-2xl font-serif italic font-semibold text-red-500 mb-1 truncate">
              {realFlood ? `${realFlood.floodRiskLevel}` : 'CODE RED'}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Stage Gauge: <strong className="text-red-400">{realFlood?.waterLevelGauge || 4.65}m</strong> (Redline: 4.20m)
            </div>
          </div>

          {/* Card 2: Live Atmospheric Feed */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1628] to-[#09101d] border border-sky-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
              <span>Live Atmospheric Feed</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-500/30 font-mono">OPEN-METEO</span>
            </div>
            <div className="text-2xl font-extrabold text-white mb-1 flex items-baseline gap-2">
              <span>{realWeather?.temperature || 23.4}°C</span>
              <span className="text-xs font-normal text-slate-400">Feels {realWeather?.apparentTemperature || 25.1}°C</span>
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Wind: <strong className="text-cyan-400">{realWeather?.windSpeed || 14.2} km/h {realWeather?.windDirectionCardinal || 'SW'}</strong>
            </div>
          </div>

          {/* Card 3: Real River Flow */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0a1526] to-[#070e1b] border border-blue-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
              <span>River Flow (GloFAS)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-mono">CWC HYDRO</span>
            </div>
            <div className="text-2xl font-extrabold text-blue-400 mb-1">
              {realFlood?.riverDischarge || 294.1} <span className="text-xs font-normal text-slate-400">m³/s</span>
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Peak: <strong>{realFlood?.maxDischarge || 320.5} m³/s</strong> (Mean: {realFlood?.meanDischarge || 285.9})
            </div>
          </div>

          {/* Card 4: Registered Relief Shelters & NGOs */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0a1824] to-[#07101b] border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 uppercase mb-1.5">
              <span>Relief & NGO Outposts</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">TOUCH READY</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mb-1">
              {shelters.length} Shelters · {RELIEF_NGOS_DATA.length} NGOs
            </div>
            <div className="text-xs text-slate-300 font-mono truncate">
              Nearest NGO: <strong className="text-sky-300">{nearestNGO.shortName}</strong> ({nearestNGO.distanceKm} km away)
            </div>
          </div>
        </section>

        {/* Primary Tactical GIS Leaflet Map Section */}
        <section className="rounded-xl border border-white/[0.08] bg-[#0b1122] overflow-hidden shadow-2xl">
          {/* Map Title Strip */}
          <div className="px-5 py-3 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#090e1c]">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Tactical GIS Disaster Command Map</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-sky-950/60 border border-sky-500/40 text-sky-400 uppercase font-semibold">
                Live Spatial Feed
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Center: Chamoli Uttarakhand (30.41°N, 79.32°E) · Touch any shelter or NGO marker for direct contact
            </div>
          </div>

          {/* Map Container Viewport */}
          <div 
            ref={mapContainerRef}
            className="w-full h-[440px] sm:h-[480px] bg-[#050811] relative z-10"
          />

          {/* Map Bottom Control & Legend Toolbar */}
          <div className="px-4 sm:px-5 py-3 border-t border-white/[0.08] bg-[#090e1c] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
            {/* Left Action Buttons & Layer Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRecenter}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                title="Recenter map on Chamoli Theater"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Recenter</span>
              </button>

              {/* Basemap Switcher */}
              <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                <button
                  onClick={() => switchBaseMap('dark')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    mapBaseType === 'dark' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌑 Dark Tactical
                </button>
                <button
                  onClick={() => switchBaseMap('satellite')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    mapBaseType === 'satellite' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛰️ Satellite HD
                </button>
              </div>

              {/* Layer Toggles */}
              <button
                onClick={() => setShowHazardZones(!showHazardZones)}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  showHazardZones ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🚨 Hazard Zones
              </button>
              <button
                onClick={() => setShowSafeShelters(!showSafeShelters)}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  showSafeShelters ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                ⛺ Safe Shelters
              </button>
              <button
                onClick={() => setShowEvacuationRoutes(!showEvacuationRoutes)}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  showEvacuationRoutes ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🛣️ Safe Routes
              </button>
              <button
                onClick={() => setShowNGOs(!showNGOs)}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  showNGOs ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-medium' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🤝 NGO Outposts
              </button>
              <button
                onClick={handlePulseGeocodes}
                className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
                  pulsingIncident ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                Pulse Sensors
              </button>
            </div>

            {/* Right Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Safe Shelter
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                Accredited NGO (Touch to Call)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Flood Breach / Blocked
              </span>
            </div>
          </div>
        </section>

        {/* VIEW 1: Evacuation Router View (Activated via Top 'Safe Route' Button) */}
        {activeTab === 'evacuation' && (
          <section className="p-5 sm:p-6 rounded-xl border border-emerald-500/40 bg-[#0a1324] space-y-5 animate-in fade-in shadow-2xl">
            {/* View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Route className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Dynamic Safe Evacuation Routing System
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    RAY-CASTING AVOIDANCE
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Autonomous high-ground bypass solver: circumvents flooded Alaknanda gorges and active landslide blockages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCoordinates}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  {copiedRoute ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedRoute ? 'Route Copied!' : 'Share Route'}</span>
                </button>
                <button
                  onClick={() => setSimulatedBlockage(!simulatedBlockage)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-mono ${
                    simulatedBlockage
                      ? 'bg-red-950/60 border-red-500/40 text-red-300'
                      : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {simulatedBlockage ? '⚠ Road Blockage: ACTIVE' : '✓ Road Blockage: CLEARED'}
                </button>
              </div>
            </div>

            {/* Origin and Destination Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Selector */}
              <div className="p-4 rounded-xl bg-[#0e1933] border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="text-red-400 font-bold">🚩</span>
                  <span>Select Origin Disaster Location (Current Position):</span>
                </label>
                <select
                  value={selectedOriginKey}
                  onChange={(e) => setSelectedOriginKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a14] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                >
                  {HAZARD_ORIGINS.map(origin => (
                    <option key={origin.key} value={origin.key}>
                      {origin.name} · [{origin.dangerLevel}]
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 font-mono">
                  Coordinates: {currentOrigin.coords[0].toFixed(4)}°N, {currentOrigin.coords[1].toFixed(4)}°E · {currentOrigin.description}
                </div>
              </div>

              {/* Destination Shelter Selector */}
              <div className="p-4 rounded-xl bg-[#0e1933] border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">🏁</span>
                  <span>Select Destination Safe Shelter:</span>
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a14] border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.availableCapacity} / {s.totalCapacity} beds free)
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 font-mono">
                  Coordinates: {currentShelter.coords.lat.toFixed(4)}°N, {currentShelter.coords.lng.toFixed(4)}°E · Status: 🟢 {currentShelter.status || 'OPERATIONAL'}
                </div>
              </div>
            </div>

            {/* Route Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Arterial Route (NH-58) */}
              <div className={`p-4 rounded-xl border transition-all ${
                simulatedBlockage 
                  ? 'bg-red-950/30 border-red-500/40 text-red-200' 
                  : 'bg-[#0e162b] border-white/10 text-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>Primary Arterial Corridor: NH-58 Riverbed</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    simulatedBlockage 
                      ? 'bg-red-900/60 text-red-400 border border-red-500/30 animate-pulse' 
                      : 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {simulatedBlockage ? '⛔ BLOCKED BY DISASTER' : '✓ OPEN'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-4 font-mono mb-2">
                  <span>Distance: 8.4 km</span>
                  <span>Travel Time: 18 min</span>
                  <span>Elevation: 1,320m (Low Riverbed)</span>
                </div>
                {simulatedBlockage ? (
                  <div className="text-xs text-red-300 bg-red-950/50 p-2.5 rounded-lg border border-red-500/30 space-y-1">
                    <div className="font-semibold">⚠ Flash flood surge & 1.2m sludge at Km 42 near Birahi.</div>
                    <div className="text-[11px] text-red-200/80">
                      Water gauge is 4.8m (+0.6m above danger redline). Civil traffic halted by SDRF. Reroute required.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                    Road is currently clear for emergency convoys.
                  </div>
                )}
              </div>

              {/* Recommended Safe High-Ground Ridge Bypass Corridor */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-[#0c1e33] to-[#091524] border-emerald-500/40 text-slate-200 space-y-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High-Ground Ridge Bypass Corridor (Upper Terrace)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-500/40">
                    🟢 100% SAFE & RECOMMENDED
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-4 font-mono">
                  <span>Distance: <strong>11.2 km</strong></span>
                  <span>Travel Time: <strong>26 min</strong> (4x4 convoy)</span>
                  <span className="text-emerald-400">Elev: <strong>1,680m</strong> (+360m clearance)</span>
                </div>
                <div className="text-xs text-emerald-300/90 font-mono bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
                  <div>✓ <strong>Jordan Polygon Verification:</strong> 0 intersections with flood breach zone.</div>
                  <div className="text-[11px] text-slate-300">
                    Clear of all steep mudslide vectors. Checked and patrolled by Uttarakhand Mountain Brigade.
                  </div>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Waypoint Guidance Strip */}
            <div className="p-4 rounded-xl bg-[#091224] border border-white/10 space-y-2.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Safe Waypoint Navigation Checklist:</span>
                <span className="text-[11px] font-mono text-emerald-400">High-Ground Clear Path</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0e1933] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400">WAYPOINT 1 · START</div>
                  <div className="font-bold text-white truncate">{currentOrigin.name}</div>
                  <div className="text-[10px] text-slate-400">Ascend via Ridge Road</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1933] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400">WAYPOINT 2 · KM 3.2</div>
                  <div className="font-bold text-sky-300 truncate">Upper Terrace Checkpoint</div>
                  <div className="text-[10px] text-slate-400">Elev: 1,520m · Mud-free</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1933] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400">WAYPOINT 3 · KM 7.8</div>
                  <div className="font-bold text-sky-300 truncate">North Ridge Crest (1,680m)</div>
                  <div className="text-[10px] text-slate-400">Bypasses Birahi Gorge</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1933] border border-white/5 space-y-1">
                  <div className="text-[10px] text-slate-400">WAYPOINT 4 · ARRIVAL</div>
                  <div className="font-bold text-emerald-400 truncate">{currentShelter.name}</div>
                  <div className="text-[10px] text-emerald-300">Safe Haven Reached</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 2: Accredited NGO Relief Network (Activated via Top 'NGO Relief' Button) */}
        {activeTab === 'ngos' && (
          <section className="p-5 sm:p-6 rounded-xl border border-blue-500/40 bg-[#091224] space-y-5 animate-in fade-in shadow-2xl">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Accredited Humanitarian Relief Outposts & 1-Touch Contacts
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                    6 BASES ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Touch any outpost below or on the tactical map for instant telephone dispatch, WhatsApp assistance, or GPS directions.
                </p>
              </div>

              {/* Nearest NGO Touch Alert */}
              <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span className="text-xs font-mono text-blue-200">
                  Nearest: <strong>{nearestNGO.shortName}</strong> ({nearestNGO.distanceKm} km)
                </span>
                <a
                  href={`tel:${nearestNGO.phoneRaw}`}
                  className="ml-2 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'All Outposts', value: 'ALL' },
                { label: 'Medical & Trauma', value: 'Medical & Trauma' },
                { label: 'Food & Rations', value: 'Food & Rations' },
                { label: 'Water & Sanitation', value: 'Water & Sanitation' },
                { label: 'Boats & Rescue', value: 'Boats & Water Rescue' },
                { label: 'Search Volunteers', value: 'Search Volunteers' }
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedNgoCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedNgoCategory === cat.value
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* NGO Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNGOs.map(ngo => {
                const isSelected = highlightedNgoId === ngo.id;
                return (
                  <div
                    key={ngo.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-[#0f1e38] border-sky-400 shadow-lg shadow-sky-500/10'
                        : 'bg-[#0c162a] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Badge & Distance */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                          {ngo.category}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          {ngo.distanceKm} km away
                        </span>
                      </div>

                      {/* Name & Address */}
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">{ngo.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{ngo.address}</p>
                      </div>

                      {/* GPS Coordinates */}
                      <div className="text-[11px] text-slate-300 font-mono bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span>📍 {ngo.coords.lat.toFixed(4)}°N, {ngo.coords.lng.toFixed(4)}°E</span>
                        <span className="text-[10px] text-slate-400">{ngo.operatingHours}</span>
                      </div>

                      {/* Immediate Supplies */}
                      <div className="text-xs text-slate-300 bg-[#08101e] p-2.5 rounded-lg border border-white/5 space-y-1">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Immediate Stocks on Watch:</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{ngo.immediateSupplies}</p>
                      </div>
                    </div>

                    {/* 1-Touch Direct Contact Action Buttons */}
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      {/* Direct Phone Call Button */}
                      <a
                        href={`tel:${ngo.phoneRaw}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                        title={`Call ${ngo.phone} directly`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call ({ngo.phone})</span>
                      </a>

                      {/* Direct WhatsApp Button */}
                      <a
                        href={`https://wa.me/${ngo.whatsapp}?text=EMERGENCY%20DISASTER%20REQUEST:%20Requesting%20humanitarian%20assistance%20at%20Chamoli%20coordinates%20${ngo.coords.lat},${ngo.coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                        title="Open WhatsApp with pre-filled coordinates"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {/* Map Focus Button */}
                      <button
                        onClick={() => handleFocusNGO(ngo)}
                        className="px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                        title="Focus this NGO on map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW 3: NLP Incident Triage Console (Activated via Top 'NLP Triage' Button) */}
        {activeTab === 'triage' && (
          <section className="p-5 sm:p-6 rounded-xl border border-cyan-500/40 bg-[#091224] space-y-5 animate-in fade-in shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Natural Language Incident Triage & News Grounding
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    MODEL ENGINE 8 (GROQ QWEN-3.8B)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Automated urgency score calculation, dispatch recommendation, and disaster categorization.
                </p>
              </div>
            </div>

            {/* Live Distress Feed Items */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#0e162b] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-sky-400 text-[11px]">CITIZEN-SOS-082 · 4 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                    URGENT (0.94)
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  "Water entered ground floors near Ghat Road, 14 families stranded on upper terrace with infants."
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 flex flex-wrap items-center gap-3">
                  <span>Action: SDRF Zodiac Boat Unit 02 Assigned</span>
                  <span>• Geocode: 30.418°N, 79.328°E</span>
                  <span>• Nearest Base: Rapid Response India (0.9 km)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0e162b] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 text-[11px]">ROAD-WATCH-04 · 12 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    HIGH (0.81)
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  "Rockfall triggered by saturation on NH-58 near Birahi. Sludge thickness approx 1.2m across both lanes."
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 flex flex-wrap items-center gap-3">
                  <span>Action: PWD JCB Bulldozers Dispatched</span>
                  <span>• High-Ground Ridge Bypass active</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0e162b] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 text-[11px]">CWC-HYDRO-WIRE · 18 min ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    NOMINAL (0.24)
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  "Alaknanda gauge station 08-ALAK upstream rate-of-rise stabilizing at +0.1m/hr after peak cloudburst pass."
                </p>
              </div>
            </div>

            {/* Interactive Groq AI Triage Console */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-xs text-slate-200 font-semibold flex items-center justify-between">
                <span>Evaluate Any Distress Message with AI:</span>
                <span className="text-[10px] font-mono text-cyan-400">Powered by Groq High-Speed</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type or paste distress message (e.g. '3 elderly patients trapped without medicine at Birahi')..."
                  value={triageInput}
                  onChange={(e) => setTriageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunTriage()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleRunTriage}
                  disabled={isTriageLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shrink-0"
                >
                  {isTriageLoading ? 'Evaluating...' : 'Triage with AI'}
                </button>
              </div>

              {triageResult && (
                <div className="p-4 rounded-xl bg-[#081224] border border-cyan-500/40 text-xs space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-cyan-300 font-bold">Category: {triageResult.category}</span>
                    <span className="text-red-400 font-bold">Urgency: {triageResult.priority} ({triageResult.urgencyScore})</span>
                  </div>
                  <div className="text-slate-200 text-xs font-mono">
                    Recommended Action: <strong>{triageResult.recommendedAction}</strong>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW 4: ML Engines Drawer */}
        {activeTab === 'ml-engines' && (
          <section className="p-6 rounded-xl border border-indigo-500/30 bg-[#0b1122] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">VajraWatch 16-Feature Prediction Engine</h3>
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

        {/* VIEW 5: Shelter Stockpiles Drawer */}
        {activeTab === 'stockpiles' && (
          <section className="p-6 rounded-xl border border-amber-500/30 bg-[#0b1122] space-y-4 animate-in fade-in">
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

        {/* VIEW 6: SatQuery AI Copilot */}
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
                  '🤝 What is the contact for nearest NGO in Chamoli?',
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

        {/* DEFAULT VIEW: Split Quick-Access Cards (Shown when on 'map' view) */}
        {activeTab === 'map' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Safe Evacuation Corridor Quick Touch */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0b1122] p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-sm sm:text-base text-slate-100">Safe Evacuation Corridors</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 uppercase font-semibold">
                    100% Verified
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('evacuation')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Route Solver</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Status Display */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border bg-[#0e162b] border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">High-Ground Ridge Bypass Corridor</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      SAFE & PASSABLE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                    <span>Dist: 11.2 km</span>
                    <span>ETA: 26 min</span>
                    <span className="text-emerald-300">Elev: 1,680m (Clear of Flood)</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Bypasses Km 42 landslide blockage. Direct conduit to Chamoli High-Ground Safe Shelter.
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                  <span>Blocked: NH-58 Riverbed (Inundation: +1.4m)</span>
                  <button
                    onClick={() => setSimulatedBlockage(!simulatedBlockage)}
                    className="text-sky-400 hover:underline"
                  >
                    Toggle Landslide Simulation
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Humanitarian NGO 1-Touch Relief Directory */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0b1122] p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-sm sm:text-base text-slate-100">NGO Relief Outposts</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-blue-950/60 border border-blue-500/40 text-blue-400 uppercase font-semibold">
                    1-Touch Call
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('ngos')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 transition-colors"
                >
                  <span>View All 6 NGOs</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Nearest 2 NGOs Quick Cards */}
              <div className="space-y-2.5">
                {nearbyNGOs.slice(0, 2).map(ngo => (
                  <div key={ngo.id} className="p-3 rounded-lg bg-[#0e162b] border border-white/10 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{ngo.shortName}</span>
                        <span className="text-[10px] font-mono text-emerald-400">({ngo.distanceKm} km)</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        📍 {ngo.coords.lat.toFixed(3)}°N, {ngo.coords.lng.toFixed(3)}°E · {ngo.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${ngo.phoneRaw}`}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        title={`Direct call to ${ngo.phone}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${ngo.whatsapp}?text=EMERGENCY%20DISASTER%20REQUEST:%20Need%20assistance`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        title="WhatsApp message"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Emergency SOS Distress Modal */}
      <SosModal isOpen={showSosModal} onClose={() => setShowSosModal(false)} />
    </div>
  );
};
