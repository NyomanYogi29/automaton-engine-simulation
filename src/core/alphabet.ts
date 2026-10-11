import type { Alphabet } from '@/core/types';

export function parseAlphabet(input: string): Alphabet {
  const cleaned = input.trim().replace(/^\{/, '').replace(/\}$/, '').trim();

  if (!cleaned) {
    throw new Error('Alfabet tidak boleh kosong.');
  }

  const rawTokens = cleaned.split(',').map((token) => token.trim());
  const seen = new Set<string>();
  const alphabet: Alphabet = [];

  for (const token of rawTokens) {
    if (!token) {
      throw new Error('Simbol alfabet tidak boleh berupa string kosong.');
    }

    if (seen.has(token)) {
      throw new Error(`Simbol duplikat tidak diperbolehkan: "${token}".`);
    }

    seen.add(token);
    alphabet.push(token);
  }

  return alphabet;
}

export function isValidString(w: string, sigma: Alphabet): boolean {
  if (w === '' || w === 'ε') {
    return true;
  }

  const allowed = new Set(sigma);
  for (const char of w) {
    if (!allowed.has(char)) {
      return false;
    }
  }

  return true;
}

export function length(w: string): number {
  if (w === '' || w === 'ε') {
    return 0;
  }
  return w.length;
}

export function concat(w: string, v: string): string {
  const normW = w === 'ε' ? '' : w;
  const normV = v === 'ε' ? '' : v;
  return `${normW}${normV}`;
}

export function sigmaN(sigma: Alphabet, n: number): string[] {
  if (n < 0) {
    return [];
  }
  if (n === 0) {
    return [''];
  }

  let currentLevel = [''];

  for (let i = 0; i < n; i++) {
    const nextLevel: string[] = [];
    for (const prefix of currentLevel) {
      for (const symbol of sigma) {
        nextLevel.push(`${prefix}${symbol}`);
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel;
}

export function sigmaStar(sigma: Alphabet, maxLen: number): string[] {
  if (maxLen < 0) {
    return [];
  }

  const result: string[] = [];
  for (let i = 0; i <= maxLen; i++) {
    result.push(...sigmaN(sigma, i));
  }

  return result;
}

export function formatAlphabet(sigma: Alphabet): string {
  return `Σ = {${sigma.join(', ')}}`;
}

export function formatStringDisplay(w: string): string {
  return w === '' ? 'ε' : w;
}
