#!/bin/bash
# Scarica le 24 foto dei Componenti per mobili e le converte in JPG ottimizzati
cd "$(dirname "$0")"
DEST="assets/componenti"; mkdir -p "$DEST/_png"
B="https://d8j0ntlcm91z4.cloudfront.net/user_3FTrdgKEniBuTbOXzflvLrpH6cz"
while read n f; do
  [ -z "$n" ] && continue
  echo "→ $n"
  curl -sSfL -o "$DEST/_png/$n.png" "$B/$f.png" || { echo "  ERRORE download $n"; continue; }
  sips -s format jpeg -s formatOptions 80 -Z 1200 "$DEST/_png/$n.png" --out "$DEST/$n.jpg" >/dev/null
done <<'LIST'
01 hf_20261009_174749_0a5efb62-0cac-4471-bb1a-275781b11f7d
02 hf_20261009_174700_3643feaf-5454-4902-b379-42437e238557
03 hf_20261009_174748_49387b5a-2340-4400-8eb0-3c83ec1249a3
04 hf_20261009_174749_65c2dc95-1605-4344-8b86-a8fddcf4012f
05 hf_20261009_174700_454fbf60-4395-43c8-9518-9eef40f805ec
06 hf_20261009_174749_24015d08-0356-4b98-9e10-d07befad8c60
07 hf_20261009_174800_998ce445-2a7e-43be-92f0-a2196b216d08
08 hf_20261009_174700_80e1fc93-61dc-44be-bf0b-ba9823c41432
09 hf_20261009_174800_f2ae13f7-c2ce-44c2-95e6-d1f1a41750dd
10 hf_20261009_174801_8bac34b8-1416-4b5d-a385-e51efbd445ff
11 hf_20261009_174700_0b7a76b3-e7f8-435e-b512-2b520fa3ba3e
12 hf_20261009_174800_11155fc5-116c-46f3-8b65-c9f9f1b54579
13 hf_20261009_174713_6d5d4663-0c3f-4be8-98f6-39b2132c2791
14 hf_20261009_174713_9babdede-4597-4387-8263-cbe3f8bb4cff
15 hf_20261009_174836_58ee5442-8e2a-47be-9cb1-e40dad063ec6
16 hf_20261009_174812_2e359bfe-ab0b-4267-a239-9a6ebc357f96
17 hf_20261009_174811_d1006935-0c7b-4bd2-b294-1dcc8067f6d2
18 hf_20261009_174812_bc6f2bd6-cecb-415d-901c-d07a415cf7c3
19 hf_20261009_174835_49ea0333-7896-454d-b155-1f3d04f425aa
20 hf_20261009_174713_b6c0fd5d-5abb-4ec5-a7c3-49460c31cd6b
21 hf_20261009_174713_cea54a25-f0d0-4b73-915e-f1d59ceaaf3e
22 hf_20261009_174837_e7637a47-7677-4759-b6f6-808ea0db3911
23 hf_20261009_174836_79e61992-c0f1-465b-b3c2-539ea72b46d3
24 hf_20261009_174855_e3e0e521-f2b9-4792-a5cf-a260443ddd03
LIST
echo; echo "Fatto: $(ls "$DEST"/*.jpg 2>/dev/null | wc -l | tr -d ' ') foto in $DEST"
read -n1 -p "Premi un tasto per chiudere..."
