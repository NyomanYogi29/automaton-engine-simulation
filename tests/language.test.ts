import { describe, expect, it } from 'vitest';
import { PRESET_LANGUAGES, membersUpTo } from '@/core/language';

describe('language core logic', () => {
  it('provides 5 preset languages with unique IDs', () => {
    expect(PRESET_LANGUAGES).toHaveLength(5);
    const ids = PRESET_LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(5);
  });

  describe('preset: Diakhiri b', () => {
    const lang = PRESET_LANGUAGES.find((l) => l.id === 'ends-with-b')!;

    it('validates test cases from course slide 10', () => {
      expect(lang.accepts('ab')).toBe(true);
      expect(lang.accepts('ba')).toBe(false);
      expect(lang.accepts('bbb')).toBe(true);
      expect(lang.accepts('a')).toBe(false);
      expect(lang.accepts('aab')).toBe(true);
      expect(lang.accepts('')).toBe(false);
      expect(lang.accepts('ε')).toBe(false);
    });

    it('rejects characters outside alphabet', () => {
      expect(lang.accepts('cb')).toBe(false);
    });
  });

  describe('preset: Diawali a', () => {
    const lang = PRESET_LANGUAGES.find((l) => l.id === 'starts-with-a')!;

    it('accepts strings starting with symbol a', () => {
      expect(lang.accepts('a')).toBe(true);
      expect(lang.accepts('ab')).toBe(true);
      expect(lang.accepts('aba')).toBe(true);
    });

    it('rejects strings not starting with a or empty string', () => {
      expect(lang.accepts('b')).toBe(false);
      expect(lang.accepts('ba')).toBe(false);
      expect(lang.accepts('')).toBe(false);
      expect(lang.accepts('ε')).toBe(false);
    });
  });

  describe('preset: Panjang tepat 2', () => {
    const lang = PRESET_LANGUAGES.find((l) => l.id === 'length-exact-2')!;

    it('accepts strings of exact length 2', () => {
      expect(lang.accepts('aa')).toBe(true);
      expect(lang.accepts('ab')).toBe(true);
      expect(lang.accepts('ba')).toBe(true);
      expect(lang.accepts('bb')).toBe(true);
    });

    it('rejects strings of other lengths', () => {
      expect(lang.accepts('a')).toBe(false);
      expect(lang.accepts('aaa')).toBe(false);
      expect(lang.accepts('')).toBe(false);
      expect(lang.accepts('ε')).toBe(false);
    });
  });

  describe('preset: Hanya berisi b', () => {
    const lang = PRESET_LANGUAGES.find((l) => l.id === 'only-b')!;

    it('accepts strings composed solely of b including epsilon', () => {
      expect(lang.accepts('')).toBe(true);
      expect(lang.accepts('ε')).toBe(true);
      expect(lang.accepts('b')).toBe(true);
      expect(lang.accepts('bb')).toBe(true);
      expect(lang.accepts('bbb')).toBe(true);
    });

    it('rejects strings containing a', () => {
      expect(lang.accepts('a')).toBe(false);
      expect(lang.accepts('ab')).toBe(false);
      expect(lang.accepts('ba')).toBe(false);
    });
  });

  describe('preset: Jumlah a genap', () => {
    const lang = PRESET_LANGUAGES.find((l) => l.id === 'even-a')!;

    it('accepts string with even number of a', () => {
      expect(lang.accepts('')).toBe(true);
      expect(lang.accepts('ε')).toBe(true);
      expect(lang.accepts('bb')).toBe(true);
      expect(lang.accepts('aa')).toBe(true);
      expect(lang.accepts('abba')).toBe(true);
    });

    it('rejects string with odd number of a', () => {
      expect(lang.accepts('a')).toBe(false);
      expect(lang.accepts('baaa')).toBe(false);
      expect(lang.accepts('ab')).toBe(false);
    });
  });

  describe('membersUpTo', () => {
    it('generates subset members correctly for ends-with-b', () => {
      const lang = PRESET_LANGUAGES.find((l) => l.id === 'ends-with-b')!;
      expect(membersUpTo(lang, 2)).toEqual(['b', 'ab', 'bb']);
    });

    it('generates subset members correctly for only-b', () => {
      const lang = PRESET_LANGUAGES.find((l) => l.id === 'only-b')!;
      expect(membersUpTo(lang, 2)).toEqual(['', 'b', 'bb']);
    });

    it('generates subset members correctly for even-a', () => {
      const lang = PRESET_LANGUAGES.find((l) => l.id === 'even-a')!;
      expect(membersUpTo(lang, 2)).toEqual(['', 'b', 'aa', 'bb']);
    });
  });
});
