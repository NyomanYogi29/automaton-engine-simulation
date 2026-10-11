import React, { useState } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { getStartState, getAcceptStates } from '@/core/dfa';
import { Button } from '@/components/common/Button';
import { AlertCircle, Wand2, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

export const TransitionTableTab: React.FC = () => {
  const {
    dfa,
    validationIssues,
    setTransition,
    addState,
    removeState,
    renameState,
    addSymbol,
    removeSymbol,
    setStartState,
    toggleAcceptState,
    fillEmptyTransitionsWithDeadState,
  } = useAutomatonStore();

  const [editingState, setEditingState] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>('');

  const startState = getStartState(dfa);
  const acceptStates = getAcceptStates(dfa);


  const missingTransitions = validationIssues.filter(
    (issue) => issue.type === 'MISSING_TRANSITION',
  );

  const isMissing = (state: string, symbol: string) => {
    return !dfa.transitions[state] || !dfa.transitions[state][symbol];
  };

  const handleCellChange = (
    fromState: string,
    symbol: string,
    targetState: string,
  ) => {
    setTransition(fromState, symbol, targetState);
  };

  const handleSaveRename = (oldName: string) => {
    const cleanNew = editNameValue.trim();
    if (cleanNew && cleanNew !== oldName) {
      if (dfa.states.includes(cleanNew)) {
        window.alert(`State "${cleanNew}" already exists.`);
        return;
      }
      renameState(oldName, cleanNew);
    }
    setEditingState(null);
  };

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      {/* Top action bar: add state/symbol and dead-state fill helper */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const customName = window.prompt(
                'Enter state name (leave empty for auto q0, q1...):',
              );
              if (customName === null) return;
              addState(customName.trim() || undefined);
            }}
            icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Add State
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const sym = window.prompt('Enter new symbol (e.g. 0, 1, a, b):');
              if (sym?.trim()) addSymbol(sym.trim());
            }}
            icon={<Plus className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Add Symbol
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {missingTransitions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/60">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {missingTransitions.length} missing transition
                {missingTransitions.length > 1 ? 's' : ''} detected
              </span>
            </div>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={fillEmptyTransitionsWithDeadState}
            icon={<Wand2 className="w-3.5 h-3.5" />}
            title="Automatically create qDead and redirect all empty cells to it"
          >
            Direct empty cells to dead state
          </Button>
        </div>
      </div>

      {/* Transition matrix table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">
                Start (→)
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">
                Accept (*)
              </th>
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider min-w-[120px]">
                State (Q)
              </th>
              {dfa.alphabet.map((sym) => (
                <th
                  key={sym}
                  className="py-2.5 px-4 font-semibold uppercase tracking-wider min-w-[140px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-cyan-300">δ(_, {sym})</span>
                    {dfa.alphabet.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSymbol(sym)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                        title={`Remove symbol ${sym}`}
                        aria-label={`Remove symbol ${sym}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-16 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {dfa.states.map((state) => {
              const isStart = startState === state;
              const isAccept = acceptStates.includes(state);

              return (
                <tr
                  key={state}
                  className="hover:bg-slate-900/40 transition-colors"
                >
                  {/* Start state radio */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="radio"
                      name="dfa-start-state"
                      checked={isStart}
                      onChange={() => setStartState(state)}
                      title={`Set ${state} as start state`}
                      className="accent-cyan-500 cursor-pointer w-4 h-4"
                      aria-label={`Set ${state} as start state`}
                    />
                  </td>

                  {/* Accept state checkbox */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAccept}
                      onChange={() => toggleAcceptState(state)}
                      title={`Toggle ${state} accept state`}
                      className="accent-emerald-500 cursor-pointer w-4 h-4 rounded"
                      aria-label={`Toggle ${state} accept state`}
                    />
                  </td>

                  {/* State identifier label with inline rename */}
                  <td className="py-2 px-4 font-mono font-semibold text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {isStart && (
                        <span
                          className="text-cyan-400 font-bold"
                          title="Start State"
                        >
                          →
                        </span>
                      )}
                      {isAccept && (
                        <span
                          className="text-emerald-400 font-bold"
                          title="Accept State"
                        >
                          *
                        </span>
                      )}
                      {editingState === state ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(state);
                              if (e.key === 'Escape') setEditingState(null);
                            }}
                            autoFocus
                            className="w-20 bg-slate-900 border border-cyan-500 rounded px-1.5 py-0.5 text-xs font-mono text-cyan-200 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(state)}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5"
                            title="Save rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingState(null)}
                            className="text-slate-400 hover:text-rose-400 p-0.5"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group/state">
                          <span
                            onDoubleClick={() => {
                              setEditingState(state);
                              setEditNameValue(state);
                            }}
                            title="Double-click to rename"
                            className="cursor-pointer hover:text-cyan-300"
                          >
                            {state}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingState(state);
                              setEditNameValue(state);
                            }}
                            className="opacity-0 group-hover/state:opacity-100 text-slate-400 hover:text-cyan-300 p-0.5 transition-opacity"
                            title={`Rename state ${state}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>


                  {/* Delta transition destination dropdown for each alphabet symbol */}
                  {dfa.alphabet.map((sym) => {
                    const currentTarget = dfa.transitions[state]?.[sym] || '';
                    const missing = isMissing(state, sym);

                    return (
                      <td key={sym} className="py-2 px-3">
                        <div className="relative">
                          <select
                            value={currentTarget}
                            onChange={(e) =>
                              handleCellChange(state, sym, e.target.value)
                            }
                            aria-label={`Transition from ${state} with symbol ${sym}`}
                            className={`
                              w-full py-1.5 px-2.5 rounded font-mono text-xs transition-colors cursor-pointer outline-none
                              ${
                                missing
                                  ? 'bg-rose-950/70 border border-rose-500 text-rose-200 focus:ring-1 focus:ring-rose-400'
                                  : 'bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                              }
                            `}
                          >
                            <option value="">(empty)</option>
                            {dfa.states.map((destState) => (
                              <option key={destState} value={destState}>
                                {destState}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    );
                  })}

                  {/* Delete state action */}
                  <td className="py-2 px-3 text-right">
                    {dfa.states.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeState(state)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title={`Delete state ${state}`}
                        aria-label={`Delete state ${state}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
