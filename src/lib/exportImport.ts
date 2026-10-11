import { toPng } from 'html-to-image';
import type { DFA, State, Symbol } from '@/core/types';

/**
 * Validates and parses a raw JSON string into a valid DFA object.
 */
export function parseDFAJSON(jsonContent: string): {
  success: boolean;
  dfa?: DFA;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File JSON tidak valid atau bukan objek.' };
    }

    if (!Array.isArray(parsed.states) || parsed.states.length === 0) {
      return { success: false, error: 'DFA harus memiliki himpunan states (Q) yang tidak kosong.' };
    }

    if (!Array.isArray(parsed.alphabet) || parsed.alphabet.length === 0) {
      return {
        success: false,
        error: 'DFA harus memiliki himpunan alfabet (Σ) yang tidak kosong.',
      };
    }

    const start = parsed.startState || parsed.start;
    if (typeof start !== 'string' || !start) {
      return { success: false, error: 'DFA harus mendefinisikan state awal (start/startState).' };
    }

    const rawAccept = parsed.acceptStates || parsed.accepting || [];
    if (!Array.isArray(rawAccept)) {
      return { success: false, error: 'Accept states (F) harus berupa array of strings.' };
    }

    if (!parsed.transitions || typeof parsed.transitions !== 'object') {
      return { success: false, error: 'Tabel transisi (δ) harus berupa objek.' };
    }

    const normalizedTransitions: Record<State, Record<Symbol, State>> = {};
    for (const state of parsed.states) {
      normalizedTransitions[state] = {};
      const stateTrans = parsed.transitions[state];
      if (stateTrans && typeof stateTrans === 'object') {
        for (const [sym, target] of Object.entries(stateTrans)) {
          if (typeof target === 'string') {
            normalizedTransitions[state][sym] = target;
          }
        }
      }
    }

    const normalizedDFA: DFA = {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'DFA Tanpa Nama',
      states: parsed.states.map((s: unknown) => String(s)),
      alphabet: parsed.alphabet.map((a: unknown) => String(a)),
      transitions: normalizedTransitions,
      startState: String(start),
      start: String(start),
      acceptStates: rawAccept.map((a: unknown) => String(a)),
      accepting: rawAccept.map((a: unknown) => String(a)),
    };

    return { success: true, dfa: normalizedDFA };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal membaca format JSON.',
    };
  }
}

/**
 * Downloads a DFA configuration object as a formatted JSON file.
 */
export function exportDFAAsJSON(dfa: DFA): void {
  const cleanName = (dfa.name || 'automaton').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `otomata_${cleanName}.json`;

  const blob = new Blob([JSON.stringify(dfa, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Captures an HTML element as PNG and triggers download.
 */
export async function exportCanvasAsPNG(
  element: HTMLElement,
  baseFilename: string = 'automaton_canvas',
): Promise<void> {
  const cleanName = baseFilename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `${cleanName}.png`;

  const dataUrl = await toPng(element, {
    backgroundColor: '#020617', // slate-950
    cacheBust: true,
    quality: 0.95,
    filter: (node) => {
      // Exclude overlay UI controls that might be rendered inside canvas container
      if (node instanceof HTMLElement && node.classList.contains('react-flow__panel')) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
