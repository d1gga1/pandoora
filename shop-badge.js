/* Pan.door.a — pulsante "Pandoora Shop" in alto a destra su tutte le pagine.
   Si inserisce nella barra .topbar (a destra, prima del menu); dove la barra non c'è
   resta fisso in alto a destra, accanto al menu mobile. */
(function(){
  if(window.__pdShop) return; window.__pdShop = true;
  if(/^\/shop(\/|$)/.test(location.pathname)) return;
  var URL = '/shop/';

  var css = ''
  /* pillola */
  + '.pdshop{position:relative;display:inline-flex;flex-shrink:0;height:46px;border-radius:100px;text-decoration:none!important;color:#fff!important;'
  + 'font-family:"Manrope",system-ui,-apple-system,Segoe UI,Arial,sans-serif;line-height:1;white-space:nowrap;-webkit-tap-highlight-color:transparent;'
  + 'animation:pdsGlow 2.8s ease-in-out infinite;transition:transform .35s cubic-bezier(.22,.61,.36,1)}'
  + '.topbar>.pdshop--push{margin-left:auto}@media(max-width:1080px){.topbar>.pdshop{margin-left:auto}}'
  + '.pdshop-in{position:relative;display:flex;align-items:center;gap:11px;height:100%;padding:0 18px 0 6px;border-radius:inherit;overflow:hidden;'
  + 'background:radial-gradient(120% 140% at 0% 50%,#3a1714 0%,#141b2b 46%,#0a0f1a 100%);border:1px solid rgba(255,255,255,.14)}'
  /* fascio di luce che attraversa */
  + '.pdshop-in::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-60%;width:45%;transform:skewX(-22deg);'
  + 'background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:pdsSweep 4.2s cubic-bezier(.4,0,.2,1) infinite}'
  + '.pdshop:hover{transform:translateY(-2px)}'
  + '.pdshop:hover .pdshop-in{border-color:rgba(224,74,58,.7)}'
  + '.pdshop:focus-visible{outline:2px solid #e04a3a;outline-offset:4px}'
  /* icona */
  + '.pdshop-ic{position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;flex-shrink:0;'
  + 'background:linear-gradient(145deg,#ef5a48,#b3261c);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 4px 12px rgba(192,57,43,.55)}'
  + '.pdshop-ic::before{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(239,90,72,.75);animation:pdsRing 2.8s ease-out infinite}'
  + '.pdshop-ic svg{width:17px;height:17px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transform-origin:50% 15%;animation:pdsSwing 4.2s ease-in-out infinite}'
  /* testo */
  + '.pdshop-tx{display:flex;flex-direction:column;justify-content:center;gap:3px;flex-shrink:0}'
  + '.pdshop-k{font-family:"Fraunces",Georgia,serif;font-style:italic;font-weight:600;font-size:12.5px;letter-spacing:.2px;color:rgba(255,255,255,.66)}'
  + '.pdshop-b{font-weight:800;font-size:16px;letter-spacing:4px;margin-right:-4px;'
  + 'background:linear-gradient(100deg,#fff 0%,#fff 40%,#ffb4a8 50%,#fff 60%,#fff 100%);background-size:260% 100%;'
  + '-webkit-background-clip:text;background-clip:text;color:transparent;animation:pdsShine 4.2s linear infinite}'
  + '.pdshop-ar{display:flex;width:16px;height:16px;margin-left:2px;opacity:.75;transition:transform .35s,opacity .35s}'
  + '.pdshop-ar svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;animation:pdsNudge 2.8s ease-in-out infinite}'
  + '.pdshop:hover .pdshop-ar{transform:translateX(4px);opacity:1}'
  /* adesivo NEW */
  + '.pdshop-new{position:absolute;top:-11px;right:-12px;z-index:2;display:flex;align-items:center;gap:3px;height:20px;padding:0 7px 0 6px;border-radius:6px;overflow:hidden;'
  + 'background:linear-gradient(135deg,#ff6a55,#c0392b 60%,#9e2318);border:2px solid #fff;color:#fff;'
  + 'font-size:9.5px;font-weight:800;letter-spacing:1.4px;box-shadow:0 6px 14px rgba(192,57,43,.5);transform:rotate(8deg);animation:pdsPop 2.8s ease-in-out infinite}'
  + '.pdshop-new svg{width:9px;height:9px;fill:#fff;animation:pdsTwinkle 1.4s ease-in-out infinite}'
  + '.pdshop-new::after{content:"";position:absolute;top:0;bottom:0;left:-80%;width:50%;transform:skewX(-20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);animation:pdsSweep 2.8s ease-in-out infinite .6s}'
  /* fisso (pagine senza barra) */
  + '.pdshop--fixed{position:fixed;top:max(16px,env(safe-area-inset-top));right:24px;z-index:9996}'
  + '@media(max-width:1080px){.pdshop--fixed{right:76px}}'
  + '@media(max-width:600px){.pdshop{height:40px}.pdshop-in{gap:8px;padding:0 24px 0 4px}.pdshop-ic{width:31px;height:31px}.pdshop-ic svg{width:15px;height:15px}'
  + '.pdshop-k{font-size:11px}.pdshop-b{font-size:13.5px;letter-spacing:3px;margin-right:-3px}.pdshop-ar{display:none}.pdshop-new{top:-12px;right:-10px;height:18px;font-size:8.5px;padding:0 5px}}'
  + '@media(max-width:430px){.topbar .nav-cta{display:none!important}}'
  /* animazioni */
  + '@keyframes pdsGlow{0%,100%{box-shadow:0 8px 22px rgba(192,57,43,.28),0 0 0 0 rgba(224,74,58,0)}50%{box-shadow:0 10px 30px rgba(192,57,43,.5),0 0 0 5px rgba(224,74,58,.14)}}'
  + '@keyframes pdsSweep{0%,55%{left:-60%}85%,100%{left:130%}}'
  + '@keyframes pdsShine{0%,50%{background-position:100% 0}85%,100%{background-position:0 0}}'
  + '@keyframes pdsRing{0%{transform:scale(.85);opacity:.9}70%,100%{transform:scale(1.35);opacity:0}}'
  + '@keyframes pdsSwing{0%,62%,100%{transform:rotate(0)}68%{transform:rotate(-14deg)}74%{transform:rotate(11deg)}80%{transform:rotate(-6deg)}86%{transform:rotate(3deg)}}'
  + '@keyframes pdsNudge{0%,60%,100%{transform:translateX(0)}75%{transform:translateX(3px)}}'
  + '@keyframes pdsPop{0%,70%,100%{transform:rotate(8deg) scale(1)}78%{transform:rotate(2deg) scale(1.14)}86%{transform:rotate(10deg) scale(.98)}}'
  + '@keyframes pdsTwinkle{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(.6) rotate(45deg);opacity:.7}}'
  + '@media(prefers-reduced-motion:reduce){.pdshop,.pdshop *,.pdshop *::before,.pdshop *::after{animation:none!important}.pdshop-b{color:#fff;background:none}}';

  function build(){
    if(document.querySelector('.pdshop')) return;
    var st = document.createElement('style'); st.id = 'pdshop-css'; st.textContent = css; document.head.appendChild(st);
    var a = document.createElement('a');
    a.className = 'pdshop'; a.href = URL; a.setAttribute('aria-label','Pandoora Shop, negozio online');
    a.innerHTML = '<span class="pdshop-in">'
      + '<span class="pdshop-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg></span>'
      + '<span class="pdshop-tx"><span class="pdshop-k">Pandoora</span><span class="pdshop-b">SHOP</span></span>'
      + '<span class="pdshop-ar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></span>'
      + '</span>'
      + '<span class="pdshop-new" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 1l2.8 8.2L23 12l-8.2 2.8L12 23l-2.8-8.2L1 12l8.2-2.8z"/></svg>NEW</span>';
    var bar = document.querySelector('header.topbar, .topbar');
    if(bar){
      /* figlio diretto della barra: prima del blocco che contiene il pulsante preventivo, o prima del menu */
      var ref = bar.querySelector('.nav-cta') || bar.querySelector('.burger');
      while(ref && ref.parentNode !== bar) ref = ref.parentNode;
      if(ref && !ref.classList.contains('nav-cta')) a.classList.add('pdshop--push');
      if(ref) bar.insertBefore(a, ref); else bar.appendChild(a);
    } else {
      a.classList.add('pdshop--fixed');
      document.body.appendChild(a);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
