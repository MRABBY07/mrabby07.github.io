(function(){
const NS='http://www.w3.org/2000/svg';
const el=(n,a={},p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
// Havriliak-Negami parameters fitted to real permittivity (dissertation, Ch. 1)
const HN=[{d:0,lab:'Non-aged',s:8.6785,t:.63,a:.48,b:.24},{d:10,lab:'10 days',s:4.80,t:1.51,a:.48,b:.25},{d:30,lab:'30 days',s:2.45,t:2.19,a:.48,b:.26},{d:40,lab:'40 days',s:1.72,t:2.768,a:.48,b:.24}];
const hn=(f,p)=>{const w=2*Math.PI*f,x=Math.pow(w*p.t,p.a),c=Math.cos(Math.PI*p.a/2),sn=Math.sin(Math.PI*p.a/2);const phi=Math.atan(x*sn/(1+x*c));return p.s*Math.pow(1+2*x*c+x*x,-p.b/2)*Math.cos(p.b*phi)};
const box=document.getElementById('hn-plot');
if(box){const small=box.clientWidth<620,W=small?400:1120,H=small?330:340,L=small?42:56,R=small?14:104,T=14,B=48;const svg=el('svg',{class:'chart',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Calculated dielectric dispersion curves for prepreg aged 0, 10, 30 and 40 days. The curve flattens and drops as the prepreg ages.'},box);
 const lo=-3,hi=6,ymax=9,X=l=>L+(l-lo)/(hi-lo)*(W-L-R),Y=v=>T+(1-v/ymax)*(H-T-B);
 for(let v=0;v<=9;v+=3){el('line',{x1:L,x2:W-R,y1:Y(v),y2:Y(v),class:v?'grid':'axis'},svg);const t=el('text',{x:L-10,y:Y(v)+4,'text-anchor':'end',class:'tick'},svg);t.textContent=v}
 for(let d=lo;d<=hi;d+=small?3:1){const t=el('text',{x:X(d),y:H-B+20,'text-anchor':'middle',class:'tick'},svg);t.textContent=d==0?'1':d==1?'10':'10'+String(d).replace('-','⁻').replace(/\d/,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}
 const xl=el('text',{x:(L+W-R)/2,y:H-6,'text-anchor':'middle',class:'axlabel'},svg);xl.textContent='Frequency (Hz)';
 const yl=el('text',{x:14,y:(T+H-B)/2,'text-anchor':'middle',class:'axlabel',transform:`rotate(-90 14 ${(T+H-B)/2})`},svg);yl.textContent='ε′ − ε∞';
 const paths=HN.map(p=>{let d='';for(let i=0;i<=240;i++){const l=lo+(hi-lo)*i/240;d+=(i?'L':'M')+X(l).toFixed(1)+' '+Y(hn(10**l,p)).toFixed(1)}return el('path',{d,fill:'none','stroke-linecap':'round'},svg)});
 const labs=HN.map(p=>{const t=el('text',{x:X(hi)+8,y:Y(hn(1e6,p))+4,class:'tick'},svg);t.textContent=p.lab;return t});
 // spread end labels so they do not collide
 const ys=HN.map(p=>Y(hn(10**lo,p)));labs.forEach((t,i)=>{t.setAttribute('x',L+8);t.setAttribute('y',ys[i]-7)});
 const cross=el('line',{y1:T,y2:H-B,stroke:'#171C21','stroke-width':1,visibility:'hidden'},svg),dot=el('circle',{r:5,fill:'#1D4ED8',stroke:'#fff','stroke-width':2,visibility:'hidden'},svg);
 const tip=document.createElement('div');tip.className='tip';box.appendChild(tip);
 const input=document.getElementById('age'),oS=document.getElementById('r-s'),oT=document.getElementById('r-t');let cur=0;
 const set=i=>{cur=i;paths.forEach((p,j)=>{p.setAttribute('stroke',j==i?'#1D4ED8':'#A9B5BC');p.setAttribute('stroke-width',j==i?3:1.5)});labs.forEach((t,j)=>{t.style.fontWeight=j==i?700:400;t.style.fill=j==i?'#171C21':'#4D5A64'});svg.appendChild(paths[i]);svg.appendChild(cross);svg.appendChild(dot);oS.textContent=HN[i].s.toFixed(2);oT.textContent=HN[i].t.toFixed(2)+' s';input.setAttribute('aria-valuetext',HN[i].lab)};
 input.addEventListener('input',()=>set(+input.value));set(0);
 const mv=e=>{const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W;if(x<L||x>W-R)return leave();const l=lo+(x-L)/(W-L-R)*(hi-lo),f=10**l,v=hn(f,HN[cur]);cross.setAttribute('x1',x);cross.setAttribute('x2',x);dot.setAttribute('cx',x);dot.setAttribute('cy',Y(v));cross.setAttribute('visibility','visible');dot.setAttribute('visibility','visible');tip.style.display='block';tip.style.left=Math.min(Math.max(70,x/W*r.width),r.width-70)+'px';tip.style.top=(Y(v)/H*r.height)+'px';tip.textContent=`${f<1?f.toPrecision(2):f.toPrecision(3).replace(/\.?0+$/,'')} Hz, ε′−ε∞ = ${v.toFixed(2)}`};
 const leave=()=>{cross.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden');tip.style.display='none'};
 svg.addEventListener('pointermove',mv);svg.addEventListener('pointerleave',leave);
}
// Input warping demonstration on a synthetic function
const wb=document.getElementById('warp-plot');
if(wb){const W=560,PH=170,L=8,pw=W-16;const svg=el('svg',{class:'chart',viewBox:`0 0 ${W} ${2*PH}`,role:'img','aria-label':'A synthetic response plotted against the original input and against the warped input. As warping strength rises, oscillations in the warped view become more even.'},wb);
 const f=x=>Math.sin(2*Math.PI*(1.2*x+7*x*x*x*x)),N=1200,xs=[...Array(N+1)].map((_,i)=>i/N);
 const act=xs.map(x=>Math.abs(f(Math.min(1,x+1/N))-f(x))*N+.15);const cdf=[0];for(let i=1;i<=N;i++)cdf[i]=cdf[i-1]+act[i];const F=cdf.map(c=>c/cdf[N]);
 const line=(u,top)=>{let d='';xs.forEach((x,i)=>{d+=(i?'L':'M')+(L+u(i)*pw).toFixed(1)+' '+(top+(1-f(x))/2*(PH-34)).toFixed(1)});return d};
 const lab=(y,t0)=>{const t=el('text',{x:L,y,class:'axlabel'},svg);t.textContent=t0};lab(16,'Response against original input x');lab(16+PH,'Same response against warped input H(x)');
 el('path',{d:line(i=>xs[i],26),fill:'none',stroke:'#4D5A64','stroke-width':1.6},svg);
 const pth=el('path',{fill:'none',stroke:'#1D4ED8','stroke-width':1.8},svg),inp=document.getElementById('lambda'),o=document.getElementById('lambda-v');
 const up=()=>{const l=+inp.value;o.textContent=l.toFixed(2);pth.setAttribute('d',line(i=>(1-l)*xs[i]+l*F[i],26+PH))};inp.addEventListener('input',up);up();
}
// Publications filter
const list=document.getElementById('pubs');
if(list){const items=[...list.children],btns=[...document.querySelectorAll('[data-filter]')],q=document.getElementById('pub-q'),cnt=document.getElementById('pub-count');let mode='all';
 const run=()=>{const s=q.value.trim().toLowerCase();let n=0;items.forEach(li=>{const ok=(mode=='all'||li.dataset.tags.split(' ').includes(mode))&&(!s||li.textContent.toLowerCase().includes(s));li.hidden=!ok;if(ok)n++});cnt.textContent=n?`Showing ${n} of ${items.length}`:'No matches. Clear the search or choose All.'};
 btns.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.filter;btns.forEach(x=>x.setAttribute('aria-pressed',x==b));run()}));q.addEventListener('input',run);run()}
})();
