# GiblinSimulator

Simulatore di vita di un ladro in stile GDR fantasy, interamente browser-based (nessun backend, nessuna installazione).

## Come avviare

Apri `index.html` direttamente nel browser. Nessun server richiesto.

## Tecnologie

| Tecnologia | Versione | Uso |
|---|---|---|
| Bootstrap | 5.3.3 (CDN) | Layout, componenti UI, grid responsive |
| Bootstrap Icons | 1.11.3 (CDN) | Icone nell'interfaccia |
| JavaScript (ES6+) | — | Logica di gioco, rendering, animazioni |
| localStorage | — | Salvataggio partita (`giblin_save_v2`) |
| HTML5 / CSS3 | — | Struttura e stile dark fantasy |

Nessuna dipendenza npm, nessun build step, nessun framework.

## Struttura del progetto

```
GiblinSimulator/
├── index.html          SPA unica con tutti i tab e le modali
├── css/
│   └── style.css       Tema dark fantasy (sfondo #1a1a2e, oro #c9a84c)
├── js/
│   ├── data.js         Database locale: missioni, oggetti, costanti
│   ├── game.js         Logica core: stato, meccaniche, salvataggio
│   ├── ui.js           Rendering interfaccia e modali
│   └── app.js          Entry point: init, event listeners, mini-giochi
├── assets/
│   └── rogue.svg       Avatar SVG del personaggio
└── docs/
    ├── GAMEPLAY.md     Regole, meccaniche e azioni di gioco
    └── DATA.md         Dati completi: missioni, oggetti, consumabili
```

## Salvataggio

- **Chiave localStorage:** `giblin_save_v2`
- **Versione save:** 2
- Il salvataggio avviene automaticamente dopo ogni azione rilevante.
- "Nuova Partita" cancella il salvataggio esistente.

## Documentazione completa

- [`docs/GAMEPLAY.md`](docs/GAMEPLAY.md) — Tutte le regole, meccaniche e azioni di gioco
- [`docs/DATA.md`](docs/DATA.md) — Dati completi: missioni, oggetti, consumabili, costanti
