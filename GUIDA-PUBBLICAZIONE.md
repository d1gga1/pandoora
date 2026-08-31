# Pubblicare pandooragroup.it su GitHub Pages

Situazione attuale: il dominio è gestito da **Aruba** (nameserver `dns.technorail.com`,
`dns2.technorail.com`, `dns3.arubadns.net`, `dns4.arubadns.cz`) e punta a **WordPress.com**
(record A `192.0.78.24` e `192.0.78.25`).

---

## 1 · Rendi pubblico il repository

GitHub Pages **non funziona su repository privati** con il piano gratuito.

`github.com/d1gga1/pandoora` → **Settings** → in fondo, *Danger Zone* →
**Change repository visibility** → *Make public*.

## 2 · Carica il sito

Da Terminale:

```bash
cd ~/Desktop/pandoora_site
git remote add origin https://github.com/d1gga1/pandoora.git
git push -u origin main --force
```

Alla richiesta di credenziali: **Username** `d1gga1`, **Password** = un
*Personal Access Token* creato su github.com → Settings → Developer settings →
Personal access tokens → *Tokens (classic)* → Generate new token, spunta `repo`.
Il token viene salvato nel Portachiavi del Mac: lo inserisci una volta sola.

> `--force` serve perché nel repository ci sono due commit vecchi (README e un
> index.html di prova) che vengono sostituiti dal sito.

## 3 · Attiva GitHub Pages

Repository → **Settings** → **Pages**:

- *Source*: **Deploy from a branch**
- *Branch*: **main** — cartella **/ (root)** → **Save**
- *Custom domain*: `pandooragroup.it` → **Save**

Dopo un paio di minuti il sito è online su `https://d1gga1.github.io/pandoora/`.

## 4 · Cambia i DNS su Aruba

Pannello Aruba → il dominio `pandooragroup.it` → **Gestione DNS / DNS e Server**.

**Record A del dominio principale (@ o `pandooragroup.it`)** — elimina i due
esistenti (`192.0.78.24`, `192.0.78.25`) e inseriscine quattro:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Record per `www`** — deve essere un **CNAME** verso:

```
d1gga1.github.io.
```

(se esiste un record A per `www`, va rimosso: A e CNAME non possono convivere)

### Da NON toccare, altrimenti si rompe la posta

- il record **MX** `10 mx.pandooragroup.it`
- il record del sottodominio **`mx`**
- eventuali record **TXT** (SPF, DKIM, verifiche)

La propagazione richiede da pochi minuti a qualche ora.

## 5 · Attiva HTTPS

Quando il DNS è propagato, torna in **Settings → Pages** e spunta
**Enforce HTTPS** (la casella si attiva da sola appena GitHub ha emesso il
certificato, di solito entro un'ora).

## 6 · Attiva il form preventivo

Apri `https://pandooragroup.it/preventivo.html`, invia una richiesta di prova:
arriverà a `ordini@pandooragroup.it` una mail di attivazione FormSubmit con un
link da cliccare **una volta sola**. Da lì in poi le richieste arrivano in casella.

---

## Aggiornare il sito in futuro

```bash
cd ~/Desktop/pandoora_site
git add -A
git commit -m "cosa ho cambiato"
git push
```

Il sito si aggiorna da solo in circa un minuto.

## File che restano solo in locale

Esclusi dal repository (vedi `.gitignore`): `parquet-photos/_originali_hd/`,
`assets/porte/_png_originali/`, i due PDF pesanti (`Catalogo_porte_pandoora_2026.pdf`,
`FINALL_v7.1.pdf`), i backup `.bak*` e gli script di servizio.
