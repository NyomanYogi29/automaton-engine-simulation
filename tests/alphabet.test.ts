import { describe, expect, it } from 'vitest';
import {
  concat,
  formatAlphabet,
  formatStringDisplay,
  isValidString,
  length,
  parseAlphabet,
  sigmaN,
  sigmaStar,
} from '@/core/alphabet';

describe('alphabet core logic', () => {
  describe('parseAlphabet', () => {
    it('parses valid comma-separated alphabet strings', () => {
      expect(parseAlphabet('a, b')).toEqual(['a', 'b']);
      expect(parseAlphabet('0, 1')).toEqual(['0', '1']);
      expect(parseAlphabet('{a, b}')).toEqual(['a', 'b']);
    });

    it('handles extra whitespace cleanly', () => {
      expect(parseAlphabet('  x ,  y  , z ')).toEqual(['x', 'y', 'z']);
    });

    it('rejects empty input or whitespace only', () => {
      expect(() => parseAlphabet('')).toThrow('Alfabet tidak boleh kosong');
      expect(() => parseAlphabet('   ')).toThrow('Alfabet tidak boleh kosong');
    });

    it('rejects duplicate symbols in alphabet', () => {
      expect(() => parseAlphabet('a, b, a')).toThrow('Simbol duplikat');
      expect(() => parseAlphabet('0, 1, 0')).toThrow('Simbol duplikat');
    });

    it('rejects empty symbol tokens', () => {
      expect(() => parseAlphabet('a,,b')).toThrow('string kosong');
      expect(() => parseAlphabet(',')).toThrow('string kosong');
    });
  });

  describe('isValidString', () => {
    const sigma = ['a', 'b'];

    it('accepts valid strings composed purely of sigma symbols', () => {
      expect(isValidString('abba', sigma)).toBe(true);
      expect(isValidString('a', sigma)).toBe(true);
      expect(isValidString('b', sigma)).toBe(true);
    });

    it('rejects strings containing characters outside sigma', () => {
      expect(isValidString('abc', sigma)).toBe(false);
      expect(isValidString('101', sigma)).toBe(false);
    });

    it('treats empty string and epsilon as always valid in sigma star', () => {
      expect(isValidString('', sigma)).toBe(true);
      expect(isValidString('ε', sigma)).toBe(true);
    });
  });

  describe('length', () => {
    it('returns exact string length for standard strings', () => {
      expect(length('abba')).toBe(4);
      expect(length('b')).toBe(1);
    });

    it('returns 0 for empty string and epsilon symbol', () => {
      expect(length('')).toBe(0);
      expect(length('ε')).toBe(0);
    });
  });

  describe('concat', () => {
    it('concatenates strings correctly and demonstrates non-commutativity', () => {
      expect(concat('ab', 'bb')).toBe('abbb');
      expect(concat('bb', 'ab')).toBe('bbab');
    });

    it('demonstrates identity law w · ε = w and ε · w = w', () => {
      expect(concat('ab', '')).toBe('ab');
      expect(concat('ab', 'ε')).toBe('ab');
      expect(concat('', 'ab')).toBe('ab');
      expect(concat('ε', 'ab')).toBe('ab');
    });
  });

  describe('sigmaN', () => {
    const sigma = ['a', 'b'];

    it('generates epsilon singleton for n = 0', () => {
      expect(sigmaN(sigma, 0)).toEqual(['']);
    });

    it('generates sigma elements for n = 1', () => {
      expect(sigmaN(sigma, 1)).toEqual(['a', 'b']);
    });

    it('generates all combinations of exact length 2', () => {
      expect(sigmaN(sigma, 2)).toEqual(['aa', 'ab', 'ba', 'bb']);
    });

    it('returns empty array for negative n', () => {
      expect(sigmaN(sigma, -1)).toEqual([]);
    });
  });

  describe('sigmaStar', () => {
    const sigma = ['a', 'b'];

    it('generates sigma star up to maxLen ordered from short to long', () => {
      expect(sigmaStar(sigma, 2)).toEqual(['', 'a', 'b', 'aa', 'ab', 'ba', 'bb']);
    });

    it('generates only epsilon for maxLen = 0', () => {
      expect(sigmaStar(sigma, 0)).toEqual(['']);
    });

    it('returns empty array for negative maxLen', () => {
      expect(sigmaStar(sigma, -1)).toEqual([]);
    });
  });

  describe('format helpers', () => {
    it('formats alphabet in mathematical set notation', () => {
      expect(formatAlphabet(['a', 'b'])).toBe('Σ = {a, b}');
    });

    it('formats empty string as epsilon for display', () => {
      expect(formatStringDisplay('')).toBe('ε');
      expect(formatStringDisplay('ab')).toBe('ab');
    });
  });
});
