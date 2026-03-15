// ─── Design-space dimensions ─────────────────────────────────────────────────
// All level coordinates are authored in this space.
// The renderer scales to the actual canvas size at runtime.
export const DESIGN_W = 800;
export const DESIGN_H = 560;

// ─── Physics ──────────────────────────────────────────────────────────────────
export const WALL_THICK  = 18;
export const BALL_R      = 10;
export const TARGET_R    = 18;
export const MAX_SPEED   = 7;

// ─── Slingshot ────────────────────────────────────────────────────────────────
export const SLING_MAX_DRAG    = 120; // px drag that equals full power
export const SLING_MIN_DRAG    = 8;   // ignore micro-drags
export const DRAG_BALL_HITAREA = 6;   // multiplier on BALL_R for click/touch target (larger = easier on mobile)

// ─── Simulation ───────────────────────────────────────────────────────────────
export const SIM_MAX_STEPS = 2000;
export const SIM_DRAW_STEPS = 600;   // how many preview steps to draw
