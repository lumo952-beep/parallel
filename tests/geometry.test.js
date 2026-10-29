import test from 'node:test';
import assert from 'node:assert/strict';
import { triangleGeometry, presets, distance } from '../geometry.js';
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} ≠ ${b}`);
function verify(points) {
  const g=triangleGeometry(points);
  assert.ok(g.valid);
  points.forEach((p,i)=>{
    const m=g.midpoints[i];
    close(g.center.x,p.x+(m.x-p.x)*2/3);
    close(g.center.y,p.y+(m.y-p.y)*2/3);
    close(g.segments[i].upper,2*g.segments[i].lower);
    close(distance(m,points[(i+1)%3]),distance(m,points[(i+2)%3]));
    close(triangleGeometry([g.center,points[(i+1)%3],points[(i+2)%3]]).area,g.area/3);
  });
}
for(const [name,points] of Object.entries(presets)) test(`${name}: median intersection, 2:1 ratio and equal areas`,()=>verify(points));
test('presets have the intended angle types',()=>{
  assert.equal(triangleGeometry(presets.acute).kind,'예각삼각형');
  assert.equal(triangleGeometry(presets.right).kind,'직각삼각형');
  assert.equal(triangleGeometry(presets.obtuse).kind,'둔각삼각형');
  const p=presets.equilateral;close(distance(p[0],p[1]),distance(p[1],p[2]));
});
test('collinear and coincident vertices are invalid',()=>{
  for(const p of [[{x:0,y:0},{x:2,y:2},{x:4,y:4}],Array(3).fill({x:1,y:1})])assert.equal(triangleGeometry(p).valid,false);
});
test('properties hold for 500 reproducible varied triangles',()=>{
  let seed=12345;
  const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
  for(let i=0;i<500;i++){
    const p=Array.from({length:3},()=>({x:random()*11,y:random()*8}));
    if(triangleGeometry(p).valid)verify(p);
  }
});
