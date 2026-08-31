/* Pan.door.a — menu mobile condiviso + fix touch
   Crea un drawer di navigazione funzionante su tutte le pagine.
   Si aggancia a un eventuale bottone .burger già presente,
   altrimenti inietta il proprio bottone in alto a destra. */
(function(){
  if(window.__pdMobileNav) return; window.__pdMobileNav = true;

  var PHONE = '+393356326505';
  var PHONE_LABEL = '+39 335 632 6505';
  var WA = 'https://wa.me/393884706887';
  var MAIL = 'ordini@pandooragroup.it';

  var LINKS = [
    {h:'index.html',              t:'Home',              s:'Pan.door.a'},
    {h:'pannelli-tamburati-1.html', t:'Pannelli Tamburati', s:'Allestimenti fieristici'},
    {h:'pannelli-tamburati-2.html', t:'Schede Tecniche',   s:'Specifiche e materiali'},
    {h:'porte.html',              t:'Porte',             s:'26 modelli'},
    {h:'pavimentazioni.html',     t:'Pavimentazioni',    s:'Parquet in rovere'},
    {h:'componenti.html',         t:'Componenti',        s:'Pedane e accessori'},
    {h:'verniciatura.html',       t:'Verniciatura',      s:'Laccatura e lucidatura'}
  ];

  var CSS = ''
  + '.pdm-burger{position:fixed;top:14px;right:14px;z-index:9997;width:48px;height:48px;border-radius:50%;'
  + 'display:none;align-items:center;justify-content:center;flex-direction:column;gap:5px;padding:0;'
  + 'border:1px solid rgba(255,255,255,.22);background:rgba(14,20,34,.72);'
  + '-webkit-backdrop-filter:blur(12px) saturate(140%);backdrop-filter:blur(12px) saturate(140%);'
  + 'box-shadow:0 8px 26px rgba(0,0,0,.32);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;'
  + 'transition:transform .25s cubic-bezier(.22,.61,.36,1),background .3s}'
  + '.pdm-burger:active{transform:scale(.93)}'
  + '.pdm-burger span{display:block;width:20px;height:2px;border-radius:2px;background:#fff;transition:transform .3s,opacity .3s}'
  + '@media(max-width:1080px){.pdm-burger{display:flex}}'

  + '.pdm-scrim{position:fixed;inset:0;z-index:100000;background:rgba(6,10,18,.55);'
  + '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;visibility:hidden;'
  + 'transition:opacity .3s,visibility .3s}'
  + 'body.pdm-open .pdm-scrim{opacity:1;visibility:visible}'

  + '.pdm-panel{position:fixed;top:0;right:0;bottom:0;z-index:100001;width:min(92vw,400px);'
  + 'display:flex;flex-direction:column;background:#0d1524;color:#fff;'
  + 'border-left:1px solid rgba(255,255,255,.08);box-shadow:-24px 0 60px rgba(0,0,0,.5);'
  + 'transform:translateX(102%);transition:transform .38s cubic-bezier(.22,.61,.36,1);'
  + 'overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;'
  + 'padding:max(14px,env(safe-area-inset-top)) 0 max(18px,env(safe-area-inset-bottom));'
  + 'font-family:"Manrope",system-ui,-apple-system,Segoe UI,Arial,sans-serif}'
  + 'body.pdm-open .pdm-panel{transform:translateX(0)}'
  + '.pdm-panel *{box-sizing:border-box;cursor:auto}'

  + '.pdm-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:6px 20px 10px}'
  + '.pdm-head img{height:34px;width:auto;filter:brightness(0) invert(1)}'
  + '.pdm-close{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:1px solid rgba(255,255,255,.16);'
  + 'background:rgba(255,255,255,.05);color:#fff;display:flex;align-items:center;justify-content:center;'
  + 'cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .25s}'
  + '.pdm-close:active{background:rgba(255,255,255,.16)}'
  + '.pdm-close svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}'

  + '.pdm-list{list-style:none;margin:0;padding:4px 12px 6px}'
  + '.pdm-list li{margin:0}'
  + '.pdm-link{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-height:50px;'
  + 'padding:10px 14px;border-radius:13px;text-decoration:none;color:#fff;'
  + 'font-size:16.5px;font-weight:700;letter-spacing:-.2px;line-height:1.25;'
  + '-webkit-tap-highlight-color:transparent;transition:background .2s}'
  + '.pdm-link:active{background:rgba(255,255,255,.09)}'
  + '.pdm-link small{display:block;width:100%;font-size:12px;font-weight:500;letter-spacing:.2px;'
  + 'color:rgba(255,255,255,.45);margin-top:3px}'
  + '.pdm-link.cur{background:rgba(91,141,239,.14);color:#fff}'
  + '.pdm-link.cur small{color:rgba(139,195,74,.85)}'

  + '.pdm-sep{height:1px;margin:8px 26px;background:rgba(255,255,255,.09)}'
  + '.pdm-foot{margin-top:auto;position:sticky;bottom:0;padding:14px 20px 10px;display:flex;'
  + 'flex-direction:column;gap:9px;'
  + 'background:linear-gradient(180deg,rgba(13,21,36,0) 0%,#0d1524 26%,#0d1524 100%)}'
  + '.pdm-cta{display:flex;align-items:center;justify-content:center;gap:9px;min-height:48px;'
  + 'border-radius:100px;text-decoration:none;font-size:15px;font-weight:700;'
  + '-webkit-tap-highlight-color:transparent;transition:transform .2s}'
  + '.pdm-cta:active{transform:scale(.98)}'
  + '.pdm-cta svg{width:18px;height:18px;flex:0 0 18px}'
  + '.pdm-cta.red{background:#c0392b;color:#fff}'
  + '.pdm-cta.green{background:#25d366;color:#08240f}'
  + '.pdm-cta.ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.16)}'
  + '.pdm-mail{display:block;text-align:center;padding:6px 0 2px;font-size:12.5px;'
  + 'color:rgba(255,255,255,.5);text-decoration:none;word-break:break-all}'

  /* mentre il menu è aperto: blocca lo scroll e nascondi il selettore lingua */
  + 'body.pdm-open{overflow:hidden!important}'
  + 'body.pdm-open .pdlang{opacity:0;visibility:hidden;pointer-events:none}'
  + '@media(prefers-reduced-motion:reduce){.pdm-panel,.pdm-scrim{transition:none}}';

  function el(tag, cls, html){ var n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; }

  function build(){
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);

    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    var scrim = el('div','pdm-scrim');
    var panel = el('aside','pdm-panel');
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','Menu di navigazione');

    var logo = document.querySelector('.brand img, .nav-logo img, #logoTop img');
    var logoSrc = logo ? logo.getAttribute('src') : 'pandoora_logo_nobg.png';

    var head = el('div','pdm-head');
    var lg = el('a'); lg.href='index.html'; lg.innerHTML='<img src="'+logoSrc+'" alt="Pan.door.a">';
    var cl = el('button','pdm-close','<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>');
    cl.type='button'; cl.setAttribute('aria-label','Chiudi menu');
    head.appendChild(lg); head.appendChild(cl); panel.appendChild(head);

    var ul = el('ul','pdm-list');
    LINKS.forEach(function(l){
      var li = el('li');
      var a = el('a','pdm-link' + (l.h.toLowerCase()===here ? ' cur' : ''));
      a.href = l.h;
      a.innerHTML = l.t + '<small>' + l.s + '</small>';
      li.appendChild(a); ul.appendChild(li);
    });
    panel.appendChild(ul);
    panel.appendChild(el('div','pdm-sep'));

    var foot = el('div','pdm-foot');
    foot.innerHTML =
      '<a class="pdm-cta red" href="preventivo.html">Richiedi un preventivo</a>'
    + '<a class="pdm-cta green" href="'+WA+'" target="_blank" rel="noopener">'
    + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.23-3.24-.68-2.73-1.08-4.45-3.87-4.58-4.05-.13-.18-1.09-1.45-1.09-2.76s.69-1.96.93-2.23c.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.59.45.24.57.8 1.98.87 2.12.07.14.12.31.02.49-.09.18-.14.29-.28.45l-.42.49c-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.94 1.95 1.23 2.23 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.32.07.11.07.63-.17 1.31z"/></svg>'
    + 'WhatsApp</a>'
    + '<a class="pdm-cta ghost" href="tel:'+PHONE+'">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>'
    + PHONE_LABEL+'</a>'
    + '<a class="pdm-mail" href="mailto:'+MAIL+'">'+MAIL+'</a>';
    panel.appendChild(foot);

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    /* bottone: usa quello esistente se c'è, altrimenti creane uno */
    var triggers = [].slice.call(document.querySelectorAll('.burger'));
    if(!triggers.length){
      var b = el('button','pdm-burger','<span></span><span></span><span></span>');
      b.type='button'; b.setAttribute('aria-label','Apri menu');
      document.body.appendChild(b);
      triggers = [b];
    }

    var lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      document.body.classList.add('pdm-open');
      triggers.forEach(function(t){ t.setAttribute('aria-expanded','true'); });
      panel.setAttribute('tabindex','-1');
      setTimeout(function(){ try{ cl.focus(); }catch(e){} }, 60);
    }
    function close(){
      document.body.classList.remove('pdm-open');
      triggers.forEach(function(t){ t.setAttribute('aria-expanded','false'); });
      if(lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(e){} }
    }
    function toggle(e){
      if(e){ e.preventDefault(); e.stopPropagation(); }
      document.body.classList.contains('pdm-open') ? close() : open();
    }

    triggers.forEach(function(t){
      t.setAttribute('aria-expanded','false');
      t.setAttribute('aria-controls','pdm-panel');
      t.style.touchAction = 'manipulation';
      t.addEventListener('click', toggle, false);
    });
    panel.id = 'pdm-panel';

    cl.addEventListener('click', function(e){ e.preventDefault(); close(); });
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
    panel.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a') : null;
      if(a) close();
    });
    window.addEventListener('pagehide', close);
  }


  /* ── rete lenta / CDN irraggiungibile: se GSAP non arriva, mostra comunque i contenuti ──
     Su mobile capita che la libreria di animazione non si carichi: senza questa rete
     di sicurezza la pagina resterebbe bianca perché i blocchi partono con opacity:0. */
  function gsapFallback(){
    var usesGsap = !!document.querySelector('script[src*="gsap"]');
    if(!usesGsap || window.gsap) return;
    var revealed = 0;
    document.querySelectorAll('section,header,footer,nav,div,h1,h2,h3,h4,p,li,span,a,img').forEach(function(n){
      if(n.closest('.pdm-panel,.pdm-scrim,.pdlang,#cur,#curRing,#intro')) return;
      var cs = getComputedStyle(n);
      if(cs.display === 'none' || cs.visibility === 'hidden') return;
      if(parseFloat(cs.opacity) === 0){
        n.style.setProperty('opacity','1','important');
        if(cs.transform && cs.transform !== 'none') n.style.setProperty('transform','none','important');
        revealed++;
      }
    });
    var intro = document.getElementById('intro');
    if(intro){ intro.style.display = 'none'; document.body.classList.remove('introing'); }
    document.documentElement.style.overflowY = 'auto';
    if(revealed) try{ console.warn('[pandoora] GSAP non caricato: contenuti mostrati senza animazioni ('+revealed+' elementi)'); }catch(e){}
  }
  window.addEventListener('load', function(){ setTimeout(gsapFallback, 2500); });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
