import type { Alphabet } from '@/core/types';
import { isValidString, sigmaStar } from '@/core/alphabet';

export interface Language {
  id: string;
  name: string;
  sigma: Alphabet;
  description: string;
  accepts: (w: string) => boolean;
}

export const PRESET_LANGUAGES: Language[] = [
  {
    id: 'starts-with-a',
    name: 'Diawali a',
    sigma: ['a', 'b'],
    description: "String yang diawali dengan simbol 'a'",
    accepts: (w: string) => {
      const normalized = w === 'ε' ? '' : w;
      return isValidString(normalized, ['a', 'b']) && normalized.startsWith('a');
    },
  },
  {
    id: 'ends-with-b',
    name: 'Diakhiri b',
    sigma: ['a', 'b'],
    description: "String yang diakhiri dengan simbol 'b'",
    accepts: (w: string) => {
      const normalized = w === 'ε' ? '' : w;
      return isValidString(normalized, ['a', 'b']) && normalized.endsWith('b');
    },
  },
  {
    id: 'length-exact-2',
    name: 'Panjang tepat 2',
    sigma: ['a', 'b'],
    description: 'String dengan panjang tepat 2 karakter (|w| = 2)',
    accepts: (w: string) => {
      const normalized = w === 'ε' ? '' : w;
      return isValidString(normalized, ['a', 'b']) && normalized.length === 2;
    },
  },
  {
    id: 'only-b',
    name: 'Hanya berisi b',
    sigma: ['a', 'b'],
    description: "String yang hanya berisi simbol 'b' (termasuk ε)",
    accepts: (w: string) => {
      const normalized = w === 'ε' ? '' : w;
      if (!isValidString(normalized, ['a', 'b'])) {
        return false;
      }
      return Array.from(normalized).every((char) => char === 'b');
    },
  },
  {
    id: 'even-a',
    name: 'Jumlah a genap',
    sigma: ['a', 'b'],
    description: "String dengan jumlah kemunculan simbol 'a' bernilai genap",
    accepts: (w: string) => {
      const normalized = w === 'ε' ? '' : w;
      if (!isValidString(normalized, ['a', 'b'])) {
        return false;
      }
      const countA = (normalized.match(/a/g) || []).length;
      return countA % 2 === 0;
    },
  },
];

export function membersUpTo(lang: Language, maxLen: number): string[] {
  return sigmaStar(lang.sigma, maxLen).filter((w) => lang.accepts(w));
}
