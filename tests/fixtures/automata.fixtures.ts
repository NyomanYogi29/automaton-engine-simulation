import type { DFA } from '@/core/types';

export const endsWithOneDFA: DFA = {
  name: 'Diakhiri 1',
  states: ['q0', 'q1'],
  alphabet: ['0', '1'],
  startState: 'q0',
  acceptStates: ['q1'],
  transitions: {
    q0: { '0': 'q0', '1': 'q1' },
    q1: { '0': 'q0', '1': 'q1' },
  },
};

export const startsWithADFA: DFA = {
  name: 'Diawali a (dengan dead state)',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: ['q1'],
  transitions: {
    q0: { a: 'q1', b: 'q2' },
    q1: { a: 'q1', b: 'q1' },
    q2: { a: 'q2', b: 'q2' }, // dead state
  },
};

export const evenAsDFA: DFA = {
  name: 'Jumlah a genap',
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: ['q0'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q0', b: 'q1' },
  },
};

export const atmPinDFA: DFA = {
  name: 'Verifikasi PIN ATM (3 Digit)',
  states: ['IDLE', 'D1', 'D2', 'AUTHENTICATED', 'BLOCKED'],
  alphabet: ['0', '1', 'C', 'E'],
  startState: 'IDLE',
  acceptStates: ['AUTHENTICATED'],
  transitions: {
    IDLE: { '0': 'D1', '1': 'D1', C: 'IDLE', E: 'BLOCKED' },
    D1: { '0': 'D2', '1': 'D2', C: 'IDLE', E: 'BLOCKED' },
    D2: { '0': 'BLOCKED', '1': 'BLOCKED', C: 'IDLE', E: 'AUTHENTICATED' },
    AUTHENTICATED: { '0': 'AUTHENTICATED', '1': 'AUTHENTICATED', C: 'IDLE', E: 'AUTHENTICATED' },
    BLOCKED: { '0': 'BLOCKED', '1': 'BLOCKED', C: 'BLOCKED', E: 'BLOCKED' },
  },
};

export const incompleteDFA: DFA = {
  name: 'DFA Transisi Belum Lengkap',
  states: ['q0', 'q1'],
  alphabet: ['0', '1'],
  startState: 'q0',
  acceptStates: ['q1'],
  transitions: {
    q0: { '0': 'q0' }, // missing '1'
    q1: { '1': 'q1' }, // missing '0'
  },
};
