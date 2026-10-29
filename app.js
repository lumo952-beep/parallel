import { triangleGeometry, presets } from './geometry.js';
const $ = id => document.getElementById(id);
const names = ['A', 'B', 'C'];
const midpointNames = ['M', 'N', 'P'];
const descriptions = [
  '먼저 삼각형 ABC를 만들어요. 꼭짓점을 움직이거나 위에서 다른 삼각형을 선택해 보세요.',
  '각 변의 양 끝에서 같은 거리에 있는 중점 M, N, P를 찾아요. M은 BC의 중점이에요.',
  '각 꼭짓점과 마주 보는 변의 중점을 이어요. 이렇게 만든 선분 AM, BN, CP를 중선이라고 해요.',
  '세 중선은 하나의 점 G에서 만나요. 이 점이 삼각형의 무게중심이에요. 모양을 바꿔도 확인해 보세요.',
  'G는 모든 중선을 꼭짓점에서부터 2 : 1로 나눠요. A, B, C를 번갈아 선택해 길이를 비교해 보세요.'
];
let points = structuredClone(presets.acute), initial = structuredClone(points);
let selected = 0, stage = 4, preset = 'acute', timer = null, dragging = null, trail = [];
const sx = x => 64 + x * 56;
const sy = y => 508 - y * 56;
const fmt = x => x.toFixed(2);
const line = (a, b, attrs='') => `<line x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(b.x)}" y2="${sy(b.y)}" ${attrs}/>`;
const circle = (p, r, attrs='') => `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${r}" ${attrs}/>`;
function label(p, text, dx, dy, color) { return `<text x="${sx(p.x)+dx}" y="${sy(p.y)+dy}" class="svg-label" fill="${color}">${text}</text>`; }
function draw() {
  const g = triangleGeometry(points);
  const layers = [];
  if ($('grid').checked) {
    for(let x=0;x<=12;x++) layers.push(line({x,y:0},{x,y:8},'stroke="#e9efeb" stroke-width="1"'));
    for(let y=0;y<=8;y++) layers.push(line({x:0,y},{x:12,y},'stroke="#e9efeb" stroke-width="1"'));
    for(let x=0;x<=12;x+=2) layers.push(`<text x="${sx(x)}" y="531" text-anchor="middle" fill="#b5c1b9" font-size="10">${x}</text>`);
    for(let y=0;y<=8;y+=2) layers.push(`<text x="44" y="${sy(y)+4}" text-anchor="middle" fill="#b5c1b9" font-size="10">${y}</text>`);
  }
  if ($('trace').checked && trail.length>1) layers.push(`<polyline points="${trail.map(p=>`${sx(p.x)},${sy(p.y)}`).join(' ')}" fill="none" stroke="#d5ac65" stroke-width="2" opacity=".8"/>`);
  layers.push(`<polygon points="${points.map(p=>`${sx(p.x)},${sy(p.y)}`).join(' ')}" fill="#198564" fill-opacity=".055" stroke="#567b68" stroke-width="2" stroke-linejoin="round"/>`);
  if(stage>=2) points.forEach((p,i) => layers.push(line(p,g.midpoints[i],`stroke="${selected===i?'#198564':'#aac8b8'}" stroke-width="${selected===i?2.5:1.4}" ${selected===i?'':'stroke-dasharray="6 5"'}`)));
  if(stage>=1) g.midpoints.forEach((p,i)=>{
    layers.push(circle(p,4,'fill="#fcfdfc" stroke="#83ab95" stroke-width="1.8"'));
    const dx = p.x >= g.center.x ? 13 : -22;
    const dy = p.y >= g.center.y ? -12 : 23;
    layers.push(label(p,midpointNames[i],dx,dy,'#7a9b87'));
  });
  if(stage>=4 && $('ratioLabels').checked && g.valid) {
    const p=points[selected], m=g.midpoints[selected];
    const a={x:(p.x+g.center.x)/2,y:(p.y+g.center.y)/2}, b={x:(m.x+g.center.x)/2,y:(m.y+g.center.y)/2};
    layers.push(`<text x="${sx(a.x)+12}" y="${sy(a.y)-8}" class="ratio-label">2</text><text x="${sx(b.x)+12}" y="${sy(b.y)-8}" class="ratio-label">1</text>`);
  }
  if(stage>=3 && g.valid) {
    layers.push(circle(g.center,14,'fill="#e8ae4c" fill-opacity=".13"'));
    layers.push(circle(g.center,6,'fill="#d6a348" stroke="white" stroke-width="2"'));
    layers.push(label(g.center,'G',14,-12,'#b3883f'));
  }
  points.forEach((p,i)=>{
    layers.push(`<g class="vertex-handle" data-handle="${i}">${circle(p,20,'fill="transparent"')}${selected===i?circle(p,12,'fill="#198564" fill-opacity=".10"'):''}${circle(p,6,`fill="${selected===i?'#198564':'#fcfdfc'}" stroke="#198564" stroke-width="2.5"`)}</g>`);
    const dx = p.x>=g.center.x?13:-26, dy=p.y>=g.center.y?-15:27;
    layers.push(label(p,names[i],dx,dy,'#356c50'));
    if ($('coordinates').checked) layers.push(`<text x="${sx(p.x)+dx}" y="${sy(p.y)+dy+17}" class="svg-coordinate">(${p.x.toFixed(1)}, ${p.y.toFixed(1)})</text>`);
  });
  $('canvas').innerHTML=layers.join('');
  $('kind').textContent=g.kind;
  $('warning').hidden=g.valid;
  $('x').value=points[selected].x; $('y').value=points[selected].y;
  $('x-value').value=points[selected].x.toFixed(1); $('y-value').value=points[selected].y.toFixed(1);
  const show = stage>=3 && g.valid;
  $('center-value').textContent=show?`(${fmt(g.center.x)}, ${fmt(g.center.y)})`:'—';
  const segment=g.segments[selected];
  $('upper-value').textContent=show?fmt(segment.upper):'—';
  $('lower-value').textContent=show?fmt(segment.lower):'—';
  $('upper-label').textContent=`${names[selected]}G · 꼭짓점 → G`;
  $('lower-label').textContent=`G${midpointNames[selected]} · G → 중점`;
  $('ratio-value').textContent=stage>=4&&g.valid?`${fmt(segment.upper/segment.lower)} : 1`:'—';
  $('step-description').textContent=descriptions[stage];
  $('step-count').textContent=`${stage+1} / 5`;
  $('previous').disabled=stage===0; $('next').disabled=stage===4;
  document.querySelectorAll('[data-step]').forEach(b=>{const n=Number(b.dataset.step);b.classList.toggle('done',n<stage);b.classList.toggle('current',n===stage);if(n===stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  document.querySelectorAll('[data-vertex]').forEach(b=>{const active=Number(b.dataset.vertex)===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
  document.querySelectorAll('[data-preset]').forEach(b=>{const active=b.dataset.preset===preset;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
}
function stop(){clearTimeout(timer);timer=null;$('play').textContent='▶ 과정 재생';}
function tick(){timer=setTimeout(()=>{if(stage<4){stage++;draw();if(stage<4)tick();else stop();}else stop();},Number($('speed').value));}
function record(){const g=triangleGeometry(points);if($('trace').checked&&g.valid){trail.push({...g.center});if(trail.length>1200)trail.shift();}}
function moved(){preset=null;record();draw();}
function choose(next,key){points=structuredClone(next);initial=structuredClone(next);preset=key;trail=[];stop();draw();}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>choose(presets[b.dataset.preset],b.dataset.preset)));
$('random').addEventListener('click',()=>{let p;do{p=Array.from({length:3},()=>({x:1+Math.random()*10,y:1+Math.random()*6.5}));}while(triangleGeometry(p).area<5);choose(p,null);});
$('reset').addEventListener('click',()=>{points=structuredClone(initial);trail=[];stage=4;stop();preset=Object.keys(presets).find(k=>JSON.stringify(presets[k])===JSON.stringify(initial))??null;draw();});
document.querySelectorAll('[data-vertex]').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.vertex);draw();}));
['x','y'].forEach(axis=>$(axis).addEventListener('input',e=>{points[selected][axis]=Number(e.target.value);moved();}));
['grid','coordinates','ratioLabels','trace'].forEach(id=>$(id).addEventListener('change',()=>{if(id==='trace'){trail=[];record();}draw();}));
$('clear-trace').addEventListener('click',()=>{trail=[];draw();});
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{stop();stage=Number(b.dataset.step);draw();}));
$('previous').addEventListener('click',()=>{stop();stage=Math.max(0,stage-1);draw();});
$('next').addEventListener('click',()=>{stop();stage=Math.min(4,stage+1);draw();});
$('play').addEventListener('click',()=>{if(timer){stop();return;}if(stage===4)stage=0;$('play').textContent='Ⅱ 일시정지';draw();tick();});
$('speed').addEventListener('change',()=>{if(timer){clearTimeout(timer);tick();}});
const svg=$('canvas');
svg.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-handle]');if(!handle || dragging!==null)return;selected=Number(handle.dataset.handle);dragging=e.pointerId;svg.setPointerCapture(e.pointerId);record();draw();e.preventDefault();});
svg.addEventListener('pointermove',e=>{if(dragging!==e.pointerId)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());points[selected]={x:Math.max(.5,Math.min(11.5,(pt.x-64)/56)),y:Math.max(.5,Math.min(8,(508-pt.y)/56))};moved();});
function release(e){if(dragging===e.pointerId){dragging=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}}
svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);svg.addEventListener('lostpointercapture',()=>{dragging=null;});
draw();
