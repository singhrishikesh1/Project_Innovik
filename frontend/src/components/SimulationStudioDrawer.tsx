import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, X, FastForward, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../services/api';

interface SimulationStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  stepDescription?: string;
  onStepChange: () => void;
  onNavigateToReport?: () => void;
}

export const SimulationStudioDrawer: React.FC<SimulationStudioDrawerProps> = ({
  isOpen,
  onClose,
  currentStep,
  totalSteps,
  stepTitle = "Simulation Step",
  stepDescription = "",
  onStepChange,
  onNavigateToReport
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Auto-play interval
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const intervalMs = 4000 / speed;
      timer = setInterval(async () => {
        if (currentStep < totalSteps) {
          try {
            await api.nextSimulationStep();
            onStepChange();
          } catch (e) {
            console.error('Error advancing simulation:', e);
          }
        } else {
          setIsPlaying(false);
        }
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, speed, onStepChange]);

  if (!isOpen) return null;

  const handleJump = async (stepNum: number) => {
    setLoading(true);
    try {
      await api.setSimulationStep(stepNum);
      onStepChange();
    } catch (e) {
      console.error('Error jumping step:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep >= totalSteps) return;
    setLoading(true);
    try {
      await api.nextSimulationStep();
      onStepChange();
    } catch (e) {
      console.error('Error next step:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = async () => {
    if (currentStep <= 1) return;
    setLoading(true);
    try {
      await api.prevSimulationStep();
      onStepChange();
    } catch (e) {
      console.error('Error prev step:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setIsPlaying(false);
    setLoading(true);
    try {
      await api.resetSimulation();
      onStepChange();
    } catch (e) {
      console.error('Error resetting simulation:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#090e1c] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <h2 className="font-bold text-white text-base">Simulation Studio</h2>
              <span className="text-xs font-mono text-slate-400">Step {currentStep} / {totalSteps}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Step Banner */}
          <div className="p-4 rounded-xl bg-[#0e162b] border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase">
                Active Scenario Phase
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/20">
                {currentStep === 20 ? 'POST-DISASTER READY' : currentStep >= 13 ? 'REROUTING ACTIVE' : 'RESPONSE ACTIVE'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">{stepTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{stepDescription}</p>
          </div>

          {/* Playback Controls */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Playback Controls</div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep <= 1 || loading}
                className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
                Prev
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play Scenario'}
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep >= totalSteps || loading}
                className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                Next
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                title="Reset simulation to Step 1"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Playback Speed:</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      speed === s ? 'bg-white/20 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Jump Milestones */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Key Demo Milestones</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleJump(1)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs text-slate-300 transition-colors"
              >
                <div className="font-semibold text-white">Step 1: Baseline</div>
                <div className="text-[10px] text-slate-400 font-mono">Pre-disaster telemetry</div>
              </button>
              <button
                onClick={() => handleJump(4)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs text-slate-300 transition-colors"
              >
                <div className="font-semibold text-emerald-400">Step 4: Skeptic Agent</div>
                <div className="text-[10px] text-slate-400 font-mono">Telemetry audit pass</div>
              </button>
              <button
                onClick={() => handleJump(13)}
                className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-left text-xs text-slate-300 transition-colors"
              >
                <div className="font-semibold text-red-400">Step 13: Landslide</div>
                <div className="text-[10px] text-slate-400 font-mono">NH-58 dynamic reroute</div>
              </button>
              <button
                onClick={() => handleJump(20)}
                className="p-2 rounded-lg bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-left text-xs text-slate-300 transition-colors"
              >
                <div className="font-semibold text-sky-400">Step 20: PDF Report</div>
                <div className="text-[10px] text-slate-400 font-mono">1-Click PDF Ready</div>
              </button>
            </div>
          </div>

          {/* 20 Step Number Matrix */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">All 20 Steps</div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(stepNum => (
                <button
                  key={stepNum}
                  onClick={() => handleJump(stepNum)}
                  className={`py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                    currentStep === stepNum
                      ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-300'
                      : stepNum === 13
                      ? 'bg-red-950 text-red-400 border border-red-500/30 hover:bg-red-900/60'
                      : stepNum === 20
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {stepNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {currentStep === 20 && onNavigateToReport && (
            <button
              onClick={() => {
                onClose();
                onNavigateToReport();
              }}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Open Official 20-Section PDF Report
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
