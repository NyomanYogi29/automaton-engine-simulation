import React, { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import {
  calculateSelfLoopPath,
  formatTransitionSymbols,
} from '@/lib/geometry';
import type { AutomatonEdgeData } from '@/store/useAutomatonStore';

export type SelfLoopEdgeType = Edge<AutomatonEdgeData, 'selfLoop'>;

export const SelfLoopEdge: React.FC<EdgeProps<SelfLoopEdgeType>> = memo(
  ({
    id,
    source,
    sourceX,
    sourceY,
    data,
    selected,
    markerEnd,
  }) => {
    const sourceNode = useInternalNode(source);
    const isActive = Boolean(data?.isActive);

    const symbols = useMemo(
      () => data?.symbols || [],
      [data?.symbols],
    );
    const labelText = useMemo(
      () => formatTransitionSymbols(symbols) || '?',
      [symbols],
    );

    const { edgePath, labelX, labelY } = useMemo(() => {
      const width = sourceNode?.measured?.width ?? 64;
      const height = sourceNode?.measured?.height ?? 64;
      const radius = width / 2;

      // Extract accurate node center coordinates
      let centerX: number;
      let centerY: number;

      if (sourceNode?.internals?.positionAbsolute) {
        centerX = sourceNode.internals.positionAbsolute.x + width / 2;
        centerY = sourceNode.internals.positionAbsolute.y + height / 2;
      } else {
        // Fallback using top handle coordinate where sourceY is at the top border
        centerX = sourceX;
        centerY = sourceY + radius;
      }

      const loop = calculateSelfLoopPath(centerX, centerY, radius, 44);

      return {
        edgePath: loop.path,
        labelX: loop.labelX,
        labelY: loop.labelY,
      };
    }, [sourceNode, sourceX, sourceY]);

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            stroke: isActive ? '#06b6d4' : selected ? '#38bdf8' : '#64748b',
            strokeWidth: isActive ? 3 : selected ? 2.5 : 1.75,
            transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
          }}
        />

        {/* Transition symbol badge rendered on top apex of the loop */}
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan select-none"
          >
            <div
              className={`
                px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all shadow-sm
                ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 ring-2 ring-cyan-500/30 font-bold scale-110 z-30'
                    : selected
                      ? 'bg-slate-900 text-cyan-300 border border-cyan-500/80'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-slate-500'
                }
              `}
              title={`Transition symbols: ${labelText}`}
            >
              {labelText}
            </div>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  },
);

SelfLoopEdge.displayName = 'SelfLoopEdge';
