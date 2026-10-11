export type StateId = string;
export type AlphabetSymbol = string;
export type Alphabet = AlphabetSymbol[];

export interface TransitionStep {
  from: StateId;
  symbol: AlphabetSymbol;
  to: StateId;
  index: number;
}

export type SimulationStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'INVALID_INPUT';

export interface SimulationTrace {
  input: string;
  steps: TransitionStep[];
  finalState: StateId | null;
  isAccepted: boolean;
  status: SimulationStatus;
  currentStepIndex: number;
  errorMessage?: string;
}

export interface DFA {
  name: string;
  states: StateId[]; // Q
  alphabet: Alphabet; // Σ
  transitions: Record<StateId, Record<AlphabetSymbol, StateId>>; // δ(q, a) = p
  startState: StateId; // q0
  acceptStates: StateId[]; // F
}

export interface NFA {
  name: string;
  states: StateId[];
  alphabet: Alphabet;
  // In NFA, target can be multiple states or empty set; ε transition uses EPSILON_SYMBOL
  transitions: Record<StateId, Record<AlphabetSymbol, StateId[]>>;
  startState: StateId;
  acceptStates: StateId[];
}

export type ValidationCode =
  | 'MISSING_TRANSITION'
  | 'NO_START_STATE'
  | 'START_STATE_NOT_FOUND'
  | 'ACCEPT_STATE_NOT_FOUND'
  | 'DEAD_STATE_DETECTED';

export interface ValidationIssue {
  code: ValidationCode;
  severity: 'error' | 'warning' | 'info';
  message: string;
  state?: StateId;
  symbol?: AlphabetSymbol;
}

export const EPSILON_SYMBOL = 'ε';
