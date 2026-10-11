import { describe, it, expect } from 'vitest';
import {
  calculateSelfLoopPath,
  calculateCurvedEdgePath,
  calculateFloatingEdgePath,
  formatTransitionSymbols,
} from '@/lib/geometry';

describe('geometry calculations', () => {
  it('formats transition symbols cleanly without duplicates and in alphabetical order', () => {
    expect(formatTransitionSymbols(['b', 'a', 'b'])).toBe('a, b');
    expect(formatTransitionSymbols(['0', '1'])).toBe('0, 1');
    expect(formatTransitionSymbols([])).toBe('');
    expect(formatTransitionSymbols(['K', 'V'])).toBe('K, V');
  });

  it('generates valid SVG cubic bezier curve for self-loop edge anchored on circle perimeter', () => {
    const cx = 100;
    const cy = 100;
    const r = 32;
    const loop = calculateSelfLoopPath(cx, cy, r, 44);

    expect(loop.path).toContain('M ');
    expect(loop.path).toContain(' C ');
    expect(loop.labelX).toBe(100);
    expect(loop.labelY).toBeLessThan(100 - r); // label sits cleanly above the top border

    // Parse start point coordinates M {x} {y}
    const match = loop.path.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
    expect(match).not.toBeNull();
    if (match) {
      const startX = parseFloat(match[1]);
      const startY = parseFloat(match[2]);
      const distFromCenter = Math.hypot(startX - cx, startY - cy);
      // Must be tightly anchored to circle perimeter (radius = 32)
      expect(distFromCenter).toBeCloseTo(r, 1);
    }
  });

  it('generates crisp straight perimeter-to-perimeter path for unidirectional edge', () => {
    const sourceCenter = { x: 100, y: 100 };
    const targetCenter = { x: 300, y: 100 };
    const r = 32;

    const edge = calculateFloatingEdgePath(sourceCenter, targetCenter, r, false);

    // Unidirectional should use straight line L
    expect(edge.path).toContain('M 132.00 100.00 L 268.00 100.00');
    expect(edge.labelX).toBe(200);
    expect(edge.labelY).toBe(100);
  });

  it('generates outward curved paths with opposite curvatures for bidirectional edges', () => {
    const sourceCenter = { x: 100, y: 100 };
    const targetCenter = { x: 300, y: 100 };
    const r = 32;

    const forward = calculateFloatingEdgePath(sourceCenter, targetCenter, r, true, 28);
    const backward = calculateFloatingEdgePath(targetCenter, sourceCenter, r, true, 28);

    // Bidirectional must use quadratic bezier Q
    expect(forward.path).toContain('Q ');
    expect(backward.path).toContain('Q ');

    // Forward and backward should curve in opposite vertical directions
    expect(forward.labelY).toBeGreaterThan(100);
    expect(backward.labelY).toBeLessThan(100);
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
    const edge = calculateFloatingEdgePath(pt, pt, 32, false);

    expect(edge.path).toBe('M 50 50 L 50 50');
    expect(edge.labelX).toBe(50);
    expect(edge.labelY).toBe(50);
  });

});
