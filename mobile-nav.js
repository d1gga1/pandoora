/* Pan.door.a — menu mobile condiviso + fix touch
   Crea un drawer di navigazione funzionante su tutte le pagine.
   Si aggancia a un eventuale bottone .burger già presente,
   altrimenti inietta il proprio bottone in alto a destra. */
(function(){
  if(window.__pdMobileNav) return; window.__pdMobileNav = true;

  var PHONE = '+393356326505';
  var PHONE_LABEL = '+39 335 632 6505';
  var WA = 'https://wa.me/393884706887';
  var MAIL = 'ordini@pandooragroup.it';

  var LINKS = [
    {h:'/',              t:'Home',              s:'Pan.door.a'},
    {h:'/shop/',         t:'Pandoora Shop',     s:'Negozio online · su misura'},
    {h:'/pannelli-tamburati/', t:'Pannelli Tamburati', s:'Allestimenti fieristici'},
    {h:'/listino-pannelli-tamburati/', t:'Schede Tecniche',   s:'Specifiche e materiali'},
    {h:'/porte/',              t:'Porte',             s:'26 modelli'},
    {h:'/pavimentazioni/',     t:'Pavimentazioni',    s:'Parquet in rovere'},
    {h:'/componenti-per-mobili/',         t:'Componenti',        s:'Pedane e accessori'},
    {h:'/verniciatura/',       t:'Verniciatura',      s:'Laccatura e lucidatura'}
  ];
  /* nav-i18n: menu nella lingua della pagina */
  var NAV_I18N={"ar":{"links":[["/ar/","Home","Pan.door.a"],["/ar/shop/","Pandoora Shop","Online shop · made to measure"],["/ar/interior-doors-dubai/","Doors","26 models"]],"quote":"/en/request-a-quote/","q":"Request a quote","open":"Open menu","close":"Close menu","menu":"Navigation menu"},"bg":{"links":[["/bg/","Начало","Pan.door.a"],["/bg/magazin/","Pandoora Shop","Онлайн магазин · по поръчка"],["/bg/paneli-pchelna-pita/","Панели пчелна пита","Изложбени щандове"],["/bg/tseni-paneli/","Технически листове","Спецификации и цени"],["/bg/interiorni-vrati/","Врати","26 модела"],["/bg/mebelni-frontove/","Компоненти","Фронтове и части за мебели"],["/bg/boyadisvane-na-mebeli/","Боядисване","Лакиране и довършване"]],"quote":"/bg/kontakti/","q":"Поискайте оферта","open":"Отвори менюто","close":"Затвори менюто","menu":"Меню"},"cs":{"links":[["/cs/","Úvod","Pan.door.a"],["/cs/obchod/","Pandoora Shop","E-shop · na míru"],["/cs/vostinove-desky/","Voštinové desky","Výstavní stánky"],["/cs/ceny-vostinovych-desek/","Technické listy","Specifikace a ceník"],["/cs/interierove-dvere/","Dveře","26 modelů"],["/cs/kuchynska-dvirka-na-miru/","Komponenty","Dvířka a díly nábytku"],["/cs/lakovna-nabytku/","Lakování","Lakování a povrchová úprava"]],"quote":"/cs/nabidka/","q":"Poptat nabídku","open":"Otevřít menu","close":"Zavřít menu","menu":"Navigace"},"da":{"links":[["/da/","Forside","Pan.door.a"],["/da/butik/","Pandoora Shop","Webshop · efter mål"],["/da/honeycomb-plader/","Honeycomb-plader","Messestande"],["/da/priser-honeycomb-plader/","Datablade","Specifikationer og priser"],["/da/indvendige-doere/","Døre","26 modeller"],["/da/koekkenlaager-paa-maal/","Komponenter","Møbelfronter og dele"],["/da/lakering-af-koekkenlaager/","Lakering","Lakering og overfladebehandling"]],"quote":"/da/kontakt/","q":"Få et tilbud","open":"Åbn menu","close":"Luk menu","menu":"Navigationsmenu"},"de":{"links":[["/de/","Startseite","Pan.door.a"],["/de/shop/","Pandoora Shop","Onlineshop · nach Maß"],["/de/wabenplatten/","Wabenplatten","Messebau"],["/de/wabenplatten-preisliste/","Datenblätter","Technik und Preisliste"],["/de/tueren/","Türen","26 Modelle"],["/de/parkett/","Bodenbeläge","Eichenparkett"],["/de/moebelkomponenten/","Komponenten","Möbelfronten und Teile"],["/de/lackierung/","Lackierung","Lackieren und Beschichten"]],"quote":"/de/angebot-anfordern/","q":"Angebot anfordern","open":"Menü öffnen","close":"Menü schließen","menu":"Navigationsmenü"},"el":{"links":[["/el/","Αρχική","Pan.door.a"],["/el/katastima/","Pandoora Shop","Ηλεκτρονικό κατάστημα · κατά παραγγελία"],["/el/panel-gia-ektheseis/","Πάνελ κηρήθρας","Περίπτερα εκθέσεων"],["/el/esoterikes-portes/","Πόρτες","26 μοντέλα"],["/el/portakia-kouzinas/","Εξαρτήματα","Προσόψεις και εξαρτήματα επίπλων"],["/el/vafi-epiplon/","Βαφή","Λάκα και φινίρισμα"]],"quote":"/el/prosfora/","q":"Ζητήστε προσφορά","open":"Άνοιγμα μενού","close":"Κλείσιμο μενού","menu":"Μενού πλοήγησης"},"en":{"links":[["/en/","Home","Pan.door.a"],["/en/shop/","Pandoora Shop","Online shop · made to measure"],["/en/honeycomb-panels/","Honeycomb panels","Exhibition stands"],["/en/honeycomb-panel-price-list/","Data sheets","Specs and price list"],["/en/doors/","Doors","26 models"],["/en/parquet-flooring/","Flooring","Oak parquet"],["/en/furniture-components/","Components","Furniture fronts and parts"],["/en/wood-lacquering/","Lacquering","Lacquering and finishing"]],"quote":"/en/request-a-quote/","q":"Request a quote","open":"Open menu","close":"Close menu","menu":"Navigation menu"},"es":{"links":[["/es/","Inicio","Pan.door.a"],["/es/tienda/","Pandoora Shop","Tienda online · a medida"],["/es/paneles-alveolares/","Paneles alveolares","Stands feriales"],["/es/tarifa-paneles-alveolares/","Fichas técnicas","Especificaciones y tarifas"],["/es/puertas/","Puertas","26 modelos"],["/es/parquet/","Parquet","Parquet de roble"],["/es/componentes-para-muebles/","Componentes","Frentes y piezas de muebles"],["/es/lacado-madera/","Lacado","Lacado y acabado"]],"quote":"/es/presupuesto/","q":"Solicitar presupuesto","open":"Abrir menú","close":"Cerrar menú","menu":"Menú de navegación"},"et":{"links":[["/et/","Avaleht","Pan.door.a"],["/et/pood/","Pandoora Shop","E-pood · mõõdu järgi"],["/et/karg-paneelid/","Kärgpaneelid","Messiboksid"],["/et/kargpaneelide-hinnad/","Tehnilised andmed","Spetsifikatsioonid ja hinnad"],["/et/siseuksed/","Uksed","26 mudelit"],["/et/moobli-fassaadid/","Komponendid","Mööblifassaadid ja osad"],["/et/moobli-varvimine/","Värvimine","Lakkimine ja viimistlus"]],"quote":"/et/kontakt/","q":"Küsi pakkumist","open":"Ava menüü","close":"Sulge menüü","menu":"Navigeerimismenüü"},"fi":{"links":[["/fi/","Etusivu","Pan.door.a"],["/fi/kauppa/","Pandoora Shop","Verkkokauppa · mittatilauksena"],["/fi/puiset-kennolevyt/","Kennolevyt","Messuosastot"],["/fi/kennolevyjen-hinnasto/","Tekniset tiedot","Erittelyt ja hinnasto"],["/fi/valiovet/","Ovet","26 mallia"],["/fi/keittion-ovet-mittojen-mukaan/","Komponentit","Kalusteovet ja osat"],["/fi/kalusteiden-maalaus/","Maalaus","Lakkaus ja viimeistely"]],"quote":"/fi/yhteystiedot/","q":"Pyydä tarjous","open":"Avaa valikko","close":"Sulje valikko","menu":"Navigointivalikko"},"fr":{"links":[["/fr/","Accueil","Pan.door.a"],["/fr/boutique/","Pandoora Shop","Boutique en ligne · sur mesure"],["/fr/panneaux-alveolaires/","Panneaux alvéolaires","Stands d’exposition"],["/fr/tarif-panneaux-alveolaires/","Fiches techniques","Spécifications et tarifs"],["/fr/portes/","Portes","26 modèles"],["/fr/parquet/","Parquet","Parquet en chêne"],["/fr/composants-meubles/","Composants","Façades et pièces de meubles"],["/fr/laquage-bois/","Laquage","Laquage et finition"]],"quote":"/fr/devis/","q":"Demander un devis","open":"Ouvrir le menu","close":"Fermer le menu","menu":"Menu de navigation"},"hr":{"links":[["/hr/","Početna","Pan.door.a"],["/hr/trgovina/","Pandoora Shop","Web trgovina · po mjeri"],["/hr/sacaste-ploce-za-standove/","Saćaste ploče","Sajamski štandovi"],["/hr/sobna-vrata-sa-stokom/","Vrata","26 modela"],["/hr/kuhinjske-fronte-po-mjeri/","Komponente","Fronte i dijelovi namještaja"],["/hr/lakiranje-namjestaja/","Lakiranje","Lakiranje i završna obrada"]],"quote":"/hr/ponuda/","q":"Zatražite ponudu","open":"Otvori izbornik","close":"Zatvori izbornik","menu":"Izbornik"},"hu":{"links":[["/hu/","Főoldal","Pan.door.a"],["/hu/webaruhaz/","Pandoora Shop","Webáruház · méretre"],["/hu/mehsejt-panelek/","Méhsejt panelek","Kiállítási standok"],["/hu/mehsejt-panel-arak/","Műszaki lapok","Specifikációk és árak"],["/hu/belteri-ajtok/","Ajtók","26 modell"],["/hu/butorfrontok/","Alkatrészek","Bútorfrontok és elemek"],["/hu/butor-fenyezes/","Fényezés","Lakkozás és felületkezelés"]],"quote":"/hu/kapcsolat/","q":"Árajánlatkérés","open":"Menü megnyitása","close":"Menü bezárása","menu":"Navigációs menü"},"lt":{"links":[["/lt/","Pradžia","Pan.door.a"],["/lt/parduotuve/","Pandoora Shop","Internetinė parduotuvė · pagal užsakymą"],["/lt/korines-plokstes/","Korinės plokštės","Parodų stendai"],["/lt/korines-plokstes-kainos/","Techniniai lapai","Specifikacijos ir kainos"],["/lt/vidaus-durys/","Durys","26 modeliai"],["/lt/baldu-fasadai/","Komponentai","Baldų fasadai ir dalys"],["/lt/baldu-dazymas/","Dažymas","Lakavimas ir apdaila"]],"quote":"/lt/kontaktai/","q":"Gauti pasiūlymą","open":"Atidaryti meniu","close":"Uždaryti meniu","menu":"Naršymo meniu"},"lv":{"links":[["/lv/","Sākums","Pan.door.a"],["/lv/veikals/","Pandoora Shop","Interneta veikals · pēc pasūtījuma"],["/lv/sunveida-paneli/","Šūnveida paneļi","Izstāžu stendi"],["/lv/sunveida-panelu-cenas/","Tehniskās lapas","Specifikācijas un cenas"],["/lv/ieksdurvis/","Durvis","26 modeļi"],["/lv/mebelu-fasades/","Komponenti","Mēbeļu fasādes un detaļas"],["/lv/mebelu-krasosana/","Krāsošana","Lakošana un apdare"]],"quote":"/lv/kontakti/","q":"Pieprasīt piedāvājumu","open":"Atvērt izvēlni","close":"Aizvērt izvēlni","menu":"Navigācijas izvēlne"},"nl":{"links":[["/nl/","Home","Pan.door.a"],["/nl/winkel/","Pandoora Shop","Webwinkel · op maat"],["/nl/honingraatpanelen/","Honingraatpanelen","Beursstands"],["/nl/prijzen-honingraatpanelen/","Technische fiches","Specificaties en prijzen"],["/nl/binnendeuren-op-maat/","Deuren","26 modellen"],["/nl/keukenfronten-op-maat/","Componenten","Meubelfronten en onderdelen"],["/nl/spuiterij-meubels/","Lakwerk","Lakken en afwerking"]],"quote":"/nl/offerte/","q":"Offerte aanvragen","open":"Menu openen","close":"Menu sluiten","menu":"Navigatiemenu"},"no":{"links":[["/no/","Hjem","Pan.door.a"],["/no/butikk/","Pandoora Shop","Nettbutikk · på mål"],["/no/honeycomb-plater/","Honeycomb-plater","Messestander"],["/no/priser-honeycomb-plater/","Datablad","Spesifikasjoner og priser"],["/no/innerdorer/","Dører","26 modeller"],["/no/kjokkenfronter-pa-mal/","Komponenter","Møbelfronter og deler"],["/no/lakkering-av-kjokkenfronter/","Lakkering","Lakkering og overflatebehandling"]],"quote":"/no/kontakt/","q":"Be om tilbud","open":"Åpne meny","close":"Lukk meny","menu":"Navigasjonsmeny"},"pl":{"links":[["/pl/","Strona główna","Pan.door.a"],["/pl/sklep/","Pandoora Shop","Sklep online · na wymiar"],["/pl/plyty-komorkowe/","Płyty komórkowe","Stoiska targowe"],["/pl/ceny-plyt-komorkowych/","Karty techniczne","Specyfikacje i cennik"],["/pl/drzwi-wewnetrzne/","Drzwi","26 modeli"],["/pl/fronty-meblowe-na-wymiar/","Komponenty","Fronty i elementy mebli"],["/pl/lakiernia-mebli/","Lakierowanie","Lakierowanie i wykończenie"]],"quote":"/pl/wycena/","q":"Poproś o wycenę","open":"Otwórz menu","close":"Zamknij menu","menu":"Menu nawigacji"},"pt":{"links":[["/pt/","Início","Pan.door.a"],["/pt/loja/","Pandoora Shop","Loja online · por medida"],["/pt/paineis-alveolares/","Painéis alveolares","Stands de feira"],["/pt/precos-paineis-alveolares/","Fichas técnicas","Especificações e preços"],["/pt/portas-por-medida/","Portas","26 modelos"],["/pt/frentes-de-cozinha-por-medida/","Componentes","Frentes e peças de móveis"],["/pt/lacagem-de-moveis/","Lacagem","Lacagem e acabamento"]],"quote":"/pt/orcamento/","q":"Pedir orçamento","open":"Abrir menu","close":"Fechar menu","menu":"Menu de navegação"},"ro":{"links":[["/ro/","Acasă","Pan.door.a"],["/ro/magazin/","Pandoora Shop","Magazin online · la comandă"],["/ro/panouri-fagure/","Panouri fagure","Standuri expoziționale"],["/ro/preturi-panouri-fagure/","Fișe tehnice","Specificații și prețuri"],["/ro/usi-interioare/","Uși","26 de modele"],["/ro/fronturi-mobilier/","Componente","Fronturi și piese de mobilier"],["/ro/vopsitorie-mobilier/","Vopsitorie","Lăcuire și finisare"]],"quote":"/ro/contact/","q":"Cere o ofertă","open":"Deschide meniul","close":"Închide meniul","menu":"Meniu de navigare"},"sk":{"links":[["/sk/","Úvod","Pan.door.a"],["/sk/obchod/","Pandoora Shop","E-shop · na mieru"],["/sk/vostinove-panely/","Voštinové panely","Výstavné stánky"],["/sk/ceny-vostinovych-panelov/","Technické listy","Špecifikácie a cenník"],["/sk/interierove-dvere/","Dvere","26 modelov"],["/sk/kuchynske-dvierka-na-mieru/","Komponenty","Dvierka a diely nábytku"],["/sk/lakovna-nabytku/","Lakovanie","Lakovanie a povrchová úprava"]],"quote":"/sk/cenova-ponuka/","q":"Vyžiadať ponuku","open":"Otvoriť menu","close":"Zavrieť menu","menu":"Navigácia"},"sl":{"links":[["/sl/","Domov","Pan.door.a"],["/sl/trgovina/","Pandoora Shop","Spletna trgovina · po meri"],["/sl/satovne-plosce/","Satovne plošče","Sejemski prostori"],["/sl/cene-satovnih-plosc/","Tehnični listi","Specifikacije in cenik"],["/sl/notranja-vrata/","Vrata","26 modelov"],["/sl/kuhinjske-fronte/","Komponente","Fronte in deli pohištva"],["/sl/lakiranje-pohistva/","Lakiranje","Lakiranje in zaključna obdelava"]],"quote":"/sl/ponudba/","q":"Zahtevajte ponudbo","open":"Odpri meni","close":"Zapri meni","menu":"Meni"},"sq":{"links":[["/sq/","Kreu","Pan.door.a"],["/sq/dyqan/","Pandoora Shop","Dyqan online · me porosi"],["/sq/panele-per-stenda-panairi/","Panele huall mjalti","Stenda panairi"],["/sq/dyer-te-brendshme/","Dyer","26 modele"],["/sq/kapake-kuzhine-me-porosi/","Komponentë","Kapakë dhe pjesë mobiljesh"],["/sq/llakim-mobiljesh/","Llakim","Llakim dhe përfundim"]],"quote":"/sq/oferta/","q":"Kërkoni ofertë","open":"Hap menunë","close":"Mbyll menunë","menu":"Menuja"},"sr":{"links":[["/sr/","Početna","Pan.door.a"],["/sr/prodavnica/","Pandoora Shop","Online prodavnica · po meri"],["/sr/sacaste-ploce-za-standove/","Saćaste ploče","Sajamski štandovi"],["/sr/sobna-vrata-sa-stokom/","Vrata","26 modela"],["/sr/kuhinjske-fronte-po-meri/","Komponente","Fronte i delovi nameštaja"],["/sr/farbanje-namestaja/","Farbanje","Lakiranje i završna obrada"]],"quote":"/sr/ponuda/","q":"Zatražite ponudu","open":"Otvori meni","close":"Zatvori meni","menu":"Meni"},"sv":{"links":[["/sv/","Hem","Pan.door.a"],["/sv/butik/","Pandoora Shop","Webbutik · måttbeställt"],["/sv/bikakepaneler/","Bikakepaneler","Mässmontrar"],["/sv/priser-bikakepaneler/","Datablad","Specifikationer och priser"],["/sv/innerdorrar/","Dörrar","26 modeller"],["/sv/kokluckor-pa-matt/","Komponenter","Möbelluckor och delar"],["/sv/lackering-av-kokluckor/","Lackering","Lackering och ytbehandling"]],"quote":"/sv/kontakt/","q":"Begär offert","open":"Öppna menyn","close":"Stäng menyn","menu":"Navigeringsmeny"},"tr":{"links":[["/tr/","Ana sayfa","Pan.door.a"],["/tr/magaza/","Pandoora Shop","Online mağaza · ölçüye özel"],["/tr/petek-dolgulu-panel/","Petek paneller","Fuar standları"],["/tr/petek-panel-fiyat-listesi/","Teknik föyler","Özellikler ve fiyat listesi"],["/tr/lake-ic-kapi/","Kapılar","26 model"],["/tr/lake-mutfak-kapaklari/","Bileşenler","Mobilya kapakları ve parçaları"],["/tr/mobilya-boyama-lake/","Boyama","Lake ve yüzey işlem"]],"quote":"/tr/teklif-al/","q":"Teklif isteyin","open":"Menüyü aç","close":"Menüyü kapat","menu":"Gezinme menüsü"},"zh":{"links":[["/zh/","Home","Pan.door.a"],["/zh/shangdian/","Pandoora Shop","Online shop · made to measure"],["/zh/fengwoban/","Honeycomb panels","Exhibition stands"]],"quote":"/en/request-a-quote/","q":"Request a quote","open":"Open menu","close":"Close menu","menu":"Navigation menu"}};
  var PD_LANG=(location.pathname.match(/^\/([a-z]{2})\//)||[])[1];
  var T=(PD_LANG&&NAV_I18N[PD_LANG])||null;
  var QUOTE_URL=T?T.quote:'/preventivo/', QUOTE_TXT=T?T.q:'Richiedi un preventivo',
      OPEN_TXT=T?T.open:'Apri menu', CLOSE_TXT=T?T.close:'Chiudi menu', MENU_TXT=T?T.menu:'Menu di navigazione';
  if(T){LINKS=T.links.map(function(r){return {h:r[0],t:r[1],s:r[2]};});}
  /* /nav-i18n */

  var CSS = ''
  + '.pdm-burger{position:fixed;top:14px;right:14px;z-index:9997;width:48px;height:48px;border-radius:50%;'
  + 'display:none;align-items:center;justify-content:center;flex-direction:column;gap:5px;padding:0;'
  + 'border:1px solid rgba(255,255,255,.22);background:rgba(14,20,34,.72);'
  + '-webkit-backdrop-filter:blur(12px) saturate(140%);backdrop-filter:blur(12px) saturate(140%);'
  + 'box-shadow:0 8px 26px rgba(0,0,0,.32);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;'
  + 'transition:transform .25s cubic-bezier(.22,.61,.36,1),background .3s}'
  + '.pdm-burger:active{transform:scale(.93)}'
  + '.pdm-burger span{display:block;width:20px;height:2px;border-radius:2px;background:#fff;transition:transform .3s,opacity .3s}'
  + '@media(max-width:1080px){.pdm-burger{display:flex}}'

  + '.pdm-scrim{position:fixed;inset:0;z-index:100000;background:rgba(6,10,18,.55);'
  + '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;visibility:hidden;'
  + 'transition:opacity .3s,visibility .3s}'
  + 'body.pdm-open .pdm-scrim{opacity:1;visibility:visible}'

  + '.pdm-panel{position:fixed;top:0;right:0;bottom:0;z-index:100001;width:min(92vw,400px);'
  + 'display:flex;flex-direction:column;background:#0d1524;color:#fff;'
  + 'border-left:1px solid rgba(255,255,255,.08);box-shadow:none;'
  + 'transform:translateX(102%);transition:transform .38s cubic-bezier(.22,.61,.36,1);'
  + 'overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;'
  + 'padding:max(14px,env(safe-area-inset-top)) 0 max(18px,env(safe-area-inset-bottom));'
  + 'font-family:"Manrope",system-ui,-apple-system,Segoe UI,Arial,sans-serif}'
  + 'body.pdm-open .pdm-panel{transform:translateX(0);box-shadow:-24px 0 60px rgba(0,0,0,.5)}'
  + '.pdm-panel *{box-sizing:border-box;cursor:auto}'

  + '.pdm-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:6px 20px 10px}'
  + '.pdm-head img{height:34px;width:auto;filter:brightness(0) invert(1)}'
  + '.pdm-close{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:1px solid rgba(255,255,255,.16);'
  + 'background:rgba(255,255,255,.05);color:#fff;display:flex;align-items:center;justify-content:center;'
  + 'cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .25s}'
  + '.pdm-close:active{background:rgba(255,255,255,.16)}'
  + '.pdm-close svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round}'

  + '.pdm-list{list-style:none;margin:0;padding:4px 12px 6px}'
  + '.pdm-list li{margin:0}'
  + '.pdm-link{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-height:50px;'
  + 'padding:10px 14px;border-radius:13px;text-decoration:none;color:#fff;'
  + 'font-size:16.5px;font-weight:700;letter-spacing:-.2px;line-height:1.25;'
  + '-webkit-tap-highlight-color:transparent;transition:background .2s}'
  + '.pdm-link:active{background:rgba(255,255,255,.09)}'
  + '.pdm-link small{display:block;width:100%;font-size:12px;font-weight:500;letter-spacing:.2px;'
  + 'color:rgba(255,255,255,.45);margin-top:3px}'
  + '.pdm-link.cur{background:rgba(91,141,239,.14);color:#fff}'
  + '.pdm-link.cur small{color:rgba(139,195,74,.85)}'

  + '.pdm-sep{height:1px;margin:8px 26px;background:rgba(255,255,255,.09)}'
  + '.pdm-foot{margin-top:auto;position:sticky;bottom:0;padding:14px 20px 10px;display:flex;'
  + 'flex-direction:column;gap:9px;'
  + 'background:linear-gradient(180deg,rgba(13,21,36,0) 0%,#0d1524 26%,#0d1524 100%)}'
  + '.pdm-cta{display:flex;align-items:center;justify-content:center;gap:9px;min-height:48px;'
  + 'border-radius:100px;text-decoration:none;font-size:15px;font-weight:700;'
  + '-webkit-tap-highlight-color:transparent;transition:transform .2s}'
  + '.pdm-cta:active{transform:scale(.98)}'
  + '.pdm-cta svg{width:18px;height:18px;flex:0 0 18px}'
  + '.pdm-cta.red{background:#c0392b;color:#fff}'
  + '.pdm-cta.green{background:#25d366;color:#08240f}'
  + '.pdm-cta.ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.16)}'
  + '.pdm-mail{display:block;text-align:center;padding:6px 0 2px;font-size:12.5px;'
  + 'color:rgba(255,255,255,.5);text-decoration:none;word-break:break-all}'

  /* mentre il menu è aperto: blocca lo scroll e nascondi il selettore lingua */
  + 'body.pdm-open{overflow:hidden!important}'
  + 'body.pdm-open .pdlang{opacity:0;visibility:hidden;pointer-events:none}'
  + '@media(prefers-reduced-motion:reduce){.pdm-panel,.pdm-scrim{transition:none}}';

  function el(tag, cls, html){ var n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; }

  function build(){
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);

    var here = location.pathname.toLowerCase();

    var scrim = el('div','pdm-scrim');
    var panel = el('aside','pdm-panel');
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label',MENU_TXT);

    var logo = document.querySelector('.brand img, .nav-logo img, #logoTop img');
    var logoSrc = logo ? logo.getAttribute('src') : '/pandoora_logo.webp';

    var head = el('div','pdm-head');
    var lg = el('a'); lg.href=T?T.links[0][0]:'/'; lg.innerHTML='<img src="'+logoSrc+'" alt="Pan.door.a">';
    var cl = el('button','pdm-close','<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>');
    cl.type='button'; cl.setAttribute('aria-label',CLOSE_TXT);
    head.appendChild(lg); head.appendChild(cl); panel.appendChild(head);

    var ul = el('ul','pdm-list');
    LINKS.forEach(function(l){
      var li = el('li');
      var a = el('a','pdm-link' + (l.h.toLowerCase()===here ? ' cur' : ''));
      a.href = l.h;
      a.innerHTML = l.t + '<small>' + l.s + '</small>';
      li.appendChild(a); ul.appendChild(li);
    });
    panel.appendChild(ul);
    panel.appendChild(el('div','pdm-sep'));

    var foot = el('div','pdm-foot');
    foot.innerHTML =
      '<a class="pdm-cta red" href="'+QUOTE_URL+'">'+QUOTE_TXT+'</a>'
    + '<a class="pdm-cta green" href="'+WA+'" target="_blank" rel="noopener">'
    + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.23-3.24-.68-2.73-1.08-4.45-3.87-4.58-4.05-.13-.18-1.09-1.45-1.09-2.76s.69-1.96.93-2.23c.24-.27.53-.34.7-.34l.5.01c.16.01.38-.06.59.45.24.57.8 1.98.87 2.12.07.14.12.31.02.49-.09.18-.14.29-.28.45l-.42.49c-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.94 1.95 1.23 2.23 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.32.07.11.07.63-.17 1.31z"/></svg>'
    + 'WhatsApp</a>'
    + '<a class="pdm-cta ghost" href="tel:'+PHONE+'">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>'
    + PHONE_LABEL+'</a>'
    + '<a class="pdm-mail" href="mailto:'+MAIL+'">'+MAIL+'</a>';
    panel.appendChild(foot);

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    /* bottone: usa quello esistente se c'è, altrimenti creane uno */
    var triggers = [].slice.call(document.querySelectorAll('.burger'));
    if(!triggers.length){
      var b = el('button','pdm-burger','<span></span><span></span><span></span>');
      b.type='button'; b.setAttribute('aria-label',OPEN_TXT);
      document.body.appendChild(b);
      triggers = [b];
    }

    var lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      document.body.classList.add('pdm-open');
      triggers.forEach(function(t){ t.setAttribute('aria-expanded','true'); });
      panel.setAttribute('tabindex','-1');
      setTimeout(function(){ try{ cl.focus(); }catch(e){} }, 60);
    }
    function close(){
      document.body.classList.remove('pdm-open');
      triggers.forEach(function(t){ t.setAttribute('aria-expanded','false'); });
      if(lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(e){} }
    }
    function toggle(e){
      if(e){ e.preventDefault(); e.stopPropagation(); }
      document.body.classList.contains('pdm-open') ? close() : open();
    }

    triggers.forEach(function(t){
      t.setAttribute('aria-expanded','false');
      t.setAttribute('aria-controls','pdm-panel');
      t.style.touchAction = 'manipulation';
      t.addEventListener('click', toggle, false);
    });
    panel.id = 'pdm-panel';

    cl.addEventListener('click', function(e){ e.preventDefault(); close(); });
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
    panel.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a') : null;
      if(a) close();
    });
    window.addEventListener('pagehide', close);
  }


  /* ── rete lenta / CDN irraggiungibile: se GSAP non arriva, mostra comunque i contenuti ──
     Su mobile capita che la libreria di animazione non si carichi: senza questa rete
     di sicurezza la pagina resterebbe bianca perché i blocchi partono con opacity:0. */
  function gsapFallback(){
    var usesGsap = !!document.querySelector('script[src*="gsap"]');
    if(!usesGsap || window.gsap) return;
    var revealed = 0;
    document.querySelectorAll('section,header,footer,nav,div,h1,h2,h3,h4,p,li,span,a,img').forEach(function(n){
      if(n.closest('.pdm-panel,.pdm-scrim,.pdlang,#cur,#curRing,#intro')) return;
      var cs = getComputedStyle(n);
      if(cs.display === 'none' || cs.visibility === 'hidden') return;
      if(parseFloat(cs.opacity) === 0){
        n.style.setProperty('opacity','1','important');
        if(cs.transform && cs.transform !== 'none') n.style.setProperty('transform','none','important');
        revealed++;
      }
    });
    var intro = document.getElementById('intro');
    if(intro){ intro.style.display = 'none'; document.body.classList.remove('introing'); }
    document.documentElement.style.overflowY = 'auto';
    if(revealed) try{ console.warn('[pandoora] GSAP non caricato: contenuti mostrati senza animazioni ('+revealed+' elementi)'); }catch(e){}
  }
  window.addEventListener('load', function(){ setTimeout(gsapFallback, 2500); });

  /* pulsante Pandoora Shop in alto a destra */
  if(!document.querySelector('script[src="/shop-badge.js"]')){var ss=document.createElement('script');ss.src='/shop-badge.js';ss.defer=true;document.head.appendChild(ss);}

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
