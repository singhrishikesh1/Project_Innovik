import React, { useState, useEffect } from 'react';
import { Satellite, Key, CheckCircle2, AlertTriangle, X, RefreshCw, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface SatelliteKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SatelliteKeyModal: React.FC<SatelliteKeyModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [provider, setProvider] = useState<'copernicus' | 'sentinel_hub' | 'nasa_earthdata' | 'mapbox' | 'openweathermap' | 'open_meteo'>('copernicus');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.getSatelliteConfig().then(cfg => {
        if (cfg) {
          setCurrentConfig(cfg);
          if (cfg.provider) setProvider(cfg.provider);
          if (cfg.maskedKey) setApiKey(cfg.maskedKey);
        }
      }).catch(err => {
        console.warn('Could not fetch satellite config, using defaults:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testSatelliteConnection({
        provider,
        apiKey: apiKey.includes('...') ? undefined : apiKey,
        clientId,
        clientSecret
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: err.message || 'Connection test failed. Check network or key.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSatelliteConfig({
        provider,
        apiKey: apiKey.includes('...') ? undefined : apiKey,
        clientId,
        clientSecret
      });
      if (onConfigSaved) onConfigSaved();
      onClose();
    } catch (err) {
      console.error('Error saving satellite config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#090e1c] border border-white/15 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0b1122]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <span>Satellite Earth Observation API Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                  REAL DATA FEED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect your satellite credentials to ingest real-time Sentinel-1 SAR & optical passes over Chamoli.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Active Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            currentConfig?.isLiveKeyConfigured
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5 text-xs">
              {currentConfig?.isLiveKeyConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {currentConfig?.isLiveKeyConfigured
                  ? `Live Satellite Key Active (${currentConfig.provider?.toUpperCase()})`
                  : 'Open Fallback Active (NASA GIBS & ESRI World Imagery)'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Target: Chamoli, UK</span>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Satellite Data Provider & Constellation
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'copernicus', name: 'Copernicus CDSE', desc: 'Sentinel-1 SAR + Sentinel-2' },
                { id: 'sentinel_hub', name: 'Sentinel Hub API', desc: 'Processed WMS / OData' },
                { id: 'mapbox', name: 'Mapbox Satellite HD', desc: 'High-Res Global Imagery' },
                { id: 'nasa_earthdata', name: 'NASA Earthdata / GIBS', desc: 'MODIS / VIIRS Flood Daily' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id as any);
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm'
                      : 'bg-[#0e162b] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Input Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  {provider === 'mapbox' ? 'Mapbox Access Token (pk.ey...)' : provider === 'openweathermap' ? 'OpenWeatherMap API Key (32-char hex)' : 'Satellite API Key / Bearer Token'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] font-mono text-slate-400 hover:text-white"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={provider === 'mapbox' ? 'pk.eyJ1IjoieW91...' : provider === 'openweathermap' ? 'e.g. 4a9f8b7c2d1e0f3a...' : 'Enter your Satellite API Key...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* OAuth Client ID & Secret for Copernicus / Sentinel Hub */}
            {(provider === 'copernicus' || provider === 'sentinel_hub') && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">OAuth Client ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., sh-4a92..."
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Client Secret (Optional)</label>
                  <input
                    type="password"
                    placeholder="e.g., secret_..."
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Connection Result Box */}
          {testResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
              testResult.connected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {testResult.connected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {testResult.connected ? 'Connection Verified Successfully' : 'Notice'}
                </span>
                {testResult.latencyMs && (
                  <span className="text-[10px] font-mono text-slate-400">Latency: {testResult.latencyMs} ms</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {testResult.message}
              </p>
              {testResult.groundResolution && (
                <div className="text-[10px] font-mono text-sky-300 pt-1">
                  ✓ Resolution: {testResult.groundResolution} · Orbit: Descending Pass #136
                </div>
              )}
            </div>
          )}

          {/* Quick External Links to Obtain Free Keys */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">How to obtain free Satellite API Keys:</span>
            <div className="flex flex-wrap gap-3 text-[11px]">
              <a
                href="https://dataspace.copernicus.eu/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                Copernicus CDSE (Free) <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://urs.earthdata.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                NASA Earthdata (Free) <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.mapbox.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                Mapbox Satellite (Free Tier) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg transition-colors active:scale-95"
            >
              {saving ? 'Saving...' : 'Save & Ingest Real Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
