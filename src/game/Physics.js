import { WALL_THICK, BALL_R, TARGET_R, SIM_MAX_STEPS } from '../constants.js';

// Small padding applied when pushing ball to obstacle surfaces to prevent re-sticking
const EPSILON = 0.5;

// ─── Collision helpers ────────────────────────────────────────────────────────

export function circleRectOverlap(cx, cy, r, rect) {
  const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearX, dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
}

export function circleCircleOverlap(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by;
  const rr = ar + br;
  return dx * dx + dy * dy < rr * rr;
}

/**
 * Resolve a ball at (cx, cy) that is currently overlapping an AABB obstacle.
 * Uses penetration-depth on all four faces to find the correct contact face,
 * then pushes the ball out and reflects the relevant velocity component.
 *
 * Receives CURRENT (penetrating) position, not previous.
 *
 * @param {number} cx  current ball x (overlapping)
 * @param {number} cy  current ball y (overlapping)
 * @param {number} vx  velocity x
 * @param {number} vy  velocity y
 * @param {{x,y,w,h}} ob
 * @returns {{ px, py, dvx, dvy }}
 */
export function resolveObstacleCollision(cx, cy, vx, vy, ob) {
  // Measure penetration depth from each face in the direction of motion.
  // Only consider faces that the ball is actually moving toward.
  const candidates = [];

  if (vx > 0) {
    // Moving right → may have hit the left face of obstacle
    const depth = (cx + BALL_R) - ob.x;
    if (depth > 0) candidates.push({ depth, px: ob.x - BALL_R - EPSILON, py: cy, dvx: -vx, dvy: vy });
  }
  if (vx < 0) {
    // Moving left → may have hit the right face
    const depth = (ob.x + ob.w) - (cx - BALL_R);
    if (depth > 0) candidates.push({ depth, px: ob.x + ob.w + BALL_R + EPSILON, py: cy, dvx: -vx, dvy: vy });
  }
  if (vy > 0) {
    // Moving down → may have hit the top face
    const depth = (cy + BALL_R) - ob.y;
    if (depth > 0) candidates.push({ depth, px: cx, py: ob.y - BALL_R - EPSILON, dvx: vx, dvy: -vy });
  }
  if (vy < 0) {
    // Moving up → may have hit the bottom face
    const depth = (ob.y + ob.h) - (cy - BALL_R);
    if (depth > 0) candidates.push({ depth, px: cx, py: ob.y + ob.h + BALL_R + EPSILON, dvx: vx, dvy: -vy });
  }

  if (candidates.length > 0) {
    // The face with the smallest penetration is the one the ball just entered through
    candidates.sort((a, b) => a.depth - b.depth);
    const best = candidates[0];
    return { px: best.px, py: best.py, dvx: best.dvx, dvy: best.dvy };
  }

  // Fallback: shouldn't normally be reached — reflect dominant velocity component
  if (Math.abs(vy) >= Math.abs(vx)) {
    return {
      px: cx,
      py: vy > 0 ? ob.y - BALL_R - EPSILON : ob.y + ob.h + BALL_R + EPSILON,
      dvx: vx, dvy: -vy,
    };
  }
  return {
    px: vx > 0 ? ob.x - BALL_R - EPSILON : ob.x + ob.w + BALL_R + EPSILON,
    py: cy, dvx: -vx, dvy: vy,
  };
}

// ─── Wall bounce ──────────────────────────────────────────────────────────────

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
 * Simulate the bullet path. Returns array of points:
 *   { x, y }              — normal segment point
 *   { x, y, bounce:true } — bounce location
 *   { x, y, hit:true }    — target hit (terminates simulation)
 *
 * @param {number} ox @param {number} oy  origin
 * @param {number} vx @param {number} vy  velocity
 * @param {number} maxBounces
 * @param {{ x, y }} target
 * @param {Array<{x,y,w,h}>}  obstacles  (static + current moving rects)
 * @param {Array<{x,y,w,h,deflect:{vx,vy}}>} mirrors
 * @param {number} W @param {number} H
 * @param {number} [targetRadius]
 */
export function simulateTrajectory(
  ox, oy, vx, vy, maxBounces, target, obstacles, mirrors = [], W, H, targetRadius = TARGET_R
) {
  const pts = [{ x: ox, y: oy }];
  const s = { x: ox, y: oy, vx, vy };
  let bounces = 0;

  for (let step = 0; step < SIM_MAX_STEPS; step++) {
    s.x += s.vx;
    s.y += s.vy;

    const wallHit = bounceWalls(s, W, H);
    let obsHit = false, mirrorHit = false;

    // Mirror check (deflect pads — velocity is replaced, not reflected)
    for (const m of mirrors) {
      if (circleRectOverlap(s.x, s.y, BALL_R, m)) {
        s.x -= s.vx; s.y -= s.vy; // step back to entry point
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
          const res = resolveObstacleCollision(s.x, s.y, s.vx, s.vy, ob);
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
