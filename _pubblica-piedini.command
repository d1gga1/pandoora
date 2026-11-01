#!/bin/bash
cd "$(dirname "$0")"
echo "→ Pubblico le foto senza piedini..."
rm -f .git/index.lock 2>/dev/null
git fetch origin --quiet && git reset --mixed origin/main --quiet
git add llms-full.txt llms.txt shop/data/products.json shop/img/prodotti/cassettiera-lemene-6-480.jpg shop/img/prodotti/cassettiera-lemene-6-800.jpg shop/img/prodotti/cassettiera-lemene-6.jpg shop/img/prodotti/comodino-2-cassetti-480.webp shop/img/prodotti/comodino-2-cassetti-800.webp shop/img/prodotti/comodino-2-cassetti.jpg shop/img/prodotti/credenza-2-ante-480.webp shop/img/prodotti/credenza-2-ante-800.webp shop/img/prodotti/credenza-2-ante.jpg shop/img/prodotti/credenza-soligo-120-480.jpg shop/img/prodotti/credenza-soligo-120-800.jpg shop/img/prodotti/credenza-soligo-120.jpg shop/img/prodotti/credenza-soligo-top-rovere-480.jpg shop/img/prodotti/credenza-soligo-top-rovere-800.jpg shop/img/prodotti/credenza-soligo-top-rovere.jpg shop/img/prodotti/madia-3-ante-480.webp shop/img/prodotti/madia-3-ante-800.webp shop/img/prodotti/madia-3-ante.jpg shop/img/prodotti/madia-soligo-180-cassetti-480.jpg shop/img/prodotti/madia-soligo-180-cassetti-800.jpg shop/img/prodotti/madia-soligo-180-cassetti.jpg shop/img/prodotti/mobile-tv-cassetti-480.webp shop/img/prodotti/mobile-tv-cassetti-800.webp shop/img/prodotti/mobile-tv-cassetti.jpg shop/img/prodotti/panca-ante-scorrevoli-480.webp shop/img/prodotti/panca-ante-scorrevoli-800.webp shop/img/prodotti/panca-ante-scorrevoli.jpg shop/img/prodotti/panca-cansiglio-contenitore-480.jpg shop/img/prodotti/panca-cansiglio-contenitore-800.jpg shop/img/prodotti/panca-cansiglio-contenitore.jpg shop/img/prodotti/scarpiera-ante-2-480.webp shop/img/prodotti/scarpiera-ante-2-800.webp shop/img/prodotti/scarpiera-ante-2.jpg shop/img/prodotti/scarpiera-ribalta-2-480.webp shop/img/prodotti/scarpiera-ribalta-2-800.webp shop/img/prodotti/scarpiera-ribalta-2.jpg shop/img/prodotti/scarpiera-stella-4-480.webp shop/img/prodotti/scarpiera-stella-4-800.webp shop/img/prodotti/scarpiera-stella-4.jpg shop/listino-prezzi/index.html shop/mobiletti/credenza-soligo-120/index.html shop/mobiletti/credenza-soligo-top-rovere/index.html shop/mobiletti/index.html shop/mobiletti/madia-soligo-180-cassetti/index.html shop/mobiletti/madia-vallata-4-ante/index.html shop/shop.js 
git commit -m "Shop: foto mobili senza piedini" --quiet
if git push origin main; then
  echo "$(date) OK" > /tmp/pubblica-piedini.log
  echo ""; echo "✓ PUBBLICATO — il sito si aggiorna entro un minuto."
else
  echo "$(date) ERRORE" > /tmp/pubblica-piedini.log
  echo ""; echo "⚠ Invio non riuscito."
fi
echo ""; echo "Puoi chiudere questa finestra."
