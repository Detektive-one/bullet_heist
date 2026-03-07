export const level8 = {
  id: 8,
  name: 'Zero Tolerance',
  description: 'One bounce. Tiny target. Perfect or nothing.',
  ballStart:    { x: 100, y: 280 },
  target:       { x: 700, y: 280 },
  targetRadius: 4,   // overrides TARGET_R constant — tiny!
  obstacles: [
    // Thin diagonal guide walls at precise angles
    { x: 340, y: 18,  w: 120, h: 14 },
    { x: 340, y: 528, w: 120, h: 14 },
  ],
  maxBounces: 1,
  parBounces: 1,
};
