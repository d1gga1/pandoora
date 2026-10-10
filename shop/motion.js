/* Pandoora Shop — livello di motion design (GSAP + ScrollTrigger + Lenis).
   Se le librerie non ci sono, lo shop funziona con le animazioni CSS di base. */
(function(){
  'use strict';
  var d=document,html=d.documentElement;
  function done(){html.classList.remove('pd-intro','pd-wipe')}
  if(!window.gsap||!window.ScrollTrigger){done();return}
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESK=matchMedia('(min-width: 901px)').matches;
  var FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var g=gsap;g.registerPlugin(ScrollTrigger);
  html.classList.add('pdm');
  var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};

  /* ---------- scorrimento morbido ---------- */
  var lenis=null;
  if(!RM&&window.Lenis){
    lenis=new Lenis({lerp:.09,smoothWheel:true,wheelMultiplier:1,touchMultiplier:1.4});
    lenis.on('scroll',ScrollTrigger.update);
    g.ticker.add(function(t){lenis.raf(t*1000)});g.ticker.lagSmoothing(0);
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href');if(id.length<2)return;var t=$(id);if(t){e.preventDefault();lenis.scrollTo(t,{offset:-80,duration:1.4})}});
  }
  window.PDM={
    lenis:lenis,
    stop:function(){lenis&&lenis.stop()},start:function(){lenis&&lenis.start()},
    cards:function(nodes,instant){cardsIn(nodes,instant)},
    rail:function(el){pinRail(el)},
    refresh:function(){ScrollTrigger.refresh()}
  };
  if(RM){done();return}

  /* ---------- intro: le ante si aprono ---------- */
  var introTl=null;
  if(html.classList.contains('pd-intro')){
    try{sessionStorage.setItem('pdIntro','1')}catch(e){}
    var n=$('.si-n'),bar=$('.si-bar i'),cnt={v:0};
    introTl=g.timeline({onComplete:function(){html.classList.remove('pd-intro');lenis&&lenis.start();ScrollTrigger.refresh()}});
    lenis&&lenis.stop();
    introTl.to(cnt,{v:100,duration:1.15,ease:'power2.inOut',onUpdate:function(){n.textContent=Math.round(cnt.v)}},0)
      .to(bar,{scaleX:1,duration:1.15,ease:'power2.inOut'},0)
      .to('.si-c',{opacity:0,y:-30,duration:.45,ease:'power2.in'},1.2)
      .to('.si-l',{rotateY:-105,duration:1.3,ease:'power3.inOut'},1.35)
      .to('.si-r',{rotateY:105,duration:1.3,ease:'power3.inOut'},1.35)
      .to('.s-intro',{opacity:0,duration:.4},2.3);
  }
  /* ---------- passaggio tra pagine ---------- */
  if(html.classList.contains('pd-wipe')){
    g.set('.s-wipe',{scaleY:1,transformOrigin:'50% 0%'});
    html.classList.remove('pd-wipe');
    g.to('.s-wipe span',{opacity:0,duration:.25});
    g.to('.s-wipe',{scaleY:0,duration:.75,ease:'power4.inOut',delay:.1});
  }
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    if(a.target==='_blank'||a.hasAttribute('download')||a.dataset.open)return;
    var u;try{u=new URL(a.href,location.href)}catch(x){return}
    if(u.origin!==location.origin||!/^\/shop\//.test(u.pathname)||u.search||(u.pathname===location.pathname&&u.hash))return;
    e.preventDefault();
    try{sessionStorage.setItem('pdWipe','1')}catch(x){}
    g.set('.s-wipe',{transformOrigin:'50% 100%'});
    g.timeline({onComplete:function(){location.href=u.href}}).to('.s-wipe',{scaleY:1,duration:.6,ease:'power4.inOut'}).to('.s-wipe span',{opacity:1,duration:.2},'-=.15');
  });
  addEventListener('pageshow',function(e){if(e.persisted){g.set('.s-wipe',{scaleY:0})}});

  /* ---------- titoli: parole che salgono ---------- */
  function splitWords(el){
    if(el.dataset.splitDone)return;el.dataset.splitDone=1;
    var w=el.textContent.trim().split(/\s+/);el.setAttribute('aria-label',el.textContent.trim());
    el.innerHTML=w.map(function(x){return '<span class="wd" aria-hidden="true"><span>'+x.replace(/</g,'&lt;')+'</span></span>'}).join(' ');
  }
  $$('[data-split]').forEach(function(h){
    splitWords(h);
    g.from($$('.wd>span',h),{yPercent:110,rotate:4,duration:1,ease:'power4.out',stagger:.06,scrollTrigger:{trigger:h,start:'top 88%'}});
  });

  /* ---------- manifesto: parole che si accendono ---------- */
  $$('[data-scrub]').forEach(function(p){
    p.innerHTML=p.textContent.trim().split(/\s+/).map(function(x){return '<span class="w">'+x+'</span>'}).join(' ');
    g.to($$('.w',p),{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:p,start:'top 80%',end:'bottom 45%',scrub:true}});
  });

  /* ---------- nastro di parole guidato dalla velocità ---------- */
  var rows=$$('.mq-row');
  if(rows.length){
    var pos=[0,0],vel=0;
    if(lenis)lenis.on('scroll',function(l){vel=l.velocity||0});
    g.ticker.add(function(){
      rows.forEach(function(r,i){var t=r.firstElementChild,w=t.scrollWidth/2;if(!w)return;var dir=i%2?1:-1,sp=.6+Math.min(Math.abs(vel)*.35,14);
        pos[i]+=dir*sp;if(pos[i]<=-w)pos[i]+=w;if(pos[i]>0)pos[i]-=w;
        g.set(t,{x:pos[i],skewX:-g.utils.clamp(-10,10,vel*.4)*dir});});
      vel*=.92;
    });
  }

  /* ---------- riquadri categorie: apertura a sipario + parallax ---------- */
  ScrollTrigger.batch('[data-m="clip"]',{start:'top 90%',once:true,onEnter:function(els){
    g.fromTo(els,{clipPath:'inset(100% 0% 0% 0% round 26px)'},{clipPath:'inset(0% 0% 0% 0% round 26px)',duration:1.2,ease:'power4.out',stagger:.12});
    els.forEach(function(el,i){var im=$('img',el);if(im)g.fromTo(im,{scale:1.35},{scale:1,duration:1.6,ease:'power3.out',delay:i*.12});var c=$('.s-tile-c',el);if(c)g.from(c,{y:40,opacity:0,duration:1,ease:'power3.out',delay:.35+i*.12})});
  }});
  $$('[data-par]').forEach(function(im){g.to(im,{yPercent:-8,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:true}})});

  /* ---------- banda porte: si espande + porte che ruotano ---------- */
  $$('[data-m="expand"]').forEach(function(el){
    g.fromTo(el,{clipPath:'inset(10% 7% 10% 7% round 40px)'},{clipPath:'inset(0% 0% 0% 0% round 26px)',ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 35%',scrub:true}});
  });
  $$('[data-m="door"]').forEach(function(el,i){
    var im=$('img',el);
    g.fromTo(im,{rotateY:-75,transformPerspective:700},{rotateY:0,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 95%',end:'top 45%',scrub:true}});
    g.from(el,{y:80,opacity:0,duration:1,ease:'power3.out',delay:i*.1,scrollTrigger:{trigger:el,start:'top 92%'}});
  });

  /* ---------- TRE LINEE: scena fissata con porte che si aprono ---------- */
  var lx=$('#s-lx');
  if(lx){
    var lxPin=$('.lx-pin',lx),doors=$$('.lx-door',lx),names=$$('.lx-n',lx),descs=$$('.lx-d',lx),bars=$$('.lx-prog li',lx),num=$('.lx-num',lx),chipsL=$$('.lx-chip',lx);
    var PRICES=[395,495,595],COL=[['rgba(168,138,99,.6)','#e2c793','rgba(200,170,110,.3)'],['rgba(91,141,239,.55)','#b9cdf7','rgba(120,170,255,.3)'],['rgba(200,170,110,.6)','#f0d59a','rgba(240,200,120,.35)']];
    var vert=matchMedia('(max-width:1000px)').matches;
    names.forEach(function(n){var t=n.textContent;n.innerHTML=t.split('').map(function(c){return '<span class="ch">'+(c===' '?'&nbsp;':c)+'</span>'}).join('')});
    g.set(doors.slice(1),{rotateY:-100,opacity:0});g.set(names.slice(1),{opacity:0});g.set(descs.slice(1),{opacity:0,y:20});
    var pr={v:PRICES[0]},cur=-1;
    function setLine(i){if(i===cur)return;cur=i;bars.forEach(function(b,k){b.classList.toggle('on',k===i)});
      lx.style.setProperty('--a1',COL[i][0]);lx.style.setProperty('--pc',COL[i][1]);lx.style.setProperty('--a2',COL[i][2]);
      var lk=$('[data-lx-link]',lx);if(lk)lk.href='/shop/porte-per-interni/#'+(['battenti','laccate-ral','laccate-ral'][i]);}
    setLine(0);
    var lt=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:lx,start:'top top',end:'+=220%',pin:lxPin,scrub:.7,anticipatePin:1,
      onUpdate:function(s){var p=s.progress;setLine(p<.4?0:p<.75?1:2);
        bars.forEach(function(b,k){var f=g.utils.clamp(0,1,(p-k/3)*3);g.set($('b',b),vert?{scaleX:f}:{scaleY:f})})}}});
    // ingresso
    var intro=g.timeline({scrollTrigger:{trigger:lx,start:'top 65%'}});
    intro.from(doors[0],{rotateY:80,opacity:0,duration:1.4,ease:'power3.out'})
      .from($$('.ch',names[0]),{yPercent:100,opacity:0,stagger:.025,duration:.8,ease:'power3.out'},.1)
      .from(chipsL,{opacity:0,duration:.6,stagger:.08},.4);
    lt.to({},{duration:.3},0);
    function step(i,at){
      lt.to(doors[i-1],{rotateY:-105,opacity:0,duration:.22,ease:'power2.in'},at)
        .fromTo(doors[i],{rotateY:100,opacity:0},{rotateY:0,opacity:1,duration:.24,ease:'power2.out'},at+.08)
        .fromTo($('.lx-glare',doors[i]),{backgroundPosition:'150% 0'},{backgroundPosition:'-60% 0',duration:.3},at+.18)
        .to($$('.ch',names[i-1]),{yPercent:-100,opacity:0,stagger:.004,duration:.12},at)
        .set(names[i-1],{opacity:0},at+.15).set(names[i],{opacity:1},at+.1)
        .fromTo($$('.ch',names[i]),{yPercent:100,opacity:0},{yPercent:0,opacity:1,stagger:.005,duration:.14},at+.1)
        .to(descs[i-1],{opacity:0,y:-20,duration:.1},at)
        .fromTo(descs[i],{opacity:0,y:20},{opacity:1,y:0,duration:.12},at+.12)
        .to(pr,{v:PRICES[i],duration:.2,ease:'power2.inOut',onUpdate:function(){num.textContent=Math.round(pr.v)}},at+.05)
        .fromTo(num,{filter:'blur(0px)'},{filter:'blur(6px)',duration:.1,yoyo:true,repeat:1},at+.05)
        .to(chipsL,{y:'-=14',stagger:.01,duration:.12,yoyo:true,repeat:1},at);
    }
    step(1,.36);step(2,.7);
    lt.to({},{duration:.06});
  }

  /* ---------- disegno su misura e icone: tratto che si disegna ---------- */
  $$('[data-m="draw"]').forEach(function(el){
    g.from(el,{clipPath:'inset(0 100% 0 0 round 16px)',duration:1.4,ease:'power3.inOut',scrollTrigger:{trigger:el,start:'top 85%'}});
  });
  $$('[data-m="usp"] svg').forEach(function(s,i){
    $$('path,rect,circle',s).forEach(function(p){try{var L=p.getTotalLength();g.fromTo(p,{strokeDasharray:L,strokeDashoffset:L},{strokeDashoffset:0,duration:1.4,ease:'power2.inOut',delay:i*.12,scrollTrigger:{trigger:s,start:'top 90%'}})}catch(e){}});
  });

  /* ---------- carte prodotto ---------- */
  function cardsIn(nodes,instant){
    if(!nodes||!nodes.length)return;
    g.set(nodes,{opacity:0,y:60,rotateX:-12,transformPerspective:900,transformOrigin:'50% 100%'});
    nodes.forEach(function(n){var im=$('.s-card-img',n);if(im)g.set(im,{clipPath:'inset(18% 18% 18% 18% round 40px)'})});
    ScrollTrigger.batch(nodes,{start:'top 95%',once:true,onEnter:function(b){
      g.to(b,{opacity:1,y:0,rotateX:0,duration:1,ease:'power4.out',stagger:.07,overwrite:true});
      b.forEach(function(n,i){var im=$('.s-card-img',n);if(im)g.to(im,{clipPath:'inset(0% 0% 0% 0% round 16px)',duration:1.1,ease:'power4.out',delay:i*.07,clearProps:'clipPath'})});
    }});
    ScrollTrigger.sort();ScrollTrigger.refresh();
  }

  /* ---------- rail "I più scelti": scorrimento orizzontale fissato ---------- */
  function pinRail(r){
    if(!r||!DESK)return;
    var sec=r.closest('section');sec.classList.add('pdm-pin');
    var dist=function(){return Math.max(0,r.scrollWidth-r.clientWidth+40)};
    g.to(r,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:sec,start:'top top+=40',end:function(){return '+='+dist()},pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1,refreshPriority:1}});
    ScrollTrigger.sort();ScrollTrigger.refresh();
  }

  /* ---------- HOME: si entra dalla porta ---------- */
  var dj=$('#s-dj');
  if(dj){
    var hdrEl=$('.s-head');function hdr(){var b=hdrEl?hdrEl.getBoundingClientRect().bottom+(window.scrollY||0):0;html.style.setProperty('--hdr',Math.round(b)+'px');return Math.round(b)}hdr();
    var pin=$('.dj-pin',dj),hole=$('.dj-hole',dj),anchor=$('.dj-anchor',dj),wallP=$('.dj-wall path',dj),wallS=$('.dj-wall',dj),leaf=$('.dj-leaf',dj),room=$('.dj-room img',dj),copy=$('.dj-copy',dj),hint=$('.dj-hint',dj),floor=$('.dj-floor',dj),light=$('.dj-light',dj),end=$('.dj-end',dj),dim=$('.dj-dim',dj);
    var st={p:0,ajar:0,mouse:0},B={},PW=0,PH=0,spill=$('.dj-spill',dj),spots=$$('.dj-spot',dj),tint=$('.dj-tint',dj),dust=$('.dj-dust',dj);
    function measure(){
      PW=pin.clientWidth;PH=pin.clientHeight;
      var pr=pin.getBoundingClientRect(),ar=anchor.getBoundingClientRect();
      B={x:ar.left-pr.left,y:ar.top-pr.top,w:ar.width,h:ar.height};
      var s=Math.max(PW/B.w,PH/B.h)*1.35;
      B.tw=B.w*s;B.th=B.h*s;B.tx=(PW-B.tw)/2;B.ty=(PH-B.th)/2+B.th*.04;
      wallS.setAttribute('viewBox','0 0 '+PW+' '+PH);
      render();
    }
    function seg(p,a,b){return g.utils.clamp(0,1,(p-a)/(b-a))}
    var ein=g.parseEase('power3.in'),eio=g.parseEase('power2.inOut');
    function render(){
      var p=st.p,k=ein(seg(p,.2,.88));
      var x=B.x+(B.tx-B.x)*k,y=B.y+(B.ty-B.y)*k,w=B.w+(B.tw-B.w)*k,h=B.h+(B.th-B.h)*k;
      hole.style.left=x+'px';hole.style.top=y+'px';hole.style.width=w+'px';hole.style.height=h+'px';hole.style.bottom='auto';
      wallP.setAttribute('d','M0 0H'+PW+'V'+PH+'H0Z M'+x.toFixed(1)+' '+y.toFixed(1)+'h'+w.toFixed(1)+'v'+h.toFixed(1)+'h'+(-w).toFixed(1)+'Z');
      hole.style.setProperty('--persp',Math.round(w*4.2)+'px');
      leaf.style.setProperty('--t',(w*4.4/80).toFixed(1)+'px');
      var ang=st.ajar+st.mouse+(100-st.ajar)*eio(seg(p,0,.42));
      leaf.style.transform='rotateY('+(-ang).toFixed(2)+'deg)';
      leaf.style.setProperty('--shade',(ang/100*.8).toFixed(2));
      // luce che entra dalla porta socchiusa
      if(spill){var sw=Math.max(PW*.5,w*2.4),sh=h*1.05;spill.style.left=(x+w*.15-sw)+'px';spill.style.top=(y+h-sh)+'px';spill.style.width=sw+'px';spill.style.height=sh+'px';spill.style.opacity=(Math.min(1,ang/30)*(1-seg(p,.05,.3))).toFixed(2)}
      // etichette ancorate alla porta
      if(spots.length&&PW>900){var vis=1-seg(p,0,.12);
        place(spots[0],x-18,y+h*.30,vis,true);
        place(spots[1],x+w+26,y+h*.52,vis,false);
        place(spots[2],x-18,y+h*.70,vis,true);}
      else if(spots.length){place(spots[0],x-14,y+h*.22,1-seg(p,0,.12),true)}
      hole._r={x:x,y:y,w:w,h:h};
    }
    function place(el,px,py,o,left){var r=el._w||(el._w=el.offsetWidth);el.classList.toggle('sp-left',!!left);g.set(el,{x:left?px-r:px,y:py-7,opacity:o*(el._in||0)})}
    // ingresso del primo schermo
    var enter=g.timeline({delay:introTl?2.2:(html.classList.contains('pd-wipe')?.5:.15)});
    enter.from([$('.dj-frame',dj),leaf,dim],{opacity:0,duration:1,ease:'power2.out'})
      .to(st,{ajar:20,duration:1.8,ease:'power3.inOut',onUpdate:render},'-=.5')
      .from($$('.dj-copy h1 .ln>span'),{yPercent:115,rotate:3,duration:1.1,ease:'power4.out',stagger:.1},.1)
      .from($$('.dj-copy .s-kick, .dj-copy p, .dj-copy .s-btns, .dj-copy .s-hero-facts'),{y:30,opacity:0,duration:.9,ease:'power3.out',stagger:.08},.45)
      .from(hint,{opacity:0,y:20,duration:.6},1.2)
      .from([$('.dj-dim',dj),$('.dj-wdim',dj)],{scale:0,duration:.9,ease:'power3.out'},.9)
      .add(function(){spots.forEach(function(s,i){g.to(s,{_in:1,duration:.7,delay:i*.25,ease:'power2.out',onUpdate:render})})},1.3)
      .add(function(){g.to(st,{ajar:30,duration:2.8,ease:'sine.inOut',yoyo:true,repeat:-1,onUpdate:render})},2.1);
    spots.forEach(function(s){s._in=0});
    // tinte RAL che cambiano sull'anta
    var RL=[['9010','#f1ece1','Bianco puro'],['6021','#9ab889','Verde pallido'],['5014','#6f7f9e','Blu colomba'],['3012','#cf9178','Rosso beige'],['7016','#4a5156','Antracite'],['1013','#e8dcc4','Bianco perla']],ri=0;
    var ralN=$('.ral-n',dj),ralT=$('.ral-t',dj),spR=$('.sp-ral',dj);
    setInterval(function(){if(st.p>.05||d.hidden)return;ri=(ri+1)%RL.length;var r=RL[ri];if(tint)tint.style.background=r[0]==='9010'||r[0]==='1013'?'#fff':r[1];if(spR)spR.style.setProperty('--ralc',r[1]);
      if(ralN){g.fromTo([ralN,ralT],{y:8,opacity:0},{y:0,opacity:1,duration:.5,stagger:.05,ease:'power2.out'});ralN.textContent='RAL '+r[0];ralT.textContent=r[2]}},2600);
    // parola che cambia nel titolo
    var rot=$('.dj-rot .rot-w',dj),WORDS=['al centimetro.','su misura.','in tinta RAL.','dal 1987.'],wi=0;
    function setWord(t){rot.innerHTML=t.split('').map(function(ch){return '<span class="ch">'+(ch===' '?'&nbsp;':ch)+'</span>'}).join('')}
    if(rot){setWord(WORDS[0]);setInterval(function(){if(st.p>.05||d.hidden)return;var old=$$('.ch',rot);
      g.to(old,{yPercent:-110,opacity:0,rotateX:60,duration:.45,stagger:.018,ease:'power3.in',onComplete:function(){wi=(wi+1)%WORDS.length;setWord(WORDS[wi]);g.from($$('.ch',rot),{yPercent:110,opacity:0,rotateX:-60,duration:.6,stagger:.022,ease:'power3.out'})}})},3200)}
    // pulviscolo nella luce
    if(dust&&dust.getContext){var cx=dust.getContext('2d'),P=[],dpr=Math.min(2,devicePixelRatio||1);
      function rs(){dust.width=dust.clientWidth*dpr;dust.height=dust.clientHeight*dpr}rs();addEventListener('resize',rs);
      for(var q=0;q<70;q++)P.push({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.8,s:.00015+Math.random()*.0005,a:Math.random()*6.28,o:.2+Math.random()*.5});
      g.ticker.add(function(){if(st.p>.4||!hole._r)return;var R=hole._r,W=dust.width,H=dust.height;cx.clearRect(0,0,W,H);
        var ox=(R.x-R.w*1.6)*dpr,ow=R.w*2.2*dpr,oy=R.y*dpr,oh=R.h*dpr,fade=1-seg(st.p,0,.3);
        for(var i=0;i<P.length;i++){var pt=P[i];pt.y-=pt.s;pt.a+=.01;if(pt.y<0)pt.y=1;var px=ox+(pt.x+Math.sin(pt.a)*.02)*ow,py=oy+pt.y*oh;
          cx.globalAlpha=pt.o*(.5+.5*Math.sin(pt.a*1.7))*fade*Math.min(1,st.ajar/20);cx.fillStyle='#fff6e2';cx.beginPath();cx.arc(px,py,pt.r*dpr,0,6.283);cx.fill()}});}
    measure();
    var tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:dj,start:function(){return 'top top+='+(hdrEl?hdrEl.offsetHeight:0)},end:'+=170%',pin:pin,scrub:.8,anticipatePin:1,invalidateOnRefresh:true,refreshPriority:10,onRefresh:measure}});
    tl.fromTo(st,{p:0},{p:1,duration:1,onUpdate:render},0)
      .fromTo(copy,{y:0,opacity:1},{y:-90,opacity:0,duration:.18},0)
      .fromTo(hint,{opacity:1},{opacity:0,duration:.08},0)
      .fromTo([dim,$('.dj-wdim',dj)],{opacity:1},{opacity:0,duration:.1},0)
      .fromTo(light,{opacity:1},{opacity:0,duration:.3},.1)
      .fromTo(floor,{yPercent:0},{yPercent:100,duration:.3,ease:'power2.in'},.2)
      .fromTo(leaf,{opacity:1},{opacity:0,duration:.16},.5)
      .fromTo(room,{scale:1.3},{scale:1,duration:.86,ease:'power2.out'},.14)
      .fromTo(end,{opacity:0},{opacity:1,duration:.14},.8)
      .fromTo($$('.dj-end h2 .ln>span'),{yPercent:110},{yPercent:0,duration:.16,stagger:.03},.8)
      .fromTo($$('.dj-end p'),{y:24,opacity:0},{y:0,opacity:1,duration:.12},.88);
    addEventListener('resize',function(){measure()});
    if(FINE){
      dj.addEventListener('pointermove',function(e){
        if(st.p>.02)return;var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
        g.to(st,{mouse:x*-12,duration:.8,ease:'power3.out',overwrite:'auto',onUpdate:render});
        g.to(room,{xPercent:-x*2,yPercent:-y*2,duration:1,ease:'power3.out'});
      });
    }
  }

  /* ---------- CATEGORIE: parola gigante e titolo ---------- */
  var bw=$('.s-bgword');
  if(bw){g.from(bw,{xPercent:20,opacity:0,duration:1.6,ease:'power4.out',delay:html.classList.contains('pd-wipe')?.4:.1});g.to(bw,{xPercent:-25,ease:'none',scrollTrigger:{trigger:d.body,start:'top top',end:'+=1200',scrub:true}})}
  var sub=$$('.s-sub');if(sub.length){sub.forEach(function(x){x.style.transition='none'});g.fromTo(sub,{y:30,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',stagger:.05,delay:.35,clearProps:'transform,opacity,transition'})}
  var tools=$('.s-tools');if(tools)g.fromTo(tools,{opacity:0},{opacity:1,duration:.8,delay:.5,clearProps:'opacity'});

  /* ---------- testata che si nasconde scendendo, riappare salendo ---------- */
  var head=$('.s-head'),last=0;
  var djEnd=function(){var e=$('#s-dj');return e?e.getBoundingClientRect().bottom+window.scrollY+innerHeight*1.8:0};
  if(head&&lenis){lenis.on('scroll',function(l){var y=l.scroll;if(y>Math.max(400,djEnd())&&y>last+4&&!d.body.classList.contains('s-cart-open'))head.classList.add('s-hide');else if(y<last-4||y<400)head.classList.remove('s-hide');last=y})}

  ScrollTrigger.sort();ScrollTrigger.refresh();
  addEventListener('load',function(){ScrollTrigger.sort();ScrollTrigger.refresh()});
})();
