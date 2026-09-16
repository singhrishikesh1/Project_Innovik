import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface SimulationBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription: string;
  onStepChange: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  onStepChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(3000); // 3 seconds per step

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(async () => {
        if (currentStep < totalSteps) {
          await api.nextSimulationStep();
          onStepChange();
        } else {
          setIsPlaying(false);
        }
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, playSpeed, onStepChange]);

  const handleNext = async () => {
    await api.nextSimulationStep();
    onStepChange();
  };

  const handlePrev = async () => {
    await api.prevSimulationStep();
    onStepChange();
  };

  const handleReset = async () => {
    setIsPlaying(false);
    await api.resetSimulation();
    onStepChange();
  };

  const handleJump = async (step: number) => {
    await api.setSimulationStep(step);
    onStepChange();
  };

  return (
    <div className="bg-eoc-darker/95 border-b border-eoc-border px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Step Info */}
      <div className="flex items-center gap-3 min-w-[280px]">
        <div className="flex items-center gap-1.5 bg-sky-950/80 text-sky-400 border border-sky-800/60 px-2.5 py-1 rounded font-mono font-bold">
          <span>STEP</span>
          <span className="text-sky-200">{currentStep}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{totalSteps}</span>
        </div>

        <div>
          <div className="font-bold text-slate-100 flex items-center gap-2">
            <span>{stepTitle}</span>
            {currentStep === 20 && (
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
          <div className="text-slate-400 line-clamp-1 max-w-xl text-[11px]">{stepDescription}</div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={currentStep <= 1}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold shadow transition-colors ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          }`}
          title={isPlaying ? 'Pause Simulation' : 'Play Scenario'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Run Disaster Simulation'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep >= totalSteps}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          title="Reset to Step 1"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>Speed:</span>
          {[
            { label: '1x', ms: 4000 },
            { label: '2x', ms: 2500 },
            { label: '3x', ms: 1200 }
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setPlaySpeed(s.ms)}
              className={`px-1.5 py-0.5 rounded ${
                playSpeed === s.ms ? 'bg-sky-500/20 text-sky-300 font-bold' : 'hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Jump selector */}
        <select
          value={currentStep}
          onChange={e => handleJump(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-sky-500 cursor-pointer"
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <option key={s} value={s}>
              Jump to Step {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
