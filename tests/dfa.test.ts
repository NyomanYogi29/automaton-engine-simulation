import { describe, expect, it } from 'vitest';
import {
  delta,
  findDeadStates,
  formatTrace,
  run,
  tokenizeInput,
  validateDFA,
} from '@/core/dfa';
import {
  atmPinDFA,
  baliScriptDFA,
  endsWithOneDFA,
  evenAsDFA,
  startsWithADFA,
} from '@/core/presets';
import type { DFA } from '@/core/types';

describe('dfa core logic', () => {
  describe('delta function', () => {
    it('executes single transition step correctly', () => {
      expect(delta(endsWithOneDFA, 'q0', '0')).toBe('q0');
      expect(delta(endsWithOneDFA, 'q0', '1')).toBe('q1');
    });

    it('throws error when state is not registered in Q', () => {
      expect(() => delta(endsWithOneDFA, 'qUnknown', '0')).toThrow(
        'tidak terdaftar di himpunan Q',
      );
    });

    it('throws error when symbol is not registered in sigma', () => {
      expect(() => delta(endsWithOneDFA, 'q0', 'x')).toThrow(
        'tidak terdaftar dalam alfabet Σ',
      );
    });
  });

  describe('course table minimum test cases', () => {
    describe('Diakhiri 1 (sigma = {0, 1})', () => {
      it('accepts string "101"', () => {
        const result = run(endsWithOneDFA, '101');
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe('q1');
        expect(result.steps).toEqual([
          { step: 1, from: 'q0', symbol: '1', to: 'q1' },
          { step: 2, from: 'q1', symbol: '0', to: 'q0' },
          { step: 3, from: 'q0', symbol: '1', to: 'q1' },
        ]);
      });

      it('rejects string "110" even if it visited accepting state earlier', () => {
        const result = run(endsWithOneDFA, '110');
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe('q0');
        expect(result.steps).toEqual([
          { step: 1, from: 'q0', symbol: '1', to: 'q1' },
          { step: 2, from: 'q1', symbol: '1', to: 'q1' },
          { step: 3, from: 'q1', symbol: '0', to: 'q0' },
        ]);
      });

      it('rejects empty string epsilon', () => {
        const result = run(endsWithOneDFA, '');
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe('q0');
        expect(result.steps).toEqual([]);
      });
    });

    describe('Diawali a (sigma = {a, b}, dengan dead state q2)', () => {
      it('accepts string "abb"', () => {
        const result = run(startsWithADFA, 'abb');
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe('q1');
        expect(result.steps).toEqual([
          { step: 1, from: 'q0', symbol: 'a', to: 'q1' },
          { step: 2, from: 'q1', symbol: 'b', to: 'q1' },
          { step: 3, from: 'q1', symbol: 'b', to: 'q1' },
        ]);
      });

      it('rejects string "bab" trapping into dead state q2', () => {
        const result = run(startsWithADFA, 'bab');
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe('q2');
        expect(result.steps).toEqual([
          { step: 1, from: 'q0', symbol: 'b', to: 'q2' },
          { step: 2, from: 'q2', symbol: 'a', to: 'q2' },
          { step: 3, from: 'q2', symbol: 'b', to: 'q2' },
        ]);
      });
    });

    describe('Jumlah a genap (sigma = {a, b})', () => {
      it('accepts empty string epsilon as initial state is accepting', () => {
        const result = run(evenAsDFA, '');
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe('q0');
      });

      it('accepts string "abba" with 2 a symbols', () => {
        const result = run(evenAsDFA, 'abba');
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe('q0');
      });

      it('rejects string "baaa" with 3 a symbols', () => {
        const result = run(evenAsDFA, 'baaa');
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe('q1');
      });
    });

    describe('Aksara Bali (sigma = {K, V})', () => {
      it('accepts "KKV" and "KVK"', () => {
        const res1 = run(baliScriptDFA, 'KKV');
        expect(res1.accepted).toBe(true);
        expect(res1.finalState).toBe('q2');

        const res2 = run(baliScriptDFA, 'KVK');
        expect(res2.accepted).toBe(true);
        expect(res2.finalState).toBe('q1');
      });

      it('rejects "VK" and "KVV"', () => {
        const res1 = run(baliScriptDFA, 'VK');
        expect(res1.accepted).toBe(false);
        expect(res1.finalState).toBe('q3');

        const res2 = run(baliScriptDFA, 'KVV');
        expect(res2.accepted).toBe(false);
        expect(res2.finalState).toBe('q3');
      });
    });

    describe('ATM PIN DFA (Real-World Case)', () => {
      it('accepts 2-digit PIN followed by Enter (e.g. "10E")', () => {
        const result = run(atmPinDFA, '10E');
        expect(result.accepted).toBe(true);
        expect(result.finalState).toBe('AUTHENTICATED');
      });

      it('blocks when Enter pressed prematurely on IDLE', () => {
        const result = run(atmPinDFA, 'E');
        expect(result.accepted).toBe(false);
        expect(result.finalState).toBe('BLOCKED');
      });
    });
  });

  describe('validateDFA', () => {
    it('returns empty issues array for valid complete DFAs', () => {
      expect(validateDFA(endsWithOneDFA)).toEqual([]);
      expect(validateDFA(startsWithADFA)).toEqual([]);
      expect(validateDFA(evenAsDFA)).toEqual([]);
      expect(validateDFA(baliScriptDFA)).toEqual([]);
      expect(validateDFA(atmPinDFA)).toEqual([]);
    });

    it('detects missing transitions', () => {
      const incomplete: DFA = {
        name: 'Incomplete',
        states: ['q0', 'q1'],
        alphabet: ['0', '1'],
        startState: 'q0',
        acceptStates: ['q1'],
        transitions: {
          q0: { '0': 'q0' },
          q1: { '1': 'q1' },
        },
      };

      const issues = validateDFA(incomplete);
      expect(issues.some((i) => i.type === 'MISSING_TRANSITION' && i.state === 'q0' && i.symbol === '1')).toBe(true);
      expect(issues.some((i) => i.type === 'MISSING_TRANSITION' && i.state === 'q1' && i.symbol === '0')).toBe(true);
    });

    it('detects missing start state', () => {
      const noStart: DFA = {
        name: 'No Start',
        states: ['q0'],
        alphabet: ['0'],
        startState: '',
        acceptStates: ['q0'],
        transitions: { q0: { '0': 'q0' } },
      };

      const issues = validateDFA(noStart);
      expect(issues.some((i) => i.type === 'NO_START')).toBe(true);
    });

    it('detects start state not in Q', () => {
      const invalidStart: DFA = {
        name: 'Invalid Start',
        states: ['q0'],
        alphabet: ['0'],
        startState: 'qGhost',
        acceptStates: ['q0'],
        transitions: { q0: { '0': 'q0' } },
      };

      const issues = validateDFA(invalidStart);
      expect(issues.some((i) => i.type === 'START_NOT_IN_Q')).toBe(true);
    });

    it('detects accept state not in Q', () => {
      const invalidAccept: DFA = {
        name: 'Invalid Accept',
        states: ['q0'],
        alphabet: ['0'],
        startState: 'q0',
        acceptStates: ['qGhost'],
        transitions: { q0: { '0': 'q0' } },
      };

      const issues = validateDFA(invalidAccept);
      expect(issues.some((i) => i.type === 'ACCEPTING_NOT_IN_Q')).toBe(true);
    });

    it('detects transitions targeting unknown states', () => {
      const unknownTarget: DFA = {
        name: 'Unknown Target',
        states: ['q0'],
        alphabet: ['0'],
        startState: 'q0',
        acceptStates: ['q0'],
        transitions: { q0: { '0': 'qMissing' } },
      };

      const issues = validateDFA(unknownTarget);
      expect(issues.some((i) => i.type === 'UNKNOWN_STATE')).toBe(true);
    });
  });

  describe('findDeadStates', () => {
    it('detects dead state q2 in startsWithADFA', () => {
      expect(findDeadStates(startsWithADFA)).toEqual(['q2']);
    });

    it('detects dead state q3 in baliScriptDFA', () => {
      expect(findDeadStates(baliScriptDFA)).toEqual(['q3']);
    });

    it('returns empty list for DFAs with no dead states', () => {
      expect(findDeadStates(endsWithOneDFA)).toEqual([]);
      expect(findDeadStates(evenAsDFA)).toEqual([]);
    });
  });

  describe('run error handling', () => {
    it('returns error when input string contains symbol outside sigma', () => {
      const result = run(endsWithOneDFA, '102');
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('Simbol "2" tidak ada di alfabet Σ');
    });
  });

  describe('formatTrace', () => {
    it('formats accepted run trace according to specification', () => {
      const result = run(endsWithOneDFA, '101');
      expect(formatTrace(result)).toBe(
        '101 : q0 --1--> q1 --0--> q0 --1--> q1 ⇒ DITERIMA',
      );
    });

    it('formats rejected run trace according to specification', () => {
      const result = run(endsWithOneDFA, '110');
      expect(formatTrace(result)).toBe(
        '110 : q0 --1--> q1 --1--> q1 --0--> q0 ⇒ DITOLAK',
      );
    });

    it('formats epsilon run trace', () => {
      const resRejected = run(endsWithOneDFA, '');
      expect(formatTrace(resRejected)).toBe('ε : q0 ⇒ DITOLAK');

      const resAccepted = run(evenAsDFA, '');
      expect(formatTrace(resAccepted)).toBe('ε : q0 ⇒ DITERIMA');
    });

    it('formats error run trace', () => {
      const resError = run(endsWithOneDFA, '102');
      expect(formatTrace(resError)).toContain('ERROR:');
    });
  });

  describe('dynamic alphabet & smart tokenizer', () => {
    it('tokenizes multi-character alphabet symbols with space separation', () => {
      const alphabet = ['5', '10', '25'];
      const res = tokenizeInput('5 10 25 10', alphabet);
      expect(res.tokens).toEqual(['5', '10', '25', '10']);
      expect(res.error).toBeUndefined();
    });

    it('tokenizes multi-character alphabet symbols with comma separation', () => {
      const alphabet = ['5', '10', '25'];
      const res = tokenizeInput('10, 25, 5', alphabet);
      expect(res.tokens).toEqual(['10', '25', '5']);
      expect(res.error).toBeUndefined();
    });

    it('tokenizes multi-character symbols using greedy longest match when compact', () => {
      const alphabet = ['5', '10', '25'];
      const res = tokenizeInput('10255', alphabet);
      expect(res.tokens).toEqual(['10', '25', '5']);
      expect(res.error).toBeUndefined();
    });

    it('simulates custom multi-token coin DFA successfully', () => {
      const coinDFA: DFA = {
        name: 'Sistem Koin Tol',
        states: ['q0', 'q10', 'PAID'],
        alphabet: ['5', '10', '25'],
        start: 'q0',
        startState: 'q0',
        accepting: ['PAID'],
        acceptStates: ['PAID'],
        transitions: {
          q0: { '5': 'q0', '10': 'q10', '25': 'PAID' },
          q10: { '5': 'q10', '10': 'PAID', '25': 'PAID' },
          PAID: { '5': 'PAID', '10': 'PAID', '25': 'PAID' },
        },
      };

      const res = run(coinDFA, '10 10');
      expect(res.accepted).toBe(true);
      expect(res.finalState).toBe('PAID');
    });
  });
});

