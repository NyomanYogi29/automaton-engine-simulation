import { create } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import {
  findDeadStates,
  getAcceptStates,
  getStartState,
  run,
  validateDFA,
} from "@/core/dfa";
import { endsWithOneDFA, PRESET_DFAS } from "@/core/presets";
import type {
  DFA,
  RunResult,
  SimulationStatus,
  State,
  Symbol,
  ValidationIssue,
} from "@/core/types";

export interface AutomatonNodeData extends Record<string, unknown> {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  isActive?: boolean;
}

export interface AutomatonEdgeData extends Record<string, unknown> {
  symbols: string[];
  isActive?: boolean;
  isBidirectional?: boolean;
}


export interface SimulationState {
  input: string;
  status: SimulationStatus;
  currentStepIndex: number;
  trace: RunResult | null;
  playbackSpeed: number;
  isPlaying: boolean;
}

export interface AutomatonStore {
  dfa: DFA;
  nodes: Node<AutomatonNodeData>[];
  edges: Edge<AutomatonEdgeData>[];
  validationIssues: ValidationIssue[];
  simulation: SimulationState;

  // DFA Mutations
  setDFA: (dfa: DFA) => void;
  loadPreset: (name: string) => void;
  addState: (stateName?: string, position?: { x: number; y: number }) => void;
  removeState: (stateName: string) => void;
  renameState: (oldName: string, newName: string) => void;
  setStartState: (stateName: string) => void;
  toggleAcceptState: (stateName: string) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setTransition: (from: State, symbol: Symbol, to: State) => void;
  fillEmptyTransitionsWithDeadState: () => void;

  // React Flow Handlers
  onNodesChange: (changes: NodeChange<Node<AutomatonNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<AutomatonEdgeData>>[]) => void;
  onConnect: (connection: Connection) => void;

  // Simulation Controls
  setSimulationInput: (input: string) => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetSimulation: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

function calculateDefaultPosition(
  index: number,
  total: number,
  isDeadState: boolean = false,
): { x: number; y: number } {
  if (isDeadState) {
    return { x: 260, y: 380 };
  }

  if (total <= 4) {
    return {
      x: 100 + index * 180,
      y: 200,
    };
  }

  const radius = 160;
  const centerX = 340;
  const centerY = 240;
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;

  return {
    x: Math.round(centerX + radius * Math.cos(angle)),
    y: Math.round(centerY + radius * Math.sin(angle)),
  };
}

function generateGraphElements(
  dfa: DFA,
  existingNodes: Node<AutomatonNodeData>[] = [],
  activeStateId?: string,
  activeEdgeKey?: string,
): { nodes: Node<AutomatonNodeData>[]; edges: Edge<AutomatonEdgeData>[] } {
  const existingPosMap = new Map<string, { x: number; y: number }>();
  for (const n of existingNodes) {
    existingPosMap.set(n.id, n.position);
  }

  const startState = getStartState(dfa);
  const acceptStates = getAcceptStates(dfa);
  const deadStates = new Set(findDeadStates(dfa));

  const nodes: Node<AutomatonNodeData>[] = dfa.states.map((state, index) => {
    const isDead = deadStates.has(state);
    const pos =
      existingPosMap.get(state) ||
      calculateDefaultPosition(index, dfa.states.length, isDead);

    return {
      id: state,
      type: "automatonState",
      position: pos,
      data: {
        label: state,
        isStart: state === startState,
        isAccept: acceptStates.includes(state),
        isActive: state === activeStateId,
      },
    };
  });

  const transitionPairMap = new Map<string, Set<string>>();

  for (const from of dfa.states) {
    const fromTransitions = dfa.transitions[from] || {};
    for (const symbol of dfa.alphabet) {
      const to = fromTransitions[symbol];
      if (to && dfa.states.includes(to)) {
        const key = `${from}->${to}`;
        if (!transitionPairMap.has(key)) {
          transitionPairMap.set(key, new Set());
        }
        transitionPairMap.get(key)!.add(symbol);
      }
    }
  }

  const edges: Edge<AutomatonEdgeData>[] = [];

  for (const [key, symbolSet] of transitionPairMap.entries()) {
    const [source, target] = key.split("->");
    const sortedSymbols = Array.from(symbolSet).sort();
    const isCurrentActive = activeEdgeKey === key;
    const isSelfLoop = source === target;
    const isBidirectional =
      !isSelfLoop && transitionPairMap.has(`${target}->${source}`);

    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      type: isSelfLoop ? "selfLoop" : "automatonEdge",
      label: sortedSymbols.join(", "),
      data: {
        symbols: sortedSymbols,
        isActive: isCurrentActive,
        isBidirectional,
      },
    });
  }


  return { nodes, edges };
}

