export const level7 = {
  id: 7,
  name: 'The Gauntlet',
  description: 'Four pillars guard the target. Find the one ricochet angle that threads all the gaps.',
  ballStart: { x: 100, y: 280 },
  target:    { x: 700, y: 280 },
  obstacles: [
    // Top-left pillar
    { x: 240, y: 18,  w: 40, h: 190 },
    // Bottom-left pillar
    { x: 240, y: 352, w: 40, h: 190 },
    // Top-right pillar
    { x: 520, y: 18,  w: 40, h: 190 },
    // Bottom-right pillar
    { x: 520, y: 352, w: 40, h: 190 },
  ],
  maxBounces: 6,
  parBounces: 2,
};
