/* ══════════════════════════════════════════════════════════════════════
   PAN.DOOR.A — TRANSIZIONE LOGO 3D (fondo bianco)
   Stessa animazione dell'intro di pandoora_hub: il velo bianco si apre
   dal punto del click, la porta del logo ruota in 3D, le lettere di
   PAN.DOOR.A. si ribaltano una a una, un riflesso attraversa il marchio,
   poi la camera "varca la soglia" e si passa alla nuova pagina.
   Nessuna libreria esterna.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LOGO    = 'pandoora_logo.webp';
  var DUR     = 1780;                 // ms totali prima del cambio pagina
  var KEY     = 'pdxArrive';
  var DEF_ACC = '#5B8DEF';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* accento per sezione */
  var ACCENTS = { s1:'#E0A94A', s2:'#8FB6FF', s3:'#E8C25A', s4:'#5B8DEF', s5:'#B36BFF' };

  /* sprite del logo ufficiale (spazio 1536×1024, fattore 0.30) */
  var SPR = { bg:'460.8px 307.2px' };
  var DOOR = { w:169.5, h:198.3, x:-141.6, y:-22.2 };
  var WORD_Y = -240.3, WORD_H = 41.4;
  /* [larghezza, offset-x, margine-destro] per P A N . D O O R . A . */
  var LTR = [
    [27.0,-86.4,4.2],[36.3,-117.6,5.1],[34.2,-159.0,4.5],[3.9,-197.7,2.1],
    [34.8,-203.7,1.2],[42.6,-239.7,0.9],[42.0,-283.2,1.8],[28.2,-327.0,1.8],
    [3.9,-357.0,2.4],[36.0,-363.3,2.1],[3.9,-401.4,0]
  ];

  var CSS = `
.pdx{position:fixed;inset:0;z-index:100000;display:none;pointer-events:none;
  --acc:${DEF_ACC};--px:50%;--py:50%;
  perspective:1400px;perspective-origin:50% 46%}
.pdx.on{display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:auto}
.pdx-veil{position:absolute;inset:0;background:#fff;clip-path:circle(0% at var(--px) var(--py))}
.pdx.on .pdx-veil{animation:pdxVeil .52s cubic-bezier(.65,0,.35,1) forwards}
@keyframes pdxVeil{to{clip-path:circle(155% at var(--px) var(--py))}}
.pdx-glow{position:absolute;top:44%;left:50%;width:min(92vw,900px);height:min(92vw,900px);
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(27,62,122,.11) 0%,rgba(27,62,122,.045) 36%,rgba(255,255,255,0) 67%);
  opacity:0}
.pdx.on .pdx-glow{animation:pdxGlow 1.1s .25s cubic-bezier(.16,1,.3,1) forwards}
@keyframes pdxGlow{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}

.pdx-stage{position:relative;transform-style:preserve-3d;opacity:0}
.pdx.on .pdx-stage{animation:pdxExit .5s 1.28s cubic-bezier(.6,0,.9,.3) forwards,pdxStageIn .01s .24s forwards}
@keyframes pdxStageIn{to{opacity:1}}
@keyframes pdxExit{0%{opacity:1;transform:scale(1) translateZ(0);filter:blur(0)}
  100%{opacity:0;transform:scale(3.4) translateZ(420px);filter:blur(7px)}}

.pdx-lock{--s:1;position:relative;transform-style:preserve-3d;transform:scale(var(--s))}
.pdx-ring{position:absolute;top:38%;left:50%;width:200px;height:200px;margin:-100px 0 0 -100px;
  border:1px solid var(--acc);border-radius:50%;opacity:0}
.pdx.on .pdx-ring{animation:pdxRing 1.35s cubic-bezier(.16,1,.3,1) both}
@keyframes pdxRing{0%{opacity:0;transform:scale(.18)}22%{opacity:.45}100%{opacity:0;transform:scale(2.9)}}

.pdx-door{width:${DOOR.w}px;height:${DOOR.h}px;margin:0 auto 4px;
  background:url('${LOGO}') no-repeat;background-size:${SPR.bg};
  background-position:${DOOR.x}px ${DOOR.y}px;
  transform-origin:26% 50%;filter:drop-shadow(0 20px 30px rgba(14,30,64,.22));opacity:0}
.pdx.on .pdx-door{animation:pdxDoor 1.05s .24s cubic-bezier(.16,1,.3,1) both}
@keyframes pdxDoor{
  0%{opacity:0;transform:perspective(950px) translateZ(-500px) rotateY(-118deg) rotateX(18deg) scale(1.35)}
  42%{opacity:1}
  74%{transform:perspective(950px) translateZ(0) rotateY(13deg) rotateX(-4deg) scale(1.04)}
  100%{opacity:1;transform:perspective(950px) translateZ(0) rotateY(0) rotateX(0) scale(1)}}
.pdx-sh{width:132px;height:13px;margin:0 auto 18px;border-radius:50%;opacity:0;
  background:radial-gradient(ellipse,rgba(14,30,64,.26) 0%,rgba(14,30,64,0) 72%)}
.pdx.on .pdx-sh{animation:pdxSh 1.05s .24s cubic-bezier(.16,1,.3,1) both}
@keyframes pdxSh{0%{opacity:0;transform:scale(.2,.5)}55%{opacity:.45}100%{opacity:1;transform:scale(1,1)}}

.pdx-word{display:flex;align-items:flex-end;justify-content:center;transform-style:preserve-3d}
.pdx-word i{display:block;height:${WORD_H}px;background-image:url('${LOGO}');
  background-repeat:no-repeat;background-size:${SPR.bg};
  transform-origin:50% 100%;opacity:0}
.pdx.on .pdx-word i{animation:pdxLtr .62s cubic-bezier(.2,1.25,.32,1) both}
@keyframes pdxLtr{0%{opacity:0;transform:rotateX(-96deg) translateY(26px) translateZ(-45px)}
  55%{opacity:1}100%{opacity:1;transform:none}}

.pdx-shine{position:absolute;left:-55%;top:-12%;width:75%;height:124%;pointer-events:none;
  background:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.82) 50%,rgba(255,255,255,0) 70%);
  -webkit-mask-image:radial-gradient(ellipse 62% 58% at 50% 50%,#000 35%,rgba(0,0,0,0) 80%);
  mask-image:radial-gradient(ellipse 62% 58% at 50% 50%,#000 35%,rgba(0,0,0,0) 80%);
  mix-blend-mode:screen;opacity:0}
.pdx.on .pdx-shine{animation:pdxShine .9s .95s ease-in-out both}
@keyframes pdxShine{0%{opacity:0;transform:translateX(0)}18%{opacity:1}82%{opacity:1}100%{opacity:0;transform:translateX(280%)}}

.pdx-dest{position:relative;margin-top:26px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
  font-size:9px;font-weight:700;letter-spacing:5px;text-transform:uppercase;
  color:var(--acc);opacity:0;text-shadow:0 1px 0 rgba(255,255,255,.6)}
.pdx.on .pdx-dest{animation:pdxDest .5s .95s cubic-bezier(.16,1,.3,1) forwards,
                            pdxDestOut .35s 1.36s ease-in forwards}
@keyframes pdxDest{from{opacity:0;letter-spacing:13px}to{opacity:.95;letter-spacing:5px}}
@keyframes pdxDestOut{to{opacity:0;transform:translateY(12px)}}

.pdx-flash{position:absolute;inset:0;background:#fff;opacity:0}
.pdx.on .pdx-flash{animation:pdxFlash .42s 1.42s ease-in forwards}
@keyframes pdxFlash{to{opacity:1}}

.pdx-arrive{position:fixed;inset:0;z-index:99999;pointer-events:none;
  background:radial-gradient(circle at 50% 47%,#fff 0%,#fff 42%,var(--acc,${DEF_ACC}) 74%,rgba(255,255,255,0) 100%);
  animation:pdxArrive .75s cubic-bezier(.4,0,.2,1) forwards}
@keyframes pdxArrive{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.7)}}

body.pdx-busy #cur,body.pdx-busy #curRing{opacity:0;transition:opacity .25s}
@media(max-width:900px){.pdx-lock{--s:.82}}
@media(max-width:600px){.pdx-lock{--s:.62}}
@media(prefers-reduced-motion:reduce){.pdx,.pdx-arrive{display:none!important}}
`;

  function injectCSS() {
    if (document.getElementById('pdx-css')) return;
    var s = document.createElement('style'); s.id = 'pdx-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var root = null, dest = null, running = false, watchdog = null;

  function build() {
    if (root) return root;
    injectCSS();
    root = document.createElement('div');
    root.className = 'pdx';

    var word = '';
    for (var i = 0; i < LTR.length; i++) {
      word += '<i style="width:' + LTR[i][0] + 'px;background-position:' + LTR[i][1] + 'px ' +
              WORD_Y + 'px;margin-right:' + LTR[i][2] + 'px;animation-delay:' +
              (0.52 + i * 0.045).toFixed(3) + 's"></i>';
    }

    root.innerHTML =
      '<div class="pdx-veil"></div>' +
      '<div class="pdx-glow"></div>' +
      '<div class="pdx-stage">' +
        '<div class="pdx-lock">' +
          '<div class="pdx-ring" style="animation-delay:.78s"></div>' +
          '<div class="pdx-ring" style="animation-delay:1.02s"></div>' +
          '<div class="pdx-door"></div>' +
          '<div class="pdx-sh"></div>' +
          '<div class="pdx-word">' + word + '</div>' +
          '<div class="pdx-shine"></div>' +
        '</div>' +
        '<div class="pdx-dest"></div>' +
      '</div>' +
      '<div class="pdx-flash"></div>';

    document.body.appendChild(root);
    dest = root.querySelector('.pdx-dest');
    return root;
  }

  /* scurisce l'accento: i colori chiari devono restare leggibili sul bianco */
  function darken(hex, f) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16); if (isNaN(n)) return hex;
    var r = Math.round(((n >> 16) & 255) * f),
        g = Math.round(((n >> 8) & 255) * f),
        b = Math.round((n & 255) * f);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function preload() {
    var i = new Image(); i.src = LOGO;
  }

  function play(href, opts) {
    if (running) return;
    running = true; opts = opts || {};
    var acc = opts.accent || DEF_ACC;
    var el = build();
    el.style.setProperty('--acc', darken(acc, .58));
    el.style.setProperty('--px', (opts.x != null ? opts.x : innerWidth / 2) + 'px');
    el.style.setProperty('--py', (opts.y != null ? opts.y : innerHeight / 2) + 'px');
    dest.textContent = opts.label || '';
    document.body.classList.add('pdx-busy');
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');

    try { sessionStorage.setItem(KEY, acc); } catch (e) {}
    setTimeout(function () { location.href = href; }, DUR);
    /* rete di sicurezza: se la navigazione non parte (link rotto, download,
       navigazione annullata) non lasciamo la pagina coperta dal velo bianco */
    watchdog = setTimeout(reset, DUR + 2500);
  }

  function arrive() {
    var acc; try { acc = sessionStorage.getItem(KEY); } catch (e) { acc = null; }
    if (!acc || REDUCED) return;
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    injectCSS();
    var a = document.createElement('div'); a.className = 'pdx-arrive';
    a.style.setProperty('--acc', acc); document.body.appendChild(a);
    setTimeout(function () { a.remove(); }, 850);
  }

  function label(a) {
    var t = a.getAttribute('data-pdx-label'); if (t) return t;
    var n = a.querySelector('.sec-title'); if (!n) return '';
    return n.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ').trim();
  }
  function accentOf(a) { return a.getAttribute('data-pdx-accent') || ACCENTS[a.id] || DEF_ACC; }

  function wire() {
    injectCSS();
    var links = document.querySelectorAll('a.hub-sec,a[data-pdx]');
    if (links.length) preload();
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(href)) return;
      a.addEventListener('mouseenter', function () {
        if (a.dataset.pdxPre) return; a.dataset.pdxPre = '1';
        var l = document.createElement('link'); l.rel = 'prefetch'; l.href = href;
        document.head.appendChild(l);
      }, { passive: true });
      a.addEventListener('click', function (e) {
        if (REDUCED || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        play(href, { accent: accentOf(a), label: label(a), x: e.clientX, y: e.clientY });
      });
    });
  }

  /* ── RESET: evita lo "schermo bianco" al ritorno indietro ──────────────
     Quando si lascia la pagina il velo bianco + il flash restano al loro
     stato finale. Se il browser ripristina la pagina dalla bfcache (tasto
     Indietro / Avanti) il DOM torna esattamente com'era: overlay bianco a
     tutto schermo e running=true, quindi la pagina sembra bloccata.
     Qui azzeriamo tutto ad ogni pageshow / popstate. */
  function reset() {
    running = false;
    if (watchdog) { clearTimeout(watchdog); watchdog = null; }
    document.body.classList.remove('pdx-busy');
    if (root) {
      root.classList.remove('on');
      root.style.display = '';
    }
    var olds = document.querySelectorAll('.pdx-arrive');
    Array.prototype.forEach.call(olds, function (n) { n.remove(); });
  }

  window.addEventListener('pageshow', function (e) {
    reset();
    if (e.persisted) arrive();   // bfcache: lo script non riparte, rifacciamo l'entrata
  });
  window.addEventListener('popstate', reset);
  window.addEventListener('pagehide', function (e) {
    if (e.persisted) reset();    // ripulisci PRIMA che la pagina finisca in bfcache
  });

  function boot() { arrive(); wire(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.PDX = { play: play, reset: reset };
})();
