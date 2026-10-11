import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDFAJSON } from '@/lib/exportImport';
import { run, validateDFA, formatTrace } from '@/core/dfa';
import { useAutomatonStore } from '@/store/useAutomatonStore';

interface BatchTestCase {
  input: string;
  expected: boolean;
}

interface BatchTestResult extends BatchTestCase {
  actual: boolean;
  passed: boolean;
  error?: string;
  trace?: string;
}

function runBatchTestSuite(
  dfa: Parameters<typeof run>[0],
  cases: BatchTestCase[],
): {
  results: BatchTestResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
} {
  const results = cases.map((tc) => {
    const normalizedInput = tc.input === 'ε' ? '' : tc.input;
    const res = run(dfa, normalizedInput);

    if (res.error) {
      return {
        ...tc,
        actual: false,
        passed: tc.expected === false,
        error: res.error,
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

  const passedCount = results.filter((r) => r.passed).length;
  return {
    results,
    passedCount,
    totalCount: cases.length,
    allPassed: passedCount === cases.length,
  };
}

describe('DFA JSON Import and Batch Test Runner', () => {
  describe('JSON File Import', () => {
    it('successfully imports Ends With 1 DFA from JSON fixture', () => {
      const filePath = resolve(__dirname, 'fixtures/valid_dfa_ends_with_1.json');
      const rawContent = readFileSync(filePath, 'utf-8');

      const parsed = parseDFAJSON(rawContent);
      expect(parsed.success).toBe(true);
      expect(parsed.dfa).toBeDefined();

      const dfa = parsed.dfa!;
      expect(dfa.name).toBe('Ends with 1 (Imported)');
      expect(dfa.states).toEqual(['q0', 'q1']);
      expect(dfa.alphabet).toEqual(['0', '1']);
      expect(dfa.start).toBe('q0');
      expect(dfa.accepting).toEqual(['q1']);

      const issues = validateDFA(dfa);
      expect(issues).toHaveLength(0);
    });

    it('successfully imports Starts With a DFA from JSON fixture', () => {
      const filePath = resolve(__dirname, 'fixtures/valid_dfa_starts_with_a.json');
      const rawContent = readFileSync(filePath, 'utf-8');

      const parsed = parseDFAJSON(rawContent);
      expect(parsed.success).toBe(true);
      expect(parsed.dfa).toBeDefined();

      const dfa = parsed.dfa!;
      expect(dfa.name).toBe('Starts with a (Imported)');
      expect(dfa.states).toEqual(['q0', 'q1', 'qDead']);
      expect(dfa.alphabet).toEqual(['a', 'b']);
      expect(dfa.start).toBe('q0');
      expect(dfa.accepting).toEqual(['q1']);

      const issues = validateDFA(dfa);
      expect(issues).toHaveLength(0);
    });

    it('successfully imports ATM PIN DFA from JSON fixture', () => {
      const filePath = resolve(__dirname, 'fixtures/valid_dfa_atm_pin.json');
      const rawContent = readFileSync(filePath, 'utf-8');

      const parsed = parseDFAJSON(rawContent);
      expect(parsed.success).toBe(true);
      expect(parsed.dfa).toBeDefined();

      const dfa = parsed.dfa!;
      expect(dfa.name).toBe('ATM PIN Verification System (Imported)');
      expect(dfa.states).toEqual(['IDLE', 'D1', 'D2', 'AUTH', 'BLOCKED']);
      expect(dfa.alphabet).toEqual(['0', '1', 'C', 'E']);
      expect(dfa.start).toBe('IDLE');
      expect(dfa.accepting).toEqual(['AUTH']);

      const issues = validateDFA(dfa);
      expect(issues).toHaveLength(0);
    });

    it('handles store synchronization when imported DFA is loaded into Zustand', () => {
      const filePath = resolve(__dirname, 'fixtures/valid_dfa_ends_with_1.json');
      const rawContent = readFileSync(filePath, 'utf-8');
      const parsed = parseDFAJSON(rawContent);

      expect(parsed.success).toBe(true);
      const store = useAutomatonStore.getState();
      store.setDFA(parsed.dfa!);

      const current = useAutomatonStore.getState();
      expect(current.dfa.name).toBe('Ends with 1 (Imported)');
      expect(current.nodes.map((n) => n.id)).toEqual(['q0', 'q1']);
      expect(current.edges.length).toBeGreaterThan(0);
      expect(current.validationIssues).toHaveLength(0);
    });

    it('rejects malformed and incomplete JSON structures with clear error messages', () => {
      const emptyJson = parseDFAJSON('{}');
      expect(emptyJson.success).toBe(false);
      expect(emptyJson.error).toContain('states');

      const missingAlphabet = parseDFAJSON(
        JSON.stringify({ states: ['q0'], start: 'q0' }),
      );
      expect(missingAlphabet.success).toBe(false);
      expect(missingAlphabet.error).toContain('alfabet');

      const missingTransitions = parseDFAJSON(
        JSON.stringify({ states: ['q0'], alphabet: ['0'], start: 'q0' }),
      );
      expect(missingTransitions.success).toBe(false);
      expect(missingTransitions.error).toContain('transisi');
    });
  });

  describe('Batch Test Suites against Imported DFAs', () => {
    it('executes batch test suite on Ends With 1 DFA', () => {
      const raw = readFileSync(
        resolve(__dirname, 'fixtures/valid_dfa_ends_with_1.json'),
        'utf-8',
      );
      const { dfa } = parseDFAJSON(raw);
      expect(dfa).toBeDefined();

      const suite: BatchTestCase[] = [
        { input: '101', expected: true },
        { input: '110', expected: false },
        { input: 'ε', expected: false },
        { input: '1', expected: true },
        { input: '0', expected: false },
        { input: '1011', expected: true },
        { input: '1010', expected: false },
        { input: '0000', expected: false },
        { input: '1111', expected: true },
      ];

      const batchSummary = runBatchTestSuite(dfa!, suite);
      expect(batchSummary.allPassed).toBe(true);
      expect(batchSummary.passedCount).toBe(9);
      expect(batchSummary.totalCount).toBe(9);

      // Verify traces are produced for each row
      for (const res of batchSummary.results) {
        expect(res.trace).toBeDefined();
        expect(res.trace?.length).toBeGreaterThan(0);
      }
    });

    it('executes batch test suite on Starts With a DFA (including dead state traps)', () => {
      const raw = readFileSync(
        resolve(__dirname, 'fixtures/valid_dfa_starts_with_a.json'),
        'utf-8',
      );
      const { dfa } = parseDFAJSON(raw);
      expect(dfa).toBeDefined();

      const suite: BatchTestCase[] = [
        { input: 'a', expected: true },
        { input: 'ab', expected: true },
        { input: 'abbba', expected: true },
        { input: 'b', expected: false },
        { input: 'ba', expected: false },
        { input: 'bba', expected: false },
        { input: 'ε', expected: false },
      ];

      const batchSummary = runBatchTestSuite(dfa!, suite);
      expect(batchSummary.allPassed).toBe(true);
      expect(batchSummary.passedCount).toBe(7);
      expect(batchSummary.totalCount).toBe(7);
    });

    it('executes batch test suite on ATM PIN DFA (multi-step operational logic)', () => {
      const raw = readFileSync(
        resolve(__dirname, 'fixtures/valid_dfa_atm_pin.json'),
        'utf-8',
      );
      const { dfa } = parseDFAJSON(raw);
      expect(dfa).toBeDefined();

      const suite: BatchTestCase[] = [
        { input: '10E', expected: true }, // 2 digits then Enter -> Authenticated
        { input: '01E', expected: true },
        { input: '11E', expected: true },
        { input: 'E', expected: false }, // Premature Enter on IDLE -> Blocked
        { input: '1E', expected: false }, // 1 digit then Enter -> Blocked
        { input: '100', expected: false }, // 3 digits without Enter -> Blocked
        { input: '10C10E', expected: true }, // Cancel returns to IDLE, then correct PIN
        { input: 'C', expected: false }, // Cancel stays on IDLE, not accepted
      ];

      const batchSummary = runBatchTestSuite(dfa!, suite);
      expect(batchSummary.allPassed).toBe(true);
      expect(batchSummary.passedCount).toBe(8);
      expect(batchSummary.totalCount).toBe(8);
    });

    it('accurately identifies failing test cases when machine output does not match expectation', () => {
      const raw = readFileSync(
        resolve(__dirname, 'fixtures/valid_dfa_ends_with_1.json'),
        'utf-8',
      );
      const { dfa } = parseDFAJSON(raw);

      const faultySuite: BatchTestCase[] = [
        { input: '101', expected: false }, // Actually true, so this test should fail
        { input: '110', expected: true }, // Actually false, so this test should fail
        { input: '1', expected: true }, // Actually true, so this passes
      ];

      const batchSummary = runBatchTestSuite(dfa!, faultySuite);
      expect(batchSummary.allPassed).toBe(false);
      expect(batchSummary.passedCount).toBe(1);
      expect(batchSummary.totalCount).toBe(3);
      expect(batchSummary.results[0].passed).toBe(false);
      expect(batchSummary.results[1].passed).toBe(false);
      expect(batchSummary.results[2].passed).toBe(true);
    });

    it('handles unexpected alphabet symbols gracefully in batch runner', () => {
      const raw = readFileSync(
        resolve(__dirname, 'fixtures/valid_dfa_ends_with_1.json'),
        'utf-8',
      );
      const { dfa } = parseDFAJSON(raw);

      const invalidSymbolSuite: BatchTestCase[] = [
        { input: '102', expected: false }, // '2' is not in alphabet {0, 1}
      ];

      const batchSummary = runBatchTestSuite(dfa!, invalidSymbolSuite);
      const item = batchSummary.results[0];
      expect(item.error).toBeDefined();
      expect(item.error).toContain('tidak ada di alfabet');
      expect(item.actual).toBe(false);
    });
  });
});
