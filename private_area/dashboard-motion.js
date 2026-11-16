/* PAN.DOOR.A — dashboard · motion design (numeri che contano, indicatore delle schede, entrate a cascata) */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- indicatore che scorre sotto la scheda attiva ---------- */
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var ind = document.createElement('span'); ind.className = 'tab-ind'; tabs.insertBefore(ind, tabs.firstChild);
    var muovi = function () {
      var b = tabs.querySelector('button.on'); if (!b) return;
      ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px';
    };
    new MutationObserver(muovi).observe(tabs, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', muovi); setTimeout(muovi, 50); setTimeout(muovi, 600);
  }

  /* ---------- entrata a cascata: indice per ogni carta ---------- */
  function indicizza(root) {
    $$('.card, .kpi', root).forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 18)); });
  }
  function riparti(sec) { // fa ripartire l'animazione quando si apre la scheda
    if (!sec || RM) return;
    indicizza(sec);
    sec.classList.remove('on'); void sec.offsetWidth; sec.classList.add('on');
  }
  document.addEventListener('pd-tab', function (e) { riparti(document.getElementById('tab-' + e.detail)); setTimeout(function () { if (tabs) tabs.dispatchEvent(new Event('x')); }, 0); });
  indicizza(document);

  /* ---------- numeri che contano fino al valore ---------- */
  var NF = function (dec) { return new Intl.NumberFormat('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  function leggi(s) { // "1.234,5%" -> {n:1234.5, dec:1, pre:'', suf:'%'}
    var m = /^(\D*?)(-?[\d.]*\d(?:,\d+)?)(.*)$/.exec(s);
    if (!m) return null;
    var num = m[2], dec = (num.split(',')[1] || '').length;
    var n = parseFloat(num.replace(/\./g, '').replace(',', '.'));
    return isFinite(n) ? { n: n, dec: dec, pre: m[1], suf: m[3] } : null;
  }
  var ultimi = new WeakMap();
  function conta(el) {
    // l'ultimo nodo di testo con un numero (i KPI possono avere un'icona prima)
    var tn = null; for (var c = el.lastChild; c; c = c.previousSibling) if (c.nodeType === 3 && /\d/.test(c.data)) { tn = c; break; }
    if (!tn) return;
    var fine = leggi(tn.data.trim()); if (!fine) return;
    var da = ultimi.has(el) ? ultimi.get(el) : 0;
    ultimi.set(el, fine.n);
    if (RM || da === fine.n || Math.abs(fine.n) > 1e7) return;
    var t0 = performance.now(), dur = 900, f = NF(fine.dec), testoFinale = tn.data;
    (function passo(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      tn.data = k < 1 ? fine.pre + f.format(da + (fine.n - da) * e) + fine.suf : testoFinale;
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  }
  var SEL = '.kpi b, .mini-kpi b, #live-n, .pp-grid .kpi b';
  var chiave = function (el) { // stesso riquadro tra un aggiornamento e l'altro: ricorda il valore precedente
    var box = el.closest('[id]'); var idx = box ? $$(SEL, box).indexOf(el) : 0;
    return (box ? box.id : '') + ':' + idx;
  };
  var memoria = {};
  function anima(root) {
    $$(SEL, root).forEach(function (el) {
      var k = chiave(el); if (memoria[k] != null && !ultimi.has(el)) ultimi.set(el, memoria[k]);
      conta(el); if (ultimi.has(el)) memoria[k] = ultimi.get(el);
    });
    if (root.matches && root.matches(SEL)) { var k = chiave(root); if (memoria[k] != null && !ultimi.has(root)) ultimi.set(root, memoria[k]); conta(root); memoria[k] = ultimi.get(root); }
  }
  var coda = new Set(), pronto = null;
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      if (m.type !== 'childList' || !m.addedNodes.length) return;
      var t = m.target; if (t.nodeType !== 1) return;
      if (t.closest && t.closest('.leaflet-container')) return;
      coda.add(t);
    });
    if (!pronto) pronto = requestAnimationFrame(function () {
      pronto = null;
      coda.forEach(function (t) {
        if (t.matches(SEL) || t.querySelector(SEL)) anima(t);
        $$('.rank', t).concat(t.classList && t.classList.contains('rank') ? [t] : []).forEach(function (r) { $$('.rk', r).forEach(function (x, i) { x.style.setProperty('--k', Math.min(i, 20)); }); });
      });
      coda.clear();
    });
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- effetto luce che segue il mouse sulle carte ---------- */
  if (!RM && matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.kpi, .p-row');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.backgroundImage = 'radial-gradient(260px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(79,140,255,.13), transparent 60%), linear-gradient(180deg,rgba(28,40,66,.72),rgba(14,21,37,.72))';
    }, { passive: true });
    document.addEventListener('pointerout', function (e) { var c = e.target.closest && e.target.closest('.kpi, .p-row'); if (c && !c.contains(e.relatedTarget)) c.style.backgroundImage = ''; });
  }
})();
