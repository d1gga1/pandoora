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
  var SW={'Bianco opaco':'#f4f3ef','Bianco':'#f6f6f4','Bianco frassino':'#efede7','Rovere naturale':'#c9a273','Rovere oliato':'#b8895a','Noce canaletto':'#6b4a33','Grigio seta':'#b9b6b0','Grigio Baltimora':'#8d8780','Palissandro White':'#e3ddd2','Nero opaco':'#262626','Laccato RAL':'conic-gradient(#c0392b,#e0b24a,#5b8d5a,#3e6fa8,#8e5aa8,#c0392b)','Rovere naturale/Bianco':'linear-gradient(90deg,#c9a273 50%,#f4f3ef 50%)','Noce/Grigio':'linear-gradient(90deg,#6b4a33 50%,#b9b6b0 50%)','Pietra grigia/Rovere':'linear-gradient(90deg,#8f8f8a 50%,#c9a273 50%)','Pietra chiara/Noce':'linear-gradient(90deg,#d9d5cc 50%,#6b4a33 50%)'};
  var RALS=[['9010','#f1ece1','Bianco puro'],['9016','#f1f0ea','Bianco traffico'],['1013','#e3d9c6','Bianco perla'],['7044','#b8b4a8','Grigio seta'],['7016','#383e42','Antracite'],['6021','#89ac76','Verde pallido'],['5014','#606e8c','Blu colomba'],['3012','#c6846d','Rosso beige'],['9005','#0e0e10','Nero']];
  function swatch(f){return SW[f]||'#ddd'}

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
    if(c.size==='custom'){var fm=D.fuoriMisura,add=(fm.add||0)+Math.round(b*(fm.perc||0)/100);lines.push([fm.label+' '+c.w+'×'+c.h+' cm',add])}
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
  function quote(p,c){return p.type==='door'?doorQuote(p,c):furnQuote(p,c)}
  function defaultCfg(p,sub){
    if(p.type==='door'){
      var open=sub==='scorrevoli'?'scorrevole-esterno':sub==='filo-muro'?'filo-muro':'battente';
      return{open:open,size:'80',w:80,h:210,ex:{},fin:p.finishes[0],ral:p.line==='laminata'?'':'9010'};
    }
    var s=p.std[0];return{size:0,w:s.w,d:s.d,h:s.h,fin:p.finishes[0],ral:p.finishes[0]==='Laccato RAL'?'9010':''};
  }
  function fromPrice(p,sub){
    if(p.type==='door')return doorQuote(p,defaultCfg(p,sub)).unit;
    return Math.min.apply(null,p.std.map(function(s){return s.price}));
  }
  function cfgSummary(p,c){
    if(p.type==='door'){
      var op=opening(c.open), ex=PR.door.extras.filter(function(x){return c.ex&&c.ex[x.id]&&extraOk(x,c)}).map(function(x){return x.label.split(' (')[0]});
      return [op.label, c.size==='custom'?c.w+'×'+c.h+' cm (fuori misura)':c.w+'×'+PR.door.height+' cm', p.line==='laminata'?p.finishes[0]:'RAL '+(c.ral||'da scegliere')].concat(ex).join(' · ');
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
    var dims=s?'<span class="s-dim">'+s.w+' × '+s.d+' × '+s.h+' cm'+(p.std.length>1?' · '+p.std.length+' misure':'')+'</span>':'<span class="s-dim">L 60–90 × H 210 cm · anche fuori misura</span>';
    var sw='<span class="s-swatches">'+(p.finishes||[]).slice(0,5).map(function(f){return '<i title="'+esc(f)+'" style="background:'+swatch(f)+'"></i>'}).join('')+'</span>';
    return '<article class="s-card" data-type="'+p.type+'" data-id="'+esc(p.id)+'">'
      +'<div class="s-card-img" data-open="'+esc(p.id)+'" role="button" tabindex="-1" aria-label="Apri '+esc(p.name)+'"><img '+imgAttrs(p)+' alt="'+esc(p.name)+'" loading="lazy" decoding="async"><span class="glare"></span>'
      +(p.badge?'<span class="s-badge">'+esc(p.badge)+'</span>':'')+(p.custom||p.type==='door'?'<span class="s-badge g r2">Su misura</span>':'')
      +'<button class="s-card-q" type="button" data-open="'+esc(p.id)+'">'+IC.eye+'Configura</button></div>'
      +top+'<h3><a href="?p='+esc(p.id)+'" data-open="'+esc(p.id)+'">'+esc(p.name)+'</a></h3><p class="s-desc">'+esc(p.desc||'')+'</p>'+dims+sw
      +'<div class="s-price">'+(many?'<small>da</small>':'')+eur.format(price)+(p.type==='door'?'<span>IVA escl. · posa inclusa</span>':'')+'</div>'
      +'<div class="s-card-foot"><button class="s-add" type="button" data-add="'+esc(p.id)+'" aria-label="Aggiungi '+esc(p.name)+' al carrello">'+IC.plus+'<span>Aggiungi</span></button>'
      +'<button class="s-fav" type="button" data-fav="'+esc(p.id)+'" aria-pressed="'+fav+'" aria-label="Salva nei preferiti">'+IC.heart+'</button></div>'
      +'</article>';
  }
  function byId(id){return P.find(function(x){return x.id===id})}
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
    if(ex)ex.qty+=qty;else cart.push({key:key,id:p.id,type:p.type,name:p.name,img:p.img,remote:p.imgRemote||p.imgFb||'',sum:cfgSummary(p,c),unit:q.unit,iva:p.type==='door'?'escl':'incl',qty:qty});
    store('pdShopCart2',cart);
    fly(fromImg,function(){counts('cart')});
    toast(p.name+' nel carrello');
  }
  function fly(img,done){
    var tgt=$('#s-cart-btn');
    if(RM||!img||!tgt||!img.animate){done();return}
    var a=img.getBoundingClientRect(),b=tgt.getBoundingClientRect();
    var f=document.createElement('div');f.className='s-fly';f.style.cssText='left:'+a.left+'px;top:'+a.top+'px;width:'+a.width+'px;height:'+a.height+'px';
    f.innerHTML='<img src="'+esc(img.currentSrc||img.src)+'" alt="">';document.body.appendChild(f);
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
    document.body.classList.add('s-cart-open');
    $('#s-drawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){document.body.classList.remove('s-cart-open');var d=$('#s-drawer');if(d)d.setAttribute('aria-hidden','true')}

  /* ---------- scheda prodotto / configuratore ---------- */
  var PM=null,lastFocus=null;
  function ensurePM(){
    if(PM)return PM;
    PM=document.createElement('div');PM.className='s-pm';PM.setAttribute('role','dialog');PM.setAttribute('aria-modal','true');PM.setAttribute('aria-labelledby','s-pm-t');
    PM.innerHTML='<div class="s-pm-scrim" data-close></div><div class="s-pm-box"><button class="s-pm-x" type="button" data-close aria-label="Chiudi">'+IC.x+'</button><div class="s-pm-media"></div><div class="s-pm-body"><div class="s-pm-scroll"></div><div class="s-pm-foot"></div></div></div>';
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
    media.className='s-pm-media'+(p.type==='door'?' door':'');
    media.innerHTML='<img '+imgAttrs(p,true)+' alt="'+esc(p.name)+'">'+(p.type==='door'&&p.line!=='laminata'?'<span class="s-pm-tint" style="-webkit-mask-image:url(\''+esc(p.imgLg)+'\');mask-image:url(\''+esc(p.imgLg)+'\')"></span>':'')+'<span class="s-pm-dims" id="s-pm-dims"></span><span class="s-pm-ral" id="s-pm-ral"></span>';
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
      var tn=$('.s-pm-tint',media);if(tn){var R2=RALS.find(function(r){return r[0]===c.ral});tn.style.background=R2?R2[1]:'transparent';tn.style.opacity=R2&&c.ral!=='9010'&&c.ral!=='9016'?1:0}
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
  function ralPicker(furn){
    return '<fieldset class="s-opt" id="o-ral"'+(furn?' hidden':'')+'><legend>Colore RAL <small>qualsiasi tinta della cartella</small></legend><div class="s-ral-sw">'+RALS.map(function(r){return '<button type="button" data-r="'+r[0]+'" style="background:'+r[1]+'" title="RAL '+r[0]+' · '+r[2]+'" aria-label="RAL '+r[0]+' '+r[2]+'"></button>'}).join('')+'</div><div class="s-ral"><input class="s-ral-in" id="o-ral-in" placeholder="RAL 9010" aria-label="Codice RAL"><span class="s-note">Scrivete il codice se non è tra questi</span></div></fieldset>';
  }
  function closeProduct(){
    if(!PM)return;PM.classList.remove('show');document.documentElement.style.overflow='';
    setTimeout(function(){PM.classList.remove('open')},RM?0:420);
    var u=new URL(location.href);u.searchParams.delete('p');history.replaceState(null,'',u);
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  function catName(id){var c=CAT.categories.find(function(x){return x.id===id});return c?c.name:''}

  /* ---------- ricerca con suggerimenti ---------- */
  function initSearch(){
    var f=$('.s-search'),i=$('#s-q');if(!f||!i)return;
    var box=document.createElement('div');box.className='s-suggest';box.setAttribute('role','listbox');f.appendChild(box);
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
    var leaf=$('.s-stage-leaf'),room=$('.s-stage-room'),wall=$('.s-stage-wall');if(!leaf)return;
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
    var w=$('#fit-w'),h=$('#fit-h'),ow=$('#fit-wo'),oh=$('#fit-ho'),pr=$('#fit-p'),body=$('#fit-body'),dw=$('#fit-dw'),dh=$('#fit-dh'),tw=$('#fit-tw'),th=$('#fit-th');
    var p=byId('madia-3-ante');
    function upd(){
      var W=+w.value,H=+h.value;ow.textContent=W+' cm';oh.textContent=H+' cm';
      var sw=W/260*300,sh=H/120*170,x=(400-sw)/2+10,y=250-sh;
      body.setAttribute('x',x);body.setAttribute('y',y);body.setAttribute('width',sw);body.setAttribute('height',sh);
      dw.setAttribute('d','M'+x+' 275 H'+(x+sw)+' M'+x+' 268 v14 M'+(x+sw)+' 268 v14');tw.setAttribute('x',x+sw/2);tw.textContent=W+' cm';
      dh.setAttribute('d','M'+(x-22)+' '+y+' V250 M'+(x-29)+' '+y+' h14 M'+(x-29)+' 250 h14');th.setAttribute('y',y+sh/2);th.setAttribute('x',x-30);th.textContent=H+' cm';
      var doors=Math.max(1,Math.round(W/60));var g='';for(var i=1;i<doors;i++){var lx=x+sw*i/doors;g+='M'+lx+' '+(y+8)+' V'+(250-8)+' '}
      $('#fit-div').setAttribute('d',g);
      if(p){var q=furnQuote(p,{size:'custom',w:W,d:45,h:H,fin:'Rovere naturale'});tween(pr,q.unit)}
    }
    w.oninput=h.oninput=upd;upd();
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

  /* ---------- avvio ---------- */
  function init(){
    var pf=$('.pf');if(pf)pf.classList.add('in');
    counts();initMotion();
    var cb=$('#s-cart-btn'),fb=$('#s-fav-btn'),x=$('#s-x'),sc=$('#s-scrim');
    if(cb)cb.onclick=function(){openDrawer('cart')};
    if(fb)fb.onclick=function(){openDrawer('fav')};
    if(x)x.onclick=closeDrawer;if(sc)sc.onclick=closeDrawer;
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(PM&&PM.classList.contains('open'))closeProduct();else closeDrawer()}});
    var top=$('#pfTop');if(top)top.onclick=function(){scrollTo({top:0,behavior:RM?'auto':'smooth'})};
    Promise.all([fetch('/shop/data/catalog.json',{cache:'no-cache'}).then(function(r){return r.json()}),fetch('/shop/data/products.json',{cache:'no-cache'}).then(function(r){return r.json()})]).then(function(r){
      CAT=r[0];P=r[1].products||[];PR=r[1].pricing;
      initSearch();
      if(document.body.dataset.page==='cat')initCat();else initHome();
      var pid=new URLSearchParams(location.search).get('p');if(pid)openProduct(pid);
    }).catch(function(err){console.error(err);var g=$('#s-grid');if(g)g.innerHTML=emptyHTML('')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
