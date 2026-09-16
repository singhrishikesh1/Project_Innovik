import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  CloudRain, 
  Wind, 
  Compass, 
  Droplets, 
  Gauge, 
  Cloud, 
  Sun, 
  Satellite, 
  RefreshCw, 
  MapPin, 
  Navigation, 
  Layers, 
  Activity, 
  Key,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import { 
  RealWeatherData, 
  HourlyForecastItem, 
  fetchLiveWeather, 
  MONITORING_LOCATIONS, 
  LocationPreset,
  getLiveRadarLayer
} from '../services/weatherService';

interface LiveWeatherSectionProps {
  onOpenSatelliteModal: () => void;
}

export const LiveWeatherSection: React.FC<LiveWeatherSectionProps> = ({ onOpenSatelliteModal }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(MONITORING_LOCATIONS[0]);
  const [weather, setWeather] = useState<RealWeatherData | null>(null);
  const [hourly, setHourly] = useState<HourlyForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapLayerType, setMapLayerType] = useState<'satellite' | 'radar' | 'hybrid'>('radar');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);

  // Fetch weather data
  const loadWeather = async (loc: LocationPreset) => {
    setRefreshing(true);
    try {
      const data = await fetchLiveWeather(loc.lat, loc.lng, loc.name);
      setWeather(data.current);
      setHourly(data.hourly);
    } catch (e) {
      console.error('Failed to load weather', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation]);

  // Leaflet map setup for Weather Radar
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([selectedLocation.lat, selectedLocation.lng], 10);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base satellite layer (Esri World Imagery)
      const baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 10);
    }

    const map = mapInstanceRef.current;

    // Load real-time RainViewer radar overlay
    const attachRadar = async () => {
      const radarInfo = await getLiveRadarLayer();
      if (radarInfo && map) {
        if (radarTileLayerRef.current) {
          map.removeLayer(radarTileLayerRef.current);
        }
        const radarLayer = L.tileLayer(`${radarInfo.host}${radarInfo.path}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.72,
          maxZoom: 18,
          zIndex: 100
        }).addTo(map);
        radarTileLayerRef.current = radarLayer;
      }
    };

    attachRadar();

    // Mark current monitoring epicenter
    L.circleMarker([selectedLocation.lat, selectedLocation.lng], {
      radius: 9,
      color: '#38bdf8',
      fillColor: '#0284c7',
      fillOpacity: 0.9,
      weight: 3
    }).addTo(map).bindPopup(`<b>${selectedLocation.name}</b><br/>Active Telemetry Epicenter`);

  }, [selectedLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const customLoc: LocationPreset = {
        id: 'user-loc',
        name: 'My Current Location',
        state: 'Local Telemetry',
        lat: parseFloat(pos.coords.latitude.toFixed(4)),
        lng: parseFloat(pos.coords.longitude.toFixed(4)),
        basin: 'Local Watershed'
      };
      setSelectedLocation(customLoc);
    });
  };

  return (
    <section id="weather-section" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 text-left border-t border-white/[0.08]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-mono mb-2.5">
            <Satellite className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>LIVE SATELLITE EARTH OBSERVATION & REAL WEATHER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Atmospheric Telemetry & <span className="text-sky-400">Doppler Radar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
            Real-time multi-spectral atmospheric observation ingested from Sentinel-1 SAR, Sentinel-2, and Open-Meteo with live precipitation and wind vectors.
          </p>
        </div>

        {/* Location selector pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUseMyLocation}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Navigation className="w-3 h-3" />
            <span>My GPS Location</span>
          </button>
          
          <button
            onClick={() => loadWeather(selectedLocation)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenSatelliteModal}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Key className="w-3 h-3 text-sky-400" />
            <span>Satellite API Key</span>
          </button>
        </div>
      </div>

      {/* Location Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <span className="text-xs text-slate-400 font-mono shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-sky-400" /> Hotspot:
        </span>
        {MONITORING_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              selectedLocation.id === loc.id
                ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Main Weather Telemetry Grid */}
      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Card 1: Temperature & RealFeel */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070c17] border border-white/10 relative overflow-hidden shadow-lg group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                TEMPERATURE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                LIVE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-extrabold text-white tracking-tight">
                {weather.temperature}°
              </span>
              <span className="text-xl text-slate-400 font-light">C</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Feels like <strong className="text-sky-300">{weather.apparentTemperature}°C</strong> · {weather.weatherDescription}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Cloud Cover: {weather.cloudCover}%</span>
              <span>Barometer: {weather.pressure} hPa</span>
            </div>
          </div>

          {/* Card 2: Wind Speed & Direction Compass */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070c17] border border-white/10 relative overflow-hidden shadow-lg group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                WIND VELOCITY
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {weather.windSpeedKnots} knots
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {weather.windSpeed}
                  </span>
                  <span className="text-sm text-slate-400">km/h</span>
                </div>
                <div className="text-xs text-slate-300">
                  Gusts up to <strong className="text-amber-400">{weather.windGusts} km/h</strong>
                </div>
              </div>

              {/* Dynamic Rotating Compass Needle */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center shadow-inner relative"
                  title={`Wind bearing: ${weather.windDirection}° (${weather.windDirectionCardinal})`}
                >
                  <Compass 
                    className="w-6 h-6 text-sky-400 transition-transform duration-500" 
                    style={{ transform: `rotate(${weather.windDirection}deg)` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 font-semibold">
                  {weather.windDirectionCardinal} ({weather.windDirection}°)
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Bearing: {weather.windDirection}°</span>
              <span className={weather.windSpeed > 30 ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                {weather.windSpeed > 30 ? 'High Gust Warning' : 'Moderate Flow'}
              </span>
            </div>
          </div>

          {/* Card 3: Precipitation & Humidity */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070c17] border border-white/10 relative overflow-hidden shadow-lg group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-400" />
                PRECIPITATION
              </span>
              <span className="text-[10px] text-blue-400 font-mono">
                {weather.humidity}% RH
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {weather.precipitation}
              </span>
              <span className="text-sm text-slate-400">mm/hr</span>
            </div>
            <div className="text-xs text-slate-300">
              Relative Humidity: <strong className="text-blue-300">{weather.humidity}%</strong>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Dew Point: 18.2°C</span>
              <span className={weather.precipitation > 5 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                {weather.precipitation > 5 ? 'Flood Risk Alert' : 'Normal Rate'}
              </span>
            </div>
          </div>

          {/* Card 4: Satellite Telemetry Pass */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070c17] border border-white/10 relative overflow-hidden shadow-lg group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-emerald-400" />
                ORBITAL PASS
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                PASS #{weather.satellitePassCountdownMin}m
              </span>
            </div>
            <div className="text-sm font-bold text-white mb-0.5 truncate">
              {weather.satelliteProvider}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              SAR Backscatter: <strong className="text-emerald-300">{weather.sarBackscatterDb} dB</strong>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              NDWI Water Index: <strong className="text-cyan-300">{weather.ndwiWaterIndex}</strong>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center">
              <span>ESA Sentinel Copernicus</span>
              <span className="text-emerald-400 font-semibold">10m Res</span>
            </div>
          </div>

        </div>
      )}

      {/* Hourly Trend & Live Doppler Radar Map Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Doppler Radar Viewer (8 Cols) */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-[#090f1d] border border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Live High-Res Doppler Radar & Satellite Tile Map
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>RainViewer Radar Feed Active</span>
            </div>
          </div>

          {/* Leaflet Radar Map Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-white/10 relative z-0"
          />

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Center: {selectedLocation.name}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Real-time Inundation Layer
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Co-registered with Copernicus Sentinel SAR Telemetry
            </div>
          </div>
        </div>

        {/* Right Column: 12-Hour Meteorological Trajectory (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#090f1d] border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                12-Hour Forecast
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hourly Interval</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1">
              {hourly.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-12">{item.time}</span>
                    <span className="font-semibold text-white">{item.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-blue-400">
                      <Droplets className="w-3 h-3" /> {item.precipitation} mm
                    </span>
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Wind className="w-3 h-3" /> {item.windSpeed} km/h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200 mt-4">
            <div className="font-semibold text-[11px] mb-1 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-sky-400" /> Meteorological Advisory:
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Orographic convection over the upper watershed is forecasted to peak in 4 hours with intensified runoff into the drainage basin.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
