/* Pan.door.a — statistiche visite del sito (anonime, solo per uso interno).
   Conta pagine viste e visitatori di ritorno con un codice casuale salvato nel browser.
   La posizione precisa viene letta solo se il visitatore la concede (avviso + richiesta del browser). Per escludere il proprio browser: ?pdlive=no */
(function () {
  if (window.__pdLive) return; window.__pdLive = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }   // non contare le pagine dentro un iframe
  var URL_ = window.PD_LIVE_URL || 'https://nvfbnwioyqifmftrpnbx.supabase.co/functions/v1/pd/s';
  var LS = null; try { LS = window.localStorage; LS.setItem('pd_t', '1'); LS.removeItem('pd_t'); } catch (e) { LS = null; }
  var get = function (k) { try { return LS ? LS.getItem(k) : null; } catch (e) { return null; } };
  var set = function (k, v) { try { if (LS) LS.setItem(k, v); } catch (e) {} };
  var del = function (k) { try { if (LS) LS.removeItem(k); } catch (e) {} };

  var q = location.search;
  if (/[?&]pdlive=no\b/.test(q)) set('pd_live_off', '1');
  if (/[?&]pdlive=si\b/.test(q)) del('pd_live_off');
  if (get('pd_live_off') || navigator.webdriver) return;
  if (!window.PD_LIVE_URL && !/(^|\.)pandooragroup\.it$/.test(location.hostname)) return;

  var rid = function () {
    var a = new Uint8Array(12);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  };
  var ora = function () { return Date.now(); };
  var MAX_PAUSA = 30 * 60 * 1000;   // dopo 30 minuti di inattività inizia una nuova visita

  var vid = get('pd_v'); if (!vid || !/^[a-z0-9]{12,40}$/.test(vid)) { vid = rid(); set('pd_v', vid); }
  var vn = parseInt(get('pd_vn') || '0', 10) || 0;
  window.pdVisitatore = function () { return vid; };
  var sess = null; try { sess = JSON.parse(get('pd_s') || 'null'); } catch (e) {}
  var nuovaVisita = !sess || !sess.id || ora() - (sess.t || 0) > MAX_PAUSA;
  if (nuovaVisita) { sess = { id: rid(), t: ora() }; vn += 1; set('pd_vn', String(vn)); }
  var tocca = function () { sess.t = ora(); set('pd_s', JSON.stringify(sess)); };
  tocca();

  var percorso = function () {
    var p = location.pathname || '/';
    var m = /[?&]p=([^&#]{1,80})/.exec(location.search);   // prodotto aperto nello shop
    return m ? p + '?p=' + m[1] : p;
  };
  var invia = function (e, extra) {
    var d = { e: e, v: vid, s: sess.id, p: percorso(), t: (document.title || '').slice(0, 200) };
    if (extra) for (var k in extra) d[k] = extra[k];
    var body = JSON.stringify(d);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([body], { type: 'text/plain' }))) return;
    } catch (x) {}
    try { fetch(URL_, { method: 'POST', body: body, mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' } }); } catch (x) {}
  };

  /* pagina vista */
  var ref = document.referrer || '';
  try { if (ref && new URL(ref).hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) ref = ''; } catch (e) {}
  var utm = {};
  var par = function (k) { var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).slice(0, 80) : ''; };
  if (par('utm_source')) utm.s = par('utm_source');
  if (par('utm_medium')) utm.m = par('utm_medium');
  if (par('utm_campaign')) utm.c = par('utm_campaign');
  if (par('utm_term')) utm.t = par('utm_term');
  if (par('gclid') || par('gbraid') || par('wbraid')) utm.g = 1;
  if (par('fbclid')) utm.f = 1;
  var dati = function () { // dispositivo e browser (nessun dato personale)
    var d = { w: screen.width || 0, l: navigator.language || '' };
    try { d.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    d.sch = (screen.width || 0) + 'x' + (screen.height || 0);
    d.fin = (innerWidth || 0) + 'x' + (innerHeight || 0);
    d.dpr = Math.round((devicePixelRatio || 1) * 100) / 100;
    d.tc = (navigator.maxTouchPoints || 0) > 0 ? 1 : 0;
    var c = navigator.connection; if (c && c.effectiveType) d.cn = c.effectiveType;
    if (navigator.deviceMemory) d.mem = navigator.deviceMemory;
    if (navigator.hardwareConcurrency) d.cpu = navigator.hardwareConcurrency;
    try { d.dk = matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0; } catch (e) {}
    d.ls = (navigator.languages || []).slice(0, 4).join(',');
    return d;
  };
  var primo = { n: nuovaVisita ? 1 : 0, k: vn, r: nuovaVisita ? ref.slice(0, 400) : '', u: nuovaVisita ? utm : {} };
  var dd = dati(); for (var x in dd) primo[x] = dd[x];
  var partito = false, parti = function () { if (partito) return; partito = true; invia('pv', primo); };
  try {
    var uad = navigator.userAgentData;
    if (uad && uad.getHighEntropyValues) {
      uad.getHighEntropyValues(['model', 'platformVersion']).then(function (h) { if (h.model) primo.mo = h.model; if (h.platformVersion) primo.ov = h.platformVersion; parti(); }, parti);
      setTimeout(parti, 400);
    } else {
      var mi = /iPhone|iPad|iPod/.exec(navigator.userAgent); if (mi) primo.mo = mi[0];
      var vi = /OS (\d+)[_.](\d+)/.exec(navigator.userAgent) || /Mac OS X (\d+)[_.](\d+)/.exec(navigator.userAgent); if (vi) primo.ov = vi[1] + '.' + vi[2];
      parti();
    }
  } catch (e) { parti(); }

  /* quanto della pagina è stato letto (scroll massimo in %) */
  var scrollMax = 0;
  var misuraScroll = function () {
    var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0) - innerHeight;
    var p = h > 0 ? Math.round(Math.min(1, (scrollY || pageYOffset || 0) / h) * 100) : 100;
    if (p > scrollMax) scrollMax = p;
  };
  addEventListener('scroll', function () { misuraScroll(); }, { passive: true });
  setTimeout(misuraScroll, 1500);

  /* azioni: clic su WhatsApp, telefono, email (e altri eventi mandati dal sito con window.pdEvento) */
  window.pdEvento = function (tipo, dettaglio) { try { tocca(); invia('ev', { k: String(tipo), x: String(dettaglio || '').slice(0, 200) }); } catch (e) {} };
  var tipoLink = function (href) {
    if (/^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(href) || /^whatsapp:/i.test(href)) return 'whatsapp';
    if (/^tel:/i.test(href)) return 'telefono';
    if (/^mailto:/i.test(href)) return 'email';
    if (/\.pdf(\?|#|$)/i.test(href)) return 'download';
    if (/(^|\/)(preventivo|carica-progetto|contattaci|contatti)(\/|\.html|$|\?|#)/i.test(href)) return 'preventivo';
    try { var u = new URL(href, location.href); if (/^https?:$/.test(u.protocol) && u.hostname.replace(/^www\./, '') !== location.hostname.replace(/^www\./, '')) return 'esterno'; } catch (e) {}
    return '';
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '', tipo = tipoLink(href);
    if (!tipo) return;
    var testo = (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim();
    if (!testo && a.className) testo = String(a.className);
    if (tipo === 'esterno') testo = (testo ? testo.slice(0, 60) + ' · ' : '') + href.replace(/^https?:\/\//, '').slice(0, 80);
    window.pdEvento(tipo, (testo || href).slice(0, 120) + (tipo === 'download' ? ' · ' + href.split('/').pop() : ''));
  }, true);

  /* ricerche fatte nel sito (barra di ricerca dello shop) */
  var ultimaRicerca = '', tRic = null;
  var registraRicerca = function (el) {
    var v = String(el.value || '').trim().replace(/\s+/g, ' ');
    if (v.length < 2 || v.toLowerCase() === ultimaRicerca) return;
    ultimaRicerca = v.toLowerCase(); window.pdEvento('ricerca', v.slice(0, 80));
  };
  var eRicerca = function (el) { return el && el.tagName === 'INPUT' && (el.type === 'search' || el.name === 'q' || /cerca/i.test(el.placeholder || '')); };
  document.addEventListener('input', function (e) { if (!eRicerca(e.target)) return; clearTimeout(tRic); var el = e.target; tRic = setTimeout(function () { registraRicerca(el); }, 1800); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && eRicerca(e.target)) { clearTimeout(tRic); registraRicerca(e.target); } }, true);

  /* chi copia il vostro numero o la vostra email */
  document.addEventListener('copy', function () {
    try {
      var s = String(getSelection() || '').trim();
      if (s && s.length < 120 && (/(\+?\d[\d\s.\-]{7,}\d)/.test(s) || /@/.test(s))) window.pdEvento('copia', s.slice(0, 80));
    } catch (e) {}
  }, true);
  if (window.open) { // WhatsApp aperto dal codice (es. "invia l'ordine su WhatsApp")
    var apri = window.open;
    window.open = function (u) { try { if (u && tipoLink(String(u)) === 'whatsapp') window.pdEvento('whatsapp', 'apertura da pulsante'); } catch (e) {} return apri.apply(window, arguments); };
  }

  /* prodotti aperti nello shop (cambiano l'indirizzo senza ricaricare la pagina) */
  var ultimo = percorso();
  ['pushState', 'replaceState'].forEach(function (f) {
    var orig = history[f]; if (!orig) return;
    history[f] = function () { var r = orig.apply(this, arguments); var p = percorso(); if (p !== ultimo) { ultimo = p; scrollMax = 0; tocca(); invia('pv', { k: vn }); setTimeout(misuraScroll, 1500); } return r; };
  });

  /* "sono ancora qui": ogni 15 secondi, solo con la pagina in primo piano e se la persona non è inattiva da più di 10 minuti */
  var attivita = ora();
  ['pointerdown', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(function (ev) {
    addEventListener(ev, function () { attivita = ora(); }, { passive: true, capture: true });
  });
  setInterval(function () {
    if (document.visibilityState !== 'visible' || ora() - attivita > 10 * 60 * 1000) return;
    misuraScroll(); tocca(); invia('hb', { sc: scrollMax });
  }, 15000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { misuraScroll(); invia('bye', { sc: scrollMax }); }
    else if (ora() - sess.t > MAX_PAUSA) {   // tornati dopo una lunga pausa: è una nuova visita
      sess = { id: rid(), t: ora() }; vn += 1; set('pd_vn', String(vn)); tocca(); attivita = ora();
      invia('pv', { n: 1, k: vn, r: '', u: {}, w: screen.width || 0, l: navigator.language || '' });
    } else { attivita = ora(); tocca(); invia('hb'); }
  });
  addEventListener('pagehide', function () { misuraScroll(); invia('bye', { sc: scrollMax }); });
  /* posizione precisa (GPS / Wi-Fi del dispositivo), SOLO con il consenso del visitatore:
     1) un piccolo avviso chiede se vuole condividerla; se accetta, il browser mostra la sua richiesta ufficiale;
     2) nei moduli con CAP/Città c'è il pulsante "Usa la mia posizione" che compila i campi. */
  var GL = navigator.geolocation;
  var LG = String(document.documentElement.lang || 'it').slice(0, 2).toLowerCase();
  var TX = {
    it: ['Ci dite da dove ci visitate?', 'Condividete la vostra posizione: la usiamo solo internamente per capire da quali zone arrivano i clienti e organizzare consegne e agenti. Non la cediamo a nessuno.', 'Condividi posizione', 'No, grazie', 'Usa la mia posizione', 'Cerco la posizione…', 'Posizione non disponibile', 'Informativa'],
    en: ['Where are you visiting from?', 'Share your location: we only use it internally to see which areas our customers come from and plan deliveries and agents. We never pass it on.', 'Share location', 'No, thanks', 'Use my location', 'Locating…', 'Location unavailable', 'Privacy'],
    de: ['Woher besuchen Sie uns?', 'Teilen Sie Ihren Standort: Wir nutzen ihn nur intern, um zu sehen, aus welchen Regionen unsere Kunden kommen, und Lieferungen zu planen. Keine Weitergabe an Dritte.', 'Standort teilen', 'Nein, danke', 'Meinen Standort verwenden', 'Standort wird ermittelt…', 'Standort nicht verfügbar', 'Datenschutz'],
    fr: ['D\'où nous rendez-vous visite ?', 'Partagez votre position : nous l\'utilisons uniquement en interne pour savoir de quelles zones viennent nos clients et organiser les livraisons. Jamais transmise à des tiers.', 'Partager la position', 'Non merci', 'Utiliser ma position', 'Localisation…', 'Position indisponible', 'Confidentialité'],
    es: ['¿Desde dónde nos visita?', 'Comparta su ubicación: solo la usamos internamente para saber de qué zonas vienen nuestros clientes y organizar entregas. Nunca la cedemos a terceros.', 'Compartir ubicación', 'No, gracias', 'Usar mi ubicación', 'Buscando ubicación…', 'Ubicación no disponible', 'Privacidad']
  };
  var T = TX[LG] || TX.en;
  var GIORNO = 86400000;
  var mandaPos = function (p, modo) {
    var c = p.coords; tocca();
    invia('pos', { la: Math.round(c.latitude * 1e5) / 1e5, lo: Math.round(c.longitude * 1e5) / 1e5, ac: Math.round(c.accuracy || 0), m: modo });
    set('pd_gps_ok', String(ora())); del('pd_gps_no');
  };
  var chiediPos = function (modo, ok, ko) {
    if (!GL) { if (ko) ko(); return; }
    GL.getCurrentPosition(function (p) { mandaPos(p, modo); if (ok) ok(p); },
      function (err) { if (err && err.code === 1) set('pd_gps_no', String(ora())); if (ko) ko(err); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5 * 60000 });
  };
  var avviso = function () {
    if (document.getElementById('pd-gps')) return;
    var d = document.createElement('div'); d.id = 'pd-gps'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', T[0]);
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:380px;z-index:2147483000;background:#fff;color:#1a1a1a;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.25);padding:16px 18px;font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    d.innerHTML = '<div style="font-weight:600;font-size:15px;margin-bottom:4px">📍 ' + T[0] + '</div><div style="color:#555;margin-bottom:12px">' + T[1] + ' <a href="/privacy/" style="color:#555">' + T[7] + '</a></div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" data-si style="flex:1;min-width:140px;border:0;border-radius:9px;padding:10px 12px;background:#1a1a1a;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer">' + T[2] + '</button>'
      + '<button type="button" data-no style="border:1px solid #ccc;border-radius:9px;padding:10px 12px;background:#fff;color:#333;font:14px system-ui,sans-serif;cursor:pointer">' + T[3] + '</button></div>';
    var chiudi = function () { if (d.parentNode) d.parentNode.removeChild(d); };
    d.querySelector('[data-si]').onclick = function () { chiudi(); set('pd_gps_chiesto', String(ora())); chiediPos('avviso'); };
    d.querySelector('[data-no]').onclick = function () { chiudi(); set('pd_gps_chiesto', String(ora())); };
    document.body.appendChild(d);
  };
  var avvioGps = function () {
    if (!GL || !window.isSecureContext) return;
    var no = +get('pd_gps_no') || 0, chiesto = +get('pd_gps_chiesto') || 0;
    var procedi = function (stato) {
      if (stato === 'denied') return;
      if (stato === 'granted') { if (nuovaVisita) chiediPos('auto'); return; }   // già concesso: aggiorna in silenzio, una volta per visita
      if (ora() - no < 60 * GIORNO || ora() - chiesto < 30 * GIORNO) return;      // non insistere
      var mostrato = false, mostra = function () { if (mostrato) return; mostrato = true; avviso(); };
      setTimeout(function () {   // dopo qualche secondo e solo dopo che la persona ha interagito (scroll, tocco, clic)
        if (ora() - attivita < 6000) mostra();
        else ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, mostra, { once: true, passive: true }); });
      }, 5000);
    };
    try { navigator.permissions.query({ name: 'geolocation' }).then(function (r) { procedi(r.state); }, function () { procedi(''); }); }
    catch (e) { procedi(''); }
  };
  if (document.body) avvioGps(); else document.addEventListener('DOMContentLoaded', avvioGps);

  /* pulsante "Usa la mia posizione" accanto ai campi CAP / Città dei moduli */
  var campoDi = function (f, re, ac) {
    var els = f.querySelectorAll('input'); for (var i = 0; i < els.length; i++) { var e = els[i];
      if ((ac && (e.getAttribute('autocomplete') || '').indexOf(ac) >= 0) || re.test(e.name || '') || re.test(e.id || '')) return e; }
    return null;
  };
  var riempi = function (el, v) { if (el && v && !String(el.value || '').trim()) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } };
  var aggiungiPulsanti = function () {
    if (!GL || !window.isSecureContext) return;
    var forms = document.querySelectorAll('form'); for (var i = 0; i < forms.length; i++) (function (f) {
      if (f.getAttribute('data-pd-gps')) return;
      var citta = campoDi(f, /(^|_)(citt[aà]|city|town)$/i, 'address-level2'), cap = campoDi(f, /(^|_)(cap|zip|postal)/i, 'postal-code');
      var ancora = cap; if (!ancora || !citta) return;   // solo moduli di indirizzo (CAP + Città)
      f.setAttribute('data-pd-gps', '1');
      var b = document.createElement('button'); b.type = 'button'; b.textContent = '📍 ' + T[4];
      b.style.cssText = 'display:inline-block;margin:6px 0 2px;padding:6px 10px;border:1px solid currentColor;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:13px;cursor:pointer;opacity:.85';
      b.onclick = function () {
        b.disabled = true; b.textContent = T[5];
        chiediPos('modulo', function (p) {
          var c = p.coords;
          fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=' + c.latitude + '&lon=' + c.longitude + '&accept-language=' + LG)
            .then(function (r) { return r.json(); }).then(function (j) {
              var a = (j && j.address) || {};
              riempi(campoDi(f, /(^|_)(cap|zip|postal)/i, 'postal-code'), a.postcode);
              riempi(campoDi(f, /(^|_)(citt[aà]|city|town)$/i, 'address-level2'), a.city || a.town || a.village || a.municipality);
              var pr = campoDi(f, /(^|_)(provincia|province|county)$/i, 'address-level1'); riempi(pr, a['ISO3166-2-lvl6'] ? a['ISO3166-2-lvl6'].split('-').pop() : (a.county || ''));
              riempi(campoDi(f, /(^|_)(via|indirizzo|street|address)$/i, 'street-address'), [a.road, a.house_number].filter(Boolean).join(' '));
              b.textContent = '📍 ✓'; b.disabled = false;
            }).catch(function () { b.textContent = '📍 ' + T[4]; b.disabled = false; });
        }, function () { b.textContent = T[6]; setTimeout(function () { b.textContent = '📍 ' + T[4]; b.disabled = false; }, 2500); });
      };
      ancora.parentNode.insertBefore(b, ancora.nextSibling);
    })(forms[i]);
  };
  var tPuls = null, programma = function () { clearTimeout(tPuls); tPuls = setTimeout(aggiungiPulsanti, 300); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', programma); else programma();
  try { new MutationObserver(programma).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
})();
