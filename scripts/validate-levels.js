import { DESIGN_W, DESIGN_H, WALL_THICK } from '../src/constants.js';
import { LEVELS, GAME_LEVELS, TUTORIAL_LEVELS } from '../src/levels/index.js';

const errors = [];
const seen = new Set();

function fail(level, message) {
  errors.push(`${level.id}: ${message}`);
}

function inArena(level, label, point, radius = 0) {
  if (point.x - radius < WALL_THICK || point.x + radius > DESIGN_W - WALL_THICK) fail(level, `${label}.x is outside arena`);
  if (point.y - radius < WALL_THICK || point.y + radius > DESIGN_H - WALL_THICK) fail(level, `${label}.y is outside arena`);
}

function rectInArena(level, label, rect) {
  if (rect.x < WALL_THICK || rect.x + rect.w > DESIGN_W - WALL_THICK) fail(level, `${label} is outside arena width`);
  if (rect.y < WALL_THICK || rect.y + rect.h > DESIGN_H - WALL_THICK) fail(level, `${label} is outside arena height`);
  if (rect.w <= 0 || rect.h <= 0) fail(level, `${label} must have positive size`);
}

for (const level of LEVELS) {
  const id = String(level.id);
  if (seen.has(id)) fail(level, 'duplicate level id');
  seen.add(id);

  if (!level.name) fail(level, 'missing name');
  inArena(level, 'ballStart', level.ballStart, 10);
  inArena(level, 'target', level.target, level.targetRadius ?? 18);

  for (const [i, ob] of (level.obstacles ?? []).entries()) rectInArena(level, `obstacles[${i}]`, ob);
  for (const [i, gate] of (level.gates ?? []).entries()) rectInArena(level, `gates[${i}]`, gate);
  for (const [i, mirror] of (level.mirrors ?? []).entries()) rectInArena(level, `mirrors[${i}]`, mirror);
  for (const [i, moving] of (level.movingObstacles ?? []).entries()) {
    rectInArena(level, `movingObstacles[${i}]`, moving);
    if (!['x', 'y'].includes(moving.axis)) fail(level, `movingObstacles[${i}] has invalid axis`);
    if (!Array.isArray(moving.range) || moving.range.length !== 2) fail(level, `movingObstacles[${i}] missing range`);
  }

  const switchIds = new Set((level.switches ?? []).map(s => s.id));
  for (const [i, s] of (level.switches ?? []).entries()) {
    if (!s.id) fail(level, `switches[${i}] missing id`);
    inArena(level, `switches[${i}]`, s, s.r ?? 16);
  }
  for (const req of (level.requiredSwitches ?? [])) {
    if (!switchIds.has(req)) fail(level, `required switch "${req}" does not exist`);
  }
  for (const [i, gate] of (level.gates ?? []).entries()) {
    for (const req of (gate.requires ?? [gate.switchId]).filter(Boolean)) {
      if (!switchIds.has(req)) fail(level, `gates[${i}] references missing switch "${req}"`);
    }
  }

  if ((level.shots ?? 1) < 1) fail(level, 'shots must be at least 1');
  if (level.maxBounces < 0) fail(level, 'maxBounces must be non-negative');
}

if (GAME_LEVELS.length !== 50) errors.push(`campaign expected 50 levels, got ${GAME_LEVELS.length}`);
if (TUTORIAL_LEVELS.length < 1) errors.push('tutorial levels are missing');

if (errors.length) {
  console.error('Level validation failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`Validated ${LEVELS.length} levels (${TUTORIAL_LEVELS.length} tutorial, ${GAME_LEVELS.length} campaign).`);
