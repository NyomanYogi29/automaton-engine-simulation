import React, { useState } from 'react';
import { useAutomatonStore } from '@/store/useAutomatonStore';
import {
  TransitionTableTab,
  TestRunnerTab,
  TraceHistoryTab,
  ValidationIssuesTab,
} from '@/components/dock-tabs';
import {
  ChevronUp,
  ChevronDown,
  TableProperties,
  ListChecks,
  History,
  AlertTriangle,
} from 'lucide-react';

export type DockTabId = 'table' | 'test' | 'trace' | 'validation';

export const BottomDock: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DockTabId>('table');

  const validationIssues = useAutomatonStore((s) => s.validationIssues);
  const issuesCount = validationIssues.length;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-30 flex flex-col bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl transition-all duration-300
        ${isExpanded ? 'h-80' : 'h-10'}
      `}
    >
      {/* Dock tab navigation bar */}
      <div className="flex items-center justify-between h-10 px-4 bg-slate-900/90 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('table');
              setIsExpanded(true);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors
              ${
                activeTab === 'table' && isExpanded
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }
            `}
          >
            <TableProperties className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transition Table</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('test');
              setIsExpanded(true);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors
              ${
                activeTab === 'test' && isExpanded
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }
            `}
          >
            <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
            <span>Batch Test Runner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('trace');
              setIsExpanded(true);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors
              ${
                activeTab === 'trace' && isExpanded
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }
            `}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Trace History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('validation');
              setIsExpanded(true);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors
              ${
                activeTab === 'validation' && isExpanded
                  ? 'bg-slate-800 text-rose-300 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }
            `}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 ${issuesCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}
            />
            <span>DFA Validation</span>
            {issuesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                {issuesCount}
              </span>
            )}
          </button>
        </div>

        {/* Toggle collapse/expand dock button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Minimize bottom dock' : 'Expand bottom dock'}
            aria-label={isExpanded ? 'Minimize bottom dock' : 'Expand bottom dock'}
          >
            {isExpanded ? (
              <>
                <span>Hide</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show Dock</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dock tab content panel */}
      {isExpanded && (
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'table' && <TransitionTableTab />}
          {activeTab === 'test' && <TestRunnerTab />}
          {activeTab === 'trace' && <TraceHistoryTab />}
          {activeTab === 'validation' && <ValidationIssuesTab />}
        </div>
      )}
    </div>
  );
};
