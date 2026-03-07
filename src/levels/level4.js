export const level4 = {
  id: 4,
  name: 'Corner Office',
  description: 'The target hides in a corner pocket. Bank off both walls to sink the double-wall shot.',
  ballStart: { x: 400, y: 480 },
  target:    { x: 680, y: 100 },
  obstacles: [
    { x: 600, y: 18,  w: 164, h: 20  },  // top edge of pocket
    { x: 744, y: 38,  w: 20,  h: 140 },  // right edge of pocket
  ],
  maxBounces: 6,
  parBounces: 2,
};
