/* Pan.door.a — pulsante "Pandoora Shop" in alto a destra su tutte le pagine.
   Nella barra .topbar si mette prima del pulsante preventivo; dove la barra non c'è
   resta fisso in alto a destra, accanto al menu mobile. */
(function(){
  if(window.__pdShop) return; window.__pdShop = true;
  if(/^\/shop(\/|$)/.test(location.pathname)) return;
  var URL = '/shop/';

  var css = ''
  + '@property --pdsa{syntax:"<angle>";initial-value:0deg;inherits:false}'
  + '.pdshop{position:relative;display:inline-flex;align-items:center;gap:9px;flex-shrink:0;height:42px;padding:0 20px 0 7px;overflow:visible;border-radius:100px;'
  + 'text-decoration:none!important;color:#fff!important;background:#0d1524;isolation:isolate;'
  + 'font-family:"Manrope",system-ui,-apple-system,Segoe UI,Arial,sans-serif;line-height:1;white-space:nowrap;'
  + 'box-shadow:0 10px 28px rgba(192,57,43,.28),0 2px 6px rgba(0,0,0,.25);transition:transform .25s cubic-bezier(.22,.61,.36,1),box-shadow .3s}'
  + '.pdshop::before{content:"";position:absolute;inset:-2px;border-radius:inherit;z-index:-2;'
  + 'background:conic-gradient(from var(--pdsa),#c0392b,#e0a83c,#8bc34a,#2e6be6,#c0392b);animation:pdsSpin 3.2s linear infinite}'
  + '.pdshop::after{content:"";position:absolute;inset:1px;border-radius:inherit;z-index:-1;background:linear-gradient(135deg,#16243f,#0b111d 60%)}'
  + '.pdshop:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 16px 36px rgba(192,57,43,.42),0 2px 6px rgba(0,0,0,.25)}'
  + '.pdshop:focus-visible{outline:2px solid #5b8def;outline-offset:4px}'
  + '.pdshop-ic{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#e04a3a,#c0392b);flex-shrink:0}'
  + '.pdshop-ic svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
  + '.pdshop-tx{display:flex;flex-direction:column;gap:2px;flex-shrink:0;padding-right:2px}'
  + '.pdshop-k{font-size:9px;font-weight:700;letter-spacing:2.2px;color:rgba(255,255,255,.62)}'
  + '.pdshop-b{font-size:14px;font-weight:800;letter-spacing:1.6px}'
  + '.pdshop-b em{font-style:normal;background:linear-gradient(90deg,#ff8a6b,#ffd27a);-webkit-background-clip:text;background-clip:text;color:transparent}'
  + '.pdshop-dot{position:absolute;top:-10px;right:auto;left:22px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#8bc34a;color:#0d1524;'
  + 'font-size:9px;font-weight:800;letter-spacing:.6px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #0d1524}'
  + '.pdshop-dot::after{content:"";position:absolute;inset:0;border-radius:inherit;background:#8bc34a;z-index:-1;animation:pdsPing 2s ease-out infinite}'
  + '.pdshop--fixed{position:fixed;top:max(14px,env(safe-area-inset-top));right:22px;z-index:9996}'
  + '@media(max-width:1080px){.pdshop--fixed{right:74px}}'
  + '@media(max-width:600px){.pdshop{height:38px;padding:0 12px 0 5px;gap:7px}.pdshop-k{display:none}.pdshop-b{font-size:12.5px;letter-spacing:1.2px}.pdshop-ic{width:28px;height:28px}'
  + '}'
  + '@media(max-width:430px){.topbar .nav-cta{display:none!important}}'
  + '@keyframes pdsSpin{to{--pdsa:360deg}}'
  + '@keyframes pdsPing{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.1);opacity:0}}'
  + '@media(prefers-reduced-motion:reduce){.pdshop::before,.pdshop-dot::after{animation:none}}';

  function build(){
    if(document.querySelector('.pdshop')) return;
    var st = document.createElement('style'); st.id = 'pdshop-css'; st.textContent = css; document.head.appendChild(st);
    var a = document.createElement('a');
    a.className = 'pdshop'; a.href = URL; a.setAttribute('aria-label','Pandoora Shop, negozio online');
    a.innerHTML = '<span class="pdshop-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg></span>'
      + '<span class="pdshop-tx"><span class="pdshop-k">PANDOORA</span><span class="pdshop-b"><em>SHOP</em></span></span>'
      + '<span class="pdshop-dot" aria-hidden="true">NEW</span>';
    var bar = document.querySelector('header.topbar, .topbar');
    if(bar){
      var cta = bar.querySelector('.nav-cta') || bar.querySelector('.burger');
      if(cta) bar.insertBefore(a, cta); else bar.appendChild(a);
    } else {
      a.classList.add('pdshop--fixed');
      document.body.appendChild(a);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
