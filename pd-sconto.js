/* Pan.door.a \u2014 popup "\u22125% con la newsletter" sulle pagine del sito (fuori dallo shop).
   Compare una volta a ogni visita, finch\u00e9 il visitatore non si iscrive.
   Percentuale, codice e giorni di validit\u00e0 si leggono da /shop/data/products.json (offers.newsletter):
   cambiandoli l\u00ec cambiano sia qui sia nello shop. L'iscritto finisce nella dashboard (origine "popup-sito"). */
(function () {
  if (window.__pdSconto) return; window.__pdSconto = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }
  if (/^\/(shop|private_area)(\/|$)/.test(location.pathname)) return;
  var LS = window.localStorage, SS = window.sessionStorage;
  function get(k) { try { return JSON.parse(LS.getItem(k) || 'null'); } catch (e) { return null; } }
  function put(k, v) { try { LS.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function registrato() { try { return !!(get('pdNl') || LS.getItem('pdAccT') || SS.getItem('pdAccT') || LS.getItem('pdHaAcc')); } catch (e) { return !!get('pdNl'); } }
  if (registrato()) return;                                  // gi\u00e0 iscritto o con account: il numero l'abbiamo, basta popup
  try { if (SS.getItem('pdNlSite')) return; } catch (e) {}   // gi\u00e0 mostrato in questa visita

  var N = { perc: 5, code: 'BENVENUTO5', validDays: 7, notify: 'shop@pandooragroup.it', endpoint: '' };
  var DB = 'https://nvfbnwioyqifmftrpnbx.supabase.co/functions/v1/pd/clienti';
  var GEO = null, BOX = null, fired = false;
  /* quante volte \u00e8 entrato (lo conta pd-live.js, \u00e8 lo stesso numero "2\u00aa visita", "19\u00aa visita" della dashboard) */
  function visite() { try { return parseInt(LS.getItem('pd_vn') || '0', 10) || 0; } catch (e) { return 0; } }
  function testi() {
    var n = visite();
    if (n < 2) return { k: 'Benvenuti', h: 'Il ' + N.perc + '% di sconto sul vostro ordine', s: 'Lasciateci i vostri dati: vi mandiamo subito il codice sconto, valido su tutto lo shop Pandoora.' };
    return { k: 'Bentornati', h: '\u00c8 la ' + n + '\u00aa volta che passate a trovarci!', s: n >= 10
      ? 'Ormai siete di casa. Registratevi in 20 secondi: vi regaliamo il ' + N.perc + '% sul vostro ordine e, se avete dubbi su misure o prezzi, vi richiamiamo noi.'
      : 'Ci fa piacere rivedervi. Registratevi: vi mandiamo subito il codice del ' + N.perc + '% e, se avete dubbi su misure o prezzi, vi richiamiamo noi.' };
  }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  var CSS = '.pdsc{position:fixed;inset:0;z-index:2147483000;display:none;font-family:inherit;color-scheme:light}.pdsc.open{display:block}'
    + '.pdsc,.pdsc *,.pdsc-pill,.pdsc-pill *{cursor:auto!important}.pdsc button,.pdsc a,.pdsc label,.pdsc select,.pdsc-pill{cursor:pointer!important}.pdsc input:not([type=checkbox]){cursor:text!important}'
    + '.pdsc-scrim{position:absolute;inset:0;background:rgba(13,21,36,.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;transition:opacity .4s}.pdsc.show .pdsc-scrim{opacity:1}'
    + '.pdsc-box{position:absolute;left:50%;top:50%;width:min(900px,calc(100% - 28px));max-height:calc(100% - 28px);overflow:auto;background:#fff;color:#0d1524;border-radius:22px;display:grid;grid-template-columns:1fr 1.15fr;box-shadow:0 30px 80px rgba(0,0,0,.35);opacity:0;transform:translate(-50%,-46%);transition:opacity .4s,transform .4s}'
    + '.pdsc.show .pdsc-box{opacity:1;transform:translate(-50%,-50%)}'
    + '.pdsc-x{position:absolute;top:12px;right:12px;z-index:2;width:38px;height:38px;border-radius:50%;border:0;background:#f1efe9;color:#0d1524;font:400 24px/1 sans-serif;cursor:pointer}'
    + '.pdsc-vis{position:relative;isolation:isolate;background:#0d1524 url(/shop/img/hero-900.webp) center/cover;color:#fff;padding:34px 28px;display:flex;flex-direction:column;justify-content:space-between;gap:26px}'
    + '.pdsc-vis::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(160deg,rgba(13,21,36,.5),rgba(13,21,36,.9))}'
    + '.pdsc-vis small{display:block;font:800 12px/1 sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#d8b98a}'
    + '.pdsc-vis b.big{display:block;font:600 clamp(80px,10vw,120px)/.9 Georgia,serif;letter-spacing:-.04em;margin:10px 0 6px}.pdsc-vis b.big i{font-style:normal;font-size:.5em;vertical-align:.55em}'
    + '.pdsc-vis span{font:500 21px/1.2 Georgia,serif}.pdsc-vis ul{list-style:none;margin:0;padding:0;display:grid;gap:9px;font:700 14px sans-serif}.pdsc-vis li{display:flex;gap:9px;align-items:center}'
    + '.pdsc svg{width:18px;height:18px;stroke:#d8b98a;fill:none;stroke-width:2.6;flex:none}'
    + '.pdsc-f{padding:30px 28px 22px;display:flex;flex-direction:column;gap:11px;font-family:sans-serif}'
    + '.pdsc-f h2{font:600 clamp(25px,3vw,32px)/1.08 Georgia,serif;margin:0;padding-right:40px;color:#0d1524}.pdsc-sub{margin:0;color:#4a5262;line-height:1.5;font-size:14px}'
    + '.pdsc-g{display:grid;grid-template-columns:1fr 1fr;gap:9px}.pdsc-g label{display:grid;gap:4px;font:800 12px sans-serif;color:#4a5262}.pdsc-g .w{grid-column:1/-1}'
    + '.pdsc-g input,.pdsc-g select{width:100%;box-sizing:border-box;border:1.5px solid #dcd8cf;border-radius:11px;padding:11px 12px;font:600 15px sans-serif;color:#0d1524;background:#fff}'
    + '.pdsc-g input:focus,.pdsc-g select:focus{outline:0;border-color:#0d1524}.pdsc .err{border-color:#c8352b!important}'
    + '.pdsc-tel{display:flex;border:1.5px solid #dcd8cf;border-radius:11px;overflow:hidden}.pdsc-tel b{display:flex;align-items:center;padding:0 11px;background:#f4f2ec;font:800 14px sans-serif}.pdsc-tel input{border:0!important;border-radius:0!important}'
    + '.pdsc-ok{display:flex;gap:9px;align-items:flex-start;font-size:12px;line-height:1.5;color:#4a5262;cursor:pointer}.pdsc-ok input{width:18px;height:18px;margin:1px 0 0;flex:none;accent-color:#c8352b}.pdsc-ok input.err{outline:2px solid #c8352b}.pdsc-ok a{color:#0d1524}'
    + '.pdsc-e{margin:0;color:#c8352b;font-size:13.5px;font-weight:700}.pdsc-e:empty{display:none}'
    + '.pdsc-b{width:100%;border:0;border-radius:100px;padding:15px 20px;background:#c8352b;color:#fff;font:800 15.5px sans-serif;cursor:pointer}.pdsc-b:disabled{opacity:.6}'
    + '.pdsc-no{border:0;background:none;color:#8a8f99;font:700 13px sans-serif;cursor:pointer;padding:4px;align-self:center;text-decoration:underline}'
    + '.pdsc-code{display:flex;gap:10px;align-items:center;border:2px dashed #c8352b;border-radius:14px;padding:12px 14px;justify-content:space-between}.pdsc-code b{font:800 22px monospace;letter-spacing:.06em}'
    + '.pdsc-code button{border:1.5px solid #0d1524;background:#fff;border-radius:100px;padding:8px 14px;font:800 13px sans-serif;cursor:pointer}'
    + '.pdsc-pill{position:fixed;left:16px;bottom:16px;z-index:2147482000;display:flex;align-items:center;gap:8px;border:0;border-radius:100px;padding:8px 16px 8px 8px;background:#0d1524;color:#fff;font:700 13px sans-serif;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.25)}'
    + '.pdsc-pill b{background:#c8352b;border-radius:100px;padding:6px 10px}'
    + '@media(max-width:720px){.pdsc-box{grid-template-columns:1fr;top:auto;bottom:0;left:0;width:100%;max-height:92%;border-radius:22px 22px 0 0;transform:translateY(30px)}.pdsc.show .pdsc-box{transform:none}'
    + '.pdsc-vis{padding:22px 20px;gap:10px}.pdsc-vis ul{display:none}.pdsc-vis b.big{font-size:64px}.pdsc-f{padding:20px 18px 18px}}';

  function geo() { return GEO ? Promise.resolve(GEO) : fetch('/shop/data/geo.json').then(function (r) { return r.json(); }).then(function (g) { GEO = g.countries; return GEO; }); }

  function build() {
    if (BOX) return BOX;
    var TX = testi();
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    BOX = document.createElement('div'); BOX.className = 'pdsc'; BOX.setAttribute('role', 'dialog'); BOX.setAttribute('aria-modal', 'true'); BOX.setAttribute('aria-labelledby', 'pdsc-t');
    BOX.innerHTML = '<div class="pdsc-scrim" data-x></div><div class="pdsc-box"><button type="button" class="pdsc-x" data-x aria-label="Chiudi">\u00d7</button>'
      + '<div class="pdsc-vis"><div><small>' + TX.k + '</small><b class="big">\u2212' + N.perc + '<i>%</i></b><span>su porte, mobili<br>e armadi</span></div><ul><li>' + CHECK + 'Codice subito via email</li><li>' + CHECK + 'Valido ' + N.validDays + ' giorni su ogni ordine</li><li>' + CHECK + 'Vi richiamiamo noi se avete dubbi</li></ul></div>'
      + '<form class="pdsc-f" novalidate><h2 id="pdsc-t">' + esc(TX.h) + '</h2><p class="pdsc-sub">' + esc(TX.s) + '</p>'
      + '<div class="pdsc-g"><label>Nome<input name="Nome" autocomplete="given-name" required></label><label>Cognome<input name="Cognome" autocomplete="family-name" required></label>'
      + '<label class="w">Telefono<span class="pdsc-tel"><b id="pdsc-pre">+39</b><input name="Telefono" type="tel" autocomplete="tel-national" inputmode="tel" required></span></label>'
      + '<label class="w">Email<input name="email" type="email" autocomplete="email" required></label>'
      + '<label>Stato<select name="Stato" required><option value="">Caricamento\u2026</option></select></label>'
      + '<label><span id="pdsc-pl">Provincia</span><select name="Provincia" id="pdsc-psel" required><option value="">Scegliete\u2026</option></select><input name="ProvinciaTxt" id="pdsc-ptxt" autocomplete="address-level1" placeholder="Provincia o regione" hidden></label></div>'
      + '<label class="pdsc-ok"><input type="checkbox" name="Consenso" required><span>Acconsento a ricevere la newsletter e offerte di Pan.door.a S.r.l. e a essere ricontattato, e ho letto l\'<a href="/privacy/" target="_blank">informativa privacy</a>. Potete disiscrivervi quando volete.</span></label>'
      + '<input name="sito_web" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">'
      + '<p class="pdsc-e" role="alert"></p><button type="submit" class="pdsc-b">Ricevi il mio codice \u2212' + N.perc + '%</button><button type="button" class="pdsc-no" data-x>No, grazie</button></form></div>';
    document.body.appendChild(BOX);
    BOX.querySelectorAll('[data-x]').forEach(function (x) { x.onclick = close; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && BOX.classList.contains('show')) close(); });
    var f = BOX.querySelector('form'), sel = f.querySelector('[name="Stato"]');
    sel.onchange = function () {
      if (!GEO) return; var c = GEO.find(function (x) { return x.c === sel.value; }), ps = f.querySelector('#pdsc-psel'), pt = f.querySelector('#pdsc-ptxt'), it = !!(c && c.sel);
      f.querySelector('#pdsc-pre').textContent = c && c.p ? c.p : '+'; ps.hidden = !it; ps.required = it; pt.hidden = it; pt.required = !it; pt.value = '';
      f.querySelector('#pdsc-pl').textContent = it ? 'Provincia' : 'Provincia / regione';
      ps.innerHTML = '<option value="">Scegliete\u2026</option>' + (it ? c.prov.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') : '');
    };
    geo().then(function (G) {
      sel.innerHTML = '<option value="">Scegliete\u2026</option>' + G.map(function (c) { return '<option value="' + esc(c.c) + '">' + esc(c.n) + '</option>'; }).join('');
      sel.value = 'IT'; sel.onchange();
    }).catch(function () { sel.innerHTML = '<option value="IT">Italia</option>'; });
    f.onsubmit = function (e) {
      e.preventDefault(); var er = f.querySelector('.pdsc-e'), bad = null;
      f.querySelectorAll('input,select').forEach(function (i) {
        i.classList.remove('err'); if (i.hidden || i.name === 'sito_web') return;
        var v = i.value.trim(), ok = i.type === 'checkbox' ? i.checked : v && (i.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) && (i.type !== 'tel' || v.replace(/\D/g, '').length >= 6);
        if (!ok) { i.classList.add('err'); bad = bad || i; }
      });
      if (bad) { er.textContent = bad.type === 'checkbox' ? 'Serve il consenso per ricevere il codice.' : bad.type === 'email' ? 'Controllate l\'indirizzo email.' : bad.type === 'tel' ? 'Controllate il numero di telefono.' : 'Compilate tutti i campi.'; bad.focus(); return; }
      er.textContent = ''; send(f);
    };
    return BOX;
  }

  function send(f) {
    var g = function (n) { return (f.querySelector('[name="' + n + '"]') || {}).value.trim(); };
    var sel = g('Stato'), st = GEO && GEO.find(function (c) { return c.c === sel; }), nome = g('Nome');
    var tel = (f.querySelector('#pdsc-pre').textContent + ' ' + g('Telefono')).trim();
    var prov = f.querySelector('#pdsc-psel').hidden ? g('ProvinciaTxt') : g('Provincia'), stato = st ? st.n : sel, pagina = location.href.split('?')[0], hp = g('sito_web');
    var b = f.querySelector('.pdsc-b'); b.disabled = true; b.textContent = 'Un attimo\u2026';
    put('pdNl', { nome: nome, email: g('email'), d: new Date().toISOString().slice(0, 10), t: Date.now() }); put('pdCode', N.code);
    var db = Promise.race([new Promise(function (ok) { setTimeout(ok, 4000); }), fetch(DB, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-PD': '1' },
      body: JSON.stringify({ a: 'newsletter', origine: 'popup-sito', pdv: window.pdVisitatore ? window.pdVisitatore() : '', nome: nome, cognome: g('Cognome'), email: g('email'), telefono: tel, stato: stato, provincia: prov, pagina: pagina, consenso: 1, sito_web: hp }) }).catch(function () {})]);
    function fallback() {   // se lo script Aruba non risponde: FormSubmit (mail col codice + avviso a voi), come nello shop
      var data = { _subject: 'Nuova iscrizione newsletter (sito): ' + nome + ' ' + g('Cognome') + ' (' + stato + ')', _template: 'table', _next: location.origin + '/shop/grazie-iscrizione/?da=/shop/',
        _autoresponse: 'Gentile ' + nome + ', grazie per esservi iscritti alla newsletter di Pandoora.\n\nEcco il vostro codice sconto: ' + N.code + '\n' + N.perc + '% di sconto su ogni prodotto dello shop: https://pandooragroup.it/shop/\nIl codice vale ' + N.validDays + ' giorni da oggi.\n\nPAN.DOOR.A GROUP \u00b7 Via I Maggio 14, 31043 Fontanelle (TV) \u00b7 shop@pandooragroup.it \u00b7 +39 388 470 6887',
        Nome: nome, Cognome: g('Cognome'), email: g('email'), Telefono: tel, Stato: stato, Provincia: prov, Consenso: 'S\u00ec, ' + new Date().toLocaleString('it-IT'), Pagina: pagina, Codice: N.code };
      var fm = document.createElement('form'); fm.method = 'POST'; fm.action = 'https://formsubmit.co/' + N.notify; fm.style.display = 'none';
      Object.keys(data).forEach(function (k) { var i = document.createElement(k === '_autoresponse' ? 'textarea' : 'input'); i.name = k; i.value = data[k]; fm.appendChild(i); });
      document.body.appendChild(fm); db.then(function () { fm.submit(); });
    }
    if (!N.endpoint) return fallback();
    Promise.race([new Promise(function (_, ko) { setTimeout(function () { ko(new Error('timeout')); }, 9000); }),
      fetch(N.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome, cognome: g('Cognome'), email: g('email'), telefono: tel, stato: stato, provincia: prov, pagina: pagina, consenso: true, sito_web: hp }) })])
      .then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.ok) throw new Error('errore'); return db.then(function () { done(f, nome); }); })
      .catch(fallback);
  }

  function done(f, nome) {
    window.pdEvento && window.pdEvento('iscrizione', 'newsletter dal popup del sito');
    var fino = new Date(Date.now() + N.validDays * 864e5).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
    f.innerHTML = '<h2 id="pdsc-t">Grazie ' + esc(nome) + '! Ecco il vostro ' + N.perc + '%</h2><div class="pdsc-code"><b>' + esc(N.code) + '</b><button type="button" id="pdsc-copy">Copia</button></div>'
      + '<p class="pdsc-sub">Il codice \u00e8 gi\u00e0 attivo nel carrello dello shop e ve lo abbiamo mandato anche via email (se non la trovate, guardate nello spam). <b>Vale fino al ' + fino + '.</b></p>'
      + '<a class="pdsc-b" href="/shop/" style="text-align:center;text-decoration:none">Vai allo shop</a><button type="button" class="pdsc-no" data-x>Continua a guardare il sito</button>';
    f.querySelector('#pdsc-copy').onclick = function () { try { navigator.clipboard.writeText(N.code); this.textContent = 'Copiato'; } catch (e) {} };
    f.querySelectorAll('[data-x]').forEach(function (x) { x.onclick = close; });
    var p = document.querySelector('.pdsc-pill'); if (p) p.remove();
  }

  function open() {
    var m = build(); m.classList.add('open'); document.documentElement.style.overflow = 'hidden'; document.documentElement.classList.add('pdsc-on');
    requestAnimationFrame(function () { m.classList.add('show'); });
    var p = document.querySelector('.pdsc-pill'); if (p) p.style.display = 'none';
  }
  function close() {
    if (!BOX) return; BOX.classList.remove('show'); document.documentElement.style.overflow = ''; document.documentElement.classList.remove('pdsc-on');
    setTimeout(function () { BOX.classList.remove('open'); }, 400); pill();
  }
  function pill() {
    if (registrato()) return; var p = document.querySelector('.pdsc-pill');
    if (!p) { p = document.createElement('button'); p.type = 'button'; p.className = 'pdsc-pill'; p.innerHTML = '<b>\u2212' + N.perc + '%</b><span>con la newsletter</span>'; p.onclick = open; document.body.appendChild(p); }
    p.style.display = '';
  }

  function fire() {
    if (fired || registrato()) return;
    if (document.querySelector('[aria-label="Cookie"]')) { setTimeout(fire, 4000); return; }   // prima la scelta sui cookie, poi il popup
    fired = true;
    try { SS.setItem('pdNlSite', '1'); } catch (e) {}
    fetch('/shop/data/products.json').then(function (r) { return r.json(); }).then(function (P) {
      var c = P && ((P.pricing && P.pricing.offers) || P.offers || {}).newsletter; if (c) { for (var k in c) if (c[k] !== '' && c[k] != null) N[k] = c[k]; }
    }).catch(function () {}).then(function () { if (N.perc) open(); });
  }
  function start() {
    setTimeout(fire, 5000);
    addEventListener('scroll', function sc() { if (scrollY > (document.documentElement.scrollHeight - innerHeight) * .45) { removeEventListener('scroll', sc); setTimeout(fire, 600); } }, { passive: true });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY < 8) fire(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
