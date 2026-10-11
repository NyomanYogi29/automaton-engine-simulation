export interface Point {
  x: number;
  y: number;
}

export function formatTransitionSymbols(symbols: string[]): string {
  const unique = Array.from(new Set(symbols)).filter(Boolean);
  return unique.sort().join(', ');
}

export function calculateSelfLoopPath(
  centerX: number,
  centerY: number,
  nodeRadius: number = 32,
  loopHeight: number = 48,
): { path: string; labelX: number; labelY: number } {
  // Loop arcs upward from top-left to top-right of node circle
  const startX = centerX - nodeRadius * 0.5;
  const startY = centerY - nodeRadius * 0.866;
  const endX = centerX + nodeRadius * 0.5;
  const endY = startY;

  const cp1X = centerX - nodeRadius * 1.2;
  const cp1Y = centerY - nodeRadius - loopHeight;
  const cp2X = centerX + nodeRadius * 1.2;
  const cp2Y = cp1Y;

  const path = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  const labelX = centerX;
  const labelY = cp1Y - 10;

  return { path, labelX, labelY };
}

export function calculateCurvedEdgePath(
  source: Point,
  target: Point,
  offset: number = 30,
): { path: string; labelX: number; labelY: number } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) {
    return {
      path: `M ${source.x} ${source.y} L ${target.x} ${target.y}`,
      labelX: source.x,
      labelY: source.y,
    };
  }

  // Perpendicular unit vector
  const normalX = -dy / dist;
  const normalY = dx / dist;

  // Midpoint with normal offset
  const midX = (source.x + target.x) / 2 + normalX * offset;
  const midY = (source.y + target.y) / 2 + normalY * offset;

  const path = `M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`;

  return {
    path,
    labelX: midX,
    labelY: midY,
  };
}
