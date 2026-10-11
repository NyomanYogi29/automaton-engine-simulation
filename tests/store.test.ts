import { beforeEach, describe, expect, it } from 'vitest';
import { endsWithOneDFA, startsWithADFA } from '@/core/presets';
import { useAutomatonStore } from '@/store/useAutomatonStore';

describe('useAutomatonStore', () => {
  beforeEach(() => {
    useAutomatonStore.getState().setDFA(endsWithOneDFA);
  });

  describe('initialization and preset loading', () => {
    it('initializes with default DFA and synchronized graph nodes/edges', () => {
      const state = useAutomatonStore.getState();
      expect(state.dfa.name).toBe('Diakhiri 1');
      expect(state.nodes).toHaveLength(2);
      expect(state.edges.length).toBeGreaterThan(0);
      expect(state.validationIssues).toHaveLength(0);
    });

    it('loads preset DFA correctly and regenerates graph elements', () => {
      const store = useAutomatonStore.getState();
      store.loadPreset('Diawali a');

      const updated = useAutomatonStore.getState();
      expect(updated.dfa.name).toContain('Diawali a');
      expect(updated.nodes).toHaveLength(3);
      expect(updated.nodes.find((n) => n.id === 'q2')).toBeDefined();
    });
  });

  describe('state manipulations', () => {
    it('adds new state and creates corresponding node on canvas', () => {
      const store = useAutomatonStore.getState();
      store.addState('q2', { x: 300, y: 300 });

      const updated = useAutomatonStore.getState();
      expect(updated.dfa.states).toContain('q2');
      const node = updated.nodes.find((n) => n.id === 'q2');
      expect(node).toBeDefined();
      expect(node?.position).toEqual({ x: 300, y: 300 });
    });

    it('removes state and cleans up referencing transitions and canvas node', () => {
      const store = useAutomatonStore.getState();
      store.setDFA(startsWithADFA);
      store.removeState('q2');

      const updated = useAutomatonStore.getState();
      expect(updated.dfa.states).not.toContain('q2');
      expect(updated.nodes.find((n) => n.id === 'q2')).toBeUndefined();
      expect(updated.dfa.transitions.q0.b).toBeUndefined();
    });

    it('renames state and cascades update across transitions and nodes', () => {
      const store = useAutomatonStore.getState();
      store.renameState('q0', 'qStart');

      const updated = useAutomatonStore.getState();
      expect(updated.dfa.states).toContain('qStart');
      expect(updated.dfa.states).not.toContain('q0');
      expect(updated.dfa.startState).toBe('qStart');
      expect(updated.nodes.find((n) => n.id === 'qStart')).toBeDefined();
    });

    it('toggles accept state status and updates node data', () => {
      const store = useAutomatonStore.getState();
      store.toggleAcceptState('q0');

      let updated = useAutomatonStore.getState();
      expect(updated.dfa.acceptStates).toContain('q0');
      expect(updated.nodes.find((n) => n.id === 'q0')?.data.isAccept).toBe(true);

      store.toggleAcceptState('q0');
      updated = useAutomatonStore.getState();
      expect(updated.dfa.acceptStates).not.toContain('q0');
      expect(updated.nodes.find((n) => n.id === 'q0')?.data.isAccept).toBe(false);
    });
  });

  describe('transitions and bidirectional synchronization', () => {
    it('sets transition and merges multiple symbols on a single edge', () => {
      const store = useAutomatonStore.getState();
      store.setTransition('q0', '0', 'q1');
      store.setTransition('q0', '1', 'q1');

      const updated = useAutomatonStore.getState();
      const edge = updated.edges.find((e) => e.source === 'q0' && e.target === 'q1');
      expect(edge).toBeDefined();
      expect(edge?.data?.symbols).toEqual(['0', '1']);
      expect(edge?.label).toBe('0, 1');
      expect(edge?.type).toBe('automatonEdge');

      // Check self-loop edge type
      const selfLoopEdge = updated.edges.find((e) => e.source === e.target);
      if (selfLoopEdge) {
        expect(selfLoopEdge.type).toBe('selfLoop');
      }
    });

    it('identifies bidirectional transitions between node pairs', () => {
      const store = useAutomatonStore.getState();
      store.setTransition('q0', '0', 'q1');
      store.setTransition('q1', '0', 'q0');

      const updated = useAutomatonStore.getState();
      const fwd = updated.edges.find((e) => e.source === 'q0' && e.target === 'q1');
      const bwd = updated.edges.find((e) => e.source === 'q1' && e.target === 'q0');

      expect(fwd?.data?.isBidirectional).toBe(true);
      expect(bwd?.data?.isBidirectional).toBe(true);
    });


    it('automatically fills empty cells with dead state qDead', () => {
      const store = useAutomatonStore.getState();
      store.addState('qNew');
      expect(useAutomatonStore.getState().validationIssues.length).toBeGreaterThan(0);

      store.fillEmptyTransitionsWithDeadState();
      const updated = useAutomatonStore.getState();
      expect(updated.dfa.states).toContain('qDead');
      expect(updated.dfa.transitions.qNew['0']).toBe('qDead');
      expect(updated.dfa.transitions.qNew['1']).toBe('qDead');
      expect(updated.dfa.transitions.qDead['0']).toBe('qDead');
      expect(updated.dfa.transitions.qDead['1']).toBe('qDead');
      expect(updated.validationIssues).toHaveLength(0);
    });
  });

  describe('simulation lifecycle', () => {
    it('precomputes trace and handles step-by-step navigation', () => {
      const store = useAutomatonStore.getState();
      store.setSimulationInput('101');

      let state = useAutomatonStore.getState();
      expect(state.simulation.input).toBe('101');
      expect(state.simulation.currentStepIndex).toBe(0);
      expect(state.simulation.trace?.accepted).toBe(true);
      expect(state.nodes.find((n) => n.id === 'q0')?.data.isActive).toBe(true);

      store.stepForward();
      state = useAutomatonStore.getState();
      expect(state.simulation.currentStepIndex).toBe(1);
      expect(state.nodes.find((n) => n.id === 'q1')?.data.isActive).toBe(true);

      store.stepForward();
      state = useAutomatonStore.getState();
      expect(state.simulation.currentStepIndex).toBe(2);
      expect(state.nodes.find((n) => n.id === 'q0')?.data.isActive).toBe(true);

      store.stepForward();
      state = useAutomatonStore.getState();
      expect(state.simulation.currentStepIndex).toBe(3);
      expect(state.simulation.status).toBe('ACCEPTED');

      store.stepBackward();
      state = useAutomatonStore.getState();
      expect(state.simulation.currentStepIndex).toBe(2);

      store.resetSimulation();
      state = useAutomatonStore.getState();
      expect(state.simulation.currentStepIndex).toBe(0);
      expect(state.simulation.status).toBe('IDLE');
    });

    it('marks status as INVALID_INPUT when string contains outside symbol', () => {
      const store = useAutomatonStore.getState();
      store.setSimulationInput('102');

      const state = useAutomatonStore.getState();
      expect(state.simulation.status).toBe('INVALID_INPUT');
      expect(state.simulation.trace?.error).toBeDefined();
    });
  });
});
