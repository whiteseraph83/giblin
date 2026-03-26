/* ============================================================
   app.js — Entry point: init, eventi, coordinamento v2
   ============================================================ */

const App = {

  _currentMissionId:    null,
  _currentApproachIdx:  null,
  _createModal:         null,
  _rolledValues:        [],
  _ppAnimFrameId:       null,
  _ppClickHandler:      null,
  _wantedAnimFrameId:   null,
  _wantedClickHandler:  null,
  _wantedRoundsWon:     0,

  /* ─── Bootstrap ───────────────────────────────────────── */
  init() {
    const hasGame = Game.init();
    if (hasGame) {
      if (Game.state.gameOver) {
        UI.refresh();
        setTimeout(() => UI.showGameOverModal(), 300);
      } else {
        UI.refresh();
      }
    } else {
      this._showPlaceholder();
      this._createModal = UI.showCreateModal();
    }
    this._bindEvents();
  },

  _showPlaceholder() {
    document.getElementById('char-name').textContent  = 'Giblin';
    document.getElementById('char-level').textContent = 'Lv.?';
    document.getElementById('missions-container').innerHTML =
      '<div class="col-12 text-center text-muted py-4"><i class="bi bi-lock fs-3"></i><p class="mt-2">Crea il tuo personaggio per iniziare.</p></div>';
  },

  /* ─── Binding eventi ──────────────────────────────────── */
  _bindEvents() {

    // Creazione PG — step 1: lancia dadi (no name required)
    document.getElementById('btn-roll-intro').addEventListener('click', () => {
      this._rolledValues = Game.rollAllStats();
      UI.showRollStep(this._rolledValues);
    });

    // Creazione PG — rilancia
    document.getElementById('btn-reroll').addEventListener('click', () => {
      this._rolledValues = Game.rollAllStats();
      UI.showRollStep(this._rolledValues);
    });

    // Creazione PG — conferma
    document.getElementById('btn-confirm-create').addEventListener('click', () => {
      const stats = UI.getStatAssignments(this._rolledValues);
      Game.newGame(stats);
      bootstrap.Modal.getInstance(document.getElementById('modal-create')).hide();
      UI.refresh();
      UI.toast('Benvenuto, Giblin! La tua avventura ha inizio.');
    });

    // Passa al giorno successivo
    document.getElementById('btn-nextday').addEventListener('click', () => {
      if (!Game.state || Game.state.gameOver) return;
      if (!Game.canAdvanceDay()) {
        UI.toast('⚠️ Devi prima affrontare il Cacciatore di Taglie!', 3000);
        return;
      }
      const result = Game.nextDay();

      if (result.gameOver) {
        UI.refresh();
        UI.showGameOverModal();
        return;
      }

      UI.refresh();

      const taxResult = result.taxResult;
      if (!taxResult.paid) {
        UI.toast(`Impossibile pagare la tassa! -${taxResult.fameLost} fama. Giorno ${Game.state.character.day}.`, 4000);
      } else {
        UI.toast(`Tassa pagata (${taxResult.tax} mo). Giorno ${Game.state.character.day} — nuove missioni.`);
      }
      if (result.wantedTriggered) {
        UI.toast('🎯 Un Cacciatore di Taglie ti sta cercando! Affrontalo nel tab Missioni.', 5000);
      }
    });

    // Missione Taglia
    document.getElementById('btn-wanted-mission').addEventListener('click', () => {
      if (!Game.state) return;
      this._wantedRoundsWon = 0;
      UI.openWantedModal();
      setTimeout(() => this._startWantedGame(), 400);
    });

    // Salva manuale
    document.getElementById('btn-save').addEventListener('click', () => {
      if (!Game.state) return;
      Game.save();
      UI.toast('Partita salvata!');
    });

    // Nuova partita — apre conferma
    document.getElementById('btn-newgame').addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('modal-confirm-newgame')).show();
    });

    document.getElementById('btn-confirm-newgame').addEventListener('click', () => {
      bootstrap.Modal.getInstance(document.getElementById('modal-confirm-newgame')).hide();
      Game.reset();
      location.reload();
    });

    // Game Over — nuova partita
    document.getElementById('btn-gameover-newgame').addEventListener('click', () => {
      Game.reset();
      location.reload();
    });

    // Pickpocket — avvia mini-gioco
    document.getElementById('btn-pickpocket').addEventListener('click', () => {
      if (!Game.state || Game.state.gameOver) return;
      const start = Game.startPickpocket();
      if (!start.ok) {
        UI.toast(start.reason || 'Nessun tentativo rimasto.');
        return;
      }
      UI.openPickpocketGame();
      this._startPickpocketGame(start.speed);
    });

    // Rilancio borseggio
    document.getElementById('btn-pickpocket-reroll').addEventListener('click', () => {
      if (!Game.useReroll()) { UI.toast('Nessun rilancio disponibile.'); return; }
      const newSpeed = 0.3 + Math.random() * 0.7;
      UI.openPickpocketGame();
      this._startPickpocketGame(newSpeed);
    });

    // Chiusura modal missione — refresh
    document.getElementById('modal-mission').addEventListener('hidden.bs.modal', () => {
      UI.refresh();
      this._currentMissionId   = null;
      this._currentApproachIdx = null;
    });

    // Chiusura modal pickpocket — ferma animazione + refresh
    document.getElementById('modal-pickpocket').addEventListener('hidden.bs.modal', () => {
      this._cancelPickpocketGame();
      UI.refresh();
    });

    // Chiusura modal taglia — ferma animazione + refresh
    document.getElementById('modal-wanted').addEventListener('hidden.bs.modal', () => {
      this._cancelWantedGame();
      UI.refresh();
    });
  },

  /* ─── Apertura modal missione ─────────────────────────── */
  openMissionModal(missionId) {
    if (!Game.state || Game.state.gameOver) return;
    if (Game.isMissionCompleted(missionId)) return;

    this._currentMissionId = missionId;
    const mission = DB.missions.find(m => m.id === missionId);
    if (!mission) return;

    UI.openMissionModal(mission);

    if (mission.approaches.length === 1) {
      document.getElementById('btn-roll-single').onclick = () => this._executeMission(missionId, 0);
    } else {
      document.getElementById('btn-approach-1').onclick = () => this._executeMission(missionId, 0);
      document.getElementById('btn-approach-2').onclick = () => this._executeMission(missionId, 1);
    }
  },

  /* ─── Esegui missione ─────────────────────────────────── */
  _executeMission(missionId, approachIndex) {
    this._currentApproachIdx = approachIndex;
    const resolution = Game.resolveMission(missionId, approachIndex);
    UI.showMissionResult(resolution, false);

    // Bind reroll button
    const rerollBtn = document.getElementById('btn-mission-reroll');
    rerollBtn.onclick = () => this._rerollMission(missionId, approachIndex);

    this._handleChallenges(resolution.completedChallenges);

    // Level up check
    if (resolution.levelUpResult) {
      setTimeout(() => {
        UI.showLevelUpModal(resolution.levelUpResult.newLevel, (statChoices) => {
          Game.applyLevelUp(statChoices);
          UI.refresh();
          UI.toast(`Livello ${Game.state.character.level} raggiunto!`);
        });
      }, 1800);
    }

    // Game over check
    if (Game.state.gameOver) {
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('modal-mission'))?.hide();
        UI.showGameOverModal();
      }, 2500);
    }
  },

  /* ─── Rilancio missione ───────────────────────────────── */
  _rerollMission(missionId, approachIndex) {
    const used = Game.useReroll();
    if (!used) {
      UI.toast('Nessun rilancio disponibile.');
      return;
    }

    // Re-run the check only (not resolveMission which would add to completedToday again)
    const mission  = DB.missions.find(m => m.id === missionId);
    const approach = mission.approaches[approachIndex];

    // Remove mission from completedToday so we can re-resolve
    const idx = Game.state.completedToday.indexOf(missionId);
    if (idx !== -1) Game.state.completedToday.splice(idx, 1);

    // Remove xp/gold/fame that were applied from the previous resolution
    // We can't easily undo them so we re-resolve fully
    const resolution = Game.resolveMission(missionId, approachIndex);
    UI.showMissionResult(resolution, true);

    document.getElementById('mission-reroll-area').classList.add('d-none');

    if (resolution.levelUpResult) {
      setTimeout(() => {
        UI.showLevelUpModal(resolution.levelUpResult.newLevel, (statChoices) => {
          Game.applyLevelUp(statChoices);
          UI.refresh();
          UI.toast(`Livello ${Game.state.character.level} raggiunto!`);
        });
      }, 1800);
    }

    if (Game.state.gameOver) {
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('modal-mission'))?.hide();
        UI.showGameOverModal();
      }, 2500);
    }
  },

  /* ─── Sfide completate (toast) ───────────────────────── */
  _handleChallenges(completed) {
    if (!completed || !completed.length) return;
    completed.forEach(tmpl => {
      UI.toast(`🏆 Sfida completata: "${tmpl.desc}" — +${tmpl.reward.xp} PE, +${tmpl.reward.gold} mo`, 4000);
    });
    UI.renderChallenges();
  },

  /* ─── Mini-gioco borseggio ───────────────────────────── */
  _startPickpocketGame(speed) {
    const bar    = document.getElementById('pp-bar');
    const cursor = document.getElementById('pp-cursor');
    const hint   = document.getElementById('pp-speed-hint');

    // Hint velocità
    const pct = (speed - 0.3) / 0.7;
    if (pct < 0.33)      hint.textContent = 'Velocità: Lenta 🐢  (poca ricompensa)';
    else if (pct < 0.66) hint.textContent = 'Velocità: Media 🦊';
    else                 hint.textContent = 'Velocità: Veloce ⚡ (ricompensa bonus)';

    let pos = 0;
    let dir = 1;
    let lastTime = null;

    const tick = (ts) => {
      if (!lastTime) lastTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      pos += dir * speed * dt;
      if (pos >= 1) { pos = 1; dir = -1; }
      if (pos <= 0) { pos = 0; dir =  1; }

      const cursorHalfW = cursor.offsetWidth / 2;
      cursor.style.left = `calc(${pos * 100}% - ${cursorHalfW}px)`;
      this._ppAnimFrameId = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(this._ppAnimFrameId);
    if (this._ppClickHandler) bar.removeEventListener('click', this._ppClickHandler);

    this._ppAnimFrameId = requestAnimationFrame(tick);

    this._ppClickHandler = () => {
      bar.removeEventListener('click', this._ppClickHandler);
      this._ppClickHandler = null;
      cancelAnimationFrame(this._ppAnimFrameId);
      this._ppAnimFrameId = null;

      // Controlla overlap: centro cursore vs zona successo
      const zone       = document.getElementById('pp-success-zone');
      const zoneRect   = zone.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();
      const cursorCenter = cursorRect.left + cursorRect.width / 2;
      const hit = cursorCenter >= zoneRect.left && cursorCenter <= zoneRect.right;

      if (hit) {
        const speedMult = 1 + (speed - 0.3) * 0.8;
        const result = Game.applyPickpocketReward(speedMult);
        UI.showPickpocketResult(result);
        UI.refresh();
        this._handleChallenges(result.completedChallenges);
        if (result.levelUpResult) {
          setTimeout(() => {
            UI.showLevelUpModal(result.levelUpResult.newLevel, (choices) => {
              Game.applyLevelUp(choices);
              UI.refresh();
              UI.toast(`Livello ${Game.state.character.level} raggiunto!`);
            });
          }, 1800);
        }
      } else {
        const result = Game.applyPickpocketFailure();
        UI.showPickpocketResult(result);
        UI.refresh();
      }
    };

    bar.addEventListener('click', this._ppClickHandler);
  },

  /* ─── Mini-gioco Taglia ──────────────────────────────── */
  _startWantedGame() {
    const bar    = document.getElementById('wanted-game-bar');
    const player = document.getElementById('wanted-cursor-player');
    const enemy  = document.getElementById('wanted-cursor-enemy');

    const speed1 = 0.25 + Math.random() * 0.35;  // giocatore
    const speed2 = 0.20 + Math.random() * 0.40;  // nemico (diversa)
    const TOUCH  = 0.10;  // 10% della barra = "si toccano"

    let pos1 = 0.02, dir1 = 1;   // giocatore: parte da sinistra
    let pos2 = 0.98, dir2 = -1;  // nemico: parte da destra
    let lastTime = null;

    const tick = (ts) => {
      if (!lastTime) lastTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      pos1 += dir1 * speed1 * dt;
      pos2 += dir2 * speed2 * dt;
      if (pos1 >= 1) { pos1 = 1; dir1 = -1; }
      if (pos1 <= 0) { pos1 = 0; dir1 =  1; }
      if (pos2 >= 1) { pos2 = 1; dir2 = -1; }
      if (pos2 <= 0) { pos2 = 0; dir2 =  1; }

      player.style.left = `calc(${pos1 * 100}% - ${player.offsetWidth / 2}px)`;
      enemy.style.left  = `calc(${pos2 * 100}% - ${enemy.offsetWidth  / 2}px)`;

      const dist = Math.abs(pos1 - pos2);
      bar.classList.toggle('touching', dist < TOUCH);

      this._wantedAnimFrameId = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(this._wantedAnimFrameId);
    if (this._wantedClickHandler) bar.removeEventListener('click', this._wantedClickHandler);
    this._wantedAnimFrameId = requestAnimationFrame(tick);

    this._wantedClickHandler = () => {
      bar.removeEventListener('click', this._wantedClickHandler);
      this._wantedClickHandler = null;
      cancelAnimationFrame(this._wantedAnimFrameId);
      this._wantedAnimFrameId = null;
      bar.classList.remove('touching');

      const hit = Math.abs(pos1 - pos2) < TOUCH;
      this._handleWantedRound(hit);
    };

    bar.addEventListener('click', this._wantedClickHandler);
  },

  _handleWantedRound(won) {
    UI.updateWantedRoundDot(this._wantedRoundsWon, won);

    if (!won) {
      // Sconfitta — oro dimezzato
      const result = Game.applyWantedLoss();
      UI.showWantedResult(result, false);
      UI.refresh();
      return;
    }

    this._wantedRoundsWon++;
    if (this._wantedRoundsWon >= 2) {
      // Vittoria completa!
      const result = Game.applyWantedWin();
      UI.showWantedResult(result, true);
      this._handleChallenges(result.completedChallenges);
      UI.refresh();
    } else {
      // Prova 1 superata — mostra feedback e riparte
      UI.showWantedRoundFeedback(true, () => this._startWantedGame());
    }
  },

  _cancelWantedGame() {
    cancelAnimationFrame(this._wantedAnimFrameId);
    this._wantedAnimFrameId = null;
    const bar = document.getElementById('wanted-game-bar');
    if (bar && this._wantedClickHandler) {
      bar.removeEventListener('click', this._wantedClickHandler);
      this._wantedClickHandler = null;
    }
  },

  _cancelPickpocketGame() {
    cancelAnimationFrame(this._ppAnimFrameId);
    this._ppAnimFrameId = null;
    const bar = document.getElementById('pp-bar');
    if (bar && this._ppClickHandler) {
      bar.removeEventListener('click', this._ppClickHandler);
      this._ppClickHandler = null;
    }
  },

  /* ─── Mercato Nero ────────────────────────────────────── */
  buyItem(itemId) {
    if (!Game.state) return;
    const result = Game.buyItem(itemId);
    if (result.ok) {
      const item = DB.items.find(i => i.id === itemId);
      UI.toast(`Acquistato: ${item ? item.name : 'oggetto'}!`);
      this._handleChallenges(result.completedChallenges);
      UI.refresh();
    } else {
      UI.toast(result.reason || 'Acquisto non riuscito.');
    }
  },

  buyItemFromModal() {
    const itemId      = parseInt(document.getElementById('item-modal-itemid').value);
    const marketPrice = parseInt(document.getElementById('item-modal-marketprice').value);
    bootstrap.Modal.getInstance(document.getElementById('modal-item'))?.hide();
    this.buyItem(itemId);
  },

  /* ─── Oggetti (inventario) ────────────────────────────── */
  equipItemFromModal() {
    const itemId = parseInt(document.getElementById('item-modal-itemid').value);
    bootstrap.Modal.getInstance(document.getElementById('modal-item'))?.hide();
    const result = Game.equipItem(itemId);
    if (result.ok) {
      const item = DB.items.find(i => i.id === itemId);
      UI.toast(`${item ? item.name : 'Oggetto'} equipaggiato!`);
      this._handleChallenges(Game.checkChallenges('passive'));
    } else {
      UI.toast(result.reason || 'Impossibile equipaggiare.');
    }
    UI.refresh();
  },

  unequipItemFromModal() {
    const slot = document.getElementById('item-modal-slot').value;
    bootstrap.Modal.getInstance(document.getElementById('modal-item'))?.hide();
    Game.unequipItem(slot);
    UI.toast('Oggetto rimosso.');
    UI.refresh();
  },

  sellItemFromModal() {
    const itemId  = parseInt(document.getElementById('item-modal-itemid').value);
    const context = document.getElementById('item-modal-context').value;
    const slot    = document.getElementById('item-modal-slot').value || null;
    bootstrap.Modal.getInstance(document.getElementById('modal-item'))?.hide();

    const item     = DB.items.find(i => i.id === itemId);
    const fromSlot = context === 'equipment' ? slot : null;
    const ok = Game.sellItem(itemId, fromSlot);

    if (ok) {
      UI.toast(`Venduto per ${item ? item.sellPrice : '?'} mo.`);
    } else {
      UI.toast('Impossibile vendere.');
    }
    UI.refresh();
  }
};

/* ─── Avvio ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
