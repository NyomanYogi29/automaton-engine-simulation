import { useState, useMemo } from 'react';
import {
  parseAlphabet,
  isValidString,
  length as getStringLength,
  concat,
  sigmaN,
  sigmaStar,
  formatAlphabet,
  formatStringDisplay,
} from '@/core/alphabet';
import { Drawer, Button, Input, Badge } from '@/components/common';
import { Layers, AlertCircle } from 'lucide-react';

export interface AlphabetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_OPTIONS = [
  { label: 'Biner {0, 1}', value: '0, 1' },
  { label: 'Huruf {a, b}', value: 'a, b' },
  { label: 'Aksara {K, V}', value: 'K, V' },
  { label: 'ATM {0, 1, C, E}', value: '0, 1, C, E' },
];

export function AlphabetDrawer({ isOpen, onClose }: AlphabetDrawerProps) {
  const [alphabetInput, setAlphabetInput] = useState<string>('a, b');
  const [testString, setTestString] = useState<string>('abba');
  const [concatW, setConcatW] = useState<string>('ab');
  const [concatV, setConcatV] = useState<string>('bb');
  const [sigmaPowerN, setSigmaPowerN] = useState<number>(2);
  const [sigmaStarMaxLen, setSigmaStarMaxLen] = useState<number>(3);

  // Parse alphabet string with safe error handling
  const { parsedAlphabet, alphabetError } = useMemo(() => {
    try {
      const parsed = parseAlphabet(alphabetInput);
      return { parsedAlphabet: parsed, alphabetError: null };
    } catch (err) {
      return {
        parsedAlphabet: ['a', 'b'],
        alphabetError: err instanceof Error ? err.message : 'Alfabet tidak valid.',
      };
    }
  }, [alphabetInput]);

  // Validate test string against current alphabet
  const isStringValid = useMemo(() => {
    return isValidString(testString, parsedAlphabet);
  }, [testString, parsedAlphabet]);

  const stringLen = useMemo(() => {
    return getStringLength(testString);
  }, [testString]);

  // Compute concatenated results
  const concatWV = useMemo(() => concat(concatW, concatV), [concatW, concatV]);
  const concatVW = useMemo(() => concat(concatV, concatW), [concatW, concatV]);
  const isCommutative = concatWV === concatVW;

  // Generate Sigma^n and Sigma* sequences
  const generatedSigmaN = useMemo(() => {
    if (parsedAlphabet.length === 0) return [];
    return sigmaN(parsedAlphabet, sigmaPowerN);
  }, [parsedAlphabet, sigmaPowerN]);

  const generatedSigmaStar = useMemo(() => {
    if (parsedAlphabet.length === 0) return [];
    return sigmaStar(parsedAlphabet, sigmaStarMaxLen);
  }, [parsedAlphabet, sigmaStarMaxLen]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Alfabet & String Playground"
      subtitle="Level 1: Eksplorasi formal alfabet Σ, operasi string, konkatenasi, dan generator Σ*"
      width="lg"
    >
      {/* 1. Alphabet Definition */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">1. Definisi Alfabet (Σ)</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
            {formatAlphabet(parsedAlphabet)}
          </span>
        </div>

        <div>
          <label htmlFor="alphabet-input-field" className="block text-xs text-slate-300 mb-1.5">
            Daftar simbol dipisah koma (contoh: a, b atau 0, 1):
          </label>
          <Input
            id="alphabet-input-field"
            value={alphabetInput}
            onChange={(e) => setAlphabetInput(e.target.value)}
            placeholder="a, b"
            error={!!alphabetError}
          />
          {alphabetError ? (
            <p className="flex items-center gap-1.5 text-xs text-rose-300 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{alphabetError} Menggunakan fallback {formatAlphabet(parsedAlphabet)}.</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Simbol terdaftar:{' '}
              {parsedAlphabet.map((symbol) => (
                <span
                  key={symbol}
                  className="inline-block px-1.5 py-0.5 mx-0.5 text-xs bg-slate-800 rounded font-mono text-slate-200 border border-slate-700"
                >
                  {symbol}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 mr-1">Preset cepat:</span>
          {PRESET_OPTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setAlphabetInput(item.value)}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/80"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. String Validation & Length */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            2. Validasi String & Panjang |w|
          </h3>
          <Badge variant={isStringValid ? 'accepted' : 'rejected'}>
            {isStringValid ? 'Valid (w ∈ Σ*)' : 'Tidak Valid (simbol di luar Σ)'}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="test-string-input" className="text-xs text-slate-300">
              Input string w:
            </label>
            <button
              type="button"
              onClick={() => setTestString('ε')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Set string kosong (ε)
            </button>
          </div>
          <Input
            id="test-string-input"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Contoh: abba atau ε"
            error={!isStringValid}
          />
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Pemecahan karakter:</span>
            <span>
              Panjang: <strong className="text-cyan-300 font-mono">|w| = {stringLen}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 min-h-8">
            {testString === '' || testString === 'ε' ? (
              <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-cyan-950 text-cyan-200 border border-cyan-800">
                ε (String Kosong, |w| = 0)
              </span>
            ) : (
              Array.from(testString).map((char, idx) => {
                const charValid = parsedAlphabet.includes(char);
                return (
                  <span
                    key={`${char}-${idx}`}
                    className={`px-2 py-0.5 text-xs font-mono rounded border ${
                      charValid
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-rose-950 text-rose-200 border-rose-700'
                    }`}
                    title={charValid ? `Simbol valid '${char}'` : `Simbol '${char}' tidak terdaftar di Σ`}
                  >
                    {char}
                  </span>
                );
              })
            )}
          </div>

          {!isStringValid && (
            <p className="text-xs text-rose-300 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Karakter berlatar merah bukan bagian dari alfabet {formatAlphabet(parsedAlphabet)}.</span>
            </p>
          )}
        </div>
      </section>

      {/* 3. Concatenation Operations */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">3. Operasi Konkatenasi (w · v)</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="concat-w-field" className="block text-xs text-slate-300 mb-1">
              String w:
            </label>
            <Input
              id="concat-w-field"
              value={concatW}
              onChange={(e) => setConcatW(e.target.value)}
              placeholder="w"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label htmlFor="concat-v-field" className="block text-xs text-slate-300 mb-1">
              String v:
            </label>
            <Input
              id="concat-v-field"
              value={concatV}
              onChange={(e) => setConcatV(e.target.value)}
              placeholder="v"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Hasil w · v:</span>
            <code className="text-cyan-300 font-mono font-medium">
              &quot;{formatStringDisplay(concatW)}&quot; · &quot;{formatStringDisplay(concatV)}&quot; = &quot;{formatStringDisplay(concatWV)}&quot;
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Hasil v · w:</span>
            <code className="text-cyan-300 font-mono font-medium">
              &quot;{formatStringDisplay(concatV)}&quot; · &quot;{formatStringDisplay(concatW)}&quot; = &quot;{formatStringDisplay(concatVW)}&quot;
            </code>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Status Komutatif:</span>
            <span
              className={`font-semibold ${
                isCommutative ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isCommutative ? 'Sama (Komutatif)' : 'Berbeda (Non-komutatif)'}
            </span>
          </div>

          <div className="pt-1 text-slate-400 text-xs">
            Hukum identitas string: <code className="text-slate-300 font-mono">w · ε = {formatStringDisplay(concat(concatW, ''))} = w</code>
          </div>
        </div>
      </section>

      {/* 4. Sigma^n Generator */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            4. Generator Σⁿ (Panjang tepat n)
          </h3>
          <div className="flex items-center gap-1.5" role="group" aria-label="Pilih nilai n">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSigmaPowerN(num)}
                aria-pressed={sigmaPowerN === num}
                className={`w-7 h-7 text-xs font-mono rounded font-semibold transition-colors ${
                  sigmaPowerN === num
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-300">
          Kombinasi panjang {sigmaPowerN} ({parsedAlphabet.length}<sup>{sigmaPowerN}</sup> ={' '}
          {generatedSigmaN.length} string):
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-slate-900 border border-slate-800">
          {generatedSigmaN.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-cyan-300 border border-slate-700"
            >
              {formatStringDisplay(item)}
            </span>
          ))}
        </div>
      </section>

      {/* 5. Sigma* Generator */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            5. Generator Σ* (Panjang ≤ k)
          </h3>
          <div className="flex items-center gap-1.5" role="group" aria-label="Pilih nilai k">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSigmaStarMaxLen(num)}
                aria-pressed={sigmaStarMaxLen === num}
                className={`w-7 h-7 text-xs font-mono rounded font-semibold transition-colors ${
                  sigmaStarMaxLen === num
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-300">
          Total: <strong className="text-cyan-300 font-mono">{generatedSigmaStar.length}</strong>{' '}
          string (panjang 0 sampai {sigmaStarMaxLen})
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          {generatedSigmaStar.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className={`px-2 py-0.5 text-xs font-mono rounded border ${
                item === ''
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-800 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
              }`}
            >
              {formatStringDisplay(item)}
            </span>
          ))}
        </div>
      </section>

      <div className="pt-2 flex justify-end">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup Panel
        </Button>
      </div>
    </Drawer>
  );
}
