/* Pan.door.a — adatta l'altezza dei riquadri 3D su telefono e gestisce le schede pannello/pedana */
(function(){
  addEventListener('message',function(e){
    var d=e.data;if(!d||!d.pd3d||!d.h)return;
    var fs=document.querySelectorAll('.pd3d iframe');
    for(var i=0;i<fs.length;i++){
      var f=fs[i];
      if(f.contentWindow!==e.source)continue;
      if(f.clientWidth>=760){f.style.height='';return}
      f.style.height=Math.max(480,Math.min(1800,Math.ceil(d.h)))+'px';
      return;
    }
  });
  var tabs=document.querySelectorAll('.pd3d-tabs [data-src]');
  for(var j=0;j<tabs.length;j++){
    tabs[j].addEventListener('click',function(){
      var b=this,box=document.getElementById(b.getAttribute('aria-controls'));if(!box)return;
      var fr=box.querySelector('iframe'),cap=box.querySelector('[data-cap]');
      var all=b.parentNode.querySelectorAll('[data-src]');
      for(var k=0;k<all.length;k++)all[k].setAttribute('aria-selected',all[k]===b?'true':'false');
      if(fr&&fr.getAttribute('src')!==b.getAttribute('data-src')){fr.style.height='';fr.setAttribute('src',b.getAttribute('data-src'));fr.setAttribute('title',b.getAttribute('data-title')||fr.title)}
      if(cap&&b.getAttribute('data-caption'))cap.innerHTML=b.getAttribute('data-caption');
    });
  }
})();
