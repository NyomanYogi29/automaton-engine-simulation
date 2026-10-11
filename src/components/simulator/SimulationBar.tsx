import React, { useEffect, useRef, useMemo } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { formatTrace, getStartState, getAcceptStates } from '@/core/dfa';
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
    dfa,
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

  const startState = getStartState(dfa);
  const acceptStates = getAcceptStates(dfa);
  const isMissingStart = !startState;
  const isMissingAccept = acceptStates.length === 0;
  const isDFAIncomplete = isMissingStart || isMissingAccept;

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

  const traceSummary = useMemo(() => {
    if (!trace || (status !== 'ACCEPTED' && status !== 'REJECTED')) {
      return null;
    }
    return formatTrace(trace);
  }, [trace, status]);

  return (
    <div className="fixed bottom-84 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-4xl select-none">
      {/* Simulation controller bar */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl"
        role="region"
        aria-label="Simulation Controls"
      >
        {/* Input string field */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="simulation-input"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Pita:
          </label>
          <input
            id="simulation-input"
            type="text"
            value={input}
            onChange={(e) => setSimulationInput(e.target.value)}
            placeholder="e.g. 101"
            className="w-28 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 text-center tracking-widest focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Visual string tape */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-xs overflow-x-auto">
          {input.length === 0 ? (
            <span className="text-xs text-slate-400 font-mono italic px-1">
              ε (kosong)
            </span>
          ) : (
            input.split('').map((char, index) => {
              const isProcessed = index < currentStepIndex;
              const isCurrent = index === currentStepIndex - 1;
              const isInvalid = !dfa.alphabet.includes(char);

              return (
                <span
                  key={index}
                  className={`
                    w-6 h-6 flex items-center justify-center font-mono text-xs rounded transition-all shrink-0
                    ${
                      isInvalid
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
                        : isCurrent
                          ? 'bg-cyan-500 text-slate-950 font-bold scale-110 shadow-sm'
                          : isProcessed
                            ? 'text-slate-600 line-through'
                            : 'text-slate-200 bg-slate-900/80 border border-slate-800'
                    }
                  `}
                  title={isInvalid ? `Simbol '${char}' tidak terdaftar di Σ` : undefined}
                >
                  {char}
                </span>
              );
            })
          )}
        </div>

        {/* Step navigation and auto-run controller */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0 || isPlaying}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-md transition-colors"
            title="Langkah sebelumnya"
            aria-label="Langkah sebelumnya"
          >
            <StepBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={stepForward}
            disabled={
              (trace && currentStepIndex >= totalSteps) ||
              isPlaying ||
              status === 'INVALID_INPUT' ||
              isDFAIncomplete
            }
            className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-semibold rounded-md transition-colors"
            title={
              isDFAIncomplete
                ? 'State awal atau state akhir belum ditentukan'
                : 'Langkah berikutnya'
            }
            aria-label="Langkah berikutnya"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={
              (trace && currentStepIndex >= totalSteps && !isPlaying) ||
              status === 'INVALID_INPUT' ||
              isDFAIncomplete
            }
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-md transition-colors"
            title={
              isDFAIncomplete
                ? 'State awal atau akhir belum lengkap'
                : isPlaying
                  ? 'Jeda simulasi'
                  : 'Jalankan otomatis'
            }
            aria-label={isPlaying ? 'Jeda simulasi' : 'Jalankan otomatis'}
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
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
            title="Reset simulasi"
            aria-label="Reset simulasi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed control selector */}
        <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 outline-none cursor-pointer"
            aria-label="Kecepatan pemutaran"
          >
            <option value={1500}>0.5x</option>
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
          </select>
        </div>

        {/* Status indicators */}
        {isDFAIncomplete ? (
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/80">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {isMissingStart
                ? 'Tentukan state awal (→)'
                : 'Tentukan minimal 1 state akhir (*)'}
            </span>
          </div>
        ) : status === 'ACCEPTED' ? (
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>DITERIMA</span>
          </div>
        ) : status === 'REJECTED' ? (
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>DITOLAK</span>
          </div>
        ) : status === 'INVALID_INPUT' ? (
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Simbol di luar Σ</span>
          </div>
        ) : null}
      </div>

      {/* Trace result banner at final decision */}
      {traceSummary && (
        <div className="w-full flex items-center justify-center px-4 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono text-cyan-300 shadow-lg text-center">
          <span>{traceSummary}</span>
        </div>
      )}
    </div>
  );
};

