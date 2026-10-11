import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { run, formatTrace, tokenizeInput } from '@/core/dfa';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TestCaseItem {
  id: string;
  input: string;
  expected: boolean;
  actual?: boolean;
  passed?: boolean;
  error?: string;
  trace?: string;
}

export const TestRunnerTab: React.FC = () => {
  const {
    dfa,
    simulation,
    stepForward,
    stepBackward,
    resetSimulation,
    setIsPlaying,
    setPlaybackSpeed,
    setSimulationInput,
  } = useAutomatonStore();

  const { status, currentStepIndex, trace, isPlaying, playbackSpeed } = simulation;

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { id: '1', input: '101', expected: true },
    { id: '2', input: '110', expected: false },
    { id: '3', input: 'ε', expected: false },
    { id: '4', input: '1', expected: true },
    { id: '5', input: '0', expected: false },
  ]);

  const [hasRun, setHasRun] = useState<boolean>(false);

  // Active test case entity
  const activeCase = useMemo(
    () => testCases.find((tc) => tc.id === activeCaseId) || null,
    [testCases, activeCaseId],
  );

  // Tape tokens for active test case simulation
  const tapeTokens = useMemo(() => {
    if (!activeCase) return [];
    const normalized = activeCase.input === 'ε' ? '' : activeCase.input;
    return tokenizeInput(normalized, dfa.alphabet).tokens;
  }, [activeCase, dfa.alphabet]);

  const totalSteps = trace ? trace.steps.length : tapeTokens.length;

  // Auto-play interval timer for canvas animation
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const currentStore = useAutomatonStore.getState();
        const { currentStepIndex: idx, trace: tr } = currentStore.simulation;

        if (tr && !tr.error && idx < tr.steps.length) {
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
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Celebration confetti when active simulated string is accepted
  const hasCelebratedRef = useRef(false);
  useEffect(() => {
    if (activeCaseId && status === 'ACCEPTED' && !hasCelebratedRef.current) {
      hasCelebratedRef.current = true;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } else if (status !== 'ACCEPTED') {
      hasCelebratedRef.current = false;
    }
  }, [status, activeCaseId]);

  // Check if epsilon is tested in the test suite
  const includesEpsilon = useMemo(() => {
    return testCases.some(
      (tc) => tc.input === 'ε' || tc.input.trim() === '' || tc.input === "''",
    );
  }, [testCases]);

  const handleStartSimulation = (tc: TestCaseItem) => {
    setActiveCaseId(tc.id);
    const normalizedInput = tc.input === 'ε' ? '' : tc.input;
    setSimulationInput(normalizedInput);
    setIsPlaying(true);
  };

  const handleStopSimulation = () => {
    setIsPlaying(false);
    resetSimulation();
    setActiveCaseId(null);
  };

  const handleAddCase = (inputVal: string = '', expectedVal: boolean = true) => {
    const nextId = String(Date.now() + Math.random());
    setTestCases((prev) => [
      ...prev,
      {
        id: nextId,
        input: inputVal,
        expected: expectedVal,
      },
    ]);
    setHasRun(false);
  };

  const handleUpdateInput = (id: string, newInput: string) => {
    if (id === activeCaseId) {
      handleStopSimulation();
    }
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, input: newInput } : tc)),
    );
    setHasRun(false);
  };

  const handleUpdateExpected = (id: string, newExpected: boolean) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, expected: newExpected } : tc)),
    );
    setHasRun(false);
  };

  const handleDeleteCase = (id: string) => {
    if (id === activeCaseId) {
      handleStopSimulation();
    }
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    setHasRun(false);
  };

  const handleResetCases = () => {
    handleStopSimulation();
    setTestCases([
      { id: '1', input: '101', expected: true },
      { id: '2', input: '110', expected: false },
      { id: '3', input: 'ε', expected: false },
    ]);
    setHasRun(false);
  };

  const handleRunAllTests = () => {
    const updated = testCases.map((tc) => {
      const normalizedInput = tc.input === 'ε' ? '' : tc.input;
      const res = run(dfa, normalizedInput);

      if (res.error) {
        return {
          ...tc,
          actual: false,
          passed: false,
          error: res.error,
          trace: formatTrace(res),
        };
      }

      const passed = res.accepted === tc.expected;
      return {
        ...tc,
        actual: res.accepted,
        passed,
        error: undefined,
        trace: formatTrace(res),
      };
    });

    setTestCases(updated);
    setHasRun(true);
  };

  const summary = useMemo(() => {
    if (!hasRun || testCases.length === 0) return null;
    const passedCount = testCases.filter((tc) => tc.passed).length;
    return {
      passed: passedCount,
      total: testCases.length,
      allPassed: passedCount === testCases.length,
    };
  }, [hasRun, testCases]);

  const activeIndex = activeCase
    ? testCases.findIndex((tc) => tc.id === activeCase.id) + 1
    : 0;

  return (
    <div className="flex flex-col gap-3 text-slate-200">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAddCase('', true)}
            icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Add Row
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAddCase('ε', false)}
            icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
            title="Add empty string test case"
          >
            Add ε (Empty String)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetCases}
            icon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
            title="Reset test table cases"
          >
            Reset Cases
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {summary && (
            <Badge variant={summary.allPassed ? 'accepted' : 'rejected'}>
              {summary.passed} of {summary.total} tests passed
            </Badge>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAllTests}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="font-semibold"
          >
            Run All Tests ({testCases.length})
          </Button>
        </div>
      </div>

      {/* Compact Interactive Player Bar for Canvas Simulation */}
      {activeCase && (
        <div
          role="region"
          aria-label="Simulation Player Bar"
          className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-cyan-800/80 rounded-lg p-2.5 shadow-xl"
        >
          {/* Active string label and token tape */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Row #{activeIndex}:
              </span>
              <span className="font-mono text-xs font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                &quot;{activeCase.input || 'ε'}&quot;
              </span>
            </div>

            {/* Visual Token Tape */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-xs overflow-x-auto">
              {tapeTokens.length === 0 ? (
                <span className="text-xs text-slate-400 font-mono italic px-1">
                  ε (empty string)
                </span>
              ) : (
                tapeTokens.map((token, index) => {
                  const isProcessed = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex - 1;
                  const isInvalid = !dfa.alphabet.includes(token);

                  return (
                    <span
                      key={index}
                      className={`min-w-6 h-6 px-1.5 flex items-center justify-center font-mono text-xs rounded transition-all shrink-0 ${
                        isInvalid
                          ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
                          : isCurrent
                            ? 'bg-cyan-500 text-slate-950 font-bold scale-105 shadow-sm'
                            : isProcessed
                              ? 'text-slate-600 line-through'
                              : 'text-slate-300 bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {token}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={resetSimulation}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Reset simulation to initial state"
              aria-label="Reset simulation"
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={currentStepIndex <= 0}
              onClick={stepBackward}
              icon={<StepBack className="w-3.5 h-3.5" />}
              title="Step backward"
              aria-label="Step backward"
            />
            <Button
              size="sm"
              variant={isPlaying ? 'secondary' : 'primary'}
              onClick={() => {
                if (currentStepIndex >= totalSteps && !isPlaying) {
                  resetSimulation();
                }
                setIsPlaying(!isPlaying);
              }}
              icon={
                isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )
              }
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
              aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={currentStepIndex >= totalSteps}
              onClick={stepForward}
              icon={<StepForward className="w-3.5 h-3.5" />}
              title="Step forward"
              aria-label="Step forward"
            />

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 ml-1.5 border-l border-slate-800 pl-2">
              {[
                { label: '0.5x', speed: 1000 },
                { label: '1x', speed: 500 },
                { label: '2x', speed: 250 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setPlaybackSpeed(sp.speed)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playbackSpeed === sp.speed
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Speed ${sp.label}`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status badge and dismiss button */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Step {currentStepIndex}/{totalSteps}
            </span>
            {status === 'ACCEPTED' && <Badge variant="accepted">ACCEPTED</Badge>}
            {status === 'REJECTED' && <Badge variant="rejected">REJECTED</Badge>}
            {status === 'INVALID_INPUT' && (
              <Badge variant="rejected">INVALID</Badge>
            )}
            {status === 'RUNNING' && <Badge variant="active">RUNNING</Badge>}
            {status === 'IDLE' && <Badge variant="neutral">READY</Badge>}

            <button
              type="button"
              onClick={handleStopSimulation}
              className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors ml-1"
              title="Stop simulation player"
              aria-label="Stop simulation player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Epsilon warning prompt */}
      {!includesEpsilon && (
        <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/80 p-2.5 rounded-lg text-amber-300 text-xs select-none">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Empty string (ε) not tested</p>
            <p className="text-[11px] text-amber-200/80">
              Theoretical DFA requirements expect testing the empty string ε to verify initial state behavior.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Unified Test Cases Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-12 text-center">
                No.
              </th>
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider min-w-[180px]">
                Input String
              </th>
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider w-36">
                Expectation
              </th>
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider w-28 text-center">
                Actual
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24 text-center">
                Status
              </th>
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider min-w-[160px]">
                Trace
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24 text-right">
                Player / Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {testCases.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-slate-500 font-sans"
                >
                  No test cases in the table. Click &quot;Add Row&quot; to create a new test.
                </td>
              </tr>
            ) : (
              testCases.map((tc, index) => {
                const isCurrentActive = activeCaseId === tc.id;

                return (
                  <tr
                    key={tc.id}
                    className={`transition-colors ${
                      isCurrentActive
                        ? 'bg-cyan-950/25 border-l-2 border-l-cyan-400'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Row number */}
                    <td className="py-2.5 px-3 text-center text-slate-500 font-semibold select-none">
                      {index + 1}
                    </td>

                    {/* String input field */}
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) => handleUpdateInput(tc.id, e.target.value)}
                          placeholder="e.g. 101 or ε"
                          aria-label={`Input string for row ${index + 1}`}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateInput(tc.id, 'ε')}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 border border-slate-700 text-[11px]"
                          title="Set to empty string (ε)"
                        >
                          ε
                        </button>
                      </div>
                    </td>

                    {/* Expectation dropdown/toggle */}
                    <td className="py-2 px-4">
                      <select
                        value={tc.expected ? 'true' : 'false'}
                        onChange={(e) =>
                          handleUpdateExpected(tc.id, e.target.value === 'true')
                        }
                        aria-label={`Expectation for row ${index + 1}`}
                        className={`
                          w-full py-1 px-2 rounded font-mono text-xs font-semibold cursor-pointer outline-none border
                          ${
                            tc.expected
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70 focus:border-emerald-500'
                              : 'bg-rose-950/80 text-rose-300 border-rose-700/70 focus:border-rose-500'
                          }
                        `}
                      >
                        <option value="true">Accept (True)</option>
                        <option value="false">Reject (False)</option>
                      </select>
                    </td>

                    {/* Actual execution result */}
                    <td className="py-2 px-4 text-center">
                      {!hasRun || tc.actual === undefined ? (
                        <span className="text-slate-600">-</span>
                      ) : tc.error ? (
                        <span className="text-amber-400 font-semibold text-[11px]">
                          Error
                        </span>
                      ) : tc.actual ? (
                        <span className="text-emerald-400 font-semibold">
                          Accept
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">
                          Reject
                        </span>
                      )}
                    </td>

                    {/* Pass / Fail status badge */}
                    <td className="py-2 px-3 text-center">
                      {!hasRun || tc.passed === undefined ? (
                        <span className="text-slate-600 text-[11px]">Pending</span>
                      ) : tc.passed ? (
                        <Badge variant="accepted">PASS</Badge>
                      ) : (
                        <Badge variant="rejected">FAIL</Badge>
                      )}
                    </td>

                    {/* Trace details snippet */}
                    <td
                      className="py-2 px-4 font-sans text-xs text-slate-400 max-w-[220px] truncate"
                      title={tc.trace || ''}
                    >
                      {tc.error ? (
                        <span className="text-amber-400/90 text-[11px] truncate block">
                          {tc.error}
                        </span>
                      ) : tc.trace ? (
                        <span className="truncate block font-mono text-[11px] text-slate-300">
                          {tc.trace}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Action buttons: Play/Simulate on Canvas and Delete */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentActive) {
                              setIsPlaying(!isPlaying);
                            } else {
                              handleStartSimulation(tc);
                            }
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            isCurrentActive
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.45)]'
                              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                          }`}
                          title={
                            isCurrentActive
                              ? isPlaying
                                ? 'Pause simulation'
                                : 'Resume simulation'
                              : 'Simulate on Canvas'
                          }
                          aria-label={`Simulate row ${index + 1}`}
                        >
                          {isCurrentActive && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCase(tc.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                          title="Delete test row"
                          aria-label={`Delete row ${index + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
