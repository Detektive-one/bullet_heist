import { level1 } from './level1.js';

/**
 * Central level registry.
 * To add a new level:
 *   1. Create src/levels/levelN.js following the same schema.
 *   2. Import it here and push it into LEVELS.
 */
export const LEVELS = [
  level1,
  // level2, level3, …
];

/** @param {number} id */
export function getLevelById(id) {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0];
}
