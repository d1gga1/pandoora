/* PAN.DOOR.A — dashboard: ordini, clienti e iscritti newsletter dello shop */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  var eur = function (x) { return EUR.format(+x || 0); };
  var NF = new Intl.NumberFormat('it-IT');
  var dt = function (t, conOra) { if (!t) return '—'; var d = new Date(t * 1000); return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) + (conOra ? ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''); };
  var fa = function (t) { if (!t) return 'mai'; var s = Date.now() / 1000 - t; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min fa'; if (s < 86400) return Math.round(s / 3600) + ' ore fa'; if (s < 86400 * 30) return Math.round(s / 86400) + ' giorni fa'; return dt(t); };
  var STATI = { ricevuto: 'Ricevuto', confermato: 'Confermato', produzione: 'In produzione', spedito: 'Spedito', consegnato: 'Consegnato', annullato: 'Annullato' };
  var badge = function (s) { return '<span class="st st-' + esc(s) + '">' + esc(STATI[s] || s) + '</span>'; };
  var tel = function (t) { return String(t || '').replace(/[^\d+]/g, ''); };
  var wa = function (t) { var n = tel(t).replace(/^\+/, ''); if (n.length === 10 && n[0] === '3') n = '39' + n; return 'https://wa.me/' + n; };

  function api(a, q, corpo) {
    var opt = { cache: 'no-store', headers: PDADM.headers() };
    if (corpo) { opt.method = 'POST'; opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(corpo); }
    return fetch(PDADM.url('a=' + a + (q ? '&' + q : '')), opt).then(function (r) { if (r.status === 401) { PDADM.esci(); throw new Error('accesso'); } return r.json(); });
  }
  function qs(o) { return Object.keys(o).filter(function (k) { return o[k] !== '' && o[k] != null; }).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&'); }
  function modal(html) { $('#modal-body').innerHTML = html; $('#modal').hidden = false; $('#modal .modal-box').scrollTop = 0; return $('#modal-body'); }
  function nonPronto(el, r) {
    el.innerHTML = '<div class="card note"><b>Area clienti non ancora attiva.</b><br>' + esc(r.messaggio || 'Caricate la cartella "clienti" sull\'hosting e inserite la password del database in clienti/config.php.') + '</div>';
  }

  /* prodotti dello shop (nomi e foto per preferiti e carrelli) */
  var PROD = null;
  function prodotti() {
    if (PROD) return Promise.resolve(PROD);
    return fetch('https://pandooragroup.it/shop/data/products.json').then(function (r) { return r.json(); }).then(function (j) { PROD = {}; (j.products || []).forEach(function (p) { PROD[p.id] = p; }); return PROD; }).catch(function () { PROD = {}; return PROD; });
  }
  function img(src) { if (!src) return ''; if (src.indexOf('/') === 0) src = 'https://pandooragroup.it' + src; return '<img class="thumb" src="' + esc(src) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">'; }

  /* ---------------- riepilogo in alto ---------------- */
  function riepilogo(el) {
    return api('c_riepilogo').then(function (r) {
      if (!r.ok) { nonPronto(el, r); return null; }
      if (r.stati_nomi) STATI = r.stati_nomi;
      var da = (r.stati.ricevuto || {}).n || 0;
      segnaNuovi(da);
      el.innerHTML = [
        ['Da gestire', NF.format(da), da ? 'richieste nuove' : 'tutto in ordine', da ? 'hot' : ''],
        ['Ordini 30 giorni', NF.format(r.ordini_30), eur(r.valore_30) + ' indicativi'],
        ['Clienti registrati', NF.format(r.clienti), '+' + r.clienti_30 + ' negli ultimi 30 giorni'],
        ['Iscritti newsletter', NF.format(r.iscritti), '+' + r.iscritti_30 + ' negli ultimi 30 giorni'],
        ['Carrelli aperti', NF.format(r.carrelli_aperti), 'clienti con prodotti nel carrello']
      ].map(function (k) { return '<div class="kpi ' + (k[3] || '') + '"><span>' + k[0] + '</span><b>' + k[1] + '</b><em>' + k[2] + '</em></div>'; }).join('');
      return r;
    });
  }

  /* ---------------- ORDINI ---------------- */
  var FO = { stato: '', q: '' };
  function initOrdini() {
    var s = $('#tab-ordini');
    s.innerHTML = '<div class="kpis k5" id="o-kpi"></div><div class="card filters"><div class="seg" id="o-stati"></div><div class="sel"><input type="search" id="o-q" placeholder="Cerca numero, nome, email, prodotto…"><a class="ghost" href="' + PDADM.link('a=c_csv&tipo=ordini') + '">Scarica CSV</a></div></div>'
      + '<div class="card"><div class="table-wrap tall"><table class="tbl" id="o-tab"></table></div></div>';
    var t; $('#o-q').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { FO.q = e.target.value.trim(); caricaOrdini(); }, 300); });
    caricaOrdini();
  }
  function caricaOrdini() {
    riepilogo($('#o-kpi')).then(function (r) {
      if (!r) { $('#o-tab').innerHTML = ''; return; }
      var tot = Object.keys(r.stati).reduce(function (a, k) { return a + r.stati[k].n; }, 0);
      $('#o-stati').innerHTML = '<button data-s=""' + (FO.stato === '' ? ' class="on"' : '') + '>Tutti <i>' + tot + '</i></button>' + Object.keys(STATI).map(function (k) {
        return '<button data-s="' + k + '"' + (FO.stato === k ? ' class="on"' : '') + '>' + esc(STATI[k]) + ' <i>' + ((r.stati[k] || {}).n || 0) + '</i></button>'; }).join('');
      $$('#o-stati button').forEach(function (b) { b.onclick = function () { FO.stato = b.dataset.s; caricaOrdini(); }; });
      return api('c_ordini', qs(FO)).then(function (d) {
        var tb = $('#o-tab');
        tb.innerHTML = '<thead><tr><th>Ordine</th><th>Data</th><th>Cliente</th><th>Consegna</th><th>Prodotti</th><th class="num">Totale</th><th>Stato</th></tr></thead><tbody>'
          + (d.ordini.length ? d.ordini.map(function (o, i) {
            return '<tr data-i="' + i + '"><td><b>' + esc(o.numero) + '</b></td><td>' + dt(o.creato, true) + '</td><td><b>' + esc(o.nome + ' ' + o.cognome) + '</b>' + (o.azienda ? '<br><small>' + esc(o.azienda) + '</small>' : '') + '<br><small class="muted">' + esc(o.email) + (o.cliente_id ? '' : ' · ospite') + '</small></td>'
              + '<td>' + esc(o.luogo || '—') + '</td><td class="wrap" title="' + esc(o.prodotti) + '">' + esc(o.prodotti) + '</td><td class="num"><b>' + eur(o.totale) + '</b></td><td>' + badge(o.stato) + '</td></tr>';
          }).join('') : '<tr><td colspan="7" class="empty">Nessun ordine' + (FO.stato || FO.q ? ' con questi filtri' : ' per ora: arriveranno qui le richieste inviate dal carrello dello shop') + '.</td></tr>') + '</tbody>';
        $$('tbody tr[data-i]', tb).forEach(function (tr) { tr.onclick = function () { apriOrdine(d.ordini[+tr.dataset.i].id); }; });
      });
    });
  }
  function apriOrdine(id) {
    var b = modal('<p class="muted">Caricamento…</p>');
    api('c_ordine', 'id=' + id).then(function (r) {
      var o = r.ordine, i = o.indirizzo;
      b.innerHTML = '<div class="m-head"><h2>' + esc(o.numero) + '</h2>' + badge(o.stato) + '</div><div class="muted small">Ricevuto il ' + dt(o.creato, true) + (o.pagina ? ' · dalla pagina ' + esc(o.pagina) : '') + '</div>'
        + '<div class="m-grid"><div><h3>Cliente ' + (o.cliente_id ? '<button class="link" data-cli="' + o.cliente_id + '">apri scheda</button>' : '<span class="muted">(ospite)</span>') + '</h3><p><b>' + esc(o.nome + ' ' + o.cognome) + '</b>' + (o.azienda ? '<br>' + esc(o.azienda) : '')
        + (o.piva ? '<br>P.IVA ' + esc(o.piva) : '') + (o.cf ? '<br>C.F. ' + esc(o.cf) : '') + (o.sdi ? '<br>SDI ' + esc(o.sdi) : '') + (o.pec ? '<br>PEC ' + esc(o.pec) : '') + '</p>'
        + '<div class="acts"><a class="ghost" href="mailto:' + esc(o.email) + '?subject=' + encodeURIComponent('Ordine ' + o.numero) + '">' + esc(o.email) + '</a>' + (o.telefono ? '<a class="ghost" href="tel:' + esc(tel(o.telefono)) + '">' + esc(o.telefono) + '</a><a class="ghost" target="_blank" rel="noopener" href="' + wa(o.telefono) + '">WhatsApp</a>' : '') + '</div>'
        + (r.altri ? '<p class="muted small">Altri ' + r.altri + ' ordini con questa email.</p>' : '') + '</div>'
        + '<div><h3>Consegna</h3><p>' + (i ? esc(i.nome || '') + (i.azienda ? '<br>' + esc(i.azienda) : '') + '<br>' + esc(i.via || '') + '<br>' + esc((i.cap || '') + ' ' + (i.citta || '')) + (i.provincia ? ' (' + esc(i.provincia) + ')' : '') + '<br>' + esc(i.paese || '') + (i.telefono ? '<br>Tel. ' + esc(i.telefono) : '') + (i.note ? '<br><i>' + esc(i.note) + '</i>' : '') : '<span class="muted">Non indicata</span>') + '</p></div></div>'
        + '<h3>Prodotti</h3><div class="lines">' + o.righe.map(function (l) { return '<div class="line">' + img(l.img && l.img.indexOf('data:') !== 0 ? l.img : l.remote || l.img) + '<div><b>' + l.qty + ' × ' + esc(l.name) + '</b><small>' + esc(l.sum) + (l.perc ? ' · −' + l.perc + '% ' + esc(l.why) : '') + (l.iva === 'escl' ? ' · IVA esclusa' : '') + ' · ' + eur(l.unit) + ' cad.</small></div><b>' + eur(l.gross - l.amount) + '</b></div>'; }).join('') + '</div>'
        + '<div class="tots"><span>Subtotale ' + eur(o.subtotale) + '</span>' + (+o.sconto ? '<span>Sconti −' + eur(o.sconto) + (o.codice ? ' (' + esc(o.codice) + ')' : '') + '</span>' : '') + '<b>Totale indicativo ' + eur(o.totale) + '</b></div>'
        + (o.note ? '<h3>Note del cliente</h3><p class="quote">' + esc(o.note) + '</p>' : '')
        + '<h3>Storico</h3><ul class="hist">' + r.storia.map(function (s) { return '<li><span class="muted">' + dt(s.ts, true) + '</span> ' + badge(s.stato) + (s.chi === 'interno' ? ' <span class="muted">(nota interna)</span>' : '') + (s.nota ? '<br>' + esc(s.nota) : '') + '</li>'; }).join('') + '</ul>'
        + '<form class="card m-form" id="o-form"><h3>Aggiorna</h3><label>Stato <select name="stato">' + Object.keys(STATI).map(function (k) { return '<option value="' + k + '"' + (k === o.stato ? ' selected' : '') + '>' + esc(STATI[k]) + '</option>'; }).join('') + '</select></label>'
        + '<label>Messaggio per il cliente (facoltativo)<textarea name="nota" rows="2" placeholder="es. Consegna prevista per martedì 20 ottobre"></textarea></label>'
        + '<label class="chk"><input type="checkbox" name="avvisa" checked> Avvisa il cliente via email</label><label class="chk"><input type="checkbox" name="interna"> È una nota interna: il cliente non la vede</label>'
        + '<label>Note interne<textarea name="note_admin" rows="2">' + esc(o.note_admin || '') + '</textarea></label><div class="acts"><button class="btn" type="submit">Salva</button><span id="o-msg" class="muted small"></span></div></form>';
      var cb = $('[data-cli]', b); if (cb) cb.onclick = function () { apriCliente(+cb.dataset.cli); };
      var f = $('#o-form', b), int = f.interna, av = f.avvisa;
      int.onchange = function () { if (int.checked) av.checked = false; av.disabled = int.checked; };
      f.onsubmit = function (e) {
        e.preventDefault(); var bt = $('button', f); bt.disabled = true;
        api('c_ordine_salva', 'id=' + o.id, { stato: f.stato.value, nota: f.nota.value.trim(), avvisa: av.checked, interna: int.checked, note_admin: f.note_admin.value }).then(function (x) {
          bt.disabled = false; $('#o-msg').textContent = x.ok ? 'Salvato ✓' + (x.mail ? ' · email inviata al cliente' : '') : 'Errore';
          if (x.ok) { caricaOrdini(); setTimeout(function () { apriOrdine(o.id); }, 600); }
        });
      };
    });
  }

  /* ---------------- CLIENTI ---------------- */
  var FC = { q: '', tipo: '', con_ordini: '', carrello: '', newsletter: '' };
  function initClienti() {
    var s = $('#tab-clienti');
    s.innerHTML = '<div class="kpis k5" id="c-kpi"></div><div class="card filters"><div class="sel" style="margin-left:0"><input type="search" id="c-q" placeholder="Cerca nome, email, azienda, telefono, P.IVA…">'
      + '<select id="c-tipo"><option value="">Tutti i tipi</option><option value="privato">Privati</option><option value="azienda">Aziende</option><option value="professionista">Professionisti</option></select>'
      + '<label class="chk"><input type="checkbox" id="c-ord"> Con ordini</label><label class="chk"><input type="checkbox" id="c-car"> Con carrello pieno</label><label class="chk"><input type="checkbox" id="c-nl"> Iscritti newsletter</label>'
      + '<a class="ghost" href="' + PDADM.link('a=c_csv&tipo=clienti') + '">Scarica CSV</a></div></div><div class="card"><div class="table-wrap tall"><table class="tbl" id="c-tab"></table></div></div>';
    var t; $('#c-q').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { FC.q = e.target.value.trim(); caricaClienti(); }, 300); });
    $('#c-tipo').onchange = function (e) { FC.tipo = e.target.value; caricaClienti(); };
    [['#c-ord', 'con_ordini'], ['#c-car', 'carrello'], ['#c-nl', 'newsletter']].forEach(function (x) { $(x[0]).onchange = function (e) { FC[x[1]] = e.target.checked ? '1' : ''; caricaClienti(); }; });
    caricaClienti();
  }
  function caricaClienti() {
    riepilogo($('#c-kpi')).then(function (r) {
      if (!r) return;
      return api('c_clienti', qs(FC)).then(function (d) {
        var tb = $('#c-tab');
        tb.innerHTML = '<thead><tr><th>Cliente</th><th>Contatti</th><th>Tipo</th><th>Registrato</th><th>Ultimo accesso</th><th class="num">Ordini</th><th class="num">Valore</th><th class="num">Carrello</th><th class="num">Preferiti</th><th>News</th></tr></thead><tbody>'
          + (d.clienti.length ? d.clienti.map(function (c, i) {
            return '<tr data-i="' + i + '"><td><b>' + esc(c.nome + ' ' + c.cognome) + '</b>' + (c.azienda ? '<br><small>' + esc(c.azienda) + '</small>' : '') + (c.stato === 'bloccato' ? ' <span class="st st-annullato">Sospeso</span>' : '') + '</td>'
              + '<td><small>' + esc(c.email) + (+c.verificato ? ' ✓' : '') + '<br>' + esc(c.telefono || '') + '</small></td><td>' + esc(c.tipo || '') + '</td><td>' + dt(c.creato) + '</td><td>' + fa(c.ultimo_accesso) + '</td>'
              + '<td class="num">' + c.n_ordini + '</td><td class="num">' + (+c.valore ? eur(c.valore) : '—') + '</td><td class="num">' + (c.n_carrello ? '<b class="hot-t">' + c.n_carrello + '</b>' : '—') + '</td><td class="num">' + (c.n_preferiti || '—') + '</td><td>' + (+c.newsletter ? '✓' : '') + '</td></tr>';
          }).join('') : '<tr><td colspan="10" class="empty">Nessun cliente' + (FC.q ? ' trovato' : ' registrato per ora') + '.</td></tr>') + '</tbody>';
        $$('tbody tr[data-i]', tb).forEach(function (tr) { tr.onclick = function () { apriCliente(+d.clienti[+tr.dataset.i].id); }; });
      });
    });
  }
  function apriCliente(id) {
    var b = modal('<p class="muted">Caricamento…</p>');
    Promise.all([api('c_cliente', 'id=' + id), prodotti()]).then(function (x) {
      var r = x[0], P = x[1], c = r.cliente;
      var car = r.carrello || [], totCar = car.reduce(function (a, l) { return a + l.unit * l.qty; }, 0);
      b.innerHTML = '<div class="m-head"><h2>' + esc(c.nome + ' ' + c.cognome) + '</h2>' + (c.stato === 'bloccato' ? '<span class="st st-annullato">Sospeso</span>' : '') + '</div>'
        + '<div class="muted small">Cliente dal ' + dt(c.creato, true) + ' · ultimo accesso ' + fa(c.ultimo_accesso) + ' · ' + (c.accessi || 0) + ' accessi · email ' + (+c.verificato ? 'confermata' : 'non ancora confermata') + '</div>'
        + '<div class="acts" style="margin-top:12px"><a class="ghost" href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>' + (c.telefono ? '<a class="ghost" href="tel:' + esc(tel(c.telefono)) + '">' + esc(c.telefono) + '</a><a class="ghost" target="_blank" rel="noopener" href="' + wa(c.telefono) + '">WhatsApp</a>' : '') + '</div>'
        + '<div class="m-grid"><div><h3>Dati</h3><dl class="dl">' + [['Tipo', c.tipo], ['Azienda', c.azienda], ['P.IVA', c.piva], ['Codice fiscale', c.cf], ['SDI', c.sdi], ['PEC', c.pec], ['Privacy', c.privacy], ['Newsletter', +c.newsletter ? 'iscritto' + (r.iscritto ? ' dal ' + dt(r.iscritto.creato) : '') : 'no']]
          .filter(function (k) { return k[1]; }).map(function (k) { return '<dt>' + k[0] + '</dt><dd>' + esc(k[1]) + '</dd>'; }).join('') + '</dl></div>'
        + '<div><h3>Indirizzi</h3>' + (r.indirizzi.length ? r.indirizzi.map(function (i) { return '<p class="small">' + (i.predefinito ? '<b>Predefinito</b> · ' : '') + esc(i.etichetta || '') + '<br>' + esc(i.nome) + ', ' + esc(i.via) + ', ' + esc(i.cap + ' ' + i.citta) + (i.provincia ? ' (' + esc(i.provincia) + ')' : '') + ' — ' + esc(i.paese) + '</p>'; }).join('') : '<p class="muted small">Nessuno</p>') + '</div></div>'
        + '<h3>Carrello ' + (car.length ? '<span class="muted">· ' + car.reduce(function (a, l) { return a + l.qty; }, 0) + ' pezzi · ' + eur(totCar) + ' · aggiornato ' + fa(r.carrello_agg) + '</span>' : '') + '</h3>'
        + (car.length ? '<div class="lines">' + car.map(function (l) { return '<div class="line">' + img(l.img && l.img.indexOf('data:') !== 0 ? l.img : l.remote || l.img) + '<div><b>' + l.qty + ' × ' + esc(l.name) + '</b><small>' + esc(l.sum) + '</small></div><b>' + eur(l.unit * l.qty) + '</b></div>'; }).join('') + '</div>' : '<p class="muted small">Vuoto</p>')
        + '<h3>Preferiti</h3>' + (r.preferiti.length ? '<div class="favs">' + r.preferiti.map(function (f) { var p = P[f.prodotto]; return '<a class="fav" target="_blank" rel="noopener" href="https://pandooragroup.it/shop/' + esc(p ? p.cat + '/' + p.id : '') + '/">' + img(p && p.img) + '<span>' + esc(p ? p.name : f.prodotto) + '</span></a>'; }).join('') + '</div>' : '<p class="muted small">Nessuno</p>')
        + '<h3>Ordini</h3>' + (r.ordini.length ? '<table class="tbl"><tbody>' + r.ordini.map(function (o) { return '<tr data-o="' + o.id + '"><td><b>' + esc(o.numero) + '</b></td><td>' + dt(o.creato, true) + '</td><td>' + o.n_pezzi + (o.n_pezzi == 1 ? ' pezzo' : ' pezzi') + '</td><td class="num">' + eur(o.totale) + '</td><td>' + badge(o.stato) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="muted small">Nessuno</p>')
        + '<form class="card m-form" id="c-form"><h3>Gestione</h3><label>Note interne (le vedete solo voi)<textarea name="note_admin" rows="3">' + esc(c.note_admin || '') + '</textarea></label>'
        + '<label class="chk"><input type="checkbox" name="bloccato"' + (c.stato === 'bloccato' ? ' checked' : '') + '> Sospendi l\'account (non può più accedere)</label><div class="acts"><button class="btn" type="submit">Salva</button><span id="c-msg" class="muted small"></span></div></form>';
      $$('tr[data-o]', b).forEach(function (tr) { tr.onclick = function () { apriOrdine(+tr.dataset.o); }; });
      var f = $('#c-form', b);
      f.onsubmit = function (e) { e.preventDefault(); api('c_cliente_salva', 'id=' + c.id, { note_admin: f.note_admin.value, stato: f.bloccato.checked ? 'bloccato' : 'attivo' }).then(function (x) { $('#c-msg').textContent = x.ok ? 'Salvato ✓' : 'Errore'; caricaClienti(); }); };
    });
  }

  /* ---------------- NEWSLETTER ---------------- */
  var FN = { q: '', stato: 'attivi' };
  function initNewsletter() {
    var s = $('#tab-newsletter');
    s.innerHTML = '<div class="kpis k5" id="n-kpi"></div><div class="card filters"><div class="seg" id="n-st"><button data-s="attivi" class="on">Iscritti</button><button data-s="disiscritti">Disiscritti</button><button data-s="">Tutti</button></div>'
      + '<div class="sel"><input type="search" id="n-q" placeholder="Cerca nome, email, telefono, provincia…"><button class="ghost" id="n-imp" hidden>Importa iscritti dal vecchio file</button><a class="ghost" href="' + PDADM.link('a=c_csv&tipo=iscritti') + '">Scarica CSV</a></div></div>'
      + '<div class="card"><div class="table-wrap tall"><table class="tbl" id="n-tab"></table></div></div>';
    $$('#n-st button').forEach(function (b) { b.onclick = function () { FN.stato = b.dataset.s; $$('#n-st button').forEach(function (x) { x.classList.toggle('on', x === b); }); caricaNewsletter(); }; });
    var t; $('#n-q').addEventListener('input', function (e) { clearTimeout(t); t = setTimeout(function () { FN.q = e.target.value.trim(); caricaNewsletter(); }, 300); });
    $('#n-imp').onclick = function () { var b = this; b.disabled = true; api('c_importa_newsletter').then(function (r) { b.textContent = r.ok ? 'Importati ' + r.importati + ' iscritti ✓' : (r.errore || 'Errore'); caricaNewsletter(); }); };
    caricaNewsletter();
  }
  function caricaNewsletter() {
    riepilogo($('#n-kpi')).then(function (r) {
      if (!r) return;
      $('#n-imp').hidden = !r.csv_newsletter;
      return api('c_iscritti', qs(FN)).then(function (d) {
        var tb = $('#n-tab');
        tb.innerHTML = '<thead><tr><th>Iscritto il</th><th>Nome</th><th>Email</th><th>Telefono</th><th>Dove</th><th>Da</th><th>Stato</th></tr></thead><tbody>'
          + (d.iscritti.length ? d.iscritti.map(function (x) {
            return '<tr' + (x.cliente_id ? ' data-c="' + x.cliente_id + '"' : '') + '><td>' + dt(x.creato, true) + '</td><td><b>' + esc((x.nome || '') + ' ' + (x.cognome || '')) + '</b>' + (x.cliente_id ? ' <span class="st st-confermato">cliente</span>' : '') + '</td><td>' + esc(x.email) + '</td><td>' + esc(x.telefono || '') + '</td>'
              + '<td>' + esc([x.provincia, x.paese].filter(Boolean).join(', ')) + '</td><td class="wrap"><small>' + esc(x.origine || '') + (x.pagina ? ' · ' + esc(x.pagina) : '') + '</small></td><td>' + (+x.iscritto ? '<span class="st st-consegnato">Iscritto</span>' : '<span class="st st-annullato">Disiscritto ' + dt(x.disiscritto) + '</span>') + '</td></tr>';
          }).join('') : '<tr><td colspan="7" class="empty">Nessun iscritto' + (FN.q ? ' trovato' : '') + '.</td></tr>') + '</tbody>';
        $$('tbody tr[data-c]', tb).forEach(function (tr) { tr.onclick = function () { apriCliente(+tr.dataset.c); }; });
      });
    });
  }

  /* ---------------- avvio: carica la scheda quando viene aperta ---------------- */
  var fatto = {};
  function apri(t) {
    if (t === 'ordini') { if (!fatto.o) { fatto.o = 1; initOrdini(); } else caricaOrdini(); }
    if (t === 'clienti') { if (!fatto.c) { fatto.c = 1; initClienti(); } else caricaClienti(); }
    if (t === 'newsletter') { if (!fatto.n) { fatto.n = 1; initNewsletter(); } else caricaNewsletter(); }
  }
  document.addEventListener('pd-tab', function (e) { apri(e.detail); });
  var att = $('.tabs button.on'); if (att) apri(att.dataset.tab);
  // nuove richieste: il numero sulla scheda Ordini si aggiorna ogni minuto
  function segnaNuovi(n) {
    var b = $('.tabs [data-tab=ordini]'); if (!b) return;
    var i = $('i', b);
    if (!i) { i = document.createElement('i'); i.className = 'cnt'; b.appendChild(i); }
    i.textContent = n; i.hidden = !n;
  }
  function contatore() { api('c_riepilogo').then(function (r) { if (r.ok) segnaNuovi((r.stati.ricevuto || {}).n || 0); }).catch(function () {}); }
  contatore(); setInterval(function () { if (!document.hidden) contatore(); }, 60000);
})();
