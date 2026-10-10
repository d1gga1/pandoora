/* Pandoora Shop — catalogo, configuratore, carrello e motion design.
   Dati: /shop/data/catalog.json (categorie) + /shop/data/products.json (prodotti e regole prezzi).
   Con Supabase cambierà solo loadData(). */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var eur=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  var WA='393884706887', MAIL='ordini@pandooragroup.it';
  function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  var CAT=null, P=[], PR=null;
  var cart=store('pdShopCart2')||[];
  var favs=store('pdShopFav')||[];
  document.documentElement.classList.add('js-motion');

  /* ---------- icone ---------- */
  var IC={
    bag:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M12 11v6M9 14h6"/></svg>',
    heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    eye:'<svg viewBox="0 0 24 24"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>',
    arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check:'<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>'
  };
  var SW={'Bianco opaco':'#f4f3ef','Bianco':'#f6f6f4','Bianco frassino':'#efede7','Rovere naturale':'#c9a273','Rovere oliato':'#b8895a','Noce canaletto':'#6b4a33','Grigio seta':'#b9b6b0','Grigio Baltimora':'#8d8780','Palissandro White':'#e3ddd2','Nero opaco':'#262626','Marrone-nero':'#3d322b','Rovere sbiancato':'#e4d6bf','Effetto noce':'#7d553a','Grigio legno':'#a8a299','Bianco lucido':'#fdfdfc','Laccato RAL':'conic-gradient(#c0392b,#e0b24a,#5b8d5a,#3e6fa8,#8e5aa8,#c0392b)','Rovere naturale/Bianco':'linear-gradient(90deg,#c9a273 50%,#f4f3ef 50%)','Noce/Grigio':'linear-gradient(90deg,#6b4a33 50%,#b9b6b0 50%)','Pietra grigia/Rovere':'linear-gradient(90deg,#8f8f8a 50%,#c9a273 50%)','Pietra chiara/Noce':'linear-gradient(90deg,#d9d5cc 50%,#6b4a33 50%)'};
  var RALS=[['9010','#f1ece1','Bianco puro'],['9016','#f1f0ea','Bianco traffico'],['1013','#e3d9c6','Bianco perla'],['7044','#b8b4a8','Grigio seta'],['7016','#383e42','Antracite'],['6021','#89ac76','Verde pallido'],['5014','#606e8c','Blu colomba'],['3012','#c6846d','Rosso beige'],['9005','#0e0e10','Nero']];
  function swatch(f){return SW[f]||'#ddd'}
  function tintDoor(tn,R,ral){
    var on=R&&ral!=='9010'&&ral!=='9016';if(!on)tn.dataset.want='';
    var im=tn.parentNode&&tn.parentNode.querySelector('img');
    function show(v){tn.style.opacity=v?1:0;if(im){im.style.transition='opacity .45s';im.style.opacity=v?0:1}}
    if(!on){show(false);return}
    if(im){var cs=getComputedStyle(im);tn.style.padding=cs.padding;tn.style.objectPosition=cs.objectPosition}
    DoorTint.paint(tn,tn.dataset.src,R[1]).then(function(){if(tn.dataset.want===R[1])show(true)}).catch(function(){show(false)});
  }

  /* ---------- tinta RAL realistica sulla foto (canvas) ----------
     Mantiene luci, ombre e bugne della foto bianca, applica la tinta in luminanza CIE L*
     e lascia intatti maniglia e serratura (maschera *_metal.png). */
  var DoorTint=(function(){
    var cache={};
    function s2l(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
    function l2s(c){c=c<0?0:c>1?1:c;return Math.round((c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055)*255)}
    function y2L(Y){return Y>0.008856?116*Math.cbrt(Y)-16:903.3*Y}
    function L2y(L){var f=(L+16)/116;return L>8?f*f*f:L/903.3}
    var LIN=new Float32Array(256);for(var i=0;i<256;i++)LIN[i]=s2l(i);
    function loadImg(u){return new Promise(function(ok,ko){var im=new Image();im.decoding='async';im.onload=function(){ok(im)};im.onerror=ko;im.src=u})}
    function prep(src){
      if(cache[src])return cache[src];
      var mu=src.replace(/\.webp(\?.*)?$/,'_metal.png$1');
      return cache[src]=Promise.all([loadImg(src),loadImg(mu).catch(function(){return null})]).then(function(r){
        var im=r[0],W=im.naturalWidth,H=im.naturalHeight,cv=document.createElement('canvas');cv.width=W;cv.height=H;
        var cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(im,0,0);
        var px=cx.getImageData(0,0,W,H).data,n=W*H,Ls=new Float32Array(n),hist=new Uint32Array(1001),cnt=0,keep=null;
        for(var i=0,j=0;i<n;i++,j+=4){var Y=0.2126*LIN[px[j]]+0.7152*LIN[px[j+1]]+0.0722*LIN[px[j+2]],L=y2L(Y);Ls[i]=L;if(px[j+3]>128){hist[Math.round(L*10)]++;cnt++}}
        var acc=0,t=cnt*0.7,Lref=90;for(var h=0;h<=1000;h++){acc+=hist[h];if(acc>=t){Lref=h/10;break}}
        var dq=new Uint16Array(n);for(i=0;i<n;i++){var d=Ls[i]-Lref;d=d<-100?-100:d>100?100:d;dq[i]=Math.round((d+100)*10)}
        if(r[1]){var mc=document.createElement('canvas');mc.width=W;mc.height=H;var mx=mc.getContext('2d',{willReadFrequently:true});mx.drawImage(r[1],0,0,W,H);var md=mx.getImageData(0,0,W,H).data;keep=new Uint8Array(n);for(i=0;i<n;i++)keep[i]=md[i*4]}
        return{W:W,H:H,px:px,dq:dq,keep:keep};
      });
    }
    function paint(canvas,src,hex){
      canvas.dataset.want=hex;
      return prep(src).then(function(D){
        if(canvas.dataset.want!==hex)return;
        var tr=s2l(parseInt(hex.slice(1,3),16)),tg=s2l(parseInt(hex.slice(3,5),16)),tb=s2l(parseInt(hex.slice(5,7),16));
        var tY=Math.max(0.2126*tr+0.7152*tg+0.0722*tb,1e-4),tL=y2L(tY),k=1+(1-tL/100)*0.5;
        var LR=new Uint8Array(2001),LG=new Uint8Array(2001),LB=new Uint8Array(2001);
        for(var q=0;q<=2000;q++){var Lo=tL+k*(q/10-100);Lo=Lo<0?0:Lo>100?100:Lo;var f=L2y(Lo)/tY;LR[q]=l2s(tr*f);LG[q]=l2s(tg*f);LB[q]=l2s(tb*f)}
        if(canvas.width!==D.W){canvas.width=D.W;canvas.height=D.H}
        var cx=canvas.getContext('2d'),out=cx.createImageData(D.W,D.H),o=out.data,px=D.px,dq=D.dq,kp=D.keep,n=D.W*D.H;
        for(var i=0,j=0;i<n;i++,j+=4){var a=px[j+3];o[j+3]=a;if(!a)continue;var d=dq[i],r=LR[d],g=LG[d],b=LB[d];
          if(kp&&kp[i]){var m=kp[i]/255;r+=(px[j]-r)*m;g+=(px[j+1]-g)*m;b+=(px[j+2]-b)*m}
          o[j]=r;o[j+1]=g;o[j+2]=b}
        cx.putImageData(out,0,0);
      });
    }
    return{paint:paint};
  })();

  /* ---------- immagini con ricaduta ---------- */
  function imgAttrs(p,lg){
    var src=lg?(p.imgLg||p.img):p.img, chain=[];
    if(lg&&p.imgLgRemote)chain.push(p.imgLgRemote);
    if(p.imgRemote)chain.push(p.imgRemote);
    if(p.imgFb)chain.push(p.imgFb);
    return 'src="'+esc(src)+'" data-fb="'+esc(chain.join('|'))+'"';
  }
  document.addEventListener('error',function(e){
    var t=e.target;if(!t||t.tagName!=='IMG'||!t.dataset.fb)return;
    var c=t.dataset.fb.split('|').filter(Boolean);var n=c.shift();t.dataset.fb=c.join('|');
    if(n)t.src=n;
  },true);

  /* ---------- prezzi ---------- */
  function r9(x){return Math.max(9,Math.ceil(x/10)*10-1)}
  function opening(id){return PR.door.openings.find(function(o){return o.id===id})}
  function doorQuote(p,c){
    var D=PR.door, base=D.lines[p.line], op=opening(c.open)||D.openings[0], lines=[];
    var b=Math.max(base,op.min||0);
    lines.push([p.lineLabel+' · '+op.label,b]);
    D.extras.forEach(function(x){if(c.ex&&c.ex[x.id]&&extraOk(x,c))lines.push([x.label,x.add])});
    if(c.size==='custom'){var fm=D.fuoriMisura,add=(fm.add||0)+Math.round(b*(fm.perc||0)/100);lines.push([fm.label+' '+c.vw+'×'+c.vh+' mm, muro '+c.wall,add])}
    var tot=lines.reduce(function(a,l){return a+l[1]},0);
    return{unit:tot,lines:lines,note:D.ivaNote};
  }
  function extraOk(x,c){return !x.onlyFor||x.onlyFor.indexOf(c.open)>=0}
  function furnQuote(p,c){
    var F=PR.furniture, lines=[], s;
    if(c.size==='custom'){
      s=p.std[0];
      var k=Math.pow((c.w*c.h)/(s.w*s.h),F.exp)*Math.pow(c.d/s.d,.3);
      var b=r9(s.price*k*(1+F.customPerc/100));
      lines.push(['Su misura '+c.w+'×'+c.d+'×'+c.h+' cm',b]);
    } else { s=p.std[c.size|0]||p.std[0]; lines.push(['Misura '+s.w+'×'+s.d+'×'+s.h+' cm',s.price]); }
    if(c.fin==='Laccato RAL'){var base=lines[0][1];lines.push(['Laccatura RAL '+(c.ral||''),r9(base*F.ralPerc/100)])}
    var tot=lines.reduce(function(a,l){return a+l[1]},0);
    return{unit:tot,lines:lines,note:F.ivaNote};
  }
  /* ---------- libreria a vani (configuratore con disegno dal vivo) ---------- */
  var CUBE_COL={'Bianco opaco':'#f3f2ee','Rovere sbiancato':'#e4d6bf','Effetto noce':'#7d553a','Marrone-nero':'#3d322b','Grigio legno':'#a8a299','Bianco lucido':'#fdfdfc'};
  function cubeColor(c){if(c.fin==='Laccato RAL'){var R=RALS.find(function(r){return r[0]===c.ral});return R?R[1]:'#e8e2d6'}return CUBE_COL[c.fin]||'#eee'}
  function shade(hex,k){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(v){return Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)))}return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
  function cubeDims(c){var W=c.cols*c.cube+8+(c.cols-1)*1.5,H=c.rows*c.cube+8+(c.rows-1)*1.5,bh=c.base==='zoccolo'?8:c.base==='gambe'?15:0;return{w:Math.round(W*10)/10,h:Math.round((H+bh)*10)/10,d:c.depth,frameH:H,bh:bh}}
  function cubeQuote(p,c){
    var K=PR.cube,lines=[],L=(c.cols+1)*c.rows+(c.rows+1)*c.cols;
    var fp=(K.finishPerc[c.fin]||0);
    var fr=r9((K.base+K.perPanel*L)*Math.pow(c.cube/33,1.2)*Math.pow(c.depth/39,.5)*(1+fp/100));
    var D=cubeDims(c);
    lines.push(['Struttura '+c.cols+'×'+c.rows+' vani da '+c.cube+' cm · '+c.fin+(c.fin==='Laccato RAL'?' '+(c.ral||''):''),fr]);
    var cnt={};(c.cells||[]).forEach(function(x){if(x&&x!=='vuoto')cnt[x]=(cnt[x]||0)+1});
    K.inserts.forEach(function(it){if(cnt[it.id]){var u=Math.round(it.add*Math.pow(c.cube/33,1.1)*(1+fp/200));lines.push([cnt[it.id]+' × '+it.label.toLowerCase(),u*cnt[it.id]])}});
    var b=K.bases.find(function(x){return x.id===c.base});if(b&&b.id!=='nessuna')lines.push([b.label,b.perCol?b.perCol*c.cols:b.add]);
    return{unit:lines.reduce(function(a,l){return a+l[1]},0),lines:lines,note:K.ivaNote,dims:D};
  }
  function cubeSVG(c,interactive){
    var D=cubeDims(c),col=cubeColor(c),edge=shade(col,-.28),inner=shade(col,-.12),back=shade(col,-.1),ins=shade(col,.08);
    var s=4,pad=46,W=D.w*s,H=D.h*s,vw=W+pad*2,vh=H+pad*2,x0=pad,y0=pad,t=4*s,ti=1.5*s,cu=c.cube*s;
    var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+vw+' '+vh+'" preserveAspectRatio="xMidYMid meet">';
    o+='<rect width="'+vw+'" height="'+vh+'" fill="#f4f3f0"/>';
    o+='<ellipse cx="'+(x0+W/2)+'" cy="'+(y0+H+4)+'" rx="'+(W/2+10)+'" ry="9" fill="rgba(13,21,36,.12)"/>';
    var fh=D.frameH*s;
    if(D.bh){var bh=D.bh*s;if(c.base==='gambe'){[x0+t,x0+W-t-8].forEach(function(x){o+='<rect x="'+x+'" y="'+(y0+fh)+'" width="8" height="'+bh+'" fill="#2a2a2a"/>'})}else o+='<rect x="'+(x0+t*.6)+'" y="'+(y0+fh)+'" width="'+(W-t*1.2)+'" height="'+bh+'" fill="'+edge+'"/>'}
    o+='<rect x="'+x0+'" y="'+y0+'" width="'+W+'" height="'+fh+'" rx="3" fill="'+col+'" stroke="'+edge+'" stroke-width="1.5"/>';
    for(var r=0;r<c.rows;r++)for(var k=0;k<c.cols;k++){
      var i=r*c.cols+k,x=x0+t+k*(cu+ti),y=y0+t+r*(cu+ti),it=(c.cells||[])[i]||'vuoto';
      o+='<g'+(interactive?' class="cell" data-cell="'+i+'" tabindex="0" role="button" aria-label="Vano '+(r+1)+'-'+(k+1)+'"':'')+'>';
      o+='<rect x="'+x+'" y="'+y+'" width="'+cu+'" height="'+cu+'" fill="'+back+'"/><rect x="'+x+'" y="'+y+'" width="'+cu+'" height="'+(cu*.12)+'" fill="rgba(0,0,0,.10)"/>';
      if(it==='anta'){o+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+(cu-2)+'" height="'+(cu-2)+'" fill="'+ins+'" stroke="'+edge+'" stroke-width="1"/><circle cx="'+(x+cu-14)+'" cy="'+(y+cu/2)+'" r="3.5" fill="'+edge+'"/>'}
      else if(it==='cassetti'){[0,1].forEach(function(j){var yy=y+1+j*(cu/2);o+='<rect x="'+(x+1)+'" y="'+yy+'" width="'+(cu-2)+'" height="'+(cu/2-2)+'" fill="'+ins+'" stroke="'+edge+'" stroke-width="1"/><rect x="'+(x+cu/2-14)+'" y="'+(yy+cu/4-3)+'" width="28" height="4" rx="2" fill="'+edge+'"/>'})}
      else if(it==='ripiano'){o+='<rect x="'+x+'" y="'+(y+cu/2-3)+'" width="'+cu+'" height="6" fill="'+col+'" stroke="'+edge+'" stroke-width=".8"/>'}
      else if(it==='cesto'){o+='<rect x="'+(x+6)+'" y="'+(y+10)+'" width="'+(cu-12)+'" height="'+(cu-12)+'" rx="5" fill="#cbbda5"/><path d="M'+(x+6)+' '+(y+22)+'h'+(cu-12)+'" stroke="#b3a386" stroke-width="2"/><rect x="'+(x+cu/2-12)+'" y="'+(y+14)+'" width="24" height="5" rx="2.5" fill="#9c8c70"/>'}
      if(interactive)o+='<rect class="hit" x="'+x+'" y="'+y+'" width="'+cu+'" height="'+cu+'" fill="transparent"/>';
      o+='</g>';
    }
    var red='#c0392b';
    o+='<g stroke="'+red+'" stroke-width="1.5" fill="none"><path d="M'+x0+' '+(y0+H+22)+'H'+(x0+W)+'M'+x0+' '+(y0+H+16)+'v12M'+(x0+W)+' '+(y0+H+16)+'v12"/><path d="M'+(x0+W+22)+' '+y0+'V'+(y0+H)+'M'+(x0+W+16)+' '+y0+'h12M'+(x0+W+16)+' '+(y0+H)+'h12"/></g>';
    o+='<g font-family="Manrope,Arial,sans-serif" font-weight="800" font-size="15" fill="'+red+'"><text x="'+(x0+W/2)+'" y="'+(y0+H+40)+'" text-anchor="middle">'+D.w+' cm</text><text x="'+(x0+W+36)+'" y="'+(y0+H/2)+'" text-anchor="middle" transform="rotate(-90 '+(x0+W+36)+' '+(y0+H/2)+')">'+D.h+' cm</text></g>';
    return o+'</svg>';
  }
  function svgURI(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
  function cubeDefault(p){var c=JSON.parse(JSON.stringify(p.preset));c.ral=c.fin==='Laccato RAL'?'9010':'';c.base='nessuna';c.cells=[];for(var i=0;i<c.cols*c.rows;i++)c.cells.push('vuoto');return c}
  /* ---------- porte: geometria e disegno tecnico (regole dai disegni esecutivi) ---------- */
  function doorGeom(c){
    var T=PR.door.tech, vw=c.vw, vh=c.vh, wall=c.wall;
    var g={vw:vw,vh:vh,wall:wall,fw:vw+T.frameW,fh:vh+T.frameH};
    g.lw=g.fw+T.leafW;g.lh=g.fh+T.leafH;g.rw=g.lw+T.rebW;g.rh=g.lh+T.rebH;
    g.ow=g.fw+T.archW;g.oh=g.fh+T.archH;g.lp=g.lw+T.lposs;g.jamb=Math.min(T.jamb,wall);g.ext=Math.max(0,wall-T.jamb);
    return g;
  }
  function dimH(x1,x2,y,label,o){o=o||{};var t=o.tick||6,col=o.col||'#1a2028';
    return '<g stroke="'+col+'" stroke-width="1" fill="none"><path d="M'+x1+' '+y+'H'+x2+'"/><path d="M'+x1+' '+(y-t)+'v'+(2*t)+'M'+x2+' '+(y-t)+'v'+(2*t)+'"/><path d="M'+(x1+7)+' '+(y-3)+'L'+x1+' '+y+'L'+(x1+7)+' '+(y+3)+'M'+(x2-7)+' '+(y-3)+'L'+x2+' '+y+'L'+(x2-7)+' '+(y+3)+'"/></g>'
      +'<text x="'+((x1+x2)/2)+'" y="'+(y-5)+'" text-anchor="middle" class="tl"'+(o.bg?' paint-order="stroke" stroke="#fff" stroke-width="5"':'')+'>'+label+'</text>';}
  function dimV(y1,y2,x,label,o){o=o||{};var col=o.col||'#1a2028',cx=x-5,cy=(y1+y2)/2;
    return '<g stroke="'+col+'" stroke-width="1" fill="none"><path d="M'+x+' '+y1+'V'+y2+'"/><path d="M'+(x-6)+' '+y1+'h12M'+(x-6)+' '+y2+'h12"/><path d="M'+(x-3)+' '+(y1+7)+'L'+x+' '+y1+'L'+(x+3)+' '+(y1+7)+'M'+(x-3)+' '+(y2-7)+'L'+x+' '+y2+'L'+(x+3)+' '+(y2-7)+'"/></g>'
      +'<text x="'+cx+'" y="'+cy+'" text-anchor="middle" class="tl" transform="rotate(-90 '+cx+' '+cy+')" paint-order="stroke" stroke="#fff" stroke-width="5">'+label+'</text>';}
  function leafPattern(p,x,y,w,h,s){
    var pt=p.pattern||'flat',o='',m=Math.max(10,w*.17),st='fill="none" stroke="#1a2028" stroke-width="1"',in2='fill="none" stroke="#8a919b" stroke-width=".8"';
    function panel(px,py,pw,ph,curve){o+='<rect x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'" '+st+'/>'+(pw>16&&ph>16?'<rect x="'+(px+5)+'" y="'+(py+5)+'" width="'+(pw-10)+'" height="'+(ph-10)+'" '+in2+'/>':'')}
    var n={b1:1,b2:2,b3:3,b3c:3,b4:4}[pt];
    if(n){var top=y+h*.06,bot=y+h*.94,gap=h*.035,ph=(bot-top-gap*(n-1))/n;for(var i=0;i<n;i++)panel(x+m,top+i*(ph+gap),w-2*m,ph)}
    else if(pt==='h4'){for(var k=1;k<=4;k++){var yy=y+h*k/5;o+='<path d="M'+(x+4)+' '+yy+'H'+(x+w-4)+'" '+st+'/>'}}
    else if(pt==='y'){o+='<path d="M'+(x+w/2)+' '+(y+h*.5)+'V'+(y+h-6)+'M'+(x+w/2)+' '+(y+h*.5)+'L'+(x+8)+' '+(y+8)+'M'+(x+w/2)+' '+(y+h*.5)+'L'+(x+w-8)+' '+(y+8)+'" '+st+'/>'}
    else if(pt==='oval'){o+='<ellipse cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" rx="'+(w/2-m)+'" ry="'+(h/2-h*.05)+'" '+st+'/><ellipse cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" rx="'+(w/2-m-5)+'" ry="'+(h/2-h*.05-5)+'" '+in2+'/>'}
    else if(pt==='diag'){var a=y+h*.48,b=y+h*.6;o+='<path d="M'+(x+m)+' '+(y+h*.06)+'H'+(x+w-m)+'V'+a+'L'+(x+m)+' '+b+'Z" '+st+'/><path d="M'+(x+m)+' '+(b+h*.04)+'L'+(x+w-m)+' '+(a+h*.04)+'V'+(y+h*.94)+'H'+(x+m)+'Z" '+st+'/>'}
    return o;
  }
  function elevation(p,c,g,ox,oy,maxW,maxH,lbl){
    var fm=c.open==='filo-muro',sc=Math.min((maxW-90)/(fm?g.vw+300:g.ow),(maxH-120)/(fm?g.vh+150:g.oh)),o='';
    var cx=ox+maxW/2, gy=oy+maxH-40; // linea pavimento
    var W=function(v){return v*sc};
    var ow=fm?g.vw:g.ow, oh=fm?g.vh:g.oh;
    var x0=cx-W(ow)/2, fx=cx-W(g.fw)/2, lx=cx-W(g.lw)/2, vx=cx-W(g.vw)/2;
    o+='<path d="M'+(x0-30)+' '+gy+'H'+(x0+W(ow)+30)+'" stroke="#1a2028" stroke-width="2"/>';
    if(fm){o+='<rect x="'+(vx-W(150))+'" y="'+(gy-W(g.vh)-W(150))+'" width="'+W(g.vw+300)+'" height="'+(W(g.vh)+W(150))+'" fill="#f1efea"/>';}
    else{o+='<rect x="'+x0+'" y="'+(gy-W(g.oh))+'" width="'+W(g.ow)+'" height="'+W(g.oh)+'" fill="#f6f5f2" stroke="#1a2028" stroke-width="1.2"/>';
      o+='<rect x="'+fx+'" y="'+(gy-W(g.fh))+'" width="'+W(g.fw)+'" height="'+W(g.fh)+'" fill="#fff" stroke="#1a2028" stroke-width="1"/>';
      var rx=cx-W(g.rw)/2;o+='<rect x="'+rx+'" y="'+(gy-W(g.rh))+'" width="'+W(g.rw)+'" height="'+W(g.rh)+'" fill="none" stroke="#c0392b" stroke-width="1" stroke-dasharray="5 4"/>';}
    var ly=gy-W(10)-W(g.lh);
    o+='<rect x="'+lx+'" y="'+ly+'" width="'+W(g.lw)+'" height="'+W(g.lh)+'" fill="#fff" stroke="#1a2028" stroke-width="1.6"/>';
    o+=leafPattern(p,lx,ly,W(g.lw),W(g.lh),sc);
    var right=c.hand!=='sx',hx=right?lx+W(g.lw)-4:lx-2,kx=right?lx+W(30):lx+W(g.lw)-W(30);
    [0.1,0.5,0.88].forEach(function(f){o+='<rect x="'+hx+'" y="'+(ly+W(g.lh)*f)+'" width="6" height="'+W(110)+'" fill="#9aa1aa"/>'});
    var hy=gy-W(1050);o+='<rect x="'+(kx-4)+'" y="'+(hy-W(55))+'" width="8" height="'+W(110)+'" fill="#9aa1aa"/><path d="M'+kx+' '+hy+'h'+(right?W(150):-W(150))+'" stroke="#9aa1aa" stroke-width="5" stroke-linecap="round"/><rect x="'+(kx-3)+'" y="'+(hy+W(110))+'" width="6" height="'+W(45)+'" fill="#9aa1aa"/>';
    // quote
    if(!fm){o+=dimH(x0,x0+W(g.ow),gy-W(g.oh)-58,(lbl.overall)+' '+g.ow,{bg:1});o+=dimH(fx,fx+W(g.fw),gy-W(g.oh)-28,lbl.frame+' '+g.fw,{bg:1});}
    o+=dimH(lx,lx+W(g.lw),ly+W(g.lh)*.42,lbl.leaf+' '+g.lw,{bg:1,tick:4});
    o+=dimH(vx,vx+W(g.vw),gy+26,lbl.opening+' '+g.vw,{col:'#c0392b'});
    if(!fm){o+=dimV(gy-W(g.oh),gy,x0-34,lbl.overall+' '+g.oh);o+=dimV(gy-W(g.fh),gy,fx-12,lbl.frame+' '+g.fh);}
    else o+=dimV(gy-W(g.vh),gy,vx-24,lbl.opening+' '+g.vh,{col:'#c0392b'});
    o+=dimV(ly,ly+W(g.lh),(fm?vx+W(g.vw):x0+W(g.ow))+30,lbl.leaf+' '+g.lh);
    return o;
  }
  var LBL={overall:'ingombro',frame:'telaio',leaf:'anta',opening:'vano'};
  function doorElevSVG(p,c){var g=doorGeom(c);return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 700" class="s-tech"><style>.tl{font:600 12px Manrope,Arial,sans-serif;fill:#1a2028}</style><rect width="560" height="700" fill="#fbfaf8"/>'+elevation(p,c,g,10,20,540,660,LBL)+'</svg>'}
  function doorSheetSVG(p,c){
    var g=doorGeom(c),T=PR.door.tech,right=c.hand!=='sx',fm=c.open==='filo-muro',bat=c.open==='battente';
    var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 1190" class="s-tech"><style>.tl{font:600 13px Manrope,Arial,sans-serif;fill:#1a2028}.ts{font:500 11px Manrope,Arial,sans-serif;fill:#4a525c}.th{font:800 15px Manrope,Arial,sans-serif;fill:#1a2028}.tt{font:800 30px Manrope,Arial,sans-serif;fill:#0d1524}</style>'
      +'<defs><pattern id="wl" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#e8e8e6"/><circle cx="5" cy="5" r="1.8" fill="none" stroke="#a9aaa8" stroke-width=".7"/></pattern><pattern id="hc" width="5" height="10" patternUnits="userSpaceOnUse"><rect width="5" height="10" fill="#f3e6d2"/><path d="M2.5 0V10" stroke="#d2b98f" stroke-width=".8"/></pattern></defs>'
      +'<rect width="1680" height="1190" fill="#fff"/>';
    var op=opening(c.open);
    o+='<text x="50" y="58" class="tt">'+esc(p.name.toUpperCase())+' – SU MISURA</text>';
    o+='<text x="50" y="92" class="tl">'+esc(p.lineLabel)+' – '+(right?'Destra':'Sinistra')+' – '+(p.line==='laminata'?esc(p.finishes[0]):'laccata RAL '+esc(c.ral||'—'))+' – '+esc(op.label.toLowerCase())+'   |   Misura vano: H '+g.vh+' × L '+g.vw+' × muro '+g.wall+' mm</text>';
    if(bat){
      // sezione orizzontale
      o+='<text x="34" y="140" class="th">Sezione orizzontale – completa (mm)</text>';
      var sc=Math.min(860/(g.ow+700),230/(g.wall+60)),cx=520,yo=210+g.wall*sc+60,ys=yo-g.wall*sc,S=function(v){return v*sc};
      var hw=S(g.vw)/2,wext=S(320);
      o+='<rect x="'+(cx-hw-wext)+'" y="'+ys+'" width="'+wext+'" height="'+S(g.wall)+'" fill="url(#wl)" stroke="#b5b5b2"/><rect x="'+(cx+hw)+'" y="'+ys+'" width="'+wext+'" height="'+S(g.wall)+'" fill="url(#wl)" stroke="#b5b5b2"/>';
      [-1,1].forEach(function(sd){
        var fo=cx+sd*S(g.fw)/2,fi=fo-sd*S(T.jambT),xa=Math.min(fo,fi),jw=Math.abs(fo-fi);
        o+='<rect x="'+xa+'" y="'+(yo-S(g.jamb))+'" width="'+jw+'" height="'+S(g.jamb)+'" fill="#ecd9bd" stroke="#8a6d45" stroke-width=".8"/>';
        if(g.ext)o+='<rect x="'+xa+'" y="'+ys+'" width="'+jw+'" height="'+S(g.ext)+'" fill="#dcc29b" stroke="#8a6d45" stroke-width=".8"/>';
        var a1=Math.min(fo-sd*S(T.jambT*.4),cx+sd*S(g.ow)/2),a2=Math.max(fo-sd*S(T.jambT*.4),cx+sd*S(g.ow)/2);
        o+='<rect x="'+a1+'" y="'+yo+'" width="'+(a2-a1)+'" height="'+Math.max(3,S(10))+'" fill="#ecd9bd" stroke="#8a6d45" stroke-width=".8"/><rect x="'+a1+'" y="'+(ys-Math.max(3,S(10)))+'" width="'+(a2-a1)+'" height="'+Math.max(3,S(10))+'" fill="#ecd9bd" stroke="#8a6d45" stroke-width=".8"/>';
      });
      var lx=cx-S(g.lw)/2,ly=yo-S(44)-S(4);
      o+='<rect x="'+lx+'" y="'+ly+'" width="'+S(g.lw)+'" height="'+S(44)+'" fill="#fff" stroke="#1a2028" stroke-width="1.2"/><rect x="'+(lx+S(60))+'" y="'+(ly+S(6))+'" width="'+(S(g.lw)-S(120))+'" height="'+S(32)+'" fill="url(#hc)"/>';
      var hxS=right?lx+S(g.lw)-S(45):lx+S(8),kxS=right?lx+S(8):lx+S(g.lw)-S(45);
      o+='<rect x="'+hxS+'" y="'+(ly+S(10))+'" width="'+S(37)+'" height="'+S(24)+'" fill="#8d959e"/><rect x="'+kxS+'" y="'+(ly+S(10))+'" width="'+S(37)+'" height="'+S(24)+'" fill="#c9ced3" stroke="#6b737d" stroke-width=".6"/>';
      o+='<text x="'+(hxS+S(18))+'" y="'+(yo+30)+'" text-anchor="middle" class="ts">cerniere a</text><text x="'+(hxS+S(18))+'" y="'+(yo+43)+'" text-anchor="middle" class="ts">scomparsa ×3</text><text x="'+(kxS+S(18))+'" y="'+(yo+30)+'" text-anchor="middle" class="ts">serratura</text><text x="'+(kxS+S(18))+'" y="'+(yo+43)+'" text-anchor="middle" class="ts">magnetica</text>';
      o+='<text x="'+(cx+hw+wext)+'" y="'+(ys-26)+'" text-anchor="end" class="ts">LATO BATTUTA</text><text x="'+(cx+hw+wext)+'" y="'+(yo+40)+'" text-anchor="end" class="ts">LATO APERTURA (coprifilo '+T.archi+')</text>';
      o+=dimH(cx-S(g.lp)/2,cx+S(g.lp)/2,ys-58,'L Poss '+g.lp,{bg:1});
      o+=dimH(lx,lx+S(g.lw),ys-30,'anta '+g.lw,{bg:1});
      o+=dimH(cx-hw,cx+hw,yo+76,'vano '+g.vw,{bg:1,col:'#c0392b'});
      o+=dimH(cx-S(g.ow)/2,cx+S(g.ow)/2,yo+106,'ingombro con coprifili '+g.ow,{bg:1});
      o+=dimV(ys,yo,cx-hw-wext-16,'muro '+g.wall);
      // dettaglio telaio
      o+='<text x="66" y="'+(yo+150)+'" class="th">Dettaglio telaio (mm)</text>';
      var dy=yo+290,ds=Math.min(1.2,360/(g.wall+40)),dx=90,D=function(v){return v*ds};
      o+='<rect x="'+dx+'" y="'+(dy+D(27)+14)+'" width="'+D(g.wall)+'" height="150" fill="url(#wl)" stroke="#b5b5b2"/>';
      o+='<path d="M'+dx+' '+(dy+D(27))+'V'+dy+'H'+(dx+D(g.jamb*.45))+'V'+(dy-D(T.rebate))+'H'+(dx+D(g.jamb))+'V'+(dy+D(27))+'Z" fill="#ecd9bd" stroke="#1a2028" stroke-width="1"/><text x="'+(dx+D(g.jamb)/2)+'" y="'+(dy+D(20))+'" text-anchor="middle" class="ts">telaio</text>';
      if(g.ext)o+='<rect x="'+(dx+D(g.jamb))+'" y="'+(dy+D(4))+'" width="'+D(g.ext)+'" height="'+D(23)+'" fill="#dcc29b" stroke="#1a2028" stroke-width="1"/><text x="'+(dx+D(g.jamb)+D(g.ext)/2)+'" y="'+(dy+D(17))+'" text-anchor="middle" class="ts">estensione</text>';
      o+='<rect x="'+(dx+4)+'" y="'+(dy-D(T.rebate)-D(60))+'" width="'+D(44)+'" height="'+D(60)+'" fill="#f6f6f4" stroke="#1a2028"/><text x="'+(dx+4+D(22))+'" y="'+(dy-D(T.rebate)-D(30))+'" text-anchor="middle" class="ts">ANTA</text>';
      [dx-D(12),dx+D(g.wall)+2].forEach(function(ax){o+='<rect x="'+ax+'" y="'+(dy+D(27)+2)+'" width="'+D(10)+'" height="'+D(T.archi)+'" fill="#ecd9bd" stroke="#1a2028" stroke-width=".8"/>'});
      o+=dimH(dx,dx+D(g.jamb),dy-D(T.rebate)-D(60)-16,''+g.jamb,{bg:1});
      if(g.ext)o+=dimH(dx+D(g.jamb),dx+D(g.wall),dy+D(27)+176,''+g.ext,{bg:1});
      o+=dimH(dx,dx+D(g.wall),dy+D(27)+204,''+g.wall,{bg:1});
      o+=dimV(dy+D(27)+2,dy+D(27)+2+D(T.archi),dx-D(12)-12,''+T.archi);
      o+='<text x="'+(dx+D(g.wall)+40)+'" y="'+(dy-30)+'" class="ts">incastri maschio-femmina chiusi:</text><text x="'+(dx+D(g.wall)+40)+'" y="'+(dy-16)+'" class="ts">estensione ▸ scanalatura telaio,</text><text x="'+(dx+D(g.wall)+40)+'" y="'+(dy-2)+'" class="ts">coprifili ▸ telaio / estensione</text>';
    } else {
      o+='<text x="34" y="140" class="th">Schema – '+esc(op.label.toLowerCase())+'</text><text x="34" y="170" class="tl">Per questa apertura il disegno esecutivo (sezione e dettaglio controtelaio) si prepara dopo il sopralluogo.</text>';
    }
    // tabella
    var rows=[['1. Anta',g.lh,g.lw],['2. Telaio – esterno',fm?'—':g.fh,fm?'—':g.fw],['2. Telaio – battuta (interno)',fm?'—':g.rh,fm?'—':g.rw],['3. Ingombro con coprifili ('+T.archi+')',fm?'—':g.oh,fm?'—':g.ow],['Luce netta di passaggio (L Poss)','—',g.lp],['4. Profondità sezione',bat?('telaio '+g.jamb+(g.ext?' + est. '+g.ext:'')):'—','= '+g.wall]];
    var tx=562,ty=670;o+='<rect x="'+tx+'" y="'+ty+'" width="496" height="'+(26+rows.length*26)+'" fill="#fff" stroke="#1a2028"/><rect x="'+tx+'" y="'+ty+'" width="496" height="26" fill="#e3e8f0" stroke="#1a2028"/>';
    o+='<text x="'+(tx+136)+'" y="'+(ty+18)+'" text-anchor="middle" class="tl">Dimensione (mm)</text><text x="'+(tx+342)+'" y="'+(ty+18)+'" text-anchor="middle" class="tl">Altezza</text><text x="'+(tx+454)+'" y="'+(ty+18)+'" text-anchor="middle" class="tl">Larghezza</text>';
    rows.forEach(function(r,i){var yy=ty+26*(i+1);o+='<path d="M'+tx+' '+(yy)+'H'+(tx+496)+'M'+(tx+273)+' '+ty+'V'+(ty+26*(rows.length+1))+'M'+(tx+412)+' '+ty+'V'+(ty+26*(rows.length+1))+'" stroke="#1a2028" stroke-width=".8"/><text x="'+(tx+136)+'" y="'+(yy+18)+'" text-anchor="middle" class="tl" style="font-weight:500">'+r[0]+'</text><text x="'+(tx+342)+'" y="'+(yy+18)+'" text-anchor="middle" class="tl" style="font-weight:500">'+r[1]+'</text><text x="'+(tx+454)+'" y="'+(yy+18)+'" text-anchor="middle" class="tl" style="font-weight:500">'+r[2]+'</text>'});
    // prospetto
    o+='<text x="1108" y="130" class="th">Prospetto – lato apertura (mm)</text>';
    o+=elevation(p,c,g,1110,140,540,880,LBL);
    o+='<text x="1124" y="1066" class="th">'+(right?'DESTRA – cerniere a destra, vista dal lato apertura':'SINISTRA – cerniere a sinistra, vista dal lato apertura')+'</text>';
    var sp=(p.specs||[]).filter(function(s){return /Telaio|Coprifilo|Rivestimento|Cerniere|Serratura|Guarnizione|Pannello/.test(s[0])}).map(function(s){return s[0]+': '+s[1]});
    o+='<text x="50" y="1004" class="tl" style="font-weight:500">'+esc(sp.slice(0,4).join('  ·  '))+'</text><text x="50" y="1022" class="tl" style="font-weight:500">'+esc(sp.slice(4).join('  ·  '))+(c.ex&&c.ex.stipiti?'  ·  Allargamento stipiti':'')+(c.ex&&c.ex.vetro?'  ·  Con vetro':'')+'</text>';
    o+='<text x="50" y="1056" class="ts">'+(bat?'Porta ridotta rispetto al vano (L −30, H −40): gioco di fissaggio 15 per lato, 40 in testa. Telaio sp. 27, giochi anta 3 per lato/testa, 10 sotto l\'anta, senza soglia.':'Schema indicativo: per '+esc(op.label.toLowerCase())+' le misure dell\'anta si definiscono con il disegno esecutivo dopo il sopralluogo.')+'</text>';
    o+='<text x="50" y="1074" class="ts">Disegno generato dalle misure inserite: le misure definitive si confermano con il rilievo in cantiere prima della produzione.</text>';
    return o+'</svg>';
  }
  function quote(p,c){return p.type==='door'?doorQuote(p,c):p.type==='cube'?cubeQuote(p,c):furnQuote(p,c)}
  function defaultCfg(p,sub){
    if(p.type==='cube')return cubeDefault(p);
    if(p.type==='door'){
      var open=sub==='scorrevoli'?'scorrevole-esterno':sub==='filo-muro'?'filo-muro':'battente';
      var dc={open:open,size:'80',w:80,h:210,ex:{},fin:p.finishes[0],ral:p.line==='laminata'?'':'9010',hand:'dx',wall:PR.door.tech.stdWall};if(p.onlyOpen)dc.open=p.onlyOpen;stdVano(dc);return dc;
    }
    var s=p.std[0];return{size:0,w:s.w,d:s.d,h:s.h,fin:p.finishes[0],ral:p.finishes[0]==='Laccato RAL'?'9010':''};
  }
  function fromPrice(p,sub){
    if(p.type==='cube')return cubeQuote(p,cubeDefault(p)).unit;
    if(p.type==='door')return doorQuote(p,defaultCfg(p,sub)).unit;
    return Math.min.apply(null,p.std.map(function(s){return s.price}));
  }
  function cfgSummary(p,c){
    if(p.type==='cube'){var D=cubeDims(c),cnt={};(c.cells||[]).forEach(function(x){if(x!=='vuoto')cnt[x]=(cnt[x]||0)+1});
      var ins=PR.cube.inserts.filter(function(i){return cnt[i.id]}).map(function(i){return cnt[i.id]+' '+i.label.toLowerCase()});
      var b=PR.cube.bases.find(function(x){return x.id===c.base});
      return [c.cols+'×'+c.rows+' vani da '+c.cube+' cm',D.w+'×'+c.depth+'×'+D.h+' cm',c.fin==='Laccato RAL'?'RAL '+(c.ral||''):c.fin].concat(ins).concat(b&&b.id!=='nessuna'?[b.label]:[]).join(' · ')}
    if(p.type==='door'){
      var op=opening(c.open), ex=PR.door.extras.filter(function(x){return c.ex&&c.ex[x.id]&&extraOk(x,c)}).map(function(x){return x.label.split(' (')[0]});
      var g=doorGeom(c);return [op.label+(c.hand==='sx'?' sinistra':' destra'), c.size==='custom'?'vano '+c.vw+'×'+c.vh+' mm, muro '+c.wall+' mm (anta '+g.lw+'×'+g.lh+')':c.w+'×'+PR.door.height+' cm, muro '+c.wall+' mm', p.line==='laminata'?p.finishes[0]:'RAL '+(c.ral||'da scegliere')].concat(ex).join(' · ');
    }
    var s=c.size==='custom'?{w:c.w,d:c.d,h:c.h}:(p.std[c.size|0]||p.std[0]);
    return s.w+'×'+s.d+'×'+s.h+' cm'+(c.size==='custom'?' (su misura)':'')+' · '+(c.fin==='Laccato RAL'?'RAL '+(c.ral||'da scegliere'):c.fin);
  }

  /* ---------- numeri animati ---------- */
  function tween(el,to,fmt){
    fmt=fmt||function(v){return eur.format(v)};
    var from=parseFloat(el.dataset.v||to)||0;el.dataset.v=to;
    if(RM||from===to){el.textContent=fmt(to);return}
    var t0=performance.now(),d=520;
    (function f(t){var k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,4);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(f)})(t0);
    if(el.animate)el.animate([{transform:'translateY(-3px)',color:'#c0392b'},{transform:'none'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)'});
  }

  /* ---------- card prodotto ---------- */
  function card(p,sub){
    var fav=favs.indexOf(p.id)>=0, s=p.std&&p.std[0];
    var price=fromPrice(p,sub), many=p.type==='door'||(p.std&&p.std.length>1)||p.custom;
    var top=p.type==='door'?'<span class="s-card-line"><i></i>'+esc(p.lineLabel)+'</span>':'';
    if(p.type==='cube'){var cc=cubeDefault(p),cd=cubeDims(cc);p._thumb=svgURI(cubeSVG(cc));s={w:cd.w,d:cc.depth,h:cd.h};p.std=null}
    var dims=p.type==='cube'?'<span class="s-dim">'+s.w+' × '+s.d+' × '+s.h+' cm · '+p.preset.cols*p.preset.rows+' vani</span>':s?'<span class="s-dim">'+s.w+' × '+s.d+' × '+s.h+' cm'+(p.std.length>1?' · '+p.std.length+' misure':'')+'</span>':'<span class="s-dim">L 60–90 × H 210 cm · anche fuori misura</span>';
    var sw='<span class="s-swatches">'+(p.finishes||[]).slice(0,5).map(function(f){return '<i title="'+esc(f)+'" style="background:'+swatch(f)+'"></i>'}).join('')+'</span>';
    return '<article class="s-card" data-type="'+p.type+'" data-id="'+esc(p.id)+'">'
      +'<div class="s-card-img" data-open="'+esc(p.id)+'" role="button" tabindex="-1" aria-label="Apri '+esc(p.name)+'"><img '+(p._thumb?'src="'+p._thumb+'"':imgAttrs(p))+' alt="'+esc(p.name)+'" loading="lazy" decoding="async"><span class="glare"></span>'
      +(p.badge?'<span class="s-badge">'+esc(p.badge)+'</span>':'')+(p.custom||p.type==='door'?'<span class="s-badge g r2">Su misura</span>':'')
      +'<button class="s-card-q" type="button" data-open="'+esc(p.id)+'">'+IC.eye+'Configura</button></div>'
      +top+'<h3><a href="'+pURL(p)+'" data-open="'+esc(p.id)+'">'+esc(p.name)+'</a></h3><p class="s-desc">'+esc(p.desc||'')+'</p>'+dims+sw
      +'<div class="s-price">'+(many?'<small>da</small>':'')+eur.format(price)+(p.type==='door'?'<span>IVA escl. · posa inclusa</span>':'')+'</div>'
      +'<div class="s-card-foot"><button class="s-add" type="button" data-add="'+esc(p.id)+'" aria-label="Aggiungi '+esc(p.name)+' al carrello">'+IC.plus+'<span>Aggiungi</span></button>'
      +'<button class="s-fav" type="button" data-fav="'+esc(p.id)+'" aria-pressed="'+fav+'" aria-label="Salva nei preferiti">'+IC.heart+'</button></div>'
      +'</article>';
  }
  function byId(id){return P.find(function(x){return x.id===id})}
  function pURL(p){return '/shop/'+p.cat+'/'+p.id+'/'}
  function bindCards(root,sub){
    $$('[data-open]',root).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();openProduct(b.dataset.open,sub,b.closest('.s-card'))})});
    $$('[data-add]',root).forEach(function(b){b.onclick=function(){
      var p=byId(b.dataset.add);if(!p)return;
      var img=b.closest('.s-card').querySelector('.s-card-img img');
      addToCart(p,defaultCfg(p,sub),1,img);
      b.classList.add('done');b.innerHTML=IC.check+'<span>Aggiunto</span>';
      setTimeout(function(){b.classList.remove('done');b.innerHTML=IC.plus+'<span>Aggiungi</span>'},1600);
    }});
    $$('[data-fav]',root).forEach(function(b){b.onclick=function(){toggleFav(b.dataset.fav,b)}});
    if(FINE&&!RM)$$('.s-card-img',root).forEach(tilt);
  }
  function toggleFav(id,b){
    var i=favs.indexOf(id);if(i>=0)favs.splice(i,1);else{favs.push(id);burst(b)}
    store('pdShopFav',favs);
    $$('[data-fav="'+id+'"]').forEach(function(x){x.setAttribute('aria-pressed',i<0);x.classList.remove('pop');void x.offsetWidth;x.classList.add('pop')});
    counts('fav');
  }
  function burst(el){
    if(RM||!el||!el.animate)return;var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    for(var k=0;k<8;k++){var d=document.createElement('i');d.className='s-heart-burst';d.style.left=cx+'px';d.style.top=cy+'px';document.body.appendChild(d);
      var a=k/8*Math.PI*2;d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate('+(Math.cos(a)*30-3)+'px,'+(Math.sin(a)*30-3)+'px) scale(.2)',opacity:0}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=(function(n){return function(){n.remove()}})(d)}
  }
  function tilt(el){
    var g=el.querySelector('.glare');
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.transform='perspective(900px) rotateX('+((.5-y)*6)+'deg) rotateY('+((x-.5)*8)+'deg)';
      if(g){g.style.setProperty('--gx',x*100+'%');g.style.setProperty('--gy',y*100+'%')}});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  }

  /* ---------- carrello ---------- */
  function counts(which){
    var n=cart.reduce(function(a,l){return a+(l.qty||1)},0);
    var cn=$('#s-cart-n'),fn=$('#s-fav-n');
    if(cn){cn.textContent=n;cn.dataset.n=n}
    if(fn){fn.textContent=favs.length;fn.dataset.n=favs.length}
    var b=which==='fav'?$('#s-fav-btn'):which==='cart'?$('#s-cart-btn'):null;
    if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
  }
  function addToCart(p,c,qty,fromImg){
    var q=quote(p,c), key=p.id+'|'+JSON.stringify(c);
    var ex=cart.find(function(l){return l.key===key});
    if(ex)ex.qty+=qty;else cart.push({key:key,id:p.id,type:p.type,name:p.name,img:p.type==='cube'?svgURI(cubeSVG(c)):p.img,remote:p.imgRemote||p.imgFb||'',sum:cfgSummary(p,c),unit:q.unit,iva:p.type==='door'?'escl':'incl',qty:qty});
    store('pdShopCart2',cart);
    fly(fromImg,function(){counts('cart')});
    toast(p.name+' nel carrello');
  }
  function fly(img,done){
    var tgt=$('#s-cart-btn');
    if(RM||!img||!tgt||!document.body.animate){done();return}
    var a=img.getBoundingClientRect(),b=tgt.getBoundingClientRect();
    var f=document.createElement('div');f.className='s-fly';f.style.cssText='left:'+a.left+'px;top:'+a.top+'px;width:'+a.width+'px;height:'+a.height+'px';
    f.innerHTML='<img src="'+esc(img.tagName==='svg'?svgURI(img.outerHTML):(img.currentSrc||img.src))+'" alt="">';document.body.appendChild(f);
    var dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
    f.animate([{transform:'translate(0,0) scale(1)',opacity:1,borderRadius:'14px'},{transform:'translate('+dx*.55+'px,'+(dy*.55-120)+'px) scale(.45) rotate(-8deg)',opacity:1,offset:.55},{transform:'translate('+dx+'px,'+dy+'px) scale(.06) rotate(-16deg)',opacity:.4,borderRadius:'50%'}],{duration:850,easing:'cubic-bezier(.5,0,.2,1)'}).onfinish=function(){f.remove();done()};
  }
  var tT;
  function toast(msg){
    var t=$('#s-toast');if(!t){t=document.createElement('div');t.id='s-toast';t.className='s-toast';t.setAttribute('role','status');document.body.appendChild(t)}
    t.innerHTML='<i>'+IC.check+'</i><span>'+esc(msg)+'</span><button type="button">Vedi carrello</button>';
    t.querySelector('button').onclick=function(){t.classList.remove('show');openDrawer('cart')};
    requestAnimationFrame(function(){t.classList.add('show')});clearTimeout(tT);tT=setTimeout(function(){t.classList.remove('show')},3200);
  }
  function orderText(){
    var tot=0,s='Ordine dal Pandoora Shop:\n\n';
    cart.forEach(function(l){tot+=l.unit*l.qty;s+='• '+l.qty+' × '+l.name+' — '+l.sum+' — '+eur.format(l.unit*l.qty)+(l.iva==='escl'?' (IVA escl.)':'')+'\n'});
    return s+'\nTotale indicativo: '+eur.format(tot)+'\n\nNome:\nComune di consegna:\nTelefono:';
  }
  function openDrawer(mode){
    var b=$('#s-drawer-b'),f=$('#s-drawer-f'),t=$('#s-drawer-t');if(!b)return;
    if(mode==='fav'){
      t.textContent='Preferiti';
      var list=P.filter(function(p){return favs.indexOf(p.id)>=0});
      b.innerHTML=list.length?list.map(function(p,i){return '<div class="s-cl'+(p.type==='door'?' door':'')+'" style="--i:'+i+'"><img '+imgAttrs(p)+' alt=""><div><b>'+esc(p.name)+'</b><small>'+esc(p.desc||'')+'</small><div class="s-cl-act"><button type="button" data-o="'+esc(p.id)+'">Configura</button><button type="button" data-uf="'+esc(p.id)+'">Rimuovi</button></div></div><b>'+eur.format(fromPrice(p))+'</b></div>'}).join(''):'<p>Non avete ancora salvato prodotti. Toccate il cuore su una scheda per ritrovarla qui.</p>';
      f.innerHTML='';
      $$('[data-o]',b).forEach(function(x){x.onclick=function(){closeDrawer();openProduct(x.dataset.o)}});
      $$('[data-uf]',b).forEach(function(x){x.onclick=function(){toggleFav(x.dataset.uf);openDrawer('fav')}});
    } else {
      t.textContent='Carrello';
      if(!cart.length){
        b.innerHTML='<p>Il carrello è vuoto.</p><p>Scegliete un prodotto e configuratelo: misura, finitura e opzioni. Il prezzo si aggiorna mentre scegliete.</p>';
        f.innerHTML='<a class="s-btn s-btn-o" href="/shop/">Vai al negozio</a>';
      } else {
        var tot=0,ex=0;
        b.innerHTML=cart.map(function(l,i){tot+=l.unit*l.qty;if(l.iva==='escl')ex=1;return '<div class="s-cl'+(l.type==='door'?' door':'')+'" style="--i:'+i+'"><img src="'+esc(l.img)+'" data-fb="'+esc(l.remote||'')+'" alt=""><div><b>'+esc(l.name)+'</b><small>'+esc(l.sum)+'</small><div class="s-cl-act"><div class="s-qty"><button type="button" data-q="'+i+'" data-d="-1" aria-label="Meno">−</button><output>'+l.qty+'</output><button type="button" data-q="'+i+'" data-d="1" aria-label="Più">+</button></div><button type="button" data-rm="'+i+'">Rimuovi</button></div></div><b>'+eur.format(l.unit*l.qty)+'</b></div>'}).join('');
        f.innerHTML='<div class="s-total"><span>Totale indicativo</span><b id="s-tot">'+eur.format(tot)+'</b></div>'
          +'<a class="s-btn s-btn-p" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent(orderText())+'">Invia l\'ordine su WhatsApp</a>'
          +'<a class="s-btn s-btn-o" href="mailto:'+MAIL+'?subject='+encodeURIComponent('Ordine Pandoora Shop')+'&body='+encodeURIComponent(orderText())+'">Invia per email</a>'
          +'<p class="s-note">Il pagamento online arriva a breve: per ora confermiamo l\'ordine con voi'+(ex?'. Porte: IVA esclusa, posa inclusa in Veneto e FVG':'')+'.</p>';
        $$('[data-rm]',b).forEach(function(x){x.onclick=function(){cart.splice(+x.dataset.rm,1);store('pdShopCart2',cart);counts();openDrawer('cart')}});
        $$('[data-q]',b).forEach(function(x){x.onclick=function(){var l=cart[+x.dataset.q];l.qty=clamp(l.qty+(+x.dataset.d),1,99);store('pdShopCart2',cart);counts();openDrawer('cart')}});
      }
    }
    document.body.classList.add('s-cart-open');window.PDM&&window.PDM.stop();
    $('#s-drawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){document.body.classList.remove('s-cart-open');window.PDM&&window.PDM.start();var d=$('#s-drawer');if(d)d.setAttribute('aria-hidden','true')}

  /* ---------- scheda prodotto / configuratore ---------- */
  var PM=null,lastFocus=null;
  function ensurePM(){
    if(PM)return PM;
    PM=document.createElement('div');PM.className='s-pm';PM.setAttribute('role','dialog');PM.setAttribute('aria-modal','true');PM.setAttribute('aria-labelledby','s-pm-t');
    PM.innerHTML='<div class="s-pm-scrim" data-close></div><div class="s-pm-box" data-lenis-prevent><button class="s-pm-x" type="button" data-close aria-label="Chiudi">'+IC.x+'</button><div class="s-pm-media"></div><div class="s-pm-body"><div class="s-pm-scroll"></div><div class="s-pm-foot"></div></div></div>';
    document.body.appendChild(PM);
    $$('[data-close]',PM).forEach(function(x){x.onclick=closeProduct});
    PM.addEventListener('keydown',function(e){if(e.key==='Tab'){var f=$$('button,input,select,a[href]',PM).filter(function(n){return !n.disabled&&n.offsetParent}),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
    return PM;
  }
  function openProduct(id,sub,fromCard){
    var p=byId(id);if(!p)return;
    sub=sub||(document.body.dataset.cat?(location.hash||'').slice(1):'');
    lastFocus=document.activeElement;
    var m=ensurePM(),c=defaultCfg(p,sub),qty=1;
    var media=$('.s-pm-media',m),sc=$('.s-pm-scroll',m),ft=$('.s-pm-foot',m);
    if(p.type==='cube'){openCube(p,m,media,sc,ft);return}
    if(p.type==='door'){openDoor(p,m,media,sc,ft,sub);return}
    media.className='s-pm-media'+(p.type==='door'?' door':'');
    media.innerHTML='<img '+imgAttrs(p,true)+' alt="'+esc(p.name)+'">'+(p.type==='door'&&p.line!=='laminata'?'<canvas class="s-pm-tint" data-src="'+esc(p.imgLg)+'" aria-hidden="true"></canvas>':'')+'<span class="s-pm-dims" id="s-pm-dims"></span><span class="s-pm-ral" id="s-pm-ral"></span>';
    var html='';
    if(p.type==='door'){
      html+='<span class="s-card-line"><i></i>'+esc(p.lineLabel)+'</span><h2 id="s-pm-t">'+esc(p.name)+'</h2><p class="s-pm-desc">'+esc(p.desc)+'. '+esc(p.long)+'</p>';
      html+='<fieldset class="s-opt"><legend>Apertura</legend><div class="s-chips" id="o-open">'+PR.door.openings.map(function(o){var dis=o.onlyLacc&&p.line==='laminata';return '<button type="button" class="s-chip" data-v="'+o.id+'"'+(dis?' disabled title="Solo per porte laccate"':'')+'>'+esc(o.label)+'</button>'}).join('')+'</div><p class="s-note" id="o-open-n"></p></fieldset>';
      html+='<fieldset class="s-opt"><legend>Larghezza anta <small>altezza '+PR.door.height+' cm</small></legend><div class="s-chips" id="o-size">'+PR.door.widths.map(function(w){return '<button type="button" class="s-chip" data-v="'+w+'">'+w+' cm</button>'}).join('')+'<button type="button" class="s-chip" data-v="custom">Fuori misura</button></div>'
        +'<div class="s-dims two" id="o-cust" hidden><label>Larghezza (cm)<input type="number" inputmode="numeric" id="o-w" min="'+PR.door.fuoriMisura.wMin+'" max="'+PR.door.fuoriMisura.wMax+'"><small>'+PR.door.fuoriMisura.wMin+'–'+PR.door.fuoriMisura.wMax+'</small></label><label>Altezza (cm)<input type="number" inputmode="numeric" id="o-h" min="'+PR.door.fuoriMisura.hMin+'" max="'+PR.door.fuoriMisura.hMax+'"><small>'+PR.door.fuoriMisura.hMin+'–'+PR.door.fuoriMisura.hMax+'</small></label></div><p class="s-note" id="o-cust-n" hidden>'+esc(PR.door.fuoriMisura.note)+'</p></fieldset>';
      html+='<fieldset class="s-opt"><legend>Opzioni</legend>'+PR.door.extras.map(function(x){return '<label class="s-check" data-x="'+x.id+'"><input type="checkbox" value="'+x.id+'">'+esc(x.label)+'<em>+'+eur.format(x.add)+'</em></label>'}).join('')+'</fieldset>';
      if(p.line!=='laminata')html+=ralPicker();
      else html+='<div class="s-opt"><b>Finitura</b><div class="s-chips"><span class="s-chip on"><i style="background:'+swatch(p.finishes[0])+'"></i>'+esc(p.finishes[0])+'</span></div></div>';
      html+='<dl class="s-specs"><dt>Telaio</dt><dd>Legno listellare</dd><dt>Pannello</dt><dd>'+(p.line==='pantografata'?'Copertine HDF idro 8 mm, 44 mm totali':'44 mm, anima alveolare')+'</dd><dt>Cerniere</dt><dd>3 a scomparsa</dd><dt>Serratura</dt><dd>Magnetica, cromo satinato</dd><dt>Coprifilo</dt><dd>Multistrato 7/9</dd><dt>Produzione</dt><dd>Fontanelle (TV) · laccate in 6–8 settimane</dd></dl>';
    } else {
      html+='<span class="s-card-line"><i></i>'+esc(catName(p.cat))+'</span><h2 id="s-pm-t">'+esc(p.name)+'</h2><p class="s-pm-desc">'+esc(p.desc)+'.</p>';
      html+='<fieldset class="s-opt"><legend>Misura <small>L × P × H</small></legend><div class="s-chips" id="o-size">'+p.std.map(function(s,i){return '<button type="button" class="s-chip" data-v="'+i+'">'+s.w+'×'+s.d+'×'+s.h+'</button>'}).join('')+(p.custom?'<button type="button" class="s-chip" data-v="custom">Su misura</button>':'')+'</div>'
        +'<div class="s-dims" id="o-cust" hidden>'+['w','d','h'].map(function(k){var L=p.limits[k],n={w:'Larghezza',d:'Profondità',h:'Altezza'}[k];return '<label>'+n+'<input type="number" inputmode="numeric" id="o-'+k+'" min="'+L[0]+'" max="'+L[1]+'"><small>'+L[0]+'–'+L[1]+' cm</small></label>'}).join('')+'</div><p class="s-note" id="o-cust-n" hidden>Costruito al centimetro nel nostro stabilimento: +'+PR.furniture.customPerc+'% sul prezzo in proporzione alla misura.</p></fieldset>';
      html+='<fieldset class="s-opt"><legend>Finitura</legend><div class="s-chips" id="o-fin">'+p.finishes.map(function(f){return '<button type="button" class="s-chip" data-v="'+esc(f)+'"><i style="background:'+swatch(f)+'"></i>'+esc(f)+(f==='Laccato RAL'?' <small>+'+PR.furniture.ralPerc+'%</small>':'')+'</button>'}).join('')+'</div></fieldset>';
      if(p.finishes.indexOf('Laccato RAL')>=0)html+=ralPicker(true);
    }
    html+='<ul class="s-break" id="s-break"></ul>';
    sc.innerHTML=html;sc.scrollTop=0;
    ft.innerHTML='<div class="s-qty"><button type="button" id="q-m" aria-label="Meno">−</button><output id="q-v">1</output><button type="button" id="q-p" aria-label="Più">+</button></div><div class="s-pm-total"><b id="s-pm-tot" data-v="0">—</b><small id="s-pm-iva"></small></div><button class="s-btn s-btn-p" type="button" id="s-pm-add">'+IC.bag+'Aggiungi al carrello</button>';

    function sel(group,v){$$('#'+group+' .s-chip',sc).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v)===String(v))})}
    function upd(){
      if(p.type==='door'){
        sel('o-open',c.open);sel('o-size',c.size);
        var op=opening(c.open);$('#o-open-n',sc).textContent=op.note+(op.min>PR.door.lines[p.line]?' · da '+eur.format(op.min):'');
        $$('.s-check',sc).forEach(function(l){var x=PR.door.extras.find(function(e){return e.id===l.dataset.x}),ok=extraOk(x,c);l.classList.toggle('off',!ok);var i=l.querySelector('input');i.checked=!!(c.ex[x.id]&&ok)});
        var cu=c.size==='custom';$('#o-cust',sc).hidden=!cu;$('#o-cust-n',sc).hidden=!cu;
        if(!cu){c.w=+c.size;c.h=PR.door.height}
        $('#s-pm-dims').textContent=c.w+' × '+c.h+' cm';
      } else {
        sel('o-size',c.size);sel('o-fin',c.fin);
        var cu2=c.size==='custom';$('#o-cust',sc).hidden=!cu2;$('#o-cust-n',sc).hidden=!cu2;
        if(!cu2){var s=p.std[c.size];c.w=s.w;c.d=s.d;c.h=s.h}
        var rb=$('#o-ral',sc);if(rb)rb.hidden=c.fin!=='Laccato RAL';
        $('#s-pm-dims').textContent=c.w+' × '+c.d+' × '+c.h+' cm';
      }
      ['w','d','h'].forEach(function(k){var i=$('#o-'+k,sc);if(i&&document.activeElement!==i)i.value=c[k]});
      var rl=$('#s-pm-ral'),showRal=(p.type==='door'&&p.line!=='laminata')||c.fin==='Laccato RAL';
      if(rl){var R=RALS.find(function(r){return r[0]===c.ral});rl.style.display=showRal&&R?'block':'none';if(R)rl.style.background=R[1]}
      var tn=$('.s-pm-tint',media);if(tn){var R2=RALS.find(function(r){return r[0]===c.ral});tintDoor(tn,R2,c.ral)}
      $$('.s-ral-sw button',sc).forEach(function(b){b.classList.toggle('on',b.dataset.r===c.ral)});
      var ri=$('#o-ral-in',sc);if(ri&&document.activeElement!==ri)ri.value=c.ral?'RAL '+c.ral:'';
      var q=quote(p,c);
      $('#s-break',sc).innerHTML=q.lines.map(function(l){return '<li><span>'+esc(l[0])+'</span><b>'+(l[1]?eur.format(l[1]):'incluso')+'</b></li>'}).join('');
      tween($('#s-pm-tot'),q.unit*qty);$('#s-pm-iva').textContent=(qty>1?qty+' pezzi · ':'')+q.note;
    }
    $$('#o-open .s-chip',sc).forEach(function(b){b.onclick=function(){c.open=b.dataset.v;upd()}});
    $$('#o-size .s-chip',sc).forEach(function(b){b.onclick=function(){var v=b.dataset.v;c.size=v==='custom'?'custom':(p.type==='door'?v:+v);upd();if(v==='custom'){var i=$('#o-w',sc);i&&i.focus()}}});
    $$('#o-fin .s-chip',sc).forEach(function(b){b.onclick=function(){c.fin=b.dataset.v;if(c.fin==='Laccato RAL'&&!c.ral)c.ral='9010';upd()}});
    $$('.s-check input',sc).forEach(function(i){i.onchange=function(){c.ex[i.value]=i.checked;upd()}});
    ['w','d','h'].forEach(function(k){var i=$('#o-'+k,sc);if(!i)return;i.oninput=function(){var v=parseInt(i.value,10);if(!isNaN(v)){c[k]=clamp(v,+i.min,+i.max);upd()}};i.onblur=function(){i.value=c[k]}});
    $$('.s-ral-sw button',sc).forEach(function(b){b.onclick=function(){c.ral=b.dataset.r;upd()}});
    var ri=$('#o-ral-in',sc);if(ri)ri.oninput=function(){var v=ri.value.replace(/\D/g,'').slice(0,4);c.ral=v;upd()};
    $('#q-m',ft).onclick=function(){qty=Math.max(1,qty-1);$('#q-v',ft).textContent=qty;upd()};
    $('#q-p',ft).onclick=function(){qty=Math.min(99,qty+1);$('#q-v',ft).textContent=qty;upd()};
    $('#s-pm-add',ft).onclick=function(){var im=$('img',media);addToCart(p,JSON.parse(JSON.stringify(c)),qty,im);setTimeout(closeProduct,250)};
    upd();
    m.classList.add('open');document.documentElement.style.overflow='hidden';
    requestAnimationFrame(function(){m.classList.add('show');var x=$('.s-pm-x',m);x&&x.focus({preventScroll:true})});
    if(!RM&&p.type==='door'){var im=$('img',media);im.animate&&im.animate([{transform:'perspective(1200px) rotateY(-55deg)',opacity:.2,transformOrigin:'0 50%'},{transform:'none',opacity:1,transformOrigin:'0 50%'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'})}
    var u=new URL(location.href);u.searchParams.set('p',id);history.replaceState(null,'',u);
  }
  function stdVano(c){var T=PR.door.tech;c.vw=c.w*10+90;c.vh=PR.door.height*10+80;}
  function openDoor(p,m,media,sc,ft,sub){
    var D=PR.door,T=D.tech,c=defaultCfg(p,sub),qty=1,view='foto';
    if(p.onlyOpen)c.open=p.onlyOpen;
    media.className='s-pm-media door'+(p.opaque?' opaque':'');
    media.innerHTML='<div class="s-pm-views" role="tablist"><button type="button" role="tab" data-view="foto" aria-selected="true">Foto</button><button type="button" role="tab" data-view="disegno" aria-selected="false">Disegno quotato</button></div>'
      +'<div class="s-pm-photo"><img '+imgAttrs(p,true)+' alt="'+esc(p.name)+'">'+(p.line!=='laminata'&&!p.opaque?'<canvas class="s-pm-tint" data-src="'+esc(p.imgLg)+'" aria-hidden="true"></canvas>':'')+'</div>'
      +'<div class="s-pm-draw" hidden></div><span class="s-pm-dims" id="s-pm-dims"></span><span class="s-pm-ral" id="s-pm-ral"></span>'
      +'<button type="button" class="s-pm-sheetbtn" id="s-sheet-open"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/></svg>Scheda tecnica completa</button>';
    var html='<span class="s-card-line"><i></i>'+esc(p.lineLabel)+'</span><h2 id="s-pm-t">'+esc(p.name)+'</h2><p class="s-pm-desc">'+esc(p.desc)+'. '+esc(p.long)+'</p>';
    html+='<fieldset class="s-opt"><legend>Apertura</legend><div class="s-chips" id="o-open">'+D.openings.map(function(o){var dis=(o.onlyLacc&&p.line==='laminata')||(p.onlyOpen&&o.id!==p.onlyOpen);return '<button type="button" class="s-chip" data-v="'+o.id+'"'+(dis?' disabled':'')+'>'+esc(o.label)+'</button>'}).join('')+'</div><p class="s-note" id="o-open-n"></p></fieldset>';
    html+='<fieldset class="s-opt"><legend>Verso <small>visto dal lato in cui la porta si apre</small></legend><div class="s-chips" id="o-hand"><button type="button" class="s-chip" data-v="sx">Sinistra · cerniere a sinistra</button><button type="button" class="s-chip" data-v="dx">Destra · cerniere a destra</button></div></fieldset>';
    html+='<fieldset class="s-opt"><legend>Misura <small>standard: anta × 210 cm</small></legend><div class="s-chips" id="o-size">'+D.widths.map(function(w){return '<button type="button" class="s-chip" data-v="'+w+'">'+w+' cm</button>'}).join('')+'<button type="button" class="s-chip" data-v="custom">Su misura del vano</button></div>'
      +'<div id="o-cust" hidden><p class="s-note" style="margin:12px 0 0">Misurate il vano a muro finito (intonaco o cartongesso già fatti). Calcoliamo noi telaio, anta e coprifili.</p><div class="s-dims">'
      +'<label>Larghezza vano<input type="number" inputmode="numeric" id="o-vw" min="'+T.vwMin+'" max="'+T.vwMax+'"><small>'+T.vwMin+'–'+T.vwMax+' mm</small></label>'
      +'<label>Altezza vano<input type="number" inputmode="numeric" id="o-vh" min="'+T.vhMin+'" max="'+T.vhMax+'"><small>'+T.vhMin+'–'+T.vhMax+' mm</small></label>'
      +'<label>Spessore muro<input type="number" inputmode="numeric" id="o-wall" min="'+T.wallMin+'" max="'+T.wallMax+'"><small>'+T.wallMin+'–'+T.wallMax+' mm</small></label></div></div>'
      +'<div class="s-dims one" id="o-wall-std"><label>Spessore muro<input type="number" inputmode="numeric" id="o-wall2" min="'+T.wallMin+'" max="'+T.wallMax+'"><small>in mm, intonaco compreso</small></label></div>'
      +'<p class="s-note s-warn" id="o-wall-n" hidden></p></fieldset>';
    html+='<div class="s-calc" id="s-calc"></div>';
    html+='<fieldset class="s-opt"><legend>Opzioni</legend>'+D.extras.map(function(x){return '<label class="s-check" data-x="'+x.id+'"><input type="checkbox" value="'+x.id+'">'+esc(x.label)+'<em>+'+eur.format(x.add)+'</em></label>'}).join('')+'</fieldset>';
    if(p.line!=='laminata')html+=ralPicker();
    else html+='<div class="s-opt"><b>Finitura</b><div class="s-chips"><span class="s-chip on"><i style="background:'+swatch(p.finishes[0])+'"></i>'+esc(p.finishes[0])+'</span></div></div>';
    html+='<div class="s-opt"><b>Caratteristiche standard <small>dal catalogo 2026</small></b><dl class="s-specs">'+(p.specs||[]).map(function(s){return '<dt>'+esc(s[0])+'</dt><dd>'+esc(s[1])+'</dd>'}).join('')+'<dt>Produzione</dt><dd>Fontanelle (TV) · laccate in 6–8 settimane</dd></dl></div>';
    html+='<ul class="s-break" id="s-break"></ul>';
    sc.innerHTML=html;sc.scrollTop=0;
    ft.innerHTML='<div class="s-qty"><button type="button" id="q-m" aria-label="Meno">−</button><output id="q-v">1</output><button type="button" id="q-p" aria-label="Più">+</button></div><div class="s-pm-total"><b id="s-pm-tot" data-v="0">—</b><small id="s-pm-iva"></small></div><button class="s-btn s-btn-p" type="button" id="s-pm-add">'+IC.bag+'Aggiungi al carrello</button>';
    var draw=$('.s-pm-draw',media),photo=$('.s-pm-photo',media);
    function setView(v){view=v;$$('.s-pm-views button',media).forEach(function(b){b.setAttribute('aria-selected',b.dataset.view===v)});photo.hidden=v!=='foto';draw.hidden=v!=='disegno';media.classList.toggle('drawing',v==='disegno');if(v==='disegno'&&!RM&&draw.animate)draw.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'})}
    $$('.s-pm-views button',media).forEach(function(b){b.onclick=function(){setView(b.dataset.view)}});
    $('#s-sheet-open',media).onclick=function(){openSheet(p,c)};
    function sel(g,v){$$('#'+g+' .s-chip',sc).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v)===String(v))})}
    function upd(){
      if(p.onlyOpen)c.open=p.onlyOpen;
      if(opening(c.open).onlyLacc&&p.line==='laminata')c.open='battente';
      sel('o-open',c.open);sel('o-size',c.size);sel('o-hand',c.hand);
      var op=opening(c.open);$('#o-open-n',sc).textContent=op.note+(op.min>D.lines[p.line]?' · da '+eur.format(op.min):'');
      $$('.s-check',sc).forEach(function(l){var x=D.extras.find(function(e){return e.id===l.dataset.x}),ok=extraOk(x,c);l.classList.toggle('off',!ok);l.querySelector('input').checked=!!(c.ex[x.id]&&ok)});
      var cu=c.size==='custom';$('#o-cust',sc).hidden=!cu;$('#o-wall-std',sc).hidden=cu;
      if(!cu){c.w=+c.size;stdVano(c)}
      ['vw','vh','wall'].forEach(function(k){var i=$('#o-'+k,sc);if(i&&document.activeElement!==i)i.value=c[k]});var w2=$('#o-wall2',sc);if(document.activeElement!==w2)w2.value=c.wall;
      var g=doorGeom(c);
      var wn=$('#o-wall-n',sc);
      if(c.wall>T.stipitiOver&&!c.ex.stipiti&&c.open==='battente'){wn.hidden=false;wn.innerHTML='Muro da '+c.wall+' mm: serve un\'estensione di '+g.ext+' mm sul telaio. Vi consigliamo l\'<button type="button" id="o-addst">allargamento stipiti</button>.';$('#o-addst',sc).onclick=function(){c.ex.stipiti=true;upd()}}
      else if(c.wall<T.jamb&&c.open==='battente'){wn.hidden=false;wn.textContent='Muro più sottile del telaio da '+T.jamb+' mm: il telaio sporge di '+(T.jamb-c.wall)+' mm, i coprifili coprono il gioco. Lo verifichiamo al rilievo.'}
      else wn.hidden=true;
      $('#s-calc',sc).innerHTML='<b>Cosa produciamo per questo vano'+(c.open==='battente'?'':' <small style="font-weight:600;opacity:.7">(indicativo)</small>')+'</b><dl><dt>Anta</dt><dd>'+g.lw+' × '+g.lh+' mm</dd>'+(c.open==='filo-muro'?'':'<dt>Telaio esterno</dt><dd>'+g.fw+' × '+g.fh+' mm</dd><dt>Ingombro coprifili</dt><dd>'+g.ow+' × '+g.oh+' mm</dd>')+'<dt>Passaggio netto</dt><dd>'+g.lp+' mm</dd>'+(c.open==='battente'?'<dt>Telaio + estensione</dt><dd>'+g.jamb+(g.ext?' + '+g.ext:'')+' = '+c.wall+' mm</dd>':'')+'</dl><button type="button" class="s-link" id="s-calc-draw">Vedi il disegno quotato</button>';
      $('#s-calc-draw',sc).onclick=function(){setView('disegno');media.scrollIntoView&&media.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'})};
      draw.innerHTML=doorElevSVG(p,c);
      $('#s-pm-dims').textContent=cu?'Vano '+c.vw+' × '+c.vh+' mm':(c.w+' × '+D.height+' cm');
      var rl=$('#s-pm-ral'),R=RALS.find(function(r){return r[0]===c.ral});if(rl){rl.style.display=p.line!=='laminata'&&R?'block':'none';if(R)rl.style.background=R[1]}
      var tn=$('.s-pm-tint',media);if(tn)tintDoor(tn,R,c.ral)
      $$('.s-ral-sw button',sc).forEach(function(b){b.classList.toggle('on',b.dataset.r===c.ral)});
      var ri=$('#o-ral-in',sc);if(ri&&document.activeElement!==ri)ri.value=c.ral?'RAL '+c.ral:'';
      var q=doorQuote(p,c);
      $('#s-break',sc).innerHTML=q.lines.map(function(l){return '<li><span>'+esc(l[0])+'</span><b>'+(l[1]?eur.format(l[1]):'incluso')+'</b></li>'}).join('');
      tween($('#s-pm-tot'),q.unit*qty);$('#s-pm-iva').textContent=(qty>1?qty+' pezzi · ':'')+q.note;
    }
    $$('#o-open .s-chip',sc).forEach(function(b){b.onclick=function(){c.open=b.dataset.v;upd()}});
    $$('#o-hand .s-chip',sc).forEach(function(b){b.onclick=function(){c.hand=b.dataset.v;upd()}});
    $$('#o-size .s-chip',sc).forEach(function(b){b.onclick=function(){var v=b.dataset.v;if(v==='custom'){c.size='custom'}else{c.size=v}upd();if(v==='custom'){setView('disegno');var i=$('#o-vw',sc);i&&i.focus()}}});
    $$('.s-check input',sc).forEach(function(i){i.onchange=function(){c.ex[i.value]=i.checked;upd()}});
    function numIn(id,k){var i=$('#'+id,sc);if(!i)return;var t;i.oninput=function(){clearTimeout(t);t=setTimeout(function(){var v=parseInt(i.value,10);if(!isNaN(v)&&v>=+i.min&&v<=+i.max){c[k]=v;upd()}},250)};i.onblur=function(){var v=parseInt(i.value,10);if(!isNaN(v)){c[k]=clamp(v,+i.min,+i.max);upd()}i.value=c[k]}}
    numIn('o-vw','vw');numIn('o-vh','vh');numIn('o-wall','wall');numIn('o-wall2','wall');
    $$('.s-ral-sw button',sc).forEach(function(b){b.onclick=function(){c.ral=b.dataset.r;upd()}});
    var ri=$('#o-ral-in',sc);if(ri)ri.oninput=function(){c.ral=ri.value.replace(/\D/g,'').slice(0,4);upd()};
    $('#q-m',ft).onclick=function(){qty=Math.max(1,qty-1);$('#q-v',ft).textContent=qty;upd()};
    $('#q-p',ft).onclick=function(){qty=Math.min(99,qty+1);$('#q-v',ft).textContent=qty;upd()};
    $('#s-pm-add',ft).onclick=function(){var im=view==='foto'?$('img',photo):$('svg',draw);addToCart(p,JSON.parse(JSON.stringify(c)),qty,im);setTimeout(closeProduct,250)};
    upd();showPM(m,p.id);
    if(!RM){var im=$('img',photo);im.animate&&im.animate([{transform:'perspective(1200px) rotateY(-55deg)',opacity:.2,transformOrigin:'0 50%'},{transform:'none',opacity:1,transformOrigin:'0 50%'}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'})}
  }
  /* scheda tecnica a tutto schermo, stampabile */
  function openSheet(p,c){
    var o=document.getElementById('s-sheet');
    if(!o){o=document.createElement('div');o.id='s-sheet';o.className='s-sheet';o.setAttribute('data-lenis-prevent','');o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Scheda tecnica');document.body.appendChild(o)}
    o.innerHTML='<div class="s-sheet-bar"><b>Scheda tecnica · '+esc(p.name)+'</b><span>Misure in millimetri · pizzicate o ruotate il telefono per ingrandire</span><button type="button" class="s-btn s-btn-o" id="s-sheet-print">Stampa o salva PDF</button><button type="button" class="s-x" id="s-sheet-x" aria-label="Chiudi">'+IC.x+'</button></div><div class="s-sheet-body">'+doorSheetSVG(p,c)+'</div>';
    o.classList.add('open');
    requestAnimationFrame(function(){o.classList.add('show')});
    $('#s-sheet-x',o).onclick=function(){o.classList.remove('show');setTimeout(function(){o.classList.remove('open')},300)};
    $('#s-sheet-print',o).onclick=function(){
      var w=window.open('','_blank');if(!w)return;
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Scheda tecnica '+esc(p.name)+'</title><style>@page{size:A4 landscape;margin:8mm}html,body{margin:0}svg{width:100%;height:auto;display:block}</style></head><body>'+doorSheetSVG(p,c)+'<script>setTimeout(function(){print()},300)<\/script></body></html>');w.document.close();
    };
  }
  function showPM(m,id){
    window.PDM&&window.PDM.stop();
    m.classList.add('open');document.documentElement.style.overflow='hidden';
    requestAnimationFrame(function(){m.classList.add('show');var x=$('.s-pm-x',m);x&&x.focus({preventScroll:true})});
    var u=new URL(location.href);u.searchParams.set('p',id);history.replaceState(null,'',u);
  }
  function openCube(p,m,media,sc,ft){
    var K=PR.cube,c=cubeDefault(p),qty=1,brush='anta';
    media.className='s-pm-media cube';
    media.innerHTML='<div class="s-cube-stage" id="s-cube"></div><span class="s-pm-dims" id="s-pm-dims"></span><span class="s-cube-hint">Toccate i vani per aggiungere ante, cassetti o cesti</span>';
    var chipsN=function(id,arr,fmt){return '<div class="s-chips" id="'+id+'">'+arr.map(function(v){return '<button type="button" class="s-chip" data-v="'+v+'">'+fmt(v)+'</button>'}).join('')+'</div>'};
    var nums=[];for(var i=1;i<=K.maxCols;i++)nums.push(i);var numsR=[];for(var j=1;j<=K.maxRows;j++)numsR.push(j);
    var html='<span class="s-card-line"><i></i>Librerie a vani · pannello tamburato</span><h2 id="s-pm-t">'+esc(p.name)+'</h2><p class="s-pm-desc">'+esc(p.desc)+'. Struttura in pannello tamburato con anima alveolare, leggera e rigida: la stessa che produciamo per gli stand fieristici. Si usa in verticale o in orizzontale, contro parete o come divisorio.</p>';
    html+='<fieldset class="s-opt"><legend>Colonne <small>vani in larghezza</small></legend>'+chipsN('o-cols',nums,function(v){return v})+'</fieldset>';
    html+='<fieldset class="s-opt"><legend>Righe <small>vani in altezza</small></legend>'+chipsN('o-rows',numsR,function(v){return v})+'</fieldset>';
    html+='<fieldset class="s-opt"><legend>Misura del vano <small>interno, quadrato</small></legend>'+chipsN('o-cube',K.cubes,function(v){return v+' cm'+(v===33?' <small>standard</small>':'')})+'</fieldset>';
    html+='<fieldset class="s-opt"><legend>Profondità</legend>'+chipsN('o-depth',K.depths,function(v){return v+' cm'})+'</fieldset>';
    html+='<fieldset class="s-opt"><legend>Finitura</legend><div class="s-chips" id="o-fin">'+p.finishes.map(function(f){var pc=K.finishPerc[f];return '<button type="button" class="s-chip" data-v="'+esc(f)+'"><i style="background:'+(CUBE_COL[f]||swatch(f))+'"></i>'+esc(f)+(pc?' <small>+'+pc+'%</small>':'')+'</button>'}).join('')+'</div></fieldset>';
    html+=ralPicker(true);
    html+='<fieldset class="s-opt"><legend>Inserti nei vani <small>scegliete e toccate il disegno</small></legend><div class="s-chips" id="o-brush">'+K.inserts.map(function(it){return '<button type="button" class="s-chip" data-v="'+it.id+'">'+esc(it.label)+(it.add?' <small>+'+eur.format(Math.round(it.add*Math.pow(c.cube/33,1.1)))+'</small>':'')+'</button>'}).join('')+'</div><div class="s-chips" style="margin-top:8px"><button type="button" class="s-chip" id="o-fill">Riempi tutti i vani</button><button type="button" class="s-chip" id="o-alt">A scacchiera</button><button type="button" class="s-chip" id="o-clear">Svuota</button></div></fieldset>';
    html+='<fieldset class="s-opt"><legend>Base</legend><div class="s-chips" id="o-base">'+K.bases.map(function(b){return '<button type="button" class="s-chip" data-v="'+b.id+'">'+esc(b.label)+'</button>'}).join('')+'</div></fieldset>';
    html+='<dl class="s-specs"><dt>Struttura</dt><dd>Pannello tamburato, fianchi 4 cm, divisori 1,5 cm</dd><dt>Portata</dt><dd>13 kg per vano, 25 kg sul piano</dd><dt>Fissaggio</dt><dd>Kit a muro incluso: va sempre fissata alla parete</dd><dt>Produzione</dt><dd>Fontanelle (TV), misure fuori standard su richiesta</dd></dl>';
    html+='<ul class="s-break" id="s-break"></ul>';
    sc.innerHTML=html;sc.scrollTop=0;
    ft.innerHTML='<div class="s-qty"><button type="button" id="q-m" aria-label="Meno">−</button><output id="q-v">1</output><button type="button" id="q-p" aria-label="Più">+</button></div><div class="s-pm-total"><b id="s-pm-tot" data-v="0">—</b><small id="s-pm-iva"></small></div><button class="s-btn s-btn-p" type="button" id="s-pm-add">'+IC.bag+'Aggiungi al carrello</button>';
    var stage=$('#s-cube',media),prevKey='';
    function resize(){var n=c.cols*c.rows,old=c.cells||[],oc=c._oc||c.cols,nc=[];for(var r=0;r<c.rows;r++)for(var k=0;k<c.cols;k++){var oi=r*oc+k;nc.push(k<oc&&old[oi]?old[oi]:'vuoto')}c.cells=nc;c._oc=c.cols}
    function sel(g,v){$$('#'+g+' .s-chip',sc).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v)===String(v))})}
    function draw(pop){
      stage.innerHTML=cubeSVG(c,true);
      $$('.cell',stage).forEach(function(g){
        function hit(){var i=+g.dataset.cell;c.cells[i]=c.cells[i]===brush?'vuoto':brush;draw(i);upd(true)}
        g.addEventListener('click',hit);g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit()}});
      });
      if(pop!=null&&!RM){var g=$('.cell[data-cell="'+pop+'"]',stage);if(g&&g.animate)g.animate([{transform:'scale(.92)',opacity:.4},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.34,1.56,.64,1)',transformOrigin:'center',transformBox:'fill-box'})}
    }
    function upd(skipDraw){
      sel('o-cols',c.cols);sel('o-rows',c.rows);sel('o-cube',c.cube);sel('o-depth',c.depth);sel('o-fin',c.fin);sel('o-brush',brush);sel('o-base',c.base);
      var rb=$('#o-ral',sc);if(rb)rb.hidden=c.fin!=='Laccato RAL';
      $$('.s-ral-sw button',sc).forEach(function(b){b.classList.toggle('on',b.dataset.r===c.ral)});
      var key=[c.cols,c.rows,c.cube,c.depth,c.fin,c.ral,c.base].join('|');
      if(!skipDraw){draw();if(key!==prevKey&&prevKey&&!RM){var sv=$('svg',stage);sv&&sv.animate&&sv.animate([{opacity:.3,transform:'scale(.97)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'})}}
      prevKey=key;
      var q=cubeQuote(p,c);
      $('#s-pm-dims').textContent=q.dims.w+' × '+c.depth+' × '+q.dims.h+' cm';
      $('#s-break',sc).innerHTML=q.lines.map(function(l){return '<li><span>'+esc(l[0])+'</span><b>'+eur.format(l[1])+'</b></li>'}).join('');
      tween($('#s-pm-tot'),q.unit*qty);$('#s-pm-iva').textContent=(qty>1?qty+' pezzi · ':'')+q.note;
    }
    function bindN(g,k){$$('#'+g+' .s-chip',sc).forEach(function(b){b.onclick=function(){c[k]=isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v;if(k==='cols'||k==='rows')resize();upd()}})}
    resize();bindN('o-cols','cols');bindN('o-rows','rows');bindN('o-cube','cube');bindN('o-depth','depth');bindN('o-base','base');
    $$('#o-fin .s-chip',sc).forEach(function(b){b.onclick=function(){c.fin=b.dataset.v;if(c.fin==='Laccato RAL'&&!c.ral)c.ral='9010';upd()}});
    $$('#o-brush .s-chip',sc).forEach(function(b){b.onclick=function(){brush=b.dataset.v;upd(true)}});
    $('#o-fill',sc).onclick=function(){c.cells=c.cells.map(function(){return brush});upd()};
    $('#o-alt',sc).onclick=function(){c.cells=c.cells.map(function(x,i){var r=Math.floor(i/c.cols),k=i%c.cols;return (r+k)%2?brush:'vuoto'});upd()};
    $('#o-clear',sc).onclick=function(){c.cells=c.cells.map(function(){return 'vuoto'});upd()};
    $$('.s-ral-sw button',sc).forEach(function(b){b.onclick=function(){c.ral=b.dataset.r;upd()}});
    var ri=$('#o-ral-in',sc);if(ri)ri.oninput=function(){c.ral=ri.value.replace(/\D/g,'').slice(0,4);upd()};
    $('#q-m',ft).onclick=function(){qty=Math.max(1,qty-1);$('#q-v',ft).textContent=qty;upd(true)};
    $('#q-p',ft).onclick=function(){qty=Math.min(99,qty+1);$('#q-v',ft).textContent=qty;upd(true)};
    $('#s-pm-add',ft).onclick=function(){var cc=JSON.parse(JSON.stringify(c));delete cc._oc;addToCart(p,cc,qty,$('svg',stage));setTimeout(closeProduct,250)};
    upd();showPM(m,p.id);
  }
  function ralPicker(furn){
    return '<fieldset class="s-opt" id="o-ral"'+(furn?' hidden':'')+'><legend>Colore RAL <small>qualsiasi tinta della cartella</small></legend><div class="s-ral-sw">'+RALS.map(function(r){return '<button type="button" data-r="'+r[0]+'" style="background:'+r[1]+'" title="RAL '+r[0]+' · '+r[2]+'" aria-label="RAL '+r[0]+' '+r[2]+'"></button>'}).join('')+'</div><div class="s-ral"><input class="s-ral-in" id="o-ral-in" placeholder="RAL 9010" aria-label="Codice RAL"><span class="s-note">Scrivete il codice se non è tra questi</span></div></fieldset>';
  }
  function closeProduct(){
    if(!PM)return;window.PDM&&window.PDM.start();PM.classList.remove('show');document.documentElement.style.overflow='';
    setTimeout(function(){PM.classList.remove('open')},RM?0:420);
    var u=new URL(location.href);u.searchParams.delete('p');history.replaceState(null,'',u);
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  function catName(id){var c=CAT.categories.find(function(x){return x.id===id});return c?c.name:''}

  /* ---------- ricerca con suggerimenti ---------- */
  function initSearch(){
    var f=$('.s-search'),i=$('#s-q');if(!f||!i)return;
    var box=document.createElement('div');box.className='s-suggest';box.setAttribute('data-lenis-prevent','');box.setAttribute('role','listbox');f.appendChild(box);
    var cur=-1;
    function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
    function run(){
      var q=norm(i.value.trim());if(q.length<2){f.classList.remove('open');return}
      var words=q.split(/\s+/);
      var res=P.filter(function(p){var h=norm(p.name+' '+(p.desc||'')+' '+(p.tags||[]).join(' ')+' '+catName(p.cat));return words.every(function(w){return h.indexOf(w)>=0})}).slice(0,7);
      box.innerHTML=res.length?res.map(function(p){return '<a href="?p='+esc(p.id)+'" data-s="'+esc(p.id)+'"><img '+imgAttrs(p)+' alt=""><span><b>'+esc(p.name)+'</b><small>'+esc(catName(p.cat))+'</small></span><em>'+eur.format(fromPrice(p))+'</em></a>'}).join(''):'<p>Nessun prodotto per «'+esc(i.value)+'». Provate «comodino», «porta laccata» o «top».</p>';
      cur=-1;f.classList.add('open');
      $$('[data-s]',box).forEach(function(a){a.onclick=function(e){e.preventDefault();f.classList.remove('open');openProduct(a.dataset.s)}});
    }
    i.addEventListener('input',run);i.addEventListener('focus',run);
    i.addEventListener('keydown',function(e){var a=$$('a',box);if(!a.length)return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();cur=(cur+(e.key==='ArrowDown'?1:-1)+a.length)%a.length;a.forEach(function(x,k){x.classList.toggle('on',k===cur)})}
      if(e.key==='Enter'&&cur>=0){e.preventDefault();a[cur].click()}
      if(e.key==='Escape')f.classList.remove('open')});
    document.addEventListener('click',function(e){if(!f.contains(e.target))f.classList.remove('open')});
  }

  /* ---------- motion: progresso, testata, reveal, parallax, magneti, cursore ---------- */
  function initMotion(){
    var rl=$('.s-ruler'),tick=false,st;
    function onScroll(){
      if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;
        var h=document.documentElement,max=h.scrollHeight-innerHeight,k=max>0?scrollY/max:0;
        if(rl){rl.style.setProperty('--p',k.toFixed(4));var b=rl.querySelector('b');if(b)b.textContent=Math.round(k*100)+' cm'}
        document.body.classList.toggle('s-scrolled',scrollY>20);
        if(!RM)$$('[data-par]').forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var v=(r.top+r.height/2-innerHeight/2)/innerHeight;el.style.transform='translate3d(0,'+(v*(+el.dataset.par||40))+'px,0) scale(1.06)'});
      });
      document.body.classList.add('s-scrolling');clearTimeout(st);st=setTimeout(function(){document.body.classList.remove('s-scrolling')},700);
    }
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    var hd=$('.s-head');function hh(){if(hd)document.documentElement.style.setProperty('--head-h',Math.round(hd.getBoundingClientRect().height)+'px')}
    hh();addEventListener('resize',hh);if(window.ResizeObserver&&hd)new ResizeObserver(hh).observe(hd);
    reveal(document);
    if(FINE&&!RM){
      $$('.s-btn-p,.s-btn-w,[data-mag]').forEach(function(b){
        b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'});
        b.addEventListener('pointerleave',function(){b.style.transform=''});
      });
      var cu=document.createElement('div');cu.className='s-cursor';cu.innerHTML='<span>Apri</span>';document.body.appendChild(cu);
      var x=0,y=0,tx=0,ty=0;
      addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;cu.classList.add('on');var t=e.target.closest&&e.target.closest('.s-card-img,.s-tile,.s-stage');cu.classList.toggle('big',!!t);if(t)cu.firstChild.textContent=t.classList.contains('s-tile')?'Entra':t.classList.contains('s-stage')?'Porte':'Apri'},{passive:true});
      document.addEventListener('pointerleave',function(){cu.classList.remove('on')});
      (function loop(){x+=(tx-x)*.2;y+=(ty-y)*.2;cu.style.transform='translate3d('+x+'px,'+y+'px,0)';requestAnimationFrame(loop)})();
    }
  }
  var IO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');IO.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08}):null;
  function reveal(root){$$('[data-rv]:not(.in)',root).forEach(function(el){if(IO&&!RM)IO.observe(el);else el.classList.add('in')})}
  function staggerIn(nodes){
    if(window.PDM&&window.PDM.cards){window.PDM.cards(nodes);return}
    if(RM)return;nodes.forEach(function(n,i){if(!n.animate)return;n.animate([{opacity:0,transform:'translateY(40px) scale(.97)'},{opacity:1,transform:'none'}],{duration:800,delay:Math.min(i,12)*55,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})});
  }
  function splitLines(h){
    if(!h||RM)return;var spans=$$('.ln>span',h);
    spans.forEach(function(s,i){s.animate&&s.animate([{transform:'translateY(110%) rotate(3deg)'},{transform:'none'}],{duration:1100,delay:150+i*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})});
  }
  function countUp(){
    $$('[data-count]').forEach(function(el){
      var to=+el.dataset.count,suf=el.dataset.suf||'';if(RM||!IO){el.textContent=to+suf;return}
      var o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e)+suf;if(k<1)requestAnimationFrame(f)})(t0)});o.observe(el);
    });
  }

  /* ---------- home ---------- */
  function heroDoor(){
    if(window.PDM)return;
    var leaf=$('.s-stage-leaf'),room=$('.s-stage-room'),wall=$('.s-stage-wall');if(!leaf)return;
    function th(){leaf.style.setProperty('--t',(leaf.offsetWidth*4.4/80).toFixed(1)+'px')}th();addEventListener('resize',th);
    if(RM){leaf.style.transform='rotateY(-62deg)';if(wall)wall.style.opacity=0;return}
    var ang=0,target=68,t0=null;
    setTimeout(function(){if(wall)wall.style.opacity=0},500);
    function frame(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/2200),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;ang=target*e;leaf.style.transform='rotateY('+ang+'deg)';leaf.style.setProperty('--shade',(Math.abs(ang)/90).toFixed(2));if(room)room.style.transform='scale('+(1.18-.12*e)+')';if(k<1)requestAnimationFrame(frame)}
    setTimeout(function(){requestAnimationFrame(frame)},450);
    var st=$('.s-stage');
    if(st&&FINE)st.addEventListener('pointermove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;leaf.style.transform='rotateY('+(target+x*16)+'deg)';if(room)room.style.transform='scale(1.06) translate('+(-x*14)+'px,'+(-y*10)+'px)'});
  }
  function initRail(){
    var r=$('#s-rail');if(!r)return;
    var bd=P.filter(function(p){return p.badge&&p.type==='door'}),bf=P.filter(function(p){return p.badge&&p.type!=='door'}),best=[];for(var i=0;best.length<14&&(i<bd.length||i<bf.length);i++){if(bf[i])best.push(bf[i]);if(bd[i]&&i<4)best.push(bd[i])}
    r.innerHTML=best.map(function(p){return card(p)}).join('');bindCards(r);
    if(window.PDM){window.PDM.cards($$('.s-card',r));setTimeout(function(){window.PDM.rail(r)},60)}
    var bar=$('.s-rail-bar i');
    function upd(){if(!bar)return;var m=r.scrollWidth-r.clientWidth,k=m>0?r.scrollLeft/m:0,ratio=Math.min(1,r.clientWidth/r.scrollWidth);bar.style.width=(ratio*100)+'%';bar.style.setProperty('--x',(k*(1-ratio)/ratio*100)+'%')}
    r.addEventListener('scroll',function(){requestAnimationFrame(upd)},{passive:true});upd();
    $$('[data-rail]').forEach(function(b){b.onclick=function(){r.scrollBy({left:(+b.dataset.rail)*r.clientWidth*.8,behavior:RM?'auto':'smooth'})}});
    var down=false,sx=0,sl=0,moved=0;
    r.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=0;sx=e.clientX;sl=r.scrollLeft});
    addEventListener('pointermove',function(e){if(!down)return;var d=e.clientX-sx;moved=Math.abs(d);if(moved>5)r.classList.add('drag');r.scrollLeft=sl-d});
    addEventListener('pointerup',function(){down=false;setTimeout(function(){r.classList.remove('drag')},0)});
    r.addEventListener('click',function(e){if(moved>6){e.stopPropagation();e.preventDefault();moved=0}},true);
  }
  function initFit(){
    var box=$('#s-fit');if(!box)return;
    var w=$('#fit-w'),h=$('#fit-h'),ow=$('#fit-wo'),oh=$('#fit-ho'),pr=$('#fit-p'),pn=$('#fit-pn'),obj=$('#fit-obj'),stage=$('#fit-stage'),badge=$('#fit-badge');
    var p=byId('madia-3-ante'),D=45,LEG=12,fin='Bianco opaco';
    var FIN={'Bianco opaco':{front:'#f3f2ee',edge:'#ddd6c8',top:'#c9a273',side:'#e6e1d6',grain:'none'},
      'Rovere naturale':{front:'#c49a68',edge:'#a98458',top:'#c9a273',side:'#b58c5c',grain:'repeating-linear-gradient(90deg,rgba(90,55,20,.10) 0 2px,transparent 2px 13px)'},
      'Grigio seta':{front:'#bcb8b1',edge:'#a8a49d',top:'#c9a273',side:'#aeaaa3',grain:'none'},
      'Laccato RAL':{front:'#8fae80',edge:'#7d9a6f',top:'#c9a273',side:'#83a275',grain:'none'}};
    obj.innerHTML='<div class="f2-shadow"></div><span class="f2-leg"></span><span class="f2-leg"></span><span class="f2-leg"></span><span class="f2-leg"></span><div class="f2-f f2-side"></div><div class="f2-f f2-top"></div><div class="f2-f f2-front"></div><div class="f2-dim w"><span></span></div><div class="f2-dim h"><span></span></div>';
    var hd=document.createElement('div');hd.className='f2-hdls';hd.innerHTML='<span class="f2-hdl" data-k="w" role="slider" tabindex="0" aria-label="Larghezza"></span><span class="f2-hdl v" data-k="h" role="slider" tabindex="0" aria-label="Altezza"></span>';stage.appendChild(hd);
    var shadow=$('.f2-shadow',obj),legs=$$('.f2-leg',obj),side=$('.f2-side',obj),top=$('.f2-top',obj),front=$('.f2-front',obj),dw=$('.f2-dim.w',obj),dh=$('.f2-dim.h',obj);
    var nDoors=0,S=2;
    function scale(){var sw=stage.clientWidth,sh=stage.clientHeight;S=Math.min(sw*.62/260,sh*.5/(110+LEG));}
    function px(v){return v*S}
    function upd(anim){
      var W=+w.value,H=+h.value;ow.textContent=W+' cm';oh.textContent=H+' cm';
      var Wp=px(W),Hp=px(H),Dp=px(D),Lp=px(LEG),yTop=-(Lp+Hp);
      function st(el,o){for(var k in o)el.style[k]=o[k]}
      st(front,{left:(-Wp/2)+'px',top:yTop+'px',width:Wp+'px',height:Hp+'px',transform:'translateZ('+(Dp/2)+'px)'});
      st(top,{left:(-Wp/2)+'px',top:(yTop-Dp/2)+'px',width:Wp+'px',height:Dp+'px',transform:'rotateX(90deg)'});
      st(side,{left:(Wp/2-Dp/2)+'px',top:yTop+'px',width:Dp+'px',height:Hp+'px',transform:'rotateY(90deg)'});
      var lx=[-Wp/2+8,Wp/2-14],lz=[Dp/2-8,-Dp/2+8];
      legs.forEach(function(l,i){st(l,{left:lx[i%2]+'px',top:(-Lp)+'px',height:Lp+'px',transform:'translateZ('+lz[i<2?0:1]+'px)'})});
      st(shadow,{left:(-Wp/2-20)+'px',top:(-Dp/2-10)+'px',width:(Wp+40)+'px',height:(Dp+20)+'px'});
      st(dw,{left:(-Wp/2)+'px',top:'22px',width:Wp+'px',transform:'translateZ('+(Dp/2+24)+'px)'});$('span',dw).textContent=W+' cm';
      st(dh,{left:(-Wp/2-26)+'px',top:yTop+'px',height:Hp+'px',transform:'translateZ('+(Dp/2)+'px)'});$('span',dh).textContent=H+' cm';
      var n=Math.max(2,Math.min(5,Math.round(W/58)));
      if(n!==nDoors){nDoors=n;front.innerHTML='';for(var i=0;i<n;i++){var dd=document.createElement('div');dd.className='f2-door '+(i<n/2?'l':'r');front.appendChild(dd);if(anim!==false&&dd.animate&&!RM)dd.animate([{transform:'scaleX(0)',opacity:0},{transform:'none',opacity:1}],{duration:500,delay:i*60,easing:'cubic-bezier(.34,1.56,.64,1)'})}}
      var F=FIN[fin];obj.style.setProperty('--c-front',F.front);obj.style.setProperty('--c-edge',F.edge);obj.style.setProperty('--c-top',F.top);obj.style.setProperty('--c-side',F.side);obj.style.setProperty('--grain',F.grain);
      badge.textContent=W+' × '+D+' × '+H+' cm · '+n+' ante';
      if(pn)pn.textContent='Madia Corte · '+n+' ante · '+(fin==='Laccato RAL'?'RAL 6021':fin)+' · IVA inclusa';
      if(p){var q=furnQuote(p,{size:'custom',w:W,d:D,h:H,fin:fin,ral:'6021'});tween(pr,q.unit)}
      placeHandles();
    }
    function placeHandles(){
      // posizione dei pallini proiettata sullo schermo
      var r=stage.getBoundingClientRect(),fr=front.getBoundingClientRect();
      var hw=$('[data-k="w"]',hd),hh=$('[data-k="h"]',hd);
      hw.style.left=(fr.right-r.left)+'px';hw.style.top=(fr.top-r.top+fr.height/2)+'px';
      hh.style.left=(fr.left-r.left+fr.width/2)+'px';hh.style.top=(fr.top-r.top)+'px';
    }
    w.oninput=h.oninput=function(){box.classList.add('used');upd()};
    $$('#fit-fin button').forEach(function(b){b.onclick=function(){fin=b.dataset.f;$$('#fit-fin button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});upd()}});
    // trascinamento
    $$('.f2-hdl',hd).forEach(function(el){
      var k=el.dataset.k,inp=k==='w'?w:h,sx=0,sy=0,v0=0,on=false;
      el.addEventListener('pointerdown',function(e){on=true;sx=e.clientX;sy=e.clientY;v0=+inp.value;el.setPointerCapture(e.pointerId);box.classList.add('used');e.preventDefault()});
      el.addEventListener('pointermove',function(e){if(!on)return;var dcm=k==='w'?(e.clientX-sx)*2/S/0.87:-(e.clientY-sy)/S;inp.value=Math.round(clamp(v0+dcm,+inp.min,+inp.max));upd(true)});
      el.addEventListener('pointerup',function(){on=false});el.addEventListener('pointercancel',function(){on=false});
      el.addEventListener('keydown',function(e){var s=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;if(s){e.preventDefault();inp.value=clamp(+inp.value+s*5,+inp.min,+inp.max);upd()}});
    });
    // la vista ruota piano col mouse
    if(FINE&&!RM)stage.addEventListener('pointermove',function(e){if(e.target.classList.contains('f2-hdl'))return;var r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5;obj.style.transform='rotateX(-10deg) rotateY('+(-30+x*22)+'deg)';clearTimeout(obj._t);obj._t=setTimeout(placeHandles,700)});
    stage.addEventListener('pointerleave',function(){obj.style.transform='';setTimeout(placeHandles,700)});
    scale();upd(false);setTimeout(placeHandles,700);
    addEventListener('resize',function(){scale();upd(false)});
    // ingresso: il mobile si monta
    if(!RM&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();
      var parts=[top,side,front].concat(legs);parts.forEach(function(el,i){el.animate&&el.animate([{opacity:0,translate:'0 -60px'},{opacity:1,translate:'0 0'}],{duration:700,delay:200+i*90,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})});
      var demo=[180,215,150,180],di=0;setTimeout(function step(){if(box.classList.contains('used')||di>=demo.length)return;w.value=demo[di++];upd();setTimeout(step,1100)},1300)},{threshold:.4});io.observe(stage)}
    var go=$('#fit-go');if(go)go.onclick=function(){openProduct('madia-3-ante')};
  }
  function initHome(){
    initRail();initFit();heroDoor();splitLines($('.s-hero h1'));countUp();
    var q=new URLSearchParams(location.search).get('q');
    if(q){var inp=$('#s-q');if(inp)inp.value=q;var sec=$('#risultati'),grid=$('#s-grid');var t=q.toLowerCase();
      var list=P.filter(function(p){return (p.name+' '+(p.desc||'')+' '+(p.tags||[]).join(' ')).toLowerCase().indexOf(t)>=0});
      $('#s-res-t').textContent='Risultati per «'+q+'»';grid.innerHTML=list.length?list.map(function(p){return card(p)}).join(''):emptyHTML('');bindCards(grid);sec.hidden=false;sec.scrollIntoView({block:'start'});staggerIn($$('.s-card',grid))}
  }
  function emptyHTML(catName2,icon){
    return '<div class="s-empty"><span class="s-empty-ic">'+(icon||'')+'</span><div><h3>'+(catName2?'Nessun prodotto con questi filtri':'Nessun prodotto trovato')+'</h3><p>Togliete un filtro oppure chiedeteci il pezzo su misura: mandateci dimensioni e finitura e vi rispondiamo con un preventivo, di norma entro 24 ore lavorative.</p><div class="s-btns"><a class="s-btn s-btn-p" href="/preventivo/">Richiedi un preventivo</a><a class="s-btn s-btn-o" href="https://wa.me/'+WA+'" target="_blank" rel="noopener">Scrivici su WhatsApp</a></div></div></div>';
  }

  /* ---------- pagina categoria ---------- */
  function initCat(){
    var id=document.body.dataset.cat,cat=CAT.categories.find(function(c){return c.id===id});
    var state={sub:(location.hash||'').replace('#',''),sort:'rel',custom:false,fin:'',price:''};
    var grid=$('#s-grid'),cnt=$('#s-count');
    var mine=P.filter(function(p){return p.cat===id});
    $$('#s-subs .s-sub').forEach(function(b){var n=b.dataset.sub?mine.filter(function(p){return (p.subs||[p.sub]).indexOf(b.dataset.sub)>=0}).length:mine.length;var e=document.createElement('em');e.textContent=n;b.appendChild(e)});
    var fins={};mine.forEach(function(p){(p.finishes||[]).forEach(function(f){fins[f]=1})});
    var fs=$('#s-f-fin');Object.keys(fins).sort().forEach(function(f){var o=document.createElement('option');o.value=f;o.textContent=f;fs.appendChild(o)});
    function render(first){
      $$('#s-subs .s-sub').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sub===state.sub)});
      var list=mine.filter(function(p){
        if(state.sub&&(p.subs||[p.sub]).indexOf(state.sub)<0)return false;
        if(state.custom&&!(p.custom||p.type==='door'))return false;
        if(state.fin&&(p.finishes||[]).indexOf(state.fin)<0)return false;
        if(state.price){var r=state.price.split('-'),m=fromPrice(p,state.sub);if(m<+r[0]||(r[1]&&m>+r[1]))return false}
        return true;
      });
      list.sort(function(a,b){
        if(state.sort==='pa')return fromPrice(a,state.sub)-fromPrice(b,state.sub);
        if(state.sort==='pd')return fromPrice(b,state.sub)-fromPrice(a,state.sub);
        if(state.sort==='az')return a.name.localeCompare(b.name,'it');
        return (a.rank||0)-(b.rank||0);
      });
      tween(cnt.querySelector('b')||cnt,list.length,function(v){return v});
      cnt.lastChild.textContent=list.length===1?' prodotto':' prodotti';
      grid.innerHTML=list.length?list.map(function(p){return card(p,state.sub)}).join(''):emptyHTML(cat.name,CAT.icons[cat.icon]);
      bindCards(grid,state.sub);
      staggerIn($$('.s-card',grid));
    }
    $$('#s-subs .s-sub').forEach(function(b){b.onclick=function(){state.sub=b.dataset.sub;history.replaceState(null,'',(state.sub?'#'+state.sub:location.pathname)+'');render();var t=$('.s-tools');if(t&&t.getBoundingClientRect().top<0)t.scrollIntoView({behavior:RM?'auto':'smooth'})}});
    $('#s-sort').onchange=function(e){state.sort=e.target.value;render()};
    fs.onchange=function(e){state.fin=e.target.value;render()};
    $('#s-f-price').onchange=function(e){state.price=e.target.value;render()};
    var cb=$('#s-f-custom');cb.onclick=function(){state.custom=!state.custom;cb.setAttribute('aria-pressed',state.custom);render()};
    addEventListener('hashchange',function(){state.sub=(location.hash||'').replace('#','');render()});
    splitLines($('.s-cat-head h1'));
    render(true);
  }

  /* ---------- pagina prodotto statica (/shop/<categoria>/<id>/) ---------- */
  function initProductPage(){
    var root=$('.sp');if(!root)return;
    bindCards(root,'');
    staggerIn($$('.s-card',root));
  }

  /* ---------- avvio ---------- */
  function init(){
    var pf=$('.pf');if(pf)pf.classList.add('in');
    counts();initMotion();
    var cb=$('#s-cart-btn'),fb=$('#s-fav-btn'),x=$('#s-x'),sc=$('#s-scrim');
    if(cb)cb.onclick=function(){openDrawer('cart')};
    if(fb)fb.onclick=function(){openDrawer('fav')};
    if(x)x.onclick=closeDrawer;if(sc)sc.onclick=closeDrawer;
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){var sh=document.getElementById('s-sheet');if(sh&&sh.classList.contains('open')){sh.classList.remove('show','open');return}if(PM&&PM.classList.contains('open'))closeProduct();else closeDrawer()}});
    var top=$('#pfTop');if(top)top.onclick=function(){scrollTo({top:0,behavior:RM?'auto':'smooth'})};
    Promise.all([fetch('/shop/data/catalog.json',{cache:'no-cache'}).then(function(r){return r.json()}),fetch('/shop/data/products.json',{cache:'no-cache'}).then(function(r){return r.json()})]).then(function(r){
      CAT=r[0];P=r[1].products||[];PR=r[1].pricing;
      initSearch();
      var pg=document.body.dataset.page;
      if(pg==='cat')initCat();else if(pg==='product')initProductPage();else initHome();
      var pid=new URLSearchParams(location.search).get('p');if(pid)openProduct(pid);
    }).catch(function(err){console.error(err);var g=$('#s-grid');if(g)g.innerHTML=emptyHTML('')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
