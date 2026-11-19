/* PAN.DOOR.A — dashboard · scheda Persone: ogni visitatore, i contatti noti e il loro profilo completo */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var NF = new Intl.NumberFormat('it-IT'), n = function (x) { return NF.format(Math.round(+x || 0)); };
  var EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  var flag = function (cc) { if (!cc || cc.length !== 2) return '🌐'; return String.fromCodePoint.apply(null, cc.toUpperCase().split('').map(function (c) { return 127397 + c.charCodeAt(0); })); };
  var dur = function (s) { s = Math.max(0, Math.round(+s || 0)); if (s < 60) return s + ' s'; var m = Math.floor(s / 60); if (m < 60) return m + ' min'; return Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
  var data = function (t, ora) { if (!t) return '—'; var d = new Date(t * 1000); return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' }) + (ora ? ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''); };
  var hhmm = function (t) { return new Date(t * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
  var fa = function (t) { if (!t) return '—'; var s = Date.now() / 1000 - t; if (s < 90) return 'adesso'; if (s < 3600) return Math.round(s / 60) + ' min fa'; if (s < 86400) return Math.round(s / 3600) + ' ore fa'; if (s < 86400 * 30) return Math.round(s / 86400) + ' giorni fa'; return data(t); };
  var tel = function (t) { return String(t || '').replace(/[^\d+]/g, ''); };
  var wa = function (t) { var x = tel(t).replace(/^\+/, ''); if (x.length === 10 && x[0] === '3') x = '39' + x; return 'https://wa.me/' + x; };
  var nomePagina = function (p, t) { var x = (t || '').replace(/\s*[|·—–-]\s*Pan\.?door\.?a.*$/i, '').trim(); return x || p; };
  var AZ = { whatsapp: ['💬', 'WhatsApp'], telefono: ['📞', 'Telefono'], email: ['✉️', 'Email'], carrello: ['🛒', 'Carrello'], checkout: ['🧾', 'Apre l\'ordine'], ordine: ['✅', 'Ordine inviato'],
    registrazione: ['👤', 'Nuovo account'], iscrizione: ['📰', 'Newsletter'], preventivo: ['📐', 'Preventivo / contatti'], download: ['📄', 'Download'], esterno: ['↗', 'Link esterno'],
    ricerca: ['🔎', 'Ricerca'], copia: ['📋', 'Ha copiato'], preferito: ['♥', 'Preferito'], aiuto: ['🛟', 'Aiuto proposto'] };
  var azIc = function (t) { return (AZ[t] || ['•'])[0]; }, azNm = function (t) { return (AZ[t] || ['', t])[1]; };
  var PAL = [['#4f8cff', '#b07cff'], ['#ff7a45', '#e5483a'], ['#22c493', '#4f8cff'], ['#ffc53d', '#ff7a45'], ['#b07cff', '#ff5ab4'], ['#2dd4ff', '#4f8cff']];
  var colori = function (s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return PAL[h % PAL.length]; };
  var iniziali = function (p) { var nm = (p.nome || '').trim(); if (nm) return nm.split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); return '#' + String(p.pid || '').slice(0, 2).toUpperCase(); };
  var avatar = function (p, live) { var c = colori(p.email || p.pid); return '<span class="av' + (p.email ? '' : ' anon') + '" style="--c1:' + c[0] + ';--c2:' + c[1] + '">' + esc(iniziali(p)) + (live ? '<i class="on"></i>' : '') + '</span>'; };
  var etichetta = function (p) { return p.nome || p.email || ('Visitatore #' + String(p.pid || '').slice(0, 6).toUpperCase()); };
  var FONTI = { checkout: ['Ordine non completato', ''], newsletter: ['Newsletter', ''], account: ['Account', 'b2'], ordine: ['Cliente con ordine', 'b2'], accesso: ['Account', 'b2'] };

  function api(q) {
    return fetch(PDADM.url(q), { cache: 'no-store', headers: PDADM.headers() }).then(function (r) { if (r.status === 401) { PDADM.esci(); throw new Error('accesso'); } return r.json(); });
  }
  var st = { p: '30', q: '', noti: '', azione: '', min_visite: '', ordina: 'recenti', paese: '' };
  try { var sv = JSON.parse(localStorage.getItem('pdlive_persone') || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) {}
  var salva = function () { try { localStorage.setItem('pdlive_persone', JSON.stringify(st)); } catch (e) {} };
  var giorno = function (off) { var d = new Date(); d.setDate(d.getDate() - off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var intervallo = function () { var g = { oggi: 0, '7': 6, '30': 29, '90': 89, '365': 364, tutto: 3650 }[st.p]; return { da: giorno(g == null ? 29 : g), a_: giorno(0) }; };
  var query = function () {
    var iv = intervallo(), o = { a: 'persone', da: iv.da, a_: iv.a_, q: st.q, noti: st.noti, azione: st.azione, min_visite: st.min_visite, ordina: st.ordina, paese: st.paese };
    return Object.keys(o).filter(function (k) { return o[k] !== '' && o[k] != null; }).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&');
  };

  /* ---------- struttura della scheda ---------- */
  var sec, montata = false, ultimi = [];
  function monta() {
    sec = $('#tab-persone'); if (!sec || montata) return; montata = true;
    sec.innerHTML = '<div class="kpis" id="p-kpi"></div>'
      + '<div class="card"><div class="p-filters">'
      + '<div class="seg" id="p-per">' + [['oggi', 'Oggi'], ['7', '7 giorni'], ['30', '30 giorni'], ['90', '90 giorni'], ['365', '12 mesi'], ['tutto', 'Tutto']].map(function (x) { return '<button data-p="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
      + '<div class="grow"><input type="search" id="p-q" placeholder="Cerca nome, email, telefono, città, provider o codice Rif. WhatsApp…"></div>'
      + '<select id="p-noti"><option value="">Tutti i visitatori</option><option value="1">★ Solo contatti noti</option><option value="0">Solo anonimi</option></select>'
      + '<select id="p-az"><option value="">Qualsiasi azione</option>' + ['whatsapp', 'telefono', 'email', 'carrello', 'preferito', 'checkout', 'aiuto', 'ordine', 'preventivo', 'ricerca', 'copia', 'iscrizione', 'registrazione', 'download'].map(function (k) { return '<option value="' + k + '">' + azIc(k) + ' Ha fatto: ' + azNm(k) + '</option>'; }).join('') + '</select>'
      + '<select id="p-min"><option value="">Qualsiasi n. visite</option><option value="2">Tornati almeno 2 volte</option><option value="3">Almeno 3 visite</option><option value="5">Almeno 5 visite</option><option value="10">Almeno 10 visite</option></select>'
      + '<select id="p-ord"><option value="recenti">Ordina: più recenti</option><option value="visite">Ordina: più visite</option><option value="pagine">Ordina: più pagine viste</option><option value="tempo">Ordina: più tempo sul sito</option><option value="azioni">Ordina: più azioni</option></select>'
      + '<button class="ghost" id="p-csv">Scarica CSV</button>'
      + '</div></div>'
      + '<div class="p-head"><span></span><span>Chi</span><span>Dove · da dove</span><span>Dispositivo</span><span>Visite</span><span>Pagine</span><span>Tempo</span><span>Azioni</span><span style="text-align:right">Ultima visita</span></div>'
      + '<div class="p-list" id="p-list"></div>';
    $$('#p-per button', sec).forEach(function (b) { b.onclick = function () { st.p = b.dataset.p; carica(); }; });
    var t = null; $('#p-q', sec).oninput = function (e) { clearTimeout(t); t = setTimeout(function () { st.q = e.target.value.trim(); carica(); }, 350); };
    [['#p-noti', 'noti'], ['#p-az', 'azione'], ['#p-min', 'min_visite'], ['#p-ord', 'ordina']].forEach(function (x) { $(x[0], sec).onchange = function (e) { st[x[1]] = e.target.value; carica(); }; });
    $('#p-csv', sec).onclick = csv;
    // pannello laterale del profilo
    var d = document.createElement('div'); d.className = 'drawer'; d.id = 'p-drawer'; d.hidden = true;
    d.innerHTML = '<div class="drawer-box"><button class="drawer-x" aria-label="Chiudi">×</button><div id="p-body"></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('.drawer-x')) chiudi(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !d.hidden) chiudi(); });
  }
  function chiudi() { $('#p-drawer').hidden = true; document.body.style.overflow = ''; }

  function carica() {
    salva();
    $$('#p-per button', sec).forEach(function (b) { b.classList.toggle('on', b.dataset.p === st.p); });
    $('#p-q', sec).value = st.q; $('#p-noti', sec).value = st.noti; $('#p-az', sec).value = st.azione; $('#p-min', sec).value = st.min_visite; $('#p-ord', sec).value = st.ordina;
    var L = $('#p-list', sec);
    if (!ultimi.length) L.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
    else L.style.opacity = .55;
    return api(query()).then(function (r) {
      L.style.opacity = 1;
      if (!r.ok) { L.innerHTML = '<div class="card empty">Errore nel caricamento.</div>'; return; }
      ultimi = r.persone || [];
      var T = r.totali || {}, tutti = +T.tutti || 0, noti = +T.noti || 0;
      $('#p-kpi', sec).innerHTML = [['Visitatori', n(tutti), ''], ['★ Contatti noti', n(noti), tutti ? Math.round(noti / tutti * 100) + '% dei visitatori' : ''],
        ['Tornati più volte', n(T.ritorno), tutti ? Math.round((+T.ritorno || 0) / tutti * 100) + '%' : ''], ['In elenco', n(ultimi.length), 'con questi filtri']].map(function (k) {
        return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b><em>' + esc(k[2]) + '</em></div>';
      }).join('');
      var ora = Date.now() / 1000;
      L.innerHTML = ultimi.length ? ultimi.map(function (p, i) {
        var f = FONTI[p.fonte] || null, live = ora - (+p.ultimo || 0) < 60;
        var az = (+p.wa ? '💬' + n(p.wa) + ' ' : '') + (+p.carrello ? '🛒' + n(p.carrello) + ' ' : '') + (+p.ordini ? '✅' + n(p.ordini) : '');
        return '<div class="p-row' + (p.email ? ' noto' : '') + '" data-i="' + i + '" style="--i:' + Math.min(i, 20) + '">' + avatar(p, live)
          + '<div class="p-name"><b>' + esc(etichetta(p)) + (f ? '<span class="badge-f ' + f[1] + '">' + f[0] + '</span>' : '') + '</b><small>' + esc([p.telefono, p.email && p.nome ? p.email : ''].filter(Boolean).join(' · ') || ((+p.visite_totali > 1 ? n(p.visite_totali) + ' visite in tutto' : 'Prima visita') + ' · dal ' + data(p.primo))) + '</small></div>'
          + '<div class="c">' + flag(p.cc) + ' ' + esc(p.citta || p.paese || 'Posizione sconosciuta') + (p.regione ? ', ' + esc(p.regione) : '') + '<small>arrivato da ' + esc(p.prima_sorgente || 'Diretto') + '</small></div>'
          + '<div class="c">' + esc([p.modello, p.so].filter(Boolean).join(' · ') || p.dispositivo || '—') + '<small>' + esc(p.isp || p.dispositivo || '') + '</small></div>'
          + '<div class="n"><b>' + n(p.visite) + '</b><small>visite</small></div><div class="n"><b>' + n(p.pagine) + '</b><small>pagine</small></div>'
          + '<div class="n"><b>' + dur(p.tempo) + '</b><small>sul sito</small></div><div class="n"><b>' + (az || n(p.azioni)) + '</b><small>azioni</small></div>'
          + '<div class="t">' + (live ? '<b style="color:var(--good)">● sul sito ora</b>' : fa(p.ultimo)) + '</div></div>';
      }).join('') : '<div class="card empty">Nessun visitatore con questi filtri.</div>';
      $$('.p-row', L).forEach(function (row) { row.onclick = function () { apri(ultimi[+row.dataset.i].pid); }; });
    }).catch(function () { L.style.opacity = 1; });
  }

  function csv() {
    var h = ['Nome', 'Email', 'Telefono', 'Fonte', 'Città', 'Regione', 'Paese', 'Dispositivo', 'Modello', 'Provider', 'Prima sorgente', 'Visite', 'Pagine', 'Tempo (s)', 'Clic WhatsApp', 'Carrello', 'Ordini', 'Prima visita', 'Ultima visita'];
    var cel = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var righe = [h.join(';')].concat(ultimi.map(function (p) { return [p.nome, p.email, p.telefono, p.fonte, p.citta, p.regione, p.paese, p.dispositivo, p.modello, p.isp, p.prima_sorgente, p.visite, p.pagine, p.tempo, p.wa, p.carrello, p.ordini, data(p.primo, 1), data(p.ultimo, 1)].map(cel).join(';'); }));
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + righe.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'persone_' + intervallo().da + '_' + intervallo().a_ + '.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 300);
  }

  /* ---------- profilo completo ---------- */
  function apri(pid) {
    monta();
    var d = $('#p-drawer'), b = $('#p-body'); d.hidden = false; document.body.style.overflow = 'hidden';
    b.innerHTML = '<div class="skel" style="height:90px"></div><div class="skel" style="margin-top:12px"></div><div class="skel" style="margin-top:12px;height:300px"></div>';
    api('a=persona&id=' + encodeURIComponent(pid)).then(function (r) {
      if (!r.ok) { b.innerHTML = '<p class="muted">Profilo non trovato.</p>'; return; }
      var p = r.persona, S = r.sessioni || [], PG = r.pagine || [], A = r.azioni || [], cl = r.cliente, ultima = S[0] || {};
      var totPag = S.reduce(function (s, x) { return s + (+x.pagine || 0); }, 0), totT = S.reduce(function (s, x) { return s + ((+x.ultimo || 0) - (+x.inizio || 0)); }, 0);
      var prima = S[S.length - 1] || {}, f = FONTI[p.fonte];
      var nm = p.nome || (cl ? (cl.nome + ' ' + cl.cognome) : '') || '';
      var tl = p.telefono || (cl && cl.telefono) || '', em = p.email || '';
      var h = '<div class="pp-head">' + avatar({ nome: nm, email: em, pid: p.pid }) + '<div><h2>' + esc(nm || em || 'Visitatore anonimo #' + p.pid.slice(0, 6).toUpperCase()) + (f ? '<span class="badge-f ' + f[1] + '">' + f[0] + '</span>' : '') + (cl ? '<span class="badge-f b3">Cliente registrato</span>' : '') + '</h2>'
        + '<div class="muted">' + esc([em, tl, cl && cl.zona ? '📍 ' + cl.zona : ''].filter(Boolean).join(' · ') || 'Non ha ancora lasciato i suoi dati: lo riconoscerete appena si iscrive, si registra o ordina.') + '</div>'
        + (p.identificato ? '<div class="muted small" style="margin-top:4px">Contatto noto dal ' + data(p.identificato, 1) + '</div>' : '')
        + (function () { var m = null; A.some(function (x) { m = /Rif\. ([A-Z0-9]{4,8})/.exec(x.dettaglio || ''); return m; }); return m ? '<div class="muted small" style="margin-top:4px">Codice nei suoi messaggi WhatsApp: <b>Rif. ' + esc(m[1]) + '</b></div>' : ''; })()
        + '<div class="pp-act">' + (tl ? '<a class="wa" target="_blank" rel="noopener" href="' + wa(tl) + '">💬 WhatsApp</a><a href="tel:' + esc(tel(tl)) + '">📞 Chiama</a>' : '') + (em ? '<a class="ml" href="mailto:' + esc(em) + '">✉️ Email</a>' : '') + '</div></div></div>';
      var tiles = [['Visite', n(S.length)], ['Pagine viste', n(totPag)], ['Tempo sul sito', dur(totT)], ['Azioni', n(A.length)], ['Prodotti guardati', n((r.prodotti || []).length)],
        ['Prima visita', data(prima.inizio)], ['Ultima visita', fa(ultima.ultimo)], ['Arrivato la prima volta da', prima.sorgente || 'Diretto']];
      h += '<div class="pp-grid">' + tiles.map(function (t) { return '<div class="kpi"><span>' + t[0] + '</span><b style="font-size:' + (String(t[1]).length > 9 ? '17px' : '24px') + '">' + esc(t[1]) + '</b></div>'; }).join('') + '</div>';
      // interessi
      if ((r.prodotti || []).length) h += '<div class="pp-sec"><h3>🛋 Prodotti che ha guardato</h3><div class="rank">' + r.prodotti.map(function (x, i) {
        return '<div class="rk nolink" style="--k:' + i + '"><span class="bar" style="width:' + (100 * x.n / r.prodotti[0].n).toFixed(0) + '%"></span><span class="lb">' + esc(nomePagina(x.k, x.titolo)) + '<small>' + esc(x.k) + '</small></span><span class="u">' + dur(x.tempo) + '</span><b>' + n(x.n) + '×</b></div>';
      }).join('') + '</div></div>';
      var ric = A.filter(function (x) { return x.tipo === 'ricerca'; });
      if (ric.length) h += '<div class="pp-sec"><h3>🔎 Cosa ha cercato</h3><div class="split">' + ric.map(function (x) { return '<span class="chip">' + esc(x.dettaglio) + ' <b style="color:var(--muted);font-weight:400">' + data(x.ts) + '</b></span>'; }).join('') + '</div></div>';
      // cliente e ordini
      if (cl || (r.ordini || []).length || r.iscritto) {
        h += '<div class="pp-sec"><h3>🧾 Rapporto con voi</h3><div class="det2">'
          + (cl ? '<div><span>Account</span><b>' + esc(cl.tipo || 'privato') + (cl.azienda ? ' · ' + esc(cl.azienda) : '') + (cl.piva ? ' · P.IVA ' + esc(cl.piva) : '') + '<br><small class="muted">dal ' + data(cl.creato) + ' · ' + n(cl.accessi) + ' accessi</small></b></div>' : '')
          + (r.iscritto ? '<div><span>Newsletter</span><b>' + (+r.iscritto.iscritto ? 'Iscritto' : 'Disiscritto') + ' dal ' + data(r.iscritto.creato) + (r.iscritto.provincia ? ' · ' + esc(r.iscritto.provincia) : '') + '</b></div>' : '')
          + (r.ordini || []).map(function (o) { return '<div><span>Ordine ' + esc(o.numero) + '</span><b>' + EUR.format(+o.totale || 0) + ' · ' + esc((r.stati_nomi || {})[o.stato] || o.stato) + '<br><small class="muted">' + data(o.creato, 1) + '</small></b></div>'; }).join('')
          + '</div></div>';
      }
      // dispositivo e rete
      var u = ultima;
      var det = [['Luogo', [u.citta, u.regione, u.paese].filter(Boolean).join(', ')], ['Provider / rete', u.isp], ['Dispositivo', [u.dispositivo, u.modello, u.so + (u.so_versione ? ' ' + u.so_versione : ''), u.browser].filter(Boolean).join(' · ')],
        ['Schermo', u.schermo ? u.schermo.replace('x', ' × ') + (u.dpr ? ' · densità ' + String(u.dpr).replace('.', ',') : '') : ''], ['Finestra', u.finestra ? u.finestra.replace('x', ' × ') : ''],
        ['Connessione', u.connessione ? u.connessione.toUpperCase() : ''], ['Memoria / CPU', (u.memoria ? u.memoria + ' GB' : '') + (u.cpu ? ' · ' + u.cpu + ' core' : '')],
        ['Touch / Tema', (u.touch == null ? '' : (+u.touch ? 'touch' : 'mouse')) + (u.tema ? ' · tema ' + u.tema : '')], ['Lingue', u.lingue || u.lingua], ['Fuso orario', u.fuso]];
      var luoghi = {}, disp = {}; S.forEach(function (x) { if (x.citta) luoghi[x.citta + (x.regione ? ', ' + x.regione : '')] = 1; disp[[x.modello || x.dispositivo, x.so, x.browser].filter(Boolean).join(' · ')] = 1; });
      if (Object.keys(luoghi).length > 1) det.push(['Tutti i luoghi', Object.keys(luoghi).join(' · ')]);
      if (Object.keys(disp).length > 1) det.push(['Tutti i dispositivi', Object.keys(disp).join(' · ')]);
      h += '<div class="pp-sec"><h3>📱 Dispositivo e rete (ultima visita)</h3><div class="det2">' + det.filter(function (x) { return x[1]; }).map(function (x) { return '<div><span>' + x[0] + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div></div>';
      // cronologia: visite con pagine e azioni
      var perS = {}; PG.forEach(function (x) { (perS[x.sid] = perS[x.sid] || []).push({ t: x.ts, k: 'p', x: x }); });
      A.forEach(function (x) { (perS[x.sid] = perS[x.sid] || []).push({ t: x.ts, k: 'a', x: x }); });
      h += '<div class="pp-sec"><h3>🕒 Tutte le visite</h3><div class="tl">' + S.map(function (s, i) {
        var it = (perS[s.id] || []).sort(function (a, b) { return a.t - b.t; });
        var cam = [s.utm_sorgente, s.utm_mezzo, s.campagna].filter(Boolean).join(' / ');
        return '<details class="tl-s' + (+s.ritorno ? ' r' : '') + '" style="--i:' + Math.min(i, 15) + '"' + (i < 3 ? ' open' : '') + '><summary><b>' + data(s.inizio, 1) + '</b><span class="muted">' + flag(s.cc) + ' ' + esc(s.gps_indirizzo ? '📍 ' + s.gps_indirizzo : s.citta ? s.citta + (s.cap ? ' ' + s.cap : '') : (s.regione ? s.regione + ', ' + (s.paese || '') : (s.paese || '—'))) + ' · ' + esc(s.modello || s.dispositivo || '') + ' · da ' + esc(s.sorgente || 'Diretto') + (cam ? ' (' + esc(cam) + ')' : '') + ' · ' + n(s.pagine) + ' pagine · ' + dur((+s.ultimo) - (+s.inizio)) + '</span></summary>'
          + (s.riferimento ? '<div class="muted small" style="margin:4px 0 2px;word-break:break-all">Arrivato da: ' + esc(s.riferimento) + '</div>' : '')
          + it.map(function (e) {
            if (e.k === 'a') return '<div class="tl-it az"><time>' + hhmm(e.t) + '</time><span>' + azIc(e.x.tipo) + ' <b>' + esc(azNm(e.x.tipo)) + '</b>' + (e.x.dettaglio ? ' · ' + esc(e.x.dettaglio) : '') + '</span></div>';
            return '<div class="tl-it"><time>' + hhmm(e.t) + '</time><span>' + esc(nomePagina(e.x.percorso, e.x.titolo)) + ' <small>' + esc(e.x.percorso) + (e.x.tempo ? ' · ' + dur(e.x.tempo) : '') + (e.x.scroll ? ' · letta al ' + e.x.scroll + '%' : '') + '</small></span></div>';
          }).join('') + '</details>';
      }).join('') + '</div></div>';
      b.innerHTML = h;
    });
  }
  window.PDPersona = { apri: apri };

  document.addEventListener('pd-tab', function (e) { if (e.detail === 'persone') { monta(); carica(); } });
  if ((localStorage.getItem('pdlive_tab') || '').indexOf('persone') >= 0) { monta(); carica(); }
})();
