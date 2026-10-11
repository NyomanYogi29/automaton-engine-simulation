import React, { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import {
  calculateCurvedEdgePath,
  calculateSelfLoopPath,
  formatTransitionSymbols,
} from '@/lib/geometry';
import type { AutomatonEdgeData } from '@/store/useAutomatonStore';

export type AutomatonEdgeType = Edge<AutomatonEdgeData, 'automatonEdge'>;

export const AutomatonEdge: React.FC<EdgeProps<AutomatonEdgeType>> = memo(
  ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected,
    markerEnd,
  }) => {
    const isSelfLoop = source === target;
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
      if (isSelfLoop) {
        const loop = calculateSelfLoopPath(sourceX, sourceY, 32, 52);
        return {
          edgePath: loop.path,
          labelX: loop.labelX,
          labelY: loop.labelY,
        };
      }

      // Offset curve path by 32px to prevent bidirectional overlap (e.g. q0 -> q1 and q1 -> q0)
      const curved = calculateCurvedEdgePath(
        { x: sourceX, y: sourceY },
        { x: targetX, y: targetY },
        32,
      );

      return {
        edgePath: curved.path,
        labelX: curved.labelX,
        labelY: curved.labelY,
      };
    }, [isSelfLoop, sourceX, sourceY, targetX, targetY]);

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

        {/* Transition symbol badge rendered along the arc */}
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

AutomatonEdge.displayName = 'AutomatonEdge';
