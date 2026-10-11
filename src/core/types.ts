export type StateId = string;
export type State = StateId;
export type AlphabetSymbol = string;
export type Symbol = AlphabetSymbol;
export type Alphabet = AlphabetSymbol[];

export interface TransitionStep {
  from: StateId;
  symbol: AlphabetSymbol;
  to: StateId;
  index: number;
}

export interface TraceStep {
  step: number;
  from: State;
  symbol: Symbol;
  to: State;
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

export interface RunResult {
  accepted: boolean;
  finalState: State;
  steps: TraceStep[];
  error?: string;
}

export interface DFA {
  name: string;
  states: State[]; // Q
  alphabet: Alphabet; // Σ
  transitions: Record<State, Record<Symbol, State>>; // δ(q, a) = p
  startState: State; // q0
  acceptStates: State[]; // F
  start?: State; // alias for startState
  accepting?: State[]; // alias for acceptStates
}

export interface NFA {
  name: string;
  states: StateId[];
  alphabet: Alphabet;
  // In NFA, target can be multiple states or empty set; ε transition uses EPSILON_SYMBOL
  transitions: Record<StateId, Record<AlphabetSymbol, StateId[]>>;
  startState: StateId;
  acceptStates: StateId[];
  start?: StateId;
  accepting?: StateId[];
}

export type ValidationIssueType =
  | 'MISSING_TRANSITION'
  | 'UNKNOWN_STATE'
  | 'NO_START'
  | 'START_NOT_IN_Q'
  | 'ACCEPTING_NOT_IN_Q'
  | 'DEAD_STATE_DETECTED';

export type ValidationCode = ValidationIssueType;

export interface ValidationIssue {
  type: ValidationIssueType;
  code: ValidationCode;
  severity: 'error' | 'warning' | 'info';
  message: string;
  state?: StateId;
  symbol?: AlphabetSymbol;
}

export const EPSILON_SYMBOL = 'ε';
