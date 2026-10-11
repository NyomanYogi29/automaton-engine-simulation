# Otomata Lab

An interactive web application for the simulation, formal verification, and visualization of formal language theory and automata (DFA and NFA). Built with a **Canvas-First Workspace** architecture, Otomata Lab features bidirectional synchronization between an interactive `@xyflow/react` state diagram canvas and a formal transition table matrix.

---

## Key Features

### 1. Alphabet & String Playground (Level 1)

- **Formal Alphabet Definition ($\Sigma$):** Set notation input with automatic validation rejecting duplicates and empty tokens. Supports single-character and multi-character symbols (e.g. `0, 1`, `a, b`, `x, y`, or coin systems like `5, 10, 25`).
- **String Validation:** Real-time detection of string validity ($w \in \Sigma^*$) with highlighting for unrecognized symbols.
- **Length & Concatenation:** String length evaluation ($|w|$), demonstration of non-commutativity ($w \cdot v \ne v \cdot w$), and empty string identity law ($w \cdot \varepsilon = w$).
- **$\Sigma^n$ & $\Sigma^*$ Generator:** Generates exact length combinations ($\Sigma^n$) and ordered Kleene star series ($\Sigma^*$).

### 2. Formal Language Checker (Level 2)

- **5 Built-In Language Presets:**
  1. Starts with symbol 'a'
  2. Ends with symbol 'b'
  3. String length of exactly 2 ($|w| = 2$)
  4. Contains only symbol 'b' ($w \in \{b\}^*$)
  5. Even number of 'a' symbols
- **String Membership Testing:** Deterministic membership checking with step-by-step formal verification explanations.
- **Subset Visualization ($L \subseteq \Sigma^*$):** Visual mapping of language members within $\Sigma^*$ up to length $k$, complete with subset coverage ratios.

### 3. DFA Engine & Interactive Canvas (Level 3 & 4)

- **Formal 5-Tuple Representation:** $M = (Q, \Sigma, \delta, q_0, F)$ with completeness and determinism validation.
- **Two-Way Synchronization:** Modifying the transition table immediately updates canvas nodes and transitions, and interacting with the canvas updates the transition table matrix in real time.
- **Precision Edge Rendering:**
  - Dedicated self-loop transitions tightly anchored to the top perimeter of state nodes.
  - Symmetrical outward curves for bidirectional edges ($A \to B$ and $B \to A$) that eliminate overlapping.
  - Snappy grid snapping (`20x20`) for clean state alignment.
- **Dynamic State Management:**
  - Inline state renaming directly inside the transition table.
  - Automatic reclamation of the lowest available state index (e.g. reclaiming $q_0$ if deleted).
  - Ability to start from a blank canvas (_"Kanvas Kosong"_) or reset the canvas at any time.
- **Step-by-Step Simulation:**
  - Visual string tape supporting single and multi-character tokens (with space/comma splitting and greedy longest-prefix matching).
  - Step forward, step backward, auto-play with adjustable speed, and active state glow animations.
  - Confetti celebration upon accepted string runs.
- **Automated Dead-State Routing:** Single-click helper to direct all unassigned transitions to a trap/dead state ($q_{dead}$).

### 4. Interactive Batch Test Runner

- **Unified Test Matrix:** Interactive table with rows for input strings, expected outcomes (_Accept / Reject_), execution results, pass/fail badges, and step-by-step execution traces.
- Quick buttons to add rows, test the empty string ($\varepsilon$), and reset test suites.
- Automatic warning if the empty string ($\varepsilon$) is missing from the test suite.

### 5. Export & Import Utilities

- **JSON Configuration:** Save and load DFA configurations in standardized JSON format.
- **PNG Diagram Export:** Export high-resolution canvas diagrams directly as PNG images.

---

## Course Presets

1. **Ends with 1** ($\Sigma = \{0, 1\}$)
2. **Starts with a (with dead state)** ($\Sigma = \{a, b\}$, dead state $q_2$)
3. **Even number of a** ($\Sigma = \{a, b\}$, start state is also accept state)
4. **Balinese Script Writing Rules** ($\Sigma = \{K, V\}$)
5. **3-Digit ATM PIN Verification** ($\Sigma = \{0, 1, C, E\}$, real-world state machine)
6. **Blank Canvas** (clean starting state for custom automata design)

---

## Tech Stack

- **Runtime & Package Manager:** Bun
- **Frontend Framework:** React 19, TypeScript, Vite
- **Diagram Canvas:** `@xyflow/react` (React Flow v12)
- **State Management:** Zustand
- **Styling:** Tailwind CSS v4, Lucide Icons
- **Formal Verification & Testing:** Vitest
- **Visual Utilities:** `canvas-confetti`, `html-to-image`

---

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Run Development Server

```bash
bun run dev
```

Open your browser at `http://localhost:5173`.

### 3. Run Test Suite (Vitest)

```bash
bun test
```

### 4. Build for Production

```bash
bun run build
```

Production assets are generated in the `dist/` directory.
