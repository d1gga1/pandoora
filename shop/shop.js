/* Pandoora Shop — carrello, preferiti, ricerca e pagine categoria.
   I prodotti oggi arrivano da /shop/data/products.json; con Supabase cambierà solo loadProducts(). */
(function(){
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var eur = new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'});
  function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  var CAT=null, PRODUCTS=[];
  var cart = store('pdShopCart') || [];
  var favs = store('pdShopFav') || [];

  function loadJSON(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(u);return r.json()})}
  function loadProducts(){return loadJSON('/shop/data/products.json').then(function(d){return d.products||[]}).catch(function(){return []})}

  /* ---------- contatori e carrello ---------- */
  function counts(){
    var n = cart.reduce(function(a,l){return a+(l.qty||1)},0);
    var cn=$('#s-cart-n'), fn=$('#s-fav-n');
    if(cn){cn.textContent=n;cn.dataset.n=n}
    if(fn){fn.textContent=favs.length;fn.dataset.n=favs.length}
  }
  function openDrawer(mode){
    var b=$('#s-drawer-b'), f=$('#s-drawer-f'), t=$('#s-drawer-t');
    if(!b) return;
    if(mode==='fav'){
      t.textContent='Preferiti';
      var list=PRODUCTS.filter(function(p){return favs.indexOf(p.id)>=0});
      b.innerHTML = list.length ? list.map(lineHTML).join('') : '<p>Non avete ancora salvato prodotti. Toccate il cuore su una scheda per ritrovarla qui.</p>';
      f.innerHTML='';
    } else {
      t.textContent='Carrello';
      if(!cart.length){
        b.innerHTML='<p>Il carrello è vuoto.</p><p style="color:var(--s-ink2)">Il negozio è in allestimento: per un ordine subito, anche su misura, scriveteci e vi mandiamo il preventivo.</p>';
        f.innerHTML='<a class="s-btn s-btn-p" href="/preventivo/" style="justify-content:center">Richiedi un preventivo</a>';
      } else {
        var tot=0;
        b.innerHTML=cart.map(function(l,i){tot+=(l.price||0)*(l.qty||1);return '<div class="s-line"><img src="'+esc(l.img||'/icon-192.png')+'" alt=""><div><b>'+esc(l.name)+'</b><small>'+esc(l.dims||'')+' · '+(l.qty||1)+' pz</small><br><button type="button" data-rm="'+i+'">Rimuovi</button></div><b>'+eur.format((l.price||0)*(l.qty||1))+'</b></div>'}).join('');
        f.innerHTML='<div class="s-total"><span>Totale</span><span>'+eur.format(tot)+'</span></div><button class="s-btn s-btn-p" type="button" disabled style="justify-content:center;opacity:.6;cursor:not-allowed">Pagamento in arrivo</button>';
        $$('[data-rm]',b).forEach(function(x){x.onclick=function(){cart.splice(+x.dataset.rm,1);store('pdShopCart',cart);counts();openDrawer('cart')}});
      }
    }
    document.body.classList.add('s-cart-open');
    $('#s-drawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){document.body.classList.remove('s-cart-open');var d=$('#s-drawer');if(d)d.setAttribute('aria-hidden','true')}
  function lineHTML(p){return '<div class="s-line"><img src="'+esc(p.img)+'" alt=""><div><b>'+esc(p.name)+'</b><small>'+esc(p.desc||'')+'</small></div><a href="'+esc(p.url||'#')+'">Vedi</a></div>'}

  /* ---------- schede prodotto ---------- */
  function minPrice(p){
    var s=(p.std||[]).map(function(v){return v.price}).filter(function(x){return typeof x==='number'});
    return s.length?Math.min.apply(null,s):(p.price||0);
  }
  function card(p){
    var std=(p.std||[])[0]||{};
    var dims = std.w ? (std.w+' × '+(std.d||'—')+' × '+(std.h||'—')+' cm') : '';
    var fav = favs.indexOf(p.id)>=0;
    return '<article class="s-card">'
      +'<a class="s-card-img" href="'+esc(p.url||'#')+'"><img src="'+esc(p.img)+'" alt="'+esc(p.name)+'" loading="lazy">'
      +(p.custom?'<span class="s-badge g">Su misura</span>':'')+(p.badge?'<span class="s-badge" style="left:auto;right:10px">'+esc(p.badge)+'</span>':'')+'</a>'
      +'<h3>'+esc(p.name)+'</h3><p class="s-desc">'+esc(p.desc||'')+'</p>'
      +(dims?'<span class="s-dim">'+dims+'</span>':'')
      +'<div class="s-price">'+(p.std&&p.std.length>1||p.custom?'<small>da</small>':'')+eur.format(minPrice(p))+'</div>'
      +'<div class="s-card-foot"><button class="s-add" type="button" data-add="'+esc(p.id)+'" aria-label="Aggiungi al carrello"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M12 11v6M9 14h6"/></svg></button>'
      +'<button class="s-fav" type="button" data-fav="'+esc(p.id)+'" aria-pressed="'+fav+'" aria-label="Aggiungi ai preferiti"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button></div>'
      +'</article>';
  }
  function bindCards(root){
    $$('[data-add]',root).forEach(function(b){b.onclick=function(){
      var p=PRODUCTS.find(function(x){return x.id===b.dataset.add});if(!p)return;
      var s=(p.std||[])[0]||{};
      cart.push({id:p.id,name:p.name,img:p.img,price:s.price||minPrice(p),dims:s.w?(s.w+'×'+s.d+'×'+s.h+' cm'):'',qty:1});
      store('pdShopCart',cart);counts();openDrawer('cart');
    }});
    $$('[data-fav]',root).forEach(function(b){b.onclick=function(){
      var i=favs.indexOf(b.dataset.fav);if(i>=0)favs.splice(i,1);else favs.push(b.dataset.fav);
      store('pdShopFav',favs);b.setAttribute('aria-pressed',i<0);counts();
    }});
  }
  function emptyHTML(catName,icon){
    return '<div class="s-empty"><span class="s-empty-ic">'+(icon||'')+'</span><div>'
      +'<h3>'+(catName?esc(catName)+': prodotti in arrivo':'Nessun prodotto trovato')+'</h3>'
      +'<p>Stiamo caricando il catalogo del negozio online. Nel frattempo realizziamo questi prodotti anche su misura: mandateci le dimensioni e la finitura che vi servono e vi rispondiamo con un preventivo, di norma entro 24 ore lavorative.</p>'
      +'<div class="s-btns"><a class="s-btn s-btn-p" href="/preventivo/">Richiedi un preventivo</a><a class="s-btn s-btn-o" href="https://wa.me/393884706887" target="_blank" rel="noopener">Scrivici su WhatsApp</a></div>'
      +'</div></div>';
  }

  /* ---------- pagina categoria ---------- */
  function initCat(){
    var id=document.body.dataset.cat;
    var cat=CAT.categories.find(function(c){return c.id===id});
    var state={sub:(location.hash||'').replace('#',''),sort:'rel',custom:false,fin:'',price:''};
    var grid=$('#s-grid'), cnt=$('#s-count');
    var mine=PRODUCTS.filter(function(p){return p.cat===id});
    var fins={};mine.forEach(function(p){(p.finishes||[]).forEach(function(f){fins[f]=1})});
    var fs=$('#s-f-fin');Object.keys(fins).sort().forEach(function(f){var o=document.createElement('option');o.value=f;o.textContent=f;fs.appendChild(o)});
    function render(){
      $$('#s-subs .s-sub').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sub===state.sub)});
      var list=mine.filter(function(p){
        if(state.sub&&p.sub!==state.sub)return false;
        if(state.custom&&!p.custom)return false;
        if(state.fin&&(p.finishes||[]).indexOf(state.fin)<0)return false;
        if(state.price){var r=state.price.split('-'),m=minPrice(p);if(m<+r[0]||(r[1]&&m>+r[1]))return false}
        return true;
      });
      if(state.sort==='pa')list.sort(function(a,b){return minPrice(a)-minPrice(b)});
      if(state.sort==='pd')list.sort(function(a,b){return minPrice(b)-minPrice(a)});
      if(state.sort==='az')list.sort(function(a,b){return a.name.localeCompare(b.name,'it')});
      cnt.textContent=list.length+(list.length===1?' prodotto':' prodotti');
      var subName=state.sub?((cat.subs.find(function(s){return s[0]===state.sub})||[])[1]):'';
      grid.innerHTML=list.length?list.map(card).join(''):emptyHTML(subName||cat.name,CAT.icons[cat.icon]);
      bindCards(grid);
    }
    $$('#s-subs .s-sub').forEach(function(b){b.onclick=function(){state.sub=b.dataset.sub;history.replaceState(null,'',state.sub?'#'+state.sub:location.pathname);render()}});
    $('#s-sort').onchange=function(e){state.sort=e.target.value;render()};
    $('#s-f-fin').onchange=function(e){state.fin=e.target.value;render()};
    $('#s-f-price').onchange=function(e){state.price=e.target.value;render()};
    var cb=$('#s-f-custom');cb.onclick=function(){state.custom=!state.custom;cb.setAttribute('aria-pressed',state.custom);render()};
    window.addEventListener('hashchange',function(){state.sub=(location.hash||'').replace('#','');render()});
    render();
  }

  /* ---------- ricerca nella home ---------- */
  function initHome(){
    var q=new URLSearchParams(location.search).get('q');
    if(!q)return;
    var inp=$('#s-q');if(inp)inp.value=q;
    var sec=$('#risultati'),grid=$('#s-grid');
    var t=q.toLowerCase();
    var list=PRODUCTS.filter(function(p){return (p.name+' '+(p.desc||'')+' '+(p.tags||[]).join(' ')).toLowerCase().indexOf(t)>=0});
    $('#s-res-t').textContent='Risultati per «'+q+'»';
    grid.innerHTML=list.length?list.map(card).join(''):emptyHTML('');
    bindCards(grid);sec.hidden=false;sec.scrollIntoView({block:'start'});
  }

  function init(){
    var pf=$('.pf');if(pf)pf.classList.add('in');
    counts();
    var cb=$('#s-cart-btn'),fb=$('#s-fav-btn'),x=$('#s-x'),sc=$('#s-scrim');
    if(cb)cb.onclick=function(){openDrawer('cart')};
    if(fb)fb.onclick=function(){openDrawer('fav')};
    if(x)x.onclick=closeDrawer; if(sc)sc.onclick=closeDrawer;
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDrawer()});
    Promise.all([loadJSON('/shop/data/catalog.json'),loadProducts()]).then(function(r){
      CAT=r[0];PRODUCTS=r[1];
      var pg=document.body.dataset.page;
      if(pg==='cat')initCat(); else initHome();
    }).catch(function(){var g=$('#s-grid');if(g)g.innerHTML=emptyHTML('')});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
