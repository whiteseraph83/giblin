# DATA — Dati di Gioco

Tutte le costanti, missioni, oggetti e consumabili del gioco.

## Indice

1. [Costanti tecniche](#costanti-tecniche)
2. [Missioni (30)](#missioni-30)
3. [Oggetti equipaggiamento (40+)](#oggetti-equipaggiamento)
4. [Consumabili (10)](#consumabili-10)
5. [Pool sfide (30)](#pool-sfide-30)
6. [NPC dadi](#npc-dadi)

---

## Costanti tecniche

```js
SAVE_KEY     = 'giblin_save_v2'
SAVE_VERSION = 2
```

### Qualità oggetti

| ID | Nome | Colore |
|---|---|---|
| 1 | Comune | #95a5a6 (grigio) |
| 2 | Non Comune | #27ae60 (verde) |
| 3 | Raro | #2980b9 (blu) |
| 4 | Epico | #8e44ad (viola) |
| 5 | Leggendario | #e67e22 (arancio) |

### Livelli di taglia

| Soglia | Titolo | Colore |
|---|---|---|
| 0 | Pulito 😊 | #52b788 |
| 15 | Sospettato 👀 | #e9c46a |
| 40 | Ricercato ⚠️ | #f4a261 |
| 80 | Molto Ricercato 🚨 | #e76f51 |
| 150 | Taglia Alta 💀 | #c0392b |

### Livelli di fama (10 rank)

| Soglia | Rank | Tier |
|---|---|---|
| 0 | Sconosciuto | 1 |
| 50 | Conosciuto | 1 |
| 120 | Rispettato | 2 |
| 220 | Noto | 2 |
| 380 | Temuto | 2 |
| 600 | Famigerato | 3 |
| 900 | Infame | 3 |
| 1300 | Leggendario | 3 |
| 1800 | Immortale | 4 |
| 2500 | Il Fantasma | 4 |

### Tabella XP livelli

| Lv | XP totali | XP da guadagnare |
|---|---|---|
| 1 | 0 | 300 |
| 2 | 300 | 600 |
| 3 | 900 | 1.800 |
| 4 | 2.700 | 3.800 |
| 5 | 6.500 | 7.500 |
| 6 | 14.000 | 9.000 |
| 7 | 23.000 | 11.000 |
| 8 | 34.000 | 14.000 |
| 9 | 48.000 | 16.000 |
| 10 | 64.000 | — (max) |

---

## Missioni (30)

### Tier 1 — 0+ fama (missioni 1–10)

| # | Nome | Stat A | DC A | Stat B | DC B | XP | Oro | Fama | Item% |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Borseggio al Mercato | DES | 13 | — | — | 60 | 8–20 | 5 | — |
| 2 | Forzare una Serratura | DES | 14 | INT | 13 | 70 | 12–25 | 6 | — |
| 3 | Furto alla Taverna | CAR | 13 | DES | 14 | 65 | 15–30 | 6 | — |
| 4 | Seguire un Mercante | DES | 13 | — | — | 55 | 10–18 | 5 | — |
| 5 | Spiare una Conversazione | SAG | 12 | INT | 13 | 50 | 8–15 | 4 | — |
| 6 | Contrabbando di Merci | CAR | 14 | DES | 13 | 75 | 20–35 | 7 | — |
| 7 | Truffa al Gioco d'Azzardo | DES | 14 | INT | 13 | 70 | 25–50 | 6 | — |
| 8 | Recupero di Pacco Rubato | FOR | 14 | DES | 13 | 65 | 18–30 | 6 | — |
| 9 | Sabotare un Carro | INT | 14 | — | — | 60 | 15–25 | 5 | — |
| 10 | Rubare da Casa Privata | DES | 14 | — | — | 80 | 25–45 | 7 | 25% |

### Tier 2 — 50+ fama (missioni 11–22)

| # | Nome | Stat A | DC A | Stat B | DC B | XP | Oro | Fama | Item% |
|---|---|---|---|---|---|---|---|---|---|
| 11 | Infiltrarsi Palazzo Mercante | DES | 16 | INT | 16 | 130 | 35–60 | 12 | 30% |
| 12 | Rubare Sigillo Governatore | DES | 17 | CAR | 16 | 150 | 50–90 | 15 | 30% |
| 13 | Eliminare Guardia Corrotta | DES | 17 | FOR | 16 | 160 | 45–80 | 14 | 25% |
| 14 | Recuperare Documenti Tribunale | DES | 16 | INT | 17 | 140 | 60–100 | 13 | 20% |
| 15 | Spiare Gilda dei Maghi | SAG | 17 | INT | 16 | 145 | 55–95 | 14 | 35% |
| 16 | Furto Tesoreria Cittadina | DES | 17 | INT | 17 | 180 | 80–150 | 18 | 30% |
| 17 | Sabotare Guardia Notturna | DES | 16 | INT | 17 | 155 | 50–85 | 15 | 20% |
| 18 | Assassinare Informatore | DES | 18 | FOR | 17 | 170 | 70–120 | 16 | 30% |
| 19 | Recuperare Artefatto Rubato | INT | 16 | — | — | 135 | 40–70 | 12 | 40% |
| 20 | Infiltrarsi Gilda Assassini | CAR | 17 | DES | 18 | 175 | 65–110 | 17 | 35% |
| 21 | Consegnare Messaggio Cifrato | DES | 15 | CAR | 16 | 120 | 30–55 | 10 | 15% |
| 22 | Rubare Cavallo da Razza | DES | 17 | CAR | 16 | 160 | 60–100 | 15 | 20% |

### Tier 3 — 150+ fama (missioni 23–30)

| # | Nome | Stat A | DC A | Stat B | DC B | XP | Oro | Fama | Item% |
|---|---|---|---|---|---|---|---|---|---|
| 23 | Rubare Corona del Duca | DES | 19 | — | — | 280 | 150–300 | 35 | 50% |
| 24 | Eliminare Capo della Guardia | DES | 20 | FOR | 19 | 320 | 180–350 | 40 | 50% |
| 25 | Infiltrarsi nel Castello Reale | DES | 20 | INT | 19 | 300 | 160–280 | 38 | 55% |
| 26 | Recuperare Grimorio del Mago | DES | 19 | INT | 20 | 290 | 140–260 | 36 | 60% |
| 27 | Assassinare Nobile Traditore | DES | 19 | — | — | 310 | 200–400 | 42 | 50% |
| 28 | Rubare Tesoro Drago Mercante | CAR | 20 | INT | 19 | 350 | 250–500 | 45 | 60% |
| 29 | Sabotare Piano Inquisizione | DES | 19 | INT | 20 | 330 | 170–320 | 40 | 50% |
| 30 | Recuperare Sigillo del Re | DES | 20 | INT | 19 | 400 | 300–600 | 50 | 65% |

> **Nota:** Tutte le DC del Tier 1 sono state aumentate di +2 rispetto alla versione originale per aumentare il livello di sfida.

---

## Oggetti Equipaggiamento

40 oggetti suddivisi in 8 slot × 5 qualità.

### 🗡️ Arma (Weapon)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 101 | Pugnale Arrugginito | Comune | DES +1 | — | — |
| 102 | Coltello del Borsaiolo | Non Comune | DES +2 | pickpocketBonus +1 | Lv2 |
| 103 | Lama dell'Ombra | Raro | DES +3, INT +1 | rerollBonus +1, xpBonus 8% | Lv4, DES 13 |
| 104 | Stiletto Fantasma | Epico | DES +4, INT +2 | pickpocketBonus +1, xpBonus 12% | Lv6, DES 15 |
| 105 | Lama Maledetta | Leggendario | DES +5, INT +3, FOR +1 | pickpocketBonus +2, xpBonus 15% | Lv8, DES 17 |

### 🪖 Testa (Head)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 201 | Cappuccio Sgualcito | Comune | DES +1 | — | — |
| 202 | Maschera dell'Ingannatore | Non Comune | CAR +2 | rerollBonus +1 | Lv2 |
| 203 | Cappuccio dell'Eclissi | Raro | DES +2, CAR +2 | rerollBonus +1, goldBonus 8% | Lv4, DES 13 |
| 204 | Elmo dell'Ombra | Epico | DES +3, INT +2, CAR +1 | rerollBonus +2, goldBonus 12% | Lv6, INT 14 |
| 205 | Corona del Sottobosco | Leggendario | DES +3, INT +3, CAR +3 | rerollBonus +2, goldBonus 15%, xpBonus 10% | Lv8, INT 15 |

### 🧤 Guanti (Gloves)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 301 | Guanti di Pelle | Comune | DES +1 | — | — |
| 302 | Guanti del Borsaiolo | Non Comune | DES +2 | pickpocketBonus +1 | Lv2 |
| 303 | Guanti dell'Artigiano | Raro | DES +2, INT +2 | pickpocketBonus +1, taxDiscount 8% | Lv4, DES 13 |
| 304 | Guanti del Baro | Epico | DES +3, INT +2, CAR +1 | diceRerollBonus +1, taxDiscount 12% | Lv6, DES 15 |
| 305 | Guanti dell'Invisibile | Leggendario | DES +4, INT +2, CAR +2 | pickpocketBonus +2, taxDiscount 15%, diceRerollBonus +1 | Lv8, DES 16 |

### 🦿 Gambe (Legs)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 401 | Pantaloni di Cuoio | Comune | COS +1 | — | — |
| 402 | Gambali Imbottiti | Non Comune | COS +1, DES +1 | taxDiscount 5% | Lv2 |
| 403 | Schinieri dell'Ombra | Raro | DES +2, COS +2 | taxDiscount 8%, rerollBonus +1 | Lv4, COS 12 |
| 404 | Calzoni del Vento | Epico | DES +3, COS +2, FOR +1 | taxDiscount 12%, missionBonus +1 | Lv6, DES 14 |
| 405 | Calzoni della Notte Eterna | Leggendario | DES +4, COS +3, FOR +2 | taxDiscount 20%, missionBonus +1, xpBonus 10% | Lv8, COS 14 |

### 🥋 Torso (Torso)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 501 | Camicia Logora | Comune | COS +1 | — | — |
| 502 | Giaco di Pelle | Non Comune | COS +2 | goldBonus 5% | Lv2 |
| 503 | Armatura delle Ombre | Raro | COS +2, DES +2 | goldBonus 8%, challengeBonus +1 | Lv4, COS 12 |
| 504 | Manto dell'Eclissi | Epico | COS +3, DES +2, INT +1 | goldBonus 12%, challengeBonus +1, challengeRefresh +1 | Lv6, COS 14 |
| 505 | Mantello della Notte Eterna | Leggendario | COS +4, DES +3, INT +2 | goldBonus 15%, challengeBonus +1, challengeRefresh +1, missionBonus +1 | Lv8, COS 15 |

### 👢 Stivali (Boots)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 601 | Stivali Consumati | Comune | DES +1 | — | — |
| 602 | Stivali Silenziosi | Non Comune | DES +2 | pickpocketBonus +1 | Lv2, DES 12 |
| 603 | Stivali del Vento | Raro | DES +3, SAG +1 | pickpocketBonus +1, xpBonus 8% | Lv4, DES 13 |
| 604 | Stivali del Tempo | Epico | DES +4, SAG +2 | pickpocketBonus +2, xpBonus 12% | Lv6, DES 15 |
| 605 | Sandali del Viandante Eterno | Leggendario | DES +5, SAG +2, COS +1 | pickpocketBonus +2, xpBonus 15%, rerollBonus +1 | Lv8, DES 16 |

### 💍 Anello (Ring — occupa Dx o Sx)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 701 | Anello di Ferro | Comune | FOR +1 | — | — |
| 702 | Anello dell'Astuzia | Non Comune | INT +2 | rerollBonus +1 | Lv2 |
| 703 | Anello del Ladro | Raro | DES +2, INT +1 | pickpocketBonus +1, goldBonus 8% | Lv4, INT 13 |
| 704 | Anello del Destino | Epico | DES +2, INT +2, CAR +2 | rerollBonus +1, xpBonus 10%, goldBonus 10% | Lv6, DES 14 |
| 705 | Anello dell'Eterno Ladro | Leggendario | DES +3, INT +3, CAR +2 | pickpocketBonus +1, rerollBonus +2, xpBonus 15% | Lv8, DES 15 |

### 💍 Anello Sinistro (Ring Left)

| ID | Nome | Qualità | Bonus stat | Abilità | Req |
|---|---|---|---|---|---|
| 801 | Anello d'Argento | Comune | CAR +1 | — | — |
| 802 | Anello della Fortuna | Non Comune | CAR +2 | goldBonus 5% | Lv2 |
| 803 | Anello della Protezione | Raro | COS +2, CAR +2 | taxDiscount 8%, rerollBonus +1 | Lv4, CAR 12 |
| 804 | Anello del Serpente | Epico | CAR +3, DES +2, INT +1 | goldBonus 12%, challengeBonus +1 | Lv6, CAR 14 |
| 805 | Anello dei Sussurri | Leggendario | CAR +4, INT +2, DES +2 | goldBonus 15%, xpBonus 12%, challengeRefresh +1 | Lv8, CAR 15 |

---

## Consumabili (10)

### Effetti istantanei

| ID | Nome | Qualità | Tier | Effetto | Vendibile al mercato |
|---|---|---|---|---|---|
| 901 | Pozione dell'Illuminazione | Comune | 1 | +60 XP | ✓ |
| 902 | Borsa del Mendicante | Comune | 1 | +40 mo | ✗ (solo da drop) |
| 903 | Medaglione della Gilda | Non Comune | 1 | +15 fama | ✓ |
| 904 | Pergamena dell'Erudito | Non Comune | 2 | +180 XP | ✓ |
| 905 | Sacchetto di Gemme | Raro | 2 | +120 mo | ✗ (solo da drop) |

### Boost temporanei

| ID | Nome | Qualità | Tier | Effetto | Durata | Vendibile |
|---|---|---|---|---|---|---|
| 906 | Elisir della Fortuna | Non Comune | 1 | +25% oro | 2 giorni | ✓ |
| 907 | Estratto di Concentrazione | Raro | 2 | +30% XP | 3 giorni | ✓ |
| 908 | Incenso della Reputazione | Raro | 2 | +25% fama | 3 giorni | ✓ |
| 909 | Elisir dell'Expertise | Epico | 3 | +30% XP, +20% oro | 3 giorni | ✓ |
| 910 | Benedizione del Pantheon | Leggendario | 3 | +50% XP, +30% oro, +20% fama | 5 giorni | ✓ |

> **Nota:** I boost con lo stesso `itemId` non si accumulano. Se un boost è già attivo, il pulsante "Usa" è disabilitato.

---

## Pool Sfide (30)

| Tipo | Condizione | Reward (approx.) |
|---|---|---|
| mission_stat (×6) | Completare missione con FOR/DES/COS/INT/SAG/CAR | 60–80 XP, 20–40 mo |
| mission_tier | Completare missione Tier 2+ | 100 XP, 30 mo, 10 fama |
| mission_tier | Completare missione Tier 3 | 180 XP, 60 mo, 20 fama |
| mission_nat20 | Tirare 20 naturale su missione | 120 XP, 50 mo |
| complete_missions (×3) | Completare 1 / 2 missioni oggi | 40–80 XP, 15–35 mo |
| pickpocket_success | Riuscire un borseggio | 70 XP, 25 mo |
| wear_quality (×4) | Indossare 3 Comuni / 2 Non Comuni / 1 Raro / 1 Epico | 50–150 XP, 0–30 fama |
| reach_fame (×3) | Raggiungere 50 / 150 / 300 fama | 80–200 XP, 0–20 mo |
| gold_above (×2) | Avere > 200 / > 500 mo | 60–100 XP |
| gold_below | Avere < 50 mo | 100 XP, 80 mo |
| reach_level (×2) | Raggiungere lv3 / lv5 | 150–300 XP |
| buy_item (×4) | Acquistare oggetto al mercato | 50–80 XP, 10–25 mo |
| sell_item (×5) | Vendere Comune / Non Comune / Raro / Epico / Leggendario | 40–200 XP, 10–150 mo |

---

## NPC Dadi

Pool di 15 nomi per gli avversari al tavolo dei dadi (estratti casualmente ogni partita):

Aldric, Morgath, Sevryn, Torvin, Brynn, Quelion, Dax, Mirela, Jorath, Sylvara, Fenwick, Cassia, Draven, Isolde, Theron
