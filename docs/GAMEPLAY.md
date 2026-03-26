# GAMEPLAY — Regole e Meccaniche

## Indice

1. [Il Personaggio](#il-personaggio)
2. [Ciclo Giornaliero](#ciclo-giornaliero)
3. [Missioni](#missioni)
4. [Borseggio](#borseggio)
5. [Tassa della Gilda](#tassa-della-gilda)
6. [Gioco dei Dadi](#gioco-dei-dadi)
7. [Sistema Taglia (Wanted)](#sistema-taglia-wanted)
8. [Sfide Giornaliere](#sfide-giornaliere)
9. [Mercato Nero](#mercato-nero)
10. [Equipaggiamento e Inventario](#equipaggiamento-e-inventario)
11. [Consumabili](#consumabili)
12. [Fama](#fama)
13. [Level Up](#level-up)
14. [Game Over](#game-over)

---

## Il Personaggio

**Nome fisso:** Giblin
**Classe:** Ladro (Rogue)

### Caratteristiche (6 stat D&D)

| Sigla | Nome | Proficiency Ladro |
|---|---|---|
| FOR | Forza | — |
| DES | Destrezza | ✓ |
| COS | Costituzione | — |
| INT | Intelligenza | ✓ |
| SAG | Saggezza | — |
| CAR | Carisma | ✓ |

**Modificatore** = `floor((valore - 10) / 2)`

### Competenza (Proficiency Bonus)

| Livelli | Bonus |
|---|---|
| 1 – 4 | +2 |
| 5 – 8 | +3 |
| 9 – 10 | +4 |

### Prova di Abilità (d20)

```
Risultato = 1d20 + modificatore stat + bonus proficiency (se competente) + bonus equipaggiamento
```

| Risultato | Esito |
|---|---|
| 20 naturale | **Critico** — successo automatico, reward ×1.5 |
| ≥ DC | **Successo pieno** — reward completi |
| DC−4 … DC−1 | **Successo parziale** — 50% XP e oro, 40% fama |
| ≤ DC−5 | **Fallimento** — nessun reward, aumenta taglia |
| 1 naturale | **Fallimento critico** — −fama, taglia +20 |

---

## Ciclo Giornaliero

Ogni giorno Giblin può eseguire liberamente (in qualsiasi ordine):

- Completare **2 missioni** (espandibile con equipaggiamento)
- Tentare il **borseggio** (1 tentativo base, espandibile)
- Giocare ai **dadi** (illimitato, limitato dall'oro disponibile)
- Acquistare dal **Mercato Nero**
- Usare/vendere oggetti dall'**inventario**
- Completare **sfide giornaliere**

Per **avanzare al giorno successivo** bisogna:
1. Pagare la **tassa della Gilda**
2. Affrontare l'eventuale **missione taglia** (se pending)

---

## Missioni

### Disponibilità

- **4–5 missioni** generate ogni giorno in base al livello di fama
- Tier sbloccati per fama: Tier 1 (0+ fama), Tier 2 (50+), Tier 3 (150+)
- **Completabili per giorno:** 2 base + `missionBonus` da equipaggiamento

### Meccanica

1. Scegli una missione → scegli un approccio (stat diversa per ogni approccio)
2. Tira 1d20 + modificatore + proficiency + equipaggiamento
3. Confronta con la DC della missione
4. Ottieni reward in base all'esito

### Reward

```
XP finale     = XP_base × 1.4 × boost_xp_attivi
Oro finale    = oro_base × boost_oro_attivi
Fama finale   = fama_base × boost_fama_attivi
```

| Esito | XP | Oro | Fama |
|---|---|---|---|
| Critico (nat20) | ×1.5 (applicato alla base prima del ×1.4) | Pieno | Pieno |
| Successo | 100% | 100% | 100% |
| Parziale | 50% | 50% | 40% |
| Fallimento | 0 | 0 | 0, +12 wanted |
| Fallimento critico | 0 | 0 | −fama, +20 wanted |

Alcune missioni hanno anche una **chance di item** (10%–65% secondo tier e missione).

---

## Borseggio

### Disponibilità

- **1 tentativo/giorno** base + `pickpocketBonus` da equipaggiamento
- Rilanciabile con **Rapidità di Mano** (reroll borseggio) se disponibile

### Mini-gioco

Una barra animata con un cursore che scorre avanti e indietro. Al centro una "zona successo" (💰).
**Obiettivo:** cliccare quando il cursore è sopra la zona successo.

**Velocità cursore:** random tra 0.55 e 1.35 (unità barra/secondo)

| Velocità | Label |
|---|---|
| Bassa (pct < 33%) | Media 🦊 |
| Media (33%–66%) | Veloce ⚡ (ricompensa bonus) |
| Alta (>66%) | Fulminea 🔥 (ricompensa massima!) |

### Reward

```
speedMult = 1 + (speed - 0.55) × 0.8   (range ≈ 1.0 – 1.6)
```

Se `speedMult ≥ 1.5` → prefisso "FULMINEO!" nel log.

| Probabilità | Tipo reward | Formula |
|---|---|---|
| 55% | Oro | 30–90 + lv×18 mo × speedMult |
| 25% | XP | 30–70 + lv×12 XP |
| 20% | Oggetto | 50% consumabile, 50% equipaggiamento |

**Fallimento** (cursore fuori zona): +18 wanted, nessun reward.

---

## Tassa della Gilda

Pagata automaticamente all'avanzamento del giorno.

### Formula

```
base        = 25 + livello×18 + livello²×1.5 + fameTier×28
tassa_netta = max(5, base × (1 − taxDiscount))
```

- `taxDiscount` proviene dall'equipaggiamento (0–20%)
- Se oro < tassa: perde fama invece di oro
  - Fama persa: `15 + livello×2` (o formula simile)
  - Se fama scende a 0 → **Game Over**

---

## Gioco dei Dadi

Tab dedicato. Giblin gioca contro 3 NPC (nomi casuali da pool di 15).

### Meccanica

1. Scegli la scommessa (3 opzioni basate sul max scommettibile)
2. Ognuno tira **2d6** — totale più alto vince; a parità vince Giblin
3. Animazione rivelazione: Giblin appare primo al 1° posto, poi gli NPC entrano uno alla volta dal migliore al peggiore — Giblin scende se superato

### Scommessa massima

```
max_bet = livello² × 45 + fameTier × 250
```

Esempi: Lv1 ≈ 50 mo · Lv5 ≈ 1.100 mo · Lv10 ≈ 4.500 mo

Le 3 opzioni sono: `max`, `⌊max × 2/3⌋` e `⌊max / 3⌋` (arrotondati a 5 mo).

### Reward per posizione

| Posto | Oro | XP | Fama |
|---|---|---|---|
| 1° | +3 × scommessa | 100 + lv×24 + scommessa×0.03 | +3 + scommessa/150 |
| 2° | +40% (netto −60%) | 50 + lv×12 + scommessa×0.015 | +1 + scommessa/300 |
| 3° | +15% (netto −85%) | 20 + lv×6 + scommessa×0.008 | 0 |
| 4° | −scommessa | 0 | −3 − lv/2 |

### Rapidità di Mano

- **2 rilanci/giorno** base + `diceRerollBonus` da equipaggiamento
- Disponibile se Giblin **non è arrivato primo** e ha rilanci rimasti
- Permette di rigiocare con una nuova scommessa (stessa)

---

## Sistema Taglia (Wanted)

### Come aumenta la taglia

| Evento | Wanted aggiunto |
|---|---|
| Fallimento missione | +12 |
| Fallimento critico (nat1) | +20 |
| Fallimento borseggio | +18 |
| Sconfitta cacciatore | +15 |

### Livelli di taglia

| Soglia | Titolo | Colore |
|---|---|---|
| 0 | Pulito 😊 | Verde |
| 15 | Sospettato 👀 | Giallo |
| 40 | Ricercato ⚠️ | Arancio |
| 80 | Molto Ricercato 🚨 | Rosso arancio |
| 150 | Taglia Alta 💀 | Rosso scuro |

### Missione obbligatoria (Cacciatore di Taglie)

Quando wanted ≥ 15, ogni avanzamento giorno può triggerare una missione rossa obbligatoria:

```
Probabilità trigger = min(0.85, (wanted − 15) / 200)
```

Finché la missione non è risolta, **non si può avanzare al giorno successivo**.

### Mini-gioco (doppio cursore)

Due cursori si muovono in direzioni opposte sulla stessa barra:
- **Cursore giocatore** (sinistra→destra): velocità 0.25–0.60
- **Cursore nemico** (destra→sinistra): velocità 0.20–0.60
- **Obiettivo:** cliccare quando i due cursori si trovano entro il 10% della barra di distanza

Il match dura **2 round** (best-of-2).

### Conseguenze

| Risultato | Effetto |
|---|---|
| Vittoria | +80+lv×20 XP, +80+lv×12+wanted/3 fama, wanted dimezzato |
| Sconfitta | −50% oro, +15 wanted |

---

## Sfide Giornaliere

### Disponibilità

- **5 sfide/giorno** base + `challengeBonus` da equipaggiamento
- **Refresh** disponibile se equipaggiamento ha `challengeRefresh` (rigenera sfide non completate)

### Tipi di sfida

| Categoria | Esempi |
|---|---|
| Missione con stat specifica | Completare missione con FOR / DES / COS / INT / SAG / CAR |
| Missione per tier | Completare missione Tier 2+ / Tier 3 |
| Critico | Tirare 20 naturale |
| Borseggio | Riuscire un borseggio |
| Missioni contate | Completare 1 / 2 missioni oggi |
| Equipaggiamento | Indossare 3 oggetti Comuni / 2 Non Comuni / 1 Raro / 1 Epico |
| Fama | Raggiungere 50 / 150 / 300 fama |
| Oro | Avere > 200 / > 500 mo | Avere < 50 mo |
| Livello | Raggiungere livello 3 / livello 5 |
| Acquisto | Acquistare un oggetto al mercato |
| Vendita | Vendere oggetto Comune / Non Comune / Raro / Epico / Leggendario |

---

## Mercato Nero

### Generazione giornaliera

- **6–8 oggetti equipaggiamento** + **3–5 consumabili** per giorno
- I prezzi variano del ±15% rispetto al valore base

#### Equipaggiamento

| Slot | Pesi qualità |
|---|---|
| 2 oggetti "adatti al livello" | Comune 55% · Non Comune 28% · Raro 12% · Epico 4% · Legg. 1% |
| Restanti oggetti "rari" | Comune 10% · Non Comune 20% · Raro 35% · Epico 25% · Legg. 10% |

#### Consumabili

- Pool: consumabili con `tier ≤ ceil(livello/3) + 1` e senza `marketExcluded`
- Esclusi dal mercato: **Borsa del Mendicante** e **Sacchetto di Gemme** (drop solo da missioni)

---

## Equipaggiamento e Inventario

### Slot equipaggiamento (8)

| Slot | Icona | Note |
|---|---|---|
| Testa | 🪖 | |
| Guanti | 🧤 | |
| Gambe | 🦿 | |
| Torso | 🥋 | |
| Stivali | 👢 | |
| Anello Dx | 💍 | Entrambi usano slot "ring" |
| Anello Sx | 💍 | |
| Arma | 🗡️ | |

### Qualità oggetti

| Livello | Nome | Colore |
|---|---|---|
| 1 | Comune | Grigio |
| 2 | Non Comune | Verde |
| 3 | Raro | Blu |
| 4 | Epico | Viola |
| 5 | Leggendario | Arancio |

### Abilità speciali degli oggetti

| Abilità | Effetto |
|---|---|
| `pickpocketBonus` | +N tentativi borseggio/giorno |
| `rerollBonus` | +N rilanci missione/giorno |
| `taxDiscount` | −N% sulla tassa della Gilda |
| `goldBonus` | +N% oro da missioni/borseggio/dadi |
| `xpBonus` | +N% XP da missioni/borseggio/dadi |
| `missionBonus` | +1 missione completabile/giorno |
| `challengeBonus` | +1 sfida giornaliera visibile |
| `challengeRefresh` | +1 refresh sfide/giorno |
| `diceRerollBonus` | +1 Rapidità di Mano (reroll dadi)/giorno |

### Requisiti per equipaggiare

- `reqLevel`: livello minimo del personaggio
- `reqStat`: stat minima richiesta (valore effettivo = base + bonus equip)

Oggetti con requisiti non soddisfatti mostrano un **bordo rosso** nell'inventario.

---

## Consumabili

I consumabili si usano dall'inventario e non occupano slot equipaggiamento.
Non è possibile usare un boost del **stesso tipo** se è già attivo.

### Tipi di effetto

**Istantanei** — effetto immediato al momento dell'uso:
- XP, oro o fama aggiunti direttamente

**Boost temporanei** — percentuale bonus per N giorni:
- Si sommano ai moltiplicatori di missioni, borseggio e dadi
- Decrementano di 1 giorno a ogni avanzamento

---

## Fama

La fama è la valuta reputazionale di Giblin. Determina:
- Tier di missioni accessibili
- Tassa della Gilda (fama alta = tassa più alta)
- Scommessa massima ai dadi

### Rank (10 livelli)

| Soglia | Rank | Tier missioni |
|---|---|---|
| 0 | Sconosciuto | 1 |
| 50 | Conosciuto | 1 |
| 120 | Rispettato | 2 |
| 220 | Noto | 2 |
| 380 | Temuto | 2 |
| 600 | Famigerato | 3 |
| 900 | Infame | 3 |
| 1300 | Leggendario | 3 |
| 1800 | Immortale | 3–4 |
| 2500 | Il Fantasma | 3–4 |

---

## Level Up

- **Trigger:** `XP accumulati ≥ soglia XP per il livello attuale`
- **Azione richiesta:** scegli 3 caratteristiche da aumentare di +1
- **Max livello:** 10
- Il proficiency bonus si aggiorna automaticamente per fascia di livello

### Tabella XP

| Da lv | A lv | XP necessari |
|---|---|---|
| 1 | 2 | 300 |
| 2 | 3 | 900 |
| 3 | 4 | 2.700 |
| 4 | 5 | 6.500 |
| 5 | 6 | 14.000 |
| 6 | 7 | 23.000 |
| 7 | 8 | 34.000 |
| 8 | 9 | 48.000 |
| 9 | 10 | 64.000 |

---

## Game Over

Il gioco termina se la **fama scende a 0**. Può accadere per:

- **Fallimento critico (nat1)** su missione ad alto rischio
- **Impossibilità di pagare la tassa della Gilda** per più giorni consecutivi

Alla schermata di game over vengono mostrate le statistiche finali della partita.
È possibile iniziare una **Nuova Partita** che azzera tutto il salvataggio.
