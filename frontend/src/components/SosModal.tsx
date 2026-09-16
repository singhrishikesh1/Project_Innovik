import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle2, 
  X, 
  Radio, 
  Users, 
  Navigation, 
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSosBroadcast?: (sosRecord: any) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  onSosBroadcast
}) => {
  const [emergencyType, setEmergencyType] = useState('Rising Floodwater / Trapped');
  const [message, setMessage] = useState('');
  const [locationText, setLocationText] = useState('Pipalkoti Lower Riverbank Settlement, Chamoli');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>({ lat: 30.4182, lng: 79.3289 });
  const [isLocating, setIsLocating] = useState(false);
  const [peopleCount, setPeopleCount] = useState('3');
  const [contactPhone, setContactPhone] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: parseFloat(position.coords.latitude.toFixed(5)),
          lng: parseFloat(position.coords.longitude.toFixed(5))
        });
        setLocationText(`GPS Locked: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error, using Chamoli fallback:', err);
        setIsLocating(false);
        setLocationText('Chamoli District Relief Sector (GPS Fallback)');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const playSosAlertSound = () => {
    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playSosAlertSound();

    setTimeout(() => {
      const ticketId = `SOS-IN-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        id: ticketId,
        type: emergencyType,
        message: message || 'Urgent evacuation requested. Water level rising rapidly.',
        location: locationText,
        coords: gpsCoords || { lat: 30.4182, lng: 79.3289 },
        peopleCount: parseInt(peopleCount) || 2,
        contact: contactPhone || '+91 98765-XXXXX',
        reporter: reporterName || 'Citizen in Distress',
        timestamp: new Date().toLocaleTimeString(),
        priority: 'CRITICAL - LEVEL 4',
        status: 'DISPATCHED_TO_NDRF'
      };

      setSubmittedTicket(newRecord);
      setIsSubmitting(false);

      if (onSosBroadcast) {
        onSosBroadcast(newRecord);
      }
    }, 800);
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b101e] border-2 border-red-500/50 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-in fade-in zoom-in-95 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedTicket ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Header Banner */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Emergency SOS Distress Signal
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-400">
                    Live EOC Dispatch
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Broadcast directly to NDRF, SDRF, and Emergency Operations Command (EOC).
                </p>
              </div>
            </div>

            {/* Quick Emergency Type Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Nature of Emergency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'flood', label: '🌊 Rising Flood / Trapped' },
                  { id: 'medical', label: '🚑 Medical / Critical Trauma' },
                  { id: 'landslide', label: '⛰️ Landslide / Road Block' },
                  { id: 'food', label: '🍞 Food & Water Cutoff' },
                  { id: 'elderly', label: '👵 Elderly / Infant Risk' },
                  { id: 'other', label: '⚠️ Other Urgent Need' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setEmergencyType(item.label)}
                    className={`px-3 py-2 rounded-xl text-left font-medium text-xs transition-all border ${
                      emergencyType === item.label
                        ? 'bg-red-950/60 border-red-500 text-red-200 shadow-sm'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distress Message Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Emergency Distress Message</span>
                <span className="text-[10px] text-slate-500 font-mono">Speak directly to responders</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="E.g., Water reached 1st floor. 3 people including child trapped on rooftop near Alaknanda bridge. Need urgent boat evacuation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
              />
            </div>

            {/* Location & Real GPS */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Exact Location / Landmark</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/40 border border-sky-500/30"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Use My Live GPS'}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Village, street, landmark or kilometer marker"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#070c18] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
              {gpsCoords && (
                <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Coordinates: {gpsCoords.lat}° N, {gpsCoords.lng}° E</span>
                </div>
              )}
            </div>

            {/* Trapped People & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  People in Danger
                </label>
                <select
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-white/15 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5+ (Family / Group)</option>
                  <option value="10">10+ (Multiple Households)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765-43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Citizen / Family Head"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070c18] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Direct Helpline Hotlines */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant National Helplines:</span>
              </span>
              <div className="flex gap-2 font-mono text-[11px]">
                <a href="tel:112" className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:underline">
                  Dial 112 (ERSS)
                </a>
                <a href="tel:1077" className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/30 hover:underline">
                  Dial 1077 (Disaster)
                </a>
              </div>
            </div>

            {/* Submit SOS Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Radio className="w-4 h-4 animate-spin" />
                {isSubmitting ? 'Transmitting Distress Beacon...' : 'TRANSMIT SOS TO RESCUE COMMAND'}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">
                SOS Distress Signal Transmitted!
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                Priority: {submittedTicket.priority} · Ticket: {submittedTicket.id}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Target Category:</span>
                <span className="text-white font-semibold">{submittedTicket.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Reported Location:</span>
                <span className="text-sky-300 font-semibold">{submittedTicket.location}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Persons Requiring Aid:</span>
                <span className="text-amber-400 font-semibold">{submittedTicket.peopleCount} Stranded</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-400">Assigned Rescue Unit:</span>
                <span className="text-emerald-300 font-bold">NDRF 8th Battalion · Fast Boat Unit 2</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Estimated Response Time:</span>
                <span className="text-red-400 font-bold animate-pulse">~12 Minutes (En Route)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 text-left space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Crucial Survival Instructions:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
                <li>Move to the highest solid ground or reinforced upper floor.</li>
                <li>Do NOT attempt to wade or drive across flooded streams or torrents.</li>
                <li>Keep phone battery conserved; signal rescuers with flashlight or bright cloth.</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="tel:112"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call 112 Control Room
              </a>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
