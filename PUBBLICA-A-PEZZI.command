#!/bin/bash
# Pan.door.a — pubblica il sito a pezzi piccoli (per connessioni che si bloccano con PUBBLICA.command)
cd "$(dirname "$0")"
[ -f .git/index.lock ] && ! pgrep -x git >/dev/null && rm -f .git/index.lock
git config http.version HTTP/1.1
git config http.postBuffer 524288000

echo "→ Leggo cosa c'è online..."
git fetch origin --quiet || { echo "Impossibile raggiungere GitHub."; read -p "INVIO per chiudere. "; exit 1; }
git reset --mixed origin/main --quiet      # i file su disco NON vengono toccati
git add -A
FILES=()
while IFS= read -r -d '' f; do FILES+=("$f"); done < <(git diff --cached -z --name-only)
git reset --quiet
TOT=${#FILES[@]}
[ "$TOT" -eq 0 ] && { echo "✓ Niente da pubblicare."; read -p "INVIO per chiudere. "; exit 0; }

BATCH=80
PARTI=$(( (TOT + BATCH - 1) / BATCH ))
echo "→ $TOT file da pubblicare in $PARTI parti."
read -p "Procedo? Scrivi  si  e premi INVIO: " OK
[ "$OK" = "si" ] || [ "$OK" = "SI" ] || [ "$OK" = "Si" ] || { echo "Annullato."; exit 0; }

DATA=$(date +%d/%m/%Y)
i=0; p=1
while [ $i -lt $TOT ]; do
  git add -A -- "${FILES[@]:$i:$BATCH}"
  git commit -m "Aggiornamento sito del $DATA (parte $p/$PARTI)" --quiet
  ok=0
  for t in 1 2 3 4; do
    echo "→ Invio parte $p/$PARTI (tentativo $t)..."
    if git push origin main --quiet; then ok=1; break; fi
    sleep 5
  done
  if [ $ok -ne 1 ]; then
    echo ""; echo "⚠ La parte $p non è passata. Le parti precedenti sono online."
    echo "  Rilancia questo script più tardi: riparte da dove si è fermato."
    read -p "INVIO per chiudere. "; exit 1
  fi
  i=$((i + BATCH)); p=$((p + 1))
done

echo ""; echo "✓ PUBBLICATO — il sito si aggiorna entro un minuto circa."
read -p "Premi INVIO per chiudere. "
