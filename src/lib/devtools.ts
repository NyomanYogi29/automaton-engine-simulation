import type { DFA, SimulationTrace } from '@/core/types';
import { logger } from '@/lib/logger';

export interface AutomatanDevTools {
  getDFA?: () => DFA | null;
  testString?: (input: string) => SimulationTrace | null;
  dumpState?: () => Record<string, unknown>;
  version: string;
}

declare global {
  interface Window {
    __OTOMATA_DEBUG__?: AutomatanDevTools;
  }
}

export function registerDevTools(tools: Partial<AutomatanDevTools>) {
  if (!import.meta.env.DEV) return;

  window.__OTOMATA_DEBUG__ = {
    version: '1.0.0',
    ...window.__OTOMATA_DEBUG__,
    ...tools,
  };

  logger.info('core', 'DevTools registered at window.__OTOMATA_DEBUG__');
}
