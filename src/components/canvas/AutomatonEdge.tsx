import React, { memo, useMemo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import {
  calculateFloatingEdgePath,
  formatTransitionSymbols,
} from '@/lib/geometry';
import type { AutomatonEdgeData } from '@/store/useAutomatonStore';
import { SelfLoopEdge, type SelfLoopEdgeType } from './SelfLoopEdge';

export type AutomatonEdgeType = Edge<AutomatonEdgeData, 'automatonEdge'>;

const StandardAutomatonEdge: React.FC<EdgeProps<AutomatonEdgeType>> = memo(
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
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    const isActive = Boolean(data?.isActive);
    const isBidirectional = Boolean(data?.isBidirectional);


    const symbols = useMemo(
      () => data?.symbols || [],
      [data?.symbols],
    );
    const labelText = useMemo(
      () => formatTransitionSymbols(symbols) || '?',
      [symbols],
    );

    const { path: edgePath, labelX, labelY } = useMemo(() => {
      const sourceWidth = sourceNode?.measured?.width ?? 64;
      const sourceHeight = sourceNode?.measured?.height ?? 64;
      const sourceRadius = sourceWidth / 2;

      const targetWidth = targetNode?.measured?.width ?? 64;
      const targetHeight = targetNode?.measured?.height ?? 64;

      const sourceCenter = sourceNode?.internals?.positionAbsolute
        ? {
            x: sourceNode.internals.positionAbsolute.x + sourceWidth / 2,
            y: sourceNode.internals.positionAbsolute.y + sourceHeight / 2,
          }
        : { x: sourceX, y: sourceY };

      const targetCenter = targetNode?.internals?.positionAbsolute
        ? {
            x: targetNode.internals.positionAbsolute.x + targetWidth / 2,
            y: targetNode.internals.positionAbsolute.y + targetHeight / 2,
          }
        : { x: targetX, y: targetY };

      return calculateFloatingEdgePath(
        sourceCenter,
        targetCenter,
        sourceRadius,
        isBidirectional,
        28,
      );
    }, [
      sourceNode,
      targetNode,
      sourceX,
      sourceY,
      targetX,
      targetY,
      isBidirectional,
    ]);


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

StandardAutomatonEdge.displayName = 'StandardAutomatonEdge';

export const AutomatonEdge: React.FC<EdgeProps<AutomatonEdgeType>> = memo(
  (props) => {
    if (props.source === props.target) {
      return <SelfLoopEdge {...(props as unknown as EdgeProps<SelfLoopEdgeType>)} />;
    }
    return <StandardAutomatonEdge {...props} />;
  },
);

AutomatonEdge.displayName = 'AutomatonEdge';

