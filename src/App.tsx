import { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { StateNode, AutomatonEdge, SelfLoopEdge } from '@/components/canvas';
import { BottomDock, TopNavbar } from '@/components/layout';
import { AlphabetDrawer, LanguageDrawer } from '@/components/drawers';
import { ToastProvider } from '@/components/common';

export function FlowCanvas() {
  const [isAlphabetOpen, setIsAlphabetOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const {
    nodes,
    edges,
    isDockExpanded,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useAutomatonStore();

  const nodeTypes = useMemo(
    () => ({
      automatonState: StateNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      automatonEdge: AutomatonEdge,
      selfLoop: SelfLoopEdge,
    }),
    [],
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Navigation Bar with preset picker, drawers, and export/import */}
      <TopNavbar
        onOpenAlphabetDrawer={() => setIsAlphabetOpen(true)}
        onOpenLanguageDrawer={() => setIsLanguageOpen(true)}
        canvasContainerId="automaton-canvas"
      />

      {/* Central React Flow Canvas */}
      <div
        id="automaton-canvas"
        className={`w-full h-full pt-14 transition-all duration-300 ease-in-out ${
          isDockExpanded ? 'pb-80' : 'pb-10'
        }`}
      >

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid={true}
          snapGrid={[20, 20]}
          fitView
          colorMode="dark"
          minZoom={0.2}
          maxZoom={2.5}
        >

          <Background color="#1e293b" gap={20} size={1.5} />
          <Controls className="bg-slate-900! border-slate-800! fill-slate-300!" />
          <MiniMap
            nodeColor="#06b6d4"
            maskColor="rgba(15, 23, 42, 0.75)"
            className="bg-slate-950! border-slate-800!"
          />
        </ReactFlow>
      </div>

      {/* Collapsible IDE-style Bottom Dock */}
      <BottomDock />

      {/* Level 1: Alphabet & String Playground Drawer */}
      <AlphabetDrawer
        isOpen={isAlphabetOpen}
        onClose={() => setIsAlphabetOpen(false)}
      />

      {/* Level 2: Language Checker Drawer */}
      <LanguageDrawer
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </ToastProvider>
  );
}

