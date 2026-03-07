export const level8 = {
  id: 8,
  name: 'Thread the Needle',
  description: 'One bounce. Tiny target. Perfect or nothing.',
  ballStart: { x: 100, y: 100 },
  target: { x: 700, y: 280 },
  targetRadius: 4,   // overrides TARGET_R constant — tiny!
  obstacles: [
    // Thin diagonal guide walls at precise angles

    { x: 446, y: 18, w: 14, h: 245 },
    { x: 446, y: 300, w: 14, h: 241 },
  ],
  maxBounces: 10,
  parBounces: 1,
};
