import { level1 } from './level1.js';
import { level2 } from './level2.js';
import { level3 } from './level3.js';
import { level4 } from './level4.js';
import { level5 } from './level5.js';
import { level6 } from './level6.js';
import { level7 } from './level7.js';
import { level8 } from './level8.js';

export const LEVELS = [
  level1, level2, level3, level4,
  level5, level6, level7, level8,
];

export function getLevelById(id) {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0];
}

export function getNextLevel(currentId) {
  const idx = LEVELS.findIndex(l => l.id === currentId);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}
