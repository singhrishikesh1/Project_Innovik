import React, { useState } from 'react';
import { Shield, MapPin, Phone, AlertTriangle, ArrowLeft, Send, CheckCircle2, Volume2, Navigation } from 'lucide-react';
import { Shelter, EvacuationRoute } from '../types';

interface CitizenPortalProps {
  shelters: Shelter[];
  routes: EvacuationRoute[];
  onBack: () => void;
  onOpenDashboard: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  shelters,
  routes,
  onBack,
  onOpenDashboard
}) => {
  const [sosSent, setSosSent] = useState(false);
  const [citizenName, setCitizenName] = useState('');
  const [peopleCount, setPeopleCount] = useState('2');
  const [medicalUrgency, setMedicalUrgency] = useState(false);
  const [citizenLocation, setCitizenLocation] = useState('Pipalkoti Lower Market Settlement');

  // Bilingual siren alert for citizens
  const playVoiceAlert = (lang: 'hi' | 'en') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = lang === 'hi'
      ? 'सावधान। अलकनंदा नदी में अचानक बाढ़ का अलर्ट जारी किया गया है। कृपया तुरंत ऊंचे स्थानों और सुरक्षित राहत शिविरों की ओर जाएं।'
      : 'Attention! Flash flood emergency alert issued for the Alaknanda river basin. Please evacuate low-lying riverbanks immediately to designated high-ground shelters.';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    setSosSent(true);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#090e1c] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-white text-base">VajraWatch</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono">
              Citizen Emergency Portal
            </span>
          </div>
        </div>

        <button
          onClick={onOpenDashboard}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
        >
          Open Operational Dashboard →
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Emergency Alert Audio Banner */}
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-red-300 flex items-center gap-2">
                Active Flash Flood Warning — Upper Alaknanda Basin
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                River level is rising rapidly (+0.7m in 20 min). NH-58 lowland is compromised. Use designated high-ground corridors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => playVoiceAlert('hi')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              आपातकालीन चेतावनी (हिंदी)
            </button>
            <button
              onClick={() => playVoiceAlert('en')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Audio Warning (English)
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Safe Shelters & Emergency SOS Request */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Nearest Safe Shelters & Evacuation Route */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Nearest Designated Safe Shelters
              </h2>
              <span className="text-xs text-slate-400 font-mono">Location: Chamoli District</span>
            </div>

            <div className="space-y-3">
              {shelters.slice(0, 3).map((shelter, idx) => (
                <div 
                  key={shelter.id}
                  className="p-4 rounded-xl bg-[#0b1122] border border-white/10 space-y-2 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                        Safe Haven #{idx + 1}
                      </span>
                      <h3 className="font-semibold text-sm text-white mt-0.5">{shelter.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{shelter.locationName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                      {shelter.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/5 font-mono">
                    <span>Available Capacity: {shelter.availableCapacity} beds</span>
                    <span className="text-sky-400">Rations: {shelter.foodSupplyDays} days</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Evacuation Route Advice */}
            <div className="p-4 rounded-xl bg-[#0b1122] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Navigation className="w-4 h-4 text-sky-400" />
                Recommended Citizen Evacuation Path
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take the <strong className="text-emerald-400">High-Ground Ridge Bypass Road</strong> towards Chamoli Sports Stadium or Alaknanda High School. Avoid the lower riverside market road and NH-58 embankment.
              </p>
            </div>
          </div>

          {/* Right Column: SOS Assistance Form & Emergency Helplines */}
          <div className="space-y-4">
            <h2 className="font-semibold text-base text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-red-400" />
              Request Urgent Emergency Rescue / Supplies
            </h2>

            {sosSent ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-base text-white">SOS Distress Signal Received!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your GPS location and family count have been logged into the tactical EOC queue. SDRF Rescue Unit 02 has been notified. Stay on high ground.
                </p>
                <button
                  onClick={() => setSosSent(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Send Another Update
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendSos} className="p-5 rounded-xl bg-[#0b1122] border border-white/10 space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Your Name / Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ramesh Chand"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Current Location</label>
                    <input
                      type="text"
                      required
                      value={citizenLocation}
                      onChange={(e) => setCitizenLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Number of People Stranded</label>
                    <input
                      type="number"
                      min="1"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0e162b] border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="med"
                    checked={medicalUrgency}
                    onChange={(e) => setMedicalUrgency(e.target.checked)}
                    className="rounded border-slate-700 text-red-500 focus:ring-0"
                  />
                  <label htmlFor="med" className="text-xs text-slate-300 cursor-pointer">
                    Immediate medical care / infant food needed
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-lg active:scale-95"
                >
                  Transmit Instant SOS to Emergency Operations Center
                </button>
              </form>
            )}

            {/* Direct Emergency Hotlines */}
            <div className="p-4 rounded-xl bg-[#0b1122] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Phone className="w-4 h-4 text-sky-400" />
                Toll-Free Emergency Dispatch Hotlines
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#0e162b] border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400">Police / Fire / EMS</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">112</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e162b] border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400">State Disaster (SDMA)</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">1070</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e162b] border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400">District EOC Chamoli</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">1077</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0e162b] border border-white/5">
                  <div className="text-[10px] font-mono text-slate-400">NDRF Control Room</div>
                  <div className="text-base font-bold text-sky-400 font-mono mt-0.5">1078</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
