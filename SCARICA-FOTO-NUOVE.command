#!/bin/bash
# Scarica le foto generate per la mail e per i componenti delle porte (11/10/2026)
cd "$(dirname "$0")"
mkdir -p _foto-generate
B=https://d8j0ntlcm91z4.cloudfront.net/user_3FTrdgKEniBuTbOXzflvLrpH6cz
while read nome file; do
  [ -z "$nome" ] && continue
  echo "→ $nome"
  curl -fsSL -o "_foto-generate/$nome.png" "$B/$file" || echo "   ERRORE su $nome"
done <<LISTA
mail-hero-foto hf_20261011_083042_5b16cdc0-bafa-4b03-b53b-947bbca1fa92.png
mail-porte-foto hf_20261011_083041_5c31a4d0-a778-4f08-b7dd-2192ec57e13a.png
cerniera-hd hf_20261011_083413_65bdbb45-aa43-4cfc-bf8e-5b2c5440d019.png
telaio-hd hf_20261011_083416_1d0287bd-5e37-46d7-b0e0-f552ab0f5529.png
anta-alveolare-hd hf_20261011_083420_5d89ed3d-e65a-4028-81c1-2373d80253c7.png
anta-laccata-hd hf_20261011_083423_8874e9b1-6cb4-4dd6-8c76-1cfd7713c356.png
cerniera-foto hf_20261011_083532_a9139de8-1a86-4afc-9b6d-d3d9f20d8e73.png
telaio-foto hf_20261011_083456_1f8b51af-7405-49a7-a818-bb19cce50a07.png
LISTA
echo ""
ls -la _foto-generate
echo ""
echo "✓ Fatto. Tornate su Claude e scrivete: scaricate"
read -p "Premi INVIO per chiudere. "
