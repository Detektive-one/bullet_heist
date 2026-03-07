import { WALL_THICK, BALL_R, TARGET_R, SIM_MAX_STEPS } from '../constants.js';

// ─── Collision helpers ────────────────────────────────────────────────────────

/**
 * Returns true if circle (cx,cy,r) overlaps axis-aligned rect.
 * @param {number} cx @param {number} cy @param {number} r
 * @param {{x,y,w,h}} rect
 */
export function circleRectOverlap(cx, cy, r, rect) {
  const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearX;
  const dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
}

/**
 * Resolve a circle that has already overlapped an AABB.
 * Tries to reflect the velocity axis-by-axis; handles corner hits.
 * Works on the PREVIOUS position (before penetration) + current velocity.
 *
 * @param {number} px  position BEFORE the step that caused overlap
 * @param {number} py
 * @param {number} dvx velocity x
 * @param {number} dvy velocity y
 * @param {{x,y,w,h}} ob
 * @returns {{ px, py, dvx, dvy }}
 */
export function resolveObstacleCollision(px, py, dvx, dvy, ob) {
  // Try X-only reflection first
  const nx = px - dvx;
  if (!circleRectOverlap(nx, py, BALL_R, ob)) {
    return { px: nx, py, dvx: -dvx, dvy };
  }
  // Try Y-only reflection
  const ny = py - dvy;
  if (!circleRectOverlap(px, ny, BALL_R, ob)) {
    return { px, py: ny, dvx, dvy: -dvy };
  }
  // Corner: reflect both
  return { px: nx, py: ny, dvx: -dvx, dvy: -dvy };
}

// ─── Wall bounce ──────────────────────────────────────────────────────────────

/**
 * Bounce off the arena walls (inside of WALL_THICK border).
 * Mutates the passed state object { x, y, vx, vy }.
 * Returns true if a bounce occurred.
 * @param {{ x, y, vx, vy }} s  mutable state
 * @param {number} W  design width
 * @param {number} H  design height
 */
export function bounceWalls(s, W, H) {
  const minX = WALL_THICK + BALL_R;
  const maxX = W - WALL_THICK - BALL_R;
  const minY = WALL_THICK + BALL_R;
  const maxY = H - WALL_THICK - BALL_R;
  let hit = false;

  if (s.x <= minX) { s.x = minX; s.vx =  Math.abs(s.vx); hit = true; }
  if (s.x >= maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); hit = true; }
  if (s.y <= minY) { s.y = minY; s.vy =  Math.abs(s.vy); hit = true; }
  if (s.y >= maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); hit = true; }

  return hit;
}

// ─── Trajectory simulation ─────────────────────────────────────────────────

/**
 * Simulate the bullet path from (ox, oy) with velocity (vx, vy).
 * Returns an array of point objects:
 *   { x, y }            — normal segment point
 *   { x, y, bounce: true } — bounce location
 *   { x, y, hit: true }    — target hit (terminates simulation)
 *
 * @param {number} ox @param {number} oy  origin
 * @param {number} vx @param {number} vy  velocity
 * @param {number} maxBounces
 * @param {{ x, y }} target
 * @param {Array<{x,y,w,h}>} obstacles
 * @param {number} W @param {number} H  design dimensions
 */
export function simulateTrajectory(ox, oy, vx, vy, maxBounces, target, obstacles, W, H) {
  const pts = [{ x: ox, y: oy }];
  const s = { x: ox, y: oy, vx, vy };
  let bounces = 0;

  for (let step = 0; step < SIM_MAX_STEPS; step++) {
    s.x += s.vx;
    s.y += s.vy;

    // Wall
    const wallHit = bounceWalls(s, W, H);

    // Obstacles
    let obsHit = false;
    for (const ob of obstacles) {
      if (circleRectOverlap(s.x, s.y, BALL_R, ob)) {
        const prev = pts[pts.length - 1];
        const res = resolveObstacleCollision(prev.x, prev.y, s.vx, s.vy, ob);
        s.x = res.px; s.y = res.py;
        s.vx = res.dvx; s.vy = res.dvy;
        obsHit = true;
        break;
      }
    }

    if (wallHit || obsHit) {
      bounces++;
      pts.push({ x: s.x, y: s.y, bounce: true });
      if (bounces > maxBounces) break;
      continue;
    }

    pts.push({ x: s.x, y: s.y });

    // Target hit?
    const dx = s.x - target.x;
    const dy = s.y - target.y;
    if (Math.sqrt(dx * dx + dy * dy) < TARGET_R + BALL_R) {
      pts.push({ x: s.x, y: s.y, hit: true });
      break;
    }
  }

  return pts;
}
