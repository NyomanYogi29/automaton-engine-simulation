import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { AutomatonNodeData } from '@/store/useAutomatonStore';

export type StateNodeType = Node<AutomatonNodeData, 'automatonState'>;

export const StateNode: React.FC<NodeProps<StateNodeType>> = memo(
  ({ data, selected }) => {
    const isStart = Boolean(data.isStart);
    const isAccept = Boolean(data.isAccept);
    const isActive = Boolean(data.isActive);
    const label = data.label || 'q';

    return (
      <div
        tabIndex={0}
        role="button"
        aria-label={`State ${label}${isStart ? ', start state' : ''}${isAccept ? ', accept state' : ''}${isActive ? ', active' : ''}`}
        className="relative flex items-center justify-center select-none group outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-full"
      >
        {/* Handles for directional transition routing */}
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          className="w-2! h-2! bg-slate-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Top}
          id="top-source"
          className="w-2! h-2! bg-cyan-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />

        <Handle
          type="target"
          position={Position.Right}
          id="right-target"
          className="w-2! h-2! bg-slate-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          className="w-2! h-2! bg-cyan-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />

        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom-target"
          className="w-2! h-2! bg-slate-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          className="w-2! h-2! bg-cyan-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />

        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          className="w-2! h-2! bg-slate-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left-source"
          className="w-2! h-2! bg-cyan-500! border-slate-800! opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Start state incoming arrow indicator */}
        {isStart && (
          <div
            className="absolute -left-9 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-[10px] font-mono font-semibold tracking-wider text-cyan-400 mr-0.5">
              start
            </span>
            <svg
              className="w-4 h-4 text-cyan-400 stroke-current -ml-0.5"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        )}

        {/* Outer state circle */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center font-mono font-bold text-sm
            transition-all duration-200 select-none bg-slate-900 border-2
            ${
              selected
                ? 'border-cyan-400 ring-2 ring-cyan-500/40 text-cyan-200 scale-105'
                : 'border-slate-700 text-slate-200 hover:border-slate-500'
            }
            ${
              isActive
                ? 'infrantery-active-glow border-cyan-300 text-white font-extrabold scale-110 z-20'
                : ''
            }
          `}
        >
          {/* Double ring for final/accept state */}
          {isAccept ? (
            <div
              className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors
                ${
                  isActive
                    ? 'border-cyan-300 text-white'
                    : selected
                      ? 'border-cyan-400/80 text-cyan-200'
                      : 'border-slate-600 text-slate-200'
                }
              `}
            >
              <span className="truncate max-w-9 text-center" title={label}>
                {label}
              </span>
            </div>
          ) : (
            <span className="truncate max-w-12 text-center" title={label}>
              {label}
            </span>
          )}
        </div>
      </div>
    );
  },
);

StateNode.displayName = 'StateNode';
