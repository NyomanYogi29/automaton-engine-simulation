import { describe, it, expect } from 'vitest';
import {
  calculateSelfLoopPath,
  calculateCurvedEdgePath,
  formatTransitionSymbols,
} from '@/lib/geometry';

describe('geometry calculations', () => {
  it('formats transition symbols cleanly without duplicates and in alphabetical order', () => {
    expect(formatTransitionSymbols(['b', 'a', 'b'])).toBe('a, b');
    expect(formatTransitionSymbols(['0', '1'])).toBe('0, 1');
    expect(formatTransitionSymbols([])).toBe('');
    expect(formatTransitionSymbols(['K', 'V'])).toBe('K, V');
  });

  it('generates valid SVG cubic bezier curve for self-loop edge', () => {
    const loop = calculateSelfLoopPath(100, 100, 30, 40);

    expect(loop.path).toContain('M ');
    expect(loop.path).toContain(' C ');
    expect(loop.labelX).toBe(100);
    expect(loop.labelY).toBeLessThan(100); // loop sits above the node
  });

  it('generates bidirectional offset curved path between two different nodes', () => {
    const source = { x: 50, y: 50 };
    const target = { x: 200, y: 50 };

    const forwardEdge = calculateCurvedEdgePath(source, target, 30);
    const backwardEdge = calculateCurvedEdgePath(target, source, 30);

    expect(forwardEdge.path).toContain('M 50 50 Q');
    expect(backwardEdge.path).toContain('M 200 50 Q');

    // Label should be placed near midpoint with offset
    expect(forwardEdge.labelX).toBeCloseTo(125, 0);
    expect(forwardEdge.labelY).not.toBe(50);
  });

  it('handles degenerate zero-distance edge safely without NaN', () => {
    const pt = { x: 50, y: 50 };
    const edge = calculateCurvedEdgePath(pt, pt, 20);

    expect(edge.path).toBe('M 50 50 L 50 50');
    expect(edge.labelX).toBe(50);
    expect(edge.labelY).toBe(50);
  });
});