export const useAutomatonStore = create<AutomatonStore>((set, get) => {
  const initialDFA = endsWithOneDFA;
  const initialIssues = validateDFA(initialDFA);
  const { nodes: initialNodes, edges: initialEdges } =
    generateGraphElements(initialDFA);

  return {
    dfa: initialDFA,
    nodes: initialNodes,
    edges: initialEdges,
    validationIssues: initialIssues,
    simulation: {
      input: "",
      status: "IDLE",
      currentStepIndex: 0,
      trace: null,
      playbackSpeed: 1000,
      isPlaying: false,
    },

    setDFA: (newDFA: DFA) => {
      const issues = validateDFA(newDFA);
      const { nodes, edges } = generateGraphElements(newDFA, get().nodes);
      set({
        dfa: newDFA,
        nodes,
        edges,
        validationIssues: issues,
        simulation: {
          input: "",
          status: "IDLE",
          currentStepIndex: 0,
          trace: null,
          playbackSpeed: get().simulation.playbackSpeed,
          isPlaying: false,
        },
      });
    },

    loadPreset: (nameOrId: string) => {
      const found =
        PRESET_DFAS.find((p) => p.name === nameOrId) ||
        PRESET_DFAS.find((p) =>
          p.name.toLowerCase().includes(nameOrId.toLowerCase()),
        );

      if (found) {
        get().setDFA(found);
      }
    },

    addState: (stateName?: string, position?: { x: number; y: number }) => {
      const { dfa, nodes } = get();
      let name = stateName?.trim();

      if (!name) {
        let counter = dfa.states.length;
        name = `q${counter}`;
        while (dfa.states.includes(name)) {
          counter++;
          name = `q${counter}`;
        }
      }

      if (dfa.states.includes(name)) {
        return;
      }

      const newStates = [...dfa.states, name];
      const newTransitions = { ...dfa.transitions, [name]: {} };

      const updatedDFA: DFA = {
        ...dfa,
        states: newStates,
        startState: dfa.startState || name,
        start: dfa.start || name,
        transitions: newTransitions,
      };

      const existingNodesWithNew = position
        ? [
            ...nodes,
            {
              id: name,
              type: "automatonState",
              position,
              data: {
                label: name,
                isStart: updatedDFA.startState === name,
                isAccept: false,
              },
            },
          ]
        : nodes;

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        updatedDFA,
        existingNodesWithNew,
      );

      set({
        dfa: updatedDFA,
        nodes: syncedNodes,
        edges: syncedEdges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    removeState: (stateName: string) => {
      const { dfa, nodes } = get();
      if (!dfa.states.includes(stateName)) {
        return;
      }

      const newStates = dfa.states.filter((s) => s !== stateName);
      const newAccept = getAcceptStates(dfa).filter((s) => s !== stateName);
      let newStart = getStartState(dfa);

      if (newStart === stateName) {
        newStart = newStates[0] || "";
      }

      const newTransitions: DFA["transitions"] = {};
      for (const [q, trans] of Object.entries(dfa.transitions)) {
        if (q === stateName) continue;
        const filteredTrans: Record<string, string> = {};
        for (const [sym, target] of Object.entries(trans)) {
          if (target !== stateName) {
            filteredTrans[sym] = target;
          }
        }
        newTransitions[q] = filteredTrans;
      }

      const updatedDFA: DFA = {
        ...dfa,
        states: newStates,
        startState: newStart,
        start: newStart,
        acceptStates: newAccept,
        accepting: newAccept,
        transitions: newTransitions,
      };

      const filteredNodes = nodes.filter((n) => n.id !== stateName);
      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        updatedDFA,
        filteredNodes,
      );

      set({
        dfa: updatedDFA,
        nodes: syncedNodes,
        edges: syncedEdges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    renameState: (oldName: string, newName: string) => {
      const cleanNew = newName.trim();
      const { dfa, nodes } = get();

      if (!cleanNew || oldName === cleanNew || dfa.states.includes(cleanNew)) {
        return;
      }

      const newStates = dfa.states.map((s) => (s === oldName ? cleanNew : s));
      const newStart =
        getStartState(dfa) === oldName ? cleanNew : getStartState(dfa);
      const newAccept = getAcceptStates(dfa).map((s) =>
        s === oldName ? cleanNew : s,
      );

      const newTransitions: DFA["transitions"] = {};
      for (const [q, trans] of Object.entries(dfa.transitions)) {
        const src = q === oldName ? cleanNew : q;
        const updatedTargetTrans: Record<string, string> = {};
        for (const [sym, target] of Object.entries(trans)) {
          updatedTargetTrans[sym] = target === oldName ? cleanNew : target;
        }
        newTransitions[src] = updatedTargetTrans;
      }

      const updatedDFA: DFA = {
        ...dfa,
        states: newStates,
        startState: newStart,
        start: newStart,
        acceptStates: newAccept,
        accepting: newAccept,
        transitions: newTransitions,
      };

      const renamedNodes = nodes.map((n) =>
        n.id === oldName ? { ...n, id: cleanNew } : n,
      );

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        updatedDFA,
        renamedNodes,
      );

      set({
        dfa: updatedDFA,
        nodes: syncedNodes,
        edges: syncedEdges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    setStartState: (stateName: string) => {
      const { dfa } = get();
      if (!dfa.states.includes(stateName)) {
        return;
      }

      const updatedDFA: DFA = {
        ...dfa,
        startState: stateName,
        start: stateName,
      };

      const { nodes, edges } = generateGraphElements(updatedDFA, get().nodes);
      set({
        dfa: updatedDFA,
        nodes,
        edges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    toggleAcceptState: (stateName: string) => {
      const { dfa } = get();
      if (!dfa.states.includes(stateName)) {
        return;
      }

      const currentAccept = getAcceptStates(dfa);
      const isCurrentlyAccept = currentAccept.includes(stateName);
      const nextAccept = isCurrentlyAccept
        ? currentAccept.filter((s) => s !== stateName)
        : [...currentAccept, stateName];

      const updatedDFA: DFA = {
        ...dfa,
        acceptStates: nextAccept,
        accepting: nextAccept,
      };

      const { nodes, edges } = generateGraphElements(updatedDFA, get().nodes);
      set({
        dfa: updatedDFA,
        nodes,
        edges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    addSymbol: (symbol: string) => {
      const clean = symbol.trim();
      const { dfa } = get();

      if (!clean || dfa.alphabet.includes(clean)) {
        return;
      }

      const updatedDFA: DFA = {
        ...dfa,
        alphabet: [...dfa.alphabet, clean],
      };

      const { nodes, edges } = generateGraphElements(updatedDFA, get().nodes);
      set({
        dfa: updatedDFA,
        nodes,
        edges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    removeSymbol: (symbol: string) => {
      const { dfa } = get();
      if (!dfa.alphabet.includes(symbol)) {
        return;
      }

      const newAlphabet = dfa.alphabet.filter((s) => s !== symbol);
      const newTransitions: DFA["transitions"] = {};

      for (const [q, trans] of Object.entries(dfa.transitions)) {
        const filteredTrans: Record<string, string> = {};
        for (const [sym, target] of Object.entries(trans)) {
          if (sym !== symbol) {
            filteredTrans[sym] = target;
          }
        }
        newTransitions[q] = filteredTrans;
      }

      const updatedDFA: DFA = {
        ...dfa,
        alphabet: newAlphabet,
        transitions: newTransitions,
      };

      const { nodes, edges } = generateGraphElements(updatedDFA, get().nodes);
      set({
        dfa: updatedDFA,
        nodes,
        edges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    setTransition: (from: State, symbol: Symbol, to: State) => {
      const { dfa } = get();
      if (!dfa.states.includes(from) || !dfa.alphabet.includes(symbol)) {
        return;
      }

      const currentFromTrans = dfa.transitions[from] || {};
      const newFromTrans = { ...currentFromTrans };

      if (!to) {
        delete newFromTrans[symbol];
      } else {
        newFromTrans[symbol] = to;
      }

      const updatedDFA: DFA = {
        ...dfa,
        transitions: {
          ...dfa.transitions,
          [from]: newFromTrans,
        },
      };

      const { nodes, edges } = generateGraphElements(updatedDFA, get().nodes);
      set({
        dfa: updatedDFA,
        nodes,
        edges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    fillEmptyTransitionsWithDeadState: () => {
      const { dfa, nodes } = get();
      let deadStateName = "qDead";

      if (dfa.states.includes(deadStateName)) {
        const deadStates = findDeadStates(dfa);
        if (deadStates.length > 0) {
          deadStateName = deadStates[0];
        } else {
          let count = 1;
          while (dfa.states.includes(`qDead${count}`)) {
            count++;
          }
          deadStateName = `qDead${count}`;
        }
      }

      const stateExists = dfa.states.includes(deadStateName);
      const newStates = stateExists
        ? dfa.states
        : [...dfa.states, deadStateName];

      const newTransitions: DFA["transitions"] = {};
      for (const q of newStates) {
        newTransitions[q] = { ...(dfa.transitions[q] || {}) };
      }

      for (const q of dfa.states) {
        for (const a of dfa.alphabet) {
          if (!newTransitions[q][a]) {
            newTransitions[q][a] = deadStateName;
          }
        }
      }

      for (const a of dfa.alphabet) {
        newTransitions[deadStateName][a] = deadStateName;
      }

      const updatedDFA: DFA = {
        ...dfa,
        states: newStates,
        transitions: newTransitions,
      };

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        updatedDFA,
        nodes,
      );

      set({
        dfa: updatedDFA,
        nodes: syncedNodes,
        edges: syncedEdges,
        validationIssues: validateDFA(updatedDFA),
      });
    },

    onNodesChange: (changes: NodeChange<Node<AutomatonNodeData>>[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes: EdgeChange<Edge<AutomatonEdgeData>>[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection: Connection) => {
      const { source, target } = connection;
      const { dfa } = get();

      if (!source || !target) return;

      const availableSymbol = dfa.alphabet.find(
        (sym) => !dfa.transitions[source]?.[sym],
      );

      if (availableSymbol) {
        get().setTransition(source, availableSymbol, target);
      }
    },

    setSimulationInput: (input: string) => {
      const { dfa, nodes } = get();
      const trace = run(dfa, input);
      const start = getStartState(dfa);

      let status: SimulationStatus = "IDLE";
      if (trace.error) {
        status = "INVALID_INPUT";
      } else if (input === "" || input === "ε") {
        status = trace.accepted ? "ACCEPTED" : "REJECTED";
      }

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        dfa,
        nodes,
        start,
        undefined,
      );

      set({
        nodes: syncedNodes,
        edges: syncedEdges,
        simulation: {
          input,
          status,
          currentStepIndex: 0,
          trace,
          playbackSpeed: get().simulation.playbackSpeed,
          isPlaying: false,
        },
      });
    },

    stepForward: () => {
      const { simulation, dfa, nodes } = get();
      const { trace, currentStepIndex } = simulation;

      if (!trace || trace.error || currentStepIndex >= trace.steps.length) {
        return;
      }

      const nextStepIndex = currentStepIndex + 1;
      const currentStep = trace.steps[currentStepIndex];
      const isAtEnd = nextStepIndex === trace.steps.length;

      let status: SimulationStatus = "RUNNING";
      if (isAtEnd) {
        status = trace.accepted ? "ACCEPTED" : "REJECTED";
      }

      const activeState = currentStep.to;
      const activeEdgeKey = `${currentStep.from}->${currentStep.to}`;

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        dfa,
        nodes,
        activeState,
        activeEdgeKey,
      );

      set({
        nodes: syncedNodes,
        edges: syncedEdges,
        simulation: {
          ...simulation,
          currentStepIndex: nextStepIndex,
          status,
        },
      });
    },

    stepBackward: () => {
      const { simulation, dfa, nodes } = get();
      const { trace, currentStepIndex } = simulation;

      if (!trace || currentStepIndex <= 0) {
        return;
      }

      const prevStepIndex = currentStepIndex - 1;
      let activeState = getStartState(dfa);
      let activeEdgeKey: string | undefined;

      if (prevStepIndex > 0) {
        const prevStep = trace.steps[prevStepIndex - 1];
        activeState = prevStep.to;
        activeEdgeKey = `${prevStep.from}->${prevStep.to}`;
      }

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        dfa,
        nodes,
        activeState,
        activeEdgeKey,
      );

      set({
        nodes: syncedNodes,
        edges: syncedEdges,
        simulation: {
          ...simulation,
          currentStepIndex: prevStepIndex,
          status: "RUNNING",
        },
      });
    },

    resetSimulation: () => {
      const { simulation, dfa, nodes } = get();
      const start = getStartState(dfa);

      const { nodes: syncedNodes, edges: syncedEdges } = generateGraphElements(
        dfa,
        nodes,
        start,
        undefined,
      );

      set({
        nodes: syncedNodes,
        edges: syncedEdges,
        simulation: {
          ...simulation,
          currentStepIndex: 0,
          status: "IDLE",
          isPlaying: false,
        },
      });
    },

    setPlaybackSpeed: (speed: number) => {
      set({
        simulation: {
          ...get().simulation,
          playbackSpeed: speed,
        },
      });
    },

    setIsPlaying: (isPlaying: boolean) => {
      set({
        simulation: {
          ...get().simulation,
          isPlaying,
        },
      });
    },
  };
});
