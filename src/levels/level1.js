import { DESIGN_W, DESIGN_H, WALL_THICK } from '../constants.js';

/**
 * Level 1 — "First Ricochet"
 *
 * Layout (800×560 design space):
 *   Ball on the left, a tall central wall blocks a direct path,
 *   target on the right. Player must ricochet off top or bottom wall.
 *
 * Obstacle format: { x, y, w, h }
 */
export const level1 = {
  id: 1,
  name: 'First Ricochet',
  description: 'A central wall blocks the direct shot — bounce off the arena walls to reach the target.',
  ballStart: { x: 120, y: DESIGN_H / 2 },
  target:    { x: DESIGN_W - 110, y: DESIGN_H / 2 },
  obstacles: [
    {
      // Central wall — leaves ~90 px gaps at top and bottom
      x: DESIGN_W / 2 - 18,
      y: WALL_THICK + 90,
      w: 36,
      h: DESIGN_H - WALL_THICK * 2 - 180,
    },
  ],
  maxBounces: 8,
  parBounces: 2,
};
