export const level6 = {
  id: 6,
  name: 'Refraction',
  description: 'A deflector pad redirects your bullet at 90°. Aim into the pad — not the target.',
  ballStart: { x: 400, y: 80 },
  target: { x: 100, y: 445 },
  obstacles: [
    // Side walls that force the approach from above
    { x: 18, y: 290, w: 220, h: 20 },   // top-left shelf
    { x: 300, y: 290, w: 482, h: 20 },   // top-right shelf
  ],
  mirrors: [
    {
      x: 370,
      y: 430,
      w: 60,
      h: 24,
      deflect: { vx: -1, vy: 0 },   // bounce ball left
      label: '←',
    },
  ],
  maxBounces: 4,
  parBounces: 1,
};
