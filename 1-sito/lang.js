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
  .pdlang-menu{position:absolute;right:0;bottom:calc(100% + 12px);min-width:200px;list-style:none;margin:0;padding:7px;background:#0e1626;border:1px solid rgba(255,255,255,.1);border-radius:15px;box-shadow:0 22px 55px rgba(0,0,0,.55);opacity:0;visibility:hidden;transform:translateY(10px) scale(.95);transform-origin:bottom right;transition:opacity .28s,transform .3s,visibility .3s}
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
    de:`<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#ffce00"/><rect width="3" height="1" fill="#000"/><rect y="1" width="3" height="1" fill="#dd0000"/></svg>`
  };
  const NM={it:'Italiano',en:'English',fr:'Français',de:'Deutsch'};
  const CD={it:'IT',en:'EN',fr:'FR',de:'DE'};
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
      ['it','en','fr','de'].map(l=>`<li class="pdlang-opt" role="option" data-lang="${l}"><span class="pdlang-fl">${FL[l]}</span><span class="pdlang-nm">${NM[l]}</span>${CK}</li>`).join('')+
    `</ul>`;
  document.body.appendChild(wrap);
  const btn=wrap.querySelector('.pdlang-btn'), menu=wrap.querySelector('.pdlang-menu');
  const curFlag=wrap.querySelector('.pdlang-cur'), curCode=wrap.querySelector('.pdlang-code');
  const opts=[...wrap.querySelectorAll('.pdlang-opt')];

  /* ---------- dictionary (base) ---------- */
  const HTMLK=new Set([
    `Pannelli Tamburati 1 · Allestimenti fieristici`,
    `Pannelli tamburati su misura.`,
    `Stand fieristici professionali, su misura`,
    `Ogni componente del tuo stand`,
    `Soluzioni per allestimenti fieristici`,
    `👆 Clicca un componente per aprire la sua scheda tecnica`,
    `Le nostre strutture per stand su misura uniscono design, funzionalità e robustezza. Realizziamo pannelli tamburati leggeri e resistenti, perfetti per stand modulari facili da montare, trasportare e riutilizzare in diversi eventi.`,
    `Grazie all'esperienza nella lavorazione del legno e dei materiali compositi, realizziamo pannelli di alta qualità che coniugano estetica e durabilità. Offriamo assistenza completa, dalla progettazione alla consegna, con tempi di realizzazione rapidi.`
  ]);
  const T={
   en:{
    "← Indietro":`← Back`,"Preventivo":`Quote`,
    "Pannelli Tamburati 1 · Allestimenti fieristici":`<span class="eb-line"></span>Hollow-core Panels 1 · Trade-fair setups`,
    "Pannelli tamburati su misura.":`<span class="l"><span class="w">Custom</span></span> <span class="l"><span class="w"><em>hollow-core</em></span> <span class="w">panels.</span></span>`,
    "Pannelli tamburati per stand fieristici su misura: modulari, solidi e pronti per ogni evento.":`Custom hollow-core panels for trade-fair stands: modular, solid and ready for every event.`,
    "Strutture leggere e resistenti, perfette per creare stand modulari facili da montare, trasportare e riutilizzare — con porte personalizzate, pedane livellanti e accessori di montaggio.":`Lightweight, sturdy structures, perfect for modular stands that are easy to assemble, transport and reuse — with custom doors, levelling platforms and assembly accessories.`,
    "Esplora la componentistica":`Explore the components`,"Schede tecniche":`Data sheets`,
    "Telaio finger-joint":`Finger-joint frame`,"Anima nido d'ape":`Honeycomb core`,"Collanti Classe 1":`Class 1 adhesives`,"Fino a 6 m":`Up to 6 m`,
    "spessore standard":`standard thickness`,"Scroll":`Scroll`,
    "Collaboriamo con chi espone a":`We work with exhibitors at`,
    "Chi siamo":`About us`,
    "Stand fieristici professionali, su misura":`Professional trade-fair stands, <em>made to measure</em>`,
    "Progettiamo e produciamo stand per imprese di ogni settore — dal design e arredo al food & beverage, alla tecnologia — valorizzando l'identità del brand con un'immagine coerente e d'impatto.":`We design and manufacture stands for companies in every sector — from design and furniture to food & beverage and technology — enhancing brand identity with a coherent, impactful image.`,
    "Le nostre strutture per stand su misura uniscono design, funzionalità e robustezza. Realizziamo pannelli tamburati leggeri e resistenti, perfetti per stand modulari facili da montare, trasportare e riutilizzare in diversi eventi.":`Our custom stand structures combine design, functionality and sturdiness. We make lightweight, resistant hollow-core panels, perfect for modular stands that are easy to assemble, transport and reuse across different events.`,
    "Grazie all'esperienza nella lavorazione del legno e dei materiali compositi, realizziamo pannelli di alta qualità che coniugano estetica e durabilità. Offriamo assistenza completa, dalla progettazione alla consegna, con tempi di realizzazione rapidi.":`Thanks to our experience in working wood and composite materials, we make high-quality panels that combine aesthetics and durability. We offer full support, from design to delivery, with fast production times.`,
    "Componentistica stand":`Stand components`,
    "Ogni componente del tuo stand":`Every <em>component</em> of your stand`,
    "👆 Clicca un componente per aprire la sua scheda tecnica":`<span class="cursor">👆</span> Click a component to open its data sheet`,
    "Pannelli tamburati":`Hollow-core panels`,"Porte tamburate":`Hollow-core doors`,"Pedane livellanti":`Levelling platforms`,"Accessori & giunzioni":`Accessories & joints`,
    "Pannelli Tamburati":`Hollow-core Panels`,"Porte Tamburate":`Hollow-core Doors`,"Pedane Livellanti":`Levelling Platforms`,"Accessori & Giunzioni":`Accessories & Joints`,
    "Grezzi, laminati, ignifughi, arte, rinforzati, extra-lunghi 6 m.":`Raw, laminated, fireproof, art, reinforced, extra-long 6 m.`,
    "Grezze, laminate, ignifughe, con oblò, antipanico, scorrevoli, doppie.":`Raw, laminated, fireproof, with porthole, anti-panic, sliding, double.`,
    "Tamburate grezze, forate per piedini regolabili. Anche su misura.":`Raw hollow-core, drilled for adjustable feet. Also made to measure.`,
    "Anime di allineamento, giunzioni I·L·T·X, bordi e copriteste.":`Alignment cores, I·L·T·X joints, edges and end caps.`,
    "Produzione su misura":`Custom production`,
    "Soluzioni per allestimenti fieristici":`Solutions for <em>trade-fair setups</em>`,
    "Pannelli, muretti, colonne, porte e strutture personalizzate per stand fieristici, showroom e progetti espositivi.":`Panels, low walls, columns, doors and custom structures for trade-fair stands, showrooms and exhibition projects.`,
    "Su misura":`Made to measure`,"Finiture RAL":`RAL finishes`,"Pronta consegna":`Ready to ship`,"Curve custom":`Custom curves`,
    "Muretti in MDF":`MDF low walls`,"Colonne Folding a Specchio":`Mirror folding columns`,"Pannelli in pronta consegna":`Ready-to-ship panels`,"Pannelli Curvi":`Curved panels`,
    "Muretti in MDF completamente personalizzati, progettati in base alle esigenze del cliente. Massima flessibilità su dimensioni, spessori e lavorazioni, con planarità e finiture di alta qualità.":`Fully customised MDF low walls, designed to the client's needs. Maximum flexibility in sizes, thicknesses and machining, with flatness and high-quality finishes.`,
    "Colonne folding rivestite a specchio, progettate su misura per valorizzare ogni spazio espositivo con forte impatto visivo. Personalizzabili in dimensioni, forme e finiture.":`Mirror-clad folding columns, custom-designed to enhance any exhibition space with strong visual impact. Customisable in size, shape and finish.`,
    "Pannelli laminati in diverse finiture e colori: bianco, nero, grigio e qualsiasi tonalità su specifica RAL. Uniformità cromatica, qualità delle superfici e precisione nelle lavorazioni.":`Laminated panels in various finishes and colours: white, black, grey and any shade to RAL specification. Colour uniformity, surface quality and machining precision.`,
    "Pannelli tamburati per allestimenti fieristici, disponibili in soluzioni standard sempre in pronta consegna. Pedane sempre disponibili per rapidità e continuità.":`Hollow-core panels for trade-fair setups, available in standard solutions always ready to ship. Platforms always in stock for speed and continuity.`,
    "Pannelli curvi su misura, per soluzioni fluide e continue negli allestimenti. Ideali per stand dal forte impatto visivo, superano le geometrie tradizionali con massima libertà progettuale.":`Custom curved panels for fluid, continuous setups. Ideal for high-impact stands, they go beyond traditional geometries with maximum design freedom.`,
    "Richiedi informazioni":`Request information`,
    "Un progetto su misura?":`A custom project?`,
    "Inviaci il tuo disegno o le tue specifiche: realizziamo soluzioni personalizzate con consegna in fiera.":`Send us your drawing or specifications: we create custom solutions delivered to the fair.`,
    "Contattaci":`Contact us`,
    "Costruzione":`Construction`,"Materiali di prima qualità":`Premium materials`,
    "Ogni componente è selezionato per garantire stabilità e durata nel tempo, nel rispetto degli standard FederlegnoArredo.":`Every component is selected to ensure long-lasting stability, in compliance with FederlegnoArredo standards.`,
    "Copertine":`Face panels`,"Levigate con cura per un incollaggio uniforme e resistente.":`Carefully sanded for a uniform, strong bond.`,
    "Telaio":`Frame`,"Abete finger joint senza nodi, con aste intere.":`Knot-free finger-joint spruce, with full-length rails.`,
    "Nido d'ape":`Honeycomb`,"Perforato ad alta grammatura per la massima stabilità.":`High-density perforated for maximum stability.`,
    "Sfiati sulle teste":`End vents`,"Corretto deflusso dei gas in pressatura, senza rigonfiamenti.":`Proper gas release during pressing, without bulging.`,
    "Collanti":`Adhesives`,"Vinilici in classe 1, sinonimo di qualità e sicurezza.":`Class 1 vinyl, a byword for quality and safety.`,
    "Ultimi progetti":`Latest projects`,
    "Allestimenti e stand fieristici realizzati per brand internazionali, in Italia e nel mondo.":`Setups and trade-fair stands built for international brands, in Italy and worldwide.`,
    "Pronto a costruire il tuo stand?":`Ready to build your stand?`,
    "Produciamo anche su misura e su disegno del cliente, con consegna in Italia e all'estero — anche direttamente in fiera.":`We also manufacture to measure and to the client's design, with delivery in Italy and abroad — even directly to the fair.`,
    "Vai alle schede tecniche":`Go to data sheets`,
    "Pannelli tamburati, porte e pedane su misura per stand fieristici, mostre, congressi ed esposizioni museali. Made in Italy.":`Custom hollow-core panels, doors and platforms for trade-fair stands, exhibitions, congresses and museum displays. Made in Italy.`,
    "Standard di qualità FederlegnoArredo":`FederlegnoArredo quality standard`,
    "Menù":`Menu`,"Carica progetto":`Upload project`,"FAQs":`FAQs`,"Verniciatura":`Painting`,"Seguici":`Follow us`,"Richiedi preventivo":`Request a quote`,
    "© 2025 Pan.door.a S.r.l. — Tutti i diritti riservati":`© 2025 Pan.door.a S.r.l. — All rights reserved`
   },
   fr:{
    "← Indietro":`← Retour`,"Preventivo":`Devis`,
    "Pannelli Tamburati 1 · Allestimenti fieristici":`<span class="eb-line"></span>Panneaux alvéolaires 1 · Aménagements de salons`,
    "Pannelli tamburati su misura.":`<span class="l"><span class="w">Panneaux</span></span> <span class="l"><span class="w"><em>alvéolaires</em></span> <span class="w">sur mesure.</span></span>`,
    "Pannelli tamburati per stand fieristici su misura: modulari, solidi e pronti per ogni evento.":`Panneaux alvéolaires sur mesure pour stands de salon : modulaires, solides et prêts pour chaque événement.`,
    "Strutture leggere e resistenti, perfette per creare stand modulari facili da montare, trasportare e riutilizzare — con porte personalizzate, pedane livellanti e accessori di montaggio.":`Des structures légères et résistantes, parfaites pour des stands modulaires faciles à monter, transporter et réutiliser — avec portes personnalisées, plateformes de mise à niveau et accessoires de montage.`,
    "Esplora la componentistica":`Explorer les composants`,"Schede tecniche":`Fiches techniques`,
    "Telaio finger-joint":`Cadre finger-joint`,"Anima nido d'ape":`Âme nid d'abeille`,"Collanti Classe 1":`Colles Classe 1`,"Fino a 6 m":`Jusqu'à 6 m`,
    "spessore standard":`épaisseur standard`,"Scroll":`Défiler`,
    "Collaboriamo con chi espone a":`Nous collaborons avec les exposants de`,
    "Chi siamo":`À propos`,
    "Stand fieristici professionali, su misura":`Stands de salon <em>professionnels</em>, sur mesure`,
    "Progettiamo e produciamo stand per imprese di ogni settore — dal design e arredo al food & beverage, alla tecnologia — valorizzando l'identità del brand con un'immagine coerente e d'impatto.":`Nous concevons et fabriquons des stands pour les entreprises de tous les secteurs — du design et de l'ameublement à l'agroalimentaire et à la technologie — en valorisant l'identité de la marque avec une image cohérente et percutante.`,
    "Le nostre strutture per stand su misura uniscono design, funzionalità e robustezza. Realizziamo pannelli tamburati leggeri e resistenti, perfetti per stand modulari facili da montare, trasportare e riutilizzare in diversi eventi.":`Nos structures de stand sur mesure allient design, fonctionnalité et robustesse. Nous fabriquons des panneaux alvéolaires légers et résistants, parfaits pour des stands modulaires faciles à monter, transporter et réutiliser lors de différents événements.`,
    "Grazie all'esperienza nella lavorazione del legno e dei materiali compositi, realizziamo pannelli di alta qualità che coniugano estetica e durabilità. Offriamo assistenza completa, dalla progettazione alla consegna, con tempi di realizzazione rapidi.":`Grâce à notre expérience du travail du bois et des matériaux composites, nous réalisons des panneaux de haute qualité qui allient esthétique et durabilité. Nous offrons une assistance complète, de la conception à la livraison, avec des délais de fabrication rapides.`,
    "Componentistica stand":`Composants du stand`,
    "Ogni componente del tuo stand":`Chaque <em>composant</em> de votre stand`,
    "👆 Clicca un componente per aprire la sua scheda tecnica":`<span class="cursor">👆</span> Cliquez sur un composant pour ouvrir sa fiche technique`,
    "Pannelli tamburati":`Panneaux alvéolaires`,"Porte tamburate":`Portes alvéolaires`,"Pedane livellanti":`Plateformes de mise à niveau`,"Accessori & giunzioni":`Accessoires & jonctions`,
    "Pannelli Tamburati":`Panneaux alvéolaires`,"Porte Tamburate":`Portes alvéolaires`,"Pedane Livellanti":`Plateformes de mise à niveau`,"Accessori & Giunzioni":`Accessoires & Jonctions`,
    "Grezzi, laminati, ignifughi, arte, rinforzati, extra-lunghi 6 m.":`Bruts, laminés, ignifuges, art, renforcés, extra-longs 6 m.`,
    "Grezze, laminate, ignifughe, con oblò, antipanico, scorrevoli, doppie.":`Brutes, laminées, ignifuges, avec hublot, anti-panique, coulissantes, doubles.`,
    "Tamburate grezze, forate per piedini regolabili. Anche su misura.":`Alvéolaires bruts, percés pour pieds réglables. Aussi sur mesure.`,
    "Anime di allineamento, giunzioni I·L·T·X, bordi e copriteste.":`Âmes d'alignement, jonctions I·L·T·X, bords et cache-têtes.`,
    "Produzione su misura":`Production sur mesure`,
    "Soluzioni per allestimenti fieristici":`Solutions pour <em>aménagements de salons</em>`,
    "Pannelli, muretti, colonne, porte e strutture personalizzate per stand fieristici, showroom e progetti espositivi.":`Panneaux, murets, colonnes, portes et structures personnalisées pour stands de salon, showrooms et projets d'exposition.`,
    "Su misura":`Sur mesure`,"Finiture RAL":`Finitions RAL`,"Pronta consegna":`Livraison immédiate`,"Curve custom":`Courbes sur mesure`,
    "Muretti in MDF":`Murets en MDF`,"Colonne Folding a Specchio":`Colonnes folding à miroir`,"Pannelli in pronta consegna":`Panneaux en livraison immédiate`,"Pannelli Curvi":`Panneaux courbes`,
    "Muretti in MDF completamente personalizzati, progettati in base alle esigenze del cliente. Massima flessibilità su dimensioni, spessori e lavorazioni, con planarità e finiture di alta qualità.":`Murets en MDF entièrement personnalisés, conçus selon les besoins du client. Flexibilité maximale sur les dimensions, épaisseurs et usinages, avec planéité et finitions de haute qualité.`,
    "Colonne folding rivestite a specchio, progettate su misura per valorizzare ogni spazio espositivo con forte impatto visivo. Personalizzabili in dimensioni, forme e finiture.":`Colonnes folding revêtues de miroir, conçues sur mesure pour valoriser chaque espace d'exposition avec un fort impact visuel. Personnalisables en dimensions, formes et finitions.`,
    "Pannelli laminati in diverse finiture e colori: bianco, nero, grigio e qualsiasi tonalità su specifica RAL. Uniformità cromatica, qualità delle superfici e precisione nelle lavorazioni.":`Panneaux laminés en diverses finitions et couleurs : blanc, noir, gris et toute teinte selon spécification RAL. Uniformité chromatique, qualité des surfaces et précision d'usinage.`,
    "Pannelli tamburati per allestimenti fieristici, disponibili in soluzioni standard sempre in pronta consegna. Pedane sempre disponibili per rapidità e continuità.":`Panneaux alvéolaires pour aménagements de salons, disponibles en solutions standard toujours en stock. Plateformes toujours disponibles pour rapidité et continuité.`,
    "Pannelli curvi su misura, per soluzioni fluide e continue negli allestimenti. Ideali per stand dal forte impatto visivo, superano le geometrie tradizionali con massima libertà progettuale.":`Panneaux courbes sur mesure, pour des aménagements fluides et continus. Idéaux pour des stands à fort impact visuel, ils dépassent les géométries traditionnelles avec une liberté de conception maximale.`,
    "Richiedi informazioni":`Demander des informations`,
    "Un progetto su misura?":`Un projet sur mesure ?`,
    "Inviaci il tuo disegno o le tue specifiche: realizziamo soluzioni personalizzate con consegna in fiera.":`Envoyez-nous votre dessin ou vos spécifications : nous réalisons des solutions personnalisées avec livraison sur le salon.`,
    "Contattaci":`Contactez-nous`,
    "Costruzione":`Construction`,"Materiali di prima qualità":`Matériaux de première qualité`,
    "Ogni componente è selezionato per garantire stabilità e durata nel tempo, nel rispetto degli standard FederlegnoArredo.":`Chaque composant est sélectionné pour garantir stabilité et durabilité dans le temps, dans le respect des standards FederlegnoArredo.`,
    "Copertine":`Parements`,"Levigate con cura per un incollaggio uniforme e resistente.":`Poncées avec soin pour un collage uniforme et résistant.`,
    "Telaio":`Cadre`,"Abete finger joint senza nodi, con aste intere.":`Épicéa finger-joint sans nœuds, avec montants entiers.`,
    "Nido d'ape":`Nid d'abeille`,"Perforato ad alta grammatura per la massima stabilità.":`Perforé à haut grammage pour une stabilité maximale.`,
    "Sfiati sulle teste":`Évents en tête`,"Corretto deflusso dei gas in pressatura, senza rigonfiamenti.":`Évacuation correcte des gaz au pressage, sans gonflements.`,
    "Collanti":`Colles`,"Vinilici in classe 1, sinonimo di qualità e sicurezza.":`Vinyliques de classe 1, synonyme de qualité et de sécurité.`,
    "Ultimi progetti":`Derniers projets`,
    "Allestimenti e stand fieristici realizzati per brand internazionali, in Italia e nel mondo.":`Aménagements et stands de salon réalisés pour des marques internationales, en Italie et dans le monde.`,
    "Pronto a costruire il tuo stand?":`Prêt à construire votre stand ?`,
    "Produciamo anche su misura e su disegno del cliente, con consegna in Italia e all'estero — anche direttamente in fiera.":`Nous produisons aussi sur mesure et d'après le dessin du client, avec livraison en Italie et à l'étranger — même directement sur le salon.`,
    "Vai alle schede tecniche":`Voir les fiches techniques`,
    "Pannelli tamburati, porte e pedane su misura per stand fieristici, mostre, congressi ed esposizioni museali. Made in Italy.":`Panneaux alvéolaires, portes et plateformes sur mesure pour stands de salon, expositions, congrès et expositions muséales. Made in Italy.`,
    "Standard di qualità FederlegnoArredo":`Standard de qualité FederlegnoArredo`,
    "Menù":`Menu`,"Carica progetto":`Charger un projet`,"FAQs":`FAQ`,"Verniciatura":`Peinture`,"Seguici":`Suivez-nous`,"Richiedi preventivo":`Demander un devis`,
    "© 2025 Pan.door.a S.r.l. — Tutti i diritti riservati":`© 2025 Pan.door.a S.r.l. — Tous droits réservés`
   },
   de:{
    "← Indietro":`← Zurück`,"Preventivo":`Angebot`,
    "Pannelli Tamburati 1 · Allestimenti fieristici":`<span class="eb-line"></span>Wabenplatten 1 · Messebau`,
    "Pannelli tamburati su misura.":`<span class="l"><span class="w">Wabenplatten</span></span> <span class="l"><span class="w"><em>nach</em></span> <span class="w">Maß.</span></span>`,
    "Pannelli tamburati per stand fieristici su misura: modulari, solidi e pronti per ogni evento.":`Wabenplatten nach Maß für Messestände: modular, stabil und für jedes Event bereit.`,
    "Strutture leggere e resistenti, perfette per creare stand modulari facili da montare, trasportare e riutilizzare — con porte personalizzate, pedane livellanti e accessori di montaggio.":`Leichte, robuste Strukturen, ideal für modulare Stände, die sich leicht montieren, transportieren und wiederverwenden lassen — mit maßgefertigten Türen, Nivellierpodesten und Montagezubehör.`,
    "Esplora la componentistica":`Komponenten entdecken`,"Schede tecniche":`Datenblätter`,
    "Telaio finger-joint":`Finger-Joint-Rahmen`,"Anima nido d'ape":`Wabenkern`,"Collanti Classe 1":`Klebstoffe Klasse 1`,"Fino a 6 m":`Bis zu 6 m`,
    "spessore standard":`Standardstärke`,"Scroll":`Scrollen`,
    "Collaboriamo con chi espone a":`Wir arbeiten mit Ausstellern von`,
    "Chi siamo":`Über uns`,
    "Stand fieristici professionali, su misura":`<em>Professionelle</em> Messestände, nach Maß`,
    "Progettiamo e produciamo stand per imprese di ogni settore — dal design e arredo al food & beverage, alla tecnologia — valorizzando l'identità del brand con un'immagine coerente e d'impatto.":`Wir entwerfen und produzieren Stände für Unternehmen aller Branchen — vom Design und Möbel über Food & Beverage bis zur Technologie — und stärken die Markenidentität mit einem stimmigen, wirkungsvollen Auftritt.`,
    "Le nostre strutture per stand su misura uniscono design, funzionalità e robustezza. Realizziamo pannelli tamburati leggeri e resistenti, perfetti per stand modulari facili da montare, trasportare e riutilizzare in diversi eventi.":`Unsere maßgefertigten Standstrukturen verbinden Design, Funktionalität und Robustheit. Wir fertigen leichte, widerstandsfähige Wabenplatten, ideal für modulare Stände, die sich leicht montieren, transportieren und bei verschiedenen Events wiederverwenden lassen.`,
    "Grazie all'esperienza nella lavorazione del legno e dei materiali compositi, realizziamo pannelli di alta qualità che coniugano estetica e durabilità. Offriamo assistenza completa, dalla progettazione alla consegna, con tempi di realizzazione rapidi.":`Dank unserer Erfahrung in der Verarbeitung von Holz und Verbundwerkstoffen fertigen wir hochwertige Platten, die Ästhetik und Langlebigkeit vereinen. Wir bieten umfassende Betreuung von der Planung bis zur Lieferung – mit kurzen Produktionszeiten.`,
    "Componentistica stand":`Standkomponenten`,
    "Ogni componente del tuo stand":`Jede <em>Komponente</em> Ihres Standes`,
    "👆 Clicca un componente per aprire la sua scheda tecnica":`<span class="cursor">👆</span> Auf eine Komponente klicken, um ihr Datenblatt zu öffnen`,
    "Pannelli tamburati":`Wabenplatten`,"Porte tamburate":`Waben-Türen`,"Pedane livellanti":`Nivellierpodeste`,"Accessori & giunzioni":`Zubehör & Verbindungen`,
    "Pannelli Tamburati":`Wabenplatten`,"Porte Tamburate":`Waben-Türen`,"Pedane Livellanti":`Nivellierpodeste`,"Accessori & Giunzioni":`Zubehör & Verbindungen`,
    "Grezzi, laminati, ignifughi, arte, rinforzati, extra-lunghi 6 m.":`Roh, laminiert, feuerfest, Art, verstärkt, extralang 6 m.`,
    "Grezze, laminate, ignifughe, con oblò, antipanico, scorrevoli, doppie.":`Roh, laminiert, feuerfest, mit Bullauge, Antipanik, Schiebe-, doppelt.`,
    "Tamburate grezze, forate per piedini regolabili. Anche su misura.":`Roh-Wabenplatten, gebohrt für verstellbare Füße. Auch nach Maß.`,
    "Anime di allineamento, giunzioni I·L·T·X, bordi e copriteste.":`Ausrichtkerne, I·L·T·X-Verbindungen, Kanten und Abdeckungen.`,
    "Produzione su misura":`Maßanfertigung`,
    "Soluzioni per allestimenti fieristici":`Lösungen für <em>Messebau</em>`,
    "Pannelli, muretti, colonne, porte e strutture personalizzate per stand fieristici, showroom e progetti espositivi.":`Platten, Mauern, Säulen, Türen und maßgefertigte Strukturen für Messestände, Showrooms und Ausstellungsprojekte.`,
    "Su misura":`Nach Maß`,"Finiture RAL":`RAL-Finish`,"Pronta consegna":`Sofort lieferbar`,"Curve custom":`Individuelle Kurven`,
    "Muretti in MDF":`MDF-Wände`,"Colonne Folding a Specchio":`Spiegel-Faltsäulen`,"Pannelli in pronta consegna":`Sofort lieferbare Platten`,"Pannelli Curvi":`Gebogene Platten`,
    "Muretti in MDF completamente personalizzati, progettati in base alle esigenze del cliente. Massima flessibilità su dimensioni, spessori e lavorazioni, con planarità e finiture di alta qualità.":`Vollständig individualisierte MDF-Wände, nach Kundenwunsch geplant. Maximale Flexibilität bei Maßen, Stärken und Bearbeitung, mit Ebenheit und hochwertigen Oberflächen.`,
    "Colonne folding rivestite a specchio, progettate su misura per valorizzare ogni spazio espositivo con forte impatto visivo. Personalizzabili in dimensioni, forme e finiture.":`Spiegelverkleidete Faltsäulen, maßgefertigt, um jeden Ausstellungsraum mit starker visueller Wirkung aufzuwerten. In Größe, Form und Finish anpassbar.`,
    "Pannelli laminati in diverse finiture e colori: bianco, nero, grigio e qualsiasi tonalità su specifica RAL. Uniformità cromatica, qualità delle superfici e precisione nelle lavorazioni.":`Laminierte Platten in verschiedenen Finishes und Farben: Weiß, Schwarz, Grau und jeder Farbton nach RAL. Farbgleichheit, Oberflächenqualität und Bearbeitungspräzision.`,
    "Pannelli tamburati per allestimenti fieristici, disponibili in soluzioni standard sempre in pronta consegna. Pedane sempre disponibili per rapidità e continuità.":`Wabenplatten für den Messebau, in Standardlösungen stets sofort lieferbar. Podeste immer verfügbar für Schnelligkeit und Kontinuität.`,
    "Pannelli curvi su misura, per soluzioni fluide e continue negli allestimenti. Ideali per stand dal forte impatto visivo, superano le geometrie tradizionali con massima libertà progettuale.":`Gebogene Platten nach Maß für fließende, durchgehende Aufbauten. Ideal für Stände mit starker Wirkung – sie überwinden traditionelle Geometrien mit maximaler Gestaltungsfreiheit.`,
    "Richiedi informazioni":`Informationen anfragen`,
    "Un progetto su misura?":`Ein maßgeschneidertes Projekt?`,
    "Inviaci il tuo disegno o le tue specifiche: realizziamo soluzioni personalizzate con consegna in fiera.":`Senden Sie uns Ihre Zeichnung oder Spezifikationen: Wir realisieren individuelle Lösungen mit Lieferung direkt zur Messe.`,
    "Contattaci":`Kontakt`,
    "Costruzione":`Konstruktion`,"Materiali di prima qualità":`Erstklassige Materialien`,
    "Ogni componente è selezionato per garantire stabilità e durata nel tempo, nel rispetto degli standard FederlegnoArredo.":`Jede Komponente wird ausgewählt, um dauerhafte Stabilität zu gewährleisten – gemäß den FederlegnoArredo-Standards.`,
    "Copertine":`Deckplatten`,"Levigate con cura per un incollaggio uniforme e resistente.":`Sorgfältig geschliffen für eine gleichmäßige, feste Verklebung.`,
    "Telaio":`Rahmen`,"Abete finger joint senza nodi, con aste intere.":`Astfreie Finger-Joint-Fichte mit durchgehenden Leisten.`,
    "Nido d'ape":`Wabe`,"Perforato ad alta grammatura per la massima stabilità.":`Hochgrammig perforiert für maximale Stabilität.`,
    "Sfiati sulle teste":`Kopfentlüftungen`,"Corretto deflusso dei gas in pressatura, senza rigonfiamenti.":`Korrekte Gasableitung beim Pressen, ohne Aufwölbungen.`,
    "Collanti":`Klebstoffe`,"Vinilici in classe 1, sinonimo di qualità e sicurezza.":`Vinylkleber der Klasse 1 – Synonym für Qualität und Sicherheit.`,
    "Ultimi progetti":`Neueste Projekte`,
    "Allestimenti e stand fieristici realizzati per brand internazionali, in Italia e nel mondo.":`Aufbauten und Messestände für internationale Marken – in Italien und weltweit.`,
    "Pronto a costruire il tuo stand?":`Bereit, Ihren Stand zu bauen?`,
    "Produciamo anche su misura e su disegno del cliente, con consegna in Italia e all'estero — anche direttamente in fiera.":`Wir produzieren auch nach Maß und nach Kundenzeichnung, mit Lieferung in Italien und im Ausland — auch direkt zur Messe.`,
    "Vai alle schede tecniche":`Zu den Datenblättern`,
    "Pannelli tamburati, porte e pedane su misura per stand fieristici, mostre, congressi ed esposizioni museali. Made in Italy.":`Wabenplatten, Türen und Podeste nach Maß für Messestände, Ausstellungen, Kongresse und Museumsausstellungen. Made in Italy.`,
    "Standard di qualità FederlegnoArredo":`FederlegnoArredo-Qualitätsstandard`,
    "Menù":`Menü`,"Carica progetto":`Projekt hochladen`,"FAQs":`FAQ`,"Verniciatura":`Lackierung`,"Seguici":`Folgen Sie uns`,"Richiedi preventivo":`Angebot anfordern`,
    "© 2025 Pan.door.a S.r.l. — Tutti i diritti riservati":`© 2025 Pan.door.a S.r.l. — Alle Rechte vorbehalten`
   }
  };

  /* ---------- dictionary (other pages) ---------- */
  const EX={
   en:{
    "Indietro":`Back`,"Home":`Home`,"Porte":`Doors`,"Pavimentazioni":`Flooring`,"Armadi":`Wardrobes`,
    "Pannelli Tamburati 1":`Hollow-core Panels 1`,"Pannelli Tamburati 2":`Hollow-core Panels 2`,
    "Contatti":`Contacts`,"Download":`Download`,"Catalogo":`Catalogue`,"Tutti i progetti":`All projects`,"Guarda la gallery":`View the gallery`,
    "© 2024 Pan.door.a — Tutti i diritti riservati":`© 2024 Pan.door.a — All rights reserved`,
    "Scopri":`Discover`,"Esplora":`Explore`,"Tutti":`All`,"Caratteristiche":`Features`,"Accessori":`Accessories`,
    "Prefinito":`Pre-finished`,"Lisca di pesce":`Herringbone`,"Spazzolato":`Brushed`,"Olio UV · 3 strati":`UV oil · 3 coats`,"Bordo vivo":`Square edge`,"Parquet Rovere":`Oak parquet`,
    "RAL personalizzato":`Custom RAL`,"Spazzolatura":`Brushing`,"Lacca lucida / opaca":`Gloss / matt lacquer`,"UV lucido":`Gloss UV`,"Effetto vintage":`Vintage effect`,
    "26 modelli":`26 models`,"Catalogo 2026":`Catalogue 2026`,"26 modelli · 3 linee · Su misura":`26 models · 3 lines · Made to measure`,"Tutti 26":`All 26`,"Laminata 4":`Laminated 4`,"Laccata 2":`Lacquered 2`,"Pantografata Superior 20":`Routed Superior 20`,
    "03 / 05 — PAVIMENTAZIONI":`03 / 05 — FLOORING`,
    "Parquet in rovere di qualità superiore, disponibile in posa a lisca di pesce, spazzolato, prefinito e con finitura ad olio UV a 3 strati. Il calore naturale del legno per ogni ambiente.":`Premium oak parquet, available in herringbone lay, brushed, pre-finished and with a 3-coat UV oil finish. The natural warmth of wood for every space.`,
    "Rovere europeo selezionato, con venatura naturale di pregio. Disponibile in diverse gradazioni cromatiche dal naturale al fumé.":`Selected European oak with fine natural grain. Available in various shades from natural to smoked.`,
    "Posa a lisca di pesce classica o francese. Un pattern intramontabile che valorizza ogni ambiente residenziale e contract di pregio.":`Classic or French herringbone lay. A timeless pattern that enhances any premium residential and contract space.`,
    "Finitura spazzolata che esalta la venatura del legno e conferisce un aspetto vissuto e autentico, riducendo la visibilità dei graffi.":`Brushed finish that highlights the wood grain and gives a lived-in, authentic look, reducing the visibility of scratches.`,
    "Olio UV a 3 strati":`3-coat UV oil`,
    "Trattamento ad olio UV in tre passaggi per una protezione profonda e duratura. Mantiene l'aspetto naturale del legno e facilita le riparazioni locali.":`Three-step UV oil treatment for deep, lasting protection. Keeps the natural look of the wood and makes local repairs easy.`,
    "Parquet prefinito con finitura in fabbrica per una posa rapida e risultati impeccabili. Pronto all'uso con zero tempi di asciugatura in cantiere.":`Pre-finished parquet with a factory finish for fast laying and flawless results. Ready to use with zero drying time on site.`,
    "Listoni con bordo vivo non smussato per giunzioni millimetriche e un effetto visivo continuo, tipico dei progetti di alto livello.":`Planks with a non-bevelled square edge for millimetric joints and a continuous visual effect, typical of high-end projects.`,
    "05 / 05 — VERNICIATURA · LACCATURA · LUCIDATURA":`05 / 05 — PAINTING · LACQUERING · POLISHING`,
    "Finitura professionale su legno e derivati: verniciatura a spruzzo, laccatura lucida e opaca, spazzolatura, effetto vintage e UV lucido. Ogni superficie diventa un'opera di precisione.":`Professional finishing on wood and derivatives: spray painting, gloss and matt lacquering, brushing, vintage effect and gloss UV. Every surface becomes a work of precision.`,
    "Verniciatura a spruzzo":`Spray painting`,
    "Applicazione a spruzzo con pistole airless e cabine a temperatura controllata. Risultato uniforme, privo di colature, su qualsiasi formato e geometria.":`Spray application with airless guns and temperature-controlled booths. Uniform result, free of drips, on any format and geometry.`,
    "Laccatura lucida":`Gloss lacquering`,
    "Lacca a specchio con riflessione totale della superficie. Richiede levigatura a più passaggi e lucidatura finale per un effetto piano e impeccabile.":`Mirror lacquer with total surface reflection. It requires multiple sanding passes and a final polish for a flat, flawless effect.`,
    "Laccatura opaca":`Matt lacquering`,
    "Finitura opaca vellutata dall'aspetto sofisticato e contemporaneo. Resistente alle impronte, disponibile in ogni tonalità RAL o NCS.":`Velvety matt finish with a sophisticated, contemporary look. Fingerprint-resistant, available in any RAL or NCS shade.`,
    "Trattamento meccanico con spazzole metalliche che esaltano la venatura naturale del legno, conferendo texture tattile e aspetto vissuto.":`Mechanical treatment with metal brushes that highlight the natural wood grain, giving a tactile texture and lived-in look.`,
    "Finitura UV polimerizzata sotto lampade a raggi ultravioletti per una durezza superficiale massima e un brillio estremo, resistente ai graffi.":`UV finish cured under ultraviolet lamps for maximum surface hardness and extreme shine, scratch-resistant.`,
    "Invecchiamento controllato con patine, velature e spazzolature combinate. Un risultato autentico e artigianale per progetti di design d'interni originali.":`Controlled ageing with combined patinas, glazes and brushing. An authentic, artisanal result for original interior design projects.`,
    "Hub › Componenti per Mobili":`Hub › Furniture Components`,"Componenti per Mobili":`Furniture components`,
    "Una gamma completa di elementi in legno per l'arredo su misura. Dall'anta laccata al piano lavoro, dal giroletto alla boiserie — tutto ciò che serve per costruire il mobile perfetto.":`A complete range of wooden elements for custom furniture. From the lacquered door to the worktop, from the bed frame to the panelling — everything you need to build the perfect piece.`,
    "Categorie":`Categories`,"Referenze":`References`,"Dal":`Since`,"Sfoglia il catalogo":`Browse the catalogue`,
    "Ante & Frontali":`Doors & Fronts`,"Pannelli & Superfici":`Panels & Surfaces`,"Strutture":`Structures`,"Decorativi":`Decorative`,
    "24 prodotti":`24 products`,"Cucina su misura":`Custom kitchen`,"Ante laccate":`Lacquered doors`,"Boiserie":`Wall panelling`,"Testiere letto":`Headboards`,
    "Il progetto":`The project`,"Altri progetti":`Other projects`,"Scopri gli altri allestimenti firmati Pan.door.a":`Discover the other setups by Pan.door.a`,
    "Pannelli tamburati · Porte · Pedane · Accessori per stand fieristici":`Hollow-core panels · Doors · Platforms · Accessories for trade-fair stands`,
    "Pannelli":`Panels`,"Pannelli Stand":`Stand panels`,"Porte Stand":`Stand doors`,"Pedane Livellanti Stand":`Stand levelling platforms`,
    "Anima di Allineamento":`Alignment core`,"Elemento di giunzione ( I )":`Joint element ( I )`,"Elemento di giunzione ( L )":`Joint element ( L )`,"Elemento di giunzione ( T )":`Joint element ( T )`,"Elemento di giunzione ( X )":`Joint element ( X )`,
    "Bordi di finitura":`Finishing edges`,"Copritesta Finitura":`End-cap finish`,"Gamma prodotti":`Product range`,
    "Richiedi un preventivo":`Request a quote`,"Raccontaci il tuo progetto: ti rispondiamo con una soluzione su misura.":`Tell us about your project: we'll reply with a tailored solution.`,
    "Nome":`Name`,"Email":`Email`,"Telefono":`Phone`,"Messaggio":`Message`,"Invia richiesta":`Send request`,
    "✓ Richiesta inviata. Ti ricontatteremo al più presto.":`✓ Request sent. We'll get back to you soon.`,
    "Eccellenza italiana in legno":`Italian excellence in wood`,"Scegli la tua area":`Choose your area`,
    "Struttura alveolare":`Honeycomb structure`,"Telaio in abete":`Spruce frame`,"Laccati / opachi":`Lacquered / matt`,"Per allestimenti fieristici":`For trade-fair setups`,
    "Laminata · Laccata":`Laminated · Lacquered`,"Pantografata Superior":`Routed Superior`,"Laccato RAL":`RAL lacquered`,"Battente / Scorrevole":`Hinged / Sliding`,
    "Frontali":`Fronts`,"Piani lavoro":`Worktops`,"Fianchi":`Side panels`,"Mensole su misura":`Custom shelves`,
    "Verniciatura Laccatura Lucidatura":`Painting Lacquering Polishing`
   },
   fr:{
    "Indietro":`Retour`,"Home":`Accueil`,"Porte":`Portes`,"Pavimentazioni":`Sols`,"Armadi":`Armoires`,
    "Pannelli Tamburati 1":`Panneaux alvéolaires 1`,"Pannelli Tamburati 2":`Panneaux alvéolaires 2`,
    "Contatti":`Contacts`,"Download":`Télécharger`,"Catalogo":`Catalogue`,"Tutti i progetti":`Tous les projets`,"Guarda la gallery":`Voir la galerie`,
    "© 2024 Pan.door.a — Tutti i diritti riservati":`© 2024 Pan.door.a — Tous droits réservés`,
    "Scopri":`Découvrir`,"Esplora":`Explorer`,"Tutti":`Tous`,"Caratteristiche":`Caractéristiques`,"Accessori":`Accessoires`,
    "Prefinito":`Préfini`,"Lisca di pesce":`Chevrons`,"Spazzolato":`Brossé`,"Olio UV · 3 strati":`Huile UV · 3 couches`,"Bordo vivo":`Bord vif`,"Parquet Rovere":`Parquet chêne`,
    "RAL personalizzato":`RAL personnalisé`,"Spazzolatura":`Brossage`,"Lacca lucida / opaca":`Laque brillante / mate`,"UV lucido":`UV brillant`,"Effetto vintage":`Effet vintage`,
    "26 modelli":`26 modèles`,"Catalogo 2026":`Catalogue 2026`,"26 modelli · 3 linee · Su misura":`26 modèles · 3 lignes · Sur mesure`,"Tutti 26":`Les 26`,"Laminata 4":`Laminée 4`,"Laccata 2":`Laquée 2`,"Pantografata Superior 20":`Pantographée Superior 20`,
    "03 / 05 — PAVIMENTAZIONI":`03 / 05 — SOLS`,
    "Parquet in rovere di qualità superiore, disponibile in posa a lisca di pesce, spazzolato, prefinito e con finitura ad olio UV a 3 strati. Il calore naturale del legno per ogni ambiente.":`Parquet en chêne de qualité supérieure, disponible en pose à chevrons, brossé, préfini et avec finition à l'huile UV en 3 couches. La chaleur naturelle du bois pour chaque pièce.`,
    "Rovere europeo selezionato, con venatura naturale di pregio. Disponibile in diverse gradazioni cromatiche dal naturale al fumé.":`Chêne européen sélectionné, au veinage naturel de qualité. Disponible en diverses teintes, du naturel au fumé.`,
    "Posa a lisca di pesce classica o francese. Un pattern intramontabile che valorizza ogni ambiente residenziale e contract di pregio.":`Pose à chevrons classique ou française. Un motif intemporel qui valorise tout espace résidentiel et contract haut de gamme.`,
    "Finitura spazzolata che esalta la venatura del legno e conferisce un aspetto vissuto e autentico, riducendo la visibilità dei graffi.":`Finition brossée qui met en valeur le veinage du bois et donne un aspect vécu et authentique, réduisant la visibilité des rayures.`,
    "Olio UV a 3 strati":`Huile UV 3 couches`,
    "Trattamento ad olio UV in tre passaggi per una protezione profonda e duratura. Mantiene l'aspetto naturale del legno e facilita le riparazioni locali.":`Traitement à l'huile UV en trois passages pour une protection profonde et durable. Conserve l'aspect naturel du bois et facilite les réparations locales.`,
    "Parquet prefinito con finitura in fabbrica per una posa rapida e risultati impeccabili. Pronto all'uso con zero tempi di asciugatura in cantiere.":`Parquet préfini avec finition en usine pour une pose rapide et des résultats impeccables. Prêt à l'emploi, sans temps de séchage sur chantier.`,
    "Listoni con bordo vivo non smussato per giunzioni millimetriche e un effetto visivo continuo, tipico dei progetti di alto livello.":`Lames à bord vif non biseauté pour des jonctions millimétriques et un effet visuel continu, typique des projets haut de gamme.`,
    "05 / 05 — VERNICIATURA · LACCATURA · LUCIDATURA":`05 / 05 — PEINTURE · LAQUAGE · POLISSAGE`,
    "Finitura professionale su legno e derivati: verniciatura a spruzzo, laccatura lucida e opaca, spazzolatura, effetto vintage e UV lucido. Ogni superficie diventa un'opera di precisione.":`Finition professionnelle sur bois et dérivés : peinture au pistolet, laquage brillant et mat, brossage, effet vintage et UV brillant. Chaque surface devient une œuvre de précision.`,
    "Verniciatura a spruzzo":`Peinture au pistolet`,
    "Applicazione a spruzzo con pistole airless e cabine a temperatura controllata. Risultato uniforme, privo di colature, su qualsiasi formato e geometria.":`Application au pistolet airless et cabines à température contrôlée. Résultat uniforme, sans coulures, sur tout format et géométrie.`,
    "Laccatura lucida":`Laquage brillant`,
    "Lacca a specchio con riflessione totale della superficie. Richiede levigatura a più passaggi e lucidatura finale per un effetto piano e impeccabile.":`Laque miroir à réflexion totale de la surface. Nécessite plusieurs ponçages et un polissage final pour un effet plan et impeccable.`,
    "Laccatura opaca":`Laquage mat`,
    "Finitura opaca vellutata dall'aspetto sofisticato e contemporaneo. Resistente alle impronte, disponibile in ogni tonalità RAL o NCS.":`Finition mate veloutée à l'aspect sophistiqué et contemporain. Résistante aux traces de doigts, disponible dans toute teinte RAL ou NCS.`,
    "Trattamento meccanico con spazzole metalliche che esaltano la venatura naturale del legno, conferendo texture tattile e aspetto vissuto.":`Traitement mécanique avec brosses métalliques qui mettent en valeur le veinage naturel du bois, donnant une texture tactile et un aspect vécu.`,
    "Finitura UV polimerizzata sotto lampade a raggi ultravioletti per una durezza superficiale massima e un brillio estremo, resistente ai graffi.":`Finition UV polymérisée sous lampes à rayons ultraviolets pour une dureté de surface maximale et une brillance extrême, résistante aux rayures.`,
    "Invecchiamento controllato con patine, velature e spazzolature combinate. Un risultato autentico e artigianale per progetti di design d'interni originali.":`Vieillissement contrôlé avec patines, glacis et brossages combinés. Un résultat authentique et artisanal pour des projets de design d'intérieur originaux.`,
    "Hub › Componenti per Mobili":`Hub › Composants de meubles`,"Componenti per Mobili":`Composants de meubles`,
    "Una gamma completa di elementi in legno per l'arredo su misura. Dall'anta laccata al piano lavoro, dal giroletto alla boiserie — tutto ciò che serve per costruire il mobile perfetto.":`Une gamme complète d'éléments en bois pour l'ameublement sur mesure. De la porte laquée au plan de travail, du sommier à la boiserie — tout ce qu'il faut pour construire le meuble parfait.`,
    "Categorie":`Catégories`,"Referenze":`Références`,"Dal":`Depuis`,"Sfoglia il catalogo":`Parcourir le catalogue`,
    "Ante & Frontali":`Portes & Façades`,"Pannelli & Superfici":`Panneaux & Surfaces`,"Strutture":`Structures`,"Decorativi":`Décoratifs`,
    "24 prodotti":`24 produits`,"Cucina su misura":`Cuisine sur mesure`,"Ante laccate":`Portes laquées`,"Boiserie":`Boiseries`,"Testiere letto":`Têtes de lit`,
    "Il progetto":`Le projet`,"Altri progetti":`Autres projets`,"Scopri gli altri allestimenti firmati Pan.door.a":`Découvrez les autres aménagements signés Pan.door.a`,
    "Pannelli tamburati · Porte · Pedane · Accessori per stand fieristici":`Panneaux alvéolaires · Portes · Plateformes · Accessoires pour stands de salon`,
    "Pannelli":`Panneaux`,"Pannelli Stand":`Panneaux de stand`,"Porte Stand":`Portes de stand`,"Pedane Livellanti Stand":`Plateformes de mise à niveau`,
    "Anima di Allineamento":`Âme d'alignement`,"Elemento di giunzione ( I )":`Élément de jonction ( I )`,"Elemento di giunzione ( L )":`Élément de jonction ( L )`,"Elemento di giunzione ( T )":`Élément de jonction ( T )`,"Elemento di giunzione ( X )":`Élément de jonction ( X )`,
    "Bordi di finitura":`Bords de finition`,"Copritesta Finitura":`Cache-tête finition`,"Gamma prodotti":`Gamme de produits`,
    "Richiedi un preventivo":`Demander un devis`,"Raccontaci il tuo progetto: ti rispondiamo con una soluzione su misura.":`Parlez-nous de votre projet : nous vous répondons avec une solution sur mesure.`,
    "Nome":`Nom`,"Email":`E-mail`,"Telefono":`Téléphone`,"Messaggio":`Message`,"Invia richiesta":`Envoyer la demande`,
    "✓ Richiesta inviata. Ti ricontatteremo al più presto.":`✓ Demande envoyée. Nous vous recontacterons bientôt.`,
    "Eccellenza italiana in legno":`L'excellence italienne du bois`,"Scegli la tua area":`Choisissez votre domaine`,
    "Struttura alveolare":`Structure alvéolaire`,"Telaio in abete":`Cadre en épicéa`,"Laccati / opachi":`Laqués / mats`,"Per allestimenti fieristici":`Pour aménagements de salons`,
    "Laminata · Laccata":`Laminée · Laquée`,"Pantografata Superior":`Pantographée Superior`,"Laccato RAL":`Laqué RAL`,"Battente / Scorrevole":`Battante / Coulissante`,
    "Frontali":`Façades`,"Piani lavoro":`Plans de travail`,"Fianchi":`Côtés`,"Mensole su misura":`Étagères sur mesure`,
    "Verniciatura Laccatura Lucidatura":`Peinture Laquage Polissage`
   },
   de:{
    "Indietro":`Zurück`,"Home":`Startseite`,"Porte":`Türen`,"Pavimentazioni":`Bodenbeläge`,"Armadi":`Schränke`,
    "Pannelli Tamburati 1":`Wabenplatten 1`,"Pannelli Tamburati 2":`Wabenplatten 2`,
    "Contatti":`Kontakte`,"Download":`Download`,"Catalogo":`Katalog`,"Tutti i progetti":`Alle Projekte`,"Guarda la gallery":`Zur Galerie`,
    "© 2024 Pan.door.a — Tutti i diritti riservati":`© 2024 Pan.door.a — Alle Rechte vorbehalten`,
    "Scopri":`Entdecken`,"Esplora":`Entdecken`,"Tutti":`Alle`,"Caratteristiche":`Merkmale`,"Accessori":`Zubehör`,
    "Prefinito":`Fertigparkett`,"Lisca di pesce":`Fischgrät`,"Spazzolato":`Gebürstet`,"Olio UV · 3 strati":`UV-Öl · 3 Schichten`,"Bordo vivo":`Scharfe Kante`,"Parquet Rovere":`Eichenparkett`,
    "RAL personalizzato":`Individuelles RAL`,"Spazzolatura":`Bürsten`,"Lacca lucida / opaca":`Glanz- / Mattlack`,"UV lucido":`UV-Glanz`,"Effetto vintage":`Vintage-Effekt`,
    "26 modelli":`26 Modelle`,"Catalogo 2026":`Katalog 2026`,"26 modelli · 3 linee · Su misura":`26 Modelle · 3 Linien · Nach Maß`,"Tutti 26":`Alle 26`,"Laminata 4":`Laminiert 4`,"Laccata 2":`Lackiert 2`,"Pantografata Superior 20":`Gefräst Superior 20`,
    "03 / 05 — PAVIMENTAZIONI":`03 / 05 — BODENBELÄGE`,
    "Parquet in rovere di qualità superiore, disponibile in posa a lisca di pesce, spazzolato, prefinito e con finitura ad olio UV a 3 strati. Il calore naturale del legno per ogni ambiente.":`Hochwertiges Eichenparkett, erhältlich in Fischgrätverlegung, gebürstet, fertig und mit 3-Schicht-UV-Öl-Finish. Die natürliche Wärme des Holzes für jeden Raum.`,
    "Rovere europeo selezionato, con venatura naturale di pregio. Disponibile in diverse gradazioni cromatiche dal naturale al fumé.":`Ausgewählte europäische Eiche mit edler natürlicher Maserung. Erhältlich in verschiedenen Farbtönen von natur bis geräuchert.`,
    "Posa a lisca di pesce classica o francese. Un pattern intramontabile che valorizza ogni ambiente residenziale e contract di pregio.":`Klassische oder französische Fischgrätverlegung. Ein zeitloses Muster, das jeden hochwertigen Wohn- und Objektbereich aufwertet.`,
    "Finitura spazzolata che esalta la venatura del legno e conferisce un aspetto vissuto e autentico, riducendo la visibilità dei graffi.":`Gebürstetes Finish, das die Holzmaserung betont und einen gelebten, authentischen Look verleiht und Kratzer weniger sichtbar macht.`,
    "Olio UV a 3 strati":`3-Schicht-UV-Öl`,
    "Trattamento ad olio UV in tre passaggi per una protezione profonda e duratura. Mantiene l'aspetto naturale del legno e facilita le riparazioni locali.":`UV-Öl-Behandlung in drei Durchgängen für tiefen, dauerhaften Schutz. Erhält den natürlichen Holzlook und erleichtert lokale Reparaturen.`,
    "Parquet prefinito con finitura in fabbrica per una posa rapida e risultati impeccabili. Pronto all'uso con zero tempi di asciugatura in cantiere.":`Fertigparkett mit werkseitiger Oberfläche für schnelle Verlegung und makellose Ergebnisse. Sofort einsatzbereit, ohne Trocknungszeit auf der Baustelle.`,
    "Listoni con bordo vivo non smussato per giunzioni millimetriche e un effetto visivo continuo, tipico dei progetti di alto livello.":`Dielen mit scharfer, nicht gefaster Kante für millimetergenaue Fugen und einen durchgehenden Look, typisch für hochwertige Projekte.`,
    "05 / 05 — VERNICIATURA · LACCATURA · LUCIDATURA":`05 / 05 — LACKIEREN · LACKIERUNG · POLITUR`,
    "Finitura professionale su legno e derivati: verniciatura a spruzzo, laccatura lucida e opaca, spazzolatura, effetto vintage e UV lucido. Ogni superficie diventa un'opera di precisione.":`Professionelle Oberflächenbehandlung auf Holz und Holzwerkstoffen: Spritzlackierung, Glanz- und Mattlackierung, Bürsten, Vintage-Effekt und UV-Glanz. Jede Oberfläche wird zum Präzisionswerk.`,
    "Verniciatura a spruzzo":`Spritzlackierung`,
    "Applicazione a spruzzo con pistole airless e cabine a temperatura controllata. Risultato uniforme, privo di colature, su qualsiasi formato e geometria.":`Spritzauftrag mit Airless-Pistolen und temperaturgeregelten Kabinen. Gleichmäßiges Ergebnis ohne Läufer, auf jedem Format und jeder Geometrie.`,
    "Laccatura lucida":`Glanzlackierung`,
    "Lacca a specchio con riflessione totale della superficie. Richiede levigatura a più passaggi e lucidatura finale per un effetto piano e impeccabile.":`Spiegellack mit vollständiger Oberflächenreflexion. Erfordert mehrfaches Schleifen und abschließende Politur für einen ebenen, makellosen Effekt.`,
    "Laccatura opaca":`Mattlackierung`,
    "Finitura opaca vellutata dall'aspetto sofisticato e contemporaneo. Resistente alle impronte, disponibile in ogni tonalità RAL o NCS.":`Samtig-matte Oberfläche mit edlem, zeitgemäßem Look. Fingerabdruckbeständig, erhältlich in jedem RAL- oder NCS-Ton.`,
    "Trattamento meccanico con spazzole metalliche che esaltano la venatura naturale del legno, conferendo texture tattile e aspetto vissuto.":`Mechanische Behandlung mit Metallbürsten, die die natürliche Holzmaserung betonen und eine fühlbare Textur sowie einen gelebten Look verleihen.`,
    "Finitura UV polimerizzata sotto lampade a raggi ultravioletti per una durezza superficiale massima e un brillio estremo, resistente ai graffi.":`Unter UV-Lampen ausgehärtetes UV-Finish für maximale Oberflächenhärte und extremen Glanz, kratzfest.`,
    "Invecchiamento controllato con patine, velature e spazzolature combinate. Un risultato autentico e artigianale per progetti di design d'interni originali.":`Kontrollierte Alterung mit kombinierten Patinen, Lasuren und Bürstungen. Ein authentisches, handwerkliches Ergebnis für originelle Interior-Design-Projekte.`,
    "Hub › Componenti per Mobili":`Hub › Möbelkomponenten`,"Componenti per Mobili":`Möbelkomponenten`,
    "Una gamma completa di elementi in legno per l'arredo su misura. Dall'anta laccata al piano lavoro, dal giroletto alla boiserie — tutto ciò che serve per costruire il mobile perfetto.":`Ein komplettes Sortiment an Holzelementen für Möbel nach Maß. Von der lackierten Tür bis zur Arbeitsplatte, vom Bettrahmen bis zur Vertäfelung — alles, um das perfekte Möbelstück zu bauen.`,
    "Categorie":`Kategorien`,"Referenze":`Referenzen`,"Dal":`Seit`,"Sfoglia il catalogo":`Katalog durchblättern`,
    "Ante & Frontali":`Türen & Fronten`,"Pannelli & Superfici":`Platten & Oberflächen`,"Strutture":`Strukturen`,"Decorativi":`Dekorativ`,
    "24 prodotti":`24 Produkte`,"Cucina su misura":`Küche nach Maß`,"Ante laccate":`Lackierte Türen`,"Boiserie":`Wandvertäfelung`,"Testiere letto":`Kopfteile`,
    "Il progetto":`Das Projekt`,"Altri progetti":`Weitere Projekte`,"Scopri gli altri allestimenti firmati Pan.door.a":`Entdecken Sie die weiteren Aufbauten von Pan.door.a`,
    "Pannelli tamburati · Porte · Pedane · Accessori per stand fieristici":`Wabenplatten · Türen · Podeste · Zubehör für Messestände`,
    "Pannelli":`Platten`,"Pannelli Stand":`Standplatten`,"Porte Stand":`Standtüren`,"Pedane Livellanti Stand":`Nivellierpodeste`,
    "Anima di Allineamento":`Ausrichtkern`,"Elemento di giunzione ( I )":`Verbindungselement ( I )`,"Elemento di giunzione ( L )":`Verbindungselement ( L )`,"Elemento di giunzione ( T )":`Verbindungselement ( T )`,"Elemento di giunzione ( X )":`Verbindungselement ( X )`,
    "Bordi di finitura":`Abschlusskanten`,"Copritesta Finitura":`Kopfabdeckung`,"Gamma prodotti":`Produktpalette`,
    "Richiedi un preventivo":`Angebot anfordern`,"Raccontaci il tuo progetto: ti rispondiamo con una soluzione su misura.":`Erzählen Sie uns von Ihrem Projekt: Wir antworten mit einer maßgeschneiderten Lösung.`,
    "Nome":`Name`,"Email":`E-Mail`,"Telefono":`Telefon`,"Messaggio":`Nachricht`,"Invia richiesta":`Anfrage senden`,
    "✓ Richiesta inviata. Ti ricontatteremo al più presto.":`✓ Anfrage gesendet. Wir melden uns bald.`,
    "Eccellenza italiana in legno":`Italienische Exzellenz in Holz`,"Scegli la tua area":`Wählen Sie Ihren Bereich`,
    "Struttura alveolare":`Wabenstruktur`,"Telaio in abete":`Fichtenrahmen`,"Laccati / opachi":`Lackiert / matt`,"Per allestimenti fieristici":`Für Messebau`,
    "Laminata · Laccata":`Laminiert · Lackiert`,"Pantografata Superior":`Gefräst Superior`,"Laccato RAL":`RAL-lackiert`,"Battente / Scorrevole":`Dreh- / Schiebe-`,
    "Frontali":`Fronten`,"Piani lavoro":`Arbeitsplatten`,"Fianchi":`Seitenteile`,"Mensole su misura":`Regale nach Maß`,
    "Verniciatura Laccatura Lucidatura":`Lackieren Lackierung Politur`
   }
  };
  Object.assign(T.en,EX.en);Object.assign(T.fr,EX.fr);Object.assign(T.de,EX.de);

  /* ---------- pavimentazioni: essenze + testi estesi ---------- */
  const PAV={
   en:{
    "Essenze":"Wood species",
    "Ogni pavimento nasce da tre decisioni: l'essenza, il disegno di posa e la finitura. Sono queste tre scelte, non il prezzo del metro quadro, a determinare come il legno invecchierà nei prossimi trent'anni. Qui sotto le lavorazioni che eseguiamo di serie, tutte disponibili su ognuna delle nove essenze del nostro catalogo.":"Every floor starts with three decisions: the wood species, the laying pattern and the finish. It is these three choices, not the price per square metre, that determine how the wood will age over the next thirty years. Below are the processes we carry out as standard, all available on each of the nine species in our catalogue.",
    "Rovere europeo di prima scelta, stagionato e selezionato listone per listone. La fibra compatta garantisce stabilità dimensionale e resistenza all'usura nel tempo; la venatura naturale — dal fiore cattedrale alla rigatura verticale — copre una gamma cromatica che va dal naturale chiarissimo al fumé. Disponibile in larghezze maxi e lunghezze fuori standard su richiesta.":"Prime-grade European oak, seasoned and selected plank by plank. The dense fibre guarantees dimensional stability and lasting wear resistance; the natural grain — from cathedral figure to vertical rift — covers a colour range from the palest natural to smoked. Available in maxi widths and non-standard lengths on request.",
    "La posa a lisca di pesce — italiana a 90°, francese o ungherese a 45° e 60° — è il modo più raffinato di far lavorare la luce sul legno. Ogni listello viene tagliato con tolleranze millimetriche perché il disegno resti perfettamente chiuso lungo tutta la stanza. Un pattern intramontabile, che valorizza tanto un appartamento storico quanto un contract di alto profilo.":"Herringbone laying — Italian at 90°, French or Hungarian at 45° and 60° — is the most refined way to make light work across the wood. Every strip is cut to millimetric tolerances so the pattern stays perfectly closed across the whole room. A timeless pattern that enhances a period apartment and a high-profile contract project alike.",
    "La spazzolatura asporta meccanicamente la parte più tenera del legno primaverile e lascia in rilievo la fibra dura. Il risultato è una superficie viva al tatto, con una profondità che nessuna finitura liscia può restituire. In più il rilievo maschera micrograffi e segni d'uso: un pavimento che invecchia bene, invece di consumarsi.":"Brushing mechanically removes the softer early wood and leaves the hard fibre in relief. The result is a surface that is alive to the touch, with a depth no smooth finish can reproduce. The relief also masks micro-scratches and marks of use: a floor that ages well instead of wearing out.",
    "Tre passaggi di olio polimerizzato ai raggi UV: il primo penetra e nutre la fibra, i successivi costruiscono una protezione che regge acqua, macchie e traffico intenso. A differenza di una vernice filmogena l'olio non crea una pellicola — il legno resta legno — e un eventuale danno si ripara localmente, senza levigare l'intero ambiente.":"Three coats of UV-cured oil: the first penetrates and nourishes the fibre, the following ones build up protection against water, stains and heavy traffic. Unlike a film-forming lacquer, oil creates no film — the wood stays wood — and any damage can be repaired locally, without sanding the whole room.",
    "Il prefinito arriva in cantiere già levigato e finito in fabbrica, in condizioni di temperatura e umidità controllate: un livello di qualità che sul posto non è replicabile. Si posa e si cammina lo stesso giorno — zero polveri di levigatura, zero odori di finitura, zero tempi morti. Il supporto multistrato incrociato lo rende inoltre ideale sopra impianti radianti.":"Pre-finished parquet arrives on site already sanded and finished in the factory, under controlled temperature and humidity: a level of quality that cannot be replicated on site. Lay it and walk on it the same day — no sanding dust, no finishing fumes, no downtime. The cross-bonded multilayer core also makes it ideal over underfloor heating.",
    "Il bordo vivo, non smussato, è la scelta di chi vuole una superficie continua. Le giunzioni si chiudono a filo e l'occhio legge il pavimento come un piano unico, non come una somma di listoni. Richiede una lavorazione più precisa in produzione e un massetto perfettamente in piano: per questo è il dettaglio che distingue i progetti di alto livello.":"The square, non-bevelled edge is the choice for anyone who wants a continuous surface. The joints close flush and the eye reads the floor as a single plane, not as a sum of planks. It demands more precise machining in production and a perfectly level screed: which is why it is the detail that sets high-end projects apart.",
    "Nove essenze selezionate, tutte disponibili nelle lavorazioni e finiture descritte sopra. Ogni legno ha una durezza, un colore e un comportamento diversi: la scelta dell'essenza è la prima decisione di progetto, quella che condiziona tutte le altre.":"Nine selected species, all available in the processes and finishes described above. Each wood has a different hardness, colour and behaviour: choosing the species is the first design decision, the one that conditions all the others.",
    "Essenza Rovere":"Oak",
    "Essenza Noce":"European Walnut",
    "Essenza Frassino":"Ash",
    "Essenza Olmo":"Elm",
    "Essenza Larice":"Larch",
    "Essenza Acero":"Maple",
    "Essenza Frassino Olivato":"Olive Ash",
    "Essenza Larice Evaporato":"Steamed Larch",
    "Essenza Noce Americano":"American Black Walnut",
    "L'essenza più richiesta, e non per caso: durissima, stabile, con una venatura di grande carattere. Accoglie qualsiasi finitura — naturale, sbiancata, fumé, oliata — restando sempre riconoscibile. La scelta sicura per residenziale e contract.":"The most requested species, and not by chance: very hard, stable, with a grain of real character. It takes any finish — natural, bleached, smoked, oiled — while always staying recognisable. The safe choice for residential and contract.",
    "Bruno profondo con sfumature violacee e venature marcate. Il noce europeo è il legno dell'eleganza classica: scalda l'ambiente e crea contrasto con arredi e pareti chiare. Media durezza, ottima lavorabilità, resa cromatica inconfondibile.":"Deep brown with violet undertones and pronounced grain. European walnut is the wood of classic elegance: it warms the room and creates contrast with light furniture and walls. Medium hardness, excellent workability, unmistakable colour.",
    "Chiarissimo, quasi biondo, con fibra dritta e disegno molto grafico. Duro ed elastico insieme, sopporta bene i carichi. Ideale negli ambienti luminosi e contemporanei, e come base per finiture sbiancate o tinte a campione.":"Very light, almost blond, with straight fibre and a strongly graphic figure. Hard and elastic at once, it takes loads well. Ideal in bright, contemporary spaces and as a base for bleached finishes or custom-matched stains.",
    "Bruno caldo tendente al rossiccio, con venature irregolari e nodi a vista. Un legno dal carattere rustico e ricercato allo stesso tempo: la scelta giusta quando si cerca personalità invece di uniformità.":"Warm brown tending to reddish, with irregular grain and visible knots. A wood that is rustic and sophisticated at the same time: the right choice when you are after character rather than uniformity.",
    "Conifera alpina dal tono ambrato e dagli anelli di crescita molto contrastati. Leggero, resinoso, naturalmente durevole. Restituisce l'atmosfera della montagna anche in un contesto urbano, con un costo al metro contenuto.":"Alpine conifer with an amber tone and strongly contrasted growth rings. Light, resinous, naturally durable. It brings a mountain atmosphere even into an urban setting, at a contained cost per square metre.",
    "Il più chiaro della gamma: bianco crema, fibra finissima e quasi priva di disegno. Superficie liscia e luminosa, per progetti minimali dove il pavimento deve sparire e lasciar parlare lo spazio.":"The lightest of the range: creamy white, very fine fibre and almost no figure. A smooth, luminous surface for minimal projects where the floor should disappear and let the space speak.",
    "Il cuore scuro del frassino in contrasto con l'alburno chiaro: un disegno naturale a bande che ricorda l'olivo. Ogni listone è diverso dall'altro. Da usare come elemento decorativo del progetto, non come sfondo neutro.":"The dark heartwood of ash against the pale sapwood: a natural banded figure reminiscent of olive. Every plank is different from the next. To be used as a decorative element of the project, not as a neutral background.",
    "Larice trattato a vapore: il calore uniforma il colore in profondità, non solo in superficie, portandolo a un bruno ambrato caldo e stabile nel tempo. Mantiene il disegno degli anelli e perde la disomogeneità del legno grezzo.":"Steam-treated larch: heat evens out the colour right through the board, not just on the surface, bringing it to a warm amber brown that stays stable over time. It keeps the ring figure and loses the unevenness of raw timber.",
    "Più uniforme e più scuro del noce europeo, con fondo cioccolato e riflessi caldi. Fibra dritta, poche irregolarità: il legno da grandi superfici, quando si vuole profondità di colore senza rumore visivo.":"More uniform and darker than European walnut, with a chocolate base and warm reflections. Straight fibre, few irregularities: the wood for large surfaces, when you want depth of colour without visual noise.",
    "Su misura, dal listone al cantiere.":"Made to measure, from the plank to the site.",
    "Tutti i nostri parquet sono realizzati con legno selezionato ad alta resistenza all'usura, con una stabilità dimensionale che riduce i movimenti naturali del legno e con la possibilità di finiture personalizzate — opaca, satinata, spazzolata, sbiancata, fumé, oliata o tinta a campione.":"All our parquet is made from selected timber with high wear resistance, with a dimensional stability that reduces the natural movement of the wood, and with the option of custom finishes — matt, satin, brushed, bleached, smoked, oiled or stained to sample.",
    "Produciamo e posiamo parquet su misura, secondo le specifiche e lo stile richiesti dal cliente: formati fuori standard, disegni di posa dedicati, abbinamenti tra essenze diverse, raccordi con altri materiali. Consegniamo e installiamo in tutto il mondo, anche direttamente in location espositive o residenziali.":"We manufacture and lay made-to-measure parquet, to the specifications and style requested by the client: non-standard formats, dedicated laying patterns, combinations of different species, transitions to other materials. We deliver and install worldwide, including directly in exhibition or residential locations.",
    "Listoni tradizionali":"Traditional planks",
    "Spina italiana 90°":"Italian herringbone 90°",
    "Spina ungherese 45° / 60°":"Hungarian point 45° / 60°",
    "Maxi-doghe":"Maxi planks",
    "Tavole rustiche":"Rustic boards",
    "Posa su riscaldamento a pavimento":"Underfloor-heating compatible",
    "Posa e assistenza in cantiere":"Laying and on-site support"
   },
   fr:{
    "Essenze":"Essences",
    "Ogni pavimento nasce da tre decisioni: l'essenza, il disegno di posa e la finitura. Sono queste tre scelte, non il prezzo del metro quadro, a determinare come il legno invecchierà nei prossimi trent'anni. Qui sotto le lavorazioni che eseguiamo di serie, tutte disponibili su ognuna delle nove essenze del nostro catalogo.":"Chaque sol naît de trois décisions : l'essence, le schéma de pose et la finition. Ce sont ces trois choix, et non le prix au mètre carré, qui déterminent la façon dont le bois vieillira dans les trente prochaines années. Ci-dessous les traitements que nous réalisons en série, tous disponibles sur chacune des neuf essences de notre catalogue.",
    "Rovere europeo di prima scelta, stagionato e selezionato listone per listone. La fibra compatta garantisce stabilità dimensionale e resistenza all'usura nel tempo; la venatura naturale — dal fiore cattedrale alla rigatura verticale — copre una gamma cromatica che va dal naturale chiarissimo al fumé. Disponibile in larghezze maxi e lunghezze fuori standard su richiesta.":"Chêne européen de premier choix, séché et sélectionné lame par lame. La fibre dense garantit stabilité dimensionnelle et résistance à l'usure dans le temps ; le veinage naturel — de la flamme cathédrale au fil vertical — couvre une gamme allant du naturel très clair au fumé. Disponible en largeurs maxi et longueurs hors standard sur demande.",
    "La posa a lisca di pesce — italiana a 90°, francese o ungherese a 45° e 60° — è il modo più raffinato di far lavorare la luce sul legno. Ogni listello viene tagliato con tolleranze millimetriche perché il disegno resti perfettamente chiuso lungo tutta la stanza. Un pattern intramontabile, che valorizza tanto un appartamento storico quanto un contract di alto profilo.":"La pose à bâtons rompus — italienne à 90°, française ou hongroise à 45° et 60° — est la manière la plus raffinée de faire travailler la lumière sur le bois. Chaque lamelle est coupée au millimètre pour que le dessin reste parfaitement fermé sur toute la pièce. Un motif intemporel, qui valorise autant un appartement ancien qu'un projet contract haut de gamme.",
    "La spazzolatura asporta meccanicamente la parte più tenera del legno primaverile e lascia in rilievo la fibra dura. Il risultato è una superficie viva al tatto, con una profondità che nessuna finitura liscia può restituire. In più il rilievo maschera micrograffi e segni d'uso: un pavimento che invecchia bene, invece di consumarsi.":"Le brossage retire mécaniquement la partie tendre du bois de printemps et laisse la fibre dure en relief. Le résultat est une surface vivante au toucher, avec une profondeur qu'aucune finition lisse ne peut restituer. Le relief masque en outre les micro-rayures et les traces d'usage : un sol qui vieillit bien au lieu de s'user.",
    "Tre passaggi di olio polimerizzato ai raggi UV: il primo penetra e nutre la fibra, i successivi costruiscono una protezione che regge acqua, macchie e traffico intenso. A differenza di una vernice filmogena l'olio non crea una pellicola — il legno resta legno — e un eventuale danno si ripara localmente, senza levigare l'intero ambiente.":"Trois couches d'huile polymérisée aux UV : la première pénètre et nourrit la fibre, les suivantes construisent une protection qui résiste à l'eau, aux taches et au trafic intense. Contrairement à un vernis filmogène, l'huile ne crée pas de pellicule — le bois reste du bois — et un dommage éventuel se répare localement, sans poncer toute la pièce.",
    "Il prefinito arriva in cantiere già levigato e finito in fabbrica, in condizioni di temperatura e umidità controllate: un livello di qualità che sul posto non è replicabile. Si posa e si cammina lo stesso giorno — zero polveri di levigatura, zero odori di finitura, zero tempi morti. Il supporto multistrato incrociato lo rende inoltre ideale sopra impianti radianti.":"Le préfini arrive sur chantier déjà poncé et fini en usine, sous température et humidité contrôlées : un niveau de qualité non reproductible sur place. On le pose et on y marche le jour même — aucune poussière de ponçage, aucune odeur de finition, aucun temps mort. Le support multicouche contrecollé le rend en outre idéal sur plancher chauffant.",
    "Il bordo vivo, non smussato, è la scelta di chi vuole una superficie continua. Le giunzioni si chiudono a filo e l'occhio legge il pavimento come un piano unico, non come una somma di listoni. Richiede una lavorazione più precisa in produzione e un massetto perfettamente in piano: per questo è il dettaglio che distingue i progetti di alto livello.":"Le bord vif, non chanfreiné, est le choix de qui veut une surface continue. Les joints se ferment à fleur et l'œil lit le sol comme un plan unique, non comme une somme de lames. Il exige un usinage plus précis en production et une chape parfaitement plane : c'est pourquoi c'est le détail qui distingue les projets haut de gamme.",
    "Nove essenze selezionate, tutte disponibili nelle lavorazioni e finiture descritte sopra. Ogni legno ha una durezza, un colore e un comportamento diversi: la scelta dell'essenza è la prima decisione di progetto, quella che condiziona tutte le altre.":"Neuf essences sélectionnées, toutes disponibles dans les traitements et finitions décrits ci-dessus. Chaque bois a une dureté, une couleur et un comportement différents : le choix de l'essence est la première décision de projet, celle qui conditionne toutes les autres.",
    "Essenza Rovere":"Chêne",
    "Essenza Noce":"Noyer",
    "Essenza Frassino":"Frêne",
    "Essenza Olmo":"Orme",
    "Essenza Larice":"Mélèze",
    "Essenza Acero":"Érable",
    "Essenza Frassino Olivato":"Frêne olivier",
    "Essenza Larice Evaporato":"Mélèze étuvé",
    "Essenza Noce Americano":"Noyer américain",
    "L'essenza più richiesta, e non per caso: durissima, stabile, con una venatura di grande carattere. Accoglie qualsiasi finitura — naturale, sbiancata, fumé, oliata — restando sempre riconoscibile. La scelta sicura per residenziale e contract.":"L'essence la plus demandée, et ce n'est pas un hasard : très dure, stable, au veinage de grand caractère. Elle accepte toute finition — naturelle, blanchie, fumée, huilée — en restant toujours reconnaissable. Le choix sûr pour le résidentiel et le contract.",
    "Bruno profondo con sfumature violacee e venature marcate. Il noce europeo è il legno dell'eleganza classica: scalda l'ambiente e crea contrasto con arredi e pareti chiare. Media durezza, ottima lavorabilità, resa cromatica inconfondibile.":"Brun profond aux nuances violacées et au veinage marqué. Le noyer européen est le bois de l'élégance classique : il réchauffe la pièce et crée un contraste avec mobilier et murs clairs. Dureté moyenne, excellente usinabilité, rendu chromatique unique.",
    "Chiarissimo, quasi biondo, con fibra dritta e disegno molto grafico. Duro ed elastico insieme, sopporta bene i carichi. Ideale negli ambienti luminosi e contemporanei, e come base per finiture sbiancate o tinte a campione.":"Très clair, presque blond, à fibre droite et dessin très graphique. Dur et élastique à la fois, il supporte bien les charges. Idéal dans les espaces lumineux et contemporains, et comme base pour des finitions blanchies ou des teintes sur échantillon.",
    "Bruno caldo tendente al rossiccio, con venature irregolari e nodi a vista. Un legno dal carattere rustico e ricercato allo stesso tempo: la scelta giusta quando si cerca personalità invece di uniformità.":"Brun chaud tirant sur le roux, au veinage irrégulier et aux nœuds apparents. Un bois au caractère à la fois rustique et raffiné : le bon choix quand on cherche la personnalité plutôt que l'uniformité.",
    "Conifera alpina dal tono ambrato e dagli anelli di crescita molto contrastati. Leggero, resinoso, naturalmente durevole. Restituisce l'atmosfera della montagna anche in un contesto urbano, con un costo al metro contenuto.":"Conifère alpin au ton ambré et aux cernes de croissance très contrastés. Léger, résineux, naturellement durable. Il apporte l'atmosphère de la montagne même en contexte urbain, à un coût au mètre contenu.",
    "Il più chiaro della gamma: bianco crema, fibra finissima e quasi priva di disegno. Superficie liscia e luminosa, per progetti minimali dove il pavimento deve sparire e lasciar parlare lo spazio.":"Le plus clair de la gamme : blanc crème, fibre très fine et presque sans dessin. Surface lisse et lumineuse, pour des projets minimalistes où le sol doit disparaître et laisser parler l'espace.",
    "Il cuore scuro del frassino in contrasto con l'alburno chiaro: un disegno naturale a bande che ricorda l'olivo. Ogni listone è diverso dall'altro. Da usare come elemento decorativo del progetto, non come sfondo neutro.":"Le cœur sombre du frêne en contraste avec l'aubier clair : un dessin naturel en bandes qui rappelle l'olivier. Chaque lame est différente de l'autre. À utiliser comme élément décoratif du projet, non comme fond neutre.",
    "Larice trattato a vapore: il calore uniforma il colore in profondità, non solo in superficie, portandolo a un bruno ambrato caldo e stabile nel tempo. Mantiene il disegno degli anelli e perde la disomogeneità del legno grezzo.":"Mélèze étuvé : la chaleur uniformise la couleur en profondeur, et pas seulement en surface, jusqu'à un brun ambré chaud et stable dans le temps. Il conserve le dessin des cernes et perd l'hétérogénéité du bois brut.",
    "Più uniforme e più scuro del noce europeo, con fondo cioccolato e riflessi caldi. Fibra dritta, poche irregolarità: il legno da grandi superfici, quando si vuole profondità di colore senza rumore visivo.":"Plus uniforme et plus foncé que le noyer européen, sur fond chocolat aux reflets chauds. Fibre droite, peu d'irrégularités : le bois des grandes surfaces, quand on veut de la profondeur de couleur sans bruit visuel.",
    "Su misura, dal listone al cantiere.":"Sur mesure, de la lame au chantier.",
    "Tutti i nostri parquet sono realizzati con legno selezionato ad alta resistenza all'usura, con una stabilità dimensionale che riduce i movimenti naturali del legno e con la possibilità di finiture personalizzate — opaca, satinata, spazzolata, sbiancata, fumé, oliata o tinta a campione.":"Tous nos parquets sont réalisés en bois sélectionné à haute résistance à l'usure, avec une stabilité dimensionnelle qui réduit les mouvements naturels du bois et la possibilité de finitions personnalisées — mate, satinée, brossée, blanchie, fumée, huilée ou teintée sur échantillon.",
    "Produciamo e posiamo parquet su misura, secondo le specifiche e lo stile richiesti dal cliente: formati fuori standard, disegni di posa dedicati, abbinamenti tra essenze diverse, raccordi con altri materiali. Consegniamo e installiamo in tutto il mondo, anche direttamente in location espositive o residenziali.":"Nous produisons et posons des parquets sur mesure, selon les spécifications et le style demandés par le client : formats hors standard, schémas de pose dédiés, associations d'essences différentes, raccords avec d'autres matériaux. Nous livrons et installons dans le monde entier, y compris directement en lieux d'exposition ou résidentiels.",
    "Listoni tradizionali":"Lames traditionnelles",
    "Spina italiana 90°":"Bâtons rompus italiens 90°",
    "Spina ungherese 45° / 60°":"Point de Hongrie 45° / 60°",
    "Maxi-doghe":"Maxi-lames",
    "Tavole rustiche":"Planches rustiques",
    "Posa su riscaldamento a pavimento":"Pose sur plancher chauffant",
    "Posa e assistenza in cantiere":"Pose et assistance sur chantier"
   },
   de:{
    "Essenze":"Holzarten",
    "Ogni pavimento nasce da tre decisioni: l'essenza, il disegno di posa e la finitura. Sono queste tre scelte, non il prezzo del metro quadro, a determinare come il legno invecchierà nei prossimi trent'anni. Qui sotto le lavorazioni che eseguiamo di serie, tutte disponibili su ognuna delle nove essenze del nostro catalogo.":"Jeder Boden entsteht aus drei Entscheidungen: der Holzart, dem Verlegemuster und der Oberfläche. Diese drei Entscheidungen — nicht der Quadratmeterpreis — bestimmen, wie das Holz in den nächsten dreißig Jahren altert. Nachfolgend die Bearbeitungen, die wir serienmäßig ausführen, alle für jede der neun Holzarten unseres Katalogs verfügbar.",
    "Rovere europeo di prima scelta, stagionato e selezionato listone per listone. La fibra compatta garantisce stabilità dimensionale e resistenza all'usura nel tempo; la venatura naturale — dal fiore cattedrale alla rigatura verticale — copre una gamma cromatica che va dal naturale chiarissimo al fumé. Disponibile in larghezze maxi e lunghezze fuori standard su richiesta.":"Europäische Eiche erster Wahl, abgelagert und Diele für Diele ausgewählt. Die dichte Faser garantiert Formstabilität und dauerhafte Abriebfestigkeit; die natürliche Maserung — von der Kathedralzeichnung bis zum stehenden Jahrring — reicht farblich von hellstem Natur bis Räuchereiche. Auf Anfrage in Maxi-Breiten und Sonderlängen erhältlich.",
    "La posa a lisca di pesce — italiana a 90°, francese o ungherese a 45° e 60° — è il modo più raffinato di far lavorare la luce sul legno. Ogni listello viene tagliato con tolleranze millimetriche perché il disegno resti perfettamente chiuso lungo tutta la stanza. Un pattern intramontabile, che valorizza tanto un appartamento storico quanto un contract di alto profilo.":"Die Fischgrätverlegung — italienisch mit 90°, französisch oder ungarisch mit 45° und 60° — ist die eleganteste Art, das Licht auf dem Holz arbeiten zu lassen. Jeder Stab wird millimetergenau zugeschnitten, damit das Muster im gesamten Raum perfekt geschlossen bleibt. Ein zeitloses Muster, das eine Altbauwohnung ebenso aufwertet wie ein anspruchsvolles Objektprojekt.",
    "La spazzolatura asporta meccanicamente la parte più tenera del legno primaverile e lascia in rilievo la fibra dura. Il risultato è una superficie viva al tatto, con una profondità che nessuna finitura liscia può restituire. In più il rilievo maschera micrograffi e segni d'uso: un pavimento che invecchia bene, invece di consumarsi.":"Das Bürsten trägt das weichere Frühholz mechanisch ab und lässt die harte Faser als Relief stehen. Das Ergebnis ist eine haptisch lebendige Oberfläche mit einer Tiefe, die keine glatte Oberfläche erreicht. Das Relief kaschiert zudem Mikrokratzer und Gebrauchsspuren: ein Boden, der gut altert, statt sich abzunutzen.",
    "Tre passaggi di olio polimerizzato ai raggi UV: il primo penetra e nutre la fibra, i successivi costruiscono una protezione che regge acqua, macchie e traffico intenso. A differenza di una vernice filmogena l'olio non crea una pellicola — il legno resta legno — e un eventuale danno si ripara localmente, senza levigare l'intero ambiente.":"Drei Aufträge UV-gehärtetes Öl: Der erste dringt ein und nährt die Faser, die weiteren bauen einen Schutz gegen Wasser, Flecken und starke Beanspruchung auf. Anders als ein filmbildender Lack bildet Öl keine Schicht — Holz bleibt Holz — und ein Schaden lässt sich lokal ausbessern, ohne den gesamten Raum zu schleifen.",
    "Il prefinito arriva in cantiere già levigato e finito in fabbrica, in condizioni di temperatura e umidità controllate: un livello di qualità che sul posto non è replicabile. Si posa e si cammina lo stesso giorno — zero polveri di levigatura, zero odori di finitura, zero tempi morti. Il supporto multistrato incrociato lo rende inoltre ideale sopra impianti radianti.":"Fertigparkett kommt bereits werkseitig geschliffen und versiegelt auf die Baustelle, unter kontrollierter Temperatur und Luftfeuchte: eine Qualität, die vor Ort nicht reproduzierbar ist. Es wird verlegt und am selben Tag begangen — kein Schleifstaub, kein Versiegelungsgeruch, keine Wartezeit. Der kreuzweise verleimte Mehrschichtaufbau macht es zudem ideal über Fußbodenheizung.",
    "Il bordo vivo, non smussato, è la scelta di chi vuole una superficie continua. Le giunzioni si chiudono a filo e l'occhio legge il pavimento come un piano unico, non come una somma di listoni. Richiede una lavorazione più precisa in produzione e un massetto perfettamente in piano: per questo è il dettaglio che distingue i progetti di alto livello.":"Die scharfe, nicht gefaste Kante ist die Wahl für alle, die eine durchgehende Fläche wollen. Die Fugen schließen bündig und das Auge liest den Boden als eine einzige Ebene, nicht als Summe von Dielen. Das erfordert präzisere Fertigung und einen perfekt ebenen Estrich: deshalb ist es das Detail, das hochwertige Projekte auszeichnet.",
    "Nove essenze selezionate, tutte disponibili nelle lavorazioni e finiture descritte sopra. Ogni legno ha una durezza, un colore e un comportamento diversi: la scelta dell'essenza è la prima decisione di progetto, quella che condiziona tutte le altre.":"Neun ausgewählte Holzarten, alle in den oben beschriebenen Bearbeitungen und Oberflächen verfügbar. Jedes Holz hat eine andere Härte, Farbe und ein anderes Verhalten: Die Wahl der Holzart ist die erste Projektentscheidung — die, die alle weiteren bestimmt.",
    "Essenza Rovere":"Eiche",
    "Essenza Noce":"Nussbaum",
    "Essenza Frassino":"Esche",
    "Essenza Olmo":"Ulme",
    "Essenza Larice":"Lärche",
    "Essenza Acero":"Ahorn",
    "Essenza Frassino Olivato":"Olivesche",
    "Essenza Larice Evaporato":"Gedämpfte Lärche",
    "Essenza Noce Americano":"Amerikanischer Nussbaum",
    "L'essenza più richiesta, e non per caso: durissima, stabile, con una venatura di grande carattere. Accoglie qualsiasi finitura — naturale, sbiancata, fumé, oliata — restando sempre riconoscibile. La scelta sicura per residenziale e contract.":"Die meistgefragte Holzart, und das nicht ohne Grund: sehr hart, formstabil, mit charaktervoller Maserung. Sie nimmt jede Oberfläche an — natur, gebleicht, geräuchert, geölt — und bleibt immer erkennbar. Die sichere Wahl für Wohn- und Objektbereich.",
    "Bruno profondo con sfumature violacee e venature marcate. Il noce europeo è il legno dell'eleganza classica: scalda l'ambiente e crea contrasto con arredi e pareti chiare. Media durezza, ottima lavorabilità, resa cromatica inconfondibile.":"Tiefes Braun mit violetten Untertönen und ausgeprägter Maserung. Europäischer Nussbaum ist das Holz der klassischen Eleganz: Er wärmt den Raum und kontrastiert mit hellen Möbeln und Wänden. Mittlere Härte, hervorragende Bearbeitbarkeit, unverwechselbare Farbwirkung.",
    "Chiarissimo, quasi biondo, con fibra dritta e disegno molto grafico. Duro ed elastico insieme, sopporta bene i carichi. Ideale negli ambienti luminosi e contemporanei, e come base per finiture sbiancate o tinte a campione.":"Sehr hell, fast blond, mit gerader Faser und stark grafischer Zeichnung. Hart und zugleich elastisch, gut belastbar. Ideal in hellen, zeitgenössischen Räumen und als Basis für gebleichte Oberflächen oder Beizen nach Muster.",
    "Bruno caldo tendente al rossiccio, con venature irregolari e nodi a vista. Un legno dal carattere rustico e ricercato allo stesso tempo: la scelta giusta quando si cerca personalità invece di uniformità.":"Warmes, ins Rötliche gehendes Braun mit unregelmäßiger Maserung und sichtbaren Ästen. Ein Holz, das zugleich rustikal und raffiniert wirkt: die richtige Wahl, wenn Charakter statt Gleichmäßigkeit gefragt ist.",
    "Conifera alpina dal tono ambrato e dagli anelli di crescita molto contrastati. Leggero, resinoso, naturalmente durevole. Restituisce l'atmosfera della montagna anche in un contesto urbano, con un costo al metro contenuto.":"Alpine Nadelholzart mit bernsteinfarbenem Ton und stark kontrastierten Jahresringen. Leicht, harzig, natürlich dauerhaft. Bringt Bergatmosphäre auch in urbane Räume — bei moderaten Quadratmeterkosten.",
    "Il più chiaro della gamma: bianco crema, fibra finissima e quasi priva di disegno. Superficie liscia e luminosa, per progetti minimali dove il pavimento deve sparire e lasciar parlare lo spazio.":"Das hellste Holz der Reihe: cremeweiß, sehr feine Faser und nahezu ohne Zeichnung. Glatte, lichte Oberfläche für minimalistische Projekte, in denen der Boden zurücktreten und den Raum sprechen lassen soll.",
    "Il cuore scuro del frassino in contrasto con l'alburno chiaro: un disegno naturale a bande che ricorda l'olivo. Ogni listone è diverso dall'altro. Da usare come elemento decorativo del progetto, non come sfondo neutro.":"Der dunkle Kern der Esche im Kontrast zum hellen Splintholz: eine natürliche Bänderung, die an Olive erinnert. Jede Diele ist anders als die nächste. Als dekoratives Element des Projekts einzusetzen, nicht als neutraler Hintergrund.",
    "Larice trattato a vapore: il calore uniforma il colore in profondità, non solo in superficie, portandolo a un bruno ambrato caldo e stabile nel tempo. Mantiene il disegno degli anelli e perde la disomogeneità del legno grezzo.":"Gedämpfte Lärche: Die Wärme gleicht die Farbe durchgehend an, nicht nur an der Oberfläche, und führt zu einem warmen Bernsteinbraun, das langfristig stabil bleibt. Die Jahresringzeichnung bleibt erhalten, die Ungleichmäßigkeit des Rohholzes verschwindet.",
    "Più uniforme e più scuro del noce europeo, con fondo cioccolato e riflessi caldi. Fibra dritta, poche irregolarità: il legno da grandi superfici, quando si vuole profondità di colore senza rumore visivo.":"Gleichmäßiger und dunkler als europäischer Nussbaum, mit schokoladenbraunem Grund und warmen Reflexen. Gerade Faser, wenige Unregelmäßigkeiten: das Holz für große Flächen, wenn Farbtiefe ohne visuelle Unruhe gefragt ist.",
    "Su misura, dal listone al cantiere.":"Nach Maß, von der Diele bis zur Baustelle.",
    "Tutti i nostri parquet sono realizzati con legno selezionato ad alta resistenza all'usura, con una stabilità dimensionale che riduce i movimenti naturali del legno e con la possibilità di finiture personalizzate — opaca, satinata, spazzolata, sbiancata, fumé, oliata o tinta a campione.":"Alle unsere Parkettböden bestehen aus ausgewähltem Holz mit hoher Abriebfestigkeit, mit einer Formstabilität, die die natürliche Bewegung des Holzes reduziert, und mit der Möglichkeit individueller Oberflächen — matt, seidenmatt, gebürstet, gebleicht, geräuchert, geölt oder nach Muster gebeizt.",
    "Produciamo e posiamo parquet su misura, secondo le specifiche e lo stile richiesti dal cliente: formati fuori standard, disegni di posa dedicati, abbinamenti tra essenze diverse, raccordi con altri materiali. Consegniamo e installiamo in tutto il mondo, anche direttamente in location espositive o residenziali.":"Wir fertigen und verlegen Parkett nach Maß, nach den Vorgaben und dem Stil des Kunden: Sonderformate, eigens entworfene Verlegemuster, Kombinationen verschiedener Holzarten, Übergänge zu anderen Materialien. Wir liefern und montieren weltweit, auch direkt in Ausstellungs- oder Wohnobjekten.",
    "Listoni tradizionali":"Traditionelle Dielen",
    "Spina italiana 90°":"Italienisches Fischgrät 90°",
    "Spina ungherese 45° / 60°":"Ungarisches Fischgrät 45° / 60°",
    "Maxi-doghe":"Maxi-Dielen",
    "Tavole rustiche":"Rustikale Dielen",
    "Posa su riscaldamento a pavimento":"Verlegung auf Fußbodenheizung",
    "Posa e assistenza in cantiere":"Verlegung und Baustellenbetreuung"
   }
  };
  Object.assign(T.en,PAV.en);Object.assign(T.fr,PAV.fr);Object.assign(T.de,PAV.de);


  /* ---------- translation engine ---------- */
  const norm=s=>s.replace(/\s+/g,' ').trim();
  const keys=new Set(Object.keys(T.en));
  let items=[];
  document.body.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,li,div,button,label').forEach(el=>{
    if(el.closest('.pdlang'))return;
    const k=norm(el.textContent||'');
    if(keys.has(k)) items.push({el,key:k,orig:el.innerHTML});
  });
  const els=items.map(i=>i.el);
  items=items.filter(i=>!els.some(o=>o!==i.el && i.el.contains(o)));
  function setText(el,val){
    for(const n of el.childNodes){ if(n.nodeType===3 && n.nodeValue.trim()){ n.nodeValue=n.nodeValue.replace(/\S[\s\S]*\S|\S/,val); return; } }
    el.textContent=val;
  }
  function applyLang(lang){
    items.forEach(i=>{ i.el.innerHTML=i.orig; });
    const d=T[lang]; if(!d) return;
    items.forEach(i=>{ const v=d[i.key]; if(v==null) return; if(HTMLK.has(i.key)) i.el.innerHTML=v; else setText(i.el,v); });
  }
  window.applyLang=applyLang;

  /* ---------- switcher behaviour ---------- */
  const open=()=>{wrap.classList.add('open');btn.setAttribute('aria-expanded','true');};
  const close=()=>{wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');};
  btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.contains('open')?close():open();});
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  function select(lang,silent){
    opts.forEach(o=>o.classList.toggle('on',o.dataset.lang===lang));
    curFlag.innerHTML=FL[lang]||FL.it; curCode.textContent=CD[lang]||'IT';
    document.documentElement.lang=lang;
    applyLang(lang);
    try{localStorage.setItem('pdLang',lang);}catch(e){}
    if(!silent){btn.classList.remove('pop');void btn.offsetWidth;btn.classList.add('pop');}
    close();
  }
  opts.forEach(o=>o.addEventListener('click',()=>select(o.dataset.lang)));
  let saved='it'; try{saved=localStorage.getItem('pdLang')||'it';}catch(e){}
  select(saved,true);
})();
