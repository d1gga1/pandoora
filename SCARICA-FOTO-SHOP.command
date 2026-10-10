#!/bin/bash
# Scarica le foto dei prodotti del Pandoora Shop (generate con Higgsfield) e le salva in shop/img/
# Non pubblica nulla: dopo averle controllate, caricate la cartella shop come al solito.
cd "$(dirname "$0")"
B="https://d8j0ntlcm91z4.cloudfront.net/user_3FTrdgKEniBuTbOXzflvLrpH6cz"
P="shop/img/prodotti"; mkdir -p "$P/_png"
OK=0; TOT=0
while read n f; do
  [ -z "$n" ] && continue
  TOT=$((TOT+1))
  case "$n" in hero|camera|pranzo) OUT="shop/img/$n.jpg"; SZ=1800;; *) OUT="$P/$n.jpg"; SZ=1100;; esac
  if [ -f "$OUT" ]; then OK=$((OK+1)); continue; fi
  echo "→ $n"
  if curl -sSfL -o "$P/_png/$n.png" "$B/$f.png"; then
    sips -s format jpeg -s formatOptions 82 -Z $SZ "$P/_png/$n.png" --out "$OUT" >/dev/null && OK=$((OK+1))
  else echo "  ERRORE download $n"; fi
done <<'LIST'
scarpiera-ribalta-2 hf_20261010_140808_ce07fc33-8549-414a-8b76-2965227ba278
scarpiera-ribalta-3 hf_20261010_140807_7d43b5a2-aded-4e1d-90f1-5f7f33e9f164
scarpiera-slim-17 hf_20261010_140851_ed32ec7b-5563-43b5-8523-7b48198ad861
scarpiera-ante-2 hf_20261010_140852_13f618d5-c2d0-4cf7-843a-0cd22634a0fc
scarpiera-alta-5 hf_20261010_140852_fade57d1-3a3b-4b0c-9db2-b96ce3d58ad2
panca-seduta-cuscino hf_20261010_140852_435ada92-5348-4d96-a848-2f764825788b
panca-vani-giorno hf_20261010_140928_6fe1f332-fd2d-4d5e-b782-4b56591ba311
comodino-2-cassetti hf_20261010_140928_9d310f56-bdde-4c1e-8c96-f181e236d4cc
comodino-sospeso hf_20261010_140807_03643b61-ecd0-4598-acdb-801fcbea6983
comodino-vano-giorno hf_20261010_140928_051ee864-30ee-4334-88ee-c112fb13c78d
comodino-laccato hf_20261010_140951_b66f16c6-6b8d-4f24-9036-ebac3a94e745
mobile-tv-basso-180 hf_20261010_140807_b464e9d9-efbb-400e-89ea-a6e4fd04ac93
mobile-tv-sospeso hf_20261010_140928_5734912d-5ec8-4cf8-8dc9-19e0549a3328
parete-attrezzata hf_20261010_140952_23cecf2e-f7fe-44f9-aee5-357c03d43ad8
mobile-tv-cassetti hf_20261010_140952_8daa4e79-24d6-47c6-bf47-15fae92547d3
madia-3-ante hf_20261010_140952_a1b67a5c-9f78-41f9-8d06-6d113191a467
credenza-2-ante hf_20261010_141022_e44d9dd7-d2c4-4d15-9dbf-bedf1df3824e
madia-cannettata hf_20261010_141022_b8ebaa88-4720-4c43-bfa1-8e932900fbfd
credenza-vetrina hf_20261010_141023_3476b89f-535e-4ef1-848b-2479cfa39bfb
consolle-ingresso hf_20261010_141022_3c4595ab-202b-4df6-92bf-bbe58900a921
ingresso-specchio hf_20261010_141045_bfe6ea4b-b560-46d5-a2cb-b12dfdd7d37a
ingresso-2-ante hf_20261010_141046_2df6aa79-0262-42f7-a873-467b96d27bdb
bagno-sospeso-80 hf_20261010_141046_231e334d-a752-4aa1-8e21-c4d3fc067e6d
bagno-60-cassetti hf_20261010_141045_ab840096-0a58-4b54-9948-cd09aa4cc951
colonna-bagno hf_20261010_141109_2d9f5279-41fd-4e59-8c86-ebb33d45a9c9
mobile-lavatrice hf_20261010_141109_613ffe14-f7a8-4956-af94-a8f24bea280f
tavolo-rovere-160 hf_20261010_141108_8df23d4f-81c5-44c1-8332-aeedd6d24f25
tavolo-allungabile hf_20261010_141109_8d66cd34-39d3-4803-94e1-c5a8a4ed2a3e
tavolo-rotondo-120 hf_20261010_141130_fc93f84b-8e35-4e57-b539-1c2c74adb160
tavolo-laccato-metallo hf_20261010_141129_c3763cad-f0ee-41ec-83e1-30d84909d86b
top-rovere-massello hf_20261010_141129_fe03ef10-8b70-40cf-80df-c1e633a23606
top-laminato-hpl hf_20261010_141130_5d9c9c79-af5f-4d8b-bb6f-3b4db2132811
top-laccato-tondo hf_20261010_141156_83be4131-d768-4257-8627-75f563679bf6
scarpiera-pensile-duo hf_20261010_144436_1af7bd93-1c91-4d6c-90c5-f655ead41918
scarpiera-snella-2 hf_20261010_144436_da52b6d5-6733-40f2-be7b-c35472b0098d
scarpiera-snella-3 hf_20261010_144501_17f66ca9-3e53-4ecf-93c1-4a52d38b25d5
scarpiera-stella-4 hf_20261010_144436_04b64f84-f7e9-4524-9815-eec478b191f7
scarpiera-vetro-scorrevole hf_20261010_144436_6cf0c575-037d-4ed9-9d6c-f17507ff672b
panca-ante-scorrevoli hf_20261010_144501_46f3fb77-5ec0-440e-be19-48074f64084b
scarpiera-aperta-ripiani hf_20261010_144501_6662bb49-b967-4ec0-be03-37a6cca609a9
hero hf_20261010_141155_7a92dc9d-a782-4232-97ec-7f055a6814d9
camera hf_20261010_141155_f4a6235e-f1d4-448f-bc42-fe443d8ef7d4
pranzo hf_20261010_141156_53bfcaa4-12e3-44b2-b080-4e9015904e4e
LIST
rm -rf "$P/_png"
echo; echo "Scaricate $OK foto su $TOT"
read -n1 -p "Premi un tasto per chiudere..."
