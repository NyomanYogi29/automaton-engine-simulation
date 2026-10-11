import React, { useState, useMemo } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { run, formatTrace } from '@/core/dfa';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Play,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

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
  const dfa = useAutomatonStore((s) => s.dfa);

  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { id: '1', input: '101', expected: true },
    { id: '2', input: '110', expected: false },
    { id: '3', input: 'ε', expected: false },
    { id: '4', input: '1', expected: true },
    { id: '5', input: '0', expected: false },
  ]);

  const [hasRun, setHasRun] = useState<boolean>(false);

  // Check if epsilon is tested in the test suite
  const includesEpsilon = useMemo(() => {
    return testCases.some(
      (tc) => tc.input === 'ε' || tc.input.trim() === '' || tc.input === "''",
    );
  }, [testCases]);

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
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    setHasRun(false);
  };

  const handleResetCases = () => {
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

  return (
    <div className="flex flex-col gap-4 text-slate-200">
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
              <th className="py-2.5 px-4 font-semibold uppercase tracking-wider min-w-[200px]">
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
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-16 text-right">
                Action
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
              testCases.map((tc, index) => (
                <tr
                  key={tc.id}
                  className="hover:bg-slate-900/40 transition-colors"
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
                  <td className="py-2 px-4 font-sans text-xs text-slate-400 max-w-[240px] truncate" title={tc.trace || ''}>
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

                  {/* Delete row action */}
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(tc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Delete test row"
                      aria-label={`Delete row ${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
