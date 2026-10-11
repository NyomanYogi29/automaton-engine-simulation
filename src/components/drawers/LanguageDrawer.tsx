import { useState, useMemo } from 'react';
import { PRESET_LANGUAGES, type Language } from '@/core/language';
import { sigmaStar, isValidString, formatStringDisplay } from '@/core/alphabet';
import { Drawer, Button, Input, Badge } from '@/components/common';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export interface LanguageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function getReasonExplanation(langId: string, input: string): string {
  const norm = input === 'ε' ? '' : input;

  if (!isValidString(norm, ['a', 'b'])) {
    return 'String mengandung simbol yang tidak terdaftar pada alfabet {a, b}.';
  }

  switch (langId) {
    case 'starts-with-a':
      if (norm.length === 0) return 'String kosong (ε) tidak memiliki simbol awal a.';
      return norm.startsWith('a')
        ? "Simbol pertama adalah 'a'."
        : `Simbol pertama adalah '${norm[0]}', bukan 'a'.`;

    case 'ends-with-b':
      if (norm.length === 0) return 'String kosong (ε) tidak memiliki simbol akhir b.';
      return norm.endsWith('b')
        ? "Simbol terakhir adalah 'b'."
        : `Simbol terakhir adalah '${norm[norm.length - 1]}', bukan 'b'.`;

    case 'length-exact-2':
      return norm.length === 2
        ? 'Panjang string tepat 2 karakter.'
        : `Panjang string saat ini |w| = ${norm.length}, aturan mensyaratkan tepat 2.`;

    case 'only-b': {
      const nonB = Array.from(norm).find((c) => c !== 'b');
      if (nonB) return `Ditemukan simbol '${nonB}' yang melanggar aturan hanya berisi b.`;
      return 'Semua simbol adalah b (termasuk string kosong).';
    }

    case 'even-a': {
      const countA = (norm.match(/a/g) || []).length;
      return countA % 2 === 0
        ? `Jumlah kemunculan 'a' berjumlah ${countA} (genap).`
        : `Jumlah kemunculan 'a' berjumlah ${countA} (ganjil, aturan mensyaratkan genap).`;
    }

    default:
      return '';
  }
}

export function LanguageDrawer({ isOpen, onClose }: LanguageDrawerProps) {
  const [selectedLangId, setSelectedLangId] = useState<string>(PRESET_LANGUAGES[0].id);
  const [testString, setTestString] = useState<string>('ab');
  const [maxSubsetLength, setMaxSubsetLength] = useState<number>(3);

  const currentLanguage: Language = useMemo(() => {
    return PRESET_LANGUAGES.find((lang) => lang.id === selectedLangId) || PRESET_LANGUAGES[0];
  }, [selectedLangId]);

  const normalizedTestString = useMemo(() => {
    return testString === 'ε' ? '' : testString;
  }, [testString]);

  const isAccepted = useMemo(() => {
    return currentLanguage.accepts(normalizedTestString);
  }, [currentLanguage, normalizedTestString]);

  const explanation = useMemo(() => {
    return getReasonExplanation(currentLanguage.id, testString);
  }, [currentLanguage.id, testString]);

  const sigmaStarList = useMemo(() => {
    return sigmaStar(currentLanguage.sigma, maxSubsetLength);
  }, [currentLanguage.sigma, maxSubsetLength]);

  const acceptedSubset = useMemo(() => {
    return sigmaStarList.filter((w) => currentLanguage.accepts(w));
  }, [sigmaStarList, currentLanguage]);

  const acceptedPercentage = useMemo(() => {
    if (sigmaStarList.length === 0) return 0;
    return Math.round((acceptedSubset.length / sigmaStarList.length) * 100);
  }, [acceptedSubset.length, sigmaStarList.length]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Pemeriksaan Bahasa (Language Checker)"
      subtitle="Level 2: Pengujian keanggotaan string terhadap aturan bahasa formal dan subset visual Σ*"
      width="lg"
    >
      {/* 1. Language Rules Selection */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">1. Pilih Aturan Bahasa (L)</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
            Σ = &#123;{currentLanguage.sigma.join(', ')}&#125;
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Aturan bahasa">
          {PRESET_LANGUAGES.map((lang) => {
            const isSelected = lang.id === currentLanguage.id;
            return (
              <button
                key={lang.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedLangId(lang.id)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/80 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{lang.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{lang.description}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. String Membership Test */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">2. Uji Keanggotaan String</h3>
          <Badge variant={isAccepted ? 'accepted' : 'rejected'}>
            {isAccepted ? 'Anggota L' : 'Bukan Anggota L'}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="language-test-string" className="text-xs text-slate-300">
              Input string w atas &#123;{currentLanguage.sigma.join(', ')}&#125;:
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
            id="language-test-string"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Masukkan string, misal: ab atau bbb"
          />
        </div>

        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 ${
            isAccepted
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-semibold text-slate-100">
              String &quot;{formatStringDisplay(testString)}&quot; {isAccepted ? 'adalah anggota' : 'bukan anggota'} bahasa &quot;{currentLanguage.name}&quot;
            </div>
            <div className="text-slate-300 leading-relaxed">{explanation}</div>
          </div>
        </div>
      </section>

      {/* 3. Visualization: L is a subset of Sigma* */}
      <section className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            3. Visualisasi L ⊆ Σ* (Subset Anggota)
          </h3>
          <div className="flex items-center gap-1.5" role="group" aria-label="Pilih kedalaman k">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxSubsetLength(num)}
                aria-pressed={maxSubsetLength === num}
                className={`w-7 h-7 text-xs font-mono rounded font-semibold transition-colors ${
                  maxSubsetLength === num
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>
            Anggota L: <strong className="text-emerald-300 font-mono">{acceptedSubset.length}</strong> dari{' '}
            <strong className="text-slate-200 font-mono">{sigmaStarList.length}</strong> total string Σ* (≤ {maxSubsetLength})
          </span>
          <span className="font-mono text-cyan-300">{acceptedPercentage}% terisi</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-600 inline-block" />
            <span>Anggota L</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block" />
            <span>Bukan Anggota</span>
          </div>
        </div>

        {/* String Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          {sigmaStarList.map((item, idx) => {
            const member = currentLanguage.accepts(item);
            return (
              <span
                key={`${item}-${idx}`}
                className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                  member
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-700 font-medium'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title={member ? `'${formatStringDisplay(item)}' adalah anggota L` : `'${formatStringDisplay(item)}' bukan anggota L`}
              >
                {formatStringDisplay(item)}
              </span>
            );
          })}
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
