import type {
  DFA,
  RunResult,
  State,
  Symbol,
  TraceStep,
  ValidationIssue,
} from '@/core/types';

export function getStartState(dfa: DFA): State {
  return dfa.startState || dfa.start || '';
}

export function getAcceptStates(dfa: DFA): State[] {
  return dfa.acceptStates || dfa.accepting || [];
}

export function validateDFA(dfa: DFA): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const stateSet = new Set(dfa.states);
  const start = getStartState(dfa);
  const acceptStates = getAcceptStates(dfa);

  if (!start) {
    issues.push({
      type: 'NO_START',
      code: 'NO_START',
      severity: 'error',
      message: 'State awal (q0) belum ditentukan.',
    });
  } else if (!stateSet.has(start)) {
    issues.push({
      type: 'START_NOT_IN_Q',
      code: 'START_NOT_IN_Q',
      severity: 'error',
      state: start,
      message: `State awal "${start}" tidak ditemukan dalam himpunan state Q.`,
    });
  }

  for (const acc of acceptStates) {
    if (!stateSet.has(acc)) {
      issues.push({
        type: 'ACCEPTING_NOT_IN_Q',
        code: 'ACCEPTING_NOT_IN_Q',
        severity: 'error',
        state: acc,
        message: `State akhir "${acc}" tidak ditemukan dalam himpunan state Q.`,
      });
    }
  }

  for (const q of dfa.states) {
    for (const a of dfa.alphabet) {
      const target = dfa.transitions[q]?.[a];
      if (target === undefined || target === '') {
        issues.push({
          type: 'MISSING_TRANSITION',
          code: 'MISSING_TRANSITION',
          severity: 'error',
          state: q,
          symbol: a,
          message: `State "${q}" tidak memiliki transisi untuk simbol "${a}".`,
        });
      } else if (!stateSet.has(target)) {
        issues.push({
          type: 'UNKNOWN_STATE',
          code: 'UNKNOWN_STATE',
          severity: 'error',
          state: q,
          symbol: a,
          message: `Transisi dari "${q}" dengan simbol "${a}" mengarah ke state "${target}" yang tidak terdaftar di Q.`,
        });
      }
    }
  }

  return issues;
}

export function delta(dfa: DFA, q: State, a: Symbol): State {
  if (!dfa.states.includes(q)) {
    throw new Error(`State "${q}" tidak terdaftar di himpunan Q.`);
  }

  if (!dfa.alphabet.includes(a)) {
    throw new Error(`Simbol "${a}" tidak terdaftar dalam alfabet Σ.`);
  }

  const target = dfa.transitions[q]?.[a];
  if (!target) {
    throw new Error(`Tidak ada transisi dari state "${q}" dengan simbol "${a}".`);
  }

  return target;
}

/**
 * Tokenizes an input string against an alphabet.
 * Supports whitespace/comma separation, as well as greedy longest-prefix matching
 * for compact multi-character token sequences (e.g. coin systems with '5', '10', '25').
 */
export function tokenizeInput(
  w: string,
  alphabet: Symbol[],
): { tokens: Symbol[]; error?: string } {
  const normalized = w.trim();
  if (normalized === '' || normalized === 'ε') {
    return { tokens: [] };
  }

  // Check if string contains spaces or commas
  if (/[\s,]/.test(normalized)) {
    const rawParts = normalized.split(/[\s,]+/).filter(Boolean);
    const alphabetSet = new Set(alphabet);
    const tokens: Symbol[] = [];

    for (const part of rawParts) {
      if (!alphabetSet.has(part)) {
        return {
          tokens: [],
          error: `Simbol "${part}" tidak ada di alfabet Σ.`,
        };
      }
      tokens.push(part);
    }
    return { tokens };
  }

  // If all alphabet symbols are single characters, check character by character
  const isAllSingleChar = alphabet.every((sym) => sym.length === 1);
  if (isAllSingleChar) {
    const alphabetSet = new Set(alphabet);
    const tokens: Symbol[] = [];
    for (const char of normalized) {
      if (!alphabetSet.has(char)) {
        return {
          tokens: [],
          error: `Simbol "${char}" tidak ada di alfabet Σ.`,
        };
      }
      tokens.push(char);
    }
    return { tokens };
  }

  // Greedy longest-match tokenization for multi-character symbols
  const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
  const tokens: Symbol[] = [];
  let idx = 0;

  while (idx < normalized.length) {
    let matchedSymbol: string | null = null;
    for (const sym of sortedAlphabet) {
      if (normalized.startsWith(sym, idx)) {
        matchedSymbol = sym;
        break;
      }
    }

    if (!matchedSymbol) {
      const remaining = normalized.slice(idx);
      return {
        tokens: [],
        error: `Simbol tidak dikenal mulai dari posisi ${idx + 1}: "${remaining}".`,
      };
    }

    tokens.push(matchedSymbol);
    idx += matchedSymbol.length;
  }

  return { tokens };
}

export function run(dfa: DFA, w: string): RunResult {
  const start = getStartState(dfa);
  const acceptStates = getAcceptStates(dfa);

  const { tokens, error } = tokenizeInput(w, dfa.alphabet);
  if (error) {
    return {
      accepted: false,
      finalState: start,
      steps: [],
      error,
    };
  }

  if (tokens.length === 0) {
    return {
      accepted: acceptStates.includes(start),
      finalState: start,
      steps: [],
    };
  }

  let current = start;
  const steps: TraceStep[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const symbol = tokens[i];
    const next = dfa.transitions[current]?.[symbol];

    if (!next) {
      return {
        accepted: false,
        finalState: current,
        steps,
        error: `Transisi tidak ditemukan untuk state "${current}" dengan simbol "${symbol}".`,
      };
    }

    steps.push({
      step: i + 1,
      from: current,
      symbol,
      to: next,
    });
    current = next;
  }

  return {
    accepted: acceptStates.includes(current),
    finalState: current,
    steps,
  };
}

export function formatTrace(result: RunResult): string {
  if (result.error) {
    return `ERROR: ${result.error}`;
  }

  if (result.steps.length === 0) {
    return `ε : ${result.finalState} ⇒ ${result.accepted ? 'DITERIMA' : 'DITOLAK'}`;
  }

  const input = result.steps.map((s) => s.symbol).join('');
  let path = result.steps[0].from;

  for (const step of result.steps) {
    path += ` --${step.symbol}--> ${step.to}`;
  }

  return `${input} : ${path} ⇒ ${result.accepted ? 'DITERIMA' : 'DITOLAK'}`;
}

export function findDeadStates(dfa: DFA): State[] {
  const acceptStates = getAcceptStates(dfa);

  return dfa.states.filter((state) => {
    if (acceptStates.includes(state)) {
      return false;
    }

    const stateTransitions = dfa.transitions[state];
    if (!stateTransitions) {
      return false;
    }

    return (
      dfa.alphabet.length > 0 &&
      dfa.alphabet.every((sym) => stateTransitions[sym] === state)
    );
  });
}
