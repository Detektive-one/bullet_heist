import { level1 } from './level1.js';
import { level2 } from './level2.js';
import { level3 } from './level3.js';
import { level4 } from './level4.js';
import { level5 } from './level5.js';
import { level6 } from './level6.js';
import { level7 } from './level7.js';
import { level8 } from './level8.js';
import { gameLevelA1 } from './game_level_a1.js';

/** Tutorial levels (the original 8 hand-crafted levels) */
export const TUTORIAL_LEVELS = [
  level1, level2, level3, level4,
  level5, level6, level7, level8,
];

/** Main game levels (to be expanded) */
export const GAME_LEVELS = [
  gameLevelA1,
];

/** Combined pool — used internally */
export const LEVELS = [...TUTORIAL_LEVELS, ...GAME_LEVELS];

export function getLevelById(id) {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0];
}

export function getNextLevel(currentId, pool = TUTORIAL_LEVELS) {
  const idx = pool.findIndex(l => l.id === currentId);
  return idx >= 0 && idx < pool.length - 1 ? pool[idx + 1] : null;
}
