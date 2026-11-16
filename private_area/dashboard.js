/* PAN.DOOR.A — dashboard visitatori */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NF = new Intl.NumberFormat('it-IT');
  var n = function (x) { return NF.format(Math.round(+x || 0)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  var C = { s1: css('--s1'), s2: css('--s2'), s3: css('--s3'), muted: css('--muted'), line: css('--line'), ink2: css('--ink-2') };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('pdlive_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pdlive_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function flag(cc) {
    if (!cc || cc.length !== 2) return '🌐';
    return String.fromCodePoint.apply(null, cc.toUpperCase().split('').map(function (c) { return 127397 + c.charCodeAt(0); }));
  }
  function dur(s) {
    s = Math.max(0, Math.round(+s || 0));
    if (s < 60) return s + ' s';
    var m = Math.floor(s / 60), r = s % 60;
    if (m < 60) return m + ' min' + (r && m < 10 ? ' ' + r + ' s' : '');
    return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
  }
  function luogo(x) {
    if (!x.cc && !x.citta) return 'Posizione sconosciuta';
    return (x.citta ? x.citta + ', ' : '') + (x.paese || x.cc);
  }
  function api(q) {
    return fetch(PDADM.url(q), { cache: 'no-store', headers: PDADM.headers() }).then(function (r) {
      if (r.status === 401) { PDADM.esci(); throw new Error('accesso'); }
      return r.json();
    });
  }
  function nomePagina(path, titolo) {
    var t = (titolo || '').replace(/\s*[|·—–-]\s*Pan\.?door\.?a.*$/i, '').trim();
    return t || path;
  }

  /* ---------------- schede ---------------- */
  var schedaAttiva = store.get('tab', 'live');
  function mostra(t) {
    schedaAttiva = t; store.set('tab', t);
    $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
    $$('.tab').forEach(function (s) { s.classList.toggle('on', s.id === 'tab-' + t); });
    if (t === 'live') { mapLive.invalidateSize(); caricaLive(); }
    else if (t === 'storico') { if (!storicoCaricato) caricaStorico(); setTimeout(function () { mapSto && mapSto.invalidateSize(); }, 50); }
    document.dispatchEvent(new CustomEvent('pd-tab', { detail: t }));
  }
  $$('.tabs button').forEach(function (b) { b.addEventListener('click', function () { mostra(b.dataset.tab); }); });

  /* ---------------- mappe ---------------- */
  function nuovaMappa(id) {
    var m = L.map(id, { worldCopyJump: true, minZoom: 2, zoomControl: true, attributionControl: true }).setView([35, 12], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap' }).addTo(m);
    return m;
  }
  var mapLive = nuovaMappa('map-live');
  var livelloLive = L.layerGroup().addTo(mapLive);
  var mapSto = null, livelloSto = null;
  var mappaToccata = false, primaVista = true;
  mapLive.on('dragstart zoomstart', function (e) { if (e && e.originalEvent !== undefined) mappaToccata = true; });
  mapLive.getContainer().addEventListener('pointerdown', function () { mappaToccata = true; });

  /* ---------------- LIVE ---------------- */
  var spark = null, ultimoLive = null, visti = {};
  var modalAperto = null;

  function caricaLive() {
    return api('a=live').then(function (d) {
      ultimoLive = d;
      disegnaLive(d);
      $('#agg').textContent = 'aggiornato ' + new Date().toLocaleTimeString('it-IT');
      /* posizione per città non disponibile su Supabase: niente banner */
    }).catch(function () { $('#agg').textContent = 'connessione persa, riprovo…'; });
  }

  function disegnaLive(d) {
    var live = d.live;
    $('#live-n').textContent = n(live.length);
    document.title = (live.length ? '(' + live.length + ') ' : '') + 'Visitatori · Pan.door.a';
    var nuovi = live.filter(function (x) { return +x.ritorno === 0; }).length;
    var disp = {};
    live.forEach(function (x) { disp[x.dispositivo] = (disp[x.dispositivo] || 0) + 1; });
    $('#live-split').innerHTML =
      '<span class="chip"><i style="background:' + C.s1 + '"></i>Nuovi <b>' + n(nuovi) + '</b></span>' +
      '<span class="chip"><i style="background:' + C.s2 + '"></i>Di ritorno <b>' + n(live.length - nuovi) + '</b></span>' +
      Object.keys(disp).map(function (k) { return '<span class="chip">' + esc(k) + ' <b>' + n(disp[k]) + '</b></span>'; }).join('');

    // presenze ultimi 30 minuti
    var lab = d.serie.map(function (x) { return x.t; }), val = d.serie.map(function (x) { return x.n; });
    if (!spark) {
      spark = new Chart($('#spark'), {
        type: 'bar',
        data: { labels: lab, datasets: [{ data: val, backgroundColor: C.s1, borderRadius: { topLeft: 3, topRight: 3 }, borderSkipped: 'bottom', barPercentage: .8, categoryPercentage: 1 }] },
        options: { maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { displayColors: false, callbacks: { label: function (c) { return c.parsed.y + ' presenti'; } } } },
          scales: { x: { display: false }, y: { display: false, beginAtZero: true, suggestedMax: 3 } } }
      });
    } else { spark.data.labels = lab; spark.data.datasets[0].data = val; spark.update('none'); }

    // oggi
    var o = d.oggi, ie = d.ieri;
    $('#oggi').innerHTML = [['Visitatori', o.visitatori, ie.visitatori], ['Visite', o.sessioni, ie.sessioni], ['Pagine viste', o.pagine, ie.pagine]].map(function (k) {
      return '<div><b>' + n(k[1]) + '</b><span>' + k[0] + ' · ieri ' + n(k[2]) + '</span></div>';
    }).join('');

    // elenco
    $('#live-list').innerHTML = live.length ? live.map(function (x) {
      var tipo = +x.ritorno ? '<span class="tag r">' + (x.n_visita > 1 ? x.n_visita + 'ª visita' : 'Di ritorno') + '</span>' : '<span class="tag n">Nuovo</span>';
      return '<div class="vis" data-id="' + esc(x.id) + '">' +
        '<span class="fl">' + flag(x.cc) + '</span><span class="w">' + esc(luogo(x)) + '</span>' + tipo +
        '<span class="p" title="' + esc(x.pagina) + '">' + esc(nomePagina(x.pagina, x.titolo)) + '</span>' +
        '<span class="m">' + esc(x.sorgente || 'Diretto') + ' · ' + esc(x.dispositivo) + ' · da ' + dur(x.durata) + ' · ' + n(x.pagine) + (x.pagine == 1 ? ' pagina' : ' pagine') + '</span></div>';
    }).join('') : '<div class="empty">Nessuno sul sito in questo momento.<br>La pagina si aggiorna da sola ogni 5 secondi.</div>';
    var ora = {}; live.forEach(function (x) { ora[x.id] = 1; }); visti = ora;
    $$('#live-list .vis').forEach(function (el) {
      el.addEventListener('click', function () {
        var x = live.find(function (y) { return y.id === el.dataset.id; });
        if (x && x.lat != null) { mappaToccata = true; mapLive.flyTo([x.lat, x.lon], Math.max(mapLive.getZoom(), 7), { duration: .8 }); }
        apriPercorso(x);
      });
    });

    // mappa: un segnaposto per città
    livelloLive.clearLayers();
    var gruppi = {};
    live.forEach(function (x) {
      if (x.lat == null) return;
      var k = (+x.lat).toFixed(2) + ',' + (+x.lon).toFixed(2);
      (gruppi[k] = gruppi[k] || []).push(x);
    });
    var punti = [];
    Object.keys(gruppi).forEach(function (k) {
      var g = gruppi[k], rit = g.filter(function (x) { return +x.ritorno; }).length;
      var col = rit > g.length / 2 ? C.s2 : C.s1;
      var html = '<div class="pin" style="color:' + col + '"><i style="background:' + col + '"></i>' + (g.length > 1 ? '<b>' + g.length + '</b>' : '') + '</div>';
      var mk = L.marker([g[0].lat, g[0].lon], { icon: L.divIcon({ className: '', html: html, iconSize: [18, 18], iconAnchor: [9, 9] }) });
      mk.bindPopup('<b>' + esc(luogo(g[0])) + '</b>' + (g[0].regione ? '<br><span style="color:' + C.muted + '">' + esc(g[0].regione) + '</span>' : '') + '<br><br>' +
        g.map(function (x) { return (+x.ritorno ? '↺ ' : '★ ') + esc(nomePagina(x.pagina, x.titolo)) + ' <span style="color:' + C.muted + '">· ' + dur(x.durata) + '</span>'; }).join('<br>'));
      mk.addTo(livelloLive);
      punti.push([g[0].lat, g[0].lon]);
    });
    if (punti.length && primaVista && !mappaToccata) {
      primaVista = false;
      if (punti.length === 1) mapLive.setView(punti[0], 5); else mapLive.fitBounds(punti, { padding: [60, 60], maxZoom: 5 });
    }

    // classifiche live
    var conta = function (fn) { var m = {}; live.forEach(function (x) { var k = fn(x); m[k] = (m[k] || 0) + 1; }); return Object.keys(m).map(function (k) { return { k: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; }); };
    var titoli = {}; live.forEach(function (x) { titoli[x.pagina] = x.titolo; });
    classifica($('#live-pagine'), conta(function (x) { return x.pagina; }).map(function (r) { return { k: r.k, lb: nomePagina(r.k, titoli[r.k]), n: r.n }; }), null);
    classifica($('#live-sorgenti'), conta(function (x) { return x.sorgente || 'Diretto'; }).map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), null);
    var paesi = {}; live.forEach(function (x) { paesi[x.cc] = x.paese; });
    classifica($('#live-paesi'), conta(function (x) { return x.cc || ''; }).map(function (r) { return { k: r.k, lb: flag(r.k) + ' ' + (paesi[r.k] || 'Sconosciuto'), n: r.n }; }), null);
  }

  function bannerGeo() {
    if ($('#banner-geo')) return;
    var b = document.createElement('div');
    b.id = 'banner-geo'; b.className = 'note';
    b.innerHTML = '<b>Ultimo passo:</b> installate il database delle posizioni per vedere i visitatori sulla mappa. <button class="btn" style="margin-left:8px">Installa ora</button>';
    b.querySelector('button').addEventListener('click', apriImpostazioni);
    $('#tab-live').insertBefore(b, $('#tab-live').firstChild);
  }

  /* ---------------- percorso di un visitatore ---------------- */
  function apriPercorso(x) {
    if (!x) return;
    apriModal('<h2>' + flag(x.cc) + ' ' + esc(luogo(x)) + '</h2><div class="muted">' + esc([x.regione, x.dispositivo, x.browser, x.so].filter(Boolean).join(' · ')) +
      '</div><p class="muted small" style="margin-top:10px">Caricamento del percorso…</p>');
    api('a=percorso&id=' + encodeURIComponent(x.id)).then(function (d) {
      if (!d.ok) return;
      var t0 = d.pagine.length ? d.pagine[0].ts : 0;
      var tipo = +x.ritorno ? (x.n_visita > 1 ? x.n_visita + 'ª visita' : 'Visitatore di ritorno') : 'Prima visita';
      var html = '<h2>' + flag(x.cc) + ' ' + esc(luogo(x)) + '</h2><div class="muted">' + esc([x.regione, x.dispositivo, x.browser, x.so].filter(Boolean).join(' · ')) + '</div>' +
        '<div class="split" style="margin-top:12px"><span class="chip">' + tipo + '</span><span class="chip">Arrivato da <b>' + esc(x.sorgente || 'Diretto') + '</b></span>' +
        (x.durata != null ? '<span class="chip">Durata <b>' + dur(x.durata != null ? x.durata : (x.ultimo - x.inizio)) + '</b></span>' : '') + '</div>' +
        '<h3 style="margin-top:16px">Pagine viste in questa visita</h3><ol class="steps">' +
        d.pagine.map(function (p) {
          return '<li>' + esc(nomePagina(p.percorso, p.titolo)) + '<small>' + esc(p.percorso) + ' · ' + new Date(p.ts * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) +
            (p.ts > t0 ? ' (+' + dur(p.ts - t0) + ')' : '') + '</small></li>';
        }).join('') + '</ol>';
      if (d.visite_precedenti.length) {
        html += '<h3 style="margin-top:8px">Visite precedenti</h3><div class="rank">' + d.visite_precedenti.map(function (v) {
          return '<div class="rk nolink"><span class="lb">' + new Date(v.inizio * 1000).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) +
            '<small>' + esc(v.sorgente || '') + ' · ' + esc(v.ingresso) + '</small></span><b>' + n(v.pagine) + ' pag.</b></div>';
        }).join('') + '</div>';
      }
      if (modalAperto) $('#modal-body').innerHTML = html;
    });
  }
  function apriModal(html) { $('#modal-body').innerHTML = html; $('#modal').hidden = false; modalAperto = true; }
  function chiudiModal() { $('#modal').hidden = true; modalAperto = false; }
  $('#modal-x').addEventListener('click', chiudiModal);
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') chiudiModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiModal(); });

  /* ---------------- classifiche ---------------- */
  function classifica(el, righe, onClick, opz) {
    opz = opz || {};
    if (!righe.length) { el.innerHTML = '<div class="empty">Nessun dato</div>'; return; }
    var max = Math.max.apply(null, righe.map(function (r) { return +r.n; })) || 1;
    el.innerHTML = righe.map(function (r, i) {
      return '<div class="rk' + (onClick ? '' : ' nolink') + '" data-i="' + i + '" title="' + esc(r.title || r.k || '') + '">' +
        '<span class="bar" style="width:' + (100 * r.n / max).toFixed(1) + '%"></span>' +
        '<span class="lb">' + esc(r.lb || '—') + (r.sub ? '<small>' + esc(r.sub) + '</small>' : '') + '</span>' +
        (r.u != null && opz.u ? '<span class="u">' + n(r.u) + '</span>' : '') + '<b>' + n(r.n) + '</b></div>';
    }).join('');
    if (onClick) $$('.rk', el).forEach(function (row) { row.addEventListener('click', function () { onClick(righe[+row.dataset.i]); }); });
  }

  /* ---------------- STORICO ---------------- */
  var S = store.get('storico', { p: '30', da: '', a: '', f: {}, m: 'visitatori' });
  S.f = S.f || {};
  var storicoCaricato = false, grafico = null, datiSto = null;
  var ETICHETTE = { paese: 'Paese', canale: 'Canale', sorgente: 'Sorgente', dispositivo: 'Dispositivo', tipo: 'Tipo', citta: 'Città', pagina: 'Pagina vista', ingresso: 'Ingresso', browser: 'Browser', so: 'Sistema', lingua: 'Lingua' };
  var CANALI = ['Ricerca', 'AI', 'Social', 'Diretto', 'Altri siti', 'Email', 'Pubblicità', 'Campagne'];
  CANALI.forEach(function (c) { var o = document.createElement('option'); o.value = o.textContent = c; $('#f-canale').appendChild(o); });

  function oggiStr(off) { var d = new Date(); d.setDate(d.getDate() - (off || 0)); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function intervallo() {
    if (S.p === 'oggi') return [oggiStr(0), oggiStr(0)];
    if (S.p === 'ieri') return [oggiStr(1), oggiStr(1)];
    if (S.p === 'custom' && S.da && S.a) return [S.da, S.a];
    var g = +S.p || 30; return [oggiStr(g - 1), oggiStr(0)];
  }
  function query() {
    var r = intervallo(), q = 'da=' + r[0] + '&a_=' + r[1];
    Object.keys(S.f).forEach(function (k) { if (S.f[k] !== '' && S.f[k] != null) q += '&' + k + '=' + encodeURIComponent(S.f[k]); });
    return q;
  }
  function setFiltro(k, v) {
    if (v === '' || v == null) delete S.f[k]; else S.f[k] = v;
    caricaStorico();
    if (window.scrollY > 200) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $$('#periodi button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.p === 'custom') { $('#custom').hidden = false; var r = intervallo(); $('#f-da').value = r[0]; $('#f-a').value = r[1]; return; }
      S.p = b.dataset.p; $('#custom').hidden = true; caricaStorico();
    });
  });
  $('#f-applica').addEventListener('click', function () { if ($('#f-da').value && $('#f-a').value) { S.p = 'custom'; S.da = $('#f-da').value; S.a = $('#f-a').value; caricaStorico(); } });
  ['paese', 'canale', 'dispositivo', 'tipo'].forEach(function (k) { $('#f-' + k).addEventListener('change', function (e) { setFiltro(k, e.target.value); }); });
  $$('#metrica button').forEach(function (b) { b.addEventListener('click', function () { S.m = b.dataset.m; store.set('storico', S); disegnaGrafico(); }); });

  function caricaStorico() {
    storicoCaricato = true; store.set('storico', S);
    $$('#periodi button').forEach(function (b) { b.classList.toggle('on', b.dataset.p === S.p); });
    ['paese', 'canale', 'dispositivo', 'tipo'].forEach(function (k) { $('#f-' + k).value = S.f[k] || ''; });
    $('#csv').href = PDADM.link('a=csv&' + query());
    $('#kpis').style.opacity = .5;
    return api('a=storico&' + query()).then(function (d) {
      datiSto = d; $('#kpis').style.opacity = 1;
      disegnaStorico(d);
    });
  }

  function chips() {
    var el = $('#chips'), extra = Object.keys(S.f).filter(function (k) { return ['paese', 'canale', 'dispositivo', 'tipo'].indexOf(k) < 0; });
    el.innerHTML = extra.map(function (k) { return '<span class="chip">' + ETICHETTE[k] + ': <b>' + esc(S.f[k]) + '</b><button data-k="' + k + '" aria-label="Togli filtro">×</button></span>'; }).join('') +
      (Object.keys(S.f).length ? '<button class="ghost" id="azzera" style="padding:3px 10px;font-size:12px">Togli tutti i filtri</button>' : '');
    $$('button[data-k]', el).forEach(function (b) { b.addEventListener('click', function () { setFiltro(b.dataset.k, ''); }); });
    var az = $('#azzera'); if (az) az.addEventListener('click', function () { S.f = {}; caricaStorico(); });
  }

  function delta(cur, prev, meglioBasso) {
    if (!prev) return cur ? '<em>nuovo</em>' : '<em>—</em>';
    var p = (cur - prev) / prev * 100;
    if (Math.abs(p) < 0.5) return '<em>= periodo prec.</em>';
    var buono = meglioBasso ? p < 0 : p > 0;
    return '<em class="' + (buono ? 'up' : 'down') + '">' + (p > 0 ? '▲ +' : '▼ ') + Math.round(p) + '%</em>';
  }

  function disegnaStorico(d) {
    chips();
    var k = d.kpi, p = d.prec;
    var tiles = [
      ['Visitatori unici', n(k.visitatori), delta(k.visitatori, p.visitatori)],
      ['Nuovi', n(k.nuovi), delta(k.nuovi, p.nuovi)],
      ['Di ritorno', n(k.ritorno), delta(k.ritorno, p.ritorno)],
      ['Visite', n(k.sessioni), delta(k.sessioni, p.sessioni)],
      ['Pagine viste', n(k.pagine), delta(k.pagine, p.pagine)],
      ['Pagine per visita', String(k.pagine_sessione).replace('.', ','), delta(k.pagine_sessione, p.pagine_sessione)],
      ['Durata media', dur(k.durata), delta(k.durata, p.durata)],
      ['Rimbalzo', String(k.rimbalzo).replace('.', ',') + '%', delta(k.rimbalzo, p.rimbalzo, true)]
    ];
    $('#kpis').innerHTML = tiles.map(function (t) { return '<div class="kpi"><span>' + t[0] + '</span><b>' + t[1] + '</b>' + t[2] + '</div>'; }).join('');
    var f = function (s) { var x = s.split('-'); return x[2] + '/' + x[1] + '/' + x[0]; };
    $('#chart-title').textContent = 'Andamento · ' + (d.da === d.a ? f(d.da) : f(d.da) + ' – ' + f(d.a)) + ' (confronto con ' + f(d.prec_da) + ' – ' + f(d.prec_a) + ')';

    disegnaGrafico();

    // paesi: riempie anche il menu
    var sel = $('#f-paese'), att = S.f.paese || '';
    var noti = {}; $$('option', sel).forEach(function (o) { if (o.value) noti[o.value] = o.textContent; });
    d.paesi.forEach(function (r) { if (r.k) noti[r.k] = flag(r.k) + ' ' + (r.paese || r.k); });
    sel.innerHTML = '<option value="">Tutti i paesi</option>' + Object.keys(noti).sort(function (a, b) { return noti[a].slice(3).localeCompare(noti[b].slice(3)); })
      .map(function (c) { return '<option value="' + esc(c) + '">' + esc(noti[c]) + '</option>'; }).join('');
    sel.value = att;

    classifica($('#t-paesi'), d.paesi.map(function (r) { return { k: r.k, lb: flag(r.k) + ' ' + (r.paese || 'Sconosciuto'), n: r.n, u: r.u }; }), function (r) { if (r.k) setFiltro('paese', r.k); });
    classifica($('#t-pagine'), d.pagine.map(function (r) { return { k: r.k, lb: nomePagina(r.k, r.titolo), sub: r.k, n: r.n }; }), function (r) { setFiltro('pagina', r.k); });
    classifica($('#t-ingressi'), d.ingressi.map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), function (r) { setFiltro('ingresso', r.k); });
    classifica($('#t-citta'), d.citta.map(function (r) { return { k: r.k, lb: r.k || 'Sconosciuta', sub: r.paese, n: r.n }; }), function (r) { if (r.k) setFiltro('citta', r.k); });
    classifica($('#t-canali'), d.canali.map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), function (r) { setFiltro('canale', r.k); });
    classifica($('#t-sorgenti'), d.sorgenti.map(function (r) { return { k: r.k, lb: r.k, sub: r.canale, n: r.n }; }), function (r) { setFiltro('sorgente', r.k); });
    classifica($('#t-dispositivi'), d.dispositivi.map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), function (r) { setFiltro('dispositivo', r.k); });
    classifica($('#t-so'), d.so.map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), function (r) { setFiltro('so', r.k); });
    classifica($('#t-browser'), d.browser.map(function (r) { return { k: r.k, lb: r.k, n: r.n }; }), function (r) { setFiltro('browser', r.k); });
    var LN = new Intl.DisplayNames(['it'], { type: 'language' });
    classifica($('#t-lingue'), d.lingue.map(function (r) { var nm = r.k; try { nm = r.k ? LN.of(r.k) : 'Sconosciuta'; } catch (e) {} return { k: r.k, lb: nm, n: r.n }; }), function (r) { if (r.k) setFiltro('lingua', r.k); });

    // mappa storico
    if (!mapSto) { mapSto = nuovaMappa('map-storico'); livelloSto = L.layerGroup().addTo(mapSto); }
    livelloSto.clearLayers();
    var maxM = Math.max.apply(null, d.mappa.map(function (r) { return +r.n; }).concat([1]));
    var pts = [];
    d.mappa.forEach(function (r) {
      var rad = 4 + 18 * Math.sqrt(r.n / maxM);
      L.circleMarker([r.lat, r.lon], { radius: rad, color: '#070d19', weight: 2, fillColor: C.s1, fillOpacity: .65 })
        .bindTooltip('<b>' + esc((r.citta || '?') + ', ' + (r.paese || r.cc)) + '</b><br>' + n(r.n) + ' visite · ' + n(r.u) + ' visitatori', { direction: 'top' })
        .on('click', function () { if (r.citta) setFiltro('citta', r.citta); })
        .addTo(livelloSto);
      pts.push([r.lat, r.lon]);
    });
    setTimeout(function () {
      mapSto.invalidateSize();
      if (pts.length > 1) mapSto.fitBounds(pts, { padding: [30, 30], maxZoom: 6 }); else if (pts.length) mapSto.setView(pts[0], 6);
    }, 60);

    // giorni e orari
    var G = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'], M = {}, mx = 1;
    d.orari.forEach(function (r) { M[r.d + '-' + r.h] = +r.n; mx = Math.max(mx, +r.n); });
    var ramp = ['#17223a', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#86b6ef'];
    var hh = '<span></span>';
    for (var h = 0; h < 24; h++) hh += '<span class="hl">' + (h % 3 === 0 ? h : '') + '</span>';
    for (var g = 1; g <= 7; g++) {
      hh += '<span class="dl">' + G[g - 1] + '</span>';
      for (h = 0; h < 24; h++) {
        var v = M[g + '-' + h] || 0, i = v ? Math.min(ramp.length - 1, 1 + Math.floor((ramp.length - 2) * v / mx)) : 0;
        hh += '<span class="c" style="background:' + ramp[i] + '" title="' + G[g - 1] + ' ' + h + ':00–' + h + ':59 · ' + v + ' visite"></span>';
      }
    }
    $('#heat').innerHTML = hh;

    // ultime visite
    var t = $('#t-ultime');
    t.innerHTML = '<thead><tr><th>Quando</th><th>Luogo</th><th>Tipo</th><th>Arrivato da</th><th>Ingresso</th><th class="num">Pagine</th><th class="num">Durata</th><th>Dispositivo</th></tr></thead><tbody>' +
      (d.ultime.length ? d.ultime.map(function (x, i) {
        return '<tr data-i="' + i + '"><td>' + new Date(x.inizio * 1000).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</td>' +
          '<td>' + flag(x.cc) + ' ' + esc(luogo(x)) + '</td><td>' + (+x.ritorno ? '<span class="tag r">' + (x.n_visita > 1 ? x.n_visita + 'ª visita' : 'Ritorno') + '</span>' : '<span class="tag n">Nuovo</span>') + '</td>' +
          '<td>' + esc(x.sorgente) + '</td><td title="' + esc(x.ingresso) + '">' + esc(x.ingresso) + '</td><td class="num">' + n(x.pagine) + '</td><td class="num">' + dur(x.ultimo - x.inizio) + '</td><td>' + esc(x.dispositivo) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="empty">Nessuna visita in questo periodo</td></tr>') + '</tbody>';
    $$('tbody tr[data-i]', t).forEach(function (tr) {
      tr.addEventListener('click', function () { var x = d.ultime[+tr.dataset.i]; x.durata = x.ultimo - x.inizio; apriPercorso(x); });
    });
  }

  function etichetta(k, unita) {
    if (unita === 'ora') return String(k).padStart(2, '0') + ':00';
    if (unita === 'mese') { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }); }
    var q = k.split('-'); return q[2] + '/' + q[1];
  }
  function disegnaGrafico() {
    if (!datiSto) return;
    var d = datiSto, m = S.m;
    $$('#metrica button').forEach(function (b) { b.classList.toggle('on', b.dataset.m === m); });
    var lab = d.serie.map(function (x) { return etichetta(x.k, d.unita); });
    var nomi = { visitatori: 'Visitatori', sessioni: 'Visite', pagine: 'Pagine viste' };
    var ds, tipo;
    if (m === 'nuovi') {
      tipo = 'bar';
      ds = [
        { label: 'Nuovi', data: d.serie.map(function (x) { return x.nuovi; }), backgroundColor: C.s1, borderRadius: 4, borderSkipped: 'bottom', stack: 'v', borderColor: '#111a2c', borderWidth: { top: 2 } },
        { label: 'Di ritorno', data: d.serie.map(function (x) { return Math.max(0, x.visitatori - x.nuovi); }), backgroundColor: C.s2, borderRadius: 4, borderSkipped: 'bottom', stack: 'v', borderColor: '#111a2c', borderWidth: { top: 2 } }
      ];
      $('#chart-legend').innerHTML = '<span><i style="background:' + C.s1 + ';height:10px;width:10px;border-radius:3px"></i>Nuovi</span><span><i style="background:' + C.s2 + ';height:10px;width:10px;border-radius:3px"></i>Di ritorno</span>';
    } else {
      tipo = 'line';
      ds = [{ label: nomi[m], data: d.serie.map(function (x) { return x[m]; }), borderColor: C.s1, backgroundColor: 'rgba(57,135,229,.12)', fill: true, borderWidth: 2, tension: .3,
        pointRadius: d.serie.length > 45 ? 0 : 3, pointHoverRadius: 5, pointBackgroundColor: C.s1 }];
      $('#chart-legend').innerHTML = '';
    }
    if (grafico) grafico.destroy();
    grafico = new Chart($('#chart'), {
      type: tipo, data: { labels: lab, datasets: ds },
      options: {
        maintainAspectRatio: false, animation: { duration: 250 }, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#162238', borderColor: '#2c3c5a', borderWidth: 1, titleColor: '#eef1f6', bodyColor: '#b6c0d2', padding: 10,
          callbacks: { label: function (c) { return ' ' + c.dataset.label + ': ' + n(c.parsed.y); } } } },
        scales: {
          x: { stacked: tipo === 'bar', grid: { display: false }, ticks: { color: C.muted, maxRotation: 0, autoSkipPadding: 14 }, border: { color: C.line } },
          y: { stacked: tipo === 'bar', beginAtZero: true, grid: { color: '#1b273d' }, border: { display: false }, ticks: { color: C.muted, precision: 0, callback: function (v) { return n(v); } } }
        }
      }
    });
  }

  /* ---------------- impostazioni ---------------- */
  $('#btn-impostazioni').addEventListener('click', apriImpostazioni);
  function apriImpostazioni() {
    var ip = ultimoLive ? ultimoLive.tuo_ip : '';
    apriModal('<h2>Impostazioni</h2>' +
      '<p class="small">I dati stanno nel database Supabase del progetto Pandoora. La password di questa pagina si cambia in Supabase → Edge Functions → Secrets → <code>ADMIN_PASSWORD</code>.</p>' +
      '<h3 style="margin-top:20px">Non contare le vostre visite</h3>' +
      '<p class="small">Da ogni computer o telefono vostro aprite una volta <a href="https://pandooragroup.it/?pdlive=no" target="_blank" rel="noopener">pandooragroup.it/?pdlive=no</a>: quel browser non verrà più contato (per annullare: <code>?pdlive=si</code>).</p>' +
      (ip ? '<p class="small muted">Il vostro indirizzo IP attuale: <code>' + esc(ip) + '</code></p>' : ''));
  }
  function apriImpostazioniAruba() {
    apriModal('<h2>Impostazioni</h2><p class="muted small">Controllo dell\'hosting in corso…</p>');
    fetch('geo.php?a=stato', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      var ip = ultimoLive ? ultimoLive.tuo_ip : '';
      var h = '<h2>Impostazioni</h2>' +
        '<h3 style="margin-top:14px">Controllo hosting</h3><div class="chk">' + d.controlli.map(function (c) {
          return '<span class="' + (c[1] ? 'ok' : 'no') + '">' + (c[1] ? '✓' : '✕') + '</span><span>' + esc(c[0]) + '</span><span class="muted">' + esc(c[2]) + '</span>';
        }).join('') + '</div>' +
        '<h3 style="margin-top:18px">Database delle posizioni (città dall\'IP)</h3>' +
        (d.geo ? '<p>Installato il <b>' + d.geo.data + '</b> (' + d.geo.mb + ' MB). DB-IP lo aggiorna ogni mese: conviene riscaricarlo ogni 2–3 mesi.</p>'
               : '<p>Non ancora installato: senza questo i visitatori vengono contati ma non compaiono sulla mappa.</p>') +
        '<button class="btn" id="geo-scarica">' + (d.geo ? 'Aggiorna ora' : 'Scarica e installa (circa 1 minuto)') + '</button> ' +
        (d.file_caricati.length ? '<button class="btn" id="geo-installa" style="background:#199e70">Installa il file caricato (' + esc(d.file_caricati[0]) + ')</button>' : '') +
        '<div id="geo-msg" class="note" hidden></div>' +
        '<details style="margin-top:10px"><summary class="muted small" style="cursor:pointer">Se il download automatico non funziona</summary><p class="small">Scaricate dal vostro computer il file <b>IP to City Lite</b> in formato <b>MMDB</b> da ' +
        '<a href="https://db-ip.com/db/download/ip-to-city-lite" target="_blank" rel="noopener">db-ip.com</a>, caricatelo così com\'è (anche .gz) nella cartella <code>live/dati/</code> dell\'hosting e riaprite questa finestra: comparirà il pulsante «Installa il file caricato».</p></details>' +
        '<h3 style="margin-top:20px">Non contare le vostre visite</h3>' +
        '<p class="small">Da ogni computer o telefono vostro aprite una volta <a href="https://pandooragroup.it/?pdlive=no" target="_blank" rel="noopener">pandooragroup.it/?pdlive=no</a>: quel browser non verrà più contato (per annullare: <code>?pdlive=si</code>).</p>' +
        (ip ? '<p class="small">In alternativa, per escludere tutta la rete dell\'ufficio, scrivete questo indirizzo in <code>escludi_ip</code> dentro <code>config.php</code>: <code>' + esc(ip) + '</code></p>' : '');
      $('#modal-body').innerHTML = h;
      var msg = $('#geo-msg');
      var passo = function (url, testo) { msg.hidden = false; msg.textContent = testo; return fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.json(); }); };
      var installa = function () {
        return passo('geo.php?a=installa', 'Installazione…').then(function (r) {
          if (!r.ok) throw new Error(r.errore);
          msg.innerHTML = '✓ Fatto: database installato (' + r.mb + ' MB). Le nuove visite compariranno sulla mappa.';
          var b = $('#banner-geo'); if (b) b.remove();
        });
      };
      var bs = $('#geo-scarica');
      bs.addEventListener('click', function () {
        bs.disabled = true;
        passo('geo.php?a=scarica', 'Download in corso dal sito DB-IP… (può richiedere un minuto)').then(function (r) {
          if (!r.ok) throw new Error(r.errore || 'download non riuscito');
          return installa();
        }).catch(function (e) { msg.innerHTML = '✕ ' + esc(e.message) + '<br>Usate il metodo manuale qui sotto.'; $('details', $('#modal-body')).open = true; }).then(function () { bs.disabled = false; });
      });
      var bi = $('#geo-installa');
      if (bi) bi.addEventListener('click', function () { bi.disabled = true; installa().catch(function (e) { msg.textContent = '✕ ' + e.message; }).then(function () { bi.disabled = false; }); });
    });
  }

  /* ---------------- avvio ---------------- */
  mostra(schedaAttiva);
  setInterval(function () { if (schedaAttiva === 'live' && !document.hidden) caricaLive(); }, 5000);
  setInterval(function () { if (schedaAttiva === 'storico' && !document.hidden && S.p === 'oggi') caricaStorico(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && schedaAttiva === 'live') caricaLive(); });
})();
