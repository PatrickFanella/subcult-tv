(() => {
 const NS='http://www.w3.org/2000/svg';
 function draw(button,svg){
  const width=button.offsetWidth,height=button.offsetHeight,x=9,y=9,w=width-18,h=height-18,r=Math.min(14,h/2,w/2),points=[[x+2,y],[x+w-r,y]];
  function curve(a,b,c){for(let i=1;i<=12;i++){const t=i/12;points.push([(1-t)**2*a[0]+2*(1-t)*t*b[0]+t*t*c[0],(1-t)**2*a[1]+2*(1-t)*t*b[1]+t*t*c[1]]);}}
  curve([x+w-r,y],[x+w,y],[x+w,y+r]);points.push([x+w,y+h-2],[x+w-2,y+h],[x+r,y+h]);curve([x+r,y+h],[x,y+h],[x,y+h-r]);points.push([x,y+2],[x+2,y]);
  let total=0;const segments=[];
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push([total,total+len,a,b]);total+=len;}
  function point(distance){for(const [lo,hi,a,b] of segments){if(distance<=hi){const t=(distance-lo)/(hi-lo);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}}return points.at(-1);}
  let pos=3,i=0;const paths=[];
  while(pos+8<total){const len=[9,11,8,10,9.5][i%5],a=point(pos),b=point(Math.min(pos+len,total)),dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,tilt=[.5,-.7,.3,.8,-.4][i%5];paths.push(`M${a[0]-dy/n*tilt} ${a[1]+dx/n*tilt}L${b[0]+dy/n*tilt} ${b[1]-dx/n*tilt}`);pos+=len+[8,9,7,10,8.5][i%5];i++;}
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.firstChild.setAttribute('d',paths.join(' '));
 }
 document.querySelectorAll('.patchwork-button').forEach(button=>{const svg=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');svg.classList.add('patchwork-stitches');svg.setAttribute('aria-hidden','true');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2.4');path.setAttribute('stroke-linecap','round');svg.append(path);button.append(svg);button.classList.add('has-stitches');draw(button,svg);new ResizeObserver(()=>draw(button,svg)).observe(button);});
})();
