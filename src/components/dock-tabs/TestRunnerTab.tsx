import React, { useState, useMemo } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { run, formatTrace } from '@/core/dfa';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TestCaseRow {
  id: string;
  input: string;
  expected: boolean;
  actual?: boolean;
  trace?: string;
  passed?: boolean;
  error?: string;
}

export const TestRunnerTab: React.FC = () => {
  const dfa = useAutomatonStore((s) => s.dfa);

  // Default test batch with standard inputs including epsilon
  const [rawText, setRawText] = useState<string>(
    '101  ✓\n110  ✗\nε    ✗\n1    ✓\n0    ✗',
  );
  const [results, setResults] = useState<TestCaseRow[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);

  // Parse raw text into structured test cases
  const parsedCases = useMemo<TestCaseRow[]>(() => {
    const lines = rawText.split('\n');
    const cases: TestCaseRow[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Match pattern: string followed by expected checkmark or cross
      // Supports: "101 ✓", "110 ✗", "ε ✗", "101 true", "110 false", "101 accept", "110 reject"
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        let inputSymbol = parts[0];
        if (inputSymbol === 'ε' || inputSymbol === '""' || inputSymbol === "''") {
          inputSymbol = '';
        }

        const expectationStr = parts.slice(1).join(' ').toLowerCase();
        const expected =
          expectationStr.includes('✓') ||
          expectationStr.includes('true') ||
          expectationStr.includes('ya') ||
          expectationStr.includes('accept');

        cases.push({
          id: `case-${index}`,
          input: inputSymbol,
          expected,
        });
      }
    });

    return cases;
  }, [rawText]);

  // Check if epsilon is tested (critical requirement in DFA test suites)
  const includesEpsilon = useMemo(() => {
    return parsedCases.some((c) => c.input === '');
  }, [parsedCases]);

  const handleRunTests = () => {
    const executed: TestCaseRow[] = parsedCases.map((tc) => {
      const res = run(dfa, tc.input);
      if (res.error) {
        return {
          ...tc,
          actual: false,
          error: res.error,
          passed: false,
          trace: formatTrace(res),
        };
      }

      const passed = res.accepted === tc.expected;
      return {
        ...tc,
        actual: res.accepted,
        passed,
        trace: formatTrace(res),
      };
    });

    setResults(executed);
    setHasRun(true);
  };

  const summary = useMemo(() => {
    if (!hasRun || results.length === 0) return null;
    const passedCount = results.filter((r) => r.passed).length;
    return {
      passed: passedCount,
      total: results.length,
      allPassed: passedCount === results.length,
    };
  }, [hasRun, results]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-200">
      {/* Left panel: textarea input for batch string test specification */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Test List (String & Expectation)
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Format: &lt;string&gt; [✓ | ✗]
          </span>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setHasRun(false);
          }}
          rows={8}
          aria-label="Test List String and Expectation"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-none"
          placeholder="101  ✓&#10;110  ✗&#10;ε    ✗"
        />

        {/* Epsilon warning prompt */}
        {!includesEpsilon && (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/80 p-2.5 rounded-lg text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Epsilon (ε) string not tested</p>
              <p className="text-[11px] text-amber-200/80">
                DFA verification recipes require testing the empty string ε to ensure initial state behavior is verified.
              </p>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleRunTests}
          icon={<Play className="w-4 h-4 fill-current" />}
          className="w-full font-semibold"
        >
          Run All Tests ({parsedCases.length} items)
        </Button>
      </div>

      {/* Right panel: results table and summary display */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Execution Results
          </span>
          {summary && (
            <div className="flex items-center gap-2">
              <Badge variant={summary.allPassed ? 'accepted' : 'rejected'}>
                {summary.passed} of {summary.total} tests passed
              </Badge>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 min-h-[220px]">
          {!hasRun ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
              <p>No test results yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">
                Click &quot;Run All Tests&quot; to execute your test batch against the active DFA.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">
                    String
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">
                    Expected
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">
                    Actual
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-20 text-center">
                    Status
                  </th>
                  <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">
                    Trace
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-2 px-3 text-cyan-300 font-semibold">
                      {r.input === '' ? 'ε' : r.input}
                    </td>
                    <td className="py-2 px-3">
                      {r.expected ? (
                        <span className="text-emerald-400 font-semibold">
                          Accept
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">
                          Reject
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {r.error ? (
                        <span className="text-amber-400 font-semibold text-[11px]">
                          Error
                        </span>
                      ) : r.actual ? (
                        <span className="text-emerald-400 font-semibold">
                          Accept
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold">
                          Reject
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {r.passed ? (
                        <div
                          className="inline-flex items-center gap-1 text-emerald-400 text-xs"
                          title="Result matches expectation"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </div>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1 text-rose-400 text-xs"
                          title="Mismatch or validation error"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[240px]">
                      {r.error || r.trace || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
