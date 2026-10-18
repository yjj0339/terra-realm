(function () {
  const T = window.T;
  const TS = T.TS;

  const LIGHT_COLORS = {
    torch: [255, 176, 96], campfire: [255, 140, 60], lava: [255, 110, 30],
    crystal: [255, 120, 170], mana: [110, 150, 255], glow: [150, 255, 220],
    gem: [180, 200, 255], meteor: [255, 160, 100], player: [255, 240, 210]
  };

  class Game {
    constructor() {
      this.canvas = document.getElementById('game');
      this.renderer = new T.Renderer(this.canvas);
      this.particles = new T.Particles();
      this.audio = T.audio;
      this.player = new T.Player(this);
      this.world = null;
      this.enemies = [];
      this.items = [];
      this.projectiles = [];
      this.minions = [];
      this.npcs = [];
      this.boss = null;
      this.bosses = [];
      this.cam = { x: 0, y: 0 };
      this.timeMinutes = 6 * 60;
      this.dayCount = 1;
      this.dt = 0;
      this.frame = 0;
      this.shakeT = 0;
      this.shakePow = 0;
      this.paused = true;
      this.started = false;
      this.mouse = { x: this.renderer.vw / 2, y: this.renderer.vh / 2, world: { x: 0, y: 0 } };
      this.keys = {};
      this.edge = {};
      this.inventoryOpen = false;
      this.activeEvent = null;
      this.spawnTimer = 0;
      this.gameTime = 0;
      this.nightSpawnRate = 1;
      this.stats = { kills: 0, blocksMined: 0, blocksPlaced: 0, itemsCollected: 0, totalBlocks: 0, bosses: 0 };
      this.mapColors = null;
      this.mapSeen = null;
      this.hint = '';
      this.questStage = 0;
      this.tutorial = 0;
      this.input = {
        left: false, right: false, up: false, down: false, jump: false, jumpPressed: false,
        use: false, interact: false, dash: false, dashPressed: false, hotbar: -1, wheel: 0,
        mouseWorld: { x: 0, y: 0 }, dropPressed: false, quickHealPressed: false, quickManaPressed: false
      };
      this.godmode = false;
      this.mouseDown = false;
      this.rightDown = false;
      this.weather = { rain: 0, snow: 0, lightning: 0, time: 0, targetRain: 0, targetSnow: 0, timer: 22, flash: 0 };
      this.initInput();
      this.initUI();
      this.ui.updateHotbar();
      this.loadSettings();
      const self = this;
      this.touch = new T.TouchControls(this);
      if (T.isTouchDevice()) this.touch.show();
      window.addEventListener('touchstart', function () { self.audio.init(); self.audio.resume(); }, { once: true, passive: true });
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.checkSave();
    }

    initUI() {
      this.ui = new T.UI(this);
      const self = this;
      document.getElementById('btn-new').addEventListener('click', function () { self.startNewWorld(); });
      document.getElementById('btn-continue').addEventListener('click', function () { self.continueGame(); });
      document.getElementById('btn-help').addEventListener('click', function () { self.ui.open('help'); });
      document.getElementById('btn-resume').addEventListener('click', function () { self.setPaused(false); });
      document.getElementById('btn-save').addEventListener('click', function () { self.saveGame(); });
      document.getElementById('btn-help-2').addEventListener('click', function () { self.ui.open('help'); });
      document.getElementById('btn-menu').addEventListener('click', function () { self.backToTitle(); });
      document.getElementById('btn-victory-continue').addEventListener('click', function () {
        document.getElementById('victory-screen').classList.add('hidden');
        self.setPaused(false);
      });
      document.getElementById('seed-random').addEventListener('click', function () {
        document.getElementById('seed-input').value = Math.random().toString(36).slice(2, 10);
      });
      const sfxToggles = [document.getElementById('toggle-sfx'), document.getElementById('toggle-sfx-2')];
      const musToggles = [document.getElementById('toggle-music'), document.getElementById('toggle-music-2')];
      sfxToggles.forEach(function (t) {
        t.addEventListener('click', function () {
          const on = !self.settings.sfx;
          self.settings.sfx = on;
          self.audio.setSfxEnabled(on);
          sfxToggles.forEach(function (x) { x.classList.toggle('on', on); });
          self.saveSettings();
        });
      });
      musToggles.forEach(function (t) {
        t.addEventListener('click', function () {
          const on = !self.settings.music;
          self.settings.music = on;
          self.audio.setMusicEnabled(on);
          musToggles.forEach(function (x) { x.classList.toggle('on', on); });
          self.saveSettings();
        });
      });
    }

    loadSettings() {
      let s = null;
      try { s = JSON.parse(localStorage.getItem('terra.settings') || 'null'); } catch (e) { s = null; }
      this.settings = Object.assign({ sfx: true, music: true }, s || {});
      const sfxToggles = [document.getElementById('toggle-sfx'), document.getElementById('toggle-sfx-2')];
      const musToggles = [document.getElementById('toggle-music'), document.getElementById('toggle-music-2')];
      sfxToggles.forEach(function (t) { t.classList.toggle('on', this.settings.sfx); }.bind(this));
      musToggles.forEach(function (t) { t.classList.toggle('on', this.settings.music); }.bind(this));
    }

    saveSettings() {
      try { localStorage.setItem('terra.settings', JSON.stringify(this.settings)); } catch (e) { }
    }

    checkSave() {
      const raw = this.readSave();
      const btn = document.getElementById('btn-continue');
      if (raw) {
        btn.disabled = false;
        btn.innerHTML = '继续旅程<span class="k">' + T.escapeHTML(raw.name || 'terra') + ' · 第 ' + (raw.dayCount || 1) + ' 天</span>';
      } else {
        btn.disabled = true;
        btn.innerHTML = '继续旅程<span class="k">暂无存档</span>';
      }
    }

    readSave() {
      try {
        const raw = localStorage.getItem('terra.save.v1');
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !data.tiles || !data.player) return null;
        return data;
      } catch (e) {
        return null;
      }
    }

    initInput() {
      const self = this;
      const canvas = this.canvas;
      const keyMap = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down'
      };
      window.addEventListener('keydown', function (e) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const code = e.code;
        if (keyMap[code]) { self.keys[keyMap[code]] = true; e.preventDefault(); }
        if (code === 'Space') { self.keys.jump = true; self.edge.jump = true; e.preventDefault(); }
        if (code === 'ShiftLeft' || code === 'ShiftRight') { self.keys.dash = true; self.edge.dash = true; }
        if (code === 'KeyE') { if (self.canUseUI()) self.ui.toggle('inv'); e.preventDefault(); }
        if (code === 'KeyM') { if (self.canUseUI()) self.ui.toggle('map'); }
        if (code === 'KeyH') { if (self.canUseUI()) self.ui.toggle('help'); }
        if (code === 'KeyQ') { self.edge.quickHeal = true; }
        if (code === 'KeyF') { self.edge.quickMana = true; }
        if (code === 'KeyT') { self.edge.drop = true; }
        if (code === 'Escape') {
          if (self.ui.openPanel && self.ui.openPanel !== 'pause') self.ui.close(self.ui.openPanel);
          else if (self.started) self.setPaused(!self.paused, true);
          e.preventDefault();
        }
        if (code === 'Enter' && !self.started) self.startNewWorld();
        if (code.indexOf('Digit') === 0) {
          const n = Number(code.slice(5));
          if (n >= 0 && n <= 9) self.edge.hotbar = (n + 9) % 10;
        }
        if (code === 'Backquote') self.edge.hotbar = 0;
        if (code === 'F5') { }
        if (code === 'KeyR') {
          if (self.started && self.world && !self.ui.openPanel) {
            self.player.x = (self.world.spawn.x + 0.5) * TS;
            self.player.y = self.world.spawn.y * TS;
            self.player.vx = 0; self.player.vy = 0;
            self.player.iframe = 1;
            self.toast('已回到出生点', '#9ad8ff');
            self.audio.play('magic');
          }
        }
        if (code === 'F1') { self.godmode = !self.godmode; self.toast('无敌模式 ' + (self.godmode ? '开启' : '关闭'), '#ffd870'); }
        if (e.ctrlKey && code === 'KeyS') { e.preventDefault(); self.saveGame(); }
      });
      window.addEventListener('keyup', function (e) {
        const code = e.code;
        if (keyMap[code]) { self.keys[keyMap[code]] = false; e.preventDefault(); }
        if (code === 'Space') self.keys.jump = false;
        if (code === 'ShiftLeft' || code === 'ShiftRight') self.keys.dash = false;
      });
      window.addEventListener('blur', function () {
        self.keys = {};
        self.mouseDown = false;
        self.rightDown = false;
      });
      canvas.addEventListener('mousedown', function (e) {
        self.audio.init();
        self.audio.resume();
        if (e.button === 0) { self.mouseDown = true; }
        if (e.button === 2) { self.rightDown = true; }
        if (self.paused && self.started) return;
      });
      window.addEventListener('mouseup', function (e) {
        if (e.button === 0) self.mouseDown = false;
        if (e.button === 2) { self.rightDown = false; self.edge.releaseHook = true; }
      });
      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      window.addEventListener('mousemove', function (e) {
        self.mouse.x = e.clientX;
        self.mouse.y = e.clientY;
        self.mouseMoved = true;
      });
      canvas.addEventListener('wheel', function (e) {
        self.edge.wheel = (self.edge.wheel || 0) + (e.deltaY > 0 ? 1 : -1);
        e.preventDefault();
      }, { passive: false });
      canvas.addEventListener('mouseleave', function () {
        self.mouseDown = false;
      });
      window.addEventListener('resize', function () {
        if (self.ui.openPanel === 'map') self.ui.drawMap();
      });
      document.querySelectorAll('[data-close]').forEach(function (btn) { });
      const helpClose = document.querySelector('#help-screen .panel-close');
      if (helpClose) helpClose.addEventListener('click', function () { self.ui.close('help'); });
    }

    canPlay() {
      return this.started && !this.paused && !this.player.dead;
    }

    canUseUI() {
      return this.started && !this.paused;
    }

    setPaused(v, showScreen) {
      if (!this.started) return;
      this.paused = v;
      if (v && showScreen !== false) {
        this.ui.closeAll('pause');
        document.getElementById('pause-screen').classList.remove('hidden');
        this.ui.openPanel = 'pause';
        this.updatePauseSub();
      } else {
        document.getElementById('pause-screen').classList.add('hidden');
        if (this.ui.openPanel === 'pause') this.ui.openPanel = null;
        this.ui.closeAll(null);
      }
      this.mouseDown = false;
      this.rightDown = false;
    }

    updatePauseSub() {
      if (!this.world) return;
      const el = document.getElementById('pause-sub');
      el.textContent = '第 ' + this.dayCount + ' 天 · ' + this.world.biomeAt(Math.floor(this.player.x / TS), Math.floor(this.player.y / TS)) + ' · 已击败 Boss ' + this.bossesDefeated();
    }

    bossesDefeated() {
      const b = this.player.stats.bosses;
      return Object.keys(b).filter(function (k) { return b[k] > 0; }).length;
    }

    async startNewWorld() {
      if (this.generating) return;
      this.generating = true;
      this.audio.init();
      this.audio.resume();
      const seedText = (document.getElementById('seed-input').value || Math.random().toString(36).slice(2, 10)).trim();
      let seed = T.hashString(seedText);
      if (/^\d+$/.test(seedText)) seed = (parseInt(seedText, 10) >>> 0) || 1;
      this.seedText = seedText;
      document.getElementById('title-screen').classList.add('hidden');
      document.getElementById('gen-screen').classList.remove('hidden');
      T.initArt();
      const world = new T.World(seed);
      this.world = world;
      world.onProgress = (pct, label) => {
        document.getElementById('gen-fill').style.width = pct + '%';
        document.getElementById('gen-label').textContent = label;
        document.getElementById('gen-pct').textContent = pct + '%';
      };
      await world.generate();
      this.afterWorldReady(true);
    }

    afterWorldReady(isNew) {
      const self = this;
      if (isNew) {
        this.initWorldState();
        this.player = new T.Player(this);
        this.player.resetForNewWorld(this.world.spawn);
        this.spawnNpcs();
        this.timeMinutes = 7 * 60 + 30;
        this.dayCount = 1;
        this.seedText = this.seedText || 'terra';
      } else {
        this.initWorldState();
        this.npcs = [];
        for (const n of (this.pendingNpcs || [])) {
          const npc = new T.NPC(this, n.type, n.x, n.y);
          this.npcs.push(npc);
        }
        this.pendingNpcs = null;
      }
      this.ui.buildHotbar();
      document.getElementById('gen-screen').classList.add('hidden');
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('title-screen').classList.add('hidden');
      this.started = true;
      this.paused = false;
      this.generating = false;
      this.cam.x = this.player.x;
      this.cam.y = this.player.y - 40;
      this.ui.banner('泰拉之境', '世界种子 · ' + this.seedText, 3600);
      this.ui.toast('用镐挖开地面，用斧砍倒树木，一切从这里开始。', '#9ad8ff');
      this.audio.play('levelup');
      this.buildMapBase();
      this.scanMap(true);
    }

    initWorldState() {
      this.enemies = [];
      this.items = [];
      this.projectiles = [];
      this.minions = [];
      this.npcs = [];
      this.boss = null;
      this.bosses = [];
      this.particles.list = [];
      this.activeEvent = null;
      this.spawnTimer = 0;
      this.tut = 0;
    }

    spawnNpcs() {
      if (!this.world.npcSpawns) return;
      for (const s of this.world.npcSpawns) {
        this.spawnNpcAt(s.type, s.x, s.y);
      }
    }

    spawnNpcAt(type, tx, ty) {
      const npc = new T.NPC(this, type, (tx + 0.5) * TS, ty * TS);
      this.npcs.push(npc);
      return npc;
    }

    spawnNpc(type) {
      if (this.npcs.some(function (n) { return n.type === type; })) return;
      const p = this.player;
      const tx = Math.floor(p.x / TS) + (Math.random() < 0.5 ? -14 : 14);
      const world = this.world;
      let ty = world.firstSolidBelow(tx, p.y / TS - 20);
      const npc = new T.NPC(this, type, (tx + 0.5) * TS, ty * TS);
      this.npcs.push(npc);
      this.ui.toast(T.NPC_DEFS[type].name + ' 搬进了你的世界', '#ffd870');
      this.audio.play('levelup');
      this.particles.burst(npc.x, npc.y - 20, 24, { color: ['#ffe0a0', '#ffffff'], speed: 100, life: 0.8, gravity: -40, glow: true });
    }

    buildMapBase() {
      const world = this.world;
      const mw = Math.floor(world.W / 4), mh = Math.floor(world.H / 4);
      this.mapColors = new Float32Array(mw * mh * 3);
      this.mapSeen = new Uint8Array(mw * mh);
      this.mapW = mw;
      this.mapH = mh;
      for (let y = 0; y < mh; y++) {
        for (let x = 0; x < mw; x++) {
          const tx = x * 4 + 2, ty = y * 4 + 2;
          const t = world.getTile(tx, ty);
          const d = T.tileDef(t);
          let c;
          if (t === T.TILE.AIR) {
            c = ty < world.surface[tx] ? [88, 140, 190] : [22, 26, 36];
          } else {
            c = T.rgb(d.col);
            if (d.liquid) c = T.rgb(d.col);
          }
          const idx = (y * mw + x) * 3;
          this.mapColors[idx] = c[0];
          this.mapColors[idx + 1] = c[1];
          this.mapColors[idx + 2] = c[2];
        }
      }
    }

    scanMap(force) {
      if (!this.mapSeen) return;
      const p = this.player;
      const cx = Math.floor(p.x / TS / 4);
      const cy = Math.floor(p.y / TS / 4);
      const r = force ? 90 : 26;
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x < 0 || y < 0 || x >= this.mapW || y >= this.mapH) continue;
          const dx = x - cx, dy = y - cy;
          if (force) {
            if (dx * dx + dy * dy > r * r) continue;
          } else if (dx * dx + dy * dy > r * r) continue;
          const i = y * this.mapW + x;
          if (this.mapSeen[i]) continue;
          this.mapSeen[i] = 1;
          const tx = x * 4 + 2, ty = y * 4 + 2;
          const t = this.world.getTile(tx, ty);
          const d = T.tileDef(t);
          let c;
          if (t === T.TILE.AIR) c = ty < this.world.surface[tx] ? [96, 148, 196] : [26, 30, 40];
          else c = T.rgb(d.col);
          const idx = i * 3;
          this.mapColors[idx] = c[0];
          this.mapColors[idx + 1] = c[1];
          this.mapColors[idx + 2] = c[2];
        }
      }
      if (force && this.ui.openPanel === 'map') this.ui.drawMap();
    }

    continueGame() {
      const data = this.readSave();
      if (!data) return;
      this.audio.init();
      this.audio.resume();
      T.initArt();
      document.getElementById('title-screen').classList.add('hidden');
      document.getElementById('gen-screen').classList.remove('hidden');
      document.getElementById('gen-label').textContent = '正在唤醒存档…';
      document.getElementById('gen-fill').style.width = '40%';
      const world = new T.World(data.seed);
      this.world = world;
      const L = world.W * world.H;
      const arr = function (runs, Type) { return runs ? T.decodeRLE(runs, L, Type) : null; };
      world.tiles = arr(data.tiles, Uint8Array);
      world.walls = arr(data.walls, Uint8Array);
      world.water = arr(data.water, Uint8Array);
      world.lava = arr(data.lava, Uint8Array);
      world.sky = arr(data.sky, Uint8Array);
      const surf = arr(data.surface, Int16Array);
      if (surf) world.surface = surf;
      world.chests = data.chests || [];
      world.chestMap = new Map();
      for (const c of world.chests) world.chestMap.set(c.y * world.W + c.x, c);
      world.spawn = data.spawn;
      world.zones = data.zones;
      world.islands = data.islands;
      world.altars = data.altars;
      world.npcSpawns = data.npcSpawns;
      world.dungeonX = data.dungeonX;
      this.seedText = data.name || 'terra';
      this.timeMinutes = data.timeMinutes;
      this.dayCount = data.dayCount;
      this.player = new T.Player(this);
      Object.assign(this.player, data.player);
      this.player.game = this;
      this.player.inv = data.player.inv.map(function (s) { return s ? { id: s.id, count: s.count } : null; });
      this.player.accessories = data.player.accessories.slice();
      this.player.armor = JSON.parse(JSON.stringify(data.player.armor));
      this.player.buffs = [];
      this.player.dead = false;
      this.stats = Object.assign(this.stats, data.stats || {});
      this.pendingNpcs = data.npcs || [];
      for (const n of this.pendingNpcs) {
        if (!T.NPC_DEFS[n.type]) n.type = 'guide';
      }
      document.getElementById('gen-fill').style.width = '100%';
      this.afterWorldReady(false);
      this.ui.toast('欢迎回来 · 第 ' + this.dayCount + ' 天', '#9ad8ff');
    }

    saveGame() {
      if (!this.started || !this.world) return;
      const w = this.world;
      const p = this.player;
      const data = {
        version: 2, seed: w.seed, name: this.seedText,
        tiles: T.encodeRLE(w.tiles), walls: T.encodeRLE(w.walls),
        water: T.encodeRLE(w.water), lava: T.encodeRLE(w.lava), sky: T.encodeRLE(w.sky),
        surface: T.encodeRLE(w.surface), chests: w.chests,
        spawn: w.spawn, zones: w.zones, islands: w.islands, altars: w.altars,
        npcSpawns: w.npcSpawns, dungeonX: w.dungeonX,
        timeMinutes: this.timeMinutes, dayCount: this.dayCount,
        stats: this.stats,
        npcs: this.npcs.map(function (n) { return { type: n.type, x: Math.round(n.x), y: Math.round(n.y) }; }),
        player: {
          x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, mana: p.mana, maxMana: p.maxMana,
          coins: p.coins, held: p.held, inv: p.inv, armor: p.armor, accessories: p.accessories,
          stats: p.stats, breath: p.breath, breathMax: p.breathMax
        }
      };
      try {
        const json = JSON.stringify(data);
        localStorage.setItem('terra.save.v1', json);
        this.ui.toast('世界已保存 · ' + (json.length / 1024 / 1024).toFixed(2) + ' MB', '#7ef08a');
        this.checkSave();
      } catch (e) {
        this.ui.toast('保存失败：浏览器存储空间不足', '#ffb07a');
      }
    }

    backToTitle() {
      this.saveGame();
      this.started = false;
      this.paused = true;
      document.getElementById('pause-screen').classList.add('hidden');
      document.getElementById('hud').classList.add('hidden');
      document.getElementById('title-screen').classList.remove('hidden');
      this.ui.closeAll(null);
      this.ui.openPanel = null;
      this.checkSave();
    }

    // ---------- systems ----------

    isNight() {
      const h = this.timeMinutes / 60;
      return h >= 19.5 || h < 4.5;
    }

    timeOfDayFactor() {
      const h = this.timeMinutes / 60;
      const day = Math.sin((h / 24) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
      return day;
    }

    collectLights(cam) {
      const lights = [];
      const world = this.world;
      const halfW = this.renderer.vw / this.renderer.zoom / 2 + 140;
      const halfH = this.renderer.vh / this.renderer.zoom / 2 + 140;
      const x0 = Math.max(0, Math.floor((cam.x - halfW) / TS));
      const x1 = Math.min(world.W - 1, Math.ceil((cam.x + halfW) / TS));
      const y0 = Math.max(0, Math.floor((cam.y - halfH) / TS));
      const y1 = Math.min(world.H - 1, Math.ceil((cam.y + halfH) / TS));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const t = world.tiles[y * world.W + x];
          if (!t) {
            const lv = world.lava[y * world.W + x];
            if (lv > 0) {
              lights.push({ x: (x + 0.5) * TS, y: (y + 0.8) * TS, r: 60 + lv * 9, color: LIGHT_COLORS.lava, intensity: 0.72, glow: 0.07 });
            }
            continue;
          }
          const d = T.TILES[t];
          if (!d || !d.light) continue;
          const l = d.light;
          lights.push({
            x: (x + 0.5) * TS, y: (y + 0.5) * TS, r: l[3] * TS,
            color: [l[0], l[1], l[2]], intensity: 1, glow: 0.10
          });
        }
      }
      const p = this.player;
      if (!p.dead) {
        lights.push({ x: p.x, y: p.y - p.h * 0.5, r: 210, color: LIGHT_COLORS.player, intensity: 0.94, glow: 0.03 });
      }
      for (const pr of this.projectiles) {
        if (pr.glow && pr.life > 0) {
          lights.push({ x: pr.x, y: pr.y, r: 70, color: T.rgb(pr.glow), intensity: 0.7, glow: 0.12 });
        }
      }
      if (this.boss && !this.boss.dead) {
        const b = this.boss;
        lights.push({ x: b.x, y: b.y, r: 190, color: b.kind === 'wof' ? [255, 100, 50] : [255, 120, 140], intensity: 0.35, glow: 0.05 });
      }
      for (const m of this.minions) {
        lights.push({ x: m.x, y: m.y, r: 44, color: [120, 200, 255], intensity: 0.5, glow: 0.06 });
      }
      return lights;
    }

    spawnEnemyAt(kind, x, y) {
      if (this.enemies.length > 90) return null;
      const e = new T.Enemy(this, kind, x, y);
      this.enemies.push(e);
      return e;
    }

    trySpawnEnemies() {
      const p = this.player;
      const world = this.world;
      const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
      const biome = world.biomeAt(tx, ty);
      const depth = world.depthAt(ty);
      const night = this.isNight();
      const rate = night ? 6.5 : 2.4;
      const maxEnemies = night ? 16 : 10;
      if (this.enemies.length >= maxEnemies) return;
      if (Math.random() > this.dt * rate * (this.activeEvent ? 1.7 : 1)) return;
      const side = Math.random() < 0.5 ? -1 : 1;
      const dist = 460 + Math.random() * 180;
      const sx = p.x + side * dist;
      if (sx < 40 || sx > world.W * TS - 40) return;
      let sy;
      const surface = world.surfaceHeightAt(Math.floor(sx / TS));
      if (depth < 6 && !this.isCaveBiome(biome)) {
        sy = (surface - 2) * TS;
      } else {
        sy = p.y - 120 - Math.random() * 220;
      }
      const ttx = Math.floor(sx / TS), tty = Math.floor(sy / TS);
      if (T.isSolid(world.getTile(ttx, tty))) return;
      let kind = null;
      const cave = depth > 8;
      const pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
      if (biome === '雪原') {
        kind = pick(['ice_slime', 'snow_flinx', 'zombie_elf', 'ice_slime']);
      } else if (biome === '沙漠') {
        kind = pick(['antlion', 'vulture', 'scarab', 'antlion']);
      } else if (biome === '丛林') {
        kind = pick(['hornet', 'hornet_giant', 'jungle_creeper', 'piranha']);
      } else if (biome === '腐化之地') {
        kind = pick(['eater', 'slime_purple', 'eater', 'cursed_skull']);
      } else if (biome === '海洋' || biome === '海滩') {
        kind = pick(['piranha', 'shark', 'shark_giant', 'piranha']);
      } else if (biome === '地牢') {
        kind = pick(['skeleton', 'cave_bat', 'cursed_skull', 'skeleton']);
      } else if (biome === '地狱' || depth > 70) {
        kind = pick(['fire_imp', 'lava_slime', 'fire_imp']);
      } else if (biome === '空岛') {
        kind = pick(['harpy', 'vulture', 'harpy']);
      } else if (biome === '洞穴' || biome === '地下' || cave) {
        kind = pick(['cave_bat', 'giant_worm', 'slime_blue', 'skeleton', 'granite_golem', 'harpy', 'wraith']);
      } else {
        if (night) kind = Math.random() < 0.55 ? 'zombie' : 'demon_eye';
        else kind = pick(['slime_green', 'slime_blue', 'slime_green', 'scarab']);
      }
      if (this.activeEvent && this.activeEvent.type === 'bloodmoon' && night && depth < 6) {
        kind = pick(['zombie', 'demon_eye', 'blood_crawler', 'blood_crawler']);
      }
      if (this.activeEvent && this.activeEvent.type === 'slime_rain') {
        kind = pick(['slime_green', 'slime_blue', 'slime_purple', 'mother_slime']);
      }
      if (!kind) return;
      const enemy = this.spawnEnemyAt(kind, sx - 14, sy);
      if (enemy && night && Math.random() < 0.22) {
        enemy.maxHp = Math.round(enemy.maxHp * 1.4);
        enemy.hp = enemy.maxHp;
        enemy.dmg = Math.round(enemy.dmg * 1.2);
        enemy.scale = 1.08;
      }
    }

    isCaveBiome(biome) {
      return biome === '洞穴' || biome === '地下' || biome === '深渊' || biome === '地狱';
    }

    spawnBoss(kind) {
      if (this.boss && !this.boss.dead) {
        this.ui.toast('已有 Boss 正在肆虐', '#ffb07a');
        return;
      }
      const b = new T.Boss(this, kind);
      b.def = b.def || {};
      this.boss = b;
      this.bosses.push(b);
      const p = this.player;
      if (kind === 'eye') {
        b.x = p.x;
        b.y = p.y - 210;
      } else if (kind === 'eater') {
        b.x = p.x + 200;
        b.y = p.y - 120;
      } else if (kind === 'skeletron') {
        b.x = p.x;
        b.y = p.y - 230;
      } else if (kind === 'wof') {
        b.x = p.x + 900;
        b.y = p.y - 60;
      } else if (kind === 'king_slime') {
        b.x = p.x + 260;
        b.y = p.y - 240;
        b.vy = 0;
      } else if (kind === 'queen_bee') {
        b.x = p.x + 180;
        b.y = p.y - 130;
      }
      this.audio.play('boss');
      this.shake(10, 0.5);
      this.ui.banner(b.name, 'A great evil awakens', 3600);
      this.ui.toast('Boss 出现：' + b.name, '#ffb07a');
      this.particles.burst(b.x, b.y, 40, { color: ['#ffd0d0', '#ff6060', '#ffffff'], speed: 200, life: 1, gravity: -30, glow: true });
      this.player.stats.bosses[kind] = (this.player.stats.bosses[kind] || 0) + 1;
    }

    bossActivate(kind) {
      this.spawnBoss(kind);
    }

    activateItem(def) {
      const p = this.player;
      const world = this.world;
      if (def.boss === 'eye') {
        if (!this.isNight()) { this.ui.toast('克苏鲁之眼只会在夜晚回应召唤', '#ffb07a'); return; }
        p.take(def.id, 1);
        this.spawnBoss('eye');
      } else if (def.boss === 'eater') {
        const biome = world.biomeAt(Math.floor(p.x / TS), Math.floor(p.y / TS));
        if (biome !== '腐化之地') { this.ui.toast('需要在腐化之地使用', '#ffb07a'); return; }
        p.take(def.id, 1);
        this.spawnBoss('eater');
      } else if (def.boss === 'skeletron') {
        const biome = world.biomeAt(Math.floor(p.x / TS), Math.floor(p.y / TS));
        if (biome !== '地牢') { this.ui.toast('需要在地牢使用', '#ffb07a'); return; }
        p.take(def.id, 1);
        this.spawnBoss('skeletron');
      } else if (def.boss === 'king_slime') {
        const depth = world.depthAt(Math.floor(p.y / TS));
        if (depth > 6) { this.ui.toast('需要在地表使用', '#ffb07a'); return; }
        p.take(def.id, 1);
        this.spawnBoss('king_slime');
      } else if (def.boss === 'queen_bee') {
        const biome = world.biomeAt(Math.floor(p.x / TS), Math.floor(p.y / TS));
        if (biome !== '丛林') { this.ui.toast('需要在丛林使用', '#ffb07a'); return; }
        p.take(def.id, 1);
        this.spawnBoss('queen_bee');
      }
      this.audio.play('summon');
    }

    onBossDefeated(boss) {
      const p = this.player;
      p.stats.bosses[boss.kind] = (p.stats.bosses[boss.kind] || 0) + 1;
      this.stats.bosses = this.bossesDefeated();
      const rewards = {
        eye: ['eye_trophy', 'demonite_ore', 'life_crystal'],
        eater: ['eater_trophy', 'shadow_scale', 'demonite_ore', 'eater_scale'],
        skeletron: ['skeletron_trophy', 'bone', 'gold_bar'],
        wof: ['wof_trophy', 'hellstone_bar', 'lava_bucket'],
        king_slime: ['king_slime_trophy', 'gel', 'gold_bar', 'cloud_in_a_bottle'],
        queen_bee: ['queen_bee_trophy', 'bee_wax', 'hornet_staff', 'honey_potion']
      };
      const r = rewards[boss.kind] || [];
      for (const id of r) {
        const n = id === 'demonite_ore' ? 25 : id === 'shadow_scale' ? 18 : id === 'bone' ? 20 : id === 'gel' ? 40 : 1;
        this.dropItem(boss.x + (Math.random() - 0.5) * 60, boss.y, id, n);
      }
      if (boss.kind === 'eye') {
        this.dropItem(boss.x, boss.y, 'demonite_ore', 30);
        this.ui.toast('克苏鲁之眼被击败了。腐化的深处有什么在回应。', '#ffd870');
      } else if (boss.kind === 'eater') {
        this.ui.toast('世界吞噬者被击败了。地牢的封印开始松动。', '#ffd870');
        this.spawnNpc('merchant');
      } else if (boss.kind === 'skeletron') {
        this.ui.toast('骷髅王陨落。地牢向你敞开。', '#ffd870');
        this.spawnNpc('nurse');
        this.spawnNpc('armsdealer');
      } else if (boss.kind === 'king_slime') {
        this.ui.toast('史莱姆王被击败了。凝胶散落一地。', '#ffd870');
        this.spawnNpc('demolitionist');
      } else if (boss.kind === 'queen_bee') {
        this.ui.toast('蜂后陨落。丛林的蜂巢安静了下来。', '#ffd870');
        this.spawnNpc('dryad');
      } else if (boss.kind === 'wof') {
        this.ui.toast('血肉之墙倒塌了。世界进入困难模式。', '#ffb04a');
        this.world.flags.hardmode = true;
        this.ui.banner('血肉之墙已倒下', 'The world has been released', 4200);
        setTimeout(() => this.showVictory(), 1400);
      }
      this.boss = null;
      this.audio.play('levelup');
    }

    showVictory() {
      const p = this.player;
      const el = document.getElementById('victory-stats');
      el.innerHTML = [
        ['击败敌人', p.stats.kills],
        ['挖掘方块', p.stats.blocksMined],
        ['放置方块', p.stats.blocksPlaced],
        ['死亡次数', p.stats.deaths],
        ['最大深度', Math.round(p.stats.maxDepth) + ' 米'],
        ['游戏时长', T.timeString(Math.floor(p.stats.playTime / 60))],
        ['金币', T.coinString(p.coins)],
        ['世界种子', this.seedText]
      ].map(function (r) { return '<span>' + r[0] + '<b>' + r[1] + '</b></span>'; }).join('');
      const death = document.getElementById('death-screen');
      if (death) death.remove();
      this.player.dead = false;
      this.player.hp = Math.max(this.player.hp, Math.round(this.player.maxHp * 0.6));
      this.player.deathT = 0;
      document.getElementById('victory-screen').classList.remove('hidden');
      this.paused = true;
      this.mouseDown = false;
      this.rightDown = false;
      this.audio.play('levelup');
    }

    onEnemyKilled(enemy) {
      if (enemy.boss) return;
      this.checkQuest('kill');
    }

    onPlayerDeath() {
      this.showDeathScreen();
      this.mouseDown = false;
      this.rightDown = false;
    }

    showDeathScreen() {
      if (document.getElementById('death-screen')) return;
      const el = document.createElement('div');
      el.className = 'death-screen';
      el.id = 'death-screen';
      el.innerHTML = '<div class="death-card"><div class="t">你死了</div><div class="s" id="death-line">正在重生…</div></div>';
      document.body.appendChild(el);
      let t = 3.2;
      const line = el.querySelector('#death-line');
      const iv = setInterval(() => {
        t -= 0.1;
        if (line) line.textContent = Math.ceil(Math.max(0, t)) + ' 秒后重生';
        if (t <= 0) {
          clearInterval(iv);
          el.remove();
        }
      }, 100);
      setTimeout(() => { if (el.parentElement) el.remove(); }, 3600);
    }

    dropItem(x, y, id, count) {
      if (!id || count <= 0) return;
      if (this.items.length > 260) this.items.shift();
      const def = T.itemDef(id);
      if (!def) return;
      if (id === 'coin_copper' || id === 'coin_silver' || id === 'coin_gold') {
        let copper = count;
        if (id === 'coin_silver') copper = count * 100;
        if (id === 'coin_gold') copper = count * 10000;
        while (copper > 0 && this.items.length < 320) {
          let cid = 'coin_copper', v = 1;
          if (copper >= 10000 && Math.random() < 0.6) { cid = 'coin_gold'; v = 1; }
          else if (copper >= 100) { cid = 'coin_silver'; v = 1; }
          copper -= cid === 'coin_gold' ? 10000 : cid === 'coin_silver' ? 100 : 1;
          this.items.push(new T.DropItem(this, cid, x + (Math.random() - 0.5) * 10, y, 1));
        }
        return;
      }
      const stack = def.stack || 1;
      while (count > 0) {
        const n = Math.min(stack, count);
        count -= n;
        this.items.push(new T.DropItem(this, id, x + (Math.random() - 0.5) * 12, y, n));
      }
    }

    spawnProjectile(kind, x, y, vx, vy, dmg, opts) {
      if (this.projectiles.length > 220) this.projectiles.shift();
      const p = new T.Projectile(this, kind, x, y, vx, vy, dmg, opts);
      this.projectiles.push(p);
      return p;
    }

    summonMinion(kind) {
      if (this.minions.length >= 3) this.minions.shift();
      this.minions.push(new T.Minion(this, kind));
    }

    hitEnemiesInRect(rect, dmg, opts) {
      let hit = false;
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (T.rectsOverlap(rect, e.rect())) {
          e.hurt(dmg, opts);
          hit = true;
          if (opts.onHit) opts.onHit(e);
        }
      }
      if (this.boss && !this.boss.dead && this.boss.kind !== 'eater') {
        if (T.rectsOverlap(rect, this.boss.rect())) {
          this.boss.hurt(dmg, opts);
          hit = true;
        }
      }
      if (this.boss && !this.boss.dead && this.boss.kind === 'eater') {
        for (const seg of this.boss.segments) {
          if (seg.dead) continue;
          const r = { x: seg.x - seg.size / 2, y: seg.y - seg.size / 2, w: seg.size, h: seg.size };
          if (T.rectsOverlap(rect, r)) {
            this.boss.onPartHit(seg, dmg);
            hit = true;
          }
        }
      }
      if (this.boss && !this.boss.dead && this.boss.kind === 'skeletron') {
        for (const hand of this.boss.hands) {
          if (hand.dead) continue;
          const r = { x: hand.x - 34, y: hand.y - 34, w: 68, h: 68 };
          if (T.rectsOverlap(rect, r)) {
            this.boss.onPartHit(hand, dmg);
            hit = true;
          }
        }
      }
      if (hit) this.shake(3, 0.08);
      return hit;
    }

    npcAt(wx, wy) {
      for (const n of this.npcs) {
        const r = n.rect();
        if (wx > r.x - 8 && wx < r.x + r.w + 8 && wy > r.y - 8 && wy < r.y + r.h + 8) return n;
      }
      return null;
    }

    toggleDoor(tx, ty) {
      const world = this.world;
      const t = world.getTile(tx, ty);
      if (t === T.TILE.DOOR) {
        world.setTile(tx, ty, T.TILE.DOOR_OPEN);
      } else if (t === T.TILE.DOOR_OPEN) {
        world.setTile(tx, ty, T.TILE.DOOR);
      }
      this.audio.play('door');
    }

    nearbyStations() {
      const p = this.player;
      const world = this.world;
      const cx = Math.floor(p.x / TS), cy = Math.floor(p.y / TS);
      const stations = {};
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -9; dx <= 9; dx++) {
          const t = world.getTile(cx + dx, cy + dy);
          if (!t) continue;
          const d = T.tileDef(t);
          if (d.station) stations[d.station] = true;
          if (t === T.TILE.TABLE) stations.workbench = true;
        }
      }
      return stations;
    }

    craft(index) {
      const rec = T.RECIPES[index];
      if (!rec) return;
      const p = this.player;
      const has = {};
      for (const s of p.inv) if (s) has[s.id] = (has[s.id] || 0) + s.count;
      const stations = this.nearbyStations();
      if (!T.canCraft(rec, has, stations)) {
        this.ui.toast('材料或制作站不足', '#ffb07a');
        return;
      }
      for (const id in rec.ing) p.take(id, rec.ing[id]);
      const left = p.give(rec.out, rec.count);
      if (left > 0) this.dropItem(p.x, p.y - 20, rec.out, left);
      p.stats.crafted++;
      this.audio.play('craft');
      this.ui.refreshInventory();
      this.particles.burst(p.x, p.y - p.h * 0.6, 10, { color: ['#ffe0a0', '#ffffff'], speed: 60, life: 0.5, gravity: -30, glow: true });
      const def = T.itemDef(rec.out);
      this.ui.toast('制作了 ' + def.name + (rec.count > 1 ? ' ×' + rec.count : ''), '#ffd870');
      this.checkQuest('craft');
    }

    useInventoryItem(index) {
      const p = this.player;
      const s = p.inv[index];
      if (!s) return;
      const def = T.itemDef(s.id);
      if (!def) return;
      if (def.slot || def.type === 'accessory') {
        if (p.equip(s.id)) {
          this.audio.play('craft');
          this.ui.toast('装备了 ' + def.name, '#9ad8ff');
        } else {
          this.ui.toast('没有空的饰品槽', '#ffb07a');
        }
        this.ui.refreshInventory();
        return;
      }
      if (def.type === 'consumable') {
        p.held = index < T.HOTBAR ? index : p.held;
        p.useCd = 0;
        p.consume(def, s);
        this.ui.refreshInventory();
        return;
      }
      if (def.type === 'summon') {
        this.activateItem(def);
        return;
      }
      if (index < T.HOTBAR) {
        p.held = index;
        this.ui.updateHotbar();
      } else {
        const free = this.findFreeHotbar();
        if (free >= 0) {
          p.inv[free] = s;
          p.inv[index] = null;
          p.held = free;
          this.ui.updateHotbar();
          this.ui.refreshInventory();
          this.audio.play('menu');
        } else {
          this.ui.toast('快捷栏已满', '#ffb07a');
        }
      }
    }

    findFreeHotbar() {
      const p = this.player;
      for (let i = 0; i < T.HOTBAR; i++) if (!p.inv[i]) return i;
      return -1;
    }

    dropFromSlot(index) {
      const p = this.player;
      const s = p.inv[index];
      if (!s) return;
      const def = T.itemDef(s.id);
      if (def && def.type === 'trophy') return;
      this.dropItem(p.x, p.y - p.h * 0.5, s.id, s.count);
      p.inv[index] = null;
      this.ui.refreshInventory();
      this.audio.play('menu');
      this.ui.toast('丢弃了 ' + def.name, '#ffb07a');
    }

    openChest() { }

    onPanelChange(name) {
      this.inventoryOpen = !!name;
      if (name) {
        this.mouseDown = false;
        this.rightDown = false;
      }
    }

    defaultHint() {
      const p = this.player;
      const world = this.world;
      if (!world) return '';
      const biome = world.biomeAt(Math.floor(p.x / TS), Math.floor(p.y / TS));
      if (this.boss) return 'Boss 战 · 保持移动，躲避攻击';
      if (p.hp < p.maxHp * 0.3) return '生命垂危 · 按 Q 喝下治疗药水';
      if (this.questStage === 0) return '砍树获取木材，按 E 打开制作';
      if (this.questStage === 1) return '制作工作台，再打造铜镐';
      if (this.questStage === 2) return '向下挖掘，寻找矿石与生命水晶';
      return biome + ' · ' + (this.isNight() ? '夜晚' : '白天') + ' · 按 M 查看地图';
    }

    checkQuest(action) {
      const p = this.player;
      if (this.questStage === 0 && (action === 'mine' || action === 'craft')) this.questStage = 1;
      else if (this.questStage === 1 && p.countOf('workbench') > 0 && p.countOf('copper_pickaxe') > 0) this.questStage = 2;
      else if (this.questStage === 2 && p.stats.maxDepth > 12) this.questStage = 3;
    }

    shake(power, time) {
      this.shakePow = Math.max(this.shakePow, power);
      this.shakeT = Math.max(this.shakeT, time);
    }

    toast(text, color) { this.ui.toast(text, color); }
    emit() { }

    // ---------- loop ----------

    gatherInput() {
      const input = this.input;
      input.left = !!this.keys.left;
      input.right = !!this.keys.right;
      input.up = !!this.keys.up;
      input.down = !!this.keys.down;
      if (this.touchBuffer && this.touchBuffer.jump > 0) {
        this.keys.jump = true;
        this.edge.jump = this.edge.jump || this.touchBuffer.jumpFresh;
        this.touchBuffer.jumpFresh = false;
      }
      if (this.touchBuffer && this.touchBuffer.use > 0) this.mouseDown = true;
      if (this.touchBuffer && this.touchBuffer.place > 0) this.rightDown = true;
      input.jump = !!this.keys.jump;
      input.jumpPressed = !!this.edge.jump;
      input.dash = !!this.keys.dash;
      input.dashPressed = !!this.edge.dash;
      input.hotbar = this.edge.hotbar !== undefined ? this.edge.hotbar : -1;
      input.wheel = this.edge.wheel || 0;
      input.dropPressed = !!this.edge.drop;
      input.quickHealPressed = !!this.edge.quickHeal;
      input.quickManaPressed = !!this.edge.quickMana;
      const uiBlocked = this.paused || this.inventoryOpen || this.ui.openPanel;
      input.use = this.mouseDown && !uiBlocked;
      input.interact = this.rightDown && !uiBlocked;
      input.releaseHook = this.edge.releaseHook || false;
      const w = this.renderer.screenToWorld(this.cam, this.mouse.x, this.mouse.y);
      input.mouseWorld.x = w.x;
      input.mouseWorld.y = w.y;
      this.edge = {};
    }

    updateCamera(dt) {
      const p = this.player;
      const r = this.renderer;
      let tx = p.x, ty = p.y - p.h * 0.55;
      const lookX = (this.mouse.x - r.vw / 2) / r.zoom * 0.18;
      const lookY = (this.mouse.y - r.vh / 2) / r.zoom * 0.12;
      tx += T.clamp(lookX, -110, 110);
      ty += T.clamp(lookY, -80, 80);
      this.cam.x = T.lerp(this.cam.x, tx, 1 - Math.pow(0.0018, dt));
      this.cam.y = T.lerp(this.cam.y, ty, 1 - Math.pow(0.0018, dt));
      const halfW = r.vw / 2 / r.zoom, halfH = r.vh / 2 / r.zoom;
      this.cam.x = T.clamp(this.cam.x, halfW, this.world.W * TS - halfW);
      this.cam.y = T.clamp(this.cam.y, halfH, this.world.H * TS - halfH);
    }

    updateTime(dt) {
      const prevHour = this.timeMinutes / 60;
      this.timeMinutes += dt * (this.timeSpeed || 1.6);
      if (this.timeMinutes >= 1440) {
        this.timeMinutes -= 1440;
        this.dayCount++;
        this.onNewDay();
      }
      const hour = this.timeMinutes / 60;
      if (prevHour < 19.5 && hour >= 19.5) this.onNightStart();
      if (prevHour < 4.5 && hour >= 4.5) this.onDawn();
      if (this.activeEvent) {
        this.activeEvent.remaining -= dt;
        if (this.activeEvent.remaining <= 0) this.endEvent();
      }
    }

    onNewDay() {
      if (Math.random() < 0.16 && this.dayCount > 2) {
        this.startEvent('slime_rain');
      } else if (Math.random() < 0.08 && this.dayCount > 3) {
        this.startEvent('goblin');
      }
      if (this.dayCount % 7 === 0) {
        this.world.rebuildSkyLight();
      }
    }

    onNightStart() {
      if (Math.random() < 0.22 && this.dayCount > 1) {
        this.startEvent('bloodmoon');
      } else if (Math.random() < 0.1) {
        this.startEvent('starfall');
      }
      this.ui.toast('夜幕降临，危险正在靠近。', '#9ab8ff');
    }

    onDawn() {
      this.ui.toast('天亮了。', '#ffd870');
      this.audio.play('levelup');
      if (this.activeEvent && this.activeEvent.type === 'bloodmoon') this.endEvent();
    }

    startEvent(type) {
      const defs = {
        bloodmoon: { name: '血月', dur: 480, text: '血月升起，怪物变得狂暴' },
        slime_rain: { name: '史莱姆雨', dur: 420, text: '史莱姆从天而降' },
        starfall: { name: '流星雨', dur: 300, text: '星辰坠落，收集它们' },
        goblin: { name: '哥布林入侵', dur: 600, text: '哥布林大军正在逼近' }
      };
      const d = defs[type];
      if (!d) return;
      this.activeEvent = { type: type, name: d.name, remaining: d.dur, max: d.dur };
      this.ui.banner(d.name, d.text, 3800);
      this.audio.play('boss');
      if (type === 'slime_rain') {
        for (let i = 0; i < 14; i++) {
          setTimeout(() => {
            if (!this.started) return;
            const p = this.player;
            this.spawnEnemyAt(Math.random() < 0.5 ? 'slime_green' : 'slime_blue', p.x + (Math.random() - 0.5) * 700, p.y - 400);
          }, i * 260);
        }
      }
      if (type === 'starfall') {
        this.starTimer = 0;
      }
    }

    endEvent() {
      if (!this.activeEvent) return;
      this.ui.toast(this.activeEvent.name + ' 结束了', '#9ad8ff');
      this.activeEvent = null;
    }

    updateEvents(dt) {
      if (!this.activeEvent) return;
      if (this.activeEvent.type === 'starfall') {
        this.starTimer = (this.starTimer || 0) + dt;
        if (this.starTimer > 0.9) {
          this.starTimer = 0;
          const p = this.player;
          const sx = p.x + (Math.random() - 0.5) * 900;
          const world = this.world;
          const sy = world.surfaceHeightAt(Math.floor(sx / TS)) - 30;
          const proj = this.spawnProjectile('starp', sx, (sy - 400) * 1, 30, 260, 1, { owner: 'star', life: 12, size: 8, color: '#ffe680', glow: '#ffe680' });
          proj.starDrop = true;
          proj.onLandStar = true;
        }
      }
      if (this.activeEvent.type === 'slime_rain') {
        this.slimeRainT = (this.slimeRainT || 0) + dt;
        if (this.slimeRainT > 1.4) {
          this.slimeRainT = 0;
          const p = this.player;
          this.spawnEnemyAt(Math.random() < 0.6 ? 'slime_green' : 'slime_blue', p.x + (Math.random() - 0.5) * 800, p.y - 480);
        }
      }
    }

    updateWeather(dt) {
      const w = this.weather;
      if (!w) return;
      w.time += dt;
      w.timer -= dt;
      if (w.timer <= 0) {
        w.timer = 45 + Math.random() * 90;
        const biome = this.world.biomeAt(Math.floor(this.player.x / TS), Math.floor(this.player.y / TS));
        const r = Math.random();
        if (biome === '雪原') {
          w.targetSnow = r < 0.55 ? (0.5 + Math.random() * 0.5) : 0;
          w.targetRain = 0;
        } else if (biome === '沙漠') {
          w.targetSnow = 0;
          w.targetRain = r < 0.12 ? 0.5 : 0;
        } else {
          w.targetRain = r < 0.42 ? (0.4 + Math.random() * 0.6) : 0;
          w.targetSnow = 0;
        }
        if (w.targetRain > 0.5 && Math.random() < 0.4) w.thunder = 8;
      }
      w.rain = T.approach(w.rain, w.targetRain, dt * 0.12);
      w.snow = T.approach(w.snow, w.targetSnow, dt * 0.12);
      if (w.thunder > 0) {
        w.thunder -= dt;
        w.flash = Math.max(0, w.flash - dt * 4);
        if (Math.random() < dt * 0.9) {
          w.lightning = 0.85 + Math.random() * 0.15;
          this.audio.play('thunder');
        }
      }
      w.lightning = Math.max(0, w.lightning - dt * 5.5);
    }

    update(dt) {
      if (!this.started || this.paused) return;
      this.dt = dt;
      this.gameTime += dt;
      this.frame++;
      this.gatherInput();
      if (!this.player.dead && !this.ui.openPanel) {
        this.player.update(dt, this.input);
      } else if (this.player.dead) {
        this.player.update(dt, this.input);
      }
      this.updateTime(dt);
      this.updateWeather(dt);
      this.world.update(dt);
      if (this.frame % 2 === 0) this.renderer.invalidateChunks(this.world);
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.update(dt);
        if (e.dead) this.enemies.splice(i, 1);
      }
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        pr.update(dt);
        if (pr.dead) {
          if (pr.onLandStar && pr.kind === 'starp') {
            this.dropItem(pr.x, pr.y, 'star', 1);
          }
          this.projectiles.splice(i, 1);
        }
      }
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i];
        it.update(dt);
        if (it.dead) this.items.splice(i, 1);
      }
      for (let i = this.minions.length - 1; i >= 0; i--) {
        const m = this.minions[i];
        m.update(dt);
        if (m.dead) this.minions.splice(i, 1);
      }
      for (const npc of this.npcs) npc.update(dt);
      if (this.boss) {
        this.boss.update(dt);
        if (this.boss.dead) this.boss = null;
      }
      this.trySpawnEnemies();
      this.updateEvents(dt);
      this.particles.update(dt);
      this.updateCamera(dt);
      this.scanTimer = (this.scanTimer || 0) + dt;
      if (this.scanTimer > 0.5) {
        this.scanTimer = 0;
        this.scanMap(false);
      }
      if (this.shakeT > 0) {
        this.shakeT -= dt;
        if (this.shakeT <= 0) this.shakePow = 0;
      }
      this.player.invDirty = true;
      if (this.touch) this.touch.update(dt);
      this.ui.update(dt);
      this.audio.updateMusic(this, dt);
      this.checkAutoSave(dt);
      this.evaluateNpcArrivals();
    }

    checkAutoSave(dt) {
      this.autoSaveT = (this.autoSaveT || 0) + dt;
      if (this.autoSaveT > 90) {
        this.autoSaveT = 0;
        this.saveGame();
      }
    }

    evaluateNpcArrivals() {
      const p = this.player;
      if (p.stats.kills >= 8 && !this.npcs.some(function (n) { return n.type === 'merchant'; })) this.spawnNpc('merchant');
      if (p.stats.blocksMined >= 300 && !this.npcs.some(function (n) { return n.type === 'demolitionist'; })) this.spawnNpc('demolitionist');
      if (p.maxHp >= 140 && !this.npcs.some(function (n) { return n.type === 'dryad'; })) this.spawnNpc('dryad');
      if (p.maxMana >= 60 && !this.npcs.some(function (n) { return n.type === 'wizard'; })) this.spawnNpc('wizard');
    }

    render() {
      const r = this.renderer;
      const ctx = r.ctx;
      const cam = { x: this.cam.x, y: this.cam.y };
      if (this.shakeT > 0) {
        cam.x += (Math.random() - 0.5) * this.shakePow * 2;
        cam.y += (Math.random() - 0.5) * this.shakePow * 2;
      }
      const timeOfDay = this.timeMinutes / 24;
      if (!this.started || !this.world) {
        this.renderMenuBackground();
        return;
      }
      r.drawSky(this, cam, this.timeMinutes);
      r.drawWorld(this, cam);
      for (const it of this.items) it.draw(ctx, cam, r.zoom);
      for (const npc of this.npcs) npc.draw(ctx, cam, r.zoom);
      for (const e of this.enemies) e.draw(ctx, cam, r.zoom);
      if (this.boss && !this.boss.dead) this.boss.draw(ctx, cam, r.zoom);
      for (const m of this.minions) m.draw(ctx, cam, r.zoom);
      this.player.draw(ctx, cam, r.zoom);
      this.player.drawHook(ctx, cam, r.zoom);
      for (const pr of this.projectiles) pr.draw(ctx, cam, r.zoom);
      this.particles.draw(ctx, cam, r.zoom, r.vw, r.vh);
      r.drawGlow(this, cam);
      r.drawLighting(this, cam);
      if (!this.ui.openPanel) this.player.drawCursor(ctx, this.input, cam, r.zoom);
      this.renderWeather(ctx, cam);
      if (this.player.dead) this.renderDeathTint(ctx);
    }

    renderWeather(ctx, cam) {
      if (!this.activeEvent) return;
      const r = this.renderer;
      if (this.activeEvent.type === 'bloodmoon') {
        ctx.fillStyle = 'rgba(120,10,20,0.16)';
        ctx.fillRect(0, 0, r.vw, r.vh);
      }
      if (this.activeEvent.type === 'slime_rain') {
        ctx.fillStyle = 'rgba(80,120,160,0.06)';
        ctx.fillRect(0, 0, r.vw, r.vh);
        if (Math.random() < 0.4) {
          const x = Math.random() * r.vw;
          ctx.fillStyle = 'rgba(120,200,140,0.5)';
          ctx.fillRect(x, Math.random() * r.vh, 2, 8);
        }
      }
    }

    renderDeathTint(ctx) {
      const r = this.renderer;
      const t = T.clamp(this.player.deathT / 1.2, 0, 1);
      ctx.fillStyle = 'rgba(60,0,10,' + (0.35 * t) + ')';
      ctx.fillRect(0, 0, r.vw, r.vh);
    }

    renderMenuBackground() {
      const ctx = this.renderer.ctx;
      const w = this.renderer.vw, h = this.renderer.vh;
      if (!this.menuWorld) {
        this.menuWorld = true;
        this.menuT = 0;
        this.menuHills = [];
        for (let i = 0; i < 4; i++) {
          const arr = [];
          for (let x = 0; x <= w + 40; x += 10) {
            arr.push(Math.sin(x * 0.0035 + i * 2.1) * (24 + i * 10) + Math.sin(x * 0.011 + i * 1.4) * (10 + i * 5) + h * (0.60 + i * 0.09));
          }
          this.menuHills.push(arr);
        }
        this.menuTrees = [];
        const rnd = T.RNG(7788);
        for (let i = 0; i < 22; i++) {
          this.menuTrees.push({
            x: rnd.range(-40, w + 40), base: h * rnd.range(0.80, 1.02),
            scale: rnd.range(0.9, 2.1), layer: rnd.int(0, 2)
          });
        }
        this.menuStars = [];
        for (let i = 0; i < 160; i++) this.menuStars.push({ x: rnd.next() * w, y: rnd.next() * h * 0.55, r: rnd.range(0.5, 1.8), p: rnd.range(0, 6.28) });
      }
      this.menuT = (this.menuT || 0) + 1;
      const t = this.menuT * 0.0016;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0d1726');
      g.addColorStop(0.32, '#1d3550');
      g.addColorStop(0.56, '#3d5f78');
      g.addColorStop(0.74, '#5d7a86');
      g.addColorStop(1, '#101c1a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (const s of this.menuStars) {
        const tw = 0.55 + 0.45 * Math.sin(this.menuT * 0.0016 + s.p);
        ctx.fillStyle = 'rgba(232,242,255,' + (0.25 + tw * 0.6) + ')';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      const mx = w * 0.78, my = h * 0.2;
      const halo = ctx.createRadialGradient(mx, my, 20, mx, my, 260);
      halo.addColorStop(0, 'rgba(210,228,255,0.32)');
      halo.addColorStop(0.45, 'rgba(160,190,240,0.10)');
      halo.addColorStop(1, 'rgba(120,160,220,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, 260, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = '#eef4ff';
      ctx.beginPath();
      ctx.arc(mx, my, h * 0.052, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = 'rgba(190,206,232,0.5)';
      ctx.beginPath();
      ctx.arc(mx - h * 0.018, my - h * 0.014, h * 0.013, 0, 6.283);
      ctx.arc(mx + h * 0.016, my + h * 0.019, h * 0.009, 0, 6.283);
      ctx.arc(mx + h * 0.005, my - h * 0.026, h * 0.007, 0, 6.283);
      ctx.fill();
      for (let l = 0; l < 4; l++) {
        const arr = this.menuHills[l];
        if (l === 2) {
          for (const tr of this.menuTrees) {
            if (tr.layer !== 0) continue;
            this.drawMenuTree(ctx, tr, 1);
          }
        }
        ctx.fillStyle = ['rgba(38,62,72,0.55)', 'rgba(24,44,52,0.75)', 'rgba(14,28,33,0.92)', 'rgba(6,16,18,1)'][l];
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < arr.length; i++) {
          const x = i * 10;
          const y = arr[i] - Math.sin(t * (l + 1) + x * 0.001) * 3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      }
      for (const tr of this.menuTrees) {
        if (tr.layer === 0) continue;
        this.drawMenuTree(ctx, tr, tr.layer);
      }
      const mist = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.95);
      mist.addColorStop(0, 'rgba(190,214,226,0)');
      mist.addColorStop(0.5, 'rgba(190,214,226,0.12)');
      mist.addColorStop(1, 'rgba(190,214,226,0)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, h * 0.55, w, h * 0.4);
      for (let i = 0; i < 5; i++) {
        const x = ((this.menuT * (0.07 + i * 0.02)) % (w + 400)) - 200;
        const y = h * (0.1 + i * 0.07);
        ctx.fillStyle = 'rgba(220,235,250,0.05)';
        ctx.beginPath();
        ctx.ellipse(x, y, 160, 20, 0, 0, 6.283);
        ctx.fill();
      }
    }

    drawMenuTree(ctx, tr, layer) {
      const hh = 260 * tr.scale;
      const base = tr.base + 30;
      ctx.fillStyle = layer === 1 ? '#0d1f20' : '#071413';
      ctx.beginPath();
      ctx.moveTo(tr.x - 7 * tr.scale, base);
      ctx.lineTo(tr.x - 3.5 * tr.scale, base - hh * 0.62);
      ctx.lineTo(tr.x + 3.5 * tr.scale, base - hh * 0.62);
      ctx.lineTo(tr.x + 7 * tr.scale, base);
      ctx.closePath();
      ctx.fill();
      for (let k = 0; k < 5; k++) {
        const cy = base - hh * 0.6 - k * hh * 0.085;
        const r = (42 - k * 5.5) * tr.scale;
        ctx.beginPath();
        ctx.arc(tr.x - r * 0.28, cy, r * 0.75, 0, 6.283);
        ctx.arc(tr.x + r * 0.32, cy, r * 0.66, 0, 6.283);
        ctx.arc(tr.x, cy - r * 0.3, r * 0.8, 0, 6.283);
        ctx.fill();
      }
    }

    loop(ts) {
      if (this.renderer) this.renderer.ensureSize();
      const now = ts / 1000;
      if (!this.last) this.last = now;
      let dt = now - this.last;
      this.last = now;
      dt = Math.min(dt, 0.05);
      if (this.ui) this.ui.hoverItem = this.ui.hoverItem;
      if (this.started && !this.paused) this.update(dt);
      else if (this.started) {
        this.ui.update(dt);
        this.audio.updateMusic(this, dt);
      }
      this.render();
      requestAnimationFrame(this.loop);
    }
  }

  T.Game = Game;
  window.addEventListener('load', function () {
    T.initArt();
    window.game = new T.Game();
  });
})();
