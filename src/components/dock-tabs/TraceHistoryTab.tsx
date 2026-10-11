import React from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { getAcceptStates } from '@/core/dfa';
import { Badge } from '@/components/common/Badge';

export const TraceHistoryTab: React.FC = () => {
  const { simulation, dfa } = useAutomatonStore();
  const { trace, currentStepIndex, status } = simulation;
  const acceptStates = getAcceptStates(dfa);

  if (!trace || !simulation.input) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
        <p>No trace history available.</p>
        <p className="text-[11px] mt-1 text-slate-600">
          Enter an input string in the Simulation Bar and step through the DFA to populate trace rows.
        </p>
      </div>
    );
  }

  const steps = trace.steps || [];

  return (
    <div className="flex flex-col gap-3 text-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Execution Trace
          </span>
          <span className="text-xs font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            String: &quot;{simulation.input || 'ε'}&quot;
          </span>
        </div>

        {status === 'ACCEPTED' && (
          <Badge variant="accepted">ACCEPTED (Final: {trace.finalState})</Badge>
        )}
        {status === 'REJECTED' && (
          <Badge variant="rejected">REJECTED (Final: {trace.finalState})</Badge>
        )}
        {status === 'INVALID_INPUT' && (
          <Badge variant="rejected">ERROR: {trace.error}</Badge>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-16">
                Step
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-28">
                Current State
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-28">
                Symbol Read
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-28">
                Next State
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">
                Status / Note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {/* Initial step (step 0 before reading any character) */}
            <tr
              className={`transition-colors ${
                currentStepIndex === 0
                  ? 'bg-cyan-950/40 text-cyan-200 font-semibold'
                  : 'hover:bg-slate-900/40'
              }`}
            >
              <td className="py-2 px-3 text-slate-400">0</td>
              <td className="py-2 px-3 text-cyan-300">{dfa.start}</td>
              <td className="py-2 px-3 text-slate-500 italic">(initial)</td>
              <td className="py-2 px-3 text-cyan-300">{dfa.start}</td>
              <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                Engine initialized at start state {dfa.start}
              </td>
            </tr>

            {/* Individual step entries */}
            {steps.map((s, idx) => {
              const isCurrent = currentStepIndex === idx + 1;
              const isFinal = idx === steps.length - 1;

              return (
                <tr
                  key={s.step}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-cyan-950/40 text-cyan-200 font-semibold'
                      : 'hover:bg-slate-900/40'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-400">{s.step}</td>
                  <td className="py-2 px-3 text-slate-200">{s.from}</td>
                  <td className="py-2 px-3 text-cyan-400 font-bold">
                    &apos;{s.symbol}&apos;
                  </td>
                  <td className="py-2 px-3 text-slate-200">{s.to}</td>
                  <td className="py-2 px-3 font-sans text-[11px]">
                    {isFinal ? (
                      acceptStates.includes(s.to) ? (
                        <span className="text-emerald-400 font-semibold">
                          Final state reached in F (Accept)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">
                          Final state reached not in F (Reject)
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">
                        Transitioned via δ({s.from}, {s.symbol}) = {s.to}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
