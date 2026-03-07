import { WALL_THICK } from '../constants.js';

export const level1 = {
  id: 1,
  name: 'The Bank Shot',
  description: 'A central wall blocks the direct path — bounce off the arena walls to reach the target.',
  ballStart: { x: 120, y: 280 },
  target:    { x: 690, y: 280 },
  obstacles: [
    { x: 382, y: 108, w: 36, h: 344 },
  ],
  maxBounces: 8,
  parBounces: 2,
};
