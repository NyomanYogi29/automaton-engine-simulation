import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import { StateNode, AutomatonEdge } from '@/components/canvas';
import { BottomDock } from '@/components/layout';
import { SimulationBar } from '@/components/simulator';

export function FlowCanvas() {
  const {
    nodes,
    edges,
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
    }),
    [],
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Central React Flow Canvas */}
      <div className="w-full h-full pb-80">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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

      {/* Floating Simulation Bar */}
      <SimulationBar />

      {/* Collapsible IDE-style Bottom Dock */}
      <BottomDock />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
