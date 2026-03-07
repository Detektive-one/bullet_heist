import { WALL_THICK, BALL_R, TARGET_R, SIM_MAX_STEPS } from '../constants.js';

// ─── Collision helpers ────────────────────────────────────────────────────────

export function circleRectOverlap(cx, cy, r, rect) {
  const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearX, dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
}

export function resolveObstacleCollision(px, py, dvx, dvy, ob) {
  const nx = px - dvx;
  if (!circleRectOverlap(nx, py, BALL_R, ob)) {
    return { px: nx, py, dvx: -dvx, dvy };
  }
  const ny = py - dvy;
  if (!circleRectOverlap(px, ny, BALL_R, ob)) {
    return { px, py: ny, dvx, dvy: -dvy };
  }
  return { px: nx, py: ny, dvx: -dvx, dvy: -dvy };
}

export function bounceWalls(s, W, H) {
  const minX = WALL_THICK + BALL_R, maxX = W - WALL_THICK - BALL_R;
  const minY = WALL_THICK + BALL_R, maxY = H - WALL_THICK - BALL_R;
  let hit = false;
  if (s.x <= minX) { s.x = minX; s.vx =  Math.abs(s.vx); hit = true; }
  if (s.x >= maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); hit = true; }
  if (s.y <= minY) { s.y = minY; s.vy =  Math.abs(s.vy); hit = true; }
  if (s.y >= maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); hit = true; }
  return hit;
}

// ─── Trajectory simulation ────────────────────────────────────────────────────

/**
 * Simulate bullet path, handling walls, obstacles, and mirrors.
 * @param {number} ox @param {number} oy  origin
 * @param {number} vx @param {number} vy  velocity
 * @param {number} maxBounces
 * @param {{ x, y, r?: number }} target
 * @param {Array<{x,y,w,h}>}  obstacles      – bounce obstacles (static + moving current rects)
 * @param {Array<{x,y,w,h,deflect:{vx,vy}}>} mirrors – deflect pads
 * @param {number} W @param {number} H
 * @param {number} [targetRadius]
 */
export function simulateTrajectory(ox, oy, vx, vy, maxBounces, target, obstacles, mirrors = [], W, H, targetRadius = TARGET_R) {
  const pts = [{ x: ox, y: oy }];
  const s = { x: ox, y: oy, vx, vy };
  let bounces = 0;

  for (let step = 0; step < SIM_MAX_STEPS; step++) {
    s.x += s.vx;
    s.y += s.vy;

    const wallHit = bounceWalls(s, W, H);
    let obsHit = false;
    let mirrorHit = false;

    // Mirror check first (deflect pads)
    for (const m of mirrors) {
      if (circleRectOverlap(s.x, s.y, BALL_R, m)) {
        s.x -= s.vx; s.y -= s.vy;  // step back
        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        s.vx = m.deflect.vx * speed;
        s.vy = m.deflect.vy * speed;
        mirrorHit = true;
        break;
      }
    }

    // Regular obstacle bounce
    if (!mirrorHit) {
      for (const ob of obstacles) {
        if (circleRectOverlap(s.x, s.y, BALL_R, ob)) {
          const prev = pts[pts.length - 1];
          const res = resolveObstacleCollision(prev.x, prev.y, s.vx, s.vy, ob);
          s.x = res.px; s.y = res.py; s.vx = res.dvx; s.vy = res.dvy;
          obsHit = true;
          break;
        }
      }
    }

    if (wallHit || obsHit || mirrorHit) {
      bounces++;
      pts.push({ x: s.x, y: s.y, bounce: true, mirror: mirrorHit });
      if (bounces > maxBounces) break;
      continue;
    }

    pts.push({ x: s.x, y: s.y });

    // Target hit?
    const dx = s.x - target.x, dy = s.y - target.y;
    if (Math.sqrt(dx * dx + dy * dy) < targetRadius + BALL_R) {
      pts.push({ x: s.x, y: s.y, hit: true });
      break;
    }
  }
  return pts;
}
