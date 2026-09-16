import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Coordinates, Shelter, Hospital, RescueTeam, Shipment, EvacuationRoute } from '../types';

interface CommandMapProps {
  center?: Coordinates;
  zoom?: number;
  shelters?: Shelter[];
  hospitals?: Hospital[];
  rescueTeams?: RescueTeam[];
  shipments?: Shipment[];
  evacuationRoutes?: EvacuationRoute[];
  disasterPolygon?: Coordinates[];
  onSelectFeature?: (type: string, data: any) => void;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  center = { lat: 30.4128, lng: 79.3242 },
  zoom = 11,
  shelters = [],
  hospitals = [],
  rescueTeams = [],
  shipments = [],
  evacuationRoutes = [],
  disasterPolygon = [],
  onSelectFeature
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  // 24 toggleable layer states
  const [layers, setLayers] = useState({
    disasterZones: true,
    riskZones: true,
    floodedAreas: true,
    landslideZones: true,
    affectedVillages: true,
    populationDensity: false,
    shelters: true,
    hospitals: true,
    rescueTeams: true,
    ambulances: true,
    fireServices: false,
    police: false,
    warehouses: true,
    reliefCamps: true,
    vehicles: true,
    roads: true,
    blockedRoads: true,
    safeRoads: true,
    evacuationRoutes: true,
    criticalInfra: true,
    waterResources: false,
    foodDistribution: false,
    satelliteImagery: false,
    iotSensors: true
  });

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);
  const [satelliteView, setSatelliteView] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Custom Zoom in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Dark tactical carto tiles
      const baseTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles © Esri'
        }
      );
      baseTile.addTo(map);

      mapInstanceRef.current = map;

      // Initialize Layer Groups
      const groupNames = Object.keys(layers);
      groupNames.forEach(name => {
        const group = L.layerGroup().addTo(map);
        layerGroupsRef.current[name] = group;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base tiles if satellite view toggled
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer(l => {
      if (l instanceof L.TileLayer) {
        map.removeLayer(l);
      }
    });

    if (satelliteView) {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(map);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      }).addTo(map);
    }
  }, [satelliteView]);

  // Render & Sync Layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const groups = layerGroupsRef.current;

    // Helper to create HTML pin markers
    const createDivIcon = (emoji: string, bgClass: string, text?: string) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-md shadow-xl text-xs font-semibold border ${bgClass} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110">
            <span>${emoji}</span>
            ${text ? `<span class="truncate max-w-[120px] text-white">${text}</span>` : ''}
          </div>
        `,
        iconSize: [0, 0]
      });
    };

    // 1. Disaster Polygon
    if (groups.disasterZones) {
      groups.disasterZones.clearLayers();
      if (layers.disasterZones && disasterPolygon.length > 2) {
        const latLngs: [number, number][] = disasterPolygon.map(p => [p.lat, p.lng]);
        const poly = L.polygon(latLngs, {
          color: '#ef4444',
          weight: 3,
          dashArray: '6, 6',
          fillColor: '#b91c1c',
          fillOpacity: 0.25
        });
        poly.bindPopup(`
          <div class="text-xs space-y-1">
            <div class="font-bold text-red-400">CRITICAL FLOOD INUNDATION CORRIDOR</div>
            <div>Alaknanda River Catchment Basin</div>
            <div class="text-slate-400">Area: ~52.4 sq km | Status: High Inundation Hazard</div>
          </div>
        `);
        groups.disasterZones.addLayer(poly);
      }
    }

    // 2. Shelters
    if (groups.shelters) {
      groups.shelters.clearLayers();
      if (layers.shelters) {
        shelters.forEach(s => {
          const isNearCap = s.currentOccupancy / s.totalCapacity > 0.8;
          const bg = isNearCap ? 'bg-amber-900/90 border-amber-500 text-amber-200' : 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
          const marker = L.marker([s.coords.lat, s.coords.lng], {
            icon: createDivIcon('🏕️', bg, `${s.name.split(' ')[0]} (${s.currentOccupancy}/${s.totalCapacity})`)
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1.5 p-1 min-w-[200px]">
              <div class="font-bold text-sky-400 flex items-center justify-between">
                <span>${s.name}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] ${isNearCap ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">${s.status}</span>
              </div>
              <div class="text-slate-300">Occupancy: <b>${s.currentOccupancy}</b> / ${s.totalCapacity} (${Math.round((s.currentOccupancy / s.totalCapacity) * 100)}%)</div>
              <div class="text-slate-400">Water Supply: ${s.waterSupplyDays} days | Food: ${s.foodSupplyDays} days</div>
              ${s.shortages.length > 0 ? `<div class="text-red-400 text-[11px]">⚠️ Shortages: ${s.shortages.join(', ')}</div>` : ''}
            </div>
          `);
          marker.on('click', () => onSelectFeature?.('shelter', s));
          groups.shelters.addLayer(marker);
        });
      }
    }

    // 3. Hospitals
    if (groups.hospitals) {
      groups.hospitals.clearLayers();
      if (layers.hospitals) {
        hospitals.forEach(h => {
          const marker = L.marker([h.coords.lat, h.coords.lng], {
            icon: createDivIcon('🏥', 'bg-blue-950/90 border-blue-500 text-blue-200', `${h.name.split(' ')[0]} (${h.availableBeds} beds)`)
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1.5 p-1 min-w-[210px]">
              <div class="font-bold text-blue-400">${h.name}</div>
              <div class="text-slate-300">Available Beds: <b>${h.availableBeds}</b> / ${h.totalBeds}</div>
              <div class="text-slate-300">ICU Available: <b>${h.icuAvailable}</b> / ${h.icuTotal}</div>
              <div class="text-slate-400">Ambulances Ready: ${h.ambulancesAvailable} | Blood Units: ${h.bloodUnitsAvailable}</div>
            </div>
          `);
          marker.on('click', () => onSelectFeature?.('hospital', h));
          groups.hospitals.addLayer(marker);
        });
      }
    }

    // 4. Rescue Teams
    if (groups.rescueTeams) {
      groups.rescueTeams.clearLayers();
      if (layers.rescueTeams) {
        rescueTeams.forEach(t => {
          const marker = L.marker([t.coords.lat, t.coords.lng], {
            icon: createDivIcon('👥', 'bg-indigo-950/90 border-indigo-400 text-indigo-200', `${t.organization} (${t.personnelCount})`)
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1.5 p-1 min-w-[210px]">
              <div class="font-bold text-indigo-400">${t.name}</div>
              <div class="text-slate-300">Role: <b>${t.teamType}</b></div>
              <div class="text-slate-300">Personnel: ${t.personnelCount} Rescuers | Boats: ${t.boatsAvailable}</div>
              <div class="text-slate-400">Radio Channel: ${t.contactRadio}</div>
            </div>
          `);
          marker.on('click', () => onSelectFeature?.('rescueTeam', t));
          groups.rescueTeams.addLayer(marker);
        });
      }
    }

    // 5. Logistics Shipments (Trucks)
    if (groups.vehicles) {
      groups.vehicles.clearLayers();
      if (layers.vehicles) {
        shipments.forEach(sh => {
          const marker = L.marker([sh.currentCoords.lat, sh.currentCoords.lng], {
            icon: createDivIcon('🚚', 'bg-purple-950/90 border-purple-400 text-purple-200', `${sh.vehicleId} [${sh.status}]`)
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1.5 p-1 min-w-[220px]">
              <div class="font-bold text-purple-400 flex items-center justify-between">
                <span>${sh.vehicleId}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300">${sh.status}</span>
              </div>
              <div class="text-slate-300">Cargo: <b>${sh.quantity} ${sh.unit}</b> (${sh.resourceCategory})</div>
              <div class="text-slate-400">Destination: ${sh.destinationName}</div>
              <div class="text-slate-400">Progress: ${sh.routeProgressPct}%</div>
              <div class="text-amber-300 text-[10px] font-mono">Demo / Simulated GPS Stream</div>
            </div>
          `);
          marker.on('click', () => onSelectFeature?.('shipment', sh));
          groups.vehicles.addLayer(marker);
        });
      }
    }

    // 6. Evacuation Routes & Blocked Road Highlight
    if (groups.evacuationRoutes) {
      groups.evacuationRoutes.clearLayers();
      if (layers.evacuationRoutes) {
        evacuationRoutes.forEach(r => {
          const isBlocked = r.status === 'BLOCKED';
          const polyline = L.polyline(
            r.waypoints.map(w => [w.lat, w.lng]),
            {
              color: isBlocked ? '#ef4444' : r.isAlternativeRoute ? '#38bdf8' : '#10b981',
              weight: isBlocked ? 5 : 4,
              dashArray: isBlocked ? '8, 8' : r.isAlternativeRoute ? '4, 8' : undefined,
              opacity: isBlocked ? 0.9 : 0.8
            }
          );

          polyline.bindPopup(`
            <div class="text-xs space-y-1 p-1 min-w-[220px]">
              <div class="font-bold ${isBlocked ? 'text-red-400' : 'text-emerald-400'}">
                ${isBlocked ? '⛔ BLOCKED CORRIDOR' : r.isAlternativeRoute ? '🔄 DYNAMIC ALTERNATIVE ROUTE' : '✅ SAFE EVACUATION ROUTE'}
              </div>
              <div class="text-slate-200 font-medium">${r.name}</div>
              <div class="text-slate-400">Distance: ${r.distanceKm} km | Est. Travel Time: ${isBlocked ? 'BLOCKED' : `${r.estimatedTravelTimeMin} min`}</div>
              ${r.blockageReason ? `<div class="text-red-400 bg-red-950/40 p-1.5 rounded border border-red-800/50 mt-1">${r.blockageReason}</div>` : ''}
            </div>
          `);
          groups.evacuationRoutes.addLayer(polyline);

          // Add Blockage Icon at choke point if blocked
          if (isBlocked && r.waypoints.length > 2) {
            const chokePoint = r.waypoints[2];
            const blockMarker = L.marker([chokePoint.lat, chokePoint.lng], {
              icon: createDivIcon('⛔', 'bg-red-950/95 border-red-500 text-red-100 pulsing-hazard', 'NH-58 BLOCKED (KM 42)')
            });
            groups.evacuationRoutes.addLayer(blockMarker);
          }
        });
      }
    }

    // 7. Villages at risk
    if (groups.affectedVillages) {
      groups.affectedVillages.clearLayers();
      if (layers.affectedVillages) {
        const villages = [
          { name: 'Joshimath Foothills Hamlet', coords: { lat: 30.5480, lng: 79.5580 }, population: 1800 },
          { name: 'Helang Riverside Basti', coords: { lat: 30.5080, lng: 79.4210 }, population: 2200 },
          { name: 'Pipalkoti Lower Market', coords: { lat: 30.4590, lng: 79.3690 }, population: 3100 },
          { name: 'Birahi Confluence', coords: { lat: 30.3780, lng: 79.3490 }, population: 1400 },
          { name: 'Chamoli Bazaar Low Sector', coords: { lat: 30.4120, lng: 79.3240 }, population: 4200 },
          { name: 'Nandaprayag Ghat Colony', coords: { lat: 30.3320, lng: 79.3240 }, population: 1500 }
        ];

        villages.forEach(v => {
          const marker = L.circleMarker([v.coords.lat, v.coords.lng], {
            radius: 8,
            fillColor: '#f59e0b',
            fillOpacity: 0.8,
            color: '#78350f',
            weight: 2
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1">
              <div class="font-bold text-amber-400">AFFECTED SETTLEMENT: ${v.name}</div>
              <div class="text-slate-300">Vulnerable Population: <b>${v.population.toLocaleString()}</b></div>
              <div class="text-slate-400">Direct Inundation Buffer Zone</div>
            </div>
          `);
          groups.affectedVillages.addLayer(marker);
        });
      }
    }

    // 8. IoT Sensors
    if (groups.iotSensors) {
      groups.iotSensors.clearLayers();
      if (layers.iotSensors) {
        const sensors = [
          { name: 'CWC Hydro Station 08-ALAK', lat: 30.4110, lng: 79.3230, val: '4.6m (Danger 4.2m)', status: 'CRITICAL' },
          { name: 'Pipalkoti IMD Rain Gauge', lat: 30.4610, lng: 79.3720, val: '185mm / 48h', status: 'CRITICAL' }
        ];
        sensors.forEach(sn => {
          const marker = L.marker([sn.lat, sn.lng], {
            icon: createDivIcon('📡', 'bg-cyan-950/90 border-cyan-400 text-cyan-200', `${sn.name.split(' ')[0]}: ${sn.val}`)
          });
          marker.bindPopup(`
            <div class="text-xs space-y-1">
              <div class="font-bold text-cyan-400">${sn.name}</div>
              <div class="text-slate-300">Live Reading: <b>${sn.val}</b></div>
              <div class="text-slate-400">Protocol: Continuous Telemetry (1-min burst)</div>
            </div>
          `);
          groups.iotSensors.addLayer(marker);
        });
      }
    }
  }, [layers, shelters, hospitals, rescueTeams, shipments, evacuationRoutes, disasterPolygon]);

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-950 rounded-xl overflow-hidden border border-eoc-border shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Floating Tactical Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-eoc-darker/90 backdrop-blur-md px-3 py-2 rounded-lg border border-eoc-border shadow-lg">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Alaknanda Basin GIS Command</span>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <button
          onClick={() => setSatelliteView(!satelliteView)}
          className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
            satelliteView ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {satelliteView ? '🛰️ Satellite' : '🗺️ Dark Carto'}
        </button>
        <button
          onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
          className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
            isLayerDrawerOpen ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>📑 Layers (24)</span>
        </button>
      </div>

      {/* Simulation Watermark Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1 rounded text-[11px] text-amber-300 flex items-center gap-1.5">
        <span>⚠️</span>
        <span className="font-mono">Demo / Simulated Operational GIS Telemetry</span>
      </div>

      {/* Layer Toggle Slide-out Drawer */}
      {isLayerDrawerOpen && (
        <div className="absolute top-14 left-3 z-[1001] w-72 max-h-[80vh] overflow-y-auto bg-eoc-darker/95 backdrop-blur-md border border-eoc-border rounded-lg shadow-2xl p-3 text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span className="font-bold text-slate-200 uppercase tracking-wide">GIS Spatial Layers</span>
            <button
              onClick={() => setIsLayerDrawerOpen(false)}
              className="text-slate-400 hover:text-white text-base leading-none"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {Object.entries(layers).map(([key, val]) => (
              <label
                key={key}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-300 transition-colors"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={e => setLayers(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
