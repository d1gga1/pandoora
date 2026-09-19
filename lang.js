/* Pan.door.a — shared language switcher + i18n engine */
(function(){
  if(window.__pdLang) return; window.__pdLang=true;
  const CSS=`
  .pdlang{position:fixed;right:22px;bottom:22px;z-index:99999;font-family:'Manrope',system-ui,Arial,sans-serif}
  .pdlang *{box-sizing:border-box}
  .pdlang-btn{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;letter-spacing:.4px;color:#fff;cursor:pointer;padding:9px 13px;border-radius:100px;border:1px solid rgba(255,255,255,.18);background:rgba(16,22,38,.85);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .25s cubic-bezier(.22,.61,.36,1),box-shadow .3s,border-color .3s}
  .pdlang-btn:hover{transform:translateY(-2px);border-color:#5b8def;box-shadow:0 14px 34px rgba(46,107,230,.4)}
  .pdlang-globe{display:inline-flex;transition:transform .7s cubic-bezier(.22,.61,.36,1)}
  .pdlang-btn:hover .pdlang-globe{transform:rotate(360deg)}
  .pdlang-chev{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.4;opacity:.7;transition:transform .35s}
  .pdlang.open .pdlang-chev{transform:rotate(180deg)}
  .pdlang-fl{display:block;width:22px;height:15px;border-radius:3px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.25) inset;flex-shrink:0;transition:transform .25s}
  .pdlang-fl svg{display:block;width:100%;height:100%}
  @keyframes pdlangpop{0%{transform:scale(1)}40%{transform:scale(1.13)}100%{transform:scale(1)}}
  .pdlang-btn.pop{animation:pdlangpop .45s}
  .pdlang-menu{position:absolute;right:0;bottom:calc(100% + 12px);min-width:200px;max-height:70vh;overflow-y:auto;list-style:none;margin:0;padding:7px;background:#0e1626;border:1px solid rgba(255,255,255,.1);border-radius:15px;box-shadow:0 22px 55px rgba(0,0,0,.55);opacity:0;visibility:hidden;transform:translateY(10px) scale(.95);transform-origin:bottom right;transition:opacity .28s,transform .3s,visibility .3s}
  .pdlang.open .pdlang-menu{opacity:1;visibility:visible;transform:translateY(0) scale(1)}
  .pdlang-menu::after{content:"";position:absolute;bottom:-6px;right:24px;width:12px;height:12px;background:#0e1626;border-right:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1);transform:rotate(45deg)}
  .pdlang-opt{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:10px;font-size:13px;font-weight:600;color:rgba(255,255,255,.82);cursor:pointer;opacity:0;transform:translateX(10px);transition:background .2s,color .2s}
  .pdlang.open .pdlang-opt{opacity:1;transform:translateX(0);transition:opacity .4s,transform .4s,background .2s,color .2s}
  .pdlang.open .pdlang-opt:nth-child(1){transition-delay:.04s}
  .pdlang.open .pdlang-opt:nth-child(2){transition-delay:.09s}
  .pdlang.open .pdlang-opt:nth-child(3){transition-delay:.14s}
  .pdlang.open .pdlang-opt:nth-child(4){transition-delay:.19s}
  .pdlang-opt:hover{background:rgba(91,141,239,.16);color:#fff}
  .pdlang-opt:hover .pdlang-fl{transform:scale(1.09)}
  .pdlang-opt.on{color:#fff;background:rgba(91,141,239,.1)}
  .pdlang-nm{white-space:nowrap}
  .pdlang-ck{margin-left:auto;width:16px;height:16px;stroke:#8bc34a;fill:none;stroke-width:2.6;opacity:0;transform:scale(.5);transition:.25s}
  .pdlang-opt.on .pdlang-ck{opacity:1;transform:scale(1)}
  `;
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
  const FL={
    it:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#009246"/><rect x="2" width="1" height="2" fill="#ce2b37"/></svg>`,
    en:`<svg viewBox="0 0 60 30" preserveAspectRatio="none"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30" stroke="#C8102E" stroke-width="3"/><path d="M60,0 L0,30" stroke="#C8102E" stroke-width="3"/><rect x="25" width="10" height="30" fill="#fff"/><rect y="10" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="30" fill="#C8102E"/><rect y="12" width="60" height="6" fill="#C8102E"/></svg>`,
    fr:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#fff"/><rect width="1" height="2" fill="#0055a4"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>`,
    es:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#c60b1e"/><rect y="0.5" width="3" height="1" fill="#ffc400"/></svg>`,
    de:`<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#ffce00"/><rect width="3" height="1" fill="#000"/><rect y="1" width="3" height="1" fill="#dd0000"/></svg>`,
    nl:`<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#21468b"/><rect width="3" height="2" fill="#fff"/><rect width="3" height="1" fill="#ae1c28"/></svg>`,
    pl:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#dc143c"/><rect width="3" height="1" fill="#fff"/></svg>`,
    cs:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#d7141a"/><rect width="3" height="1" fill="#fff"/><path d="M0 0L1.5 1L0 2z" fill="#11457e"/></svg>`,
    sk:`<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#ee1c25"/><rect width="3" height="2" fill="#0b4ea2"/><rect width="3" height="1" fill="#fff"/></svg>`,
    sl:`<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#ed1c24"/><rect width="3" height="2" fill="#005da4"/><rect width="3" height="1" fill="#fff"/></svg>`,
    tr:`<svg viewBox="0 0 30 20" preserveAspectRatio="none"><rect width="30" height="20" fill="#e30a17"/><circle cx="10.5" cy="10" r="5" fill="#fff"/><circle cx="11.75" cy="10" r="4" fill="#e30a17"/><path d="M15.2 10l4.5-1.46-2.78 3.83V7.63l2.78 3.83z" fill="#fff"/></svg>`,
    hr:`<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#171796"/><rect width="3" height="1.34" fill="#fff"/><rect width="3" height="0.67" fill="#ff0000"/><g><rect x="1.28" y="0.5" width="0.44" height="0.52" fill="#fff" stroke="#ff0000" stroke-width="0.06"/><rect x="1.28" y="0.5" width="0.22" height="0.26" fill="#ff0000"/><rect x="1.5" y="0.76" width="0.22" height="0.26" fill="#ff0000"/></g></svg>`,
    sq:`<svg viewBox="0 0 28 20" preserveAspectRatio="none"><rect width="28" height="20" fill="#e41e20"/><path d="M14 5.2l-3-1.6 1.1 2.4-3.4-.6 2.2 2-2.6 1.3 2.7.7-1.3 1.8 2.3-.4-.3 2.4 2.3-1.6 2.3 1.6-.3-2.4 2.3.4-1.3-1.8 2.7-.7L18.1 7.4l2.2-2-3.4.6L18 3.6z" fill="#000"/><rect x="13.3" y="12.6" width="1.4" height="3.4" fill="#000"/></svg>`,
    el:`<svg viewBox="0 0 27 18" preserveAspectRatio="none"><rect width="27" height="18" fill="#0d5eaf"/><rect y="2" width="27" height="2" fill="#fff"/><rect y="6" width="27" height="2" fill="#fff"/><rect y="10" width="27" height="2" fill="#fff"/><rect y="14" width="27" height="2" fill="#fff"/><rect width="10" height="10" fill="#0d5eaf"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></svg>`,
    ar:`<svg viewBox="0 0 12 6" preserveAspectRatio="none"><rect width="12" height="6" fill="#00732f"/><rect y="2" width="12" height="2" fill="#fff"/><rect y="4" width="12" height="2" fill="#000"/><rect width="3" height="6" fill="#ff0000"/></svg>`
  };
  const NM={it:'Italiano',en:'English',fr:'Français',de:'Deutsch',es:'Español',nl:'Nederlands',pl:'Polski',cs:'Čeština',sk:'Slovenčina',sl:'Slovenščina',hr:'Hrvatski',sq:'Shqip',el:'Ελληνικά',tr:'Türkçe',ar:'العربية'};
  const CD={it:'IT',en:'EN',fr:'FR',de:'DE',es:'ES',nl:'NL',pl:'PL',cs:'CS',sk:'SK',sl:'SL',hr:'HR',sq:'SQ',el:'EL',tr:'TR',ar:'AR'};
  const GLOBE=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>`;
  const CK=`<svg class="pdlang-ck" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7"/></svg>`;
  const wrap=document.createElement('div'); wrap.className='pdlang';
  wrap.innerHTML=
    `<button class="pdlang-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Language">`+
      `<span class="pdlang-globe">${GLOBE}</span>`+
      `<span class="pdlang-fl pdlang-cur">${FL.it}</span>`+
      `<span class="pdlang-code">IT</span>`+
      `<svg class="pdlang-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>`+
    `</button>`+
    `<ul class="pdlang-menu" role="listbox">`+
      ['it','en','fr','de','es','nl','pl','cs','sk','sl','hr','sq','el','tr','ar'].map(l=>`<li class="pdlang-opt" role="option" data-lang="${l}"><span class="pdlang-fl">${FL[l]}</span><span class="pdlang-nm">${NM[l]}</span>${CK}</li>`).join('')+
    `</ul>`;
  document.body.appendChild(wrap);
  const btn=wrap.querySelector('.pdlang-btn'), menu=wrap.querySelector('.pdlang-menu');
  const curFlag=wrap.querySelector('.pdlang-cur'), curCode=wrap.querySelector('.pdlang-code');
  const opts=[...wrap.querySelectorAll('.pdlang-opt')];

  /* ---------- dictionary (base) ---------- */
  /* ---------- slug tradotti disponibili ---------- */
  const PAGES = new Set(["azienda", "certificazioni", "componenti-per-mobili", "contatti", "faq", "grazie", "listino-pannelli-tamburati", "pannelli-tamburati", "pavimentazioni", "porte", "preventivo", "progetti", "progetto", "verniciatura"]);
  /* slug tradotti: chiave = slug italiano canonico */
  const SLUG = {
    "porte": {
      "en": "doors",
      "fr": "portes",
      "de": "tueren",
      "es": "puertas"
    },
    "pavimentazioni": {
      "en": "parquet-flooring",
      "fr": "parquet",
      "de": "parkett",
      "es": "parquet"
    },
    "verniciatura": {
      "en": "wood-lacquering",
      "fr": "laquage-bois",
      "de": "lackierung",
      "es": "lacado-madera"
    },
    "componenti-per-mobili": {
      "en": "furniture-components",
      "fr": "composants-meubles",
      "de": "moebelkomponenten",
      "es": "componentes-para-muebles"
    },
    "listino-pannelli-tamburati": {
      "en": "honeycomb-panel-price-list",
      "fr": "tarif-panneaux-alveolaires",
      "de": "wabenplatten-preisliste",
      "es": "tarifa-paneles-alveolares"
    },
    "preventivo": {
      "en": "request-a-quote",
      "fr": "devis",
      "de": "angebot-anfordern",
      "es": "presupuesto"
    },
    "progetti": {
      "en": "projects",
      "fr": "realisations",
      "de": "projekte",
      "es": "proyectos"
    },
    "progetto": {
      "en": "project",
      "fr": "projet",
      "de": "projekt",
      "es": "proyecto"
    },
    "azienda": {
      "en": "about-us",
      "fr": "a-propos",
      "de": "ueber-uns",
      "es": "quienes-somos"
    },
    "contatti": {
      "en": "contact",
      "fr": "contact",
      "de": "kontakt",
      "es": "contacto"
    },
    "faq": {
      "en": "faq",
      "fr": "faq",
      "de": "faq",
      "es": "preguntas-frecuentes"
    },
    "grazie": {
      "en": "thank-you",
      "fr": "merci",
      "de": "danke",
      "es": "gracias"
    },
    "certificazioni": {
      "en": "certificates",
      "fr": "certificats",
      "de": "zertifikate",
      "es": "certificados"
    },
    "pannelli-tamburati": {
      "en": "honeycomb-panels",
      "fr": "panneaux-alveolaires",
      "de": "wabenplatten",
      "es": "paneles-alveolares"
    },
    "pannelli-tamburati/pannello-stand": {
      "en": "honeycomb-panels/standard-panel",
      "fr": "panneaux-alveolaires/panneau-standard",
      "de": "wabenplatten/standardplatte",
      "es": "paneles-alveolares/panel-estandar"
    },
    "pannelli-tamburati/ignifugo": {
      "en": "honeycomb-panels/fire-rated",
      "fr": "panneaux-alveolaires/ignifuge",
      "de": "wabenplatten/schwer-entflammbar",
      "es": "paneles-alveolares/panel-ignifugo"
    },
    "pannelli-tamburati/laccato-ral": {
      "en": "honeycomb-panels/ral-lacquered",
      "fr": "panneaux-alveolaires/laque-ral",
      "de": "wabenplatten/ral-lackiert",
      "es": "paneles-alveolares/panel-lacado-ral"
    },
    "pannelli-tamburati/electric": {
      "en": "honeycomb-panels/electrical-panel",
      "fr": "panneaux-alveolaires/panneau-electrique",
      "de": "wabenplatten/elektro-platte",
      "es": "paneles-alveolares/panel-electrico"
    },
    "pannelli-tamburati/mostra-arte": {
      "en": "honeycomb-panels/exhibition-panel",
      "fr": "panneaux-alveolaires/panneau-exposition",
      "de": "wabenplatten/ausstellungsplatte",
      "es": "paneles-alveolares/panel-expositivo"
    },
    "pannelli-tamburati/rinforzato": {
      "en": "honeycomb-panels/reinforced-panel",
      "fr": "panneaux-alveolaires/panneau-renforce",
      "de": "wabenplatten/verstaerkte-platte",
      "es": "paneles-alveolares/panel-reforzado"
    },
    "pannelli-tamburati/griglia": {
      "en": "honeycomb-panels/slatwall-panel",
      "fr": "panneaux-alveolaires/panneau-rainure",
      "de": "wabenplatten/rasterplatte",
      "es": "paneles-alveolares/panel-ranurado"
    },
    "pannelli-tamburati/curvo": {
      "en": "honeycomb-panels/curved-panel",
      "fr": "panneaux-alveolaires/panneau-courbe",
      "de": "wabenplatten/gebogene-platte",
      "es": "paneles-alveolares/panel-curvo"
    },
    "pannelli-tamburati/specchio": {
      "en": "honeycomb-panels/mirror-panel",
      "fr": "panneaux-alveolaires/panneau-miroir",
      "de": "wabenplatten/spiegelplatte",
      "es": "paneles-alveolares/panel-espejo"
    },
    "pannelli-tamburati/muretti": {
      "en": "honeycomb-panels/low-wall-modules",
      "fr": "panneaux-alveolaires/murets",
      "de": "wabenplatten/mauerelemente",
      "es": "paneles-alveolares/muretes"
    },
    "pannelli-tamburati/porte-per-stand": {
      "en": "honeycomb-panels/stand-doors",
      "fr": "panneaux-alveolaires/portes-stand",
      "de": "wabenplatten/messetueren",
      "es": "paneles-alveolares/puertas-para-stands"
    },
    "pannelli-tamburati/pedane-livellanti": {
      "en": "honeycomb-panels/levelling-platforms",
      "fr": "panneaux-alveolaires/podiums-nivelants",
      "de": "wabenplatten/podeste",
      "es": "paneles-alveolares/tarimas-nivelantes"
    },
    "pannelli-tamburati/accessori-giunzione": {
      "en": "honeycomb-panels/connectors-accessories",
      "fr": "panneaux-alveolaires/raccords-accessoires",
      "de": "wabenplatten/verbinder-zubehoer",
      "es": "paneles-alveolares/conectores-accesorios"
    },
    "pannelli-tamburati/quadrotte": {
      "en": "honeycomb-panels/floor-tiles",
      "fr": "panneaux-alveolaires/dalles-de-sol",
      "de": "wabenplatten/bodenplatten",
      "es": "paneles-alveolares/losetas-de-suelo"
    },
    "pannelli-tamburati/colonne-folding": {
      "en": "honeycomb-panels/folding-columns",
      "fr": "panneaux-alveolaires/colonnes-pliantes",
      "de": "wabenplatten/faltsaeulen",
      "es": "paneles-alveolares/columnas-plegables"
    }
  };
  /* indice inverso: "<lingua>/<slug tradotto>" -> slug italiano */
  const CANON = {};
  Object.keys(SLUG).forEach(function(it){
    Object.keys(SLUG[it]).forEach(function(l){ CANON[l + '/' + SLUG[it][l]] = it; });
  });
  const LANGS = ['it','en','fr','de','es','nl','pl','cs','sk','sl','hr','sq','el','tr','ar'];
  /* slug tradotti per hr / sq / el (pagine realmente esistenti) */
  const EXTRA = {
    hr: {'porte':'unutarnja-vrata','contatti':'kontakt','preventivo':'ponuda','azienda':'o-nama'},
    sq: {'porte':'dyer-te-brendshme','contatti':'kontakt','preventivo':'oferta','azienda':'rreth-nesh'},
    el: {'porte':'esoterikes-portes','contatti':'epikoinonia','preventivo':'prosfora','azienda':'i-etaireia'}
  };

  /* ---------- lingua e slug correnti dedotti dall'URL ---------- */
  function parsePath(){
    let p = location.pathname.replace(/^\/+/, '').replace(/index\.html$/, '');
    let lang = 'it';
    const m = p.match(/^(en|fr|de|es|nl|pl|cs|sk|sl|hr|sq|el|tr|ar)(\/|$)(.*)$/);
    if (m) { lang = m[1]; p = m[3] || ''; }
    p = p.replace(/\/+$/, '');
    if (lang !== 'it' && CANON[lang + '/' + p]) p = CANON[lang + '/' + p];
    return { lang: lang, page: p };
  }
  function fromHreflang(lang){
    const a = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    const h = a && a.getAttribute('href');
    if (!h) return null;
    try { return new URL(h, location.origin).pathname; } catch(e){ return h; }
  }
  function urlFor(lang, page){
    const hl = fromHreflang(lang);
    if (hl) return hl;
    if (EXTRA[lang]) { const t = EXTRA[lang][page]; return t ? '/' + lang + '/' + t + '/' : '/' + lang + '/'; }
    const FULL = ['it','en','fr','de','es'];
    const target = (PAGES.has(page) && FULL.indexOf(lang) !== -1) ? page : '';
    const pre = (lang === 'it') ? '/' : '/' + lang + '/';
    if (!target) return pre;
    const loc = (lang !== 'it' && SLUG[target] && SLUG[target][lang]) ? SLUG[target][lang] : target;
    return pre + loc + '/';
  }

  Object.keys(EXTRA).forEach(function(l){
    Object.keys(EXTRA[l]).forEach(function(it){ CANON[l + '/' + EXTRA[l][it]] = it; });
  });
  const cur = parsePath();
  if (!document.documentElement.getAttribute('lang')) document.documentElement.lang = cur.lang;

  /* ---------- stato iniziale dello switcher ---------- */
  curFlag.innerHTML = FL[cur.lang] || FL.it;
  curCode.textContent = CD[cur.lang] || 'IT';
  opts.forEach(o => {
    const l = o.dataset.lang;
    o.classList.toggle('on', l === cur.lang);
    const href = urlFor(l, cur.page);
    o.setAttribute('data-href', href);
    o.setAttribute('title', NM[l]);
    if (!PAGES.has(cur.page) && l !== cur.lang) o.setAttribute('data-home', '1');
  });

  /* ---------- comportamento ---------- */
  const open  = () => { wrap.classList.add('open');  btn.setAttribute('aria-expanded','true');  };
  const close = () => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded','false'); };
  btn.addEventListener('click', e => { e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); });
  document.addEventListener('click', e => { if(!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  opts.forEach(o => o.addEventListener('click', () => {
    const l = o.dataset.lang;
    if (l === cur.lang) { close(); return; }
    location.href = o.getAttribute('data-href');
  }));

  /* compat: vecchia API, ora naviga invece di tradurre a runtime */
  window.applyLang = function(lang){
    if (LANGS.indexOf(lang) === -1 || lang === cur.lang) return;
    location.href = urlFor(lang, cur.page);
  };
})();
