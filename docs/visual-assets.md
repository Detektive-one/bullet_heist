# Visual Asset Direction

The shared concept image is excellent as art direction, but it is not a production sprite sheet yet. It is a composed reference board with labels, examples, mixed scales, lighting, and preview layouts. Cropping directly from it would create inconsistent sizes, baked-in shadows, text artifacts, and blurry small sprites.

## Direction

- Top-down heist diorama.
- Stylized, clean, high contrast.
- Dark floor and walls with warm bullet/spark effects.
- Green/cyan targets and switches.
- Red laser gates and hazards.
- Premium mobile puzzle arcade feel, not realistic shooter.

## Asset Packs Needed

Create separate transparent PNGs or a single packed atlas plus JSON metadata for:

- Floor tiles: 64x64 or 128x128, seamless.
- Walls/corners: modular pieces that tile around the arena.
- Obstacles: crates, metal blocks, glass blocks, hazard barriers.
- Gameplay objects: bullet, gun/start pad, target/vault, switches, gates, force fields.
- Effects: bullet trail, ricochet spark, switch activation burst, target hit burst.
- UI icons: pause, restart, back, shots, bounces, par, stars.

## Export Requirements

- PNG with transparent background for objects/effects.
- Consistent top-down perspective.
- Object shadows separated or kept subtle enough to work on any floor.
- No labels or text baked into sprites.
- Atlas JSON should map names to `x`, `y`, `w`, `h`, and optional `pivot`.
- Recommended baseline: 64 px floor tiles, 128-256 px large objects, 256-512 px VFX bursts.

The current renderer can remain primitive-based while the asset pack is prepared. Once assets exist, we can add a `SpriteRenderer` that draws sprites first and falls back to primitives when an asset is missing.
