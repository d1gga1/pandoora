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
    ScrollTrigger.refresh();
  }

  /* ---------- rail "I più scelti": scorrimento orizzontale fissato ---------- */
  function pinRail(r){
    if(!r||!DESK)return;
    var sec=r.closest('section');sec.classList.add('pdm-pin');
    var dist=function(){return Math.max(0,r.scrollWidth-r.clientWidth+40)};
    g.to(r,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:sec,start:'top top+=40',end:function(){return '+='+dist()},pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1}});
    ScrollTrigger.refresh();
  }

  /* ---------- HOME: si entra dalla porta ---------- */
  var dj=$('#s-dj');
  if(dj){
    var hdrEl=$('.s-head');function hdr(){var b=hdrEl?hdrEl.getBoundingClientRect().bottom+(window.scrollY||0):0;html.style.setProperty('--hdr',Math.round(b)+'px');return Math.round(b)}hdr();
    var pin=$('.dj-pin',dj),hole=$('.dj-hole',dj),leaf=$('.dj-leaf',dj),room=$('.dj-room img',dj),copy=$('.dj-copy',dj),hint=$('.dj-hint',dj),floor=$('.dj-floor',dj),light=$('.dj-light',dj),end=$('.dj-end',dj);
    function th(){leaf.style.setProperty('--t',(leaf.offsetWidth*4.4/80).toFixed(1)+'px')}th();addEventListener('resize',th);
    // ingresso del primo schermo
    var enter=g.timeline({delay:introTl?2.2:(html.classList.contains('pd-wipe')?.5:.15)});
    enter.from([$('.dj-frame',dj),leaf,$('.dj-dim',dj)],{opacity:0,duration:1.1,ease:'power2.out'})
      .fromTo(leaf,{rotateY:0},{rotateY:22,duration:1.6,ease:'power3.inOut'},'-=.6')
      .from($$('.dj-copy h1 .ln>span'),{yPercent:115,rotate:3,duration:1.1,ease:'power4.out',stagger:.1},.1)
      .from($$('.dj-copy .s-kick, .dj-copy p, .dj-copy .s-btns, .dj-copy .s-hero-facts'),{y:30,opacity:0,duration:.9,ease:'power3.out',stagger:.08},.45)
      .from(hint,{opacity:0,y:20,duration:.6},1.2);
    // scorrimento: la porta si apre e la camera entra
    var S=function(){var r=hole.getBoundingClientRect(),p=pin.getBoundingClientRect();return Math.max(p.width/r.width,p.height/r.height)*1.6};
    var DX=function(){var r=hole.getBoundingClientRect(),p=pin.getBoundingClientRect();return (p.left+p.width/2)-(r.left+r.width/2)};
    var DY=function(){var r=hole.getBoundingClientRect(),p=pin.getBoundingClientRect();return (p.top+p.height/2)-(r.top+r.height/2)};
    var base={};function measure(){g.set(hole,{x:0,y:0,scale:1});base={s:S(),dx:DX(),dy:DY()}}
    var tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:dj,start:function(){return 'top top+='+(hdrEl?hdrEl.offsetHeight:0)},end:'+=170%',pin:pin,scrub:.8,anticipatePin:1,invalidateOnRefresh:true,onRefreshInit:measure}});
    measure();
    tl.fromTo(copy,{y:0,opacity:1},{y:-90,opacity:0,duration:.18},0)
      .fromTo(hint,{opacity:1},{opacity:0,duration:.08},0)
      .fromTo(leaf,{rotateY:22},{rotateY:108,duration:.42,ease:'power2.in'},0)
      .fromTo(leaf,{opacity:1},{opacity:0,duration:.14},.4)
      .fromTo(light,{opacity:1},{opacity:0,duration:.3},.1)
      .fromTo(floor,{yPercent:0},{yPercent:100,duration:.3,ease:'power2.in'},.25)
      .fromTo(hole,{x:0,y:0,scale:1},{x:function(){return base.dx},y:function(){return base.dy},scale:function(){return base.s},duration:.62,ease:'power3.in'},.24)
      .fromTo(room,{scale:1.3},{scale:1,duration:.86,ease:'power2.out'},.14)
      .fromTo(end,{opacity:0},{opacity:1,duration:.14},.8)
      .fromTo($$('.dj-end h2 .ln>span'),{yPercent:110},{yPercent:0,duration:.16,stagger:.03},.8)
      .fromTo($$('.dj-end p'),{y:24,opacity:0},{y:0,opacity:1,duration:.12},.88);
    if(FINE){
      dj.addEventListener('pointermove',function(e){
        if(window.scrollY>40)return;var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
        g.to(leaf,{rotateY:22+x*14,duration:.8,ease:'power3.out',overwrite:'auto'});
        g.to(room,{xPercent:-x*2,yPercent:-y*2,duration:1,ease:'power3.out'});
      });
    }
  }

  /* ---------- CATEGORIE: parola gigante e titolo ---------- */
  var bw=$('.s-bgword');
  if(bw){g.from(bw,{xPercent:20,opacity:0,duration:1.6,ease:'power4.out',delay:html.classList.contains('pd-wipe')?.4:.1});g.to(bw,{xPercent:-25,ease:'none',scrollTrigger:{trigger:d.body,start:'top top',end:'+=1200',scrub:true}})}
  var sub=$$('.s-sub');if(sub.length)g.from(sub,{y:30,opacity:0,duration:.8,ease:'power3.out',stagger:.05,delay:.35});
  var tools=$('.s-tools');if(tools)g.from(tools,{opacity:0,y:20,duration:.8,delay:.5});

  /* ---------- testata che si nasconde scendendo, riappare salendo ---------- */
  var head=$('.s-head'),last=0;
  var djEnd=function(){var e=$('#s-dj');return e?e.getBoundingClientRect().bottom+window.scrollY+innerHeight*1.8:0};
  if(head&&lenis){lenis.on('scroll',function(l){var y=l.scroll;if(y>Math.max(400,djEnd())&&y>last+4&&!d.body.classList.contains('s-cart-open'))head.classList.add('s-hide');else if(y<last-4||y<400)head.classList.remove('s-hide');last=y})}

  addEventListener('load',function(){ScrollTrigger.refresh()});
})();
