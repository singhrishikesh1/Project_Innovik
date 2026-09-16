import React, { useState } from 'react';
import { X, Navigation, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSosBroadcast?: (sosRecord: any) => void;
}

const EMERGENCY_CATEGORIES = [
  'Flood Inundation',
  'Medical Emergency',
  'Trapped / Landslide',
  'Supplies Depleted',
  'General Distress'
];

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  onSosBroadcast
}) => {
  const [category, setCategory] = useState(EMERGENCY_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('Pipalkoti Lower Riverbank, Chamoli');
  const [phone, setPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState('2');
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUseGps = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const record = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        message: message || 'Urgent evacuation support needed.',
        location,
        phone: phone || 'Not provided',
        peopleCount: parseInt(peopleCount, 10) || 1,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSubmitted(record);
      setLoading(false);
      if (onSosBroadcast) onSosBroadcast(record);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(null);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0c1017] border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl text-left font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Emergency Distress Signal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Minimal Category Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Nature of emergency
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EMERGENCY_CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1 rounded-md text-xs transition-all border ${
                      category === c
                        ? 'bg-white/15 text-white border-white/30 font-medium'
                        : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/15'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Situation details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your situation, landmarks, or immediate dangers..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#06080e] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-400 resize-none transition-colors"
              />
            </div>

            {/* Location Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400">
                  Location or landmark
                </label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isLocating}
                  className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? 'Locating...' : 'Use GPS'}
                </button>
              </div>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Village, street, bridge or landmark"
                className="w-full px-3 py-2 rounded-lg bg-[#06080e] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* People & Contact (2-column compact grid) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                  Persons needing aid
                </label>
                <select
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#06080e] border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-slate-400"
                >
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5+ people</option>
                  <option value="10">10+ people</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                  Contact number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765-XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#06080e] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Direct Helpline Minimal Text */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
              <span>National Helplines:</span>
              <div className="flex gap-3">
                <a href="tel:112" className="hover:text-white underline">112 (Police/ERSS)</a>
                <a href="tel:1077" className="hover:text-white underline">1077 (Disaster)</a>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>{loading ? 'Sending...' : 'Transmit SOS'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>

          </form>
        ) : (
          /* Clean Minimal Confirmation View */
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Distress Signal Broadcasted</h4>
                <p className="text-xs text-slate-400 font-mono">Reference: {submitted.id} · Priority: High</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#06080e] border border-white/10 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Category:</span>
                <span className="text-slate-200 font-medium">{submitted.category}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-slate-200">{submitted.location}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Persons:</span>
                <span className="text-slate-200">{submitted.peopleCount} reported</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">Dispatched to Local Unit</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stay on high ground. First responders and local rescue coordination have received your coordinates.
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href="tel:112"
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 112</span>
              </a>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
