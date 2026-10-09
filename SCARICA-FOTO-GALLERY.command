#!/bin/bash
cd "$(dirname "$0")"
DEST="assets/componenti"; mkdir -p "$DEST/_png"
B="https://d8j0ntlcm91z4.cloudfront.net/user_3FTrdgKEniBuTbOXzflvLrpH6cz"
OK=0
while read n f; do
  [ -z "$n" ] && continue
  echo "→ $n"
  if curl -sSfL -o "$DEST/_png/$n.png" "$B/$f.png"; then
    sips -s format jpeg -s formatOptions 80 -Z 1400 "$DEST/_png/$n.png" --out "$DEST/$n.jpg" >/dev/null && OK=$((OK+1))
  else echo "  ERRORE download $n"; fi
done <<'LIST'
g1 hf_20261009_180059_a400a5cd-b7e5-4266-ab74-6390aed80e42
g2 hf_20261009_180100_1a4a2265-1832-4c4a-980b-a709303e37c8
g3 hf_20261009_180058_a72b364f-5452-4e57-841c-727f124b5a70
g4 hf_20261009_180059_f1932f12-8b53-479e-b739-3addc846fa5a
LIST
echo; echo "Scaricate $OK foto su 4"
if [ "$OK" -eq 4 ]; then
  git add "$DEST"/g1.jpg "$DEST"/g2.jpg "$DEST"/g3.jpg "$DEST"/g4.jpg componenti-per-mobili/index.html
  git commit -m "Componenti: foto nella gallery" && git push origin main && echo "✓ Pubblicato"
fi
read -n1 -p "Premi un tasto per chiudere..."
