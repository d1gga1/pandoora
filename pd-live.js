/* Pan.door.a — statistiche visite del sito (anonime, solo per uso interno).
   Conta pagine viste e visitatori di ritorno con un codice casuale salvato nel browser;
   nessun dato personale, nessun servizio di terzi. Per escludere il proprio browser: ?pdlive=no */
(function () {
  if (window.__pdLive) return; window.__pdLive = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }   // non contare le pagine dentro un iframe
  var URL_ = window.PD_LIVE_URL || 'https://api.pandooragroup.it/live/s.php';
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
  if (par('gclid') || par('gbraid') || par('wbraid')) utm.g = 1;
  if (par('fbclid')) utm.f = 1;
  invia('pv', { n: nuovaVisita ? 1 : 0, k: vn, r: nuovaVisita ? ref.slice(0, 400) : '', u: nuovaVisita ? utm : {}, w: screen.width || 0, l: navigator.language || '' });

  /* prodotti aperti nello shop (cambiano l'indirizzo senza ricaricare la pagina) */
  var ultimo = percorso();
  ['pushState', 'replaceState'].forEach(function (f) {
    var orig = history[f]; if (!orig) return;
    history[f] = function () { var r = orig.apply(this, arguments); var p = percorso(); if (p !== ultimo) { ultimo = p; tocca(); invia('pv', { k: vn }); } return r; };
  });

  /* "sono ancora qui": ogni 15 secondi, solo con la pagina in primo piano e se la persona non è inattiva da più di 10 minuti */
  var attivita = ora();
  ['pointerdown', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(function (ev) {
    addEventListener(ev, function () { attivita = ora(); }, { passive: true, capture: true });
  });
  setInterval(function () {
    if (document.visibilityState !== 'visible' || ora() - attivita > 10 * 60 * 1000) return;
    tocca(); invia('hb');
  }, 15000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') invia('bye');
    else if (ora() - sess.t > MAX_PAUSA) {   // tornati dopo una lunga pausa: è una nuova visita
      sess = { id: rid(), t: ora() }; vn += 1; set('pd_vn', String(vn)); tocca(); attivita = ora();
      invia('pv', { n: 1, k: vn, r: '', u: {}, w: screen.width || 0, l: navigator.language || '' });
    } else { attivita = ora(); tocca(); invia('hb'); }
  });
  addEventListener('pagehide', function () { invia('bye'); });
})();
