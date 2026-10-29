export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function triangleGeometry(points) {
  const [a, b, c] = points;
  const center = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
  const midpoints = [midpoint(b, c), midpoint(c, a), midpoint(a, b)];
  const area = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2;
  const sides = [distance(b, c), distance(c, a), distance(a, b)].sort((x, y) => x - y);
  const squareDifference = sides[2] ** 2 - sides[1] ** 2 - sides[0] ** 2;
  const valid = area > 0.000001;
  const kind = !valid ? '삼각형이 아니에요' : Math.abs(squareDifference) < 0.001 ? '직각삼각형' : squareDifference > 0 ? '둔각삼각형' : '예각삼각형';
  return { center, midpoints, area, valid, kind,
    segments: points.map((p, i) => ({ upper: distance(p, center), lower: distance(center, midpoints[i]) })) };
}
export const presets = {
  acute: [{x:2,y:1.5},{x:10,y:1.5},{x:5,y:7}],
  right: [{x:3,y:1.5},{x:10,y:1.5},{x:3,y:7}],
  obtuse: [{x:1.5,y:2},{x:10.5,y:2},{x:4,y:4.5}],
  isosceles: [{x:2.5,y:1.5},{x:9.5,y:1.5},{x:6,y:7}],
  equilateral: [{x:2.5,y:1.5},{x:9.5,y:1.5},{x:6,y:1.5+7*Math.sqrt(3)/2}]
};
