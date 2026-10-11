import React, { useEffect, useRef } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import {
  RotateCcw,
  StepForward,
  StepBack,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SimulationBar: React.FC = () => {
  const {
    simulation,
    setSimulationInput,
    stepForward,
    stepBackward,
    resetSimulation,
    setIsPlaying,
    setPlaybackSpeed,
  } = useAutomatonStore();

  const { input, status, currentStepIndex, trace, isPlaying, playbackSpeed } =
    simulation;

  // Auto-play interval timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const currentStore = useAutomatonStore.getState();
        const { currentStepIndex: idx, trace: tr } = currentStore.simulation;

        if (tr && idx < tr.steps.length) {
          currentStore.stepForward();
        } else {
          currentStore.setIsPlaying(false);
        }
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Trigger celebration confetti when string is accepted
  const hasCelebratedRef = useRef(false);
  useEffect(() => {
    if (status === 'ACCEPTED' && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } else if (status !== 'ACCEPTED') {
      hasCelebratedRef.current = false;
    }
  }, [status]);

  const totalSteps = trace ? trace.steps.length : input.length;

  return (
    <div
      className="fixed bottom-84 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl select-none"
      role="region"
      aria-label="Simulation Controls"
    >
      {/* Input string field */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="simulation-input"
          className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
        >
          Tape:
        </label>
        <input
          id="simulation-input"
          type="text"
          value={input}
          onChange={(e) => setSimulationInput(e.target.value)}
          placeholder="e.g. 101"
          className="w-32 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 text-center tracking-widest focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Visual string tape */}
      <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 max-w-xs overflow-x-auto">
        {input.length === 0 ? (
          <span className="text-xs text-slate-500 font-mono italic px-1">
            ε (empty)
          </span>
        ) : (
          input.split('').map((char, index) => {
            const isProcessed = index < currentStepIndex;
            const isCurrent = index === currentStepIndex - 1;

            return (
              <span
                key={index}
                className={`
                  w-6 h-6 flex items-center justify-center font-mono text-xs rounded transition-all shrink-0
                  ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold scale-110 shadow-sm'
                      : isProcessed
                        ? 'text-slate-600 line-through'
                        : 'text-slate-300 bg-slate-900/80'
                  }
                `}
              >
                {char}
              </span>
            );
          })
        )}
      </div>

      {/* Step navigation & auto-run controller */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={stepBackward}
          disabled={currentStepIndex <= 0 || isPlaying}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 rounded-md transition-colors"
          title="Step backward"
          aria-label="Step backward"
        >
          <StepBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={stepForward}
          disabled={
            (trace && currentStepIndex >= totalSteps) ||
            isPlaying ||
            status === 'INVALID_INPUT'
          }
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-md transition-colors"
          title="Step forward"
          aria-label="Step forward"
        >
          <StepForward className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={
            (trace && currentStepIndex >= totalSteps && !isPlaying) ||
            status === 'INVALID_INPUT'
          }
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 rounded-md transition-colors"
          title={isPlaying ? 'Pause simulation' : 'Auto play'}
          aria-label={isPlaying ? 'Pause simulation' : 'Auto play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-cyan-400" />
          ) : (
            <Play className="w-4 h-4 text-emerald-400 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={resetSimulation}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
          title="Reset simulation"
          aria-label="Reset simulation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Speed control selector */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 outline-none cursor-pointer"
          aria-label="Playback speed"
        >
          <option value={1500}>0.5x</option>
          <option value={1000}>1x</option>
          <option value={500}>2x</option>
        </select>
      </div>

      {/* Decision status indicator banner */}
      {status === 'ACCEPTED' && (
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>ACCEPTED</span>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>REJECTED</span>
        </div>
      )}

      {status === 'INVALID_INPUT' && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Symbol not in Σ</span>
        </div>
      )}
    </div>
  );
};
