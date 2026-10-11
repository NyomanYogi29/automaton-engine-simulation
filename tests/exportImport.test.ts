import { describe, it, expect } from 'vitest';
import { parseDFAJSON } from '@/lib/exportImport';

describe('exportImport - parseDFAJSON', () => {
  it('parses valid DFA JSON correctly', () => {
    const raw = JSON.stringify({
      name: 'Test DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q0', '1': 'q1' },
      },
    });

    const result = parseDFAJSON(raw);
    expect(result.success).toBe(true);
    expect(result.dfa).toBeDefined();
    expect(result.dfa?.name).toBe('Test DFA');
    expect(result.dfa?.states).toEqual(['q0', 'q1']);
    expect(result.dfa?.startState).toBe('q0');
    expect(result.dfa?.start).toBe('q0');
    expect(result.dfa?.acceptStates).toEqual(['q1']);
    expect(result.dfa?.transitions.q0['1']).toBe('q1');
  });

  it('supports alias properties start and accepting', () => {
    const raw = JSON.stringify({
      states: ['A', 'B'],
      alphabet: ['x'],
      start: 'A',
      accepting: ['B'],
      transitions: {
        A: { x: 'B' },
        B: { x: 'B' },
      },
    });

    const result = parseDFAJSON(raw);
    expect(result.success).toBe(true);
    expect(result.dfa?.startState).toBe('A');
    expect(result.dfa?.acceptStates).toEqual(['B']);
  });

  it('rejects invalid JSON syntax', () => {
    const result = parseDFAJSON('invalid json {');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects DFA missing states', () => {
    const result = parseDFAJSON(JSON.stringify({ alphabet: ['a'], startState: 'q0' }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('states');
  });

  it('rejects DFA missing alphabet', () => {
    const result = parseDFAJSON(JSON.stringify({ states: ['q0'], startState: 'q0' }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('alfabet');
  });

  it('rejects DFA missing start state', () => {
    const result = parseDFAJSON(JSON.stringify({ states: ['q0'], alphabet: ['a'] }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('state awal');
  });
});
