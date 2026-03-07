export const level5 = {
  id: 5,
  name: 'Timed Guard',
  description: 'A patrol block sweeps the lane. Time your shot to slip through the gap when it opens.',
  ballStart: { x: 100, y: 280 },
  target:    { x: 700, y: 280 },
  obstacles: [],
  // Moving obstacles oscillate along an axis between range[0] and range[1]
  movingObstacles: [
    {
      x:     325,   // starting x (left end of range)
      y:     150,
      w:     180,
      h:     260,
      axis:  'x',
      speed: 3,
      range: [240, 430],
    },
  ],
  maxBounces: 4,
  parBounces: 0,
};
