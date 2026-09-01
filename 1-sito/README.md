# Sito Pan.door.a

Sito statico di **Pan.door.a S.r.l.** — pannelli tamburati, porte, pedane e allestimenti
per stand fieristici. Pubblicato con GitHub Pages su **pandooragroup.it**.

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | Home (hub dei settori) |
| `pannelli-tamburati-1.html` | Landing pannelli tamburati |
| `pannelli-tamburati-2.html` | Schede tecniche |
| `porte.html` · `pavimentazioni.html` · `verniciatura.html` · `componenti.html` | Pagine di settore |
| `progetto.html` | Pagine progetto (FebalCasa, ITA Airways, Technogym, Gruppo Romani) |
| `preventivo.html` · `grazie.html` | Form richiesta preventivo + conferma |
| `lang.js` | Selettore lingua e traduzioni (IT/EN/FR/DE) |
| `transition.js` | Transizioni tra pagine |
| `assets/` | Immagini e video del sito |

## Note operative

- Il form preventivo usa **FormSubmit** e recapita a `ordini@pandooragroup.it`.
  Funziona solo con il sito servito via http/https, non aprendo i file in locale.
- `CNAME` contiene il dominio: non va rimosso, GitHub Pages lo usa per il dominio custom.
- `.nojekyll` disattiva Jekyll: necessario perché i file vengano serviti così come sono.
- Le immagini delle porte sono in WebP (`assets/porte/`); i PNG originali restano
  solo in locale, esclusi dal repository.

## Pubblicare una modifica

```bash
git add -A
git commit -m "descrizione della modifica"
git push
```

GitHub Pages ricostruisce il sito in circa un minuto.
