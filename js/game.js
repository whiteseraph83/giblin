/* ============================================================
   game.js — Meccaniche di gioco v2: dadi, prove, XP, salvataggio
   ============================================================ */

const SAVE_KEY = 'giblin_save_v2';
const SAVE_VERSION = 2;

/* ── Stat proficiency per il Ladro ── */
const ROGUE_PROF_STATS = ['dex', 'int', 'cha'];

const Game = {

  /* ─── Stato corrente ───────────────────────────────────── */
  state: null,

  /* ─── Inizializzazione ─────────────────────────────────── */
  init() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.version === SAVE_VERSION) {
          this.state = parsed;
          // Migrazioni campi assenti
          if (!this.state.dailyChallenges)                   { this.generateDailyChallenges(); this.save(); }
          if (this.state.challengeRefreshUsed === undefined)   this.state.challengeRefreshUsed = 0;
          if (this.state.character.wanted === undefined)       this.state.character.wanted = 0;
          if (this.state.wantedMissionPending === undefined)   this.state.wantedMissionPending = false;
          if (this.state.wantedMissionCompleted === undefined) this.state.wantedMissionCompleted = false;
          if (!this.state.activeBoosts)                        this.state.activeBoosts = [];
          if (this.state.diceRerollsUsed === undefined)        this.state.diceRerollsUsed = 0;
          return true;
        }
      } catch (e) {
        console.warn('Salvataggio corrotto, nuova partita.');
      }
    }
    return false;
  },

  newGame(stats) {
    this.state = {
      version: SAVE_VERSION,
      character: {
        name: 'Giblin',
        level: 1,
        xp: 0,
        gold: 30,
        fame: 10,
        wanted: 0,
        stats: { ...stats },
        proficiency: 2,
        equipment: {
          head: null, gloves: null, legs: null, torso: null,
          boots: null, ringRight: null, ringLeft: null, weapon: null
        },
        inventory: [],
        day: 1,
        log: []
      },
      dailyMissions: [],
      completedToday: [],
      marketItems: [],
      dailyChallenges: [],
      challengeRefreshUsed: 0,
      pickpocketsUsed: 0,
      rerollsUsed: 0,
      wantedMissionPending: false,
      wantedMissionCompleted: false,
      activeBoosts: [],
      diceRerollsUsed: 0,
      gameOver: false
    };
    this.generateDailyMissions();
    this.generateMarketItems();
    this.generateDailyChallenges();
    this.save();
  },

  save() {
    if (this.state) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    }
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.state = null;
  },

  /* ─── Dadi ─────────────────────────────────────────────── */
  rollD20() { return Math.floor(Math.random() * 20) + 1; },
  rollD6()  { return Math.floor(Math.random() * 6) + 1; },
  rollD100(){ return Math.floor(Math.random() * 100) + 1; },

  roll4d6DropLowest() {
    const rolls = [this.rollD6(), this.rollD6(), this.rollD6(), this.rollD6()];
    rolls.sort((a, b) => a - b);
    return rolls.slice(1).reduce((a, b) => a + b, 0);
  },

  rollAllStats() {
    return Array.from({ length: 6 }, () => this.roll4d6DropLowest());
  },

  rollGold(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /* ─── Modificatori ─────────────────────────────────────── */
  modifier(val) { return Math.floor((val - 10) / 2); },

  getModForStat(statKey) {
    return this.modifier(this.state.character.stats[statKey]);
  },

  /* ─── Stat effettiva (base + equip) ─────────────────────── */
  effectiveStat(key) {
    const base = this.state.character.stats[key] || 0;
    let bonus = 0;
    for (const [slot, itemId] of Object.entries(this.state.character.equipment)) {
      if (!itemId) continue;
      const item = DB.items.find(i => i.id === itemId);
      if (!item || !item.stats) continue;
      bonus += item.stats[key] || 0;
    }
    return base + bonus;
  },

  /* ─── Bonus equipaggiamento su stat (solo per breakdown) ── */
  equipBonusForStat(statKey) {
    let bonus = 0;
    for (const itemId of Object.values(this.state.character.equipment)) {
      if (!itemId) continue;
      const item = DB.items.find(i => i.id === itemId);
      if (!item || !item.stats) continue;
      bonus += item.stats[statKey] || 0;
    }
    return bonus;
  },

  /* ─── Abilità aggregate equipaggiamento ─────────────────── */
  getEquipmentAbilities() {
    const result = { pickpocketBonus: 0, rerollBonus: 0, taxDiscount: 0, goldBonus: 0, xpBonus: 0, missionBonus: 0, challengeBonus: 0, challengeRefresh: 0, diceRerollBonus: 0 };
    for (const itemId of Object.values(this.state.character.equipment)) {
      if (!itemId) continue;
      const item = DB.items.find(i => i.id === itemId);
      if (!item || !item.abilities) continue;
      result.pickpocketBonus += item.abilities.pickpocketBonus || 0;
      result.rerollBonus     += item.abilities.rerollBonus     || 0;
      result.taxDiscount     += item.abilities.taxDiscount     || 0;
      result.goldBonus       += item.abilities.goldBonus       || 0;
      result.xpBonus         += item.abilities.xpBonus         || 0;
      result.missionBonus      += item.abilities.missionBonus    || 0;
      result.challengeBonus    += item.abilities.challengeBonus  || 0;
      result.challengeRefresh  += item.abilities.challengeRefresh || 0;
      result.diceRerollBonus   += item.abilities.diceRerollBonus  || 0;
    }
    return result;
  },

  /* ─── Boost attivi (consumabili) ───────────────────────── */
  getActiveBoostMultipliers() {
    return (this.state.activeBoosts || []).reduce(
      (acc, b) => ({ xp: acc.xp + (b.xpBoost||0), gold: acc.gold + (b.goldBoost||0), fame: acc.fame + (b.fameBoost||0) }),
      { xp: 0, gold: 0, fame: 0 }
    );
  },

  useConsumable(itemId) {
    const char = this.state.character;
    const item = DB.items.find(i => i.id === itemId);
    if (!item?.consumable) return { ok: false, reason: 'Non è un consumabile.' };
    const idx = char.inventory.indexOf(itemId);
    if (idx === -1) return { ok: false, reason: 'Oggetto non trovato.' };

    const e = item.effect;
    let result = {};
    if (e.type === 'instant') {
      char.xp   += e.xp   || 0;
      char.gold += e.gold || 0;
      char.fame += e.fame || 0;
      result = { xp: e.xp||0, gold: e.gold||0, fame: e.fame||0 };
    } else {
      const boost = { id: `b_${Date.now()}`, name: item.name,
        xpBoost: e.xpBoost||0, goldBoost: e.goldBoost||0, fameBoost: e.fameBoost||0, daysLeft: e.duration };
      if (!this.state.activeBoosts) this.state.activeBoosts = [];
      this.state.activeBoosts.push(boost);
      result = { boost };
    }
    char.inventory.splice(idx, 1);
    const logEntry = { day: char.day, text: `Usato: ${item.name}`, type: 'success' };
    char.log.unshift(logEntry); if (char.log.length > 50) char.log.pop();
    const completedChallenges = this.checkChallenges('passive');
    this.checkLevelUp(); this.save();
    return { ok: true, result, completedChallenges };
  },

  /* ─── Borseggio ─────────────────────────────────────────── */
  pickpocketsAvailable() {
    return 1 + this.getEquipmentAbilities().pickpocketBonus;
  },

  pickpocketsRemaining() {
    return Math.max(0, this.pickpocketsAvailable() - this.state.pickpocketsUsed);
  },

  /* ─── Rilanci ────────────────────────────────────────────── */
  rerollsAvailable() {
    return this.getEquipmentAbilities().rerollBonus;
  },

  rerollsRemaining() {
    return Math.max(0, this.rerollsAvailable() - this.state.rerollsUsed);
  },

  useReroll() {
    if (this.rerollsRemaining() <= 0) return false;
    this.state.rerollsUsed++;
    this.save();
    return true;
  },

  /* ─── Proficiency ───────────────────────────────────────── */
  hasProficiency(statKey) {
    return ROGUE_PROF_STATS.includes(statKey);
  },

  totalBonus(statKey) {
    const baseStat = this.state.character.stats[statKey] || 10;
    const mod  = this.modifier(baseStat);
    const prof = this.hasProficiency(statKey) ? this.state.character.proficiency : 0;
    const equip = this.equipBonusForStat(statKey);
    return mod + prof + equip;
  },

  /* ─── Prova abilità ────────────────────────────────────── */
  resolveCheck(statKey, dc) {
    const roll   = this.rollD20();
    const bonus  = this.totalBonus(statKey);
    const total  = roll + bonus;

    let result;
    if (roll === 20)          result = 'nat20';
    else if (roll === 1)      result = 'nat1';
    else if (total >= dc)     result = 'success';
    else if (total >= dc - 4) result = 'partial';
    else                      result = 'failure';

    return { roll, bonus, total, dc, statKey, result };
  },

  /* ─── Risoluzione missione ─────────────────────────────── */
  resolveMission(missionId, approachIndex) {
    const mission  = DB.missions.find(m => m.id === missionId);
    const approach = mission.approaches[approachIndex];
    const check    = this.resolveCheck(approach.stat, approach.dc);
    const abilities = this.getEquipmentAbilities();

    const isSuccess = check.result === 'nat20' || check.result === 'success';
    const isPartial = check.result === 'partial';

    let rewards = { xp: 0, gold: 0, fame: 0, item: null };
    let outcomeText = '';

    const XP_MULT = 1.4; // moltiplicatore globale XP
    const boost   = this.getActiveBoostMultipliers();

    if (isSuccess) {
      let baseXp   = Math.floor(mission.rewards.xp * XP_MULT);
      let baseGold = this.rollGold(mission.rewards.goldMin, mission.rewards.goldMax);
      if (check.result === 'nat20') baseXp = Math.floor(baseXp * 1.5);

      baseXp   = Math.floor(baseXp   * (1 + abilities.xpBonus   + boost.xp));
      baseGold = Math.floor(baseGold * (1 + abilities.goldBonus  + boost.gold));

      rewards.xp   = baseXp;
      rewards.gold = baseGold;
      rewards.fame = Math.floor(mission.rewards.fameXp * (1 + boost.fame));

      if (Math.random() < mission.rewards.itemChance) {
        rewards.item = this.rollItemByTier(mission.rewards.itemTier);
      }
      outcomeText = check.result === 'nat20'
        ? 'CRITICO! ' + approach.successText
        : approach.successText;

    } else if (isPartial) {
      let baseXp   = Math.floor(mission.rewards.xp * XP_MULT * 0.5);
      let baseGold = this.rollGold(
        Math.floor(mission.rewards.goldMin * 0.5),
        Math.floor(mission.rewards.goldMax * 0.5)
      );
      baseXp   = Math.floor(baseXp   * (1 + abilities.xpBonus   + boost.xp));
      baseGold = Math.floor(baseGold * (1 + abilities.goldBonus  + boost.gold));

      rewards.xp   = baseXp;
      rewards.gold = baseGold;
      rewards.fame = Math.floor(mission.rewards.fameXp * 0.4);
      outcomeText  = approach.partialText;

    } else {
      rewards.fame = check.result === 'nat1' ? -5 : 0;
      outcomeText  = check.result === 'nat1'
        ? 'FALLIMENTO CRITICO! ' + approach.failText
        : approach.failText;
      // Aumenta taglia sul fallimento
      char.wanted = (char.wanted || 0) + (check.result === 'nat1' ? 20 : 12);
    }

    // Applica ricompense
    const char = this.state.character;
    char.xp   += rewards.xp;
    char.gold += rewards.gold;
    char.fame  = Math.max(0, char.fame + rewards.fame);

    if (rewards.item) {
      char.inventory.push(rewards.item.id);
    }

    // Game over se fama = 0 dopo nat1
    if (char.fame <= 0 && rewards.fame < 0) {
      this.state.gameOver = true;
    }

    // Segna come completata oggi
    this.state.completedToday.push(missionId);

    // Log
    const resultLabel = {
      nat20: 'Critico', success: 'Successo', partial: 'Parziale',
      nat1: 'Critico fallimento', failure: 'Fallimento'
    };
    const logType = (isSuccess ? 'success' : (isPartial ? 'partial' : 'fail'));
    const logEntry = {
      day: char.day,
      text: `${resultLabel[check.result]} — ${mission.name}`,
      type: logType
    };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();

    const levelUpResult = this.checkLevelUp();

    const completedChallenges = this.checkChallenges('mission_complete', {
      stat: approach.stat,
      tier: mission.tier,
      nat20: check.result === 'nat20'
    });

    this.save();
    return { check, approach, rewards, outcomeText, missionId, levelUpResult, completedChallenges };
  },

  /* ─── Oggetti ──────────────────────────────────────────── */
  rollItemByTier(tier) {
    // 30% chance di ottenere un consumabile del tier corrispondente
    if (Math.random() < 0.30) {
      const cPool = DB.items.filter(i => i.tier === tier && i.consumable);
      if (cPool.length) return cPool[Math.floor(Math.random() * cPool.length)];
    }
    const pool = DB.items.filter(i => i.tier === tier);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  rollItemWithQuality(maxQuality) {
    // Probabilità per qualità 1-5: [55,28,12,4,1]
    const weights = [55, 28, 12, 4, 1];
    const capped  = Math.min(maxQuality, 5);
    const sliced  = weights.slice(0, capped);
    const total   = sliced.reduce((a, b) => a + b, 0);
    const rand    = Math.random() * total;
    let cumulative = 0;
    let chosenQuality = 1;
    for (let q = 1; q <= capped; q++) {
      cumulative += sliced[q - 1];
      if (rand < cumulative) { chosenQuality = q; break; }
    }
    const pool = DB.items.filter(i => i.quality === chosenQuality);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  equipItem(itemId) {
    const item = DB.items.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: 'Oggetto non trovato.' };

    const char = this.state.character;

    // Check level req
    if (item.reqLevel && char.level < item.reqLevel) {
      return { ok: false, reason: `Livello ${item.reqLevel} richiesto.` };
    }

    // Check stat req (based on effective stat)
    if (item.reqStat) {
      const effVal = this.effectiveStat(item.reqStat.key);
      if (effVal < item.reqStat.val) {
        const label = { str:'FOR', dex:'DES', con:'COS', int:'INT', wis:'SAG', cha:'CAR' }[item.reqStat.key];
        return { ok: false, reason: `${label} ${item.reqStat.val} richiesta.` };
      }
    }

    // Rimuovi dall'inventario
    const idx = char.inventory.indexOf(itemId);
    if (idx === -1) return { ok: false, reason: 'Oggetto non in inventario.' };
    char.inventory.splice(idx, 1);

    // Slot target: per gli anelli usa il primo slot libero, altrimenti ringRight
    let targetSlot = item.slot;
    if (item.slot === 'ring') {
      if      (char.equipment.ringRight === null) targetSlot = 'ringRight';
      else if (char.equipment.ringLeft  === null) targetSlot = 'ringLeft';
      else                                        targetSlot = 'ringRight';
    }

    // Se slot occupato, rimetti il vecchio in inventario
    const prev = char.equipment[targetSlot];
    if (prev !== null) char.inventory.push(prev);

    char.equipment[targetSlot] = itemId;
    this.save();
    return { ok: true };
  },

  unequipItem(slot) {
    const char = this.state.character;
    const itemId = char.equipment[slot];
    if (!itemId) return false;
    char.inventory.push(itemId);
    char.equipment[slot] = null;
    this.save();
    return true;
  },

  sellItem(itemId, fromSlot = null) {
    const item = DB.items.find(i => i.id === itemId);
    if (!item) return false;
    const char = this.state.character;

    if (fromSlot !== null) {
      if (char.equipment[fromSlot] !== itemId) return false;
      char.equipment[fromSlot] = null;
    } else {
      const idx = char.inventory.indexOf(itemId);
      if (idx === -1) return false;
      char.inventory.splice(idx, 1);
    }

    char.gold += item.sellPrice;
    const completedChallenges = this.checkChallenges('sell_item', { quality: item.quality });
    this.save();
    return { ok: true, completedChallenges };
  },

  /* ─── Mercato Nero ──────────────────────────────────────── */
  rollItemWithQualityWeights(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    const rand  = Math.random() * total;
    let cumulative = 0;
    let chosenQuality = 1;
    for (let q = 1; q <= weights.length; q++) {
      cumulative += weights[q - 1];
      if (rand < cumulative) { chosenQuality = q; break; }
    }
    // Escludi consumabili dalla pool normale (hanno la loro sezione nel mercato)
    const pool = DB.items.filter(i => i.quality === chosenQuality && !i.consumable);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  generateMarketItems() {
    const char = this.state.character;
    const count = 6 + Math.floor(Math.random() * 3); // 6-8
    const maxQuality = Math.ceil(char.level / 2);

    // Pesi normali (proporzionali al livello)
    const normalWeights = [55, 28, 12, 4, 1].slice(0, Math.min(maxQuality, 5));
    // Pesi rari: favoriscono qualità media-alta indipendentemente dal livello
    const rareWeights   = [10, 20, 35, 25, 10];

    const generated = [];
    const usedIds   = new Set();

    const tryGetItem = (weights, attempts = 30, consumableOnly = false) => {
      for (let a = 0; a < attempts; a++) {
        const item = this.rollItemWithQualityWeights(weights, consumableOnly);
        if (item && !usedIds.has(item.id) && !item.marketExcluded) return item;
      }
      return null;
    };

    // 2 item "adatti al livello" con pesi normali
    for (let i = 0; i < 2; i++) {
      const item = tryGetItem(normalWeights);
      if (!item) continue;
      usedIds.add(item.id);
      const variance = 0.85 + Math.random() * 0.30;
      generated.push({ itemId: item.id, buyPrice: Math.round(item.buyPrice * variance) });
    }

    // Restanti item con pesi rari (spesso reqLevel superiore al livello attuale)
    for (let i = generated.length; i < count; i++) {
      const item = tryGetItem(rareWeights);
      if (!item) continue;
      usedIds.add(item.id);
      const variance = 0.85 + Math.random() * 0.30;
      generated.push({ itemId: item.id, buyPrice: Math.round(item.buyPrice * variance) });
    }

    // 2-3 consumabili (esclusi quelli con marketExcluded)
    const consumablePool = DB.items.filter(i => i.consumable && !i.marketExcluded &&
      (i.tier || 1) <= Math.ceil(char.level / 3) + 1 && !usedIds.has(i.id));
    const shuffledC = [...consumablePool].sort(() => Math.random() - 0.5);
    const cCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    for (let i = 0; i < Math.min(cCount, shuffledC.length); i++) {
      const item = shuffledC[i];
      usedIds.add(item.id);
      const variance = 0.90 + Math.random() * 0.20;
      generated.push({ itemId: item.id, buyPrice: Math.round(item.buyPrice * variance) });
    }

    this.state.marketItems = generated;
    this.save();
  },

  buyItem(itemId) {
    const char = this.state.character;
    const marketEntry = this.state.marketItems.find(m => m.itemId === itemId);
    if (!marketEntry) return { ok: false, reason: 'Oggetto non disponibile.' };

    const item = DB.items.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: 'Oggetto non trovato.' };

    if (char.gold < marketEntry.buyPrice) {
      return { ok: false, reason: 'Oro insufficiente.' };
    }

    char.gold -= marketEntry.buyPrice;
    char.inventory.push(itemId);
    this.state.marketItems = this.state.marketItems.filter(m => m.itemId !== itemId);

    const completedChallenges = this.checkChallenges('buy_item');
    this.save();
    return { ok: true, completedChallenges };
  },

  /* ─── Borseggio (Pickpocket) ────────────────────────────── */
  startPickpocket() {
    if (this.pickpocketsRemaining() <= 0) {
      return { ok: false, reason: 'Nessun tentativo rimasto.' };
    }
    this.state.pickpocketsUsed++;
    this.save();
    const speed = 0.3 + Math.random() * 0.7;
    return { ok: true, speed };
  },

  applyPickpocketReward(speedMult) {
    const char      = this.state.character;
    const abilities = this.getEquipmentAbilities();
    const roll100   = this.rollD100();
    let reward = null;
    let outcomeText = '';

    if (roll100 <= 55) {
      // 55% — oro
      const baseGold = this.rollGold(30, 90 + char.level * 18);
      const gold = Math.floor(baseGold * (1 + abilities.goldBonus) * speedMult);
      char.gold += gold;
      reward = { type: 'gold', amount: gold };
      outcomeText = 'Mano veloce! Tasca alleggerita con successo.';
    } else if (roll100 <= 80) {
      // 25% — esperienza
      const baseXp = this.rollGold(30, 70 + char.level * 12);
      const xp = Math.floor(baseXp * (1 + abilities.xpBonus) * speedMult);
      char.xp += xp;
      reward = { type: 'xp', amount: xp };
      outcomeText = 'Lezione pratica acquisita mentre alleggerivi qualche borsellino.';
    } else {
      // 20% — oggetto (35% chance consumabile, 65% equipaggiamento)
      let item;
      if (Math.random() < 0.35) {
        const maxTier = Math.ceil(char.level / 3) + 1;
        const cPool = DB.items.filter(i => i.consumable && (i.tier || 1) <= maxTier);
        item = cPool.length ? cPool[Math.floor(Math.random() * cPool.length)] : null;
      }
      if (!item) {
        const maxQ = Math.ceil(char.level / 2);
        item = this.rollItemWithQuality(maxQ);
      }
      if (item) {
        char.inventory.push(item.id);
        reward = { type: 'item', item };
        outcomeText = item.consumable
          ? 'Tasca alleggerita e bottino insolito trovato!'
          : 'Colpo speciale! Hai trovato qualcosa di interessante.';
      } else {
        const gold = this.rollGold(40, 80 + char.level * 10);
        char.gold += gold;
        reward = { type: 'gold', amount: gold };
        outcomeText = 'Niente di speciale, ma qualche moneta in più non fa male.';
      }
    }

    if (speedMult >= 1.5) outcomeText = 'FULMINEO! ' + outcomeText;

    const logEntry = { day: char.day, text: 'Borseggio riuscito', type: 'success' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();

    const levelUpResult = this.checkLevelUp();
    const completedChallenges = this.checkChallenges('pickpocket_success');
    this.save();
    return { success: true, reward, outcomeText, levelUpResult, completedChallenges };
  },

  applyPickpocketFailure() {
    const char = this.state.character;
    char.wanted = (char.wanted || 0) + 18;
    const logEntry = { day: char.day, text: 'Borseggio fallito', type: 'fail' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();
    this.save();
    return { success: false, reward: null, outcomeText: 'Le dita non erano abbastanza veloci. Niente da fare.' };
  },

  /* ─── Tassa della Gilda ─────────────────────────────────── */
  guildTax() {
    const char = this.state.character;
    const fameLevel = this.getFameLevel();
    const fameTier  = Math.min(4, fameLevel.tier);
    const abilities = this.getEquipmentAbilities();
    const base = 25 + char.level * 18 + Math.floor(char.level * char.level * 1.5) + fameTier * 28;
    const discounted = Math.floor(base * (1 - abilities.taxDiscount));
    return Math.max(5, discounted);
  },

  payGuildTax() {
    const char = this.state.character;
    const tax  = this.guildTax();

    if (char.gold >= tax) {
      char.gold -= tax;
      const logEntry = { day: char.day, text: `Tassa della Gilda pagata: ${tax} mo`, type: 'text' };
      char.log.unshift(logEntry);
      if (char.log.length > 50) char.log.pop();
      return { paid: true, tax, fameLost: 0 };
    } else {
      // Non può pagare: perde fama
      const fameLost = 15 + char.level * 2;
      char.fame = Math.max(0, char.fame - fameLost);
      const logEntry = { day: char.day, text: `Impossibile pagare la tassa! -${fameLost} fama`, type: 'fail' };
      char.log.unshift(logEntry);
      if (char.log.length > 50) char.log.pop();

      if (char.fame <= 0) {
        this.state.gameOver = true;
      }
      return { paid: false, tax, fameLost };
    }
  },

  /* ─── Giorno successivo ─────────────────────────────────── */
  nextDay() {
    const taxResult = this.payGuildTax();

    if (this.state.gameOver) {
      this.save();
      return { taxResult, gameOver: true };
    }

    const char = this.state.character;
    char.day++;

    // Reset contatori giornalieri
    this.state.pickpocketsUsed        = 0;
    this.state.rerollsUsed            = 0;
    this.state.diceRerollsUsed        = 0;
    this.state.wantedMissionCompleted = false;

    // Decrementa boost attivi
    this.state.activeBoosts = (this.state.activeBoosts || [])
      .map(b => ({ ...b, daysLeft: b.daysLeft - 1 }))
      .filter(b => b.daysLeft > 0);

    this.generateDailyMissions();
    this.generateMarketItems();
    this.refreshDailyChallenges();

    // Controlla se scatta missione taglia
    this.state.wantedMissionPending = this._checkWantedTrigger();

    this.save();
    return { taxResult, gameOver: false, wantedTriggered: this.state.wantedMissionPending };
  },

  /* ─── Progressione ─────────────────────────────────────── */
  checkLevelUp() {
    const char = this.state.character;
    if (char.level >= 10) return null;
    const xpNeeded = DB.xpTable[char.level - 1];
    if (char.xp >= xpNeeded) return { newLevel: char.level + 1 };
    return null;
  },

  applyLevelUp(statChoices) {
    const char = this.state.character;
    char.level++;
    statChoices.forEach(s => { char.stats[s]++; });
    // Proficiency: lv1-4: +2, lv5-8: +3, lv9-10: +4
    if (char.level <= 4)      char.proficiency = 2;
    else if (char.level <= 8) char.proficiency = 3;
    else                      char.proficiency = 4;

    const logEntry = { day: char.day, text: `Livello ${char.level} raggiunto!`, type: 'levelup' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();

    this.save();
  },

  /* ─── Missioni giornaliere ─────────────────────────────── */
  generateDailyMissions() {
    const char       = this.state.character;
    const RARE_STATS = new Set(['str', 'con', 'wis', 'cha']);
    const RARE_W     = 3;   // peso 3× per le stat rare
    const count      = 4 + Math.floor(Math.random() * 2); // 4–5 missioni visibili

    const fameOk = DB.missions.filter(m => m.minFame <= char.fame);

    // Weighted sampling senza ripetizione
    const pool = fameOk.map(m => ({
      id:     m.id,
      weight: m.approaches.some(a => RARE_STATS.has(a.stat)) ? RARE_W : 1
    }));

    const selected = [];
    while (selected.length < count && pool.length > 0) {
      const totalW = pool.reduce((s, e) => s + e.weight, 0);
      let r = Math.random() * totalW;
      let idx = pool.length - 1;
      for (let i = 0; i < pool.length; i++) { r -= pool[i].weight; if (r <= 0) { idx = i; break; } }
      selected.push(pool[idx].id);
      pool.splice(idx, 1);
    }

    this.state.dailyMissions  = selected;
    this.state.completedToday = [];
  },

  missionsCompletableToday() {
    return 2 + (this.getEquipmentAbilities().missionBonus || 0);
  },

  canCompleteMission() {
    return this.state.completedToday.length < this.missionsCompletableToday();
  },

  /* ─── Sistema Taglia (Wanted) ───────────────────────────── */
  getWantedLevel() {
    const w = this.state.character.wanted || 0;
    let current = WANTED_LEVELS[0];
    for (const wl of WANTED_LEVELS) { if (w >= wl.min) current = wl; }
    return current;
  },

  _checkWantedTrigger() {
    const w = this.state.character.wanted || 0;
    if (w < 15) return false;
    const chance = Math.min(0.85, (w - 15) / 200);
    return Math.random() < chance;
  },

  canAdvanceDay() {
    return !this.state.wantedMissionPending || this.state.wantedMissionCompleted;
  },

  getWantedNarrative() {
    return WANTED_NARRATIVES[Math.floor(Math.random() * WANTED_NARRATIVES.length)];
  },

  applyWantedWin() {
    const char = this.state.character;
    const xp   = 60 + char.level * 15;
    const fame = 30 + char.level * 5 + Math.floor((char.wanted || 0) / 5);
    char.xp   += xp;
    char.fame += fame;
    char.wanted = Math.floor((char.wanted || 0) * 0.5);
    this.state.wantedMissionCompleted = true;
    const logEntry = { day: char.day, text: 'Cacciatore di taglie sconfitto! Taglia ridotta.', type: 'success' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();
    const completedChallenges = this.checkChallenges('passive');
    this.save();
    return { xp, fame, wantedAfter: char.wanted, completedChallenges };
  },

  applyWantedLoss() {
    const char = this.state.character;
    const goldLost = Math.floor(char.gold / 2);
    char.gold = char.gold - goldLost;
    char.wanted = (char.wanted || 0) + 15;
    this.state.wantedMissionCompleted = true;
    const logEntry = { day: char.day, text: 'Sconfitto dal cacciatore di taglie! Metà oro perduto.', type: 'fail' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();
    this.save();
    return { goldLost };
  },

  /* ─── Sfide giornaliere ─────────────────────────────────── */
  _challengeFilter(c) {
    const char = this.state.character;
    if (c.type === 'reach_fame'  && c.condition.fame  <= char.fame)  return false;
    if (c.type === 'reach_level' && c.condition.level <= char.level) return false;
    if (c.type === 'mission_tier' && c.condition.tier === 3 && char.fame < 150) return false;
    return true;
  },

  generateDailyChallenges() {
    const count = 5 + (this.getEquipmentAbilities().challengeBonus || 0);
    const pool  = DB.challenges.filter(c => this._challengeFilter(c));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.state.dailyChallenges       = shuffled.slice(0, count).map(c => ({ challengeId: c.id, completed: false }));
    this.state.challengeRefreshUsed  = 0;
  },

  refreshDailyChallenges() {
    if (!this.state.dailyChallenges) { this.generateDailyChallenges(); return; }
    const count  = 5 + (this.getEquipmentAbilities().challengeBonus || 0);
    const kept   = this.state.dailyChallenges.filter(dc => !dc.completed);
    const usedIds = kept.map(dc => dc.challengeId);
    const pool   = DB.challenges.filter(c => !usedIds.includes(c.id) && this._challengeFilter(c));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const toAdd  = Math.max(0, count - kept.length);
    this.state.dailyChallenges      = [...kept, ...shuffled.slice(0, toAdd).map(c => ({ challengeId: c.id, completed: false }))];
    this.state.challengeRefreshUsed = 0;
  },

  challengeRefreshesRemaining() {
    const max = this.getEquipmentAbilities().challengeRefresh || 0;
    return Math.max(0, max - (this.state.challengeRefreshUsed || 0));
  },

  refreshChallenge(index) {
    if (this.challengeRefreshesRemaining() <= 0) return { ok: false, reason: 'Nessun refresh disponibile.' };
    const dc = this.state.dailyChallenges[index];
    if (!dc || dc.completed) return { ok: false, reason: 'Sfida non disponibile.' };
    const usedIds = this.state.dailyChallenges.map(c => c.challengeId);
    const pool = DB.challenges.filter(c => !usedIds.includes(c.id) && this._challengeFilter(c));
    if (!pool.length) return { ok: false, reason: 'Nessuna sfida alternativa disponibile.' };
    const newC = pool[Math.floor(Math.random() * pool.length)];
    this.state.dailyChallenges[index] = { challengeId: newC.id, completed: false };
    this.state.challengeRefreshUsed = (this.state.challengeRefreshUsed || 0) + 1;
    this.save();
    return { ok: true };
  },

  checkChallenges(eventType, eventData = {}) {
    if (!this.state.dailyChallenges) return [];
    const char = this.state.character;
    const newly = [];

    for (const dc of this.state.dailyChallenges) {
      if (dc.completed) continue;
      const tmpl = DB.challenges.find(c => c.id === dc.challengeId);
      if (!tmpl) continue;

      let ok = false;
      switch (tmpl.type) {
        case 'mission_stat':
          ok = eventType === 'mission_complete' && eventData.stat === tmpl.condition.stat; break;
        case 'mission_tier':
          ok = eventType === 'mission_complete' && eventData.tier >= tmpl.condition.tier; break;
        case 'mission_nat20':
          ok = eventType === 'mission_complete' && eventData.nat20 === true; break;
        case 'complete_missions':
          ok = this.state.completedToday.length >= tmpl.condition.count; break;
        case 'pickpocket_success':
          ok = eventType === 'pickpocket_success'; break;
        case 'buy_item':
          ok = eventType === 'buy_item'; break;
        case 'sell_item':
          ok = eventType === 'sell_item' && (eventData.quality || 0) >= tmpl.condition.quality; break;
        case 'wear_quality': {
          const count = Object.values(char.equipment)
            .filter(id => { if (!id) return false; const it = DB.items.find(i => i.id === id); return it && it.quality >= tmpl.condition.quality; })
            .length;
          ok = count >= tmpl.condition.count; break;
        }
        case 'reach_fame':  ok = char.fame  >= tmpl.condition.fame;  break;
        case 'gold_above':  ok = char.gold  >= tmpl.condition.gold;  break;
        case 'gold_below':  ok = char.gold  <= tmpl.condition.gold;  break;
        case 'reach_level': ok = char.level >= tmpl.condition.level; break;
      }

      if (ok) {
        dc.completed = true;
        char.xp   += tmpl.reward.xp   || 0;
        char.gold += tmpl.reward.gold || 0;
        char.fame += tmpl.reward.fame || 0;
        newly.push(tmpl);
      }
    }

    if (newly.length) this.save();
    return newly;
  },

  /* ─── Helpers ──────────────────────────────────────────── */
  getFameLevel() {
    const fame = this.state.character.fame;
    let current = DB.fameLevels[0];
    for (const fl of DB.fameLevels) {
      if (fame >= fl.min) current = fl;
    }
    return current;
  },

  getNextFameLevel() {
    const fame = this.state.character.fame;
    for (const fl of DB.fameLevels) {
      if (fl.min > fame) return fl;
    }
    return null;
  },

  famePercent() {
    const fame    = this.state.character.fame;
    const current = this.getFameLevel();
    const next    = this.getNextFameLevel();
    if (!next) return 100;
    const range = next.min - current.min;
    const prog  = fame - current.min;
    return Math.min(100, Math.round((prog / range) * 100));
  },

  xpPercent() {
    const char   = this.state.character;
    if (char.level >= 10) return 100;
    const xpPrev = char.level >= 2 ? DB.xpTable[char.level - 2] : 0;
    const xpNext = DB.xpTable[char.level - 1];
    const prog   = char.xp - xpPrev;
    const range  = xpNext - xpPrev;
    return Math.min(100, Math.round((prog / range) * 100));
  },

  xpForNextLevel() {
    const char = this.state.character;
    if (char.level >= 10) return '—';
    return DB.xpTable[char.level - 1];
  },

  /* ─── Gioco dei Dadi ────────────────────────────────────── */
  maxDiceBet() {
    const char = this.state.character;
    const tier = this.getFameLevel().tier || 0;
    return Math.max(10, 100 + char.level * 80 + tier * 150);
  },

  getDiceBetOptions() {
    const max   = this.maxDiceBet();
    const avail = this.state.character.gold;
    return [
      Math.min(max,                        avail),
      Math.min(Math.floor(max * 2 / 3),    avail),
      Math.min(Math.floor(max / 3),        avail),
    ].map(v => Math.max(1, v));
  },

  /* Rapidità di Mano — reroll dadi */
  diceRerollsAvailable() {
    return 2 + (this.getEquipmentAbilities().diceRerollBonus || 0);
  },
  diceRerollsRemaining() {
    return Math.max(0, this.diceRerollsAvailable() - (this.state.diceRerollsUsed || 0));
  },
  useDiceReroll() {
    if (this.diceRerollsRemaining() <= 0) return false;
    this.state.diceRerollsUsed = (this.state.diceRerollsUsed || 0) + 1;
    this.save();
    return true;
  },

  /* Calcola il risultato senza applicarlo */
  rollDiceGame(bet) {
    if (bet <= 0 || this.state.character.gold < bet) return { ok: false, reason: 'Oro insufficiente.' };
    const char = this.state.character;

    const roll2d6 = () => {
      const total = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
      const d1min = Math.max(1, total - 6);
      const d1max = Math.min(6, total - 1);
      const d1 = d1min + Math.floor(Math.random() * (d1max - d1min + 1));
      return { d1, d2: total - d1, total };
    };

    const npcPool = [...DICE_NPC_NAMES].sort(() => Math.random() - 0.5);
    const giblinDice = roll2d6();
    const players = [
      { name: 'Giblin',   isPlayer: true,  ...giblinDice },
      { name: npcPool[0], isPlayer: false, ...roll2d6()  },
      { name: npcPool[1], isPlayer: false, ...roll2d6()  },
      { name: npcPool[2], isPlayer: false, ...roll2d6()  },
    ];
    const ranked     = [...players].sort((a, b) =>
      b.total !== a.total ? b.total - a.total : (a.isPlayer ? -1 : 1));
    const giblinRank = ranked.findIndex(p => p.isPlayer) + 1;

    let goldDelta, fameDelta = 0, xp = 0, outcome;
    if (giblinRank === 1) {
      goldDelta = bet * 3; xp = 100 + char.level * 24; outcome = 'win';
    } else if (giblinRank === 4) {
      goldDelta = -bet; fameDelta = -(3 + Math.floor(char.level / 2)); outcome = 'last';
    } else {
      const pct = giblinRank === 2 ? 0.4 : 0.15;
      goldDelta = Math.floor(bet * pct) - bet;
      xp = giblinRank === 2 ? 50 + char.level * 12 : 20 + char.level * 6;
      outcome = 'consolation';
    }
    return { ok: true, ranked, giblinRank, bet, goldDelta, fameDelta, xp, outcome };
  },

  /* Applica il risultato finale allo stato */
  applyDiceGameResult(result) {
    const char = this.state.character;
    char.gold += result.goldDelta;
    char.fame  = Math.max(0, char.fame + result.fameDelta);
    char.xp   += result.xp;
    const logText = result.outcome === 'win'
      ? `Dadi: vittoria! +${result.goldDelta} mo`
      : result.outcome === 'last' ? `Dadi: ultimo posto, -${result.bet} mo`
      : `Dadi: ${result.giblinRank}° posto (${result.goldDelta >= 0 ? '+' : ''}${result.goldDelta} mo)`;
    const logEntry = { day: char.day, text: logText,
      type: result.outcome === 'win' ? 'success' : result.outcome === 'last' ? 'fail' : 'neutral' };
    char.log.unshift(logEntry);
    if (char.log.length > 50) char.log.pop();
    const completedChallenges = this.checkChallenges('passive');
    this.checkLevelUp();
    this.save();
    return { ...result, completedChallenges };
  },

  statLabel(statKey) {
    return { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR' }[statKey] || statKey.toUpperCase();
  },

  isMissionCompleted(id) {
    return this.state.completedToday.includes(id);
  },

  getItemById(id) {
    return DB.items.find(i => i.id === id) || null;
  },

  canAffordTax() {
    return this.state.character.gold >= this.guildTax();
  }
};
