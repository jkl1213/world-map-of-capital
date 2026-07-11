/** Builds a quadratic-bezier arc between two projected points, bulging consistently upward. */
export function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const offset = Math.min(dist * 0.22, 110);
  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const cx = mx + nx * offset;
  const cy = my + ny * offset;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

/** Radius of the animated particle traveling along a flow arc, scaled by capital magnitude. */
export function particleRadius(magnitude: number, focused: boolean): number {
  const base = 1.2 + Math.sqrt(magnitude) * 0.12;
  return focused ? base + 1.2 : base;
}

/** Small deterministic string hash, used to stagger flow-arc animation timing. */
export function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}
