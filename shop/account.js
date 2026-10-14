/* Pandoora Shop — area clienti.
   Account, accesso, indirizzi, preferiti e carrello salvati, richiesta d'ordine dal carrello.
   I dati stanno sul vostro hosting Aruba: https://api.pandooragroup.it/clienti/ */
(function () {
  'use strict';
  if (window.PDA) return;
  var API = window.PD_ACC_API || 'https://api.pandooragroup.it/clienti/api.php';
  var ACC = '/shop/account/';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
  var eur = function (x) { return EUR.format(+x || 0); };
  var dataIt = function (t, ora) { var d = new Date(t * 1000); return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + (ora ? ', ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''); };
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var IC = {
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    id: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4M15 10h4M15 13h3"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'
  };

  /* ---------------- stato e chiamate al server ---------------- */
  var S = { pronto: false, utente: null, indirizzi: [], n_ordini: 0, offline: false };
  var attesa = [];
  function api(a, dati) {
    var get = a === 'stato';
    var tempo = new Promise(function (ok) { setTimeout(function () { ok(null); }, 12000); }); // se il server non risponde entro 12 s
    return Promise.race([tempo, fetch(API + (get ? '?a=stato' : ''), get ? { credentials: 'include', cache: 'no-store' } : {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-PD': '1' }, body: JSON.stringify(Object.assign({ a: a }, dati || {}))
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, errore: 'Risposta non valida dal server.' }; }).then(function (j) { if (r.status === 401 && a !== 'accedi') { S.utente = null; aggiornaHeader(); } return j; });
    })]).then(function (r) { return r || { ok: false, offline: true, errore: 'Il server non risponde. Riprovate tra qualche minuto, oppure inviate l\'ordine su WhatsApp dal carrello.' }; })
      .catch(function () { return { ok: false, offline: true, errore: 'Connessione non riuscita. Controllate la rete e riprovate.' }; });
  }
  function carrelloLocale() { return ls('pdShopCart2') || []; }
  function preferitiLocali() { return ls('pdShopFav') || []; }
  function shopReload() { if (window.PDShop && window.PDShop.reload) window.PDShop.reload(); }
  /* dati arrivati dal server dopo accesso/registrazione: il server diventa la copia di riferimento */
  function applica(d, scriviLocale) {
    S.utente = d.utente || null; S.indirizzi = d.indirizzi || []; S.n_ordini = d.n_ordini || 0;
    if (S.utente && scriviLocale) {
      ls('pdShopCart2', d.carrello || []); ls('pdShopFav', d.preferiti || []);
      try { localStorage.removeItem('pdAccDirty'); } catch (e) {}
      shopReload();
    }
    if (S.utente && S.utente.newsletter && !ls('pdNl')) ls('pdNl', { nome: S.utente.nome, email: S.utente.email, d: new Date().toISOString().slice(0, 10) });
    aggiornaHeader();
  }
  /* il sito ha cambiato carrello o preferiti: li salviamo anche sul server */
  var tSync = null, sporco = {};
  function cambiato(k) {
    if (!S.utente) return;
    sporco[k === 'pdShopFav' ? 'preferiti' : 'carrello'] = 1;
    ls('pdAccDirty', 1);
    clearTimeout(tSync); tSync = setTimeout(invia, 900);
  }
  function invia() {
    if (!S.utente) return;
    var d = {};
    if (sporco.carrello) d.carrello = carrelloLocale();
    if (sporco.preferiti) d.preferiti = preferitiLocali();
    sporco = {};
    api('sync', d).then(function (r) { if (r.ok) { try { localStorage.removeItem('pdAccDirty'); } catch (e) {} } });
  }
  addEventListener('pagehide', function () {
    if (!S.utente || (!sporco.carrello && !sporco.preferiti)) return;
    var d = { a: 'sync' };
    if (sporco.carrello) d.carrello = carrelloLocale();
    if (sporco.preferiti) d.preferiti = preferitiLocali();
    try { fetch(API, { method: 'POST', credentials: 'include', keepalive: true, headers: { 'Content-Type': 'application/json', 'X-PD': '1' }, body: JSON.stringify(d) }); } catch (e) {}
  });

  function avvio() {
    return api('stato').then(function (d) {
      S.pronto = true;
      if (!d.ok) { S.offline = true; aggiornaHeader(); return; }
      if (d.utente) {
        if (ls('pdAccDirty')) { // modifiche fatte su questo dispositivo e non ancora salvate: hanno la precedenza
          applica(d, false); sporco = { carrello: 1, preferiti: 1 }; invia();
        } else applica(d, true);
      } else applica(d, false);
    }).then(function () { attesa.forEach(function (f) { f(); }); attesa = []; });
  }
  function quandoPronto(f) { if (S.pronto) f(); else attesa.push(f); }

  /* ---------------- pulsante nell'intestazione ---------------- */
  function aggiornaHeader() {
    var ic = $('.s-head .s-icons');
    if (!ic) return;
    var b = $('#s-acc-btn');
    if (!b) {
      b = document.createElement('a'); b.className = 's-ic'; b.id = 's-acc-btn'; b.href = ACC;
      var fav = $('#s-fav-btn'); ic.insertBefore(b, fav || ic.firstChild);
    }
    var u = S.utente;
    b.classList.toggle('pa-in', !!u);
    b.setAttribute('aria-label', u ? 'Il mio account' : 'Accedi o registrati');
    b.innerHTML = IC.user + (u ? esc(u.nome || 'Account') : 'Accedi') + (u ? '<span class="pa-ini" aria-hidden="true">' + esc((u.nome || '?').charAt(0).toUpperCase()) + '</span>' : '');
  }

  /* ---------------- moduli ---------------- */
  function campo(n, lab, o) {
    o = o || {};
    var t = o.type || 'text', v = o.v == null ? '' : o.v, cls = o.w ? ' class="w"' : '';
    if (t === 'textarea') return '<label' + cls + '>' + lab + '<textarea name="' + n + '" maxlength="' + (o.max || 1000) + '" placeholder="' + esc(o.ph || '') + '">' + esc(v) + '</textarea></label>';
    if (t === 'password') return '<label' + cls + '>' + lab + '<span class="pa-pw"><input name="' + n + '" type="password" autocomplete="' + (o.ac || 'current-password') + '" minlength="8" maxlength="200"' + (o.req === false ? '' : ' required') + '><button type="button" data-pw>Mostra</button></span></label>';
    return '<label' + cls + '>' + lab + '<input name="' + n + '" type="' + t + '" value="' + esc(v) + '"' + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + (o.im ? ' inputmode="' + o.im + '"' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.req ? ' required' : '') + ' maxlength="' + (o.max || 190) + '"></label>';
  }
  function anagraficaHTML(u, conEmail) {
    u = u || {};
    var tipo = u.tipo || 'privato';
    return '<div class="pa-lab">Siete<div class="pa-seg" data-tipo>' + [['privato', 'Privato'], ['azienda', 'Azienda'], ['professionista', 'Professionista']].map(function (x) {
      return '<button type="button" data-v="' + x[0] + '" aria-pressed="' + (tipo === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><input type="hidden" name="tipo" value="' + esc(tipo) + '"></div>'
      + '<div class="pa-g">' + campo('nome', 'Nome', { v: u.nome, ac: 'given-name', req: 1, max: 80 }) + campo('cognome', 'Cognome', { v: u.cognome, ac: 'family-name', req: 1, max: 80 })
      + (conEmail ? campo('email', 'Email', { type: 'email', v: u.email, ac: 'email', req: 1 }) : '')
      + campo('telefono', 'Telefono', { type: 'tel', v: u.telefono, ac: 'tel', im: 'tel', req: 1, max: 40, w: !conEmail ? 0 : 0 }) + '</div>'
      + '<div class="pa-g" data-azienda' + (tipo === 'privato' ? ' hidden' : '') + '>' + campo('azienda', 'Ragione sociale', { v: u.azienda, ac: 'organization', w: 1, max: 160 })
      + campo('piva', 'Partita IVA', { v: u.piva, max: 30 }) + campo('cf', 'Codice fiscale', { v: u.cf, max: 30 })
      + campo('sdi', 'Codice SDI', { v: u.sdi, max: 10, ph: 'per la fattura elettronica' }) + campo('pec', 'PEC', { type: 'email', v: u.pec, max: 160 }) + '</div>';
  }
  function legaModulo(f) {
    $$('[data-pw]', f).forEach(function (b) { b.onclick = function () { var i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? 'Mostra' : 'Nascondi'; }; });
    var seg = $('[data-tipo]', f);
    if (seg) $$('button', seg).forEach(function (b) {
      b.onclick = function () {
        $$('button', seg).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        $('[name=tipo]', f).value = b.dataset.v;
        var az = $('[data-azienda]', f); if (az) az.hidden = b.dataset.v === 'privato';
      };
    });
    $$('input,select,textarea', f).forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('err'); }); });
  }
  function valori(f) {
    var o = {};
    $$('input,select,textarea', f).forEach(function (i) {
      if (!i.name) return;
      if (i.type === 'checkbox') o[i.name] = i.checked;
      else if (i.type === 'radio') { if (i.checked) o[i.name] = i.value; }
      else o[i.name] = i.value.trim();
    });
    return o;
  }
  function erroreModulo(f, r) {
    var m = $('.pa-msg', f); if (m) { m.className = 'pa-msg'; m.textContent = r.errore || 'Qualcosa non ha funzionato.'; }
    if (r.campo) { var i = $('[name="' + r.campo + '"]', f); if (i) { i.classList.add('err'); i.focus(); } }
  }
  function attendi(f, si, testo) {
    var b = $('button[type=submit]', f); if (!b) return;
    if (si) { b.dataset.t = b.textContent; b.textContent = testo || 'Un attimo…'; b.disabled = true; } else { b.textContent = b.dataset.t || b.textContent; b.disabled = false; }
  }
  function controllaPrima(f) { // controllo veloce prima di inviare
    var bad = null;
    $$('input[required],textarea[required]', f).forEach(function (i) {
      if (i.closest('[hidden]')) return;
      var ok = i.type === 'checkbox' ? i.checked : i.value.trim() !== '' && (i.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())) && (i.type !== 'password' || i.value.length >= 8);
      if (!ok) { i.classList.add('err'); bad = bad || i; }
    });
    if (bad) {
      erroreModulo(f, { errore: bad.type === 'checkbox' ? 'Serve il consenso all\'informativa privacy.' : bad.type === 'email' ? 'Controllate l\'indirizzo email.' : bad.type === 'password' ? 'La password deve avere almeno 8 caratteri.' : 'Compilate i campi evidenziati.' });
      bad.focus(); return false;
    }
    return true;
  }

  /* modulo di accesso (usato nella pagina account e nella richiesta d'ordine) */
  function moduloAccesso(box, fatto, extra) {
    box.innerHTML = '<form class="pa-f" novalidate>' + campo('email', 'Email', { type: 'email', ac: 'email', req: 1 }) + campo('password', 'Password', { type: 'password' })
      + '<div class="pa-row"><label class="pa-chk"><input type="checkbox" name="ricordami" checked> Resta collegato</label><button type="button" class="pa-link" data-recupera>Password dimenticata?</button></div>'
      + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Accedi</button>' + (extra || '') + '</form>';
    var f = $('form', box); legaModulo(f);
    $('[data-recupera]', f).onclick = function () { moduloRecupero(box, function () { moduloAccesso(box, fatto, extra); }, $('[name=email]', f).value); };
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return;
      var v = valori(f); attendi(f, true);
      api('accedi', { email: v.email, password: v.password, ricordami: v.ricordami, carrello: carrelloLocale(), preferiti: preferitiLocali() }).then(function (r) {
        attendi(f, false);
        if (!r.ok) return erroreModulo(f, r);
        applica(r, true); fatto && fatto(r);
      });
    };
    return f;
  }
  function moduloRecupero(box, indietro, email) {
    box.innerHTML = '<form class="pa-f" novalidate><p class="pa-sub" style="margin:0">Scrivete l\'email del vostro account: vi mandiamo un link per scegliere una nuova password.</p>'
      + campo('email', 'Email', { type: 'email', ac: 'email', req: 1, v: email }) + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Mandami il link</button>'
      + '<div class="pa-alt"><button type="button" class="pa-link" data-back>Torna all\'accesso</button></div></form>';
    var f = $('form', box); legaModulo(f);
    $('[data-back]', f).onclick = indietro;
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return; attendi(f, true);
      api('recupera', { email: valori(f).email }).then(function (r) {
        attendi(f, false); if (!r.ok) return erroreModulo(f, r);
        var m = $('.pa-msg', f); m.className = 'pa-msg ok'; m.textContent = 'Fatto. Se l\'email corrisponde a un account, tra poco ricevete il link (controllate anche nello spam). Il link vale 1 ora.';
        $('button[type=submit]', f).hidden = true;
      });
    };
  }

  /* ---------------- finestra ---------------- */
  var M = null, mPrima = null;
  function apriFinestra(html, opz) {
    chiudiFinestra(true);
    mPrima = document.activeElement;
    M = document.createElement('div'); M.className = 'pa-m'; M.setAttribute('role', 'dialog'); M.setAttribute('aria-modal', 'true');
    M.innerHTML = '<div class="pa-m-box" data-lenis-prevent' + (opz && opz.largo ? ' style="max-width:760px"' : '') + '><button type="button" class="pa-x" aria-label="Chiudi">' + IC.x + '</button><div class="pa-m-c">' + html + '</div></div>';
    document.body.appendChild(M);
    document.documentElement.style.overflow = 'hidden'; window.PDM && window.PDM.stop && window.PDM.stop();
    $('.pa-x', M).onclick = function () { chiudiFinestra(); };
    M.addEventListener('mousedown', function (e) { if (e.target === M) chiudiFinestra(); });
    M.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiFinestra(); });
    requestAnimationFrame(function () { M && M.classList.add('show'); var i = $('input:not([type=hidden]),button.s-btn', M); i && i.focus({ preventScroll: true }); });
    return $('.pa-m-c', M);
  }
  function chiudiFinestra(subito) {
    if (!M) return; var m = M; M = null;
    m.classList.remove('show'); setTimeout(function () { m.remove(); }, subito ? 0 : 300);
    document.documentElement.style.overflow = ''; window.PDM && window.PDM.start && window.PDM.start();
    if (mPrima && mPrima.focus) try { mPrima.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------------- richiesta d'ordine dal carrello ---------------- */
  function riepilogoHTML(o) {
    return '<div class="pa-sum"><ul>' + o.righe.map(function (l) { return '<li><span>' + l.qty + ' × ' + esc(l.name) + '</span><b>' + eur(l.gross) + '</b></li>'; }).join('') + '</ul>'
      + (o.disc ? '<div class="pa-row" style="color:var(--ok);font-weight:700;margin-bottom:6px"><span>Sconti</span><span>−' + eur(o.disc) + '</span></div>' : '')
      + '<div class="t"><span>Totale indicativo</span><span>' + eur(o.tot) + '</span></div></div>';
  }
  function indirizzoBreve(i) { return esc([i.via, [i.cap, i.citta].filter(Boolean).join(' ') + (i.provincia ? ' (' + i.provincia + ')' : '')].filter(Boolean).join(', ')); }
  function campiIndirizzo(pref) {
    return '<div class="pa-g">' + campo(pref + 'via', 'Via e numero civico', { ac: 'street-address', w: 1, req: 1 }) + campo(pref + 'cap', 'CAP', { ac: 'postal-code', im: 'numeric', max: 12, req: 1 })
      + campo(pref + 'citta', 'Città', { ac: 'address-level2', req: 1, max: 120 }) + campo(pref + 'provincia', 'Provincia', { ac: 'address-level1', max: 80, ph: 'es. TV' })
      + campo(pref + 'paese', 'Paese', { ac: 'country-name', v: 'Italia', max: 80 }) + '</div>';
  }
  function checkout() {
    var o = window.PDShop && window.PDShop.ordine ? window.PDShop.ordine() : null;
    if (!o || !o.righe.length) return;
    window.PDShop.chiudiCarrello && window.PDShop.chiudiCarrello();
    var box = apriFinestra('<h2>Richiesta d\'ordine</h2><p class="pa-sub" style="margin:0">Nessun pagamento adesso: vi ricontattiamo per confermare misure, tempi e prezzo prima della produzione.</p>' + riepilogoHTML(o) + '<div data-co></div>');
    var c = $('[data-co]', box);
    quandoPronto(function () { if (S.utente) checkoutCliente(c, o); else checkoutOspite(c, o); });
  }
  function checkoutCliente(c, o) {
    var u = S.utente, ind = S.indirizzi;
    c.innerHTML = '<form class="pa-f" novalidate><div class="pa-who"><span>Ordinate come <b>' + esc(u.nome + ' ' + u.cognome) + '</b><br><small>' + esc(u.email) + ' · ' + esc(u.telefono || '') + '</small></span><a class="pa-link" href="' + ACC + '#dati">Modifica</a></div>'
      + '<p class="pa-sec-t">Consegna</p><div class="pa-pick">'
      + ind.map(function (i, k) { return '<label><input type="radio" name="dove" value="' + i.id + '"' + (i.predefinito || k === 0 ? ' checked' : '') + '><span><b>' + esc(i.nome) + '</b>' + (i.etichetta ? ' · ' + esc(i.etichetta) : '') + '<br>' + indirizzoBreve(i) + '</span></label>'; }).join('')
      + '<label><input type="radio" name="dove" value="nuovo"' + (ind.length ? '' : ' checked') + '><span><b>Nuovo indirizzo</b></span></label>'
      + '<label><input type="radio" name="dove" value="ritiro"><span><b>Ritiro in sede o da concordare</b><br>Fontanelle (TV)</span></label></div>'
      + '<div data-nuovo' + (ind.length ? ' hidden' : '') + '>' + campiIndirizzo('i_') + '<label class="pa-chk" style="margin-top:12px"><input type="checkbox" name="salva_indirizzo" checked> Salva nel mio account</label></div>'
      + campo('note', 'Note per noi (facoltative)', { type: 'textarea', max: 2000, ph: 'Misure del vano, piano, orari, richieste…' })
      + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Invia la richiesta d\'ordine</button></form>';
    var f = $('form', c); legaModulo(f);
    var nuovo = $('[data-nuovo]', f);
    $$('[name=dove]', f).forEach(function (r) { r.onchange = function () { nuovo.hidden = valori(f).dove !== 'nuovo'; }; });
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return;
      var v = valori(f), d = { righe: o.righe, totali: { sub: o.sub, disc: o.disc, tot: o.tot }, codice: o.codice, note: v.note, pagina: location.pathname };
      if (v.dove === 'nuovo') { d.indirizzo = { nome: u.nome + ' ' + u.cognome, via: v.i_via, cap: v.i_cap, citta: v.i_citta, provincia: v.i_provincia, paese: v.i_paese, telefono: u.telefono }; d.salva_indirizzo = v.salva_indirizzo; }
      else if (v.dove === 'ritiro') d.note = '[Ritiro in sede / da concordare] ' + (v.note || '');
      else d.indirizzo_id = +v.dove;
      invioOrdine(f, c, d);
    };
  }
  function checkoutOspite(c, o) {
    c.innerHTML = '<div class="pa-who"><span>Avete già un account?</span><button type="button" class="pa-link" data-login>Accedi</button></div><div data-login-box hidden style="margin-top:14px"></div>'
      + '<form class="pa-f" novalidate style="margin-top:16px">' + anagraficaHTML(null, true)
      + '<p class="pa-sec-t">Consegna</p>' + campiIndirizzo('i_')
      + campo('note', 'Note per noi (facoltative)', { type: 'textarea', max: 2000, ph: 'Misure del vano, piano, orari, richieste…' })
      + '<label class="pa-chk"><input type="checkbox" name="crea_account"> Create il mio account con questi dati: ritrovo ordini, carrello e preferiti</label>'
      + '<div data-pw-box hidden>' + campo('password', 'Scegliete una password (almeno 8 caratteri)', { type: 'password', ac: 'new-password', req: false }) + '</div>'
      + '<label class="pa-chk"><input type="checkbox" name="newsletter"> Voglio ricevere la newsletter con offerte e novità</label>'
      + '<label class="pa-chk"><input type="checkbox" name="privacy" required> Ho letto l\'<a href="/privacy/" target="_blank">informativa privacy</a> e acconsento al trattamento dei dati per gestire la richiesta.</label>'
      + '<input name="sito_web" class="pa-trap" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Invia la richiesta d\'ordine</button></form>';
    var f = $('form', c); legaModulo(f);
    var lb = $('[data-login-box]', c);
    $('[data-login]', c).onclick = function () { lb.hidden = !lb.hidden; f.hidden = !lb.hidden; if (!lb.hidden) moduloAccesso(lb, function () { checkoutCliente(c, o); }); };
    var pw = $('[data-pw-box]', f), ca = $('[name=crea_account]', f);
    ca.onchange = function () { pw.hidden = !ca.checked; $('[name=password]', f).required = ca.checked; };
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return;
      var v = valori(f);
      var d = Object.assign({}, v, { righe: o.righe, totali: { sub: o.sub, disc: o.disc, tot: o.tot }, codice: o.codice, pagina: location.pathname, preferiti: preferitiLocali(),
        indirizzo: { nome: v.nome + ' ' + v.cognome, azienda: v.azienda, via: v.i_via, cap: v.i_cap, citta: v.i_citta, provincia: v.i_provincia, paese: v.i_paese, telefono: v.telefono } });
      invioOrdine(f, c, d);
    };
  }
  function invioOrdine(f, c, d) {
    attendi(f, true, 'Invio in corso…');
    api('ordine', d).then(function (r) {
      attendi(f, false);
      if (!r.ok) return erroreModulo(f, r);
      if (r.utente) applica(r, false);
      window.PDShop && window.PDShop.svuotaCarrello && window.PDShop.svuotaCarrello();
      try { localStorage.removeItem('pdAccDirty'); } catch (e) {}
      var box = c.closest('.pa-m-c') || c;
      box.innerHTML = '<div class="pa-done"><div class="ic">' + IC.check + '</div><h2>Richiesta inviata!</h2><div class="num">' + esc(r.numero) + '</div>'
        + '<p class="pa-sub">Vi abbiamo mandato un riepilogo via email. Vi contattiamo noi a breve per confermare misure, tempi e prezzo finale.' + (r.account_creato ? '<br><b>Il vostro account è pronto:</b> confermate l\'email dal messaggio che vi abbiamo inviato.' : '') + '</p>'
        + '<div class="s-btns">' + (S.utente ? '<a class="s-btn s-btn-p" href="' + ACC + '#ordini">Segui l\'ordine</a>' : '') + '<button type="button" class="s-btn s-btn-o" data-chiudi>Continua sullo shop</button></div></div>';
      $('[data-chiudi]', box).onclick = function () { chiudiFinestra(); };
    });
  }

  /* ---------------- pagina "Il mio account" ---------------- */
  var PROD = null;
  function prodotti() { return PROD ? Promise.resolve(PROD) : fetch('/shop/data/products.json').then(function (r) { return r.json(); }).then(function (j) { PROD = j.products || []; return PROD; }).catch(function () { return []; }); }
  var VOCI = [['panoramica', 'Panoramica', IC.home], ['ordini', 'I miei ordini', IC.box], ['indirizzi', 'Indirizzi', IC.pin], ['preferiti', 'Preferiti', IC.heart], ['dati', 'Dati personali', IC.id], ['sicurezza', 'Password e privacy', IC.lock]];
  var APP = null;
  function paginaAccount() {
    APP = $('#pa-app'); if (!APP) return;
    var q = new URLSearchParams(location.search);
    if (q.get('verifica')) { APP.innerHTML = '<div class="pa-auth"><p class="pa-sub">Conferma in corso…</p></div>'; return api('verifica', { token: q.get('verifica') }).then(function (r) {
      history.replaceState(null, '', ACC + '#panoramica');
      if (r.ok && S.utente) S.utente.verificato = true;
      vista(r.ok ? 'Email confermata. Grazie!' : r.errore, !r.ok); }); }
    if (q.get('reset')) return reimposta(q.get('reset'));
    quandoPronto(function () { vista(); });
    addEventListener('hashchange', function () { vista(); });
  }
  function vista(avviso, errato) {
    var h = (location.hash || '').slice(1);
    if (!S.utente) {
      if (S.offline) { APP.innerHTML = '<div class="pa-auth"><span class="pa-k">Il mio account</span><h1 class="pa-h1">Area clienti momentaneamente non raggiungibile</h1><p class="pa-sub">Riprovate tra qualche minuto. Intanto potete ordinare dal carrello via WhatsApp o email.</p><a class="s-btn s-btn-p" href="/shop/">Torna allo shop</a></div>'; return; }
      return h === 'registrati' ? registrati() : h === 'recupera' ? (function () { accesso(); moduloRecupero($('.pa-card', APP), function () { location.hash = 'accedi'; accesso(); }); })() : accesso(avviso, errato);
    }
    if (!VOCI.some(function (v) { return v[0] === h; })) h = 'panoramica';
    APP.innerHTML = '<div class="pa-dash"><nav class="pa-side" aria-label="Il mio account"><div class="pa-me"><b>' + esc(S.utente.nome + ' ' + S.utente.cognome) + '</b><small>' + esc(S.utente.email) + '</small></div>'
      + VOCI.map(function (v) { return '<a class="pa-nav" href="#' + v[0] + '"' + (v[0] === h ? ' aria-current="page"' : '') + '>' + v[2] + v[1] + (v[0] === 'ordini' && S.n_ordini ? '<i>' + S.n_ordini + '</i>' : v[0] === 'preferiti' && preferitiLocali().length ? '<i>' + preferitiLocali().length + '</i>' : '') + '</a>'; }).join('')
      + '<button type="button" class="pa-nav" data-esci>' + IC.out + 'Esci</button></nav><section class="pa-main" id="pa-main"></section></div>';
    $('[data-esci]', APP).onclick = esci;
    var main = $('#pa-main', APP);
    var banner = (avviso ? '<div class="pa-banner" style="' + (errato ? '' : 'background:#e9f6ee;border-color:#bfe2cb;color:#1e6b38') + '">' + esc(avviso) + '</div>' : '')
      + (!S.utente.verificato ? '<div class="pa-banner"><span>Confermate la vostra email: vi abbiamo mandato un link a <b>' + esc(S.utente.email) + '</b>.</span><button type="button" class="pa-link" data-reinvia>Inviala di nuovo</button></div>' : '');
    ({ panoramica: vPanoramica, ordini: vOrdini, indirizzi: vIndirizzi, preferiti: vPreferiti, dati: vDati, sicurezza: vSicurezza })[h](main, banner);
    var ri = $('[data-reinvia]', main);
    if (ri) ri.onclick = function () { ri.disabled = true; api('reinvia_verifica').then(function (r) { ri.outerHTML = '<span>' + (r.ok ? 'Inviata ✓' : esc(r.errore)) + '</span>'; }); };
    if (window.scrollY > 300) scrollTo({ top: 0 });
  }
  function accesso(avviso, errato) {
    APP.innerHTML = '<div class="pa-auth"><span class="pa-k">Il mio account</span><h1 class="pa-h1">Bentornati</h1><p class="pa-sub">Accedete per ritrovare ordini, carrello, preferiti e indirizzi su ogni dispositivo.</p>'
      + (avviso ? '<div class="pa-banner"' + (errato ? '' : ' style="background:#e9f6ee;border-color:#bfe2cb;color:#1e6b38"') + '>' + esc(avviso) + '</div>' : '')
      + '<div class="pa-card"></div><p class="pa-alt">Non avete un account? <a class="pa-link" href="#registrati">Registratevi</a></p></div>';
    moduloAccesso($('.pa-card', APP), function () { location.hash = 'panoramica'; vista(); });
  }
  function registrati() {
    APP.innerHTML = '<div class="pa-auth wide"><span class="pa-k">Nuovo account</span><h1 class="pa-h1">Create il vostro account</h1><p class="pa-sub">Gratis, in un minuto.</p>'
      + '<ul class="pa-perks"><li><b>Ordini in un clic</b>Dati e indirizzi già pronti</li><li><b>Su ogni dispositivo</b>Carrello e preferiti sempre con voi</li><li><b>Stato dell\'ordine</b>Seguite la produzione fino alla consegna</li></ul>'
      + '<div class="pa-card"><form class="pa-f" novalidate>' + anagraficaHTML(null, true) + campo('password', 'Password (almeno 8 caratteri)', { type: 'password', ac: 'new-password' })
      + '<label class="pa-chk"><input type="checkbox" name="newsletter"> Voglio la newsletter e il codice di benvenuto da ' + '10% sullo shop</label>'
      + '<label class="pa-chk"><input type="checkbox" name="privacy" required> Ho letto l\'<a href="/privacy/" target="_blank">informativa privacy</a> e acconsento al trattamento dei miei dati per gestire l\'account.</label>'
      + '<input name="sito_web" class="pa-trap" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Crea il mio account</button></form></div>'
      + '<p class="pa-alt">Avete già un account? <a class="pa-link" href="#accedi">Accedete</a></p></div>';
    var f = $('form', APP); legaModulo(f);
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return;
      var v = valori(f); attendi(f, true);
      api('registra', Object.assign(v, { carrello: carrelloLocale(), preferiti: preferitiLocali() })).then(function (r) {
        attendi(f, false); if (!r.ok) return erroreModulo(f, r);
        applica(r, true);
        if (v.newsletter) { var N = window.PDShop && window.PDShop.offerta ? window.PDShop.offerta() : null; if (N && N.code) ls('pdCode', N.code); }
        location.hash = 'panoramica'; vista('Account creato. Benvenuti, ' + r.utente.nome + '!');
      });
    };
  }
  function reimposta(token) {
    APP.innerHTML = '<div class="pa-auth"><span class="pa-k">Nuova password</span><h1 class="pa-h1">Scegliete una nuova password</h1><div class="pa-card"><form class="pa-f" novalidate>'
      + campo('password', 'Nuova password (almeno 8 caratteri)', { type: 'password', ac: 'new-password' }) + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Salva e accedi</button></form></div></div>';
    var f = $('form', APP); legaModulo(f);
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return; attendi(f, true);
      api('reimposta', { token: token, password: valori(f).password }).then(function (r) {
        attendi(f, false); if (!r.ok) return erroreModulo(f, r);
        applica(r, true); history.replaceState(null, '', ACC + '#panoramica'); S.pronto = true; vista('Password aggiornata.');
      });
    };
  }
  function esci() { api('esci').then(function () { S.utente = null; ls('pdShopCart2', []); ls('pdShopFav', []); shopReload(); aggiornaHeader(); location.hash = 'accedi'; vista(); }); }

  function vPanoramica(m, banner) {
    var nc = carrelloLocale().reduce(function (a, l) { return a + (l.qty || 1); }, 0);
    m.innerHTML = banner + '<h2>Ciao ' + esc(S.utente.nome) + '</h2><p class="pa-sub">Cliente dal ' + dataIt(S.utente.creato) + '.</p>'
      + '<div class="pa-tiles"><a class="pa-tile" href="#ordini"><b>' + S.n_ordini + '</b><span>' + (S.n_ordini === 1 ? 'Ordine' : 'Ordini') + '</span></a>'
      + '<button type="button" class="pa-tile" data-cart><b>' + nc + '</b><span>Nel carrello</span></button><a class="pa-tile" href="#preferiti"><b>' + preferitiLocali().length + '</b><span>Preferiti</span></a></div><div data-ultimo></div>';
    $('[data-cart]', m).onclick = function () { if (window.PDShop && window.PDShop.apriCarrello) window.PDShop.apriCarrello(); else location.href = '/shop/'; };
    if (S.n_ordini) api('ordini').then(function (r) { if (r.ok && r.ordini.length) { var u = $('[data-ultimo]', m); if (u) { u.innerHTML = '<h3 class="pa-sec-t" style="margin:0 0 12px">Ultimo ordine</h3>'; u.appendChild(schedaOrdine(r.ordini[0], r.stati, false)); } } });
    else $('[data-ultimo]', m).innerHTML = '<div class="pa-empty">Non avete ancora inviato richieste d\'ordine.<br><a class="s-btn s-btn-p" href="/shop/">Scopri lo shop</a></div>';
  }
  function schedaOrdine(o, stati, aperto) {
    var d = document.createElement('details'); d.className = 'pa-ord'; d.open = !!aperto;
    var seq = ['ricevuto', 'confermato', 'produzione', 'spedito', 'consegnato'], pos = seq.indexOf(o.stato);
    var ind = o.indirizzo;
    d.innerHTML = '<summary><div><b>' + esc(o.numero) + '</b><small>' + dataIt(o.creato, true) + ' · ' + (function (n) { return n + (n === 1 ? ' pezzo' : ' pezzi'); })(o.righe.reduce(function (a, l) { return a + l.qty; }, 0)) + '</small></div>'
      + '<span class="pa-st ' + esc(o.stato) + '">' + esc(o.stato_nome || stati[o.stato] || o.stato) + '</span><span class="pa-tot">' + eur(o.totale) + '</span></summary>'
      + '<div class="pa-ord-b">' + (o.stato !== 'annullato' ? '<div class="pa-steps">' + seq.map(function (s, i) { return '<span class="' + (i <= pos ? 'on' : '') + '">' + esc(stati[s]) + '</span>'; }).join('') + '</div>' : '')
      + o.righe.map(function (l) { return '<div class="pa-line"><img src="' + esc(l.img || l.remote || '/pandoora_logo.webp') + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'"><div><b>' + l.qty + ' × ' + esc(l.name) + '</b><small>' + esc(l.sum) + (l.perc ? ' · −' + l.perc + '% ' + esc(l.why) : '') + (l.iva === 'escl' ? ' · IVA esclusa' : '') + '</small></div><b class="p">' + eur(l.gross - l.amount) + '</b></div>'; }).join('')
      + '<div class="pa-sums"><span>Subtotale ' + eur(o.subtotale) + '</span>' + (+o.sconto ? '<span style="color:var(--ok)">Sconti −' + eur(o.sconto) + (o.codice ? ' (codice ' + esc(o.codice) + ')' : '') + '</span>' : '') + '<b>Totale indicativo ' + eur(o.totale) + '</b></div>'
      + (ind ? '<p style="font-size:14px;margin:14px 0 0"><b>Consegna:</b> ' + esc(ind.nome || '') + ', ' + indirizzoBreve(ind) + '</p>' : '')
      + (o.note ? '<p style="font-size:14px;margin:6px 0 0;color:var(--ink2)"><b>Note:</b> ' + esc(o.note) + '</p>' : '')
      + (o.storia && o.storia.length ? '<ul class="pa-hist">' + o.storia.map(function (s) { return '<li><time>' + dataIt(s.ts, true) + '</time><b>' + esc(stati[s.stato] || s.stato) + '</b>' + (s.nota ? ' — ' + esc(s.nota) : '') + '</li>'; }).join('') + '</ul>' : '')
      + '<div class="s-btns" style="margin-top:14px"><button type="button" class="s-btn s-btn-o" data-riordina style="height:42px">Ordina di nuovo</button></div></div>';
    $('[data-riordina]', d).onclick = function () {
      var car = carrelloLocale();
      o.righe.forEach(function (l) { var ex = car.find(function (x) { return x.key === l.key; }); if (ex) ex.qty = Math.min(99, ex.qty + l.qty); else car.push({ key: l.key, id: l.id, type: l.type, name: l.name, img: l.img, remote: l.remote, sum: l.sum, unit: l.unit, iva: l.iva, qty: l.qty, bundle: '', bdisc: 0, bname: '' }); });
      ls('pdShopCart2', car); cambiato('pdShopCart2'); shopReload();
      this.textContent = 'Aggiunto al carrello ✓';
      if (window.PDShop && window.PDShop.apriCarrello) window.PDShop.apriCarrello();
    };
    return d;
  }
  function vOrdini(m, banner) {
    m.innerHTML = banner + '<h2>I miei ordini</h2><p class="pa-sub">Le richieste inviate dal carrello e il loro stato, aggiornato da noi passo per passo.</p><div data-l><p class="pa-sub">Caricamento…</p></div>';
    api('ordini').then(function (r) {
      var l = $('[data-l]', m); if (!l) return;
      if (!r.ok) { l.innerHTML = '<div class="pa-empty">' + esc(r.errore) + '</div>'; return; }
      if (!r.ordini.length) { l.innerHTML = '<div class="pa-empty">Nessun ordine per ora.<br><a class="s-btn s-btn-p" href="/shop/">Vai allo shop</a></div>'; return; }
      l.innerHTML = ''; r.ordini.forEach(function (o, i) { l.appendChild(schedaOrdine(o, r.stati, i === 0)); });
    });
  }
  function vIndirizzi(m, banner) {
    m.innerHTML = banner + '<h2>Indirizzi</h2><p class="pa-sub">Gli indirizzi di consegna che potete scegliere quando inviate un ordine.</p><div class="pa-addrs">'
      + S.indirizzi.map(function (i) {
        return '<div class="pa-addr' + (i.predefinito ? ' def' : '') + '"><span class="t">' + esc(i.etichetta || 'Indirizzo') + (i.predefinito ? ' · predefinito' : '') + '</span><b>' + esc(i.nome) + '</b>' + (i.azienda ? '<br>' + esc(i.azienda) : '')
          + '<br>' + esc(i.via) + '<br>' + esc(i.cap + ' ' + i.citta) + (i.provincia ? ' (' + esc(i.provincia) + ')' : '') + '<br>' + esc(i.paese) + (i.telefono ? '<br>Tel. ' + esc(i.telefono) : '')
          + '<div class="a"><button type="button" class="pa-link" data-mod="' + i.id + '">Modifica</button>' + (i.predefinito ? '' : '<button type="button" class="pa-link" data-def="' + i.id + '">Rendi predefinito</button>') + '<button type="button" class="pa-link" data-del="' + i.id + '">Elimina</button></div></div>';
      }).join('') + '<button type="button" class="pa-add" data-mod="0">' + IC.plus + 'Aggiungi indirizzo</button></div>';
    $$('[data-mod]', m).forEach(function (b) { b.onclick = function () { modificaIndirizzo(S.indirizzi.find(function (x) { return x.id === +b.dataset.mod; }) || null); }; });
    $$('[data-def]', m).forEach(function (b) { b.onclick = function () { var i = S.indirizzi.find(function (x) { return x.id === +b.dataset.def; }); api('indirizzo', Object.assign({}, i, { predefinito: true })).then(function (r) { if (r.ok) { S.indirizzi = r.indirizzi; vista(); } }); }; });
    $$('[data-del]', m).forEach(function (b) { b.onclick = function () { if (!confirm('Eliminare questo indirizzo?')) return; api('indirizzo_elimina', { id: +b.dataset.del }).then(function (r) { if (r.ok) { S.indirizzi = r.indirizzi; vista(); } }); }; });
  }
  function modificaIndirizzo(i) {
    i = i || { paese: 'Italia', nome: S.utente.nome + ' ' + S.utente.cognome, telefono: S.utente.telefono };
    var box = apriFinestra('<h2>' + (i.id ? 'Modifica indirizzo' : 'Nuovo indirizzo') + '</h2><form class="pa-f" novalidate style="margin-top:16px"><div class="pa-g">'
      + campo('etichetta', 'Nome dell\'indirizzo', { v: i.etichetta, ph: 'es. Casa, Ufficio, Cantiere', max: 60 }) + campo('nome', 'Destinatario', { v: i.nome, req: 1, max: 120 })
      + campo('azienda', 'Azienda (facoltativo)', { v: i.azienda, w: 1, max: 160 }) + campo('via', 'Via e numero civico', { v: i.via, w: 1, req: 1, ac: 'street-address' })
      + campo('cap', 'CAP', { v: i.cap, req: 1, max: 12, im: 'numeric' }) + campo('citta', 'Città', { v: i.citta, req: 1, max: 120 })
      + campo('provincia', 'Provincia', { v: i.provincia, max: 80, ph: 'es. TV' }) + campo('paese', 'Paese', { v: i.paese, max: 80 })
      + campo('telefono', 'Telefono per la consegna', { v: i.telefono, type: 'tel', w: 1, max: 40 }) + campo('note', 'Note per il corriere', { v: i.note, type: 'textarea', w: 1, max: 600, ph: 'Piano, citofono, orari…' }) + '</div>'
      + '<label class="pa-chk"><input type="checkbox" name="predefinito"' + (i.predefinito || !S.indirizzi.length ? ' checked' : '') + '> Indirizzo predefinito</label>'
      + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Salva indirizzo</button></form>');
    var f = $('form', box); legaModulo(f);
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return; attendi(f, true);
      api('indirizzo', Object.assign(valori(f), { id: i.id || 0 })).then(function (r) { attendi(f, false); if (!r.ok) return erroreModulo(f, r); S.indirizzi = r.indirizzi; chiudiFinestra(); vista(); });
    };
  }
  function vPreferiti(m, banner) {
    m.innerHTML = banner + '<h2>Preferiti</h2><p class="pa-sub">I prodotti che avete salvato con il cuore, su qualsiasi dispositivo.</p><div data-l></div>';
    prodotti().then(function (P) {
      var l = $('[data-l]', m); if (!l) return;
      var ids = preferitiLocali(), list = ids.map(function (id) { return P.find(function (p) { return p.id === id; }); }).filter(Boolean);
      if (!list.length) { l.innerHTML = '<div class="pa-empty">Non avete ancora salvato prodotti. Toccate il cuore su una scheda per ritrovarla qui.<br><a class="s-btn s-btn-p" href="/shop/">Scopri lo shop</a></div>'; return; }
      l.innerHTML = '<div class="pa-favs">' + list.map(function (p) {
        return '<a class="pa-fav" href="/shop/' + esc(p.cat) + '/' + esc(p.id) + '/">' + (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : '<img src="/pandoora_logo.webp" alt="">') + '<b>' + esc(p.name) + '</b><small>' + esc(p.desc || '') + '</small><button type="button" data-tog="' + esc(p.id) + '" aria-label="Togli dai preferiti">' + IC.heart + '</button></a>';
      }).join('') + '</div>';
      $$('[data-tog]', l).forEach(function (b) { b.onclick = function (e) { e.preventDefault(); ls('pdShopFav', preferitiLocali().filter(function (x) { return x !== b.dataset.tog; })); cambiato('pdShopFav'); shopReload(); vista(); }; });
    });
  }
  function vDati(m, banner) {
    var u = S.utente;
    m.innerHTML = banner + '<h2>Dati personali</h2><p class="pa-sub">Li usiamo per i vostri ordini e, se siete un\'azienda, per la fattura.</p><div class="pa-card"><form class="pa-f" novalidate>' + anagraficaHTML(u, false)
      + '<label class="pa-chk"><input type="checkbox" name="newsletter"' + (u.newsletter ? ' checked' : '') + '> Ricevo la newsletter con offerte e novità</label><p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p">Salva le modifiche</button></form></div>'
      + '<div class="pa-sec"><h3>Email di accesso</h3><p class="pa-sub" style="margin:0 0 12px">Attuale: <b>' + esc(u.email) + '</b></p><form class="pa-f" novalidate data-email><div class="pa-g">' + campo('email', 'Nuova email', { type: 'email', req: 1 }) + campo('password', 'Password attuale', { type: 'password' }) + '</div><p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-o" style="width:auto">Cambia email</button></form></div>';
    var f = $('form', m); legaModulo(f);
    f.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(f)) return; attendi(f, true);
      api('profilo', valori(f)).then(function (r) { attendi(f, false); if (!r.ok) return erroreModulo(f, r); applica(r, false); var x = $('.pa-msg', f); x.className = 'pa-msg ok'; x.textContent = 'Salvato ✓'; });
    };
    var fe = $('[data-email]', m); legaModulo(fe);
    fe.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(fe)) return; attendi(fe, true);
      api('email', valori(fe)).then(function (r) { attendi(fe, false); if (!r.ok) return erroreModulo(fe, r); applica(r, false); vista('Email aggiornata: confermatela dal link che vi abbiamo mandato.'); });
    };
  }
  function vSicurezza(m, banner) {
    m.innerHTML = banner + '<h2>Password e privacy</h2><p class="pa-sub">Cambiate la password, scaricate i vostri dati o eliminate l\'account.</p>'
      + '<div class="pa-card"><form class="pa-f" novalidate data-pw><h3 style="margin:0;font:800 16px var(--body)">Cambia password</h3><div class="pa-g">' + campo('attuale', 'Password attuale', { type: 'password' }) + campo('nuova', 'Nuova password', { type: 'password', ac: 'new-password' }) + '</div>'
      + '<p class="pa-msg" role="alert"></p><button type="submit" class="s-btn s-btn-p" style="width:auto">Aggiorna password</button></form></div>'
      + '<div class="pa-sec"><h3>I miei dati</h3><p class="pa-sub" style="margin:0 0 12px">Scaricate in un file tutti i dati che conserviamo su di voi: profilo, indirizzi, preferiti, carrello, ordini.</p><button type="button" class="s-btn s-btn-o" data-exp style="height:44px">Scarica i miei dati</button></div>'
      + '<div class="pa-danger"><h3>Elimina account</h3><p class="pa-sub" style="margin:0 0 12px">Cancelliamo profilo, indirizzi, preferiti e carrello. Le richieste d\'ordine già inviate restano nel nostro archivio per gli obblighi di legge.</p>'
      + '<form class="pa-f" novalidate data-del><div class="pa-g">' + campo('password', 'Password per confermare', { type: 'password' }) + '</div><p class="pa-msg" role="alert"></p><button type="submit" class="pa-btn-d">Elimina definitivamente il mio account</button></form></div>';
    var fp = $('[data-pw]', m); legaModulo(fp);
    fp.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(fp)) return; attendi(fp, true);
      api('password', valori(fp)).then(function (r) { attendi(fp, false); if (!r.ok) return erroreModulo(fp, r); fp.reset(); var x = $('.pa-msg', fp); x.className = 'pa-msg ok'; x.textContent = 'Password aggiornata ✓ Siete stati scollegati dagli altri dispositivi.'; });
    };
    $('[data-exp]', m).onclick = function () {
      api('esporta').then(function (r) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })); a.download = 'i-miei-dati-pandoora.json'; document.body.appendChild(a); a.click(); a.remove(); });
    };
    var fd = $('[data-del]', m); legaModulo(fd);
    fd.onsubmit = function (e) {
      e.preventDefault(); if (!controllaPrima(fd)) return;
      if (!confirm('Eliminare definitivamente il vostro account? L\'operazione non si può annullare.')) return;
      attendi(fd, true);
      api('elimina', valori(fd)).then(function (r) { attendi(fd, false); if (!r.ok) return erroreModulo(fd, r); S.utente = null; ls('pdShopCart2', []); ls('pdShopFav', []); shopReload(); aggiornaHeader(); APP.innerHTML = '<div class="pa-auth"><h1 class="pa-h1">Account eliminato</h1><p class="pa-sub">I vostri dati sono stati cancellati. Grazie per essere stati con noi.</p><a class="s-btn s-btn-p" href="/shop/">Torna allo shop</a></div>'; });
    };
  }

  /* ---------------- interfaccia pubblica per shop.js ---------------- */
  window.PDA = {
    cambiato: cambiato,
    checkout: checkout,
    utente: function () { return S.utente; },
    pronto: quandoPronto
  };
  function init() {
    aggiornaHeader();
    avvio();
    if (document.body && document.body.dataset.page === 'account') paginaAccount();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
