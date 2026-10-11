export interface Point {
  x: number;
  y: number;
}

export function formatTransitionSymbols(symbols: string[]): string {
  const unique = Array.from(new Set(symbols)).filter(Boolean);
  return unique.sort().join(', ');
}

/**
 * Calculates a self-loop SVG cubic bezier path anchored tightly to the top
 * border of a circular state node (radius = nodeRadius).
 */
export function calculateSelfLoopPath(
  centerX: number,
  centerY: number,
  nodeRadius: number = 32,
  loopHeight: number = 44,
): { path: string; labelX: number; labelY: number } {
  // Horizontal spread offset from center along top perimeter
  const dx = 14;
  const clampedDx = Math.min(dx, nodeRadius - 2);
  const dy = Math.sqrt(Math.max(0, nodeRadius * nodeRadius - clampedDx * clampedDx));

  // Anchor points situated precisely on the circle's top boundary
  const startX = centerX - clampedDx;
  const startY = centerY - dy;
  const endX = centerX + clampedDx;
  const endY = centerY - dy;

  // Control points curving upward above the node
  const cp1X = centerX - nodeRadius * 1.1;
  const cp1Y = centerY - nodeRadius - loopHeight;
  const cp2X = centerX + nodeRadius * 1.1;
  const cp2Y = cp1Y;

  const path = `M ${startX.toFixed(2)} ${startY.toFixed(2)} C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;

  // Label placed neatly right above the crest of the loop
  const labelX = centerX;
  const labelY = cp1Y - 8;

  return { path, labelX, labelY };
}

/**
 * Calculates a floating edge path anchored to the circular perimeters
 * of source and target nodes (r = nodeRadius).
 *
 * If unidirectional: returns a clean straight line from perimeter to perimeter.
 * If bidirectional: returns an outward curved quadratic Bezier arc to prevent collisions.
 */
export function calculateFloatingEdgePath(
  sourceCenter: Point,
  targetCenter: Point,
  nodeRadius: number = 32,
  isBidirectional: boolean = false,
  offset: number = 28,
): { path: string; labelX: number; labelY: number } {
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) {
    return {
      path: `M ${sourceCenter.x} ${sourceCenter.y} L ${targetCenter.x} ${targetCenter.y}`,
      labelX: sourceCenter.x,
      labelY: sourceCenter.y,
    };
  }

  const angle = Math.atan2(dy, dx);
  const normalX = -dy / dist;
  const normalY = dx / dist;

  if (!isBidirectional) {
    // Unidirectional: Crisp straight line anchored directly on perimeters
    const startX = sourceCenter.x + nodeRadius * Math.cos(angle);
    const startY = sourceCenter.y + nodeRadius * Math.sin(angle);
    const endX = targetCenter.x - nodeRadius * Math.cos(angle);
    const endY = targetCenter.y - nodeRadius * Math.sin(angle);

    return {
      path: `M ${startX.toFixed(2)} ${startY.toFixed(2)} L ${endX.toFixed(2)} ${endY.toFixed(2)}`,
      labelX: Number(((startX + endX) / 2).toFixed(2)),
      labelY: Number(((startY + endY) / 2).toFixed(2)),
    };
  }

  // Bidirectional: Angular offset along perimeter plus perpendicular curvature
  const angularShift = 0.22; // ~12.6 degrees shift along perimeter
  const startAngle = angle + angularShift;
  const endAngle = angle + Math.PI - angularShift;

  const startX = sourceCenter.x + nodeRadius * Math.cos(startAngle);
  const startY = sourceCenter.y + nodeRadius * Math.sin(startAngle);
  const endX = targetCenter.x + nodeRadius * Math.cos(endAngle);
  const endY = targetCenter.y + nodeRadius * Math.sin(endAngle);

  // Quadratic control point with outward normal curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const cpX = midX + normalX * (offset * 1.5);
  const cpY = midY + normalY * (offset * 1.5);

  const path = `M ${startX.toFixed(2)} ${startY.toFixed(2)} Q ${cpX.toFixed(2)} ${cpY.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`;

  // Curve apex midpoint for label positioning
  const curveApexX = 0.25 * startX + 0.5 * cpX + 0.25 * endX;
  const curveApexY = 0.25 * startY + 0.5 * cpY + 0.25 * endY;

  return {
    path,
    labelX: Number(curveApexX.toFixed(2)),
    labelY: Number(curveApexY.toFixed(2)),
  };
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

