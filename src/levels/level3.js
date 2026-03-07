export const level3 = {
  id: 3,
  name: 'Tight Squeeze',
  description: 'Two massive diagonal slabs create a choke point. Thread the needle between them.',
  ballStart: { x: 80, y: 480 },
  target: { x: 720, y: 80 },
  obstacles: [
    { x: 250, y: 25, w: 200, h: 230 },  // upper block
    { x: 350, y: 305, w: 200, h: 230 },  // lower block
  ],
  maxBounces: 6,
  parBounces: 2,
};
