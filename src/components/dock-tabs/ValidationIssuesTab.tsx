import React from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { Button } from '@/components/common/Button';
import { AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';

export const ValidationIssuesTab: React.FC = () => {
  const { validationIssues, fillEmptyTransitionsWithDeadState } =
    useAutomatonStore();

  const missingCount = validationIssues.filter(
    (i) => i.type === 'MISSING_TRANSITION',
  ).length;

  if (validationIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-emerald-400 text-xs">
        <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="font-semibold text-sm">DFA is valid and complete</p>
        <p className="text-[11px] mt-1 text-slate-400 max-w-sm">
          All states have exactly one defined transition for every symbol in the alphabet, with valid start and accept configurations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-rose-950/30 p-3 rounded-lg border border-rose-900/60">
        <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            {validationIssues.length} issue
            {validationIssues.length > 1 ? 's' : ''} require attention before the DFA is considered fully deterministic.
          </span>
        </div>

        {missingCount > 0 && (
          <Button
            size="sm"
            variant="primary"
            onClick={fillEmptyTransitionsWithDeadState}
            icon={<Wand2 className="w-3.5 h-3.5" />}
          >
            Direct empty cells to dead state
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-16 text-center">
                #
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-48">
                Issue Type
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">
                Description & Recommendation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {validationIssues.map((issue, index) => (
              <tr
                key={index}
                className="hover:bg-slate-900/40 transition-colors"
              >
                <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                  {index + 1}
                </td>
                <td className="py-2.5 px-3 font-mono font-semibold text-rose-300">
                  {issue.type}
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  {issue.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
