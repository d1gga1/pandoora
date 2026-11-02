/* Pan.door.a — Google Ads: consenso cookie (Consent Mode v2) + misurazione conversioni.
   Finché il visitatore non accetta, Google non salva cookie (solo segnali anonimi senza cookie).
   Per riaprire la scelta dei cookie: link con href="#cookie" oppure window.pdCookie().
   Conversioni:
     Richiesta preventivo -> pagine di ringraziamento dei form (/grazie/, /en/thank-you/, ...)
                             e messaggio "Richiesta inviata" del form del listino
     Clic telefono        -> clic su link tel:
     Clic WhatsApp        -> clic su link wa.me / api.whatsapp.com */
(function () {
  if (window.__pdAds) return; window.__pdAds = 1;
  if (!/(^|\.)pandooragroup\.it$/.test(location.hostname)) return;   // niente tag in locale o in anteprima

  var ADS = 'AW-17515912171';
  var LABEL = {
    preventivo: 'ie3PCLWkv7AdEOu3nqBB',
    telefono:   'aCXlCJKlv7AdEOu3nqBB',
    whatsapp:   'oB9-CJWlv7AdEOu3nqBB'
  };
  var KEY = 'pd_consent', DURATA = 180 * 24 * 3600 * 1000;   // la scelta vale 6 mesi

  /* ── memoria della scelta ─────────────────────────────── */
  var leggi = function () {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (v.s === 'granted' || v.s === 'denied') && Date.now() - v.t < DURATA) return v.s;
    } catch (e) {}
    return null;
  };
  var salva = function (s) { try { localStorage.setItem(KEY, JSON.stringify({ s: s, t: Date.now() })); } catch (e) {} };

  /* ── Google tag con consenso negato di default ────────── */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  var scelta = leggi();
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
    wait_for_update: 500
  });
  if (scelta === 'granted') {
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
  }
  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);
  gtag('js', new Date());
  gtag('config', ADS);
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS;
  (document.head || document.documentElement).appendChild(s);

  var conv = function (label) { gtag('event', 'conversion', { send_to: ADS + '/' + label }); };

  /* ── conversione: preventivo ──────────────────────────── */
  var PAGINE_GRAZIE = /^\/(grazie|(en\/thank-you|de\/danke|fr\/merci|es\/gracias|el\/efcharistoume|hr\/hvala|pt\/obrigado|sl\/hvala|sq\/faleminderit|sr\/hvala|bg\/blagodarim|cs\/dekujeme|da\/tak|et\/aitah|fi\/kiitos|hu\/koszonjuk|lt\/aciu|lv\/paldies|nl\/bedankt|no\/takk|pl\/dziekujemy|ro\/multumim|sk\/dakujeme|sv\/tack|tr\/tesekkurler))\/?(index\.html)?$/;
  var fatto = false;
  var preventivo = function () { if (fatto) return; fatto = true; conv(LABEL.preventivo); };
  window.pandooraPreventivoInviato = preventivo;
  if (PAGINE_GRAZIE.test(location.pathname)) preventivo();

  /* ── conversioni: telefono e WhatsApp ─────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href === '#cookie') { e.preventDefault(); apri(); return; }
    if (/^tel:/i.test(href)) conv(LABEL.telefono);
    else if (/(^|\/\/)(wa\.me|api\.whatsapp\.com)\//i.test(href)) conv(LABEL.whatsapp);
  }, true);

  /* ── banner cookie ────────────────────────────────────── */
  var lang = (document.documentElement.lang || 'it').slice(0, 2).toLowerCase();
  var T = {
    it: ['Usiamo i cookie di Google Ads per misurare l’efficacia dei nostri annunci. Puoi accettarli o rifiutarli: il sito funziona comunque.', 'Accetta', 'Rifiuta', 'Privacy', '/privacy/'],
    en: ['We use Google Ads cookies to measure how well our ads work. You can accept or decline them: the site works either way.', 'Accept', 'Decline', 'Privacy', '/privacy/'],
    de: ['Wir verwenden Google-Ads-Cookies, um die Wirkung unserer Anzeigen zu messen. Sie können sie annehmen oder ablehnen: die Website funktioniert in beiden Fällen.', 'Akzeptieren', 'Ablehnen', 'Datenschutz', '/privacy/'],
    fr: ['Nous utilisons les cookies Google Ads pour mesurer l’efficacité de nos annonces. Vous pouvez les accepter ou les refuser : le site fonctionne dans les deux cas.', 'Accepter', 'Refuser', 'Confidentialité', '/privacy/'],
    es: ['Usamos cookies de Google Ads para medir la eficacia de nuestros anuncios. Puede aceptarlas o rechazarlas: el sitio funciona igualmente.', 'Aceptar', 'Rechazar', 'Privacidad', '/privacy/']
  };
  var t = T[lang] || T.en;

  var box = null;
  var chiudi = function () { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; };
  var decidi = function (ok) {
    salva(ok ? 'granted' : 'denied');
    gtag('consent', 'update', ok
      ? { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' }
      : { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    chiudi();
  };
  function apri() {
    if (box || !document.body) return;
    box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie');
    box.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:400px;' +
      'background:#040A14;color:#f3f4f6;border:1px solid rgba(255,255,255,.14);border-radius:12px;' +
      'padding:16px 18px;font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)';
    if (window.innerWidth < 520) box.style.cssText += ';left:12px;right:12px;bottom:12px;max-width:none';
    var bt = 'cursor:pointer;border-radius:8px;padding:9px 16px;font:600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
    box.innerHTML =
      '<p style="margin:0 0 12px">' + t[0] + ' <a href="' + t[4] + '" style="color:#9ec5ff;text-decoration:underline">' + t[3] + '</a></p>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button type="button" data-c="0" style="' + bt + 'background:transparent;color:#f3f4f6;border:1px solid rgba(255,255,255,.35)">' + t[2] + '</button>' +
      '<button type="button" data-c="1" style="' + bt + 'background:#f3f4f6;color:#040A14;border:1px solid #f3f4f6">' + t[1] + '</button>' +
      '</div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (b) decidi(b.getAttribute('data-c') === '1');
    });
    document.body.appendChild(box);
  }
  window.pdCookie = apri;

  var avvio = function () {
    if (!leggi()) apri();
    /* form del listino: messaggio "Richiesta inviata" mostrato senza cambiare pagina */
    var ok = document.getElementById('f-ok');
    if (ok && window.MutationObserver) {
      new MutationObserver(function () { if (ok.classList.contains('show')) preventivo(); })
        .observe(ok, { attributes: true, attributeFilter: ['class'] });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvio); else avvio();
})();
